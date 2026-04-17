import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import AuthModal from '../components/AuthModal';
import UserDropdown from '../components/UserDropdown';


// Animated counter hook - only starts when section is in view
function useCountUp(target, duration = 1800, startCounting = true) {
  const [count, setCount] = useState(0);
  const frameRef = useRef(null);
  useEffect(() => {
    if (!startCounting) return;
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const tick = () => {
      start = Math.min(start + step, target);
      setCount(start);
      if (start < target) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, startCounting]);
  return count;
}

function AnimatedStat({ value, label, prefix = '', suffix = '' }) {
  const [visible, setVisible] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  const count = useCountUp(value, 1800, visible);
  return (
    <div ref={ref}>
      <p className="text-5xl font-bold">{prefix}{count.toLocaleString()}{suffix}</p>
      <p className="text-sm uppercase tracking-widest font-semibold mt-1 opacity-80">{label}</p>
    </div>
  );
}

export default function LandingPage() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();

  return (
    <div className="bg-[#f8faf8] text-[#191c1b] font-body selection:bg-[#a3f69c] selection:text-[#002204]">
      {/* Nav */}
      <nav className="bg-[#f8faf8] flex justify-between items-center w-full px-6 py-4 max-w-full mx-auto fixed top-0 z-50 border-b border-[#bfcab9]/20">
        <div className="flex items-center gap-8">
          <span className="text-2xl font-bold text-[#186a22] font-headline">KesaanConnect</span>
        </div>
        <div className="flex items-center gap-4 relative">
          {user ? (
            <UserDropdown />
          ) : (
            <>
              <select 
                value={i18n.language} 
                onChange={(e) => i18n.changeLanguage(e.target.value)}
                className="bg-transparent border-none text-[#3f4a3d] font-semibold cursor-pointer focus:outline-none hover:text-[#186a22]"
              >
                <option value="en">English</option>
                <option value="hi">हिंदी</option>
                <option value="mr">मराठी</option>
              </select>
              <Link to="/dashboard" className="text-[#3f4a3d] hover:text-[#186a22] font-medium transition-colors hidden md:block">{t('dashboard')}</Link>
              <button onClick={() => setIsAuthOpen(true)} className="bg-[#186a22] text-white px-6 py-2 rounded-xl font-bold hover:opacity-90 active:scale-[0.98] transition-all">{t('getStarted')}</button>
            </>
          )}
        </div>
      </nav>

      <main className="pt-24">
        {/* Hero */}
        <section className="px-6 md:px-12 py-12 md:py-20 max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl leading-tight font-bold tracking-tight text-[#191c1b] font-headline">
              {t('heroTitle1')} <br />{t('heroTitle2')}<span className="bg-gradient-to-r from-[#186a22] to-[#358438] bg-clip-text text-transparent">{t('heroTitle3')}</span>
            </h1>
            <p className="text-xl text-[#3f4a3d] font-medium leading-relaxed">
              {t('heroSubtitle')}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link to="/crop" className="bg-[#186a22] text-white px-8 py-4 rounded-xl text-lg font-bold shadow-lg shadow-[#186a22]/10 hover:shadow-[#186a22]/20 active:scale-95 transition-all">
                {t('btnCrop')}
              </Link>
              <Link to="/disease" className="bg-[#f2f4f2] text-[#186a22] px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#e6e9e7] active:scale-95 transition-all">
                {t('btnDisease')}
              </Link>
              <Link to="/dashboard" className="bg-[#f2f4f2] text-[#186a22] px-8 py-4 rounded-xl text-lg font-bold hover:bg-[#e6e9e7] active:scale-95 transition-all">
                {t('btnDashboard')}
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -top-12 -left-12 w-64 h-64 bg-[#a3f69c] rounded-full filter blur-3xl opacity-20"></div>
            <div className="relative rounded-2xl overflow-hidden shadow-2xl">
              <img className="w-full h-auto object-cover rounded-2xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCuWZpDZbEHU8saB1AtgUzYiTIFZogogmHoFAG4cqz8hdY9KatTQtPag9fHnYLZPZxJHHxsw2XqUg8CGSHdPCkVNrgeXoUOJ4ZcOAxapunLVvKmq2w54rwC8VkW4Ll4TAaHc6r81-3qlIOjkLQ6AlL1IenY-6bdPoerqTBW0n0YqVPl8XqLqKj4Cmhqp7WOBAH83BrScrTBKDgYh-zJM1BetGJZGqNKjVhZ5Mq_SamRQA8E5MHdoVLcmEZ3vq1PLsKm5aJamm3u1No" alt="Indian farmer with tablet" />
              <div className="absolute bottom-6 left-6 right-6 bg-white/80 backdrop-blur-lg p-5 rounded-xl border-l-4 border-[#186a22] shadow-xl">
                <div className="flex items-start gap-3">
                  <span className="text-[#186a22] text-xl">🧠</span>
                  <div>
                    <p className="text-xs text-[#186a22] font-bold tracking-wider uppercase">{t('aiInsight')}</p>
                    <p className="text-[#191c1b] font-semibold text-sm">{t('aiInsightDesc')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="bg-[#f2f4f2] py-24 px-6 md:px-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-16">
              <h2 className="text-3xl font-bold font-headline mb-2">{t('featuresTitle')}</h2>
              <p className="text-[#3f4a3d] text-lg">{t('featuresSubtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: '🌱', title: t('f1'), desc: t('d1'), to: '/crop' },
                { icon: '🦠', title: t('f2'), desc: t('d2'), to: '/disease' },
                { icon: '📈', title: t('f3'), desc: t('d3'), to: '/yield' },
                { icon: '💰', title: t('f4'), desc: t('d4'), to: '/market' },
                { icon: '🌦️', title: t('f5'), desc: t('d5'), to: '/dashboard' },
                { icon: '🐛', title: t('f6'), desc: t('d6'), to: '/dashboard' },

              ].map(({ icon, title, desc, to }) => (
                <Link key={title} to={to} className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-all group border border-transparent hover:border-[#186a22]/20">
                  <div className="bg-[#186a22]/10 w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:bg-[#186a22] group-hover:text-white transition-all">
                    {icon}
                  </div>
                  <h3 className="text-lg font-bold mb-2 font-headline text-[#191c1b] group-hover:text-[#186a22] transition-colors">{title}</h3>
                  <p className="text-[#3f4a3d] leading-relaxed text-sm">{desc}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold font-headline text-center mb-16">{t('stepsTitle')}</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { n: '1', title: t('s1'), desc: t('sd1') },
              { n: '2', title: t('s2'), desc: t('sd2') },
              { n: '✓', title: t('s3'), desc: t('sd3'), primary: true },

            ].map(({ n, title, desc, primary }) => (
              <div key={n} className="text-center space-y-6">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto border-4 border-[#f8faf8] shadow-xl font-bold text-xl ${primary ? 'bg-[#186a22] text-white' : 'bg-[#e1e3e1] text-[#186a22]'}`}>{n}</div>
                <div className="bg-white p-6 rounded-2xl shadow-sm">
                  <h4 className="font-bold text-lg mb-2 font-headline">{title}</h4>
                  <p className="text-[#3f4a3d] text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-24 px-6 md:px-12">
          <div className="max-w-7xl mx-auto bg-[#358438] text-white rounded-2xl p-12 relative overflow-hidden">
            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl font-bold font-headline mb-6">{t('impactTitle')}</h2>
                <p className="text-lg opacity-90 mb-8">{t('impactSubtitle')}</p>
                <div className="grid grid-cols-2 gap-8">
                  <AnimatedStat value={100} suffix="K+" label={t('stat1')} />
                  <AnimatedStat value={25} suffix="%" label={t('stat2')} />
                  <AnimatedStat value={15} suffix="%" label={t('stat3')} />
                  <AnimatedStat value={98} suffix="%" label={t('stat4')} />
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
                <p className="italic text-lg mb-6 leading-relaxed">{t('testimonial')}</p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-white/20">
                    <img src="https://lh3.googleusercontent.com/aida-public/AB6AXuCd58YXsfzndVWtUBrJEvN7DB_mPwt2R7vDMbnuF_lhVTyG4G3-kr758pAduUt0VgDLrVdtiAhgE2sUmBzPMLuQZFKrMYauPP6mAMzdJaphvrkJxuTTXvqPyXa-jEPn5OhbhmC8W8OeNyvNI3TaB06sykQT7FBE5fAk9vIZAmENS-ALUV1Gsj4NqO4K0vo-Of2s1E7qRKrD2UyBj9UPZaTv9cmFw6wAPWmWRYXyTEsdJzJCDsm8qA-ZNSQJ3e3WhupsZKcl3wReS28" alt="Rajesh Kumar" className="w-full h-full object-cover" />
                  </div>
                  <div><p className="font-bold">Rajesh Kumar</p><p className="text-sm opacity-75">{t('farmerDesc')}</p></div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#e6e9e7] py-16 px-6 md:px-12 mt-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start gap-12">
          <div className="max-w-xs">
            <span className="text-2xl font-bold text-[#186a22] mb-4 block font-headline">KesaanConnect</span>
            <p className="text-[#3f4a3d] text-sm leading-relaxed">{t('footerDesc')}</p>
          </div>
          <div className="grid grid-cols-2 gap-12 text-sm">
            <div>
              <h5 className="font-bold mb-4">{t('product')}</h5>
              <ul className="space-y-3 text-[#3f4a3d]">
                <li><Link className="hover:text-[#186a22] transition-colors" to="/disease">Disease Detection</Link></li>
                <li><Link className="hover:text-[#186a22] transition-colors" to="/yield">Yield Forecast</Link></li>
                <li><Link className="hover:text-[#186a22] transition-colors" to="/market">Market Prices</Link></li>
                <li><Link className="hover:text-[#186a22] transition-colors" to="/dashboard">Pest Info</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold mb-4">{t('tools')}</h5>
              <ul className="space-y-3 text-[#3f4a3d]">
                <li><Link className="hover:text-[#186a22] transition-colors" to="/crop">Crop Advisor</Link></li>
                <li><Link className="hover:text-[#186a22] transition-colors" to="/dashboard">Weather API</Link></li>
                <li><Link className="hover:text-[#186a22] transition-colors" to="/market">Price Forecast</Link></li>
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-[#bfcab9]/50 mt-12 pt-8 flex flex-col md:flex-row justify-between text-xs text-[#6f7a6b]">
          <p>© 2024 KesaanConnect. All rights reserved for Kisan Sahayak Initiative.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a className="hover:text-[#186a22] transition-colors" href="#">Privacy Policy</a>
            <a className="hover:text-[#186a22] transition-colors" href="#">Terms of Service</a>
          </div>
        </div>
      </footer>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </div>
  );
}
