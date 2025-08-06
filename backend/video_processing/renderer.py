"""
OpenCut-inspired Video Renderer for Automated Video Processing
High-performance video composition and rendering engine
"""
import os
import uuid
import asyncio
import logging
from datetime import datetime
from typing import Dict, List, Optional, Tuple
from pathlib import Path
import json

# Video processing imports
from moviepy.editor import (
    VideoFileClip, AudioFileClip, ImageClip, TextClip, 
    CompositeVideoClip, concatenate_videoclips,
    vfx, afx
)
import numpy as np
from PIL import Image, ImageDraw, ImageFont
import cv2

from .timeline import Timeline, TimelineAsset, Track

logger = logging.getLogger(__name__)

class VideoRenderer:
    """
    Professional video renderer inspired by OpenCut's rendering engine
    Handles multi-track composition, effects, and export
    """
    
    def __init__(self, output_dir: str = "/tmp/video_output"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.temp_dir = Path(output_dir) / "temp"
        self.temp_dir.mkdir(parents=True, exist_ok=True)
        
        # Default assets directory
        self.assets_dir = Path(__file__).parent / "assets"
        self.assets_dir.mkdir(parents=True, exist_ok=True)
        
        # Rendering settings
        self.default_fps = 30
        self.default_resolution = (1920, 1080)
        
        # Create default background assets if they don't exist
        self._ensure_default_assets()
    
    def _ensure_default_assets(self):
        """Create default background assets for automated rendering"""
        default_backgrounds = [
            "dynamic_background_1.mp4",
            "intro_background.mp4", 
            "outro_background.mp4",
            "cta_background.mp4",
            "content_background.jpg",
            "default_background.jpg"
        ]
        
        for bg_name in default_backgrounds:
            bg_path = self.assets_dir / bg_name
            if not bg_path.exists():
                if bg_name.endswith('.jpg'):
                    self._create_default_image_background(bg_path)
                elif bg_name.endswith('.mp4'):
                    self._create_default_video_background(bg_path)
    
    def _create_default_image_background(self, path: Path):
        """Create a default gradient background image"""
        width, height = self.default_resolution
        image = Image.new('RGB', (width, height), color='#1a1a1a')
        
        # Create gradient
        draw = ImageDraw.Draw(image)
        for y in range(height):
            # Purple to blue gradient
            r = int(26 + (128 - 26) * (y / height))
            g = int(26 + (96 - 26) * (y / height))
            b = int(26 + (196 - 26) * (y / height))
            color = (r, g, b)
            draw.line([(0, y), (width, y)], fill=color)
        
        image.save(path, 'JPEG', quality=90)
        logger.info(f"Created default background image: {path}")
    
    def _create_default_video_background(self, path: Path):
        """Create a default animated background video"""
        duration = 30  # 30 seconds default
        
        # Create animated gradient clip
        def make_frame(t):
            width, height = self.default_resolution
            frame = np.zeros((height, width, 3), dtype=np.uint8)
            
            # Animated colors based on time
            offset = int(t * 50) % 256
            for y in range(height):
                r = int(26 + (128 - 26) * (y / height) + offset) % 256
                g = int(26 + (96 - 26) * (y / height) + offset//2) % 256
                b = int(26 + (196 - 26) * (y / height) + offset//3) % 256
                frame[y, :] = [r, g, b]
            
            return frame
        
        # Create video clip
        clip = VideoFileClip(path, has_mask=False).subclip(0, duration) if path.exists() else None
        if not clip:
            # Create a simple colored clip as fallback
            clip = VideoFileClip(path, has_mask=False).subclip(0, duration) if path.exists() else ImageClip(
                np.full((self.default_resolution[1], self.default_resolution[0], 3), 
                       [26, 26, 128], dtype=np.uint8)
            ).set_duration(duration)
        
        try:
            clip.write_videofile(
                str(path),
                fps=self.default_fps,
                codec='libx264',
                audio=False,
                verbose=False,
                logger=None
            )
            logger.info(f"Created default background video: {path}")
        except Exception as e:
            logger.error(f"Failed to create default video {path}: {e}")
            # Create simple image fallback
            self._create_default_image_background(path.with_suffix('.jpg'))
    
    async def render_timeline(self, timeline: Timeline, quality: str = "1080p", 
                            template_id: Optional[str] = None) -> Dict:
        """
        Render complete timeline to video file
        This is the main rendering function for automated video creation
        """
        render_id = str(uuid.uuid4())
        start_time = datetime.utcnow()
        
        logger.info(f"Starting render {render_id} for timeline {timeline.id}")
        
        try:
            # Apply template if specified
            if template_id:
                timeline.apply_template_style(template_id)
            
            # Set quality parameters
            resolution, fps, bitrate = self._get_quality_settings(quality)
            
            # Compose video tracks
            video_clips = await self._compose_video_tracks(timeline, resolution, fps)
            
            # Compose audio tracks  
            audio_clips = await self._compose_audio_tracks(timeline)
            
            # Create final composition
            final_video = self._create_final_composition(
                video_clips, audio_clips, timeline.duration, fps
            )
            
            # Generate output filename
            output_filename = f"video_{timeline.project_id}_{render_id}.mp4"
            output_path = self.output_dir / output_filename
            
            # Render to file
            await self._render_to_file(final_video, output_path, resolution, fps, bitrate)
            
            # Cleanup temporary clips
            self._cleanup_clips([final_video] + video_clips + audio_clips)
            
            end_time = datetime.utcnow()
            render_time = (end_time - start_time).total_seconds()
            
            result = {
                'render_id': render_id,
                'timeline_id': timeline.id,
                'output_file': output_filename,
                'output_path': str(output_path),
                'file_size': output_path.stat().st_size if output_path.exists() else 0,
                'duration': timeline.duration,
                'resolution': resolution,
                'fps': fps,
                'quality': quality,
                'render_time': render_time,
                'status': 'completed',
                'created_at': end_time.isoformat()
            }
            
            logger.info(f"Render {render_id} completed in {render_time:.2f}s")
            return result
            
        except Exception as e:
            logger.error(f"Render {render_id} failed: {str(e)}")
            return {
                'render_id': render_id,
                'timeline_id': timeline.id,
                'status': 'failed',
                'error': str(e),
                'render_time': (datetime.utcnow() - start_time).total_seconds()
            }
    
    def _get_quality_settings(self, quality: str) -> Tuple[Tuple[int, int], int, str]:
        """Get resolution, fps, and bitrate based on quality setting"""
        settings = {
            '720p': ((1280, 720), 30, '2000k'),
            '1080p': ((1920, 1080), 30, '4000k'),
            '4k': ((3840, 2160), 30, '8000k')
        }
        return settings.get(quality, settings['1080p'])
    
    async def _compose_video_tracks(self, timeline: Timeline, resolution: Tuple[int, int], 
                                   fps: int) -> List:
        """Compose all video tracks into clips"""
        video_clips = []
        
        for track in timeline.get_tracks_by_type('video'):
            if not track.enabled or not track.assets:
                continue
            
            track_clips = []
            
            for asset in sorted(track.assets, key=lambda a: a.start_time):
                clip = await self._create_clip_from_asset(asset, resolution, fps)
                if clip:
                    # Apply effects
                    clip = self._apply_effects(clip, asset.effects)
                    
                    # Apply transitions
                    clip = self._apply_transitions(clip, asset.transitions)
                    
                    # Set timing
                    clip = clip.set_start(asset.start_time).set_duration(asset.duration)
                    
                    track_clips.append(clip)
            
            if track_clips:
                # Composite all clips in this track
                track_composition = CompositeVideoClip(track_clips, size=resolution)
                video_clips.append(track_composition)
        
        return video_clips
    
    async def _compose_audio_tracks(self, timeline: Timeline) -> List:
        """Compose all audio tracks into clips"""
        audio_clips = []
        
        for track in timeline.get_tracks_by_type('audio'):
            if not track.enabled or track.muted or not track.assets:
                continue
            
            for asset in track.assets:
                if asset.source_url:
                    try:
                        audio_clip = AudioFileClip(asset.source_url)
                        audio_clip = audio_clip.set_start(asset.start_time).set_duration(asset.duration)
                        audio_clips.append(audio_clip)
                    except Exception as e:
                        logger.warning(f"Failed to load audio asset {asset.id}: {e}")
        
        return audio_clips
    
    async def _create_clip_from_asset(self, asset: TimelineAsset, resolution: Tuple[int, int], 
                                     fps: int):
        """Create MoviePy clip from timeline asset"""
        try:
            if asset.type == 'video':
                if asset.source_url and os.path.exists(asset.source_url):
                    clip = VideoFileClip(asset.source_url)
                else:
                    # Use default background
                    bg_path = self.assets_dir / (asset.source_url or 'default_background.jpg')
                    if bg_path.exists():
                        if bg_path.suffix == '.mp4':
                            clip = VideoFileClip(str(bg_path))
                        else:
                            clip = ImageClip(str(bg_path))
                    else:
                        # Create solid color background
                        clip = ImageClip(
                            np.full((*resolution[::-1], 3), [26, 26, 128], dtype=np.uint8)
                        )
                
                clip = clip.resize(resolution).set_fps(fps)
                return clip.set_duration(asset.duration)
            
            elif asset.type == 'image':
                if asset.source_url and os.path.exists(asset.source_url):
                    clip = ImageClip(asset.source_url)
                else:
                    bg_path = self.assets_dir / (asset.source_url or 'default_background.jpg')
                    if bg_path.exists():
                        clip = ImageClip(str(bg_path))
                    else:
                        # Create solid color background
                        clip = ImageClip(
                            np.full((*resolution[::-1], 3), [26, 26, 128], dtype=np.uint8)
                        )
                
                clip = clip.resize(resolution)
                return clip.set_duration(asset.duration)
            
            elif asset.type == 'text':
                # Create text overlay
                clip = TextClip(
                    asset.content or asset.name,
                    fontsize=48,
                    color='white',
                    font='Arial-Bold',
                    size=resolution
                ).set_duration(asset.duration)
                
                # Position text at bottom (subtitle style)
                clip = clip.set_position(('center', 'bottom')).set_margin(50)
                return clip
        
        except Exception as e:
            logger.error(f"Failed to create clip for asset {asset.id}: {e}")
            # Return error placeholder
            return TextClip(
                f"Error: {asset.name}",
                fontsize=24,
                color='red',
                size=resolution
            ).set_duration(asset.duration)
        
        return None
    
    def _apply_effects(self, clip, effects: List[Dict]):
        """Apply visual effects to clip"""
        if not effects:
            return clip
        
        for effect in effects:
            effect_type = effect.get('type')
            
            if effect_type == 'zoom_in':
                intensity = effect.get('intensity', 1.2)
                clip = clip.resize(lambda t: 1 + (intensity - 1) * t / clip.duration)
            
            elif effect_type == 'fade_in':
                duration = effect.get('duration', 1.0)
                clip = clip.fadein(duration)
            
            elif effect_type == 'fade_out':
                duration = effect.get('duration', 1.0)
                clip = clip.fadeout(duration)
            
            elif effect_type == 'cinematic_blur':
                clip = clip.fx(vfx.blur, 1)
        
        return clip
    
    def _apply_transitions(self, clip, transitions: Dict):
        """Apply transitions to clip"""
        if not transitions:
            return clip
        
        if 'in' in transitions:
            transition_in = transitions['in']
            if transition_in == 'fade_in':
                clip = clip.fadein(0.5)
        
        if 'out' in transitions:
            transition_out = transitions['out']
            if transition_out == 'fade_out':
                clip = clip.fadeout(0.5)
        
        return clip
    
    def _create_final_composition(self, video_clips: List, audio_clips: List, 
                                 duration: float, fps: int):
        """Create final video composition"""
        if not video_clips:
            # Create black video if no video content
            video_clips = [ImageClip(
                np.zeros((self.default_resolution[1], self.default_resolution[0], 3), 
                        dtype=np.uint8)
            ).set_duration(duration)]
        
        # Composite all video layers
        final_video = CompositeVideoClip(video_clips).set_fps(fps).set_duration(duration)
        
        # Add audio if available
        if audio_clips:
            from moviepy.editor import CompositeAudioClip
            final_audio = CompositeAudioClip(audio_clips)
            final_video = final_video.set_audio(final_audio)
        
        return final_video
    
    async def _render_to_file(self, clip, output_path: Path, resolution: Tuple[int, int], 
                             fps: int, bitrate: str):
        """Render clip to output file"""
        try:
            clip.write_videofile(
                str(output_path),
                fps=fps,
                codec='libx264',
                bitrate=bitrate,
                audio_codec='aac',
                temp_audiofile=str(self.temp_dir / 'temp_audio.m4a'),
                remove_temp=True,
                verbose=False,
                logger=None
            )
        except Exception as e:
            logger.error(f"Failed to render video to {output_path}: {e}")
            raise
    
    def _cleanup_clips(self, clips: List):
        """Cleanup MoviePy clips to free memory"""
        for clip in clips:
            if clip:
                try:
                    clip.close()
                except:
                    pass
    
    def get_render_progress(self, render_id: str) -> Dict:
        """Get progress of ongoing render (placeholder for future implementation)"""
        return {
            'render_id': render_id,
            'progress': 0,  # 0-100
            'status': 'unknown',
            'estimated_time_remaining': 0
        }