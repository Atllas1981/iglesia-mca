import React, { useState, useEffect, useCallback } from 'react';
import { Youtube, CalendarDays, PlayCircle, Radio } from 'lucide-react';

const API_KEY = import.meta.env.PUBLIC_YOUTUBE_API_KEY;
const CHANNEL_ID = 'UCI9sYIUG13W13rBGSPI_yBQ';

export default function LiveCounter() {
    const [isLive, setIsLive] = useState(false);
    const [nextServiceStr, setNextServiceStr] = useState('');
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [latestVideos, setLatestVideos] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = useCallback(async () => {
        if (!API_KEY) {
            console.warn("YouTube API Key no configurada");
            setIsLoading(false);
            return;
        }

        const cachedData = localStorage.getItem('mca_yt_cache');
        const cachedTime = localStorage.getItem('mca_yt_time');
        const now = Date.now();

        if (cachedData && cachedTime && (now - parseInt(cachedTime) < 30 * 60 * 1000)) {
            const parsed = JSON.parse(cachedData);
            setLatestVideos(parsed.videos);
            setIsLive(parsed.isLive);
            setIsLoading(false);
            return;
        }

        try {
            const uploadsPlaylistId = CHANNEL_ID.replace('UC', 'UU');
            const vRes = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=3&key=${API_KEY}`
            );
            const vData = await vRes.json();

            if (vData.items) {
                const formatted = vData.items.map(item => ({
                    id: item.snippet.resourceId.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails?.high?.url || '',
                    link: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
                }));

                const latestId = formatted[0]?.id;
                let currentStatus = false;

                if (latestId) {
                    const statusRes = await fetch(
                        `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${latestId}&key=${API_KEY}`
                    );
                    const statusData = await statusRes.json();
                    currentStatus = statusData.items?.[0]?.snippet?.liveBroadcastContent === 'live';
                }

                localStorage.setItem('mca_yt_cache', JSON.stringify({ videos: formatted, isLive: currentStatus }));
                localStorage.setItem('mca_yt_time', now.toString());
                setLatestVideos(formatted);
                setIsLive(currentStatus);
            }
        } catch (error) {
            console.error("Error API YouTube:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const checkSchedule = useCallback(() => {
        const now = new Date();
        const colTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
        const day = colTime.getDay(); 
        const hours = colTime.getHours();
        const minutes = colTime.getMinutes();
        const seconds = colTime.getSeconds();
        const totalSeconds = hours * 3600 + minutes * 60 + seconds;

        let target = new Date(colTime);
        target.setMilliseconds(0); target.setSeconds(0);
        let info = '';

        // Lógica de horarios MCA
        if (day === 0 && totalSeconds < 34200) { // Domingo antes 9:30 AM
            target.setHours(9, 30, 0); info = 'Hoy 9:30 AM';
        } else if (day === 2 && totalSeconds < 39600) { // Martes antes 11:00 AM
            target.setHours(11, 0, 0); info = 'Hoy 11:00 AM';
        } else if (day === 4 && totalSeconds < 68400) { // Jueves antes 7:00 PM
            target.setHours(19, 0, 0); info = 'Hoy 7:00 PM';
        } else {
            // Calcular próximo día
            const schedule = [
                { d: 0, h: 9, m: 30, txt: 'Domingo 9:30 AM' },
                { d: 2, h: 11, m: 0, txt: 'Martes 11:00 AM' },
                { d: 4, h: 19, m: 0, txt: 'Jueves 7:00 PM' }
            ];
            
            let next = schedule.find(s => s.d > day) || schedule[0];
            let daysDiff = (next.d - day + 7) % 7;
            if (daysDiff === 0) daysDiff = 7;
            
            target.setDate(target.getDate() + daysDiff);
            target.setHours(next.h, next.m, 0);
            info = next.txt;
        }

        const diff = Math.max(0, Math.floor((target - colTime) / 1000));
        setNextServiceStr(info);
        setTimeLeft({
            hours: Math.floor(diff / 3600),
            minutes: Math.floor((diff % 3600) / 60),
            seconds: diff % 60
        });
    }, []);

    useEffect(() => {
        setIsMounted(true);
        fetchData();
        const timer = setInterval(checkSchedule, 1000);
        return () => clearInterval(timer);
    }, [fetchData, checkSchedule]);

    if (!isMounted) return null;

    return (
        <section className="w-full max-w-6xl mx-auto py-12 px-4">
            <div className="bg-white rounded-3xl shadow-xl border border-slate-100 flex flex-col lg:flex-row overflow-hidden">
                
                {/* Lado Izquierdo: Contador */}
                <div className="lg:w-2/5 p-8 lg:p-12 bg-slate-50/50 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-slate-100">
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">
                        <CalendarDays className="w-4 h-4 text-amber-500" />
                        Próximo Servicio
                    </span>
                    <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">{nextServiceStr}</h2>

                    {isLive ? (
                        <div className="w-full mb-8 rounded-2xl p-[2px] bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-[length:200%_auto] animate-gradient shadow-lg shadow-red-100">
                            <div className="bg-white rounded-[calc(1rem+4px)] p-6 flex flex-col items-center">
                                <Radio className="w-10 h-10 text-red-600 animate-pulse mb-2" />
                                <h3 className="text-xl font-black text-slate-800">¡EN VIVO AHORA!</h3>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-4 mb-8">
                            {[
                                { l: 'HRS', v: timeLeft.hours },
                                { l: 'MIN', v: timeLeft.minutes },
                                { l: 'SEG', v: timeLeft.seconds }
                            ].map(t => (
                                <div key={t.l} className="text-center">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-2xl sm:text-3xl font-black text-slate-800 mb-1">
                                        {t.v.toString().padStart(2, '0')}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400">{t.l}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <a href="https://www.youtube.com/@PastorOmarSaiz" target="_blank" className="w-full flex items-center justify-center gap-3 bg-slate-900 text-white py-4 rounded-xl hover:bg-red-600 transition-all font-bold text-xs uppercase tracking-widest group">
                        <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
                        Ver canal oficial
                    </a>
                </div>

                {/* Lado Derecho: Videos */}
                <div className="lg:w-3/5 p-8 lg:p-12">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-slate-800">Predicaciones Recientes</h3>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">YouTube MCA</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {isLoading ? (
                            [1, 2, 3].map(i => <div key={i} className="aspect-video bg-slate-100 animate-pulse rounded-xl" />)
                        ) : (
                            latestVideos.map(video => (
                                <a key={video.id} href={video.link} target="_blank" className="group relative rounded-xl overflow-hidden aspect-video bg-slate-200 shadow-md">
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
                                    <PlayCircle className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-white/50 group-hover:text-white group-hover:scale-110 transition-all" />
                                    <p className="absolute bottom-2 left-2 right-2 text-[10px] text-white font-medium line-clamp-1">{video.title}</p>
                                </a>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
}