import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  SkipBack,
  SkipForward,
  RotateCw,
  Settings,
  Maximize,
  Minimize,
  Clock,
  Zap,
  Download,
  Heart,
} from "lucide-react";

const DummyVideoPlayer = () => {
  // 🔵 Core Refs
  const videoRef = useRef(null);
  const progressBarRef = useRef(null);
  const playerContainerRef = useRef(null);
  const timerRef = useRef(null);
  const lastVolumeRef = useRef(0.7);
  const skipIntervalRef = useRef(null);

  // 🔵 Drag & Seek Refs
  const isDraggingRef = useRef(false);
  const wasPlayingBeforeDragRef = useRef(false);
  const lastSeekTimeRef = useRef(0);
  const lastTimeRef = useRef(0);
  // 🔵 State Management
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [quality, setQuality] = useState("1080p");
  const [subtitles, setSubtitles] = useState(false);
  const [videoStats, setVideoStats] = useState({
    buffered: 0,
    droppedFrames: 0,
    networkSpeed: 0,
    resolution: "1920x1080",
  });

  // 🔵 Keyboard Shortcuts Ref
  const keyActionsRef = useRef({
    " ": () => togglePlay(), // Space
    ArrowLeft: () => skip(-10), // Left arrow
    ArrowRight: () => skip(10), // Right arrow
    ArrowUp: () => changeVolume(0.1), // Volume up
    ArrowDown: () => changeVolume(-0.1), // Volume down
    f: () => toggleFullscreen(), // Fullscreen
    m: () => toggleMute(), // Mute
    k: () => togglePlay(), // Play/Pause
    0: () => seekTo(0), // Start
    9: () => seekTo(0.9), // 90%
  });

  // 🎯 10. ANALYTICS & PERFORMANCE MONITORING (ആദ്യം define ചെയ്യുക)
  const startAnalytics = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      if (videoRef.current) {
        const video = videoRef.current;
        const stats = {
          buffered:
            video.buffered.length > 0
              ? (video.buffered.end(video.buffered.length - 1) / duration) * 100
              : 0,
          networkSpeed: video.networkState === 2 ? "Buffering" : "Stable",
          resolution: `${video.videoWidth}x${video.videoHeight}`,
        };

        setVideoStats((prev) => ({ ...prev, ...stats }));
      }
    }, 1000);
  }, [duration]);

  const stopAnalytics = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // 🎯 DRAG & SEEK HANDLERS
  const handleMouseDown = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      isDraggingRef.current = true;
      wasPlayingBeforeDragRef.current = isPlaying;

      // Drag ചെയ്യുമ്പോൾ pause ചെയ്യുക
      if (isPlaying && videoRef.current) {
        videoRef.current.pause();
      }

      // Initial seek
      seekWithMouse(e);

      // Control കാണിക്കുക
      setShowControls(true);
    },
    [isPlaying],
  );

  const handleMouseMove = useCallback((e) => {
    if (!isDraggingRef.current) return;

    seekWithMouse(e);
  }, []);

  const handleMouseUp = useCallback(() => {
    if (!isDraggingRef.current) return;

    isDraggingRef.current = false;

    // Drag ആകെണ്ടെങ്കിൽ വീണ്ടും play ചെയ്യുക
    if (wasPlayingBeforeDragRef.current && videoRef.current) {
      videoRef.current.play();
    }

    // Performance: seek ചെയ്ത് 0.2s കഴിഞ്ഞേ analytics തുടങ്ങാവൂ
    const now = Date.now();
    if (now - lastSeekTimeRef.current > 200) {
      if (wasPlayingBeforeDragRef.current) {
        startAnalytics();
      }
    }
  }, [startAnalytics]);

  const seekWithMouse = useCallback(
    (e) => {
      if (!progressBarRef.current || !videoRef.current) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      let percent = (e.clientX - rect.left) / rect.width;

      // Clamp between 0 and 1
      percent = Math.max(0, Math.min(1, percent));

      const newTime = percent * duration;

      // Debounce seeks (സെക്കന്റിൽ 10 തവണ seek ചെയ്യാം)
      const now = Date.now();
      if (now - lastSeekTimeRef.current < 100) return;

      lastSeekTimeRef.current = now;

      // Direct DOM manipulation (no React re-render)
      videoRef.current.currentTime = newTime;
      setCurrentTime(newTime);

      // Analytics pause
      stopAnalytics();
    },
    [duration, stopAnalytics],
  );

  // 🎯 1. VIDEO PLAYBACK CONTROLS
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;

    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
      startAnalytics();
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      stopAnalytics();
    }
  }, []); // Empty dependencies - functions are stable via useCallback

  // 🎯 2. SEEKING & TIME UPDATES
  const updateTime = useCallback(() => {
    if (!videoRef.current) return;

    const t = videoRef.current.currentTime;
    console.log("tvvvvvvvvvvvvvvvvvvvvvvv", t);
    lastTimeRef.current = t; // ✅ THIS LINE WAS MISSING

    setCurrentTime(t);

    const buffered = videoRef.current.buffered;
    if (buffered.length > 0) {
      const bufferedEnd = buffered.end(buffered.length - 1);
      setVideoStats((prev) => ({
        ...prev,
        buffered: (bufferedEnd / duration) * 100,
      }));
    }
  }, [duration]);

  // 🎯 3. VOLUME MANAGEMENT
  const changeVolume = useCallback(
    (change) => {
      if (!videoRef.current) return;

      let newVolume = volume + change;
      newVolume = Math.max(0, Math.min(1, newVolume));

      videoRef.current.volume = newVolume;
      setVolume(newVolume);

      if (newVolume > 0) {
        lastVolumeRef.current = newVolume;
        if (isMuted) setIsMuted(false);
      }

      if (newVolume === 0) {
        setIsMuted(true);
      }
    },
    [volume, isMuted],
  );

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;

    if (isMuted) {
      videoRef.current.volume = lastVolumeRef.current;
      setVolume(lastVolumeRef.current);
      setIsMuted(false);
    } else {
      lastVolumeRef.current = volume;
      videoRef.current.volume = 0;
      setVolume(0);
      setIsMuted(true);
    }
  }, [isMuted, volume]);

  // 🎯 4. SKIP FORWARD/BACKWARD
  const skip = useCallback((seconds) => {
    if (!videoRef.current) return;

    videoRef.current.currentTime += seconds;
    setCurrentTime(videoRef.current.currentTime);
    showSkipFeedback(seconds > 0 ? "forward" : "backward");
  }, []);

  const startSkipInterval = useCallback(
    (seconds) => {
      if (skipIntervalRef.current) clearInterval(skipIntervalRef.current);

      skipIntervalRef.current = setInterval(() => {
        skip(seconds);
      }, 200);
    },
    [skip],
  );

  const stopSkipInterval = useCallback(() => {
    if (skipIntervalRef.current) {
      clearInterval(skipIntervalRef.current);
      skipIntervalRef.current = null;
    }
  }, []);

  // 🎯 5. PROGRESS BAR CLICK
  const handleProgressClick = useCallback(
    (e) => {
      if (!progressBarRef.current || !videoRef.current) return;

      const rect = progressBarRef.current.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      const seekTime = percent * duration;

      const oldTime = lastTimeRef.current; // ✅ correct old time

      // Seek
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);

      // Direction check
      if (seekTime > oldTime) {
        console.log("➡️ Forward seek");
      } else if (seekTime < oldTime) {
        console.log("⬅️ Backward seek");
      } else {
        console.log("⏸️ Same position");
      }

      console.log("Old:", oldTime.toFixed(2), "New:", seekTime.toFixed(2));
    },
    [duration],
  );

  // 🎯 6. FULLSCREEN MANAGEMENT
  const toggleFullscreen = useCallback(() => {
    if (!playerContainerRef.current) return;

    if (!isFullscreen) {
      if (playerContainerRef.current.requestFullscreen) {
        playerContainerRef.current.requestFullscreen();
      }
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, [isFullscreen]);

  // 🎯 7. PLAYBACK SPEED CONTROL
  const changePlaybackRate = useCallback((rate) => {
    if (!videoRef.current) return;

    videoRef.current.playbackRate = rate;
    setPlaybackRate(rate);
    showRateFeedback(rate);
  }, []);

  // 🎯 8. KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (!playerContainerRef.current?.contains(document.activeElement)) return;

      const action = keyActionsRef.current[e.key];
      if (action) {
        e.preventDefault();
        action();
      }
    };

    document.addEventListener("keydown", handleKeyPress);
    return () => document.removeEventListener("keydown", handleKeyPress);
  }, [togglePlay, toggleFullscreen, toggleMute]);

  // 🎯 9. AUTO-HIDE CONTROLS
  useEffect(() => {
    let hideTimeout;

    const resetHideTimer = () => {
      clearTimeout(hideTimeout);
      setShowControls(true);

      hideTimeout = setTimeout(() => {
        if (isPlaying) setShowControls(false);
      }, 3000);
    };

    if (playerContainerRef.current) {
      playerContainerRef.current.addEventListener("mousemove", resetHideTimer);
    }

    return () => {
      clearTimeout(hideTimeout);
      if (playerContainerRef.current) {
        playerContainerRef.current.removeEventListener(
          "mousemove",
          resetHideTimer,
        );
      }
    };
  }, [isPlaying]);

  // 🎯 11. FORMAT TIME
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  // 🎯 12. VISUAL FEEDBACK FUNCTIONS
  const showSkipFeedback = (direction) => {
    console.log(`Skipped ${direction}`);
  };

  const showRateFeedback = (rate) => {
    console.log(`Playback rate: ${rate}x`);
  };

  const seekTo = useCallback(
    (percent) => {
      if (!videoRef.current) return;
      const seekTime = percent * duration;
      videoRef.current.currentTime = seekTime;
      setCurrentTime(seekTime);
    },
    [duration],
  );

  // 🎯 13. INITIALIZE VIDEO
  useEffect(() => {
    const video = videoRef.current;
    console.log("video", video.duration);
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      video.volume = volume;

      lastTimeRef.current = video.currentTime; // ✅ ADD THIS
    };

    const handleEnded = () => {
      setIsPlaying(false);
      stopAnalytics();
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", updateTime);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", updateTime);
      video.removeEventListener("ended", handleEnded);
      stopAnalytics();
    };
  }, [updateTime, volume, stopAnalytics]);

  // 🎯 14. GLOBAL MOUSE EVENT LISTENERS FOR DRAGGING
  useEffect(() => {
    const handleGlobalMouseMove = (e) => handleMouseMove(e);
    const handleGlobalMouseUp = () => handleMouseUp();

    document.addEventListener("mousemove", handleGlobalMouseMove);
    document.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // 🎯 15. CALCULATE PROGRESS
  const progressPercent = useMemo(() => {
    return duration > 0 ? (currentTime / duration) * 100 : 0;
  }, [currentTime, duration]);

  const volumePercent = useMemo(() => {
    return volume * 100;
  }, [volume]);

  return (
    <div
      ref={playerContainerRef}
      className="relative w-full max-w-4xl mx-auto bg-black rounded-xl overflow-hidden select-none"
      style={{
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full h-auto"
        onClick={togglePlay}
        onDoubleClick={toggleFullscreen}
        preload="metadata"
        crossOrigin="anonymous"
      >
        <source
          src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4"
          type="video/mp4"
        />
        Your browser does not support the video tag.
      </video>

      {/* Controls Overlay */}
      <div
        className={`absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent transition-opacity duration-300 ${
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {/* Progress Bar with Drag Support */}
        <div className="absolute bottom-24 left-0 right-0 px-4">
          <div
            ref={progressBarRef}
            className="relative h-1.5 bg-white/30 rounded-full cursor-pointer group"
            onClick={handleProgressClick}
            onMouseDown={handleMouseDown}
          >
            {/* Progress */}
            <div
              className="absolute h-full bg-red-500 rounded-full transition-all"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Buffer Progress */}
            <div
              className="absolute h-full bg-white/50 rounded-full"
              style={{ width: `${videoStats.buffered}%` }}
            />

            {/* Thumb (Draggable) */}
            <div
              className="absolute top-1/2 w-3 h-3 bg-red-500 rounded-full -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
              style={{ left: `${progressPercent}%` }}
              onMouseDown={handleMouseDown}
            />
          </div>

          {/* Time Display */}
          <div className="flex justify-between text-white/80 text-sm mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Bottom Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent">
          <div className="flex items-center justify-between">
            {/* Left Controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlay}
                className="text-white hover:scale-110 transition-transform"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6" />
                ) : (
                  <Play className="w-6 h-6" />
                )}
              </button>

              <button
                onMouseDown={() => startSkipInterval(-5)}
                onMouseUp={stopSkipInterval}
                onMouseLeave={stopSkipInterval}
                className="text-white/80 hover:text-white transition-colors"
              >
                <SkipBack className="w-5 h-5" />
              </button>

              <button
                onMouseDown={() => startSkipInterval(5)}
                onMouseUp={stopSkipInterval}
                onMouseLeave={stopSkipInterval}
                className="text-white/80 hover:text-white transition-colors"
              >
                <SkipForward className="w-5 h-5" />
              </button>

              {/* Volume Control */}
              <div className="flex items-center space-x-2 group">
                <button
                  onClick={toggleMute}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {isMuted || volume === 0 ? (
                    <VolumeX className="w-5 h-5" />
                  ) : (
                    <Volume2 className="w-5 h-5" />
                  )}
                </button>

                <div className="w-24 h-1 bg-white/30 rounded-full relative overflow-hidden group-hover:w-32 transition-all duration-300">
                  <div
                    className="absolute h-full bg-white rounded-full"
                    style={{ width: `${volumePercent}%` }}
                  />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={(e) =>
                      changeVolume(parseFloat(e.target.value) - volume)
                    }
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Center Controls */}
            <div className="flex items-center space-x-4">
              <div className="text-white text-sm">{playbackRate}x</div>

              <button
                onClick={() =>
                  changePlaybackRate(
                    playbackRate === 2 ? 1 : playbackRate + 0.25,
                  )
                }
                className="text-white/80 hover:text-white transition-colors"
              >
                <RotateCw className="w-5 h-5" />
              </button>

              <button className="text-white/80 hover:text-white transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1 text-white/60 text-sm">
                <Clock className="w-4 h-4" />
                <span>{quality}</span>
              </div>

              <div className="flex items-center space-x-1 text-white/60 text-sm">
                <Zap className="w-4 h-4" />
                <span>{videoStats.networkSpeed || "Stable"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistics Panel */}
      {false && (
        <div className="absolute top-20 left-4 bg-black/80 text-white p-3 rounded-lg text-xs space-y-1">
          <div>Current: {currentTime.toFixed(2)}s</div>
          <div>Duration: {duration.toFixed(2)}s</div>
          <div>Buffered: {videoStats.buffered.toFixed(1)}%</div>
          <div>Volume: {(volume * 100).toFixed(0)}%</div>
          <div>Rate: {playbackRate}x</div>
          <div>Resolution: {videoStats.resolution}</div>
          <div>Dragging: {isDraggingRef.current ? "Yes" : "No"}</div>
        </div>
      )}

      {/* Keyboard Shortcuts Helper */}
      <div className="absolute bottom-4 right-4 bg-black/70 text-white/70 text-xs p-2 rounded opacity-0 hover:opacity-100 transition-opacity">
        <div>Space/K: Play/Pause</div>
        <div>←→: Skip 10s</div>
        <div>↑↓: Volume</div>
        <div>F: Fullscreen</div>
        <div>M: Mute</div>
        <div>Drag: Seek</div>
      </div>
    </div>
  );
};

export default DummyVideoPlayer;
