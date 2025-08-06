"""
Batch Processing System for OpenCut-inspired Video Automation
Handles multiple video creation tasks with queue management and progress tracking
"""
import asyncio
import uuid
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Callable
from dataclasses import dataclass, asdict
from enum import Enum
import json
from pathlib import Path

from .enhanced_renderer import EnhancedVideoRenderer, RenderProgress

logger = logging.getLogger(__name__)

class BatchJobStatus(Enum):
    """Batch job status types"""
    QUEUED = "queued"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"

class BatchJobPriority(Enum):
    """Batch job priority levels"""
    LOW = 1
    NORMAL = 2
    HIGH = 3
    URGENT = 4

@dataclass
class BatchJob:
    """Represents a batch video creation job"""
    id: str
    project_id: str
    script_content: str
    voice_audio_base64: Optional[str]
    template_id: str
    quality: str
    background_config: Dict
    priority: BatchJobPriority
    status: BatchJobStatus
    progress: float
    stage: str
    message: str
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    error: Optional[str] = None
    result: Optional[Dict] = None
    estimated_duration: Optional[float] = None
    actual_duration: Optional[float] = None

@dataclass
class BatchProcessingStats:
    """Batch processing statistics"""
    total_jobs: int
    queued_jobs: int
    processing_jobs: int
    completed_jobs: int
    failed_jobs: int
    cancelled_jobs: int
    average_processing_time: float
    total_processing_time: float
    success_rate: float

