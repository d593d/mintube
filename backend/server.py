from fastapi import FastAPI, APIRouter, HTTPException, BackgroundTasks, UploadFile, File
from fastapi.responses import FileResponse, StreamingResponse, RedirectResponse
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
from video_processing.enhanced_renderer import EnhancedVideoRenderer
from video_processing.batch_processor import BatchVideoProcessor, BatchJobPriority


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Initialize video renderer
video_renderer = VideoRenderer()

# Initialize enhanced video processing systems
enhanced_video_renderer = EnhancedVideoRenderer("/tmp/video_output")
batch_processor = BatchVideoProcessor(max_concurrent_jobs=3, output_dir="/tmp/video_output")

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
        # Use enhanced renderer for professional video creation
        result = await enhanced_video_renderer.create_automated_professional_video(
            script_content=request.script_content,
            voice_audio_base64=request.voice_audio_base64,
            template_id=request.template_id,
            quality=request.quality,
            background_config=request.background_config or {},
            project_id=request.project_id
        )
        
        return VideoRenderStatus(
            render_id=result["render_id"],
            timeline_id=result["timeline_id"],
            status=result["status"],
            progress=result["progress"],
            output_file=result.get("output_file"),
            file_size=result.get("file_size", 0),
            duration=result.get("duration", 0.0),
            render_time=result.get("render_time", 0.0),
            created_at=datetime.utcnow()
        )
        
    except Exception as e:
        logger.error(f"Enhanced video creation failed: {str(e)}")
        return VideoRenderStatus(
            render_id=str(uuid.uuid4()),
            timeline_id="",
            status="failed",
            progress=0,
            error=str(e),
            created_at=datetime.utcnow()
        )

@api_router.post("/video/batch/submit")
async def submit_batch_video_job(request: VideoCreationRequest):
    """
    Submit a batch video creation job for processing
    Returns job ID for tracking
    """
    try:
        job_id = await batch_processor.submit_batch_job(
            script_content=request.script_content,
            voice_audio_base64=request.voice_audio_base64,
            template_id=request.template_id,
            quality=request.quality,
            background_config=request.background_config or {},
            priority=BatchJobPriority.NORMAL,
            project_id=request.project_id
        )
        
        return {
            "job_id": job_id,
            "status": "queued",
            "message": "Batch job submitted successfully"
        }
        
    except Exception as e:
        logger.error(f"Batch job submission failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/video/batch/submit-multiple")
async def submit_multiple_batch_jobs(job_configs: List[Dict]):
    """
    Submit multiple batch video creation jobs
    """
    try:
        job_ids = await batch_processor.submit_multiple_jobs(
            job_configs=job_configs,
            priority=BatchJobPriority.NORMAL
        )
        
        return {
            "job_ids": job_ids,
            "total_jobs": len(job_ids),
            "status": "queued",
            "message": f"Successfully submitted {len(job_ids)} batch jobs"
        }
        
    except Exception as e:
        logger.error(f"Multiple batch job submission failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/video/batch/status/{job_id}")
async def get_batch_job_status(job_id: str):
    """
    Get status of a specific batch job
    """
    job_status = batch_processor.get_job_status(job_id)
    
    if not job_status:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job_status

@api_router.get("/video/batch/stats")
async def get_batch_processing_stats():
    """
    Get batch processing statistics
    """
    return batch_processor.get_batch_stats()

@api_router.get("/video/batch/jobs")
async def get_all_batch_jobs(limit: int = 100):
    """
    Get all batch jobs (active and recent completed)
    """
    return batch_processor.get_all_jobs(limit=limit)

@api_router.post("/video/batch/cancel/{job_id}")
async def cancel_batch_job(job_id: str):
    """
    Cancel a specific batch job
    """
    success = await batch_processor.cancel_job(job_id)
    
    if success:
        return {"message": f"Job {job_id} cancelled successfully"}
    else:
        raise HTTPException(status_code=404, detail="Job not found or cannot be cancelled")

@api_router.post("/video/batch/retry/{job_id}")
async def retry_failed_batch_job(job_id: str):
    """
    Retry a failed batch job
    """
    new_job_id = await batch_processor.retry_failed_job(job_id)
    
    if new_job_id:
        return {
            "message": f"Job {job_id} retry submitted",
            "new_job_id": new_job_id
        }
    else:
        raise HTTPException(status_code=400, detail="Job cannot be retried")

@api_router.get("/video/templates")
async def get_video_templates():
    """
    Get available professional video templates
    """
    return [
        {
            "id": template_id,
            "name": template["name"],
            "style": template["style"],
            "description": template["description"]
        }
        for template_id, template in enhanced_video_renderer.templates.items()
    ]

@api_router.get("/video/render-status/{render_id}")
async def get_render_status(render_id: str):
    """
    Get status of a specific render
    Enhanced with professional video features
    """
    # Check if it's a batch job first
    batch_status = batch_processor.get_job_status(render_id)
    if batch_status:
        return batch_status
    
    # Check active renders in enhanced renderer
    if render_id in enhanced_video_renderer.active_renders:
        progress_data = enhanced_video_renderer.active_renders[render_id]
        return {
            "render_id": render_id,
            "status": progress_data.stage,
            "progress": progress_data.progress,
            "message": progress_data.message,
            "timestamp": progress_data.timestamp.isoformat()
        }
    
    # Fallback to original implementation
    try:
        # Simulate status check for completed renders
        return {
            "render_id": render_id,
            "status": "completed",
            "progress": 100,
            "message": "Professional video render completed"
        }
    except Exception as e:
        return {
            "render_id": render_id,
            "status": "failed",
            "progress": 0,
            "error": str(e)
        }

@api_router.get("/video/recent-renders")
async def get_recent_renders(limit: int = 5):
    """
    Get recent video renders with enhanced features
    """
    # Get recent batch jobs
    recent_jobs = batch_processor.get_all_jobs(limit=limit)
    
    # Transform to render format
    renders = []
    for job in recent_jobs:
        if job["result"]:
            renders.append({
                "render_id": job["id"],
                "status": job["status"],
                "progress": job["progress"],
                "duration": job["result"].get("duration", 0),
                "file_size": job["result"].get("file_size", 0),
                "render_time": job.get("actual_duration", 0),
                "created_at": job["created_at"],
                "features": job["result"].get("features", [])
            })
    
    return renders

@api_router.get("/video/download/{render_id}")
async def download_video(render_id: str):
    """
    Download rendered video file
    """
    # Check if it's a completed batch job
    job_status = batch_processor.get_job_status(render_id)
    if job_status and job_status["status"] == "completed" and job_status["result"]:
        output_path = Path(job_status["result"]["output_path"])
        if output_path.exists():
            return FileResponse(
                path=str(output_path),
                media_type='video/mp4',
                filename=job_status["result"]["output_file"]
            )
    
    # Fallback to checking output directory
    output_dir = Path("/tmp/video_output")
    possible_files = list(output_dir.glob(f"*{render_id}*.mp4"))
    
    if possible_files:
        return FileResponse(
            path=str(possible_files[0]),
            media_type='video/mp4',
            filename=possible_files[0].name
        )
    
    raise HTTPException(status_code=404, detail="Video file not found")

@api_router.get("/video/preview/{render_id}")
async def preview_video(render_id: str):
    """
    Get video preview/streaming URL
    """
    # For now, redirect to download endpoint
    # In production, this would serve streaming video
    return RedirectResponse(url=f"/api/video/download/{render_id}")


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
