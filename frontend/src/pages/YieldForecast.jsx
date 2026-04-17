import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { predictYield } from '../api';
import UserDropdown from '../components/UserDropdown';

const CROPS = ['Rice','Wheat','Maize','Soybean','Cotton','Sugarcane','Groundnut','Chickpea','Mustard','Onion','Tomato','Potato','Turmeric','Moong'];
const SOILS = ['Loamy','Clay','Sandy','Silt','Red','Black','Alluvial'];
const FERTILIZERS = ['Chemical','Organic','Integrated','None'];
const IRRIGATIONS = ['Flood','Drip','Sprinkler','Rainfed'];

const FACTOR_COLOR = (v) => v >= 1.1 ? 'bg-green-500' : v >= 0.95 ? 'bg-yellow-400' : 'bg-red-400';
const STAGE_COLOR = {Germination:'bg-blue-100 text-blue-700', Vegetative:'bg-green-100 text-green-700', Flowering:'bg-yellow-100 text-yellow-700', 'Grain Fill':'bg-orange-100 text-orange-700', Maturity:'bg-red-100 text-red-700', Harvest:'bg-emerald-100 text-emerald-700'};

export default function YieldForecast() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    crop: 'Wheat', area: '', soilType: 'Loamy', rainfall: '',
    temperature: '', fertilizer: 'Chemical', irrigation: 'Flood',
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setResult(null);
    try {
      const res = await predictYield({ ...form, area: parseFloat(form.area), rainfall: parseFloat(form.rainfall), temperature: parseFloat(form.temperature) });
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed. Is the backend running?');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#f2f4f2] font-body">
      {/* Nav */}
      <nav className="bg-white flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50 border-b border-[#bfcab9]/30 shadow-sm">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-xl font-bold text-[#186a22] font-headline">KesaanConnect</Link>
          <span className="hidden md:block text-[#bfcab9]">/</span>
          <span className="hidden md:block text-sm font-semibold text-[#3f4a3d]">📈 Yield Forecast</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/dashboard" className="text-sm font-semibold text-[#3f4a3d] hover:text-[#186a22] hidden md:block">Dashboard</Link>
          <Link to="/market" className="text-sm font-semibold text-[#3f4a3d] hover:text-[#186a22] hidden md:block">Market Prices</Link>
          {user && (
            <div className="relative">
              <UserDropdown />
            </div>
          )}
        </div>
      </nav>

      <main className="pt-24 pb-16 px-4 md:px-8 max-w-6xl mx-auto">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 bg-[#186a22]/10 text-[#186a22] px-3 py-1.5 rounded-full text-xs font-bold mb-3">📈 AI-Powered Yield Prediction</div>
          <h1 className="text-3xl font-bold text-[#191c1b] font-headline">Yield Forecast</h1>
          <p className="text-[#6f7a6b] mt-1">Enter your farm details to estimate harvest output, revenue, and profit.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 bg-white rounded-2xl border border-[#bfcab9]/30 shadow-sm p-6 space-y-5 h-fit">
            {/* Crop */}
            <div>
              <label className="block text-sm font-semibold text-[#3f4a3d] mb-1">Crop</label>
              <select value={form.crop} onChange={e => set('crop', e.target.value)} className="w-full border border-[#bfcab9] rounded-xl px-4 py-2.5 text-sm bg-[#f8faf8] focus:outline-none focus:ring-2 focus:ring-[#186a22]/30">
                {CROPS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            {/* Area */}
            <div>
              <label className="block text-sm font-semibold text-[#3f4a3d] mb-1">Farm Area <span className="text-[#6f7a6b] font-normal">(hectares)</span></label>
              <input type="number" step="0.1" min="0.1" required value={form.area} onChange={e => set('area', e.target.value)} placeholder="e.g. 2.5" className="w-full border border-[#bfcab9] rounded-xl px-4 py-2.5 text-sm bg-[#f8faf8] focus:outline-none focus:ring-2 focus:ring-[#186a22]/30" />
            </div>

            {/* Soil */}
            <div>
              <label className="block text-sm font-semibold text-[#3f4a3d] mb-1">Soil Type</label>
              <div className="grid grid-cols-3 gap-2">
                {SOILS.map(s => (
                  <button key={s} type="button" onClick={() => set('soilType', s)}
                    className={`py-1.5 rounded-lg text-xs font-semibold border transition-all ${form.soilType === s ? 'bg-[#186a22] text-white border-[#186a22]' : 'bg-[#f8faf8] text-[#3f4a3d] border-[#bfcab9] hover:border-[#186a22]/40'}`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Rainfall & Temperature */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#3f4a3d] mb-1">Rainfall (mm)</label>
                <input type="number" required value={form.rainfall} onChange={e => set('rainfall', e.target.value)} placeholder="e.g. 120" className="w-full border border-[#bfcab9] rounded-xl px-3 py-2.5 text-sm bg-[#f8faf8] focus:outline-none focus:ring-2 focus:ring-[#186a22]/30" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#3f4a3d] mb-1">Temp (°C)</label>
                <input type="number" required value={form.temperature} onChange={e => set('temperature', e.target.value)} placeholder="e.g. 28" className="w-full border border-[#bfcab9] rounded-xl px-3 py-2.5 text-sm bg-[#f8faf8] focus:outline-none focus:ring-2 focus:ring-[#186a22]/30" />
              </div>
            </div>

            {/* Fertilizer */}
            <div>
              <label className="block text-sm font-semibold text-[#3f4a3d] mb-1">Fertilizer</label>
              <div className="grid grid-cols-2 gap-2">
                {FERTILIZERS.map(f => (
                  <button key={f} type="button" onClick={() => set('fertilizer', f)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${form.fertilizer === f ? 'bg-[#186a22] text-white border-[#186a22]' : 'bg-[#f8faf8] text-[#3f4a3d] border-[#bfcab9] hover:border-[#186a22]/40'}`}>
                    {f}
                  </button>
                ))}
              </div>
            </div>

            {/* Irrigation */}
            <div>
              <label className="block text-sm font-semibold text-[#3f4a3d] mb-1">Irrigation Method</label>
              <div className="grid grid-cols-2 gap-2">
                {IRRIGATIONS.map(i => (
                  <button key={i} type="button" onClick={() => set('irrigation', i)}
                    className={`py-2 rounded-lg text-xs font-semibold border transition-all ${form.irrigation === i ? 'bg-[#186a22] text-white border-[#186a22]' : 'bg-[#f8faf8] text-[#3f4a3d] border-[#bfcab9] hover:border-[#186a22]/40'}`}>
                    {i}
                  </button>
                ))}
              </div>
            </div>

            {error && <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl">{error}</div>}

            <button type="submit" disabled={loading}
              className="w-full bg-[#186a22] text-white py-3.5 rounded-xl font-bold text-base hover:bg-[#005312] transition-all disabled:opacity-60 flex items-center justify-center gap-2 shadow-md shadow-[#186a22]/20">
              {loading ? <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/></svg>Calculating...</> : '🌾 Predict Harvest'}
            </button>
          </form>

          {/* Results Panel */}
          <div className="lg:col-span-3 space-y-5">
            {!result && !loading && (
              <div className="bg-white rounded-2xl border border-[#bfcab9]/30 p-12 text-center shadow-sm">
                <span className="text-6xl block mb-4">🌾</span>
                <h2 className="text-xl font-bold text-[#191c1b] mb-2">Ready to Predict</h2>
                <p className="text-[#6f7a6b] text-sm">Fill in your farm details and click "Predict Harvest" to get your AI-powered yield estimate with profit analysis.</p>
              </div>
            )}

            {result && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: 'Total Yield', value: `${result.totalYield} t`, sub: `${result.totalYieldQuintals} qtl`, color: 'text-[#186a22]' },
                    { label: 'Per Hectare', value: `${result.yieldPerHectare} t/ha`, sub: result.unit, color: 'text-blue-600' },
                    { label: 'Est. Revenue', value: `₹${result.estimatedRevenue?.toLocaleString('en-IN')}`, sub: 'gross', color: 'text-green-600' },
                    { label: 'Est. Profit', value: `₹${result.estimatedProfit?.toLocaleString('en-IN')}`, sub: `Cost: ₹${result.estimatedCost?.toLocaleString('en-IN')}`, color: result.estimatedProfit > 0 ? 'text-green-600' : 'text-red-600' },
                  ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-[#bfcab9]/30 p-4 text-center shadow-sm">
                      <p className="text-xs text-[#6f7a6b] font-semibold mb-1">{s.label}</p>
                      <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-xs text-[#6f7a6b] mt-0.5">{s.sub}</p>
                    </div>
                  ))}
                </div>

                {/* Crop Info + Confidence */}
                <div className="bg-gradient-to-br from-[#186a22] to-[#358438] text-white rounded-2xl p-6 shadow-lg">
                  <div className="flex items-center justify-between flex-wrap gap-4">
                    <div>
                      <p className="text-xs font-semibold opacity-75 uppercase tracking-wider mb-1">Prediction for</p>
                      <h2 className="text-2xl font-bold">{result.crop} · {result.areaHectares} ha</h2>
                      <p className="text-sm opacity-80 mt-1">Season: {result.season} · Duration: {result.duration}</p>
                      <p className="text-sm opacity-80">Water: {result.waterRequirement} · MSP: ₹{result.pricePerQuintal}/qtl</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs opacity-75 mb-1">AI Confidence</p>
                      <p className="text-4xl font-bold">{result.confidence}%</p>
                      <div className="h-2 bg-white/20 rounded-full w-32 mt-2">
                        <div className="h-2 bg-[#a3f69c] rounded-full" style={{ width: `${result.confidence}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Yield Factors */}
                <div className="bg-white rounded-2xl border border-[#bfcab9]/30 p-6 shadow-sm">
                  <h3 className="font-bold text-[#191c1b] mb-4">📊 Yield Factor Analysis</h3>
                  <div className="space-y-3">
                    {result.factors?.map((f, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-sm font-semibold text-[#3f4a3d] w-28 shrink-0">{f.name}</span>
                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-2 rounded-full transition-all ${FACTOR_COLOR(f.impact)}`} style={{ width: `${Math.min(f.impact * 80, 100)}%` }} />
                        </div>
                        <span className="text-xs font-semibold text-[#6f7a6b] w-20 text-right">{f.label}</span>
                        <span className={`text-xs font-bold w-12 text-right ${f.impact >= 1.0 ? 'text-green-600' : 'text-red-600'}`}>
                          {f.impact >= 1.0 ? '+' : ''}{Math.round((f.impact - 1) * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Monthly Projection */}
                {result.monthlyProjection?.length > 0 && (
                  <div className="bg-white rounded-2xl border border-[#bfcab9]/30 p-6 shadow-sm">
                    <h3 className="font-bold text-[#191c1b] mb-4">📅 Growth Stage Projection</h3>
                    <div className="space-y-3">
                      {result.monthlyProjection.map((m, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-[#6f7a6b] w-16 shrink-0">{m.month}</span>
                          <div className="flex-1 h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-3 bg-[#186a22] rounded-full transition-all duration-700"
                              style={{ width: `${(m.cumulativeYield / result.totalYield) * 100}%` }} />
                          </div>
                          <span className="text-xs text-[#186a22] font-bold w-16 text-right">{m.cumulativeYield}t</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${STAGE_COLOR[m.growthStage] || 'bg-gray-100 text-gray-600'}`}>{m.growthStage}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tips */}
                {result.tips?.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                    <h3 className="font-bold text-amber-800 mb-3">💡 AI Recommendations</h3>
                    <ul className="space-y-2">
                      {result.tips.map((tip, i) => (
                        <li key={i} className="text-sm text-amber-800 flex gap-2"><span className="shrink-0">→</span>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Quick Links */}
                <div className="grid grid-cols-2 gap-4">
                  <Link to="/market" className="bg-white rounded-2xl border border-[#bfcab9]/30 p-4 flex items-center gap-3 hover:border-[#186a22]/30 hover:shadow-md transition-all group">
                    <span className="text-2xl">💰</span>
                    <div><p className="font-semibold text-sm text-[#191c1b] group-hover:text-[#186a22]">Check Market Price</p><p className="text-xs text-[#6f7a6b]">Live Mandi rates for {result.crop}</p></div>
                  </Link>
                  <Link to="/crop" className="bg-white rounded-2xl border border-[#bfcab9]/30 p-4 flex items-center gap-3 hover:border-[#186a22]/30 hover:shadow-md transition-all group">
                    <span className="text-2xl">🌱</span>
                    <div><p className="font-semibold text-sm text-[#191c1b] group-hover:text-[#186a22]">Crop Advisor</p><p className="text-xs text-[#6f7a6b]">Get personalized crop advice</p></div>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
