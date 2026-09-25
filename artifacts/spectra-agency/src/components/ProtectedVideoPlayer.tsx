import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  RotateCcw,
  ShieldCheck,
  X,
} from 'lucide-react';
import { apiUrl } from '@/lib/api';

interface ProtectedVideoPlayerProps {
  url: string;
  title?: string;
  onClose?: () => void;
  lang?: 'en' | 'fr' | 'ar';
}

function formatTime(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function extractGoogleDriveEmbedUrl(rawUrl: string): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (trimmed.includes('drive.google.com') && trimmed.includes('/preview')) {
    return trimmed;
  }
  const match = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/) || trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (match && match[1]) {
    return `https://drive.google.com/file/d/${match[1]}/preview`;
  }
  return null;
}

export function ProtectedVideoPlayer({
  url,
  title = 'SPECTRA FIELD NOTES',
  onClose,
  lang = 'en',
}: ProtectedVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const hideControlsTimer = useRef<number | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Clean and resolve the URL to support direct API host or relative proxy
  const cleanUrl = url.includes('/api/storage/')
    ? apiUrl(url.substring(url.indexOf('/api/storage/')))
    : url;

  const driveEmbedUrl = extractGoogleDriveEmbedUrl(cleanUrl);
  const isEmbed = !!driveEmbedUrl;

  useEffect(() => {
    if (isEmbed) {
      setIsLoading(false);
    }
  }, [isEmbed]);

  // Handle Play / Pause toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused || video.ended) {
      video.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Handle Mute toggle
  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isMuted) {
      video.muted = false;
      setIsMuted(false);
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  }, [isMuted]);

  // Handle Volume change
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      if (newVol === 0) {
        videoRef.current.muted = true;
        setIsMuted(true);
      } else if (isMuted) {
        videoRef.current.muted = false;
        setIsMuted(false);
      }
    }
  };

  // Handle Fullscreen toggle
  const toggleFullscreen = useCallback(async () => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      try {
        if (container.requestFullscreen) {
          await container.requestFullscreen();
        }
        setIsFullscreen(true);
      } catch (err) {
        console.error('Fullscreen request failed:', err);
      }
    } else {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      } catch (err) {
        console.error('Exit fullscreen failed:', err);
      }
    }
  }, []);

  // Sync fullscreen state with document event
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  // Scrubbing on the progress bar
  const seekTo = (clientX: number) => {
    const progressBar = progressBarRef.current;
    const video = videoRef.current;
    if (!progressBar || !video || !duration) return;

    const rect = progressBar.getBoundingClientRect();
    const pos = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    video.currentTime = pos * duration;
    setCurrentTime(pos * duration);
  };

  const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
    seekTo(e.clientX);
  };

  // Keyboard navigation & security interception
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Intercept Save Page / View Source
      if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S' || e.key === 'u' || e.key === 'U')) {
        e.preventDefault();
        return;
      }

      // Check if focus or mouse is within container
      if (!containerRef.current?.contains(document.activeElement) && !isFullscreen) {
        return;
      }

      if (e.code === 'Space' || e.key === 'k') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        toggleMute();
      } else if (e.key === 'ArrowLeft' || e.key === 'j') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
        }
      } else if (e.key === 'ArrowRight' || e.key === 'l') {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, toggleFullscreen, toggleMute, duration, isFullscreen]);

  // Controls auto-hide on inactivity
  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimer.current) {
      window.clearTimeout(hideControlsTimer.current);
    }
    if (isPlaying) {
      hideControlsTimer.current = window.setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying]);

  const handleMouseMove = () => {
    resetHideTimer();
  };

  // Video event handlers
  const handleTimeUpdate = () => {
    if (videoRef.current && !isScrubbing) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
      setIsLoading(false);
    }
  };

  const handleEnded = () => {
    setIsPlaying(false);
    setShowControls(true);
  };

  const handleWaiting = () => {
    setIsLoading(true);
  };

  const handlePlaying = () => {
    setIsLoading(false);
    setIsPlaying(true);
  };

  const handleError = () => {
    setIsLoading(false);
    setErrorMessage(
      lang === 'ar'
        ? 'تعذر تحميل الفيديو المحمي. يرجى إعادة المحاولة.'
        : lang === 'fr'
        ? 'Impossible de charger la vidéo protégée. Veuillez réessayer.'
        : 'Protected stream unavailable. Please retry.'
    );
  };

  // Calculate progress percentage
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (isEmbed) {
    return (
      <div
        ref={containerRef}
        tabIndex={0}
        className="relative h-full w-full select-none overflow-hidden bg-[#070b10] outline-none group"
        data-testid="protected-video-player"
      >
        <iframe
          src={driveEmbedUrl!}
          title={title}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />

        {/* Top Header bar overlay */}
        <div className="absolute top-0 inset-x-0 z-20 flex items-center justify-between p-2 sm:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
          <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto">
            <span className="inline-flex items-center gap-1 rounded-full border border-[#79aef4]/30 bg-[#79aef4]/10 px-2 py-0.5 font-code text-[8px] sm:text-[10px] uppercase tracking-wider text-[#9ec5f7]">
              <ShieldCheck size={10} className="text-[#79aef4]" />
              {lang === 'ar' ? 'بث محمي' : lang === 'fr' ? 'FLUX PROTÉGÉ' : 'SECURE STREAM'}
            </span>
            <span className="font-code text-[9px] sm:text-xs text-[#cad5e2] tracking-wide truncate max-w-[130px] sm:max-w-md">
              {title}
            </span>
          </div>

          {onClose && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
              className="flex h-6 w-6 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/10 text-[#d0dbe7] hover:bg-white/20 hover:text-white transition cursor-pointer pointer-events-auto"
              title="Close"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onContextMenu={(e) => {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }}
      tabIndex={0}
      className="relative h-full w-full select-none overflow-hidden bg-[#070b10] outline-none group"
      data-testid="protected-video-player"
    >
      {/* Video Element: Native controls disabled, right-click disabled, pointer events disabled to prevent IDM hover panel */}
      <video
        ref={videoRef}
        src={cleanUrl}
        autoPlay
        playsInline
        controlsList="nodownload noplaybackrate nofullscreen"
        disablePictureInPicture={true}
        // @ts-ignore
        disableremoteplayback="true"
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onWaiting={handleWaiting}
        onPlaying={handlePlaying}
        onError={handleError}
        onContextMenu={(e) => {
          e.preventDefault();
          return false;
        }}
        className="h-full w-full object-contain pointer-events-none"
      />

      {/* Transparent Click Shield: intercepts clicks and prevents direct interaction with video tag */}
      <div
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        onContextMenu={(e) => {
          e.preventDefault();
          return false;
        }}
        className="absolute inset-0 cursor-pointer z-10"
      />

      {/* Header bar overlay */}
      <div
        className={`absolute top-0 inset-x-0 z-20 flex items-center justify-between p-3 sm:p-4 bg-gradient-to-b from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#79aef4]/30 bg-[#79aef4]/10 px-2.5 py-0.5 font-code text-[9px] sm:text-[10px] uppercase tracking-wider text-[#9ec5f7]">
            <ShieldCheck size={11} className="text-[#79aef4]" />
            {lang === 'ar' ? 'بث محمي' : lang === 'fr' ? 'FLUX PROTÉGÉ' : 'SECURE STREAM'}
          </span>
          <span className="font-code text-[10px] sm:text-xs text-[#cad5e2] tracking-wide truncate max-w-[200px] sm:max-w-md">
            {title}
          </span>
        </div>

        {onClose && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-full bg-white/10 text-[#d0dbe7] hover:bg-white/20 hover:text-white transition cursor-pointer"
            title="Close"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Loading Spinner */}
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 z-15 flex flex-col items-center justify-center gap-3 bg-black/40 backdrop-blur-[2px]">
          <div className="h-9 w-9 rounded-full border-2 border-white/20 border-t-[#79aef4] animate-spin" />
          <span className="font-code text-[10px] tracking-widest text-[#9ab7db] uppercase">
            {lang === 'ar' ? 'جارٍ تحميل الدرس...' : lang === 'fr' ? 'Chargement sécurisé...' : 'Loading secure stream...'}
          </span>
        </div>
      )}

      {/* Error Display */}
      {errorMessage && (
        <div className="absolute inset-0 z-25 flex flex-col items-center justify-center gap-3 bg-[#0a0f16]/90 p-6 text-center">
          <ShieldCheck size={32} className="text-[#e27373]" />
          <p className="max-w-sm text-sm text-[#d6e0ea]">{errorMessage}</p>
          <button
            onClick={() => {
              setErrorMessage(null);
              if (videoRef.current) {
                videoRef.current.load();
                videoRef.current.play().catch(() => {});
              }
            }}
            className="mt-2 inline-flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-3.5 py-1.5 text-xs text-white hover:bg-white/20 transition cursor-pointer"
          >
            <RotateCcw size={13} />
            {lang === 'ar' ? 'إعادة المحاولة' : lang === 'fr' ? 'Réessayer' : 'Retry'}
          </button>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div
        className={`absolute bottom-0 inset-x-0 z-20 flex flex-col gap-2 p-3 sm:p-4 bg-gradient-to-t from-black/90 via-black/50 to-transparent transition-opacity duration-300 ${
          showControls ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => {
          e.preventDefault();
          return false;
        }}
      >
        {/* Progress / Scrubber Bar */}
        <div
          ref={progressBarRef}
          onClick={handleProgressBarClick}
          onMouseDown={() => setIsScrubbing(true)}
          onMouseUp={() => setIsScrubbing(false)}
          className="group/scrubber relative h-2.5 sm:h-3 w-full flex items-center cursor-pointer"
        >
          {/* Background rail */}
          <div className="h-1 sm:h-1.5 w-full rounded-full bg-white/15 overflow-hidden transition-all duration-150 group-hover/scrubber:h-2">
            {/* Filled progress rail */}
            <div
              className="h-full bg-gradient-to-r from-[#4477b8] to-[#79aef4] shadow-[0_0_12px_rgba(121,174,244,0.6)]"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Scrubber Thumb */}
          <div
            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 h-3.5 w-3.5 rounded-full bg-white shadow-[0_0_8px_rgba(121,174,244,0.8)] opacity-0 group-hover/scrubber:opacity-100 transition-opacity"
            style={{ left: `${progressPercent}%` }}
          />
        </div>

        {/* Controls Row */}
        <div className="flex items-center justify-between gap-2 pt-1 text-white">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Play / Pause Button */}
            <button
              onClick={togglePlay}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/10 hover:bg-[#79aef4] hover:text-[#070b10] transition cursor-pointer"
              title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} className="translate-x-0.5" />}
            </button>

            {/* Rewind 5s */}
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
                }
              }}
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-[#9ab0c9] hover:text-white transition cursor-pointer text-xs"
              title="-5s (Left Arrow)"
            >
              -5s
            </button>

            {/* Forward 5s */}
            <button
              onClick={() => {
                if (videoRef.current) {
                  videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
                }
              }}
              className="hidden sm:flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-[#9ab0c9] hover:text-white transition cursor-pointer text-xs"
              title="+5s (Right Arrow)"
            >
              +5s
            </button>

            {/* Volume / Mute Button */}
            <div className="flex items-center gap-1.5 group/volume">
              <button
                onClick={toggleMute}
                className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-[#ccd7e4] hover:text-white transition cursor-pointer"
                title={isMuted ? 'Unmute (m)' : 'Mute (m)'}
              >
                {isMuted || volume === 0 ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="hidden md:block w-14 sm:w-18 accent-[#79aef4] h-1 bg-white/20 rounded cursor-pointer opacity-80 hover:opacity-100 transition"
              />
            </div>

            {/* Time Stamp */}
            <span className="font-code text-[11px] sm:text-xs text-[#a4b6cb] tracking-wider ml-1">
              {formatTime(currentTime)} <span className="text-white/30">/</span> {formatTime(duration)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg bg-white/5 hover:bg-white/15 text-[#ccd7e4] hover:text-white transition cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen (f)' : 'Fullscreen (f)'}
            >
              {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
