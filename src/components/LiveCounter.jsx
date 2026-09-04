import React, { useState, useEffect, useCallback } from 'react';
import { Youtube, CalendarDays, Radio, AlertCircle, ChevronLeft, ChevronRight } from 'lucide-react';

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

        if (day === 0 && totalSeconds < 34200) { target.setHours(9, 30, 0); info = 'Domingo 9:30 am'; }
        else if (day === 2 && totalSeconds < 39600) { target.setHours(11, 0, 0); info = 'Martes 11:00 am'; }
        else if (day === 4 && totalSeconds < 68400) { target.setHours(19, 0, 0); info = 'Jueves 7:00 pm'; }
        else {
            const schedule = [{d:0,h:9,m:30,t:'Domingo 9:30 am'},{d:2,h:11,m:0,t:'Martes 11:00 am'},{d:4,h:19,m:0,t:'Jueves 7:00 pm'}];
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

    const displayVideos = latestVideos.length > 0 ? latestVideos.slice(0, 3) : [
        { id: '1', title: 'Reunión Principal MCA', link: 'https://www.youtube.com/@PastorOmarSaiz', thumbnail: '' },
        { id: '2', title: 'Mensaje Semanal MCA', link: 'https://www.youtube.com/@PastorOmarSaiz', thumbnail: '' },
        { id: '3', title: 'Enseñanza MCA', link: 'https://www.youtube.com/@PastorOmarSaiz', thumbnail: '' },
    ];

    return (
        <div className="w-full bg-white rounded-[2.5rem] md:rounded-[3.5rem] p-6 sm:p-8 md:p-12 shadow-2xl border border-slate-100 relative">
            {/* Estructura Visual Superior: Encabezado Centrado */}
            <div className="flex items-center justify-center gap-3 mb-8 md:mb-10">
                <div className="w-10 h-10 md:w-11 md:h-11 rounded-full bg-[#F5ECCB] border border-[#E8DAAA] flex items-center justify-center text-[#C59E3F] shadow-sm flex-shrink-0">
                    <Youtube className="w-5 h-5 md:w-6 md:h-6 text-[#C59E3F]" />
                </div>
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                    Novedades en el canal
                </h2>
            </div>

            {/* Grid de 3 miniaturas de YouTube con flechas laterales */}
            <div className="relative px-2 sm:px-6">
                {/* Flecha izquierda */}
                <button 
                    type="button"
                    aria-label="Anterior"
                    className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-10 text-slate-800 hover:text-black transition-colors"
                >
                    <ChevronLeft className="w-7 h-7 stroke-[2.5]" />
                </button>

                {/* Grid 3 miniaturas */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 items-center">
                    {isLoading ? (
                        <>
                            <div className="p-2.5 bg-[#B2CBD9] rounded-[30px]">
                                <div className="aspect-video bg-slate-200/80 animate-pulse rounded-[22px]" />
                            </div>
                            <div className="aspect-video bg-slate-200 animate-pulse rounded-[26px]" />
                            <div className="aspect-video bg-slate-200 animate-pulse rounded-[26px]" />
                        </>
                    ) : apiError && latestVideos.length === 0 ? (
                        <div className="col-span-full flex flex-col items-center justify-center py-12 text-slate-400 border-2 border-dashed border-slate-200 rounded-[2.5rem]">
                            <AlertCircle className="w-10 h-10 mb-2 opacity-30 text-amber-500" />
                            <p className="text-sm font-medium">Contenido no disponible temporalmente</p>
                        </div>
                    ) : (
                        displayVideos.map((video, index) => {
                            const isFirst = index === 0;
                            const cardContent = (
                                <a 
                                    key={video.id || index}
                                    href={video.link}
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block w-full h-full group"
                                >
                                    <div className={`relative aspect-video w-full overflow-hidden shadow-md group-hover:shadow-xl transition-all duration-300 ${
                                        isFirst ? 'rounded-[20px]' : 'rounded-[26px]'
                                    } bg-slate-100`}>
                                        {video.thumbnail ? (
                                            <img 
                                                src={video.thumbnail} 
                                                alt={video.title} 
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center p-4 text-center">
                                                <span className="text-white text-xs font-semibold">{video.title}</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors duration-300" />
                                    </div>
                                </a>
                            );

                            if (isFirst) {
                                return (
                                    <div key={video.id || index} className="p-2.5 bg-[#B2CBD9] rounded-[30px] shadow-sm">
                                        {cardContent}
                                    </div>
                                );
                            }

                            return cardContent;
                        })
                    )}
                </div>

                {/* Flecha derecha */}
                <button 
                    type="button"
                    aria-label="Siguiente"
                    className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-10 text-slate-800 hover:text-black transition-colors"
                >
                    <ChevronRight className="w-7 h-7 stroke-[2.5]" />
                </button>
            </div>

            {/* Estructura Visual Inferior: Próxima reunión */}
            <div className="mt-12 md:mt-16 flex flex-col md:flex-row items-center justify-center gap-6 md:gap-14 lg:gap-20">
                {/* Texto del horario con icono de calendario a la izquierda */}
                <div className="flex flex-col items-center md:items-start text-center md:text-left">
                    <div className="flex items-center gap-2.5 mb-1">
                        <div className="w-8 h-8 rounded-full bg-[#F5ECCB] border border-[#E8DAAA] flex items-center justify-center text-[#C59E3F] shadow-sm flex-shrink-0">
                            <CalendarDays className="w-4 h-4 text-[#C59E3F]" />
                        </div>
                        <span className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight">
                            Próxima reunión
                        </span>
                    </div>
                    <h3 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
                        {nextServiceStr || 'Domingo 9:30 am'}
                    </h3>
                </div>

                {/* Contenedor tipo píldora beige con contador en tarjetas blancas */}
                <div className="bg-[#EFE5C9] rounded-full p-3 px-6 md:p-4 md:px-8 shadow-sm flex items-center gap-3 md:gap-4">
                    {isLive ? (
                        <div className="px-6 py-3 bg-white rounded-full flex items-center gap-3 text-red-600 font-extrabold text-base md:text-lg animate-pulse shadow-sm">
                            <Radio className="w-5 h-5 text-red-600" />
                            <span>¡EN VIVO AHORA!</span>
                        </div>
                    ) : (
                        [
                            { label: 'Hrs', value: timeLeft.hours },
                            { label: 'Min', value: timeLeft.minutes },
                            { label: 'Seg', value: timeLeft.seconds }
                        ].map((item) => (
                            <div 
                                key={item.label} 
                                className="bg-white rounded-[20px] md:rounded-[24px] w-16 h-20 md:w-20 md:h-24 shadow-sm flex flex-col items-center justify-center p-2 text-center"
                            >
                                <span className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                                    {item.value.toString().padStart(2, '0')}
                                </span>
                                <span className="text-[11px] md:text-xs font-semibold text-[#8C7A5B] mt-0.5">
                                    {item.label}
                                </span>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}