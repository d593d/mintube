from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.responses import FileResponse, StreamingResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import json
import base64
import io

# Import our OpenCut-inspired video processing engine
from video_processing.timeline import Timeline, TimelineAsset, Track
from video_processing.renderer import VideoRenderer


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize video renderer
video_renderer = VideoRenderer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Enhanced Models for Video Processing
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class StatusCheckCreate(BaseModel):
    client_name: str

class ScriptData(BaseModel):
    title: str
    content: str
    duration: Optional[str] = None
    target_audience: Optional[str] = None
    style: Optional[str] = None

class VoiceData(BaseModel):
    text: str
    voice_id: str
    speed: float = 1.0
    audio_content: str  # base64 encoded audio

class VideoCreationRequest(BaseModel):
    project_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    script_content: str
    voice_audio_url: Optional[str] = None
    voice_audio_base64: Optional[str] = None  # Alternative to URL
    template_id: str = "minimal"
    quality: str = "1080p"
    background_config: Optional[Dict] = None

class VideoRenderStatus(BaseModel):
    render_id: str
    status: str  # 'queued', 'processing', 'completed', 'failed'
    progress: int = 0  # 0-100
    timeline_id: Optional[str] = None
    output_file: Optional[str] = None
    file_size: Optional[int] = None
    duration: Optional[float] = None
    render_time: Optional[float] = None
    error: Optional[str] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)


# Existing endpoints
@api_router.get("/")
async def root():
    return {"message": "Enhanced Video Automation API with OpenCut Integration"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]


# Enhanced Video Processing Endpoints
@api_router.post("/video/create-automated", response_model=VideoRenderStatus)
async def create_automated_video(request: VideoCreationRequest, background_tasks: BackgroundTasks):
    """
    Create automated video using OpenCut-inspired timeline and rendering engine
    This is the main endpoint for full automation
    """
    try:
        # Create new timeline
        timeline = Timeline(project_id=request.project_id)
        
        # Handle voice audio
        voice_url = None
        if request.voice_audio_base64:
            # Save base64 audio to temporary file
            audio_data = base64.b64decode(request.voice_audio_base64)
            voice_filename = f"voice_{request.project_id}.mp3"
            voice_path = video_renderer.temp_dir / voice_filename
            
            with open(voice_path, 'wb') as f:
                f.write(audio_data)
            voice_url = str(voice_path)
        elif request.voice_audio_url:
            voice_url = request.voice_audio_url
        
        # Create automated timeline from script and voice
        timeline_result = timeline.create_from_script_and_voice(
            script_content=request.script_content,
            voice_url=voice_url,
            background_config=request.background_config
        )
        
        # Save timeline to database
        timeline_doc = {
            **timeline.to_dict(),
            'project_id': request.project_id,
            'created_at': datetime.utcnow()
        }
        await db.timelines.insert_one(timeline_doc)
        
        # Create render status record
        render_status = VideoRenderStatus(
            render_id=str(uuid.uuid4()),
            status='queued',
            timeline_id=timeline.id
        )
        
        # Save render status to database
        await db.video_renders.insert_one(render_status.dict())
        
        # Start background rendering
        background_tasks.add_task(
            render_video_background,
            render_status.render_id,
            timeline,
            request.quality,
            request.template_id
        )
        
        return render_status
        
    except Exception as e:
        logging.error(f"Error creating automated video: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create video: {str(e)}")


@api_router.get("/video/render-status/{render_id}", response_model=VideoRenderStatus)
async def get_render_status(render_id: str):
    """Get the status of video rendering"""
    render_doc = await db.video_renders.find_one({"render_id": render_id})
    if not render_doc:
        raise HTTPException(status_code=404, detail="Render not found")
    
    return VideoRenderStatus(**render_doc)


@api_router.get("/video/download/{render_id}")
async def download_video(render_id: str):
    """Download rendered video file"""
    render_doc = await db.video_renders.find_one({"render_id": render_id})
    if not render_doc:
        raise HTTPException(status_code=404, detail="Render not found")
    
    if render_doc['status'] != 'completed' or not render_doc.get('output_file'):
        raise HTTPException(status_code=400, detail="Video not ready for download")
    
    file_path = video_renderer.output_dir / render_doc['output_file']
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Video file not found")
    
    return FileResponse(
        path=str(file_path),
        filename=render_doc['output_file'],
        media_type='video/mp4'
    )


