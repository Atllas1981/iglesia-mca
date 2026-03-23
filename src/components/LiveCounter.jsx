import React, { useState, useEffect, useCallback } from 'react';
import { Youtube, CalendarDays, PlayCircle, Loader2, Radio } from 'lucide-react';

// Configuración
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

            if (vData.items && vData.items.length > 0) {
                const formatted = vData.items.map(item => ({
                    id: item.snippet.resourceId.videoId,
                    title: item.snippet.title,
                    thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || '',
                    link: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
                }));

                const latestId = formatted[0].id;
                const statusRes = await fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${latestId}&key=${API_KEY}`
                );
                const statusData = await statusRes.json();
                const currentStatus = statusData.items?.[0]?.snippet?.liveBroadcastContent === 'live';

                localStorage.setItem('mca_yt_cache', JSON.stringify({ videos: formatted, isLive: currentStatus }));
                localStorage.setItem('mca_yt_time', now.toString());

                setLatestVideos(formatted);
                setIsLive(currentStatus);
            }
        } catch (error) {
            console.error("Error en YouTube API:", error);
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
        const timeInSeconds = hours * 3600 + minutes * 60 + colTime.getSeconds();

        let nextInfo = '';
        const getTargetDate = () => {
            const target = new Date(colTime);
            target.setMilliseconds(0);
            target.setSeconds(0);

            if (day === 0 && timeInSeconds < 34200) { 
                target.setHours(9, 30, 0);
                nextInfo = 'Hoy 9:30 AM';
            } else if (day === 2 && timeInSeconds < 39600) { 
                target.setHours(11, 0, 0);
                nextInfo = 'Hoy 11:00 AM';
            } else if (day === 4 && timeInSeconds < 68400) { 
                target.setHours(19, 0, 0);
                nextInfo = 'Hoy 7:00 PM';
            } else {
                if (day === 0 || day === 1) {
                    const diff = (2 - day + 7) % 7;
                    target.setDate(target.getDate() + (diff === 0 ? 7 : diff));
                    target.setHours(11, 0, 0);
                    nextInfo = 'Martes 11:00 AM';
                } else if (day === 2 || day === 3) {
                    const diff = (4 - day + 7) % 7;
                    target.setDate(target.getDate() + (diff === 0 ? 7 : diff));
                    target.setHours(19, 0, 0);
                    nextInfo = 'Jueves 7:00 PM';
                } else {
                    const diff = (0 - day + 7) % 7;
                    target.setDate(target.getDate() + (diff === 0 ? 7 : diff));
                    target.setHours(9, 30, 0);
                    nextInfo = 'Domingo 9:30 AM';
                }
            }
            return target;
        };

        const targetDate = getTargetDate();
        const diffSeconds = Math.max(0, Math.floor((targetDate - colTime) / 1000));
        
        setNextServiceStr(nextInfo);
        setTimeLeft({
            hours: Math.floor(diffSeconds / 3600),
            minutes: Math.floor((diffSeconds % 3600) / 60),
            seconds: diffSeconds % 60
        });
    }, []);

    useEffect(() => {
        setIsMounted(true);
        fetchData();
        checkSchedule();
        const interval = setInterval(checkSchedule, 1000);
        return () => clearInterval(interval);
    }, [fetchData, checkSchedule]);

    if (!isMounted) return null;

    return (
        <div className="w-full max-w-6xl mx-auto py-8 px-4 font-sans">
            <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-100 transition-all duration-500">
                
                {/* Lado Izquierdo: Estado / Contador */}
                <div className="lg:w-2/5 p-8 lg:p-12 bg-slate-50/50 flex flex-col items-center justify-center text-center border-r border-slate-100">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-amber-500" />
                        Próximo Servicio
                    </p>
                    <h2 className="text-3xl font-black text-slate-800 mb-10 tracking-tight">{nextServiceStr}</h2>

                    {isLive ? (
                        /* ESTADO EN VIVO OPTIMIZADO */
                        <div className="relative w-full mb-10 overflow-hidden rounded-[2rem] p-[3px] bg-gradient-to-r from-red-600 via-amber-500 to-red-600 bg-[length:200%_auto] animate-gradient shadow-[0_15px_40px_-10px_rgba(220,38,38,0.3)]">
                            <div className="bg-white rounded-[calc(2rem-3px)] p-8 flex flex-col items-center justify-center relative overflow-hidden">
                                {/* Texturas de fondo */}
                                <div className="absolute -top-12 -right-12 w-32 h-32 bg-red-100 rounded-full blur-3xl opacity-60" />
                                <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-amber-100 rounded-full blur-3xl opacity-60" />
                                
                                <div className="relative z-10">
                                    <div className="relative mb-4 inline-block">
                                        <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
                                        <div className="relative w-16 h-16 bg-red-600 rounded-full flex items-center justify-center shadow-lg shadow-red-200">
                                            <Radio className="w-8 h-8 text-white animate-pulse" />
                                        </div>
                                    </div>
                                    <h3 className="text-3xl font-black text-slate-800 tracking-tighter">
                                        ¡ESTAMOS <span className="text-red-600">EN VIVO</span>!
                                    </h3>
                                    <p className="text-slate-400 text-[10px] font-bold mt-2 uppercase tracking-widest">Sintoniza ahora mismo</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* CONTADOR OPTIMIZADO */
                        <div className="flex gap-3 mb-12">
                            {[{ l: 'HRS', v: timeLeft.hours }, { l: 'MIN', v: timeLeft.minutes }, { l: 'SEG', v: timeLeft.seconds }].map((t) => (
                                <div key={t.l} className="flex flex-col items-center">
                                    <div className="w-20 h-20 bg-white rounded-3xl shadow-sm border border-slate-200 flex items-center justify-center text-3xl font-black text-slate-800 mb-2 ring-4 ring-transparent hover:ring-slate-100 transition-all">
                                        {t.v.toString().padStart(2, '0')}
                                    </div>
                                    <span className="text-[10px] font-black text-slate-400 tracking-widest">{t.l}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <a href="https://www.youtube.com/@PastorOmarSaiz" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex items-center justify-center gap-3 w-full bg-slate-900 text-white py-5 rounded-[1.5rem] hover:bg-red-600 transition-all duration-300 font-black shadow-xl shadow-slate-200 hover:shadow-red-200 uppercase text-xs tracking-widest group">
                        <Youtube className="w-5 h-5 transition-transform group-hover:scale-125" />
                        Ir al Servicio en Vivo
                    </a>
                </div>

                {/* Lado Derecho: Predicaciones Recientes */}
                <div className="lg:w-3/5 p-8 lg:p-12">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Recientes</h3>
                        <div className="h-px flex-1 mx-6 bg-slate-100 hidden sm:block" />
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">MCA Channel</span>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="aspect-video bg-slate-100 animate-pulse rounded-[1.5rem]" />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {latestVideos.map((video, index) => (
                                <a key={video.id} href={video.link} target="_blank" rel="noopener noreferrer"
                                   className={`group relative rounded-[1.5rem] overflow-hidden aspect-video bg-slate-100 shadow-lg transition-all duration-500 
                                   ${index === 0 && isLive ? 'ring-4 ring-red-500 ring-offset-4 scale-[1.02] shadow-red-100' : 'hover:-translate-y-2'}`}>
                                    
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    
                                    {/* Overlay con gradiente */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
                                    
                                    {/* Icono Play Central */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                                            <PlayCircle className="w-6 h-6 text-white" />
                                        </div>
                                    </div>

                                    {/* Badge En Vivo (Solo para el primero si aplica) */}
                                    {index === 0 && isLive && (
                                        <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 bg-red-600 rounded-full shadow-lg">
                                            <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                            <span className="text-[8px] font-black text-white uppercase tracking-tighter">Live</span>
                                        </div>
                                    )}

                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <p className="text-white text-[10px] font-bold line-clamp-2 leading-tight group-hover:text-amber-400 transition-colors">
                                            {video.title}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}