// app/page.tsx
'use client';

import { useState, useEffect, useRef } from 'react';

// لیست آهنگ‌های استاتیک
const staticSongs = [
  { 
    id: 1, 
    title: 'Song 1', 
    artist: 'Artist 1',
    duration: '3:45',
    url: '/songs/song1.mp3' 
  },
  { 
    id: 2, 
    title: 'Song 2', 
    artist: 'Artist 2',
    duration: '4:20',
    url: '/songs/song2.mp3' 
  },
  { 
    id: 3, 
    title: 'Song 3', 
    artist: 'Artist 3',
    duration: '3:15',
    url: '/songs/song3.mp3' 
  },
];

export default function HomePage() {
  const [selectedSong, setSelectedSong] = useState(staticSongs[0]);
  const [isConnected, setIsConnected] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [volume, setVolume] = useState(0.7);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // اتصال بلوتوث
  const connectBluetooth = async () => {
    try {
      console.log('Requesting Bluetooth device...');
      
      // درخواست دستگاه بلوتوث
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ['battery_service', 'generic_access']
      });
      
      console.log('Device found:', device.name);
      
      const server = await device.gatt?.connect();
      console.log('Connected to GATT server');
      
      setIsConnected(true);
      
      // در صورت قطع اتصال
      device.addEventListener('gattserverdisconnected', () => {
        setIsConnected(false);
        console.log('Bluetooth device disconnected');
      });
      
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      alert('اتصال بلوتوث ناموفق بود. لطفا مطمئن شوید: ۱٫ بلوتوث روشن است ۲٫ مرورگر از Web Bluetooth پشتیبانی می‌کند ۳٫ روی HTTPS هستید');
    }
  };

  // قطع اتصال بلوتوث
  const disconnectBluetooth = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    setIsConnected(false);
    setIsPlaying(false);
  };

  // پخش آهنگ
  const playSong = () => {
    if (audioRef.current) {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => console.error('Playback failed:', error));
    }
  };

  // توقف آهنگ
  const pauseSong = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  };

  // انتخاب آهنگ جدید
  const handleSongSelect = (song: typeof staticSongs[0]) => {
    setSelectedSong(song);
    setIsPlaying(false);
    
    // توقف آهنگ فعلی
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  // رویدادهای audio
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  // کنترل ولوم
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // کنترل موقعیت پخش
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  // فرمت زمان
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-8">
      {/* Audio Element (مخفی) */}
      <audio
        ref={audioRef}
        src={selectedSong.url}
        preload="metadata"
      />
      
      <header className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">
          🎵 Bluetooth Music Player
        </h1>
        <p className="text-gray-400 text-center">
          آهنگ‌های استاتیک + اتصال بلوتوث
        </p>
      </header>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* سمت چپ: کنترل بلوتوث */}
        <div className="lg:col-span-1 bg-gray-800 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span className="text-blue-400">📱</span> اتصال بلوتوث
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <span className="text-gray-300">وضعیت:</span>
              <span className={`px-3 py-1 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}>
                {isConnected ? 'متصل' : 'قطع'}
              </span>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={connectBluetooth}
                disabled={isConnected}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-900 disabled:cursor-not-allowed py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <span className="text-xl">🔗</span>
                اتصال به اسپیکر بلوتوث
              </button>
              
              <button
                onClick={disconnectBluetooth}
                disabled={!isConnected}
                className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed py-3 rounded-xl flex items-center justify-center gap-2 transition-colors"
              >
                <span className="text-xl">❌</span>
                قطع اتصال
              </button>
            </div>
            
            <div className="mt-8 p-4 bg-gray-900 rounded-xl">
              <h3 className="font-semibold mb-2">📋 نکات:</h3>
              <ul className="text-sm text-gray-400 space-y-2">
                <li>• فقط در مرورگرهای Chrome/Edge کار می‌کند</li>
                <li>• نیاز به HTTPS دارد</li>
                <li>• باید از طریق کلیک کاربر فعال شود</li>
                <li>• اسپیکر باید در حالت Pairing باشد</li>
              </ul>
            </div>
          </div>
        </div>

        {/* وسط: لیست آهنگ‌ها */}
        <div className="lg:col-span-2 bg-gray-800 rounded-2xl p-6">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span className="text-purple-400">🎶</span> لیست آهنگ‌ها
          </h2>
          
          <div className="space-y-3 mb-8">
            {staticSongs.map((song) => (
              <div
                key={song.id}
                onClick={() => handleSongSelect(song)}
                className={`p-4 rounded-xl cursor-pointer transition-all hover:scale-[1.02] ${
                  selectedSong.id === song.id
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                      <span className="text-2xl">🎵</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{song.title}</h3>
                      <p className="text-gray-300">{song.artist}</p>
                    </div>
                  </div>
                  <div className="text-gray-400">
                    {song.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* آهنگ انتخاب شده */}
          <div className="bg-gray-900 rounded-xl p-6">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="text-green-400">▶️</span> در حال پخش
            </h3>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-3xl">🎵</span>
              </div>
              <div>
                <h4 className="text-2xl font-bold">{selectedSong.title}</h4>
                <p className="text-gray-400">{selectedSong.artist}</p>
                <p className="text-sm text-gray-500 mt-1">
                  {formatTime(currentTime)} / {formatTime(duration)}
                </p>
              </div>
            </div>

            {/* کنترل‌های پخش */}
            <div className="space-y-6">
              <div>
                <input
                  type="range"
                  min="0"
                  max={duration || 100}
                  value={currentTime}
                  onChange={handleSeek}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>
              
              <div className="flex items-center justify-center gap-6">
                <button
                  onClick={playSong}
                  disabled={!selectedSong || !isConnected}
                  className="w-16 h-16 bg-green-600 hover:bg-green-700 disabled:bg-gray-700 rounded-full flex items-center justify-center text-2xl disabled:cursor-not-allowed transition-colors"
                >
                  ▶️
                </button>
                
                <button
                  onClick={pauseSong}
                  disabled={!isPlaying || !isConnected}
                  className="w-16 h-16 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-700 rounded-full flex items-center justify-center text-2xl disabled:cursor-not-allowed transition-colors"
                >
                  ⏸️
                </button>
              </div>
              
              <div className="flex items-center gap-4">
                <span className="text-gray-400">🔈</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
                <span className="text-gray-400">🔊</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* اطلاعات پخش */}
      <div className="mt-8 text-center text-gray-500 text-sm">
        <p>تعداد آهنگ‌ها: {staticSongs.length} | 
           آهنگ انتخاب شده: {selectedSong.title} | 
           وضعیت بلوتوث: {isConnected ? 'متصل' : 'قطع'}
        </p>
      </div>
    </div>
  );
}