import React, { useState, useEffect, useCallback } from 'react';
import { Youtube, CalendarDays, PlayCircle, Radio, AlertCircle } from 'lucide-react';

export default function LiveCounter() {
    const [isLive, setIsLive] = useState(false);
    const [nextServiceStr, setNextServiceStr] = useState('');
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [latestVideos, setLatestVideos] = useState([]);
    const [isMounted, setIsMounted] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [apiError, setApiError] = useState(false);

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/youtube');
            if (!res.ok) throw new Error("Error interno");
            
            const data = await res.json();
            setLatestVideos(data.videos || []);
            setIsLive(data.isLive || false);
            
            localStorage.setItem('mca_yt_cache', JSON.stringify(data));
        } catch (error) {
            console.error("Error:", error);
            const cached = localStorage.getItem('mca_yt_cache');
            if (cached) {
                const parsed = JSON.parse(cached);
                setLatestVideos(parsed.videos || []);
                setIsLive(parsed.isLive || false);
            } else {
                setApiError(true);
            }
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
        const totalSeconds = hours * 3600 + minutes * 60 + colTime.getSeconds();

        let target = new Date(colTime);
        target.setMilliseconds(0); target.setSeconds(0);
        let info = '';

        if (day === 0 && totalSeconds < 34200) { target.setHours(9, 30, 0); info = 'Hoy 9:30 AM'; }
        else if (day === 2 && totalSeconds < 39600) { target.setHours(11, 0, 0); info = 'Hoy 11:00 AM'; }
        else if (day === 4 && totalSeconds < 68400) { target.setHours(19, 0, 0); info = 'Hoy 7:00 PM'; }
        else {
            const schedule = [{d:0,h:9,m:30,t:'Domingo 9:30 AM'},{d:2,h:11,m:0,t:'Martes 11:00 AM'},{d:4,h:19,m:0,t:'Jueves 7:00 PM'}];
            let next = schedule.find(s => s.d > day) || schedule[0];
            let diff = (next.d - day + 7) % 7;
            if (diff === 0 && totalSeconds >= (next.h*3600 + next.m*60)) diff = 7;
            target.setDate(target.getDate() + diff);
            target.setHours(next.h, next.m, 0);
            info = next.t;
        }

        const diffSeconds = Math.max(0, Math.floor((target - colTime) / 1000));
        setNextServiceStr(info);
        setTimeLeft({ hours: Math.floor(diffSeconds / 3600), minutes: Math.floor((diffSeconds % 3600) / 60), seconds: diffSeconds % 60 });
    }, []);

    useEffect(() => {
        setIsMounted(true);
        fetchData();
        const timer = setInterval(checkSchedule, 1000);
        return () => clearInterval(timer);
    }, [fetchData, checkSchedule]);

    if (!isMounted) return null;

    return (
        <section className="w-full max-w-7xl mx-auto py-12 px-4">
            <div className="bg-white rounded-[3rem] shadow-2xl border border-slate-100 flex flex-col lg:flex-row overflow-hidden min-h-[600px]">
                
                {/* Lado Izquierdo: Contador (35% de ancho) */}
                <div className="lg:w-[35%] p-8 lg:p-12 bg-slate-50/50 flex flex-col items-center justify-center text-center border-b lg:border-b-0 lg:border-r border-slate-100">
                    <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6">
                        <CalendarDays className="w-4 h-4 text-amber-500" /> Próximo Servicio
                    </span>
                    <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-10 tracking-tight leading-tight">{nextServiceStr}</h2>

                    {isLive ? (
                        <div className="w-full mb-10 rounded-3xl p-[2px] bg-gradient-to-r from-red-600 via-orange-500 to-red-600 animate-pulse">
                            <div className="bg-white rounded-[calc(1.5rem+2px)] p-8 flex flex-col items-center">
                                <Radio className="w-12 h-12 text-red-600 mb-3" />
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">¡En Vivo!</h3>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-4 mb-10">
                            {[{l:'HRS',v:timeLeft.hours},{l:'MIN',v:timeLeft.minutes},{l:'SEG',v:timeLeft.seconds}].map(t => (
                                <div key={t.l} className="text-center">
                                    <div className="w-20 h-20 sm:w-24 bg-white rounded-[2rem] shadow-sm border border-slate-200 flex items-center justify-center text-3xl font-black text-slate-900 mb-2">
                                        {t.v.toString().padStart(2, '0')}
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 tracking-widest">{t.l}</span>
                                </div>
                            ))}
                        </div>
                    )}

                    <a href="https://www.youtube.com/@PastorOmarSaiz" target="_blank" rel="noopener noreferrer" className="w-full flex items-center justify-center gap-3 bg-slate-950 text-white py-5 rounded-2xl hover:bg-red-600 transition-all font-bold text-xs uppercase tracking-widest shadow-lg group">
                        <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" /> Ver canal oficial
                    </a>
                </div>

                {/* Lado Derecho: Videos (65% de ancho) */}
                <div className="lg:w-[65%] p-8 lg:p-12 flex flex-col">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-3xl font-black text-slate-900 tracking-tight">Predicaciones Recientes</h3>
                            <p className="text-slate-500 text-sm font-medium italic">Edificando tu fe cada semana</p>
                        </div>
                    </div>

                    {/* Grid Dinámico - El primer video es más grande */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                        {isLoading ? (
                            <div className="col-span-full grid grid-cols-1 md:grid-cols-2 gap-6 h-full">
                                <div className="md:row-span-2 aspect-video md:aspect-auto bg-slate-100 animate-pulse rounded-[2.5rem]" />
                                <div className="aspect-video bg-slate-100 animate-pulse rounded-[2.5rem]" />
                                <div className="aspect-video bg-slate-100 animate-pulse rounded-[2.5rem]" />
                            </div>
                        ) : apiError ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-slate-400 border-2 border-dashed border-slate-100 rounded-[3rem]">
                                <AlertCircle className="w-12 h-12 mb-3 opacity-20" />
                                <p className="text-sm font-medium">Contenido no disponible en este momento</p>
                            </div>
                        ) : (
                            <>
                                {/* Video Principal (Grande) */}
                                {latestVideos[0] && (
                                    <a href={latestVideos[0].link} target="_blank" rel="noopener noreferrer" 
                                       className="md:row-span-2 group relative rounded-[2.5rem] overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 bg-slate-100">
                                        <img src={latestVideos[0].thumbnail} alt={latestVideos[0].title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                                        <div className="absolute inset-0 flex flex-col justify-end p-8">
                                            <div className="flex items-center gap-3 mb-3">
                                                <div className="p-3 bg-red-600 rounded-full shadow-lg group-hover:scale-110 transition-transform">
                                                    <PlayCircle className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="text-xs font-black text-white uppercase tracking-[0.2em]">Último mensaje</span>
                                            </div>
                                            <p className="text-xl lg:text-2xl text-white font-bold leading-tight line-clamp-3">{latestVideos[0].title}</p>
                                        </div>
                                    </a>
                                )}

                                {/* Videos Secundarios (Pequeños al lado) */}
                                <div className="grid grid-cols-1 gap-6 md:contents">
                                    {latestVideos.slice(1, 3).map(video => (
                                        <a key={video.id} href={video.link} target="_blank" rel="noopener noreferrer" 
                                           className="group relative rounded-[2rem] overflow-hidden aspect-video shadow-lg hover:shadow-xl transition-all duration-500 bg-slate-100">
                                            <img src={video.thumbnail} alt={video.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                                            <div className="absolute inset-0 flex flex-col justify-end p-6">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <PlayCircle className="w-4 h-4 text-red-500" />
                                                    <span className="text-[9px] font-black text-white uppercase tracking-widest">Reproducir</span>
                                                </div>
                                                <p className="text-sm lg:text-base text-white font-bold leading-tight line-clamp-2">{video.title}</p>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sincronizado con YouTube MCA</p>
                    </div>
                </div>
            </div>
        </section>
    );
}