class BatchVideoProcessor:
    """
    Batch processing system for automated video creation
    Handles multiple video jobs with queue management and parallel processing
    """
    
    def __init__(self, max_concurrent_jobs: int = 3, output_dir: str = "/tmp/video_output"):
        self.max_concurrent_jobs = max_concurrent_jobs
        self.output_dir = Path(output_dir)
        
        # Enhanced renderer for professional video creation
        self.renderer = EnhancedVideoRenderer(output_dir)
        
        # Job management
        self.job_queue = asyncio.PriorityQueue()
        self.active_jobs = {}
        self.completed_jobs = {}
        self.job_history = []
        
        # Processing control
        self.is_processing = False
        self.worker_tasks = []
        
        # Progress tracking
        self.progress_callbacks = {}
        self.stats = BatchProcessingStats(0, 0, 0, 0, 0, 0, 0.0, 0.0, 0.0)
        
        logger.info(f"Batch video processor initialized with {max_concurrent_jobs} concurrent jobs")
    
    async def submit_batch_job(
        self,
        script_content: str,
        voice_audio_base64: Optional[str] = None,
        template_id: str = "minimal",
        quality: str = "1080p",
        background_config: Dict = None,
        priority: BatchJobPriority = BatchJobPriority.NORMAL,
        project_id: Optional[str] = None
    ) -> str:
        """Submit a new batch job for video creation"""
        
        job_id = str(uuid.uuid4())
        project_id = project_id or str(uuid.uuid4())
        
        # Estimate job duration based on script length and quality
        estimated_duration = self._estimate_job_duration(script_content, quality)
        
        # Create batch job
        job = BatchJob(
            id=job_id,
            project_id=project_id,
            script_content=script_content,
            voice_audio_base64=voice_audio_base64,
            template_id=template_id,
            quality=quality,
            background_config=background_config or {},
            priority=priority,
            status=BatchJobStatus.QUEUED,
            progress=0.0,
            stage="queued",
            message="Job queued for processing",
            created_at=datetime.utcnow(),
            estimated_duration=estimated_duration
        )
        
        # Add to queue with priority
        await self.job_queue.put((priority.value, datetime.utcnow(), job))
        
        # Update stats
        self.stats.total_jobs += 1
        self.stats.queued_jobs += 1
        
        logger.info(f"Batch job submitted: {job_id} (priority: {priority.name})")
        
        # Start processing if not already running
        if not self.is_processing:
            await self.start_batch_processing()
        
        return job_id
    
    async def submit_multiple_jobs(
        self,
        job_configs: List[Dict],
        priority: BatchJobPriority = BatchJobPriority.NORMAL
    ) -> List[str]:
        """Submit multiple batch jobs at once"""
        
        job_ids = []
        
        for config in job_configs:
            job_id = await self.submit_batch_job(
                script_content=config.get("script_content", ""),
                voice_audio_base64=config.get("voice_audio_base64"),
                template_id=config.get("template_id", "minimal"),
                quality=config.get("quality", "1080p"),
                background_config=config.get("background_config", {}),
                priority=priority,
                project_id=config.get("project_id")
            )
            job_ids.append(job_id)
        
        logger.info(f"Submitted {len(job_ids)} batch jobs")
        return job_ids
    
    async def start_batch_processing(self):
        """Start the batch processing workers"""
        
        if self.is_processing:
            return
        
        self.is_processing = True
        logger.info("Starting batch processing workers...")
        
        # Create worker tasks
        self.worker_tasks = [
            asyncio.create_task(self._worker(f"worker_{i}"))
            for i in range(self.max_concurrent_jobs)
        ]
        
        # Wait for all workers to complete
        await asyncio.gather(*self.worker_tasks, return_exceptions=True)
        
        self.is_processing = False
        logger.info("Batch processing completed")
    
    async def stop_batch_processing(self):
        """Stop batch processing and cancel active jobs"""
        
        logger.info("Stopping batch processing...")
        
        # Cancel all worker tasks
        for task in self.worker_tasks:
            task.cancel()
        
        # Cancel active jobs
        for job_id, job in self.active_jobs.items():
            job.status = BatchJobStatus.CANCELLED
            job.message = "Processing cancelled"
            self.stats.cancelled_jobs += 1
        
        self.is_processing = False
        logger.info("Batch processing stopped")
    
    async def _worker(self, worker_name: str):
        """Worker coroutine for processing batch jobs"""
        
        logger.info(f"Batch worker {worker_name} started")
        
        while self.is_processing:
            try:
                # Get next job from queue (with timeout)
                try:
                    priority, queued_time, job = await asyncio.wait_for(
                        self.job_queue.get(), timeout=5.0
                    )
                except asyncio.TimeoutError:
                    # No jobs available, continue
                    continue
                
                # Process the job
                await self._process_job(job, worker_name)
                
                # Mark task as done
                self.job_queue.task_done()
                
            except asyncio.CancelledError:
                logger.info(f"Worker {worker_name} cancelled")
                break
            except Exception as e:
                logger.error(f"Worker {worker_name} error: {e}")
                continue
        
        logger.info(f"Worker {worker_name} stopped")
    
    async def _process_job(self, job: BatchJob, worker_name: str):
        """Process a single batch job"""
        
        logger.info(f"Worker {worker_name} processing job {job.id}")
        
        # Update job status
        job.status = BatchJobStatus.PROCESSING
        job.started_at = datetime.utcnow()
        job.stage = "processing"
        job.message = f"Processing with {worker_name}"
        
        # Add to active jobs
        self.active_jobs[job.id] = job
        
        # Update stats
        self.stats.queued_jobs -= 1
        self.stats.processing_jobs += 1
        
        try:
            # Set up progress callback
            def progress_callback(progress: float, stage: str, message: str):
                job.progress = progress
                job.stage = stage
                job.message = message
                
                # Call external progress callbacks
                for callback in self.progress_callbacks.get(job.id, []):
                    try:
                        callback(job.id, progress, stage, message)
                    except Exception as e:
                        logger.error(f"Progress callback error: {e}")
            
            # Create professional video using enhanced renderer
            result = await self.renderer.create_automated_professional_video(
                script_content=job.script_content,
                voice_audio_base64=job.voice_audio_base64,
                template_id=job.template_id,
                quality=job.quality,
                background_config=job.background_config,
                project_id=job.project_id
            )
            
            # Job completed successfully
            job.status = BatchJobStatus.COMPLETED
            job.completed_at = datetime.utcnow()
            job.progress = 100.0
            job.stage = "completed"
            job.message = "Video created successfully"
            job.result = result
            job.actual_duration = (job.completed_at - job.started_at).total_seconds()
            
            # Update stats
            self.stats.processing_jobs -= 1
            self.stats.completed_jobs += 1
            self.stats.total_processing_time += job.actual_duration
            self.stats.average_processing_time = (
                self.stats.total_processing_time / max(1, self.stats.completed_jobs)
            )
            
            logger.info(f"Job {job.id} completed successfully in {job.actual_duration:.2f}s")
            
        except Exception as e:
            # Job failed
            job.status = BatchJobStatus.FAILED
            job.completed_at = datetime.utcnow()
            job.error = str(e)
            job.stage = "failed"
            job.message = f"Processing failed: {str(e)}"
            
            # Update stats
            self.stats.processing_jobs -= 1
            self.stats.failed_jobs += 1
            
            logger.error(f"Job {job.id} failed: {e}")
        
        finally:
            # Move job to completed jobs and remove from active
            self.completed_jobs[job.id] = job
            self.job_history.append(job)
            
            if job.id in self.active_jobs:
                del self.active_jobs[job.id]
            
            # Update success rate
            total_finished = self.stats.completed_jobs + self.stats.failed_jobs
            if total_finished > 0:
                self.stats.success_rate = (self.stats.completed_jobs / total_finished) * 100
    
    def _estimate_job_duration(self, script_content: str, quality: str) -> float:
        """Estimate job processing duration based on content and quality"""
        
        # Base duration estimates (in seconds)
        base_duration = 30.0
        
        # Script length factor
        script_length = len(script_content)
        length_factor = min(script_length / 1000, 3.0)  # Cap at 3x
        
        # Quality factor
        quality_factors = {
            "720p": 1.0,
            "1080p": 1.5,
            "4k": 3.0
        }
        quality_factor = quality_factors.get(quality, 1.5)
        
        estimated_duration = base_duration * (1 + length_factor) * quality_factor
        
        return estimated_duration
    
    def get_job_status(self, job_id: str) -> Optional[Dict]:
        """Get status of a specific job"""
        
        # Check active jobs first
        if job_id in self.active_jobs:
            job = self.active_jobs[job_id]
        elif job_id in self.completed_jobs:
            job = self.completed_jobs[job_id]
        else:
            return None
        
        return {
            "id": job.id,
            "project_id": job.project_id,
            "status": job.status.value,
            "progress": job.progress,
            "stage": job.stage,
            "message": job.message,
            "created_at": job.created_at.isoformat(),
            "started_at": job.started_at.isoformat() if job.started_at else None,
            "completed_at": job.completed_at.isoformat() if job.completed_at else None,
            "estimated_duration": job.estimated_duration,
            "actual_duration": job.actual_duration,
            "error": job.error,
            "result": job.result
        }
    
    def get_batch_stats(self) -> Dict:
        """Get batch processing statistics"""
        return asdict(self.stats)
    
    def get_all_jobs(self, limit: int = 100) -> List[Dict]:
        """Get all jobs (active and completed)"""
        
        all_jobs = []
        
        # Add active jobs
        for job in self.active_jobs.values():
            all_jobs.append(self.get_job_status(job.id))
        
        # Add recent completed jobs
        recent_completed = sorted(
            self.job_history, 
            key=lambda j: j.completed_at or j.created_at,
            reverse=True
        )[:limit]
        
        for job in recent_completed:
            if job.id not in self.active_jobs:
                all_jobs.append(self.get_job_status(job.id))
        
        return all_jobs[:limit]
    
    def add_progress_callback(self, job_id: str, callback: Callable):
        """Add progress callback for a specific job"""
        
        if job_id not in self.progress_callbacks:
            self.progress_callbacks[job_id] = []
        
        self.progress_callbacks[job_id].append(callback)
    
    def remove_progress_callback(self, job_id: str, callback: Callable):
        """Remove progress callback for a specific job"""
        
        if job_id in self.progress_callbacks:
            try:
                self.progress_callbacks[job_id].remove(callback)
            except ValueError:
                pass
    
    async def cancel_job(self, job_id: str) -> bool:
        """Cancel a specific job"""
        
        if job_id in self.active_jobs:
            job = self.active_jobs[job_id]
            job.status = BatchJobStatus.CANCELLED
            job.completed_at = datetime.utcnow()
            job.message = "Job cancelled by user"
            
            # Move to completed jobs
            self.completed_jobs[job_id] = job
            del self.active_jobs[job_id]
            
            # Update stats
            self.stats.processing_jobs -= 1
            self.stats.cancelled_jobs += 1
            
            logger.info(f"Job {job_id} cancelled")
            return True
        
        return False
    
    async def retry_failed_job(self, job_id: str) -> Optional[str]:
        """Retry a failed job"""
        
        if job_id not in self.completed_jobs:
            return None
        
        original_job = self.completed_jobs[job_id]
        
        if original_job.status != BatchJobStatus.FAILED:
            return None
        
        # Create new job with same parameters
        new_job_id = await self.submit_batch_job(
            script_content=original_job.script_content,
            voice_audio_base64=original_job.voice_audio_base64,
            template_id=original_job.template_id,
            quality=original_job.quality,
            background_config=original_job.background_config,
            priority=original_job.priority,
            project_id=original_job.project_id
        )
        
        logger.info(f"Retrying failed job {job_id} as new job {new_job_id}")
        return new_job_id
    
    def cleanup_old_jobs(self, max_age_hours: int = 24):
        """Clean up old completed jobs"""
        
        cutoff_time = datetime.utcnow() - timedelta(hours=max_age_hours)
        
        # Remove old jobs from history
        self.job_history = [
            job for job in self.job_history
            if (job.completed_at or job.created_at) > cutoff_time
        ]
        
        # Remove old completed jobs
        old_job_ids = [
            job_id for job_id, job in self.completed_jobs.items()
            if (job.completed_at or job.created_at) < cutoff_time
        ]
        
        for job_id in old_job_ids:
            del self.completed_jobs[job_id]
        
        logger.info(f"Cleaned up {len(old_job_ids)} old jobs")