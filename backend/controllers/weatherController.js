const axios = require('axios');

// GET /api/weather?location=...
const getWeather = async (req, res) => {
  try {
    const { location } = req.query;
    if (!location) return res.status(400).json({ success: false, message: 'location is required' });

    const API_KEY = process.env.OPENWEATHER_API_KEY;

    if (API_KEY && API_KEY !== 'your_openweather_key_here') {
      // Real OpenWeather API
      const currentRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=metric`
      );
      const forecastRes = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(location)}&appid=${API_KEY}&units=metric`
      );
      const current = currentRes.data;
      const forecast = forecastRes.data;

      const alerts = [];
      if (current.wind?.speed > 10) alerts.push({ type: 'warning', message: 'High wind speeds detected. Secure crops and structures.' });
      if (current.rain?.['1h'] > 5) alerts.push({ type: 'warning', message: 'Heavy rainfall in progress. Ensure proper drainage.' });

      return res.json({
        success: true,
        data: {
          location: current.name,
          current: {
            temp: current.main.temp,
            feels_like: current.main.feels_like,
            humidity: current.main.humidity,
            wind_speed: current.wind.speed,
            weather: current.weather[0].description,
            icon: current.weather[0].icon,
          },
          forecast: forecast.list.slice(0, 8).map((f) => ({
            time: f.dt_txt,
            temp: f.main.temp,
            humidity: f.main.humidity,
            weather: f.weather[0].description,
            icon: f.weather[0].icon,
            rain: f.rain?.['3h'] || 0,
          })),
          alerts,
        },
      });
    }

    // Mock response when no API key provided
    const days = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5'];
    const icons = ['01d', '02d', '10d', '01d', '03d'];
    const descs = ['Clear sky', 'Few clouds', 'Light rain', 'Sunny', 'Partly cloudy'];
    const temps = [28, 30, 24, 32, 27];

    res.json({
      success: true,
      mock: true,
      data: {
        location: location,
        current: {
          temp: 28, feels_like: 31, humidity: 65,
          wind_speed: 4.2, weather: 'Clear sky', icon: '01d',
        },
        forecast: days.map((day, i) => ({
          time: day, temp: temps[i], humidity: 60 + i * 3,
          weather: descs[i], icon: icons[i], rain: i === 2 ? 4.5 : 0,
        })),
        alerts: [
          { type: 'info', message: 'Add your OpenWeather API key in .env to get real weather data.' },
        ],
      },
    });
  } catch (err) {
    if (err.response?.status === 404) {
      return res.status(404).json({ success: false, message: 'Location not found' });
    }
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = { getWeather };
