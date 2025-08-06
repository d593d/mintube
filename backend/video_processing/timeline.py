"""
OpenCut-inspired Timeline Engine for Automated Video Processing
"""
import uuid
from datetime import datetime, timedelta
from typing import List, Dict, Optional, Any
from dataclasses import dataclass, asdict
import json

@dataclass
class TimelineAsset:
    """Represents a media asset on the timeline"""
    id: str
    type: str  # 'video', 'audio', 'image', 'text'
    name: str
    duration: float  # in seconds
    start_time: float  # start position on timeline
    track_id: str
    source_url: Optional[str] = None
    content: Optional[str] = None  # for text assets
    effects: List[Dict] = None
    transitions: Dict = None
    
    def __post_init__(self):
        if self.effects is None:
            self.effects = []
        if self.transitions is None:
            self.transitions = {}

@dataclass
class Track:
    """Represents a timeline track"""
    id: str
    type: str  # 'video', 'audio', 'subtitle'
    name: str
    index: int  # track order
    enabled: bool = True
    muted: bool = False
    locked: bool = False
    assets: List[TimelineAsset] = None
    
    def __post_init__(self):
        if self.assets is None:
            self.assets = []

class Timeline:
    """
    Timeline management system inspired by OpenCut's video editor
    Handles multi-track video composition with automated editing capabilities
    """
    
    def __init__(self, project_id: str, duration: float = 60.0):
        self.id = str(uuid.uuid4())
        self.project_id = project_id
        self.duration = duration
        self.frame_rate = 30
        self.resolution = (1920, 1080)
        self.created_at = datetime.utcnow()
        self.tracks: List[Track] = []
        self.metadata = {}
        
        # Initialize default tracks
        self._create_default_tracks()
    
    def _create_default_tracks(self):
        """Create default video and audio tracks"""
        # Main video track
        self.tracks.append(Track(
            id=str(uuid.uuid4()),
            type="video",
            name="Video 1",
            index=0
        ))
        
        # Main audio track
        self.tracks.append(Track(
            id=str(uuid.uuid4()),
            type="audio", 
            name="Audio 1",
            index=1
        ))
        
        # Subtitle track
        self.tracks.append(Track(
            id=str(uuid.uuid4()),
            type="subtitle",
            name="Subtitles",
            index=2
        ))
    
    def add_track(self, track_type: str, name: str) -> Track:
        """Add a new track to the timeline"""
        track = Track(
            id=str(uuid.uuid4()),
            type=track_type,
            name=name,
            index=len(self.tracks)
        )
        self.tracks.append(track)
        return track
    
    def get_track(self, track_id: str) -> Optional[Track]:
        """Get track by ID"""
        return next((t for t in self.tracks if t.id == track_id), None)
    
    def get_tracks_by_type(self, track_type: str) -> List[Track]:
        """Get all tracks of specific type"""
        return [t for t in self.tracks if t.type == track_type]
    
    def add_asset(self, track_id: str, asset: TimelineAsset) -> bool:
        """Add asset to specific track"""
        track = self.get_track(track_id)
        if not track:
            return False
            
        # Check for overlaps and resolve them
        self._resolve_overlaps(track, asset)
        track.assets.append(asset)
        
        # Update timeline duration if needed
        asset_end = asset.start_time + asset.duration
        if asset_end > self.duration:
            self.duration = asset_end
            
        return True
    
    def _resolve_overlaps(self, track: Track, new_asset: TimelineAsset):
        """Resolve overlapping assets on the same track"""
        new_start = new_asset.start_time
        new_end = new_asset.start_time + new_asset.duration
        
        # Remove or trim overlapping assets
        for existing_asset in track.assets[:]:  # Create copy to modify during iteration
            existing_start = existing_asset.start_time
            existing_end = existing_asset.start_time + existing_asset.duration
            
            # Check for overlap
            if new_start < existing_end and new_end > existing_start:
                # Complete overlap - remove existing
                if new_start <= existing_start and new_end >= existing_end:
                    track.assets.remove(existing_asset)
                # Partial overlap - trim existing
                elif new_start > existing_start and new_start < existing_end:
                    existing_asset.duration = new_start - existing_start
                elif new_end > existing_start and new_end < existing_end:
                    # Move existing asset
                    existing_asset.duration = existing_end - new_end
                    existing_asset.start_time = new_end
    
    def create_from_script_and_voice(self, script_content: str, voice_url: str, 
                                   background_config: Dict = None) -> Dict:
        """
        Automated timeline creation from script and voice
        This is the core automation feature inspired by OpenCut's capabilities
        """
        # Parse script into segments
        segments = self._parse_script_segments(script_content)
        
        # Get main tracks
        video_track = self.get_tracks_by_type("video")[0]
        audio_track = self.get_tracks_by_type("audio")[0]
        subtitle_track = self.get_tracks_by_type("subtitle")[0]
        
        current_time = 0.0
        
        # Add voice audio as main audio track
        voice_asset = TimelineAsset(
            id=str(uuid.uuid4()),
            type="audio",
            name="Generated Voice",
            duration=self._estimate_voice_duration(script_content),
            start_time=0.0,
            track_id=audio_track.id,
            source_url=voice_url
        )
        self.add_asset(audio_track.id, voice_asset)
        
        # Create video segments based on script structure
        for segment in segments:
            # Add subtitle
            subtitle_asset = TimelineAsset(
                id=str(uuid.uuid4()),
                type="text",
                name=f"Subtitle {len(subtitle_track.assets) + 1}",
                duration=segment['duration'],
                start_time=current_time,
                track_id=subtitle_track.id,
                content=segment['text']
            )
            self.add_asset(subtitle_track.id, subtitle_asset)
            
            # Add background video/image based on content
            background_type = self._determine_background_type(segment)
            background_asset = TimelineAsset(
                id=str(uuid.uuid4()),
                type=background_type['type'],
                name=f"Background {len(video_track.assets) + 1}",
                duration=segment['duration'],
                start_time=current_time,
                track_id=video_track.id,
                source_url=background_type['source']
            )
            
            # Add appropriate effects based on content type
            if segment['type'] == 'hook':
                background_asset.effects.append({
                    'type': 'zoom_in',
                    'intensity': 1.2
                })
            elif segment['type'] == 'transition':
                background_asset.transitions = {
                    'in': 'fade_in',
                    'out': 'fade_out'
                }
            
            self.add_asset(video_track.id, background_asset)
            current_time += segment['duration']
        
        return {
            'timeline_id': self.id,
            'total_duration': self.duration,
            'tracks_created': len(self.tracks),
            'assets_created': sum(len(t.assets) for t in self.tracks),
            'segments_processed': len(segments)
        }
    
    def _parse_script_segments(self, script_content: str) -> List[Dict]:
        """Parse script into timed segments for automated editing"""
        segments = []
        lines = script_content.strip().split('\n')
        
        current_segment = {'type': 'main', 'text': '', 'duration': 0}
        
        for line in lines:
            line = line.strip()
            if not line:
                continue
                
            # Detect segment types based on markers
            if line.startswith('[HOOK'):
                if current_segment['text']:
                    segments.append(current_segment)
                current_segment = {'type': 'hook', 'text': '', 'duration': 0}
            elif line.startswith('[INTRODUCTION'):
                if current_segment['text']:
                    segments.append(current_segment)
                current_segment = {'type': 'introduction', 'text': '', 'duration': 0}
            elif line.startswith('[MAIN CONTENT'):
                if current_segment['text']:
                    segments.append(current_segment)
                current_segment = {'type': 'main', 'text': '', 'duration': 0}
            elif line.startswith('[CONCLUSION'):
                if current_segment['text']:
                    segments.append(current_segment)
                current_segment = {'type': 'conclusion', 'text': '', 'duration': 0}
            elif line.startswith('[CALL TO ACTION'):
                if current_segment['text']:
                    segments.append(current_segment)
                current_segment = {'type': 'cta', 'text': '', 'duration': 0}
            elif not line.startswith('['):
                current_segment['text'] += line + '\n'
        
        # Add final segment
        if current_segment['text']:
            segments.append(current_segment)
        
        # Calculate durations based on text length (estimated reading time)
        for segment in segments:
            word_count = len(segment['text'].split())
            # Assume 150 words per minute speaking rate
            segment['duration'] = max(3.0, (word_count / 150.0) * 60.0)
        
        return segments
    
    def _estimate_voice_duration(self, script_content: str) -> float:
        """Estimate voice duration from script content"""
        word_count = len(script_content.split())
        # Assume 150 words per minute
        return max(30.0, (word_count / 150.0) * 60.0)
    
    def _determine_background_type(self, segment: Dict) -> Dict:
        """Determine appropriate background based on segment type"""
        segment_type = segment.get('type', 'main')
        
        background_map = {
            'hook': {'type': 'video', 'source': 'dynamic_background_1.mp4'},
            'introduction': {'type': 'video', 'source': 'intro_background.mp4'},
            'main': {'type': 'image', 'source': 'content_background.jpg'},
            'conclusion': {'type': 'video', 'source': 'outro_background.mp4'},
            'cta': {'type': 'video', 'source': 'cta_background.mp4'}
        }
        
        return background_map.get(segment_type, {'type': 'image', 'source': 'default_background.jpg'})
    
    def apply_template_style(self, template_id: str) -> bool:
        """Apply pre-designed template styling to the timeline"""
        templates = {
            'minimal': {
                'transitions': {'default': 'fade'},
                'effects': [],
                'colors': {'primary': '#ffffff', 'accent': '#000000'}
            },
            'scientific': {
                'transitions': {'default': 'slide'},
                'effects': [{'type': 'diagram_highlight'}],
                'colors': {'primary': '#2563eb', 'accent': '#1e40af'}
            },
            'storytelling': {
                'transitions': {'default': 'cinematic_wipe'},
                'effects': [{'type': 'cinematic_blur'}],
                'colors': {'primary': '#dc2626', 'accent': '#991b1b'}
            }
        }
        
        template = templates.get(template_id)
        if not template:
            return False
        
        # Apply template to all assets
        for track in self.tracks:
            for asset in track.assets:
                if asset.type in ['video', 'image']:
                    asset.transitions.update({
                        'in': template['transitions']['default'] + '_in',
                        'out': template['transitions']['default'] + '_out'
                    })
                    asset.effects.extend(template['effects'])
        
        self.metadata.update({'template': template_id, 'style': template})
        return True
    
    def to_dict(self) -> Dict:
        """Convert timeline to dictionary for API responses"""
        return {
            'id': self.id,
            'project_id': self.project_id,
            'duration': self.duration,
            'frame_rate': self.frame_rate,
            'resolution': self.resolution,
            'created_at': self.created_at.isoformat(),
            'tracks': [asdict(track) for track in self.tracks],
            'metadata': self.metadata
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> 'Timeline':
        """Create timeline from dictionary"""
        timeline = cls(data['project_id'], data.get('duration', 60.0))
        timeline.id = data['id']
        timeline.frame_rate = data.get('frame_rate', 30)
        timeline.resolution = tuple(data.get('resolution', [1920, 1080]))
        timeline.created_at = datetime.fromisoformat(data['created_at'])
        timeline.metadata = data.get('metadata', {})
        
        # Reconstruct tracks
        timeline.tracks = []
        for track_data in data.get('tracks', []):
            track = Track(
                id=track_data['id'],
                type=track_data['type'],
                name=track_data['name'],
                index=track_data['index'],
                enabled=track_data.get('enabled', True),
                muted=track_data.get('muted', False),
                locked=track_data.get('locked', False)
            )
            
            # Reconstruct assets
            for asset_data in track_data.get('assets', []):
                asset = TimelineAsset(
                    id=asset_data['id'],
                    type=asset_data['type'],
                    name=asset_data['name'],
                    duration=asset_data['duration'],
                    start_time=asset_data['start_time'],
                    track_id=asset_data['track_id'],
                    source_url=asset_data.get('source_url'),
                    content=asset_data.get('content'),
                    effects=asset_data.get('effects', []),
                    transitions=asset_data.get('transitions', {})
                )
                track.assets.append(asset)
            
            timeline.tracks.append(track)
        
        return timeline