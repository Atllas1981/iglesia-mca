import React, { useState, useEffect } from 'react';
import { Video, CalendarDays, Clock, Loader2, Youtube, PlayCircle } from 'lucide-react';

// Datos de conexión verificados
const API_KEY = 'AIzaSyCjtEsPqLHeGDxYT_Xbd4s_vf3JKKmN8YM';
const CHANNEL_ID = 'UCI9sYIUG13W13rBGSPI_yBQ';

export default function LiveCounter() {
    const [isLive, setIsLive] = useState(false);
    const [nextServiceStr, setNextServiceStr] = useState('');
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [latestVideos, setLatestVideos] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsMounted(true);

        const fetchData = async () => {
            try {
                // CAMBIO TÉCNICO: Usamos la lista de "Subidas" (UU) en lugar de búsqueda (UC)
                const uploadsPlaylistId = CHANNEL_ID.replace('UC', 'UU');

                const vRes = await fetch(
                    `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=3&key=${API_KEY}`
                );
                const vData = await vRes.json();

                if (vData.items && vData.items.length > 0) {
                    const formatted = vData.items.map(item => ({
                        id: item.snippet.resourceId.videoId,
                        title: item.snippet.title,
                        thumbnail: item.snippet.thumbnails?.high?.url || item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url || '',
                        link: `https://www.youtube.com/watch?v=${item.snippet.resourceId.videoId}`
                    }));
                    setLatestVideos(formatted);
                }

                // Verificar "En Vivo"
                const lRes = await fetch(
                    `https://www.googleapis.com/youtube/v3/search?part=snippet&channelId=${CHANNEL_ID}&type=video&eventType=live&key=${API_KEY}`
                );
                const lData = await lRes.json();
                setIsLive(lData.items && lData.items.length > 0);

            } catch (error) {
                console.error("Error en YouTube API:", error);
            } finally {
                setIsLoading(false);
            }
        };

        const checkSchedule = () => {
            const now = new Date();
            const colTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Bogota" }));
            const day = colTime.getDay();
            const hours = colTime.getHours();
            const minutes = colTime.getMinutes();
            const timeInSeconds = hours * 3600 + minutes * 60 + colTime.getSeconds();

            let nextInfo = '';
            const getNextDate = () => {
                const next = new Date(colTime);
                next.setMilliseconds(0);
                if (day === 0 && timeInSeconds < 34200) { next.setHours(9, 30, 0); nextInfo = 'Hoy 9:30 AM'; }
                else if (day === 2 && timeInSeconds < 39600) { next.setHours(11, 0, 0); nextInfo = 'Hoy 11:00 AM'; }
                else if (day === 4 && timeInSeconds < 68400) { next.setHours(19, 0, 0); nextInfo = 'Hoy 7:00 PM'; }
                else {
                    if (day >= 4) { next.setDate(next.getDate() + (7 - day || 7)); next.setHours(9, 30, 0); nextInfo = 'Domingo 9:30 AM'; }
                    else if (day >= 2) { next.setDate(next.getDate() + (4 - day)); next.setHours(19, 0, 0); nextInfo = 'Jueves 7:00 PM'; }
                    else { next.setDate(next.getDate() + (2 - day)); next.setHours(11, 0, 0); nextInfo = 'Martes 11:00 AM'; }
                }
                return next;
            };

            const target = getNextDate();
            const diff = Math.max(0, Math.floor((target - colTime) / 1000));
            setNextServiceStr(nextInfo);
            setTimeLeft({
                hours: Math.floor(diff / 3600),
                minutes: Math.floor((diff % 3600) / 60),
                seconds: diff % 60
            });
        };

        fetchData();
        checkSchedule();
        const interval = setInterval(checkSchedule, 1000);
        return () => clearInterval(interval);
    }, []);

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

                {/* Lado Derecho: Videos Reales */}
                <div className="lg:w-3/5 p-10 bg-white">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                            Últimas Predicaciones
                        </h3>
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
                                    <img src={video.thumbnail} alt="Predicación" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
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