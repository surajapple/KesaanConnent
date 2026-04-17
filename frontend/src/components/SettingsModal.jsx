import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../api';

export default function SettingsModal({ isOpen, onClose, initialTab = 'profile' }) {
  const { t, i18n } = useTranslation();
  const { user, theme, toggleTheme, updateProfileContext } = useAuth();
  
  const [activeTab, setActiveTab] = useState(initialTab);
  const [formData, setFormData] = useState({ name: '', profileImage: null });
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, profileImage: null });
      setPreview(user.profileImage ? `http://localhost:5001${user.profileImage}` : null);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
      setMessage('');
    }
  }, [isOpen, initialTab]);

  if (!isOpen || !user) return null;

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, profileImage: file });
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const data = new FormData();
      data.append('name', formData.name);
      if (formData.profileImage) {
        data.append('profileImage', formData.profileImage);
      }
      
      const res = await updateProfile(data);
      if (res.data.success) {
        updateProfileContext(res.data.user);
        setMessage('Profile updated successfully!');
      }
    } catch (err) {
      setMessage('Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (lang) => {
    i18n.changeLanguage(lang);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#191c1b] w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[500px]">
        {/* Sidebar */}
        <div className="w-full md:w-1/3 bg-[#f8faf8] dark:bg-[#2e3130] p-6 border-r border-[#bfcab9]/30 dark:border-white/10 flex flex-col gap-2">
          <h2 className="text-2xl font-bold font-headline mb-6 text-[#191c1b] dark:text-white">{t('settings')}</h2>
          
          <button 
            onClick={() => setActiveTab('profile')}
            className={`text-left px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'profile' ? 'bg-[#186a22] text-white' : 'text-[#3f4a3d] dark:text-[#d8dad9] hover:bg-[#e1e3e1] dark:hover:bg-white/5'}`}
          >
            👤 {t('profile')}
          </button>
          <button 
            onClick={() => setActiveTab('language')}
            className={`text-left px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'language' ? 'bg-[#186a22] text-white' : 'text-[#3f4a3d] dark:text-[#d8dad9] hover:bg-[#e1e3e1] dark:hover:bg-white/5'}`}
          >
            🌐 {t('language')}
          </button>
          <button 
            onClick={() => setActiveTab('appearance')}
            className={`text-left px-4 py-3 rounded-xl font-semibold transition-colors ${activeTab === 'appearance' ? 'bg-[#186a22] text-white' : 'text-[#3f4a3d] dark:text-[#d8dad9] hover:bg-[#e1e3e1] dark:hover:bg-white/5'}`}
          >
            🎨 {t('appearance')}
          </button>

          <div className="mt-auto pt-6 border-t border-[#bfcab9]/30 dark:border-white/10">
            <button onClick={onClose} className="w-full text-center py-2 text-[#6f7a6b] dark:text-[#d8dad9] hover:text-[#191c1b] dark:hover:text-white font-medium">
              Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="w-full md:w-2/3 p-8 overflow-y-auto bg-white dark:bg-[#191c1b]">
          {activeTab === 'profile' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold font-headline text-[#191c1b] dark:text-white">{t('profile')}</h3>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-[#3f4a3d] dark:text-[#d8dad9] mb-2">{t('profilePicture')}</label>
                  <div className="flex items-center gap-4">
                    <div className="w-20 h-20 rounded-full bg-[#e1e3e1] dark:bg-[#2e3130] overflow-hidden border-2 border-[#186a22] flex items-center justify-center text-2xl font-bold text-[#186a22]">
                      {preview ? <img src={preview} alt="Profile" className="w-full h-full object-cover" /> : user.name.charAt(0).toUpperCase()}
                    </div>
                    <label className="cursor-pointer bg-[#f2f4f2] dark:bg-[#2e3130] text-[#191c1b] dark:text-white px-4 py-2 rounded-lg font-medium hover:bg-[#e1e3e1] dark:hover:bg-white/10 transition-colors text-sm">
                      Upload Image
                      <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-[#3f4a3d] dark:text-[#d8dad9] mb-2">{t('name')}</label>
                  <input 
                    type="text" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    className="w-full border border-[#bfcab9] dark:border-white/20 rounded-xl px-4 py-3 bg-white dark:bg-[#2e3130] text-[#191c1b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#186a22]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#3f4a3d] dark:text-[#d8dad9] mb-2">{t('email')}</label>
                  <input 
                    type="email" 
                    value={user.email} 
                    disabled
                    className="w-full border border-[#bfcab9] dark:border-white/20 rounded-xl px-4 py-3 bg-[#f2f4f2] dark:bg-[#2e3130]/50 text-[#6f7a6b] dark:text-[#d8dad9]/50 cursor-not-allowed"
                  />
                </div>

                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-[#186a22] text-white py-3 rounded-xl font-bold hover:bg-[#005312] transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : t('saveChanges')}
                </button>
                {message && <p className={`text-sm text-center ${message.includes('success') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
              </form>
            </div>
          )}

          {activeTab === 'language' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold font-headline text-[#191c1b] dark:text-white">{t('language')}</h3>
              <div className="space-y-3">
                {[
                  { code: 'en', label: 'English' },
                  { code: 'hi', label: 'हिंदी' },
                  { code: 'mr', label: 'मराठी' },
                ].map(lang => (
                  <label key={lang.code} className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${i18n.language === lang.code ? 'border-[#186a22] bg-[#186a22]/5 dark:bg-[#186a22]/20' : 'border-[#bfcab9] dark:border-white/20 hover:bg-[#f2f4f2] dark:hover:bg-white/5'}`}>
                    <span className="font-semibold text-[#191c1b] dark:text-white text-lg">{lang.label}</span>
                    <input 
                      type="radio" 
                      name="language" 
                      value={lang.code}
                      checked={i18n.language === lang.code}
                      onChange={() => handleLanguageChange(lang.code)}
                      className="w-5 h-5 text-[#186a22] focus:ring-[#186a22]"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-xl font-bold font-headline text-[#191c1b] dark:text-white">{t('appearance')}</h3>
              
              <div className="bg-[#f8faf8] dark:bg-[#2e3130] p-6 rounded-2xl border border-[#bfcab9]/30 dark:border-white/10 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-[#191c1b] dark:text-white text-lg">{t('darkMode')}</h4>
                  <p className="text-[#6f7a6b] dark:text-[#d8dad9] text-sm mt-1">Switch between light and dark themes</p>
                </div>
                
                <button 
                  onClick={toggleTheme}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#186a22] focus:ring-offset-2 ${theme === 'dark' ? 'bg-[#186a22]' : 'bg-[#bfcab9]'}`}
                >
                  <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-7' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
