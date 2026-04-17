import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTranslation } from 'react-i18next';

import { getWeather, getPriceForecast, getPests, predictYield } from '../api';
import UserDropdown from '../components/UserDropdown';

const WEATHER_ICONS = {
  '01d': '☀️', '01n': '🌙', '02d': '⛅', '02n': '⛅', '03d': '☁️', '03n': '☁️',
  '04d': '☁️', '04n': '☁️', '09d': '🌧️', '09n': '🌧️', '10d': '🌦️', '10n': '🌦️',
  '11d': '⛈️', '11n': '⛈️', '13d': '❄️', '13n': '❄️', '50d': '🌫️', '50n': '🌫️',
};

function WeatherWidget() {
  const { t } = useTranslation();
  const [location, setLocation] = useState('Mumbai');
  const [input, setInput] = useState('Mumbai');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async (loc) => {
    setLoading(true);
    setError('');
    try {
      const res = await getWeather(loc);
      setData(res.data.data);
    } catch (e) {
      setError('Location not found');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchWeather(location); }, []);

  return (
    <div className="bg-gradient-to-br from-[#186a22] to-[#005312] dark:from-[#186a22] dark:to-[#002e08] text-white rounded-2xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-lg flex items-center gap-2">🌦️ {t('weather')}</h2>
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchWeather(input)}
            placeholder="Enter city..."
            className="bg-white/20 text-white placeholder-white/60 rounded-lg px-3 py-1.5 text-sm w-32 focus:outline-none focus:bg-white/30"
          />
          <button onClick={() => fetchWeather(input)} className="bg-white/20 hover:bg-white/30 px-3 py-1.5 rounded-lg text-sm font-medium">Go</button>
        </div>
      </div>

      {loading && <p className="text-white/70 text-sm text-center py-4">Loading weather...</p>}
      {error && <p className="text-red-300 text-sm">{error}</p>}
      {data && (
        <div>
          <div className="mb-4">
            <p className="text-white/70 text-sm">{data.location}</p>
            <div className="flex items-center gap-3">
              <span className="text-5xl">{WEATHER_ICONS[data.current.icon] || '🌤️'}</span>
              <div>
                <p className="text-4xl font-bold">{Math.round(data.current.temp)}°C</p>
                <p className="text-white/80 capitalize text-sm">{data.current.weather}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-3 text-sm">
              <span className="bg-white/15 rounded-lg px-3 py-1.5">💧 {data.current.humidity}% humidity</span>
              <span className="bg-white/15 rounded-lg px-3 py-1.5">💨 {data.current.wind_speed} m/s</span>
            </div>
          </div>
          {data.alerts?.map((alert, i) => (
            <div key={i} className={`rounded-lg px-3 py-2 text-sm mb-2 ${alert.type === 'warning' ? 'bg-orange-400/30' : 'bg-white/15'}`}>
              {alert.type === 'warning' ? '⚠️' : 'ℹ️'} {alert.message}
            </div>
          ))}
          <div className="flex gap-2 overflow-x-auto mt-3 pb-1">
            {data.forecast?.slice(0, 5).map((f, i) => (
              <div key={i} className="flex-shrink-0 bg-white/15 rounded-xl px-3 py-2 text-center text-xs">
                <p className="opacity-70">{typeof f.time === 'string' && f.time.length <= 7 ? f.time : new Date(f.time).toLocaleDateString('en', {weekday:'short'})}</p>
                <p className="text-lg my-1">{WEATHER_ICONS[f.icon] || '🌤️'}</p>
                <p className="font-semibold">{Math.round(f.temp)}°</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PriceWidget() {
  const { t } = useTranslation();
  const [crop, setCrop] = useState('wheat');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const crops = ['wheat', 'rice', 'maize', 'cotton', 'soybean', 'onion', 'tomato'];

  const fetchPrice = async (c) => {
    setLoading(true);
    try {
      const res = await getPriceForecast(c);
      setData(res.data.data);
    } catch (_) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchPrice(crop); }, [crop]);

  return (
    <div className="bg-white dark:bg-[#2e3130] rounded-2xl border border-[#bfcab9]/30 dark:border-white/10 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#191c1b] dark:text-white flex items-center gap-2">💰 {t('marketPricesTitle')}</h2>
        <select value={crop} onChange={(e) => setCrop(e.target.value)} className="border border-[#bfcab9] dark:border-white/20 rounded-lg px-3 py-1.5 text-sm bg-[#f8faf8] dark:bg-[#191c1b] text-[#191c1b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#186a22]/30">
          {crops.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
        </select>
      </div>
      {loading && <p className="text-[#6f7a6b] text-sm py-4 text-center">Loading prices...</p>}
      {data && (
        <div>
          <div className="flex items-center gap-4 mb-4">
            <div>
              <p className="text-3xl font-bold text-[#186a22]">₹{data.currentPrice.toLocaleString()}</p>
              <p className="text-xs text-[#6f7a6b]">per quintal</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${data.priceChange >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {data.priceChange >= 0 ? '↑' : '↓'} {Math.abs(data.priceChange)}% (6 mo)
            </span>
          </div>
          <div className="flex gap-1 items-end h-20 mb-3">
            {[...data.history, ...data.forecast].map((p, i) => {
              const maxP = Math.max(...[...data.history, ...data.forecast].map(x => x.price));
              const minP = Math.min(...[...data.history, ...data.forecast].map(x => x.price));
              const height = ((p.price - minP) / (maxP - minP + 1)) * 100;
              return (
                <div key={i} title={`${p.month}: ₹${p.price}`} className={`flex-1 rounded-t-sm transition-all ${p.type === 'forecast' ? 'bg-[#186a22]/30 border-t-2 border-dashed border-[#186a22]' : 'bg-[#186a22]'}`} style={{ height: `${Math.max(height, 10)}%` }} />
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-[#6f7a6b]">
            <span>{data.history[0]?.month}</span>
            <span className="text-[#186a22] font-semibold">📈 Forecast →</span>
            <span>{data.forecast[data.forecast.length - 1]?.month}</span>
          </div>
          <div className={`mt-3 px-4 py-2 rounded-lg text-sm font-medium ${data.recommendation.includes('Hold') ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'}`}>
            {data.recommendation}
          </div>
        </div>
      )}
    </div>
  );
}

function YieldWidget() {
  const { t } = useTranslation();
  const [form, setForm] = useState({ crop: 'wheat', area: '', soilType: 'loamy', rainfall: '', fertilizer: 'chemical' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await predictYield(form);
      setResult(res.data.data);
    } catch (_) {} finally { setLoading(false); }
  };

  return (
    <div className="bg-white dark:bg-[#2e3130] rounded-2xl border border-[#bfcab9]/30 dark:border-white/10 p-6 shadow-sm">
      <h2 className="font-bold text-[#191c1b] dark:text-white mb-4 flex items-center gap-2">📈 {t('yieldPredictionTitle')}</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-[#6f7a6b] dark:text-[#d8dad9]/70 mb-1 block">Crop</label>
            <select value={form.crop} onChange={e => setForm({...form, crop: e.target.value})} className="w-full border border-[#bfcab9] dark:border-white/20 rounded-lg px-3 py-2 text-sm bg-[#f8faf8] dark:bg-[#191c1b] text-[#191c1b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#186a22]/30">
              {['wheat','rice','maize','cotton','soybean','tomato'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6f7a6b] dark:text-[#d8dad9]/70 mb-1 block">Area (hectares)</label>
            <input type="number" value={form.area} onChange={e => setForm({...form, area: e.target.value})} placeholder="e.g. 2.5" required className="w-full border border-[#bfcab9] dark:border-white/20 rounded-lg px-3 py-2 text-sm bg-[#f8faf8] dark:bg-[#191c1b] text-[#191c1b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#186a22]/30" />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6f7a6b] dark:text-[#d8dad9]/70 mb-1 block">Soil Type</label>
            <select value={form.soilType} onChange={e => setForm({...form, soilType: e.target.value})} className="w-full border border-[#bfcab9] dark:border-white/20 rounded-lg px-3 py-2 text-sm bg-[#f8faf8] dark:bg-[#191c1b] text-[#191c1b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#186a22]/30">
              {['loamy','sandy','clay','silt','red'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-[#6f7a6b] dark:text-[#d8dad9]/70 mb-1 block">Rainfall (mm)</label>
            <input type="number" value={form.rainfall} onChange={e => setForm({...form, rainfall: e.target.value})} placeholder="e.g. 80" required className="w-full border border-[#bfcab9] dark:border-white/20 rounded-lg px-3 py-2 text-sm bg-[#f8faf8] dark:bg-[#191c1b] text-[#191c1b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#186a22]/30" />
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-[#6f7a6b] mb-1 block">Fertilizer</label>
          <div className="flex gap-2">
            {['organic','chemical','integrated','none'].map(f => (
              <button key={f} type="button" onClick={() => setForm({...form, fertilizer: f})} className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.fertilizer === f ? 'bg-[#186a22] text-white border-[#186a22]' : 'bg-[#f8faf8] text-[#3f4a3d] border-[#bfcab9]'}`}>
                {f.charAt(0).toUpperCase()+f.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" disabled={loading} className="w-full bg-[#186a22] text-white py-2.5 rounded-xl font-semibold text-sm hover:bg-[#005312] transition-all disabled:opacity-50">
          {loading ? 'Calculating...' : '🌾 Predict Yield'}
        </button>
      </form>
      {result && (
        <div className="mt-4 bg-[#f2f4f2] rounded-xl p-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-xs text-[#6f7a6b] mb-1">Total Yield</p>
              <p className="text-2xl font-bold text-[#186a22]">{result.totalYield}</p>
              <p className="text-xs text-[#6f7a6b]">{result.unit}</p>
            </div>
            <div className="bg-white rounded-xl p-3 text-center">
              <p className="text-xs text-[#6f7a6b] mb-1">Est. Revenue</p>
              <p className="text-2xl font-bold text-[#186a22]">₹{result.estimatedRevenue?.toLocaleString()}</p>
              <p className="text-xs text-[#6f7a6b]">approx.</p>
            </div>
          </div>
          <p className="text-xs text-[#6f7a6b] text-center mt-2">{result.yieldPerHectare} {result.unit}/hectare · {result.confidence}% model confidence</p>
        </div>
      )}
    </div>
  );
}

function PestWidget() {
  const { t } = useTranslation();
  const [crop, setCrop] = useState('rice');
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const crops = ['rice', 'wheat', 'cotton', 'maize', 'tomato'];

  const fetchPests = async (c) => {
    setLoading(true);
    try {
      const res = await getPests(c);
      setData(res.data.data);
    } catch (_) {} finally { setLoading(false); }
  };

  useEffect(() => { fetchPests(crop); }, [crop]);

  const severityColor = { Critical: 'bg-red-200 text-red-900', High: 'bg-red-100 text-red-700', Medium: 'bg-orange-100 text-orange-700', Low: 'bg-yellow-100 text-yellow-700' };

  return (
    <div className="bg-white dark:bg-[#2e3130] rounded-2xl border border-[#bfcab9]/30 dark:border-white/10 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-bold text-[#191c1b] dark:text-white flex items-center gap-2">🐛 {t('pestGuide')}</h2>
        <select value={crop} onChange={(e) => setCrop(e.target.value)} className="border border-[#bfcab9] dark:border-white/20 rounded-lg px-3 py-1.5 text-sm bg-[#f8faf8] dark:bg-[#191c1b] text-[#191c1b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#186a22]/30">
          {crops.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}
        </select>
      </div>
      {loading && <p className="text-[#6f7a6b] text-sm text-center py-4">Loading...</p>}
      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
        {data.map((pest, i) => (
          <div key={i} className="border border-[#bfcab9]/30 rounded-xl p-4">
            <div className="flex items-start justify-between gap-2 mb-2">
              <p className="font-semibold text-[#191c1b] text-sm">{pest.name}</p>
              <span className={`flex-shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${severityColor[pest.severity] || 'bg-gray-100 text-gray-600'}`}>{pest.severity}</span>
            </div>
            <p className="text-xs text-[#6f7a6b] mb-2">🔍 {pest.symptoms}</p>
            <ul className="space-y-1">
              {pest.management?.slice(0, 2).map((m, j) => (
                <li key={j} className="text-xs text-[#3f4a3d] flex gap-2"><span className="text-[#186a22]">→</span>{m}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-[#f2f4f2] dark:bg-[#191c1b] font-body transition-colors">
      <nav className="bg-[#f8faf8] dark:bg-[#2e3130] flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50 border-b border-[#bfcab9]/30 dark:border-white/10 transition-colors">
        <Link to="/" className="text-2xl font-bold text-[#186a22] font-headline">KesaanConnect</Link>
        <div className="flex gap-3 items-center">
          <Link to="/crop" className="bg-[#186a22]/10 dark:bg-white/10 text-[#186a22] dark:text-[#a3f69c] px-4 py-2 rounded-xl font-semibold hover:bg-[#186a22]/20 dark:hover:bg-white/20 transition-all text-sm hidden md:block">🌱 {t('btnCrop')}</Link>
          <Link to="/disease" className="bg-[#186a22] text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-all text-sm hidden md:block">🦠 {t('btnDisease')}</Link>
          
          <div className="relative ml-4">
            <UserDropdown />
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-16 px-6 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#191c1b] dark:text-white font-headline">{t('dashboardTitle')}</h1>
          <p className="text-[#3f4a3d] dark:text-[#d8dad9]/80 mt-1">{t('dashboardSubtitle')}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1"><WeatherWidget /></div>
          <div className="lg:col-span-2"><PriceWidget /></div>
          <div className="lg:col-span-2"><YieldWidget /></div>
          <div className="lg:col-span-1"><PestWidget /></div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {[
            { to: '/crop', icon: '🌱', label: t('f1'), desc: t('d1') },
            { to: '/disease', icon: '🦠', label: t('f2'), desc: t('d2') },
            { to: '/yield', icon: '📈', label: t('f3'), desc: t('d3') },
            { to: '/market', icon: '💰', label: t('f4'), desc: t('d4') },
            { to: '/markets', icon: '🏪', label: 'Nearby Markets', desc: 'Find nearest mandi & best prices' },
          ].map(({ to, icon, label, desc }) => (
            <Link key={label} to={to} className="bg-white dark:bg-[#2e3130] rounded-2xl border border-[#bfcab9]/30 dark:border-white/10 p-5 hover:border-[#186a22]/30 dark:hover:border-white/30 hover:shadow-md transition-all group">
              <span className="text-3xl block mb-3">{icon}</span>
              <p className="font-semibold text-[#191c1b] dark:text-white text-sm group-hover:text-[#186a22] dark:group-hover:text-[#a3f69c] transition-colors">{label}</p>
              <p className="text-xs text-[#6f7a6b] dark:text-[#d8dad9]/70 mt-1">{desc}</p>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
