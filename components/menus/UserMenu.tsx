
import React, { useRef, useEffect } from 'react';
import { User, UserSettings } from '../../types';
import { 
  Settings, LogOut, Moon, Sun, Monitor, HelpCircle, 
  User as UserIcon, Zap, Sparkles 
} from 'lucide-react';

interface Props {
  user: User;
  settings: UserSettings;
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
  onUpdateSettings: (newSettings: Partial<UserSettings>) => void;
  onSignOut?: () => void;
}

const UserMenu: React.FC<Props> = ({ user, settings, isOpen, onClose, onOpenSettings, onUpdateSettings, onSignOut }) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      ref={menuRef}
      className="absolute bottom-20 left-6 w-72 bg-[#18181b] border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-slide-up origin-bottom-left"
    >
      {/* Header */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-sm font-bold text-white shadow-lg">
            {settings.displayName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 overflow-hidden">
            <h3 className="text-sm font-bold text-white truncate">{settings.displayName}</h3>
            <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Main Options */}
      <div className="p-2 space-y-1">
         <button 
            onClick={() => {
                onOpenSettings();
                onClose();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
         >
            <Settings size={16} className="text-zinc-500" />
            Settings
         </button>
      </div>

      <div className="px-2 py-2 border-t border-zinc-800">
          <p className="px-3 text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">Theme</p>
          <div className="grid grid-cols-3 gap-1 bg-zinc-900 p-1 rounded-lg">
              <button 
                 onClick={() => onUpdateSettings({ theme: 'light' })}
                 className={`flex items-center justify-center py-1.5 rounded-md transition-all ${settings.theme === 'light' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                 title="Light"
              >
                  <Sun size={14} />
              </button>
              <button 
                 onClick={() => onUpdateSettings({ theme: 'dark' })}
                 className={`flex items-center justify-center py-1.5 rounded-md transition-all ${settings.theme === 'dark' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                 title="Dark"
              >
                  <Moon size={14} />
              </button>
              <button 
                 onClick={() => onUpdateSettings({ theme: 'system' })}
                 className={`flex items-center justify-center py-1.5 rounded-md transition-all ${settings.theme === 'system' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'}`}
                 title="System"
              >
                  <Monitor size={14} />
              </button>
          </div>
      </div>

      <div className="p-2 border-t border-zinc-800 space-y-1">
         <button 
            onClick={() => {
                if (onSignOut) onSignOut();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors"
         >
            <LogOut size={16} />
            Log out
         </button>
      </div>

    </div>
  );
};

export default UserMenu;
