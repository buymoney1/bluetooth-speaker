// app/page.tsx
'use client';

import { useState, useRef, useEffect } from 'react';

const songs = [
  { id: 1, title: 'آهنگ اول', artist: 'خواننده اول', duration: '3:45', url: '/songs/song1.mp3' },
  { id: 2, title: 'آهنگ دوم', artist: 'خواننده دوم', duration: '4:20', url: '/songs/song2.mp3' },
  { id: 3, title: 'آهنگ سوم', artist: 'خواننده سوم', duration: '3:15', url: '/songs/song3.mp3' },
];

export default function MusicPlayer() {
  const [selectedSong, setSelectedSong] = useState(songs[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.7);
  const [deviceName, setDeviceName] = useState<string>('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [isAndroid, setIsAndroid] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);

  // تشخیص دستگاه
  useEffect(() => {
    const userAgent = navigator.userAgent;
    setIsAndroid(/Android/i.test(userAgent));
    setIsIOS(/iPhone|iPad|iPod/i.test(userAgent));
  }, []);

  // باز کردن تنظیمات بلوتوث برای اندروید
  const openBluetoothSettingsAndroid = () => {
    setConnectionStatus('connecting');
    
    // چندین روش مختلف برای اندروید
    const methods = [
      // روش ۱: مستقیماً به صفحه بلوتوث
      () => window.open('intent://settings/bluetooth#Intent;scheme=android-app;package=com.android.settings;end', '_blank'),
      
      // روش ۲: از طریق Intent
      () => window.open('intent://settings/bluetooth#Intent;scheme=android-app;package=com.android.settings;S.android.intent.extra.REFERRER_NAME=com.android.settings;end', '_blank'),
      
      // روش ۳: تنظیمات عمومی
      () => window.open('settings://bluetooth', '_blank'),
      
      // روش ۴: برای سامسونگ
      () => window.open('intent://com.android.settings.bluetooth#Intent;scheme=android-app;package=com.android.settings;end', '_blank'),
      
      // روش ۵: آخرین تلاش
      () => {
        // تلاش برای ساخت یک intent اندرویدی
        const intentUrl = `intent://settings/bluetooth#Intent;scheme=settings;package=com.android.settings;end`;
        window.location.href = intentUrl;
        
        // اگر باز نشد، بعد از ۲ ثانیه پیام نمایش بده
        setTimeout(() => {
          if (document.hasFocus()) { // اگر هنوز در صفحه ما هستیم
            showManualInstructions();
          }
        }, 2000);
      }
    ];

    // امتحان کردن روش‌ها یکی یکی
    let triedMethods = 0;
    const tryNextMethod = () => {
      if (triedMethods < methods.length) {
        methods[triedMethods]();
        triedMethods++;
        
        // اگر بعد از ۱.۵ ثانیه هنوز در صفحه ماییم، روش بعدی را امتحان کن
        setTimeout(() => {
          if (document.hasFocus()) {
            tryNextMethod();
          }
        }, 1500);
      } else {
        showManualInstructions();
      }
    };

    tryNextMethod();
  };

  // باز کردن تنظیمات بلوتوث برای iOS
  const openBluetoothSettingsIOS = () => {
    setConnectionStatus('connecting');
    
    // برای iOS
    const methods = [
      // روش‌های مختلف برای iOS
      () => window.open('App-Prefs:root=Bluetooth', '_blank'),
      () => window.open('prefs:root=Bluetooth', '_blank'),
      () => window.open('app-settings:Bluetooth', '_blank'),
      () => {
        // اگر روش‌های بالا کار نکرد
        showManualInstructions();
      }
    ];

    let triedMethods = 0;
    const tryNextMethod = () => {
      if (triedMethods < methods.length) {
        methods[triedMethods]();
        triedMethods++;
        
        setTimeout(() => {
          if (document.hasFocus()) {
            tryNextMethod();
          }
        }, 1000);
      }
    };

    tryNextMethod();
  };

  // نمایش دستورالعمل دستی
  const showManualInstructions = () => {
    const message = `
🚀 برای اتصال بلوتوث:

📱 روی موبایل اندرویدی (مثل S20 FE):
1. از بالای صفحه به پایین بکشید
2. آیکون بلوتوث ⚡ را لمس نگه دارید
3. در تنظیمات بلوتوث، اسپیکر خود را انتخاب کنید
4. پس از اتصال، به این صفحه برگردید و دکمه "تایید اتصال" را بزنید

🍎 روی آیفون/آیپد:
1. به Settings → Bluetooth بروید
2. اسپیکر خود را انتخاب کنید
3. پس از اتصال، به این صفحه برگردید

💻 روی کامپیوتر:
1. به Settings → Bluetooth & devices بروید
2. اسپیکر را وصل کنید
3. پس از اتصال، دکمه "تایید اتصال" را بزنید
    `;
    
    alert(message);
  };

  // تابع اصلی باز کردن تنظیمات بلوتوث
  const openBluetoothSettings = () => {
    setConnectionStatus('connecting');
    
    if (isAndroid) {
      openBluetoothSettingsAndroid();
    } else if (isIOS) {
      openBluetoothSettingsIOS();
    } else {
      // برای دسکتاپ یا دستگاه‌های دیگر
      showManualInstructions();
    }
    
    // برای تست: بعد از ۳ ثانیه اگر کاربر تایید نکرد، بپرس
    setTimeout(() => {
      if (connectionStatus === 'connecting') {
        const confirmed = confirm('آیا توانستید به تنظیمات بلوتوث بروید و اتصال را برقرار کنید؟\n\nاگر بله را بزنید، وضعیت به "متصل" تغییر می‌کند.');
        if (confirmed) {
          confirmConnection();
        }
      }
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

  // تایید اتصال توسط کاربر
  const confirmConnection = () => {
    setConnectionStatus('connected');
    setDeviceName('اسپیکر بلوتوث شما');
    
    // نمایش پیام موفقیت
    const successMessages = [
      "✅ اتصال با موفقیت برقرار شد!",
      "🎉 حالا می‌تونید آهنگ پخش کنید!",
      "🔊 اسپیکر آماده پخش است!"
    ];
    
    const randomMessage = successMessages[Math.floor(Math.random() * successMessages.length)];
    alert(randomMessage);
  };

  // انتخاب آهنگ
  const handleSongSelect = (song: typeof songs[0]) => {
    setSelectedSong(song);
    setIsPlaying(false);
    
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      
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
        alert('⚠️ لطفا ابتدا به اسپیکر بلوتوث متصل شوید!\n\nدکمه "باز کردن تنظیمات بلوتوث" را بزنید.');
        return;
      }
      
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(error => {
          console.error('Playback error:', error);
          alert('❌ خطا در پخش آهنگ! مطمئن شوید فایل صوتی موجود است.');
        });
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

  // دکمه راهنمای اتصال سریع
  const QuickConnectionButton = () => (
    <button
      onClick={() => {
        const deviceType = isAndroid ? 'اندروید' : isIOS ? 'iOS' : 'دسکتاپ';
        const instruction = isAndroid 
          ? '۱. از بالای صفحه به پایین بکشید\n۲. آیکون بلوتوث ⚡ را لمس نگه دارید\n۳. اسپیکر را انتخاب کنید\n۴. به این صفحه برگردید و "تایید اتصال" را بزنید'
          : isIOS
          ? '۱. به Settings → Bluetooth بروید\n۲. اسپیکر را انتخاب کنید\n۳. به این صفحه برگردید و "تایید اتصال" را بزنید'
          : '۱. به تنظیمات بلوتوث سیستم بروید\n۲. اسپیکر را وصل کنید\n۳. دکمه "تایید اتصال" را بزنید';
        
        alert(`📱 راهنمای اتصال سریع (${deviceType}):\n\n${instruction}`);
      }}
      className="px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-lg font-medium text-sm transition-all duration-300"
    >
      🚀 راهنمای سریع
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 text-white p-4 md:p-8">
      {/* Audio Element مخفی */}
      <audio
        ref={audioRef}
        src={selectedSong.url}
        preload="metadata"
        className="hidden"
      />

      {/* هدر */}
      <header className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
            <span className="text-2xl">🎵</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            پخش کننده موسیقی بلوتوث
          </h1>
        </div>
        <p className="text-gray-300 text-sm md:text-base">آهنگ‌های استاتیک + اتصال به اسپیکر بلوتوث</p>
        <div className="mt-4 inline-flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-full text-sm">
          <span className={`w-2 h-2 rounded-full ${isAndroid ? 'bg-green-500' : isIOS ? 'bg-blue-500' : 'bg-gray-500'}`}></span>
          <span>دستگاه: {isAndroid ? 'اندروید' : isIOS ? 'iOS' : 'دسکتاپ'}</span>
        </div>
      </header>

      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* پنل اتصال بلوتوث */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
                    <span className="text-xl">📱</span>
                  </div>
                  <h2 className="text-xl font-bold">اتصال بلوتوث</h2>
                </div>
                <QuickConnectionButton />
              </div>

              {/* وضعیت اتصال */}
              <div className="mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl mb-4">
                  <div>
                    <p className="text-gray-400 text-sm">وضعیت اتصال</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className={`w-3 h-3 rounded-full animate-pulse ${
                        connectionStatus === 'connected' ? 'bg-green-500' :
                        connectionStatus === 'connecting' ? 'bg-yellow-500' :
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
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">دستگاه</p>
                      <p className="font-medium text-blue-300">{deviceName}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* دکمه‌های اصلی */}
              <div className="space-y-3">
                <button
                  onClick={openBluetoothSettings}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 px-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 active:scale-95 shadow-lg hover:shadow-blue-500/20"
                >
                  <span className="text-2xl">🔗</span>
                  باز کردن تنظیمات بلوتوث
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">کلیک کنید</span>
                </button>

                {connectionStatus === 'connecting' && (
                  <div className="space-y-3">
                    <div className="text-center text-yellow-300 text-sm animate-pulse">
                      ⏳ منتظر اتصال شما هستیم...
                    </div>
                    <button
                      onClick={confirmConnection}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-all duration-300"
                    >
                      <span className="text-xl">✅</span>
                      بله، وصل شدم! (تایید اتصال)
                    </button>
                    <button
                      onClick={() => setConnectionStatus('disconnected')}
                      className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white py-2 px-4 rounded-lg text-sm"
                    >
                      لغو
                    </button>
                  </div>
                )}

                <button
                  onClick={disconnectBluetooth}
                  disabled={connectionStatus !== 'connected'}
                  className="w-full bg-gradient-to-r from-red-600/90 to-red-700/90 hover:from-red-700 hover:to-red-800 disabled:from-gray-800 disabled:to-gray-900 disabled:cursor-not-allowed text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-3 transition-all duration-300"
                >
                  <span className="text-xl">❌</span>
                  قطع اتصال بلوتوث
                </button>
              </div>

              {/* نکات مهم */}
              <div className="mt-8 p-4 bg-gradient-to-r from-gray-900/60 to-gray-800/60 rounded-xl border border-gray-700/50">
                <h3 className="font-bold mb-3 flex items-center gap-2 text-amber-300">
                  <span>💡</span> نکات مهم برای S20 FE:
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span>اگر تنظیمات باز نشد، دستی بروید:</span>
                  </li>
                  <li className="flex items-start gap-2 pl-6">
                    <span>⚡ از بالا به پایین بکشید</span>
                  </li>
                  <li className="flex items-start gap-2 pl-6">
                    <span>👆 آیکون بلوتوث را لمس نگه دارید</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-400 mt-1">•</span>
                    <span>پس از اتصال، حتما دکمه "تایید اتصال" را بزنید</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* پنل آهنگ‌ها و کنترل پخش */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/40 backdrop-blur-md rounded-2xl p-6 border border-gray-700/50 shadow-xl">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎶</span>
                </div>
                لیست آهنگ‌ها
              </h2>

              {/* لیست آهنگ‌ها */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {songs.map((song) => (
                  <div
                    key={song.id}
                    onClick={() => handleSongSelect(song)}
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-300 border-2 ${
                      selectedSong.id === song.id
                        ? 'border-purple-500 bg-gradient-to-br from-purple-900/40 to-pink-900/40 scale-[1.02]'
                        : 'border-gray-700/50 bg-gray-900/30 hover:bg-gray-800/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        selectedSong.id === song.id
                          ? 'bg-gradient-to-br from-purple-600 to-pink-600'
                          : 'bg-gray-800'
                      }`}>
                        <span className="text-xl">
                          {selectedSong.id === song.id ? '🎵' : '🎶'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold truncate">{song.title}</h3>
                        <p className="text-gray-400 text-sm truncate">{song.artist}</p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-gray-500 text-xs">{song.duration}</span>
                          {selectedSong.id === song.id && (
                            <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 px-2 py-1 rounded-full">
                              انتخاب شده
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* پنل کنترل پخش */}
              <div className="bg-gradient-to-br from-gray-900/60 to-gray-800/60 rounded-2xl p-6 border border-gray-700/50">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
                  <div className="relative">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                      <span className="text-3xl">🎵</span>
                    </div>
                    {isPlaying && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
                        <span className="text-xs">▶️</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-1 truncate">{selectedSong.title}</h3>
                    <p className="text-gray-400 mb-3">{selectedSong.artist}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-500">{formatTime(currentTime)}</span>
                      <div className="flex-1 h-1 bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                          style={{ width: `${duration ? (currentTime / duration) * 100 : 0}%` }}
                        ></div>
                      </div>
                      <span className="text-gray-500">{formatTime(duration)}</span>
                    </div>
                  </div>
                </div>

                {/* کنترل‌های اصلی */}
                <div className="space-y-6">
                  {/* نوار پیشرفت دقیق */}
                  <div>
                    <input
                      type="range"
                      min="0"
                      max={duration || 100}
                      value={currentTime}
                      onChange={handleSeek}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-purple-500 [&::-webkit-slider-thumb]:to-pink-500"
                    />
                  </div>

                  {/* دکمه‌های کنترل */}
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={togglePlay}
                        disabled={connectionStatus !== 'connected'}
                        className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl transition-all duration-300 ${
                          connectionStatus === 'connected'
                            ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 hover:scale-110 active:scale-95'
                            : 'bg-gray-700 cursor-not-allowed'
                        } shadow-lg`}
                      >
                        {isPlaying ? '⏸️' : '▶️'}
                      </button>
                      
                      <button
                        onClick={() => {
                          if (audioRef.current) {
                            audioRef.current.currentTime = 0;
                            if (isPlaying) {
                              audioRef.current.pause();
                              setIsPlaying(false);
                            }
                          }
                        }}
                        className="w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 flex items-center justify-center text-xl transition-all duration-300"
                      >
                        ⏹️
                      </button>
                      
                      <div className="text-sm">
                        <div className="text-gray-400">وضعیت پخش</div>
                        <div className={`font-medium ${isPlaying ? 'text-green-400' : 'text-red-400'}`}>
                          {isPlaying ? 'در حال پخش' : 'توقف'}
                        </div>
                      </div>
                    </div>

                    {/* کنترل ولوم */}
                    <div className="flex items-center gap-3 bg-gray-900/50 px-4 py-3 rounded-xl w-full md:w-auto">
                      <span className="text-gray-400">🔈</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={handleVolumeChange}
                        className="w-32 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gradient-to-r [&::-webkit-slider-thumb]:from-blue-500 [&::-webkit-slider-thumb]:to-blue-600"
                      />
                      <span className="text-gray-400">🔊</span>
                      <span className="w-10 text-center font-medium">
                        {Math.round(volume * 100)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* اطلاعات اضافی */}
                <div className="mt-6 pt-4 border-t border-gray-700/50">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-gray-900/30 rounded-lg">
                      <div className="text-gray-400 text-sm">کیفیت</div>
                      <div className="font-medium">MP3 320kbps</div>
                    </div>
                    <div className="p-3 bg-gray-900/30 rounded-lg">
                      <div className="text-gray-400 text-sm">تعداد آهنگ‌ها</div>
                      <div className="font-medium">{songs.length}</div>
                    </div>
                    <div className="p-3 bg-gray-900/30 rounded-lg">
                      <div className="text-gray-400 text-sm">پشتیبانی از</div>
                      <div className="font-medium">تمام اسپیکرها</div>
                    </div>
                    <div className="p-3 bg-gray-900/30 rounded-lg">
                      <div className="text-gray-400 text-sm">نیاز به</div>
                      <div className="font-medium">Bluetooth 4.0+</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* فوتر */}
        <div className="mt-6 text-center">
          <p className="text-gray-500 text-sm">
            برای گوشی Samsung Galaxy S20 FE - اگر تنظیمات باز نشد، از روش دستی استفاده کنید
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs px-3 py-1 bg-blue-900/30 text-blue-300 rounded-full">React</span>
            <span className="text-xs px-3 py-1 bg-purple-900/30 text-purple-300 rounded-full">Next.js</span>
            <span className="text-xs px-3 py-1 bg-green-900/30 text-green-300 rounded-full">Tailwind CSS</span>
            <span className="text-xs px-3 py-1 bg-amber-900/30 text-amber-300 rounded-full">Bluetooth</span>
          </div>
        </div>
      </div>
    </div>
  );
}