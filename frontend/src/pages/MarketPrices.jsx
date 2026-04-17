import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { getPriceForecastAll, getPriceForecast, getPriceStates, getPriceMandis } from '../api';
import UserDropdown from '../components/UserDropdown';

const CROP_EMOJI = {
  Wheat: '🌾', Rice: '🍚', Maize: '🌽', Soybean: '🫘', Groundnut: '🥜',
  Cotton: '🌸', Sugarcane: '🎋', Onion: '🧅', Tomato: '🍅', Potato: '🥔',
  Turmeric: '🟡', Chilli: '🌶️', Garlic: '🧄', Chickpea: '🫘', Moong: '🫘', Mustard: '🌻',
};

const CATEGORY_COLORS = {
  Cereal: 'bg-amber-100 text-amber-800',
  Pulse: 'bg-green-100 text-green-800',
  Oilseed: 'bg-yellow-100 text-yellow-800',
  'Cash Crop': 'bg-blue-100 text-blue-800',
  Vegetable: 'bg-emerald-100 text-emerald-800',
  Spice: 'bg-red-100 text-red-800',
};

const SIGNAL_CONFIG = {
  HOLD:    { label: 'HOLD',    bg: 'bg-green-100',  text: 'text-green-700',  icon: '📈' },
  SELL:    { label: 'SELL',    bg: 'bg-red-100',    text: 'text-red-700',    icon: '📉' },
  NEUTRAL: { label: 'NEUTRAL', bg: 'bg-gray-100',   text: 'text-gray-600',   icon: '➡️' },
};

