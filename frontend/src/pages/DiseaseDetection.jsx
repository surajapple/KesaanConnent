import React, { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { detectDisease } from '../api';
import { useAuth } from '../hooks/useAuth';
import UserDropdown from '../components/UserDropdown';


const SEVERITY_COLORS = {
  None: 'bg-green-100 text-green-800',
  Low: 'bg-yellow-100 text-yellow-800',
  Medium: 'bg-orange-100 text-orange-800',
  High: 'bg-red-100 text-red-800',
  Critical: 'bg-red-200 text-red-900',
};

export default function DiseaseDetection() {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef();
  const { user } = useAuth();
  const navigate = useNavigate();

  const processFile = (file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setError('Image must be under 5MB'); return; }
    setImage(file);
    setPreview(URL.createObjectURL(file));
    setResult(null);
    setError('');
  };

  const handleFileChange = (e) => processFile(e.target.files[0]);
  const handleDrop = (e) => { e.preventDefault(); setDragging(false); processFile(e.dataTransfer.files[0]); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) { setError('Please upload a leaf image first'); return; }
    setLoading(true);
    setError('');
    try {
      const fd = new FormData();
      fd.append('image', image);
      const res = await detectDisease(fd);
      setResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Detection failed. Is the backend running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8faf8] font-body">
      <nav className="bg-[#f8faf8] flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50 border-b border-[#bfcab9]/30">
        <Link to="/" className="text-2xl font-bold text-[#186a22] font-headline">KesaanConnect</Link>
        <div className="flex gap-4 items-center">
          <Link to="/crop" className="text-[#3f4a3d] hover:text-[#186a22] font-medium transition-colors hidden md:block">Crop Advisor</Link>
          <Link to="/dashboard" className="bg-[#186a22] text-white px-4 py-2 rounded-xl font-semibold hover:opacity-90 transition-all text-sm hidden md:block">Dashboard</Link>
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
            <span>🦠</span> AI Disease Detection
          </div>
          <h1 className="text-4xl font-bold text-[#191c1b] font-headline mb-3">Plant Disease Scanner</h1>
          <p className="text-[#3f4a3d] text-lg">Upload a photo of your plant leaf and our AI will detect any diseases instantly.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drop zone */}
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${dragging ? 'border-[#186a22] bg-[#186a22]/5' : 'border-[#bfcab9] bg-white hover:border-[#186a22]/50 hover:bg-[#f2f4f2]'}`}
            onClick={() => fileRef.current.click()}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
          >
            {preview ? (
              <div className="space-y-4">
                <img src={preview} alt="Uploaded leaf" className="max-h-64 mx-auto rounded-xl object-contain shadow-md" />
                <p className="text-sm text-[#3f4a3d]">{image.name} — <span className="text-[#186a22] font-semibold">{(image.size / 1024).toFixed(0)} KB</span></p>
                <button type="button" onClick={(e) => { e.stopPropagation(); setImage(null); setPreview(null); setResult(null); }} className="text-[#ba1a1a] text-sm underline">Remove image</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-20 h-20 bg-[#186a22]/10 rounded-full flex items-center justify-center mx-auto">
                  <span className="text-4xl">📷</span>
                </div>
                <div>
                  <p className="font-semibold text-[#191c1b] text-lg">Drop your leaf image here</p>
                  <p className="text-[#6f7a6b] text-sm mt-1">or click to browse — JPG, PNG, WebP up to 5MB</p>
                </div>
              </div>
            )}
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
          </div>

          <button
            type="submit"
            disabled={loading || !image}
            className="w-full bg-[#186a22] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#005312] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
          >
            {loading ? (
              <><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" /></svg>Scanning with AI...</>
            ) : '🔬 Detect Disease'}
          </button>
        </form>

        {error && (
          <div className="mt-6 bg-[#ffdad6] text-[#93000a] px-6 py-4 rounded-xl font-medium flex gap-3 items-start">
            <span>⚠️</span><span>{error}</span>
          </div>
        )}

        {result && (
          <div className="mt-8 space-y-6">
            {/* Disease Result Header */}
            <div className={`rounded-2xl p-8 ${result.disease === 'Healthy Plant' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <div className="flex items-start justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm font-semibold text-[#6f7a6b] uppercase tracking-wider mb-2">Detection Result</p>
                  <h2 className="text-3xl font-bold text-[#191c1b] font-headline">{result.disease}</h2>
                  <div className="flex items-center gap-3 mt-3">
                    <div className="h-2 bg-gray-200 rounded-full w-32">
                      <div className="h-2 bg-[#186a22] rounded-full" style={{ width: `${result.confidence}%` }} />
                    </div>
                    <span className="text-sm font-semibold text-[#3f4a3d]">{result.confidence}% confidence</span>
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-full text-sm font-bold ${SEVERITY_COLORS[result.severity] || 'bg-gray-100 text-gray-700'}`}>
                  {result.severity} Severity
                </span>
              </div>
            </div>

            {result.disease !== 'Healthy Plant' && (
              <div className="grid md:grid-cols-2 gap-6">
                {/* Treatment */}
                <div className="bg-white rounded-2xl border border-[#bfcab9]/30 p-6">
                  <h3 className="font-bold text-[#191c1b] mb-4 flex items-center gap-2"><span>💊</span> Treatment Steps</h3>
                  <ul className="space-y-3">
                    {result.treatment?.map((t, i) => (
                      <li key={i} className="flex gap-3 text-[#3f4a3d] text-sm">
                        <span className="flex-shrink-0 w-6 h-6 bg-[#186a22]/10 text-[#186a22] rounded-full flex items-center justify-center text-xs font-bold">{i + 1}</span>
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                {/* Prevention */}
                <div className="bg-white rounded-2xl border border-[#bfcab9]/30 p-6">
                  <h3 className="font-bold text-[#191c1b] mb-4 flex items-center gap-2"><span>🛡️</span> Prevention Tips</h3>
                  <ul className="space-y-3">
                    {result.prevention?.map((p, i) => (
                      <li key={i} className="flex gap-3 text-[#3f4a3d] text-sm">
                        <span className="flex-shrink-0 text-[#186a22]">✓</span>
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {result.disease === 'Healthy Plant' && (
              <div className="bg-green-50 border border-green-200 rounded-2xl p-6 text-center">
                <span className="text-5xl">🌿</span>
                <p className="text-green-800 font-semibold text-lg mt-3">Your plant appears to be healthy!</p>
                <p className="text-green-700 text-sm mt-1">{result.prevention?.[0]}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
