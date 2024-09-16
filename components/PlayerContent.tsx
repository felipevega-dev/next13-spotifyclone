"use client";

import { useEffect, useState, useRef } from "react";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { BiRewind, BiFastForward } from "react-icons/bi";

import { Song } from "@/types";

// HOOKS
import usePlayer from "@/hooks/usePlayer";
import useNormalizedAudio from '@/hooks/useNormalizedAudio';

import LikeButton from "./LikeButton";
import MediaItem from "./MediaItem";
import Slider from "./Slider";

interface PlayerContentProps {
  song: Song;
  songUrl: string;
}


const PlayerContent: React.FC<PlayerContentProps> = ({ 
  song, 
  songUrl
}) => {
  const player = usePlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(1);
  const normalizedSongUrl = useNormalizedAudio(songUrl);
  

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const setAudioData = () => {
      setDuration(audio.duration);
      setCurrentTime(audio.currentTime);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadeddata', setAudioData);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadeddata', setAudioData);
    };
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.volume = volume;
    }
  }, [volume]);

  const onPlayNext = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const nextSong = player.ids[currentIndex + 1];

    if (!nextSong) {
      return player.setId(player.ids[0]);
    }

    player.setId(nextSong);
  }

  const onPlayPrevious = () => {
    if (player.ids.length === 0) {
      return;
    }

    const currentIndex = player.ids.findIndex((id) => id === player.activeId);
    const previousSong = player.ids[currentIndex - 1];

    if (!previousSong) {
      return player.setId(player.ids[player.ids.length - 1]);
    }

    player.setId(previousSong);
  }

  const handlePlay = () => {
    if (!isPlaying) {
      audioRef.current?.play();
    } else {
      audioRef.current?.pause();
    }
    setIsPlaying(!isPlaying);
  }

  const toggleMute = () => {
    setVolume(prev => prev === 0 ? 1 : 0);
  }

  const handleVolumeChange = (value: number) => {
    setVolume(value);
  }

  const handleTimeChange = (value: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime = value;
      setCurrentTime(value);
    }
  }

  const handleSkip = (seconds: number) => {
    const audio = audioRef.current;
    if (audio) {
      audio.currentTime += seconds;
    }
  }

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  return ( 
    <div className="grid grid-cols-2 md:grid-cols-3 h-full">
      <div className="flex w-full justify-start">
        <div className="flex items-center gap-x-4">
          <MediaItem data={song} />
          <LikeButton songId={song.id} />
        </div>
      </div>

      <div className="flex flex-col items-center justify-center w-full max-w-[722px] gap-y-2">
        <div className="flex items-center gap-x-6">
          <AiFillStepBackward
            onClick={onPlayPrevious}
            size={30} 
            className="text-neutral-400 cursor-pointer hover:text-white transition"
          />
          <BiRewind
            onClick={() => handleSkip(-10)}
            size={30}
            className="text-neutral-400 cursor-pointer hover:text-white transition"
          />
          <div 
            onClick={handlePlay} 
            className="flex items-center justify-center h-10 w-10 rounded-full bg-white p-1 cursor-pointer"
          >
            <Icon size={30} className="text-black" />
          </div>
          <BiFastForward
            onClick={() => handleSkip(10)}
            size={30}
            className="text-neutral-400 cursor-pointer hover:text-white transition"
          />
          <AiFillStepForward
            onClick={onPlayNext}
            size={30} 
            className="text-neutral-400 cursor-pointer hover:text-white transition" 
          />
        </div>
        <div className="flex items-center gap-x-2 w-full">
          <span className="text-xs text-neutral-400">{formatTime(currentTime)}</span>
          <Slider 
            value={currentTime}
            onChange={handleTimeChange}
            max={duration}
            className="w-full"
          />
          <span className="text-xs text-neutral-400">{formatTime(duration)}</span>
        </div>
      </div>

      <div className="hidden md:flex w-full justify-end pr-2">
        <div className="flex items-center gap-x-2 w-[120px]">
          <VolumeIcon 
            onClick={toggleMute} 
            className="cursor-pointer" 
            size={34} 
          />
          <Slider 
            value={volume} 
            onChange={handleVolumeChange}
            max={1}
            step={0.01}
          />
        </div>
      </div>

      <audio
        ref={audioRef}
        src={normalizedSongUrl || songUrl}
        onEnded={onPlayNext}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      />
    </div>
   );
}
 
export default PlayerContent;