export default function MarketPrices() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [prices, setPrices] = useState([]);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [cropDetail, setCropDetail] = useState(null);
  const [states, setStates] = useState([]);
  const [mandis, setMandis] = useState([]);
  const [selectedState, setSelectedState] = useState('');
  const [selectedMandi, setSelectedMandi] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState('crop');
  const [loading, setLoading] = useState(true);
  const [detailLoading, setDetailLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState('');

  const categories = ['All', 'Cereal', 'Pulse', 'Oilseed', 'Cash Crop', 'Vegetable', 'Spice'];

  // Load all prices
  const fetchAllPrices = useCallback(async (state = '') => {
    setLoading(true);
    try {
      const res = await getPriceForecastAll(state || undefined);
      setPrices(res.data.data);
      setLastUpdated(new Date().toLocaleTimeString('en-IN'));
    } catch (err) {
      console.error('Price fetch failed', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load states
  useEffect(() => {
    getPriceStates().then(r => setStates(r.data.data)).catch(() => {});
    fetchAllPrices();
  }, [fetchAllPrices]);

  // Load mandis when state changes
  useEffect(() => {
    if (selectedState) {
      getPriceMandis(selectedState).then(r => {
        setMandis(r.data.data);
        setSelectedMandi(r.data.data[0] || '');
      }).catch(() => setMandis([]));
      fetchAllPrices(selectedState);
    } else {
      setMandis([]);
      setSelectedMandi('');
      fetchAllPrices();
    }
  }, [selectedState, fetchAllPrices]);

  // Load individual crop detail
  const fetchCropDetail = async (crop) => {
    setDetailLoading(true);
    try {
      const res = await getPriceForecast(crop.toLowerCase(), selectedState || undefined);
      setCropDetail(res.data.data);
    } catch (err) {
      console.error('Detail fetch failed', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCropClick = (price) => {
    setSelectedCrop(price.crop);
    fetchCropDetail(price.crop);
  };

  // Filtered + sorted prices
  const filtered = prices
    .filter(p => {
      const matchSearch = p.crop.toLowerCase().includes(search.toLowerCase());
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      return matchSearch && matchCat;
    })
    .sort((a, b) => {
      if (sortBy === 'crop') return a.crop.localeCompare(b.crop);
      if (sortBy === 'price_asc') return a.currentPrice - b.currentPrice;
      if (sortBy === 'price_desc') return b.currentPrice - a.currentPrice;
      if (sortBy === 'change') return b.priceChange - a.priceChange;
      return 0;
    });

  // Mini chart bars
  const MiniChart = ({ history = [], forecast = [] }) => {
    const all = [...history, ...forecast];
    if (!all.length) return null;
    const max = Math.max(...all.map(x => x.price));
    const min = Math.min(...all.map(x => x.price));
    return (
      <div className="flex gap-0.5 items-end h-14 mt-3">
        {all.map((p, i) => {
          const height = max === min ? 50 : ((p.price - min) / (max - min)) * 100;
          return (
            <div
              key={i}
              title={`${p.month}: ₹${p.price.toLocaleString()}`}
              className={`flex-1 rounded-t-sm ${p.type === 'forecast' ? 'opacity-50 border-t-2 border-dashed border-[#186a22]' : ''}`}
              style={{
                height: `${Math.max(height, 8)}%`,
                background: p.type === 'forecast' ? '#186a22' : '#186a22cc',
              }}
            />
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#f2f4f2] font-body">
      {/* Navbar */}
      <nav className="bg-white flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50 border-b border-[#bfcab9]/30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold text-[#186a22] font-headline">KesaanConnect</Link>
          <span className="hidden md:block text-[#bfcab9]">/</span>
          <span className="hidden md:block text-sm font-semibold text-[#3f4a3d]">📊 Live Mandi Prices</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-sm font-semibold text-[#3f4a3d] hover:text-[#186a22] hidden md:block">Dashboard</Link>
          <Link to="/crop" className="text-sm font-semibold text-[#3f4a3d] hover:text-[#186a22] hidden md:block">Crop Advisor</Link>
          {user && (
            <div className="relative">
              <UserDropdown />
            </div>
          )}
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 md:px-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-[#186a22]/10 text-[#186a22] px-3 py-1.5 rounded-full text-xs font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block"></span>
              LIVE MANDI PRICES
            </div>
            <h1 className="text-3xl font-bold text-[#191c1b] font-headline">Market Price Dashboard</h1>
            <p className="text-[#6f7a6b] text-sm mt-1">
              {lastUpdated ? `Last updated: ${lastUpdated} · ` : ''}
              Prices sourced from APMC Mandis across India
            </p>
          </div>
          <button
            onClick={() => fetchAllPrices(selectedState)}
            className="flex items-center gap-2 bg-[#186a22] text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-[#005312] transition-colors shadow-sm"
          >
            🔄 Refresh Prices
          </button>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl p-4 mb-6 border border-[#bfcab9]/30 shadow-sm">
          <div className="flex flex-wrap gap-3">
            {/* Search */}
            <div className="relative flex-1 min-w-[180px]">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#6f7a6b]">🔍</span>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search crop..."
                className="w-full pl-9 pr-4 py-2 border border-[#bfcab9] rounded-xl text-sm bg-[#f8faf8] focus:outline-none focus:ring-2 focus:ring-[#186a22]/30"
              />
            </div>

            {/* State filter */}
            <select
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
              className="border border-[#bfcab9] rounded-xl px-3 py-2 text-sm bg-[#f8faf8] focus:outline-none focus:ring-2 focus:ring-[#186a22]/30 min-w-[160px]"
            >
              <option value="">📍 All India</option>
              {states.map(s => <option key={s} value={s}>{s}</option>)}
            </select>

            {/* Mandi filter - shows only when state is selected */}
            {mandis.length > 0 && (
              <select
                value={selectedMandi}
                onChange={e => setSelectedMandi(e.target.value)}
                className="border border-[#bfcab9] rounded-xl px-3 py-2 text-sm bg-[#f8faf8] focus:outline-none focus:ring-2 focus:ring-[#186a22]/30 min-w-[160px]"
              >
                {mandis.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            )}

            {/* Sort */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              className="border border-[#bfcab9] rounded-xl px-3 py-2 text-sm bg-[#f8faf8] focus:outline-none focus:ring-2 focus:ring-[#186a22]/30"
            >
              <option value="crop">Sort: Name</option>
              <option value="price_desc">Sort: Price ↓</option>
              <option value="price_asc">Sort: Price ↑</option>
              <option value="change">Sort: Change</option>
            </select>
          </div>

          {/* Category Pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                  categoryFilter === cat
                    ? 'bg-[#186a22] text-white shadow-sm'
                    : 'bg-[#f2f4f2] text-[#3f4a3d] hover:bg-[#e6e9e7]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Prices Table */}
          <div className="lg:col-span-2">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-[#bfcab9]/30 animate-pulse">
                    <div className="h-5 w-28 bg-gray-200 rounded mb-3"></div>
                    <div className="h-8 w-24 bg-gray-200 rounded mb-2"></div>
                    <div className="h-3 w-full bg-gray-100 rounded"></div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-white rounded-2xl p-12 text-center border border-[#bfcab9]/30">
                <p className="text-4xl mb-3">🔍</p>
                <p className="font-semibold text-[#191c1b]">No crops found</p>
                <p className="text-sm text-[#6f7a6b] mt-1">Try a different search or filter</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filtered.map(price => {
                  const signal = SIGNAL_CONFIG[price.signal] || SIGNAL_CONFIG.NEUTRAL;
                  const isSelected = selectedCrop === price.crop;
                  return (
                    <button
                      key={price.crop}
                      onClick={() => handleCropClick(price)}
                      className={`text-left bg-white rounded-2xl p-5 border transition-all hover:shadow-md ${
                        isSelected
                          ? 'border-[#186a22] shadow-md ring-2 ring-[#186a22]/20'
                          : 'border-[#bfcab9]/30 hover:border-[#186a22]/30'
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{CROP_EMOJI[price.crop] || '🌿'}</span>
                          <div>
                            <p className="font-bold text-[#191c1b]">{price.crop}</p>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${CATEGORY_COLORS[price.category] || 'bg-gray-100 text-gray-600'}`}>
                              {price.category}
                            </span>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded-full font-bold ${signal.bg} ${signal.text}`}>
                          {signal.icon} {signal.label}
                        </span>
                      </div>

                      <div className="flex items-end justify-between mt-3">
                        <div>
                          <p className="text-2xl font-bold text-[#186a22]">₹{price.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                          <p className="text-xs text-[#6f7a6b]">{price.priceUnit}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-sm font-bold ${price.priceChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {price.priceChange >= 0 ? '↑' : '↓'} {Math.abs(price.priceChange).toFixed(1)}%
                          </span>
                          <p className="text-xs text-[#6f7a6b]">3-month forecast</p>
                        </div>
                      </div>

                      {price.msp && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="text-xs text-[#6f7a6b]">MSP: ₹{price.msp.toLocaleString()}</span>
                          <span className={`text-xs font-semibold ${price.currentPrice >= price.msp ? 'text-green-600' : 'text-red-600'}`}>
                            {price.currentPrice >= price.msp ? '✓ Above MSP' : '⚠ Below MSP'}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Detail Panel */}
          <div className="lg:col-span-1">
            {selectedCrop && cropDetail ? (
              <div className="bg-white rounded-2xl border border-[#bfcab9]/30 shadow-sm sticky top-28 overflow-hidden">
                {detailLoading ? (
                  <div className="p-6 animate-pulse">
                    <div className="h-6 w-32 bg-gray-200 rounded mb-4"></div>
                    <div className="h-10 w-40 bg-gray-200 rounded mb-4"></div>
                    <div className="h-20 bg-gray-100 rounded"></div>
                  </div>
                ) : (
                  <>
                    <div className="bg-gradient-to-br from-[#186a22] to-[#358438] text-white p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-4xl">{CROP_EMOJI[cropDetail.crop] || '🌿'}</span>
                        <div>
                          <p className="text-xs font-semibold opacity-75 uppercase tracking-wider">{cropDetail.state}</p>
                          <h2 className="text-2xl font-bold">{cropDetail.crop}</h2>
                        </div>
                      </div>
                      <p className="text-4xl font-bold">₹{cropDetail.currentPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</p>
                      <p className="text-sm opacity-75 mt-1">{cropDetail.priceUnit} · {cropDetail.currency}</p>
                      <div className={`mt-3 inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold ${
                        cropDetail.priceChange >= 0 ? 'bg-white/20' : 'bg-red-500/30'
                      }`}>
                        {cropDetail.priceChange >= 0 ? '📈' : '📉'}
                        {cropDetail.priceChange >= 0 ? '+' : ''}{cropDetail.priceChange}% forecast
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Price Chart */}
                      <p className="text-xs font-semibold text-[#6f7a6b] uppercase tracking-wider mb-2">Price Trend</p>
                      <div className="flex gap-0.5 items-end h-20">
                        {[...cropDetail.history, ...cropDetail.forecast].map((p, i) => {
                          const all = [...cropDetail.history, ...cropDetail.forecast];
                          const max = Math.max(...all.map(x => x.price));
                          const min = Math.min(...all.map(x => x.price));
                          const height = max === min ? 50 : ((p.price - min) / (max - min)) * 100;
                          return (
                            <div key={i} className="flex-1 flex flex-col justify-end" title={`${p.month}: ₹${p.price.toLocaleString()}`}>
                              <div
                                className={`rounded-t-sm w-full transition-all ${p.type === 'forecast' ? 'bg-[#186a22]/30 border-t-2 border-dashed border-[#186a22]' : 'bg-[#186a22]'}`}
                                style={{ height: `${Math.max(height, 8)}%` }}
                              />
                            </div>
                          );
                        })}
                      </div>
                      <div className="flex justify-between text-xs text-[#6f7a6b] mt-1">
                        <span>{cropDetail.history[0]?.month}</span>
                        <span className="text-[#186a22] font-semibold">Forecast →</span>
                        <span>{cropDetail.forecast[cropDetail.forecast.length - 1]?.month}</span>
                      </div>

                      {/* MSP Info */}
                      {cropDetail.msp && (
                        <div className="mt-4 bg-[#f8faf8] rounded-xl p-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-semibold text-[#3f4a3d]">Govt. MSP</span>
                            <span className="text-sm font-bold text-[#186a22]">₹{cropDetail.msp.toLocaleString()}/qtl</span>
                          </div>
                          <div className="mt-2 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${cropDetail.currentPrice >= cropDetail.msp ? 'bg-green-500' : 'bg-red-500'}`}
                              style={{ width: `${Math.min((cropDetail.currentPrice / (cropDetail.msp * 1.5)) * 100, 100)}%` }}
                            />
                          </div>
                          <p className={`text-xs font-semibold mt-1 ${cropDetail.currentPrice >= cropDetail.msp ? 'text-green-600' : 'text-red-600'}`}>
                            {cropDetail.currentPrice >= cropDetail.msp
                              ? `₹${(cropDetail.currentPrice - cropDetail.msp).toFixed(0)} above MSP`
                              : `₹${(cropDetail.msp - cropDetail.currentPrice).toFixed(0)} below MSP`}
                          </p>
                        </div>
                      )}

                      {/* Forecast Table */}
                      <div className="mt-4">
                        <p className="text-xs font-semibold text-[#6f7a6b] uppercase tracking-wider mb-2">3-Month Forecast</p>
                        <div className="space-y-2">
                          {cropDetail.forecast.map((f, i) => (
                            <div key={i} className="flex items-center justify-between bg-[#f8faf8] rounded-lg px-3 py-2">
                              <span className="text-sm font-semibold text-[#3f4a3d]">{f.month}</span>
                              <span className="text-sm font-bold text-[#186a22]">₹{f.predictedPrice.toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                              <span className="text-xs text-[#6f7a6b]">±₹{((f.maxPrice - f.minPrice) / 2).toFixed(0)}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Advisory */}
                      <div className={`mt-4 p-4 rounded-xl text-sm font-semibold ${
                        cropDetail.signal === 'HOLD' ? 'bg-green-50 text-green-800' :
                        cropDetail.signal === 'SELL' ? 'bg-red-50 text-red-800' :
                        'bg-gray-50 text-gray-700'
                      }`}>
                        {cropDetail.signal === 'HOLD' ? '📈' : cropDetail.signal === 'SELL' ? '📉' : '➡️'} {cropDetail.recommendation}
                      </div>

                      <p className="text-xs text-[#6f7a6b] mt-3 text-center">Updated: {cropDetail.lastUpdated}</p>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#bfcab9]/30 p-8 text-center sticky top-28">
                <span className="text-5xl block mb-4">💰</span>
                <p className="font-semibold text-[#191c1b] mb-2">Select any crop</p>
                <p className="text-sm text-[#6f7a6b]">Click a crop card to see detailed price trends, MSP comparison, and AI forecast</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
