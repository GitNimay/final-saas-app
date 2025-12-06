import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import NotificationToast, { Notification, NotificationType } from '../components/ui/NotificationToast';

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType, duration?: number) => void;
    hideNotification: (id: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};

interface NotificationProviderProps {
    children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const showNotification = useCallback((message: string, type: NotificationType = 'success', duration: number = 5) => {
        const id = crypto.randomUUID();
        const newNotification: Notification = {
            id,
            message,
            type,
            duration,
        };
        setNotifications((prev) => [...prev, newNotification]);
    }, []);

    const hideNotification = useCallback((id: string) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, []);

    return (
        <NotificationContext.Provider value={{ showNotification, hideNotification }}>
            {children}

            {/* Notification Container - Fixed bottom right */}
            <div className="fixed bottom-6 right-6 z-[9999] flex flex-col gap-3 pointer-events-none">
                {notifications.map((notification) => (
                    <div key={notification.id} className="pointer-events-auto">
                        <NotificationToast
                            notification={notification}
                            onClose={hideNotification}
                        />
                    </div>
                ))}
            </div>
        </NotificationContext.Provider>
    );
};

export default NotificationContext;
