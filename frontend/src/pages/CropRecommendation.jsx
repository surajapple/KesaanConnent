import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCropRecommendation } from '../api';
import { useAuth } from '../hooks/useAuth';
import UserDropdown from '../components/UserDropdown';


const CROP_EMOJIS = {
  Rice: '🌾', Wheat: '🌿', Maize: '🌽', Cotton: '☁️', Sugarcane: '🎋',
  Chickpea: '🫘', Soybean: '🫘', Groundnut: '🥜', Millet: '🌾', Tomato: '🍅',
};

export default function CropRecommendation() {
  const [form, setForm] = useState({ N: '', P: '', K: '', temperature: '', humidity: '', ph: '', rainfall: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await getCropRecommendation(form);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to get recommendation. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name: 'N', label: 'Nitrogen (N)', unit: 'mg/kg', placeholder: '60–140' },
    { name: 'P', label: 'Phosphorus (P)', unit: 'mg/kg', placeholder: '30–80' },
    { name: 'K', label: 'Potassium (K)', unit: 'mg/kg', placeholder: '20–90' },
    { name: 'temperature', label: 'Temperature', unit: '°C', placeholder: '15–40' },
    { name: 'humidity', label: 'Humidity', unit: '%', placeholder: '30–90' },
    { name: 'ph', label: 'Soil pH', unit: 'pH', placeholder: '5.5–8.0' },
    { name: 'rainfall', label: 'Rainfall', unit: 'mm', placeholder: '20–300' },
  ];

  return (
    <div className="min-h-screen bg-[#f8faf8] font-body">
      {/* Nav */}
      <nav className="bg-[#f8faf8] flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50 border-b border-[#bfcab9]/30">
        <Link to="/" className="text-2xl font-bold text-[#186a22] font-headline">KesaanConnect</Link>
        <div className="flex gap-4 items-center">
          <Link to="/dashboard" className="text-[#3f4a3d] hover:text-[#186a22] font-medium transition-colors hidden md:block">Dashboard</Link>
          <Link to="/disease" className="bg-[#186a22] text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-all text-sm hidden md:block">Disease Detection</Link>
          {user && (
            <div className="relative">
              <UserDropdown />
            </div>
          )}
        </div>
      </nav>

      <main className="pt-24 pb-16 px-6 max-w-4xl mx-auto">
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 bg-[#186a22]/10 text-[#186a22] px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <span>🌱</span> AI-Powered Crop Recommendation
          </div>
          <h1 className="text-4xl font-bold text-[#191c1b] font-headline mb-3">Find Your Best Crop</h1>
          <p className="text-[#3f4a3d] text-lg">Enter your soil and weather parameters to get an AI-powered crop recommendation.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-[#bfcab9]/30 p-8 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {fields.map(({ name, label, unit, placeholder }) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-[#3f4a3d] mb-2">
                  {label} <span className="text-[#6f7a6b] font-normal">({unit})</span>
                </label>
                <input
                  type="number"
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  step="any"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-[#bfcab9] bg-[#f8faf8] focus:outline-none focus:ring-2 focus:ring-[#186a22]/40 focus:border-[#186a22] transition-all text-[#191c1b]"
                />
              </div>
            ))}
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#186a22] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#005312] active:scale-[0.99] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <>
                <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Analyzing with AI...
              </>
            ) : '🔍 Get Crop Recommendation'}
          </button>
        </form>

        {error && (
          <div className="bg-[#ffdad6] text-[#93000a] px-6 py-4 rounded-xl mb-6 font-medium flex items-start gap-3">
            <span className="text-xl">⚠️</span>
            <span>{error}</span>
          </div>
        )}

        {result && (
          <div className="space-y-6">
            {/* Primary recommendation */}
            <div className="bg-gradient-to-br from-[#186a22] to-[#358438] text-white rounded-2xl p-8 shadow-lg">
              <p className="text-sm font-semibold uppercase tracking-widest opacity-80 mb-2">Recommended Crop</p>
              <div className="flex items-center gap-4 mb-6">
                <span className="text-6xl">{CROP_EMOJIS[result.crop] || '🌱'}</span>
                <div>
                  <h2 className="text-4xl font-bold font-headline">{result.crop}</h2>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="h-2 bg-white/20 rounded-full flex-1 max-w-xs">
                      <div className="h-2 bg-[#a3f69c] rounded-full transition-all duration-700" style={{ width: `${result.confidence}%` }} />
                    </div>
                    <span className="text-sm font-semibold opacity-90">{result.confidence}% match</span>
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold opacity-75 mb-3">Other suitable crops:</p>
                <div className="flex flex-wrap gap-2">
                  {result.alternatives?.map((alt) => (
                    <span key={alt} className="bg-white/20 backdrop-blur px-3 py-1 rounded-full text-sm font-medium">
                      {CROP_EMOJIS[alt] || '🌿'} {alt}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Input Summary */}
            <div className="bg-white rounded-2xl border border-[#bfcab9]/30 p-6">
              <h3 className="font-semibold text-[#191c1b] mb-4">📊 Your Soil & Weather Profile</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(form).map(([k, v]) => (
                  <div key={k} className="bg-[#f2f4f2] rounded-xl p-3 text-center">
                    <p className="text-xs text-[#6f7a6b] uppercase tracking-wide mb-1">{k}</p>
                    <p className="font-bold text-[#186a22] text-lg">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
