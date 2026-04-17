import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import SettingsModal from './SettingsModal';

export default function UserDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState('profile');
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const openSettings = (tab) => {
    setSettingsTab(tab);
    setIsSettingsOpen(true);
    setIsOpen(false);
  };

  if (!user) return null;

  return (
    <>
      <div className="relative z-50">
        <button 
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 hover:bg-[#f2f4f2] dark:hover:bg-[#2e3130] px-3 py-1.5 rounded-full transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#186a22] text-white flex items-center justify-center font-bold overflow-hidden">
            {user.profileImage ? (
              <img src={`http://localhost:5001${user.profileImage}`} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user.name.charAt(0).toUpperCase()
            )}
          </div>
          <span className="font-semibold text-[#191c1b] dark:text-white hidden md:block">{user.name}</span>
          <span className="text-xs dark:text-white">▼</span>
        </button>
        
        {isOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#191c1b] rounded-xl shadow-lg border border-[#bfcab9]/30 dark:border-white/10 py-2">
            <button onClick={() => openSettings('profile')} className="w-full text-left px-4 py-2 text-sm text-[#3f4a3d] dark:text-[#d8dad9] hover:bg-[#f8faf8] dark:hover:bg-[#2e3130] hover:text-[#186a22]">{t('profile', 'Profile')}</button>
            <button onClick={() => openSettings('language')} className="w-full text-left px-4 py-2 text-sm text-[#3f4a3d] dark:text-[#d8dad9] hover:bg-[#f8faf8] dark:hover:bg-[#2e3130] hover:text-[#186a22]">{t('settings', 'Settings')}</button>
            
            {user.role === 'admin' && (
              <Link to="/admin" className="block px-4 py-2 text-sm text-[#3f4a3d] dark:text-[#d8dad9] hover:bg-[#f8faf8] dark:hover:bg-[#2e3130] hover:text-[#186a22]">{t('adminPanel', 'Admin Panel')}</Link>
            )}
            <div className="border-t border-[#bfcab9]/20 dark:border-white/10 my-1"></div>
            <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">{t('logout', 'Logout')}</button>
          </div>
        )}
      </div>

      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        initialTab={settingsTab} 
      />
    </>
  );
}
