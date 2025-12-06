import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, X, ChevronDown, Info, AlertTriangle, XCircle } from 'lucide-react';

export type NotificationType = 'success' | 'info' | 'warning' | 'error';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    duration?: number; // in seconds, default 5
}

interface NotificationToastProps {
    notification: Notification;
    onClose: (id: string) => void;
}

const NotificationToast: React.FC<NotificationToastProps> = ({ notification, onClose }) => {
    const [timeLeft, setTimeLeft] = useState(notification.duration || 5);
    const [isPaused, setIsPaused] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [isExiting, setIsExiting] = useState(false);

    const handleClose = useCallback(() => {
        setIsExiting(true);
        setTimeout(() => onClose(notification.id), 300);
    }, [notification.id, onClose]);

    useEffect(() => {
        if (isPaused || timeLeft <= 0) return;

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    handleClose();
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isPaused, timeLeft, handleClose]);

    const getIcon = () => {
        switch (notification.type) {
            case 'success':
                return <CheckCircle2 size={22} className="text-emerald-500" />;
            case 'info':
                return <Info size={22} className="text-blue-500" />;
            case 'warning':
                return <AlertTriangle size={22} className="text-amber-500" />;
            case 'error':
                return <XCircle size={22} className="text-red-500" />;
            default:
                return <CheckCircle2 size={22} className="text-emerald-500" />;
        }
    };

    const getProgressColor = () => {
        switch (notification.type) {
            case 'success':
                return 'bg-emerald-500';
            case 'info':
                return 'bg-blue-500';
            case 'warning':
                return 'bg-amber-500';
            case 'error':
                return 'bg-red-500';
            default:
                return 'bg-emerald-500';
        }
    };

    const duration = notification.duration || 5;
    const progress = (timeLeft / duration) * 100;

    return (
        <div
            className={`
                relative w-[340px] bg-white dark:bg-zinc-900 
                border border-zinc-200 dark:border-zinc-800 
                rounded-xl shadow-2xl overflow-hidden
                transition-all duration-300 ease-out
                ${isExiting
                    ? 'opacity-0 translate-x-full'
                    : 'opacity-100 translate-x-0 animate-slide-in-right'
                }
            `}
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
        >
            {/* Main Content */}
            <div className="p-4 flex items-start gap-3">
                {/* Icon */}
                <div className="shrink-0 mt-0.5">
                    {getIcon()}
                </div>

                {/* Message */}
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                        {notification.message}
                    </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0">
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                    >
                        <ChevronDown
                            size={16}
                            className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                        />
                    </button>
                    <button
                        onClick={handleClose}
                        className="p-1.5 rounded-md text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Expanded Content */}
            {isExpanded && (
                <div className="px-4 pb-3 border-t border-zinc-100 dark:border-zinc-800">
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-3">
                        This message will close in <span className="font-bold text-zinc-700 dark:text-zinc-200">{timeLeft}</span> seconds.{' '}
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="underline hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                        >
                            {isPaused ? 'Resume' : 'Click to stop'}.
                        </button>
                    </p>
                </div>
            )}

            {/* Progress Bar */}
            <div className="h-1 w-full bg-zinc-100 dark:bg-zinc-800">
                <div
                    className={`h-full ${getProgressColor()} transition-all duration-1000 ease-linear`}
                    style={{ width: `${progress}%` }}
                />
            </div>
        </div>
    );
};

export default NotificationToast;
