'use client';

import { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AudioPlayerProps {
  postId: number;
}

export function AudioPlayer({ postId }: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState<string>('nova');
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const speeds = [1, 1.25, 1.5, 2];
  const voices = [
    { id: 'nova', name: 'Nova', description: 'Natural, warm female' },
    { id: 'alloy', name: 'Alloy', description: 'Balanced, neutral' },
    { id: 'echo', name: 'Echo', description: 'Clear male' },
    { id: 'fable', name: 'Fable', description: 'Expressive British' },
    { id: 'onyx', name: 'Onyx', description: 'Deep male' },
    { id: 'shimmer', name: 'Shimmer', description: 'Bright female' },
  ];

  const loadAudio = async (voice?: string) => {
    const voiceToUse = voice || selectedVoice;
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/blog/tts/${postId}?voice=${voiceToUse}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate audio');
      }
      
      const data = await response.json();
      setAudioUrl(data.audioUrl);
      
    } catch (err) {
      setError('Failed to load audio');
      console.error('Audio loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVoiceChange = async (newVoice: string) => {
    // Pause current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
    }
    
    setSelectedVoice(newVoice);
    setIsPlaying(false);
    
    // Reset and reload audio with new voice
    setAudioUrl(null);
    setCurrentTime(0);
    setDuration(0);
    
    // Pass the new voice directly to avoid state timing issues
    await loadAudio(newVoice);
  };

  const togglePlayPause = async () => {
    if (!audioUrl) {
      await loadAudio();
      return;
    }
    
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        try {
          await audioRef.current.play();
          setIsPlaying(true);
        } catch (err) {
          console.error('Playback failed:', err);
          setError('Playback failed. Please try again.');
          setIsPlaying(false);
        }
      }
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      
      // Defensive check: If duration wasn't set during metadata load,
      // try to get it now during playback
      if (duration === 0) {
        const audioDuration = audioRef.current.duration;
        if (isFinite(audioDuration) && audioDuration > 0) {
          setDuration(audioDuration);
        }
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      const audioDuration = audioRef.current.duration;
      
      // Only set duration if it's a valid finite number
      // Streamed MP3s sometimes report NaN or Infinity initially
      if (isFinite(audioDuration) && audioDuration > 0) {
        setDuration(audioDuration);
      }
      
      // Apply the current playback speed when audio is ready
      audioRef.current.playbackRate = playbackSpeed;
    }
  };

  const handleEnded = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsPlaying(false);
    // Don't reset currentTime to 0 - some browsers treat this as a seek
    // and auto-restart playback. Leave it at the end position.
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeSpeed = () => {
    const currentIndex = speeds.indexOf(playbackSpeed);
    const nextIndex = (currentIndex + 1) % speeds.length;
    const newSpeed = speeds[nextIndex];
    
    console.log(`[AudioPlayer] Changing speed from ${playbackSpeed}x to ${newSpeed}x`);
    console.log(`[AudioPlayer] Audio element exists:`, !!audioRef.current);
    
    if (audioRef.current) {
      console.log(`[AudioPlayer] Current playbackRate before:`, audioRef.current.playbackRate);
      audioRef.current.playbackRate = newSpeed;
      console.log(`[AudioPlayer] Current playbackRate after:`, audioRef.current.playbackRate);
      
      // Force the rate again after a tiny delay to ensure it sticks
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.playbackRate = newSpeed;
        }
      }, 50);
    } else {
      console.error('[AudioPlayer] No audio element found!');
    }
    
    setPlaybackSpeed(newSpeed);
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (audioUrl && audioRef.current) {
      audioRef.current.playbackRate = playbackSpeed;
    }
  }, [audioUrl, playbackSpeed]);

  return (
    <div className="border-y border-black bg-white py-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <Volume2 className="h-5 w-5 text-black" />
        <div className="flex-1">
          <h3 className="text-xs font-semibold uppercase tracking-[0.22em] text-black">Listen to Article</h3>
          <p className="mt-1 text-sm text-gray-500">
            {duration > 0 ? `${formatTime(duration)} • ` : ''}Premium AI narration
          </p>
        </div>
        
        <Button
          onClick={togglePlayPause}
          disabled={isLoading}
          className="rounded-none bg-black px-6 text-xs font-semibold uppercase tracking-[0.16em] text-white hover:bg-orange-600"
          size="default"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Loading...
            </>
          ) : isPlaying ? (
            <>
              <Pause className="w-5 h-5 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-5 h-5 mr-2" />
              Play
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="mt-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="mt-5">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-500">
          Voice
        </label>
        <select
          value={selectedVoice}
          onChange={(e) => handleVoiceChange(e.target.value)}
          disabled={isLoading}
          className="w-full border border-gray-300 bg-white px-3 py-2 text-sm text-black focus:border-black focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
        >
          {voices.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name} - {voice.description}
            </option>
          ))}
        </select>
        {audioUrl && (
          <p className="mt-1 text-xs text-gray-500">
            Changing voice will reload the audio
          </p>
        )}
      </div>

      {audioUrl && (
        <>
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onEnded={handleEnded}
          />
          
          <div className="mt-4 space-y-2">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="h-1 w-full cursor-pointer appearance-none bg-gray-200 accent-black"
            />
            
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>{formatTime(currentTime)}</span>
              <button
                onClick={changeSpeed}
                className="border border-gray-300 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-black transition-colors hover:border-black"
              >
                {playbackSpeed}x
              </button>
              <span>{formatTime(duration)}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
