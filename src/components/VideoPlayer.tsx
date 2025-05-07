'use client';

import {  useRef, useState, useEffect } from 'react';
import { FaPlay, FaPause, FaVolumeUp, FaVolumeMute, FaExpand, FaCog } from 'react-icons/fa';

type VideoPlayerProps = {
  videoUrl: string;
  className: string;
};

export default function VideoPlayer({ videoUrl, className }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  /*const handleVideoEnd = useCallback(async () => {
    try {
      const get = Cookie.get("authorization");
      const token = await (await fetch("/api/verify", {method: "POST" , body: JSON.stringify({token: String(get)})})).json();
      if (!token.ok) setusN("anonymous")
      else setusN(token.account.username);
      setView(true);
    } catch (e) {
      console.error('Failed to update view count:', e);
    }
  }, [videoId]);
  useEffect(() => {
    const updateViewCount = async () => {
    const client = (await (await fetch("/api/client")).json());
    const {lat, long} = {lat: client["x-vercel-ip-latitude"], long: client["x-vercel-ip-longitude"]};
    await fetch(`/api/view`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: videoId, ip: client["x-real-ip"], username: usN, lat, long }),
    });
    }
    if (view) updateViewCount();
    setView(false);
  }, [videoId, view]);


  const handleVideoClick = useCallback(async () => {
    try {
      const get = Cookie.get("authorization");
      const token = await (await fetch("/api/verify", {method: "POST" , body: JSON.stringify({token: String(get)})})).json();
      if (token.ok == true) {
        setusN(token.account.username);
      } else {
        setusN("anonymous");
      }
    } catch (e) {
      console.error('Failed to update view count:', e);
    }
  }, [videoId]);
  useEffect(() => {
    const updateClickCount = async () => {
    const client = (await (await fetch("/api/client")).json());
    const {lat, long} = {lat: client["x-vercel-ip-latitude"], long: client["x-vercel-ip-longitude"]};
    await fetch(`/api/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: videoId, ip: client["x-real-ip"], username: usN, lat, long }),
    });
    }
    if (usN) updateClickCount();
  }, [videoId, usN]);
  */

  const togglePlayPause = () => {
    const video = videoRef.current;
    if (video) {
      if (isPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (video) {
      video.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const newVolume = parseFloat(e.target.value);
    if (video) {
      video.volume = newVolume;
      setVolume(newVolume);
    }
  };

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const video = videoRef.current;
    const newTime = parseFloat(e.target.value);
    if (video) {
      video.currentTime = newTime;
      setProgress(newTime);
    }
  };

  const updateProgress = () => {
    const video = videoRef.current;
    if (video) {
      setProgress(video.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video) {
      setDuration(video.duration);
    }
  };

  const enterFullscreen = () => {
    const video = videoRef.current;
    if (video && video.requestFullscreen) {
      video.requestFullscreen();
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    const video = videoRef.current;
    if (video) {
      video.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSettings(false);
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.addEventListener('timeupdate', updateProgress);
      return () => video.removeEventListener('timeupdate', updateProgress);
    }
  }, []);

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video Element */}
      <video
        ref={videoRef}
        className={`w-full h-full ${className}`} 
        onLoadedMetadata={handleLoadedMetadata}
      >
        <source src={`${videoUrl}#t=0.1`} type="video/mp4" />
      </video>

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-transparent text-white flex flex-col space-y-2">
        {/* Progress Bar */}
        <input
          type="range"
          min="0"
          max={duration}
          value={progress}
          onChange={handleProgressChange}
          className="w-full appearance-none h-2 bg-gray-600 rounded cursor-pointer"
        />
        <div className="flex items-center justify-between text-sm">
          <span>{formatTime(progress)}</span>
          <span>{formatTime(duration)}</span>
        </div>

        <div className="flex items-center justify-between">
          {/* Play/Pause Button */}
          <button onClick={togglePlayPause} className="p-2">
            {isPlaying ? <FaPause size={20} /> : <FaPlay size={20} />}
          </button>

          {/* Volume Control */}
          <div className="flex items-center space-x-2">
            <button onClick={toggleMute}>
              {isMuted ? <FaVolumeMute size={20} /> : <FaVolumeUp size={20} />}
            </button>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={volume}
              onChange={handleVolumeChange}
              className="w-48"
            />
          </div>

          {/* Settings and Fullscreen */}
          <div className="flex items-center space-x-4">
            {/* Settings Menu */}
            <div className="relative">
              <button onClick={() => setShowSettings(!showSettings)} className="p-2">
                <FaCog size={20} />
              </button>
              {showSettings && (
                <div className="absolute bottom-10 right-0 bg-gray-900 text-white p-2 rounded shadow-md">
                  <div>
                    <h3 className="text-sm font-semibold">Playback Speed</h3>
                    <ul className="text-sm space-y-1">
                      {[0.25, 0.5, 1, 1.5, 2, 2.5, 3].map((speed) => (
                        <li key={speed}>
                          <button
                            className={`w-full text-left ${
                              playbackSpeed === speed ? 'text-blue-400' : ''
                            }`}
                            onClick={() => changePlaybackSpeed(speed)}
                          >
                            {speed}x
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen Button */}
            <button onClick={enterFullscreen} className="p-2">
              <FaExpand size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
