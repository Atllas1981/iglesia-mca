import React, { useState, useEffect, useCallback } from 'react';
import { Youtube, CalendarDays, PlayCircle, Loader2 } from 'lucide-react';

// Configuración (Asegúrate de que la API KEY esté restringida en Google Cloud)
const API_KEY = import.meta.env.PUBLIC_YOUTUBE_API_KEY;
const CHANNEL_ID = 'UCI9sYIUG13W13rBGSPI_yBQ';

export default function LiveCounter() {
    const [isLive, setIsLive] = useState(false);
    const [nextServiceStr, setNextServiceStr] = useState('');
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [latestVideos, setLatestVideos] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    // 1. Obtención de datos con SISTEMA DE CACHÉ (Protección de cuota)
    const fetchData = useCallback(async () => {
        if (!API_KEY) {
            console.error("API Key no detectada.");
            setIsLoading(false);
            return;
        }

        // Revisar caché en localStorage
        const cachedData = localStorage.getItem('mca_yt_cache');
        const cachedTime = localStorage.getItem('mca_yt_time');
        const now = Date.now();

        // Si los datos tienen menos de 30 minutos, no llamar a la API
        if (cachedData && cachedTime && (now - parseInt(cachedTime) < 30 * 60 * 1000)) {
            const parsed = JSON.parse(cachedData);
            setLatestVideos(parsed.videos);
            setIsLive(parsed.isLive);
            setIsLoading(false);
            return;
        }

        try {
            const uploadsPlaylistId = CHANNEL_ID.replace('UC', 'UU');
            
            // Petición A: Últimos 3 videos
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

                // Petición B: Verificar estado "En Vivo" del video más reciente
                const latestId = formatted[0].id;
                const statusRes = await fetch(
                    `https://www.googleapis.com/youtube/v3/videos?part=snippet&id=${latestId}&key=${API_KEY}`
                );
                const statusData = await statusRes.json();
                const currentStatus = statusData.items?.[0]?.snippet?.liveBroadcastContent === 'live';

                // Guardar en Caché
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

    // 2. Lógica de horarios (Colombia Time)
    const checkSchedule = useCallback(() => {
        const now = new Date();
        const colTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
        const day = colTime.getDay(); // 0: Dom, 2: Mar, 4: Jue
        const hours = colTime.getHours();
        const minutes = colTime.getMinutes();
        const timeInSeconds = hours * 3600 + minutes * 60 + colTime.getSeconds();

        let nextInfo = '';
        const getTargetDate = () => {
            const target = new Date(colTime);
            target.setMilliseconds(0);
            target.setSeconds(0);

            if (day === 0 && timeInSeconds < 34200) { // Dom < 9:30 AM
                target.setHours(9, 30, 0);
                nextInfo = 'Hoy 9:30 AM';
            } else if (day === 2 && timeInSeconds < 39600) { // Mar < 11:00 AM
                target.setHours(11, 0, 0);
                nextInfo = 'Hoy 11:00 AM';
            } else if (day === 4 && timeInSeconds < 68400) { // Jue < 7:00 PM
                target.setHours(19, 0, 0);
                nextInfo = 'Hoy 7:00 PM';
            } else {
                if (day === 0 || day === 1) { // Próximo: Martes
                    const diff = (2 - day + 7) % 7;
                    target.setDate(target.getDate() + (diff === 0 ? 7 : diff));
                    target.setHours(11, 0, 0);
                    nextInfo = 'Martes 11:00 AM';
                } else if (day === 2 || day === 3) { // Próximo: Jueves
                    const diff = (4 - day + 7) % 7;
                    target.setDate(target.getDate() + (diff === 0 ? 7 : diff));
                    target.setHours(19, 0, 0);
                    nextInfo = 'Jueves 7:00 PM';
                } else { // Próximo: Domingo
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
            <div className="bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col lg:flex-row border border-slate-100">
                
                {/* Lado Izquierdo: Contador */}
                <div className="lg:w-2/5 p-10 bg-slate-50 flex flex-col items-center justify-center text-center border-r border-slate-100">
                    <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-amber-500" />
                        Próximo Servicio
                    </p>
                    <h2 className="text-3xl font-black text-slate-800 mb-8">{nextServiceStr}</h2>

                    <div className="flex gap-4 mb-10">
                        {[{ l: 'HORAS', v: timeLeft.hours }, { l: 'MIN', v: timeLeft.minutes }, { l: 'SEG', v: timeLeft.seconds }].map((t) => (
                            <div key={t.l} className="flex flex-col items-center">
                                <div className="w-20 h-20 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center text-3xl font-black text-slate-800 mb-2">
                                    {t.v.toString().padStart(2, '0')}
                                </div>
                                <span className="text-[10px] font-bold text-slate-400">{t.l}</span>
                            </div>
                        ))}
                    </div>

                    <a href="https://www.youtube.com/@PastorOmarSaiz" 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="flex items-center justify-center gap-2 w-full bg-white text-slate-700 py-4 rounded-2xl border border-slate-200 hover:bg-slate-900 hover:text-white hover:border-slate-900 transition-all font-bold shadow-sm group">
                        <Youtube className="w-5 h-5 text-red-600 group-hover:text-white" />
                        Ver Canal Oficial
                    </a>
                </div>

                {/* Lado Derecho: Videos */}
                <div className="lg:w-3/5 p-10 bg-white">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-slate-800">Últimas Predicaciones</h3>
                        {isLive && (
                            <span className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded-full text-[10px] font-black animate-pulse">
                                EN VIVO
                            </span>
                        )}
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => <div key={i} className="aspect-video bg-slate-100 animate-pulse rounded-xl" />)}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            {latestVideos.map((video) => (
                                <a key={video.id} href={video.link} target="_blank" rel="noopener noreferrer"
                                   className="group relative rounded-xl overflow-hidden aspect-video bg-slate-100 shadow-md hover:shadow-xl transition-all">
                                    <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent flex flex-col justify-end p-3">
                                        <PlayCircle className="w-8 h-8 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all" />
                                        <p className="text-white text-[10px] font-bold line-clamp-2 leading-tight">{video.title}</p>
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