@api_router.get("/video/preview/{render_id}")
async def preview_video(render_id: str):
    """Stream video for preview"""
    render_doc = await db.video_renders.find_one({"render_id": render_id})
    if not render_doc or render_doc['status'] != 'completed':
        raise HTTPException(status_code=404, detail="Video not available")
    
    file_path = video_renderer.output_dir / render_doc['output_file']
    if not file_path.exists():
        raise HTTPException(status_code=404, detail="Video file not found")
    
    def iterfile(file_path: Path):
        with open(file_path, mode="rb") as file_like:
            yield from file_like
    
    return StreamingResponse(
        iterfile(file_path),
        media_type="video/mp4",
        headers={"Content-Disposition": f"inline; filename={render_doc['output_file']}"}
    )


@api_router.post("/video/save-script")
async def save_script(script_data: ScriptData):
    """Save generated script for video creation"""
    script_doc = {
        **script_data.dict(),
        'id': str(uuid.uuid4()),
        'created_at': datetime.utcnow()
    }
    
    result = await db.scripts.insert_one(script_doc)
    script_doc['_id'] = str(result.inserted_id)
    
    return {
        'success': True,
        'script_id': script_doc['id'],
        'message': 'Script saved successfully'
    }


@api_router.post("/video/save-voice") 
async def save_voice_generation(voice_data: VoiceData):
    """Save generated voice for video creation"""
    # Save audio data to file
    audio_data = base64.b64decode(voice_data.audio_content)
    voice_filename = f"voice_{uuid.uuid4().hex}.mp3"
    voice_path = video_renderer.assets_dir / voice_filename
    
    with open(voice_path, 'wb') as f:
        f.write(audio_data)
    
    voice_doc = {
        'id': str(uuid.uuid4()),
        'text': voice_data.text,
        'voice_id': voice_data.voice_id,
        'speed': voice_data.speed,
        'audio_url': str(voice_path),
        'filename': voice_filename,
        'created_at': datetime.utcnow()
    }
    
    result = await db.voice_generations.insert_one(voice_doc)
    voice_doc['_id'] = str(result.inserted_id)
    
    return {
        'success': True,
        'voice_id': voice_doc['id'],
        'audio_url': voice_doc['audio_url'],
        'message': 'Voice generation saved successfully'
    }


@api_router.get("/video/templates")
async def get_video_templates():
    """Get available video templates"""
    templates = [
        {
            'id': 'minimal',
            'name': 'Minimal Clean',
            'style': 'Clean typography, subtle animations',
            'description': 'Simple and professional design perfect for educational content'
        },
        {
            'id': 'scientific',
            'name': 'Scientific',
            'style': 'Diagrams, charts, professional',
            'description': 'Technical and educational style with data visualization focus'
        },
        {
            'id': 'storytelling',
            'name': 'Storytelling',
            'style': 'Cinematic, narrative flow',
            'description': 'Narrative-driven content with cinematic transitions'
        },
        {
            'id': 'educational',
            'name': 'Educational',
            'style': 'Clear structure, highlights',
            'description': 'Learning-focused design with clear information hierarchy'
        }
    ]
    return templates


@api_router.get("/video/recent-renders")
async def get_recent_renders(limit: int = 10):
    """Get recent video renders"""
    renders = await db.video_renders.find().sort("created_at", -1).limit(limit).to_list(limit)
    return [VideoRenderStatus(**render) for render in renders]


# Background task for video rendering
async def render_video_background(render_id: str, timeline: Timeline, quality: str, template_id: str):
    """Background task to render video"""
    try:
        # Update status to processing
        await db.video_renders.update_one(
            {"render_id": render_id},
            {"$set": {"status": "processing", "progress": 10}}
        )
        
        # Render video
        render_result = await video_renderer.render_timeline(
            timeline=timeline,
            quality=quality,
            template_id=template_id
        )
        
        if render_result.get('status') == 'completed':
            # Update database with success
            await db.video_renders.update_one(
                {"render_id": render_id},
                {"$set": {
                    "status": "completed",
                    "progress": 100,
                    "output_file": render_result.get('output_file'),
                    "file_size": render_result.get('file_size'),
                    "duration": render_result.get('duration'),
                    "render_time": render_result.get('render_time')
                }}
            )
        else:
            # Update database with failure
            await db.video_renders.update_one(
                {"render_id": render_id},
                {"$set": {
                    "status": "failed",
                    "error": render_result.get('error', 'Unknown error')
                }}
            )
            
    except Exception as e:
        logging.error(f"Background render failed for {render_id}: {str(e)}")
        await db.video_renders.update_one(
            {"render_id": render_id},
            {"$set": {
                "status": "failed",
                "error": str(e)
            }}
        )


# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
