import React, { useState, useEffect } from 'react';
import { Video, CalendarDays, Clock, Loader2, Youtube, PlayCircle } from 'lucide-react';

// Fallback latest videos
const LATEST_VIDEOS = [
    {
        id: "1",
        title: "Servicio Dominical - MCA",
        thumbnail: "https://images.unsplash.com/photo-1438283173091-5dbf5c5a3206?q=80&w=600&auto=format&fit=crop",
        link: "https://www.youtube.com/@PastorOmarSaiz/streams"
    },
    {
        id: "2",
        title: "Servicio de Milagros y Sanidad",
        thumbnail: "https://images.unsplash.com/photo-1444065707204-12decac917e8?q=80&w=600&auto=format&fit=crop",
        link: "https://www.youtube.com/@PastorOmarSaiz/streams"
    },
    {
        id: "3",
        title: "Ensenanza de la Palabra",
        thumbnail: "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=600&auto=format&fit=crop",
        link: "https://www.youtube.com/@PastorOmarSaiz/streams"
    }
];

export default function LiveCounter() {
    const [isLive, setIsLive] = useState(false);
    const [nextServiceStr, setNextServiceStr] = useState('');
    const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        console.log('React MCA Activo');

        const checkSchedule = () => {
            const now = new Date();
            const colTimeStr = now.toLocaleString("en-US", { timeZone: "America/Bogota" });
            const colTime = new Date(colTimeStr);

            const day = colTime.getDay(); // 0 = Sunday, 2 = Tuesday, 4 = Thursday
            const hours = colTime.getHours();
            const minutes = colTime.getMinutes();
            const seconds = colTime.getSeconds();
            const timeInSeconds = hours * 3600 + minutes * 60 + seconds;

            let live = false;
            let nextInfo = '';

            // Calculate current day's live status and next service display text
            if (day === 0) {
                if (timeInSeconds >= 34200 && timeInSeconds <= 41400) live = true;
                else if (timeInSeconds < 34200) { nextInfo = 'Hoy 9:30 AM'; }
                else { nextInfo = 'Martes 11:00 AM'; }
            } else if (day === 1) {
                nextInfo = 'Martes 11:00 AM';
            } else if (day === 2) {
                if (timeInSeconds >= 39600 && timeInSeconds <= 46800) live = true;
                else if (timeInSeconds < 39600) { nextInfo = 'Hoy 11:00 AM'; }
                else { nextInfo = 'Jueves 7:00 PM'; }
            } else if (day === 3) {
                nextInfo = 'Jueves 7:00 PM';
            } else if (day === 4) {
                if (timeInSeconds >= 68400 && timeInSeconds <= 75600) live = true;
                else if (timeInSeconds < 68400) { nextInfo = 'Hoy 7:00 PM'; }
                else { nextInfo = 'Domingo 9:30 AM'; }
            } else if (day === 5) {
                nextInfo = 'Domingo 9:30 AM';
            } else if (day === 6) {
                nextInfo = 'Domingo 9:30 AM';
            }

            // To be bulletproof, let's find the absolute Date of the next service.
            const getNextServiceDate = () => {
                const next = new Date(colTime);
                next.setMilliseconds(0);
                if (day === 0 && timeInSeconds < 34200) { next.setHours(9, 30, 0); }
                else if (day === 0) { next.setDate(next.getDate() + 2); next.setHours(11, 0, 0); }
                else if (day === 1) { next.setDate(next.getDate() + 1); next.setHours(11, 0, 0); }
                else if (day === 2 && timeInSeconds < 39600) { next.setHours(11, 0, 0); }
                else if (day === 2) { next.setDate(next.getDate() + 2); next.setHours(19, 0, 0); }
                else if (day === 3) { next.setDate(next.getDate() + 1); next.setHours(19, 0, 0); }
                else if (day === 4 && timeInSeconds < 68400) { next.setHours(19, 0, 0); }
                else if (day === 4) { next.setDate(next.getDate() + 3); next.setHours(9, 30, 0); }
                else if (day === 5) { next.setDate(next.getDate() + 2); next.setHours(9, 30, 0); }
                else if (day === 6) { next.setDate(next.getDate() + 1); next.setHours(9, 30, 0); }
                return next;
            };

            const targetDate = getNextServiceDate();
            const diffSecs = Math.max(0, Math.floor((targetDate.getTime() - colTime.getTime()) / 1000));

            const hrs = Math.floor(diffSecs / 3600);
            const mns = Math.floor((diffSecs % 3600) / 60);
            const scs = diffSecs % 60;

            setIsLive(live);
            setNextServiceStr(nextInfo);
            setTimeLeft({ hours: hrs, minutes: mns, seconds: scs });
        };

        checkSchedule();
        const interval = setInterval(checkSchedule, 1000); // Check every second
        return () => clearInterval(interval);
    }, []);

    const formatNum = (num) => num.toString().padStart(2, '0');

    if (!isMounted) {
        return (
            <div className="w-full max-w-5xl mx-auto py-12 relative z-50 px-6">
                <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100 flex flex-col items-center justify-center min-h-[300px]">
                    <Loader2 className="w-10 h-10 text-mca-blue animate-spin mb-4" />
                    <p className="text-slate-500 font-medium text-lg">Sincronizando horarios...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-6xl mx-auto py-4 relative z-50 px-4">
            <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 flex flex-col lg:flex-row">

                {/* Left Side: Counter / Live Status */}
                <div className="lg:w-2/5 p-8 lg:p-10 flex flex-col items-center justify-center bg-slate-50 border-r border-slate-100">
                    {isLive ? (
                        <div className="w-full flex flex-col items-center text-center">
                            <div className="flex items-center gap-2 mb-4 px-5 py-2 bg-red-50 text-red-600 rounded-full text-sm font-bold tracking-wide">
                                <span className="w-3 h-3 rounded-full bg-red-600 animate-ping absolute"></span>
                                <span className="w-3 h-3 rounded-full bg-red-600 relative"></span>
                                <span className="font-title">EN VIVO AHORA</span>
                            </div>
                            <h3 className="text-2xl font-title font-bold text-slate-800 mb-6">Estamos transmitiendo</h3>
                            <a
                                href="https://www.youtube.com/@PastorOmarSaiz/streams"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-3 w-full bg-mca-blue text-white py-4 rounded-xl transition-all hover:bg-blue-900 hover:shadow-lg transform hover:-translate-y-0.5 shadow-blue-900/20"
                            >
                                <Video className="w-6 h-6" />
                                <span className="font-title font-bold text-lg tracking-wide">Unirse ahora</span>
                            </a>
                        </div>
                    ) : (
                        <div className="w-full text-center">
                            <p className="text-slate-500 text-sm font-semibold mb-2 uppercase tracking-wider flex items-center justify-center gap-2">
                                <CalendarDays className="w-4 h-4 text-mca-gold" />
                                Próximo Servicio
                            </p>
                            <h3 className="font-title text-2xl font-extrabold text-slate-800 mb-8">
                                {nextServiceStr}
                            </h3>

                            {/* Countdown Timer */}
                            <div className="flex justify-center gap-2 sm:gap-4 mb-8">
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-2">
                                        <span className="font-title text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter">{formatNum(timeLeft.hours)}</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Horas</span>
                                </div>
                                <div className="text-3xl sm:text-4xl font-bold text-slate-300 mt-2 sm:mt-4">:</div>
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-sm border border-slate-200 flex items-center justify-center mb-2">
                                        <span className="font-title text-3xl sm:text-4xl font-black text-slate-800 tracking-tighter">{formatNum(timeLeft.minutes)}</span>
                                    </div>
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Min</span>
                                </div>
                                <div className="text-3xl sm:text-4xl font-bold text-slate-300 mt-2 sm:mt-4">:</div>
                                <div className="flex flex-col items-center">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-2xl shadow-md border border-mca-blue/10 flex items-center justify-center mb-2">
                                        <span className="font-title text-3xl sm:text-4xl font-black text-mca-blue tracking-tighter">{formatNum(timeLeft.seconds)}</span>
                                    </div>
                                    <span className="text-xs font-bold text-mca-blue uppercase tracking-widest">Seg</span>
                                </div>
                            </div>

                            <a
                                href="https://www.youtube.com/@PastorOmarSaiz/streams"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center justify-center gap-2 w-full bg-slate-100 text-slate-700 hover:text-white py-3.5 rounded-xl transition-all hover:bg-mca-blue font-semibold group"
                            >
                                <Youtube className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                Visitar nuestro canal
                            </a>
                        </div>
                    )}
                </div>

                {/* Right Side: YouTube Videos */}
                <div className="lg:w-3/5 p-8 lg:p-10 bg-white">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="font-title text-2xl font-bold text-slate-800">Últimas Transmisiones</h3>
                        <a href="https://www.youtube.com/@PastorOmarSaiz/streams" target="_blank" rel="noopener noreferrer" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-mca-blue hover:text-blue-700 transition-colors">
                            Ver todas <span aria-hidden="true">&rarr;</span>
                        </a>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                        {LATEST_VIDEOS.map((video) => (
                            <a
                                key={video.id}
                                href={video.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group block relative rounded-2xl overflow-hidden aspect-video bg-slate-100 shadow-sm transition-all hover:shadow-xl hover:-translate-y-1"
                            >
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent flex flex-col justify-end p-4">
                                    <PlayCircle className="w-12 h-12 text-white/90 group-hover:text-white group-hover:scale-110 transition-all absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 shadow-2xl drop-shadow-lg" />
                                    <p className="text-white font-semibold text-sm leading-tight drop-shadow-md line-clamp-2">
                                        {video.title}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                    <a href="https://www.youtube.com/@PastorOmarSaiz/streams" target="_blank" rel="noopener noreferrer" className="mt-8 flex sm:hidden items-center justify-center w-full py-3.5 bg-slate-50 rounded-xl text-sm font-semibold text-mca-blue hover:bg-slate-100 transition-colors">
                        Ver todas en YouTube
                    </a>
                </div>

            </div>
        </div>
    );
}
