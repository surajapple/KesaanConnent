import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import UserDropdown from '../components/UserDropdown';
import { getNearbyMarkets } from '../api';

export default function Markets() {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [markets, setMarkets] = useState([]);
  const [selectedMarket, setSelectedMarket] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  
  const [commodity, setCommodity] = useState('wheat');
  const [manualLocation, setManualLocation] = useState('');

  const mapRef = useRef(null);

  // Fetch Markets
  const fetchNearbyMarkets = async (lat, lng, comm) => {
    setLoading(true);
    setError('');
    try {
      const res = await getNearbyMarkets(lat, lng, comm);
      if (res.data.success) {
        setMarkets(res.data.data);
        if (res.data.data.length > 0) {
          setSelectedMarket(res.data.data[0]);
        }
      }
    } catch (err) {
      setError('Failed to fetch nearby markets.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // HTML5 Geolocation
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setManualLocation(''); // Clear manual if GPS used
        fetchNearbyMarkets(latitude, longitude, commodity);
      },
      (err) => {
        setLoading(false);
        setError('Location permission denied. Please enter location manually.');
      }
    );
  };

  // Mock Manual Geocoding (Since we don't have Geocoding API key)
  const handleManualSearch = (e) => {
    e.preventDefault();
    if (!manualLocation.trim()) return;
    
    // In production, you would call Google Geocoding API or backend to convert City to Lat/Lng.
    // For this demo, we'll mock Pune coordinates if they type "Pune", etc.
    let lat = 18.5204;
    let lng = 73.8567; // Default Pune
    
    if (manualLocation.toLowerCase().includes('nashik')) { lat = 19.9975; lng = 73.7898; }
    else if (manualLocation.toLowerCase().includes('mumbai')) { lat = 19.0760; lng = 72.8777; }
    
    setUserLocation({ lat, lng });
    fetchNearbyMarkets(lat, lng, commodity);
  };

  useEffect(() => {
    // Optional: trigger location on load
    // handleUseMyLocation();
  }, []);

  const handleCommodityChange = (e) => {
    const newComm = e.target.value;
    setCommodity(newComm);
    if (userLocation) {
      fetchNearbyMarkets(userLocation.lat, userLocation.lng, newComm);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f4f2] dark:bg-[#191c1b] font-body transition-colors pb-16">
      {/* Navigation */}
      <nav className="bg-[#f8faf8] dark:bg-[#2e3130] flex justify-between items-center w-full px-6 py-4 fixed top-0 z-50 border-b border-[#bfcab9]/30 dark:border-white/10 transition-colors">
        <Link to="/" className="text-2xl font-bold text-[#186a22] font-headline">KesaanConnect</Link>
        <div className="flex gap-3 items-center">
          <Link to="/dashboard" className="text-sm font-semibold text-[#3f4a3d] dark:text-[#d8dad9] hover:text-[#186a22] dark:hover:text-[#a3f69c] transition-colors hidden md:block">Dashboard</Link>
          <div className="relative ml-4">
            <UserDropdown />
          </div>
        </div>
      </nav>

      <main className="pt-24 px-6 max-w-7xl mx-auto">
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#191c1b] dark:text-white font-headline flex items-center gap-3">
              🏪 Nearby APMC Markets
            </h1>
            <p className="text-[#3f4a3d] dark:text-[#d8dad9]/80 mt-2">Find the nearest mandi and get the best prices for your crop.</p>
          </div>
        </div>

        {/* Top Section: Location & Commodity */}
        <div className="bg-white dark:bg-[#2e3130] rounded-2xl border border-[#bfcab9]/30 dark:border-white/10 p-6 shadow-sm mb-8 flex flex-col lg:flex-row gap-6 items-end">
          
          <div className="w-full lg:w-auto flex-1">
            <label className="text-sm font-semibold text-[#6f7a6b] dark:text-[#d8dad9]/70 mb-2 block">Crop / Commodity</label>
            <select 
              value={commodity} 
              onChange={handleCommodityChange}
              className="w-full border border-[#bfcab9] dark:border-white/20 rounded-xl px-4 py-3 bg-[#f8faf8] dark:bg-[#191c1b] text-[#191c1b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#186a22]/30"
            >
              <option value="wheat">Wheat (गेहूं)</option>
              <option value="rice">Rice (चावल)</option>
              <option value="onion">Onion (प्याज)</option>
              <option value="cotton">Cotton (कपास)</option>
              <option value="soybean">Soybean (सोयाबीन)</option>
            </select>
          </div>

          <div className="w-full lg:w-auto flex-1">
            <label className="text-sm font-semibold text-[#6f7a6b] dark:text-[#d8dad9]/70 mb-2 block">Manual Location</label>
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <input 
                type="text" 
                placeholder="Enter city or village..." 
                value={manualLocation}
                onChange={e => setManualLocation(e.target.value)}
                className="w-full border border-[#bfcab9] dark:border-white/20 rounded-xl px-4 py-3 bg-[#f8faf8] dark:bg-[#191c1b] text-[#191c1b] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#186a22]/30"
              />
              <button type="submit" className="bg-[#186a22]/10 dark:bg-white/10 text-[#186a22] dark:text-[#a3f69c] px-6 py-3 rounded-xl font-bold hover:bg-[#186a22]/20 transition-colors whitespace-nowrap">
                Search
              </button>
            </form>
          </div>

          <div className="flex items-center gap-4 w-full lg:w-auto">
            <span className="text-[#6f7a6b] dark:text-[#d8dad9]/50 font-medium">OR</span>
            <button 
              onClick={handleUseMyLocation}
              className="w-full lg:w-auto bg-[#186a22] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#005312] transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
            >
              📍 Use My Location
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-8">
            {error}
          </div>
        )}

        {loading && (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#186a22] border-t-transparent"></div>
          </div>
        )}

        {!loading && markets.length === 0 && !error && (
          <div className="text-center py-16 bg-white dark:bg-[#2e3130] rounded-2xl border border-[#bfcab9]/30 dark:border-white/10">
            <div className="text-5xl mb-4">📍</div>
            <h3 className="text-xl font-bold text-[#191c1b] dark:text-white mb-2">No Markets Found</h3>
            <p className="text-[#6f7a6b] dark:text-[#d8dad9]/80">Please use your GPS location or enter a city to find nearby APMC markets.</p>
          </div>
        )}

        {!loading && markets.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            
            {/* Left Column: Market List */}
            <div className="lg:col-span-2 space-y-4 max-h-[800px] overflow-y-auto pr-2 custom-scrollbar">
              {markets.map((market) => (
                <div 
                  key={market.id} 
                  className={`bg-white dark:bg-[#2e3130] rounded-2xl border transition-all cursor-pointer overflow-hidden ${selectedMarket?.id === market.id ? 'border-[#186a22] ring-2 ring-[#186a22]/20 shadow-md' : 'border-[#bfcab9]/30 dark:border-white/10 hover:border-[#186a22]/50'}`}
                  onClick={() => setSelectedMarket(market)}
                >
                  {market.isBestPrice && (
                    <div className="bg-[#186a22] text-white text-xs font-bold text-center py-1.5 uppercase tracking-wider">
                      ⭐ Best Price Nearby
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="font-bold text-[#191c1b] dark:text-white text-lg">{market.name}</h3>
                        <p className="text-[#6f7a6b] dark:text-[#d8dad9]/70 text-sm">{market.city}, {market.state}</p>
                      </div>
                      <div className="bg-[#f8faf8] dark:bg-[#191c1b] px-3 py-1 rounded-lg text-sm font-bold text-[#186a22] dark:text-[#a3f69c]">
                        {market.distance} km
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 mb-4">
                      <div>
                        <p className="text-xs text-[#6f7a6b] dark:text-[#d8dad9]/70 uppercase tracking-wider font-semibold mb-1">{commodity} Price</p>
                        <p className="text-2xl font-bold text-[#191c1b] dark:text-white">₹{market.currentPrice}</p>
                        <p className="text-xs text-[#6f7a6b] dark:text-[#d8dad9]/50">per quintal</p>
                      </div>
                      
                      <div className={`flex flex-col justify-center px-3 py-2 rounded-xl mt-4 ${market.trend === 'up' ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400' : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'}`}>
                        <span className="text-sm font-bold flex items-center gap-1">
                          {market.trend === 'up' ? '↑' : '↓'} {market.trendPercentage}%
                        </span>
                        <span className="text-xs">vs last week</span>
                      </div>
                    </div>

                    <div className="flex gap-2 mt-4">
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMarket(market);
                          mapRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex-1 bg-[#f2f4f2] dark:bg-[#191c1b] text-[#191c1b] dark:text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#e1e3e1] dark:hover:bg-white/10 transition-colors"
                      >
                        🗺️ View on Map
                      </button>
                      <a 
                        href={`https://www.google.com/maps/dir/?api=1&destination=${market.lat},${market.lng}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 bg-[#186a22] text-white font-semibold py-2.5 rounded-xl text-sm hover:bg-[#005312] transition-colors text-center"
                        onClick={(e) => e.stopPropagation()}
                      >
                        🧭 Directions
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Right Column: Map View */}
            <div className="lg:col-span-3 h-[500px] lg:h-auto min-h-[600px] bg-white dark:bg-[#2e3130] rounded-2xl border border-[#bfcab9]/30 dark:border-white/10 overflow-hidden shadow-sm flex flex-col" ref={mapRef}>
              <div className="p-4 border-b border-[#bfcab9]/30 dark:border-white/10 flex justify-between items-center bg-[#f8faf8] dark:bg-[#2e3130]">
                <h3 className="font-bold text-[#191c1b] dark:text-white">Map View</h3>
                {selectedMarket && (
                  <span className="text-sm font-medium text-[#186a22] dark:text-[#a3f69c]">Showing: {selectedMarket.name}</span>
                )}
              </div>
              
              <div className="flex-1 relative w-full h-full bg-[#e1e3e1] dark:bg-[#191c1b]">
                {selectedMarket ? (
                  <iframe 
                    width="100%" 
                    height="100%" 
                    style={{ border: 0 }} 
                    loading="lazy" 
                    allowFullScreen 
                    referrerPolicy="no-referrer-when-downgrade" 
                    src={`https://maps.google.com/maps?q=${selectedMarket.lat},${selectedMarket.lng}&z=14&output=embed`}
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#6f7a6b] dark:text-[#d8dad9]/50">
                    Select a market to view map
                  </div>
                )}
              </div>

              {/* Map Info Overlay */}
              {selectedMarket && selectedMarket.recommendedAction && (
                <div className="p-4 bg-green-50 dark:bg-green-900/20 border-t border-green-200 dark:border-green-800">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">💡</span>
                    <div>
                      <p className="font-bold text-green-800 dark:text-green-400">Smart Recommendation</p>
                      <p className="text-sm text-green-700 dark:text-green-500 mt-1">{selectedMarket.recommendedAction}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

          </div>
        )}
      </main>
    </div>
  );
}
