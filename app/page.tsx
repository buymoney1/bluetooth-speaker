// app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

const songs = [
  { id: 1, title: 'آهنگ اول', artist: 'خواننده اول', duration: '3:45', url: '/songs/1.mp3' },
  { id: 2, title: 'آهنگ دوم', artist: 'خواننده دوم', duration: '4:20', url: '/songs/2.mp3' },
  { id: 3, title: 'آهنگ سوم', artist: 'خواننده سوم', duration: '3:15', url: '/songs/3.mp3' },
];

export default function MusicPlayer() {
  const [selectedSong, setSelectedSong] = useState(songs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [deviceName, setDeviceName] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // باز کردن تنظیمات بلوتوث موبایل
  const openBluetoothSettings = () => {
    setConnectionStatus('connecting');
    
    // برای موبایل‌های Android
    if (/Android/i.test(navigator.userAgent)) {
      // روش اول: باز کردن تنظیمات بلوتوث
      window.open('intent://settings/bluetooth#Intent;scheme=android-app;end');
      
      // روش جایگزین برای Android
      // window.open('settings:bluetooth');
    }
    // برای iOS
    else if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      window.open('App-Prefs:root=Bluetooth');
      // یا
      // window.open('prefs:root=Bluetooth');
    }
    // برای سایر دستگاه‌ها
    else {
      // در دسکتاپ یا مرورگرهای دیگر، پیام راهنمایی نمایش می‌دهیم
      alert('لطفا به صورت دستی به تنظیمات بلوتوث دستگاه خود بروید و اسپیکر را انتخاب کنید.\n\nپس از اتصال، دکمه "تایید اتصال" را بزنید.');
    }
    
    // شبیه‌سازی اتصال بعد از 3 ثانیه (برای دمو)
    setTimeout(() => {
      setConnectionStatus('connected');
      setDeviceName('اسپیکر بلوتوث');
    }, 3000);
  };

  // قطع اتصال بلوتوث
  const disconnectBluetooth = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    }
    setConnectionStatus('disconnected');
    setDeviceName('');
  };

  // انتخاب آهنگ
  const handleSongSelect = (song: typeof songs[0]) => {
    setSelectedSong(song);
    setIsPlaying(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
      // وقتی آهنگ جدید بارگیری شد، مدت آن را بگیر
      audioRef.current.onloadedmetadata = () => {
        if (audioRef.current) {
          setDuration(audioRef.current.duration);
        }
      };
    }
  };

  // پخش/توقف آهنگ
  const togglePlay = () => {
    if (!audioRef.current) return;
    
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // اگر بلوتوث وصل نیست، هشدار بده
      if (connectionStatus !== 'connected') {
        alert('لطفا ابتدا به اسپیکر بلوتوث متصل شوید!');
        return;
      }
      
      audioRef.current.play();
      setIsPlaying(true);
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

  // کنترل ولوم
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // وقتی آهنگ در حال پخش است
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnd = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnd);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnd);
    };
  }, []);

  // فرمت زمان
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // بعد از اتصال بلوتوث، کاربر دکمه تایید را می‌زند
  const confirmConnection = () => {
    setConnectionStatus('connected');
    setDeviceName('اسپیکر بلوتوث شما');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white p-4 md:p-8">
      {/* Audio Element مخفی */}
      <audio
        ref={audioRef}
        src={selectedSong.url}
        preload="metadata"
        className="hidden"
      />

      {/* هدر */}
      <header className="text-center mb-10 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          🎵 پخش کننده موسیقی بلوتوث
        </h1>
        <p className="text-gray-300">آهنگ‌های استاتیک + اتصال به اسپیکر بلوتوث</p>
      </header>

      <div className="max-w-6xl mx-auto">
        {/* کارت اصلی */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* پنل سمت چپ - اتصال بلوتوث */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">📱</span>
                </div>
                <h2 className="text-2xl font-bold">اتصال بلوتوث</h2>
              </div>

              {/* وضعیت اتصال */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-gray-300">وضعیت:</span>
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${
                      connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                      connectionStatus === 'connecting' ? 'bg-yellow-500 animate-pulse' :
                      'bg-red-500'
                    }`}></div>
                    <span className="font-medium">
                      {connectionStatus === 'connected' ? 'متصل' :
                       connectionStatus === 'connecting' ? 'در حال اتصال' :
                       'قطع'}
                    </span>
                  </div>
                </div>

                {deviceName && (
                  <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
                    <p className="text-gray-400 text-sm mb-1">دستگاه متصل:</p>
                    <p className="font-medium text-lg">{deviceName}</p>
                  </div>
                )}
              </div>

              {/* دکمه‌های کنترل اتصال */}
              <div className="space-y-4">
                <button
                  onClick={openBluetoothSettings}
                  disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="text-xl">🔗</span>
                  باز کردن تنظیمات بلوتوث
                </button>

                {connectionStatus === 'connecting' && (
                  <button
                    onClick={confirmConnection}
                    className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02]"
                  >
                    <span className="text-xl">✅</span>
                    تایید اتصال
                  </button>
                )}

                <button
                  onClick={disconnectBluetooth}
                  disabled={connectionStatus !== 'connected'}
                  className="w-full bg-gradient-to-r from-red-600/80 to-red-700/80 hover:from-red-700 hover:to-red-800 disabled:from-gray-700 disabled:to-gray-800 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-[1.02]"
                >
                  <span className="text-xl">❌</span>
                  قطع اتصال
                </button>
              </div>

              {/* راهنما */}
              <div className="mt-8 p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-xl border border-gray-700">
                <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                  <span className="text-yellow-400">💡</span> راهنمای اتصال:
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">1.</span>
                    <span>دکمه بالا را بزنید تا تنظیمات بلوتوث باز شود</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">2.</span>
                    <span>اسپیکر بلوتوث خود را انتخاب کنید</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">3.</span>
                    <span>پس از اتصال، دکمه "تایید اتصال" را بزنید</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">4.</span>
                    <span>حالا می‌توانید آهنگ پخش کنید</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* پنل سمت راست - آهنگ‌ها و کنترل پخش */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl p-6 border border-gray-700 shadow-2xl h-full">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <span className="text-2xl">🎵</span>
                </div>
                <h2 className="text-2xl font-bold">لیست آهنگ‌ها</h2>
              </div>

              {/* لیست آهنگ‌ها */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => handleSongSelect(song)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                      selectedSong.id === song.id
                        ? 'bg-gradient-to-r from-purple-900/50 to-pink-900/50 border-2 border-purple-500'
                        : 'bg-gray-900/50 hover:bg-gray-700/50 border border-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                        selectedSong.id === song.id
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                          : 'bg-gray-800'
                      }`}>
                        <span className="text-2xl">
                          {selectedSong.id === song.id ? '▶️' : '🎵'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-lg">{song.title}</h3>
                        <p className="text-gray-400 text-sm">{song.artist}</p>
                        <p className="text-gray-500 text-xs mt-1">{song.duration}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* پنل کنترل پخش */}
              <div className="bg-gradient-to-r from-gray-900/70 to-gray-800/70 rounded-2xl p-6 border border-gray-700">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                    <span className="text-4xl">🎵</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1">{selectedSong.title}</h3>
                    <p className="text-gray-400 mb-2">{selectedSong.artist}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>{formatTime(currentTime)}</span>
                      <span>/</span>
                      <span>{formatTime(duration)}</span>
                      <span className="ml-auto">{selectedSong.duration}</span>
                    </div>
                  </div>
                </div>

                {/* نوار پیشرفت */}
                <div className="mb-6">
                  <input
                    type="range"
                    min="0"
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeek}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-pink-500"
                  />
                </div>

                {/* کنترل‌های پخش */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  {/* دکمه‌های پخش/توقف */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={togglePlay}
                      disabled={connectionStatus !== 'connected'}
                      className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl transition-all duration-300 transform hover:scale-110 ${
                        connectionStatus === 'connected'
                          ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                          : 'bg-gray-700 cursor-not-allowed'
                      }`}
                    >
                      {isPlaying ? '⏸️' : '▶️'}
                    </button>
                    
                    <button
                      onClick={() => {
                        if (audioRef.current) {
                          audioRef.current.currentTime = 0;
                          audioRef.current.pause();
                          setIsPlaying(false);
                        }
                      }}
                      className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-xl transition-all duration-300"
                    >
                      ⏹️
                    </button>
                  </div>

                  {/* کنترل ولوم */}
                  <div className="flex items-center gap-4 w-full md:w-auto">
                    <span className="text-gray-400">🔈</span>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={handleVolumeChange}
                      className="flex-1 md:w-48 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-blue-600"
                    />
                    <span className="text-gray-400">🔊</span>
                    <span className="text-sm text-gray-400 min-w-12">
                      {Math.round(volume * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* اطلاعات پایین صفحه */}
        <div className="mt-8 text-center text-gray-500 text-sm">
          <div className="inline-flex items-center gap-6 bg-gray-800/50 px-6 py-3 rounded-xl">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                connectionStatus === 'connected' ? 'bg-green-500 animate-pulse' :
                connectionStatus === 'connecting' ? 'bg-yellow-500' :
                'bg-red-500'
              }`}></div>
              <span>بلوتوث: {connectionStatus === 'connected' ? 'متصل' : 'قطع'}</span>
            </div>
            <div className="hidden md:block">|</div>
            <div>آهنگ: {selectedSong.title}</div>
            <div className="hidden md:block">|</div>
            <div>وضعیت: {isPlaying ? 'در حال پخش' : 'توقف'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}