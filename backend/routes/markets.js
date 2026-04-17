const express = require('express');
const router = express.Router();

// Mock database of APMC Markets for fallback/development
const MOCK_MARKETS = [
  { id: '1', name: 'Pune APMC (Gultekdi)', lat: 18.4960, lng: 73.8646, city: 'Pune', state: 'Maharashtra', commodities: { wheat: 2450, rice: 3200, onion: 1800, cotton: 7000, soybean: 4500 } },
  { id: '2', name: 'Lasalgaon APMC', lat: 20.1384, lng: 74.2255, city: 'Nashik', state: 'Maharashtra', commodities: { wheat: 2350, rice: 3100, onion: 1950, cotton: 7100, soybean: 4450 } },
  { id: '3', name: 'Navi Mumbai APMC (Vashi)', lat: 19.0805, lng: 73.0064, city: 'Navi Mumbai', state: 'Maharashtra', commodities: { wheat: 2500, rice: 3400, onion: 1750, cotton: 7200, soybean: 4600 } },
  { id: '4', name: 'Nashik APMC', lat: 19.9975, lng: 73.7898, city: 'Nashik', state: 'Maharashtra', commodities: { wheat: 2380, rice: 3150, onion: 1900, cotton: 7050, soybean: 4400 } },
  { id: '5', name: 'Solapur APMC', lat: 17.6599, lng: 75.9064, city: 'Solapur', state: 'Maharashtra', commodities: { wheat: 2400, rice: 3050, onion: 1600, cotton: 6900, soybean: 4300 } },
  { id: '6', name: 'Kolhapur APMC', lat: 16.7050, lng: 74.2433, city: 'Kolhapur', state: 'Maharashtra', commodities: { wheat: 2420, rice: 3250, onion: 1650, cotton: 6950, soybean: 4550 } },
  { id: '7', name: 'Jalgaon APMC', lat: 21.0077, lng: 75.5626, city: 'Jalgaon', state: 'Maharashtra', commodities: { wheat: 2300, rice: 2950, onion: 1550, cotton: 7300, soybean: 4200 } },
  { id: '8', name: 'Indore APMC (Choithram)', lat: 22.6933, lng: 75.8450, city: 'Indore', state: 'Madhya Pradesh', commodities: { wheat: 2250, rice: 2900, onion: 1500, cotton: 6800, soybean: 4800 } },
  { id: '9', name: 'Ahmedabad APMC', lat: 23.0037, lng: 72.5459, city: 'Ahmedabad', state: 'Gujarat', commodities: { wheat: 2350, rice: 3000, onion: 1700, cotton: 7400, soybean: 4700 } },
  { id: '10', name: 'Surat APMC', lat: 21.1966, lng: 72.8443, city: 'Surat', state: 'Gujarat', commodities: { wheat: 2400, rice: 3100, onion: 1750, cotton: 7350, soybean: 4750 } }
];

// Haversine formula to calculate distance in km
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// @route   GET /api/markets
// @desc    Get nearby APMC markets based on GPS coordinates
// @access  Public
router.get('/', async (req, res) => {
  try {
    const { lat, lng, commodity = 'wheat' } = req.query;
    
    if (!lat || !lng) {
      return res.status(400).json({ success: false, message: 'Latitude and longitude are required' });
    }

    const userLat = parseFloat(lat);
    const userLng = parseFloat(lng);

    // 1. Fetch data (Using mock data representing government AGMARKNET data)
    let markets = [...MOCK_MARKETS];

    // 2. Calculate distance for each market
    markets = markets.map(market => {
      const distance = calculateDistance(userLat, userLng, market.lat, market.lng);
      
      // Get price for requested commodity, default to wheat if not found
      const currentPrice = market.commodities[commodity.toLowerCase()] || market.commodities.wheat;
      
      // Simulate price trends (random for demo)
      const isTrendingUp = Math.random() > 0.5;
      const trendPercentage = (Math.random() * 5).toFixed(1);
      
      return {
        ...market,
        distance: parseFloat(distance.toFixed(1)),
        currentPrice,
        commodity: commodity,
        trend: isTrendingUp ? 'up' : 'down',
        trendPercentage
      };
    });

    // 3. Sort by distance
    markets.sort((a, b) => a.distance - b.distance);

    // 4. Take top 5 nearest markets
    const nearestMarkets = markets.slice(0, 5);

    // 5. Smart Features: Identify the best price among nearby markets
    if (nearestMarkets.length > 0) {
      let bestPriceMarket = nearestMarkets[0];
      nearestMarkets.forEach(m => {
        if (m.currentPrice > bestPriceMarket.currentPrice) {
          bestPriceMarket = m; // Highest selling price is best for farmer
        }
      });
      
      // Mark the best price market
      bestPriceMarket.isBestPrice = true;
      bestPriceMarket.recommendedAction = `Sell at ${bestPriceMarket.name} for higher profit (₹${bestPriceMarket.currentPrice}/quintal)`;
    }

    res.json({
      success: true,
      data: nearestMarkets
    });

  } catch (error) {
    console.error('Error fetching markets:', error);
    res.status(500).json({ success: false, message: 'Server Error while fetching markets' });
  }
});

module.exports = router;
