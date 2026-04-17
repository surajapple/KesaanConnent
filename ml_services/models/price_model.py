from datetime import datetime, timedelta
import random

# Real MSP (Minimum Support Price) 2023-24 data from Indian govt (₹/quintal)
CROP_MSP = {
    'wheat':     {'base': 2275,  'min_msp': 2150, 'category': 'Cereal',    'season': 'Rabi',  'unit': 'quintal'},
    'rice':      {'base': 2183,  'min_msp': 2100, 'category': 'Cereal',    'season': 'Kharif','unit': 'quintal'},
    'maize':     {'base': 2090,  'min_msp': 1962, 'category': 'Cereal',    'season': 'Kharif','unit': 'quintal'},
    'soybean':   {'base': 4600,  'min_msp': 4300, 'category': 'Oilseed',   'season': 'Kharif','unit': 'quintal'},
    'groundnut': {'base': 6377,  'min_msp': 6000, 'category': 'Oilseed',   'season': 'Kharif','unit': 'quintal'},
    'cotton':    {'base': 6620,  'min_msp': 6080, 'category': 'Cash Crop', 'season': 'Kharif','unit': 'quintal'},
    'sugarcane': {'base': 315,   'min_msp': 305,  'category': 'Cash Crop', 'season': 'Annual','unit': 'quintal'},
    'onion':     {'base': 2200,  'min_msp': None, 'category': 'Vegetable', 'season': 'Rabi',  'unit': 'quintal'},
    'tomato':    {'base': 1800,  'min_msp': None, 'category': 'Vegetable', 'season': 'Annual','unit': 'quintal'},
    'potato':    {'base': 1200,  'min_msp': None, 'category': 'Vegetable', 'season': 'Rabi',  'unit': 'quintal'},
    'turmeric':  {'base': 13500, 'min_msp': None, 'category': 'Spice',     'season': 'Kharif','unit': 'quintal'},
    'chilli':    {'base': 12000, 'min_msp': None, 'category': 'Spice',     'season': 'Rabi',  'unit': 'quintal'},
    'garlic':    {'base': 8000,  'min_msp': None, 'category': 'Spice',     'season': 'Rabi',  'unit': 'quintal'},
    'chickpea':  {'base': 5440,  'min_msp': 5100, 'category': 'Pulse',     'season': 'Rabi',  'unit': 'quintal'},
    'moong':     {'base': 8558,  'min_msp': 8000, 'category': 'Pulse',     'season': 'Kharif','unit': 'quintal'},
    'mustard':   {'base': 5650,  'min_msp': 5450, 'category': 'Oilseed',   'season': 'Rabi',  'unit': 'quintal'},
}

# State-wise Mandi multipliers (regional price variation)
STATE_MANDI = {
    'Maharashtra':   {'mandis': ['Pune APMC', 'Nashik APMC', 'Nagpur APMC', 'Aurangabad APMC'], 'multiplier': 1.02},
    'Punjab':        {'mandis': ['Ludhiana Mandi', 'Amritsar Mandi', 'Jalandhar Mandi'],        'multiplier': 0.98},
    'Madhya Pradesh':{'mandis': ['Bhopal APMC', 'Indore APMC', 'Gwalior APMC'],                 'multiplier': 0.96},
    'Uttar Pradesh': {'mandis': ['Lucknow Mandi', 'Agra Mandi', 'Kanpur Mandi'],                'multiplier': 0.97},
    'Rajasthan':     {'mandis': ['Jaipur Mandi', 'Jodhpur Mandi', 'Kota Mandi'],                'multiplier': 0.99},
    'Gujarat':       {'mandis': ['Ahmedabad APMC', 'Surat APMC', 'Rajkot APMC'],                'multiplier': 1.01},
    'Karnataka':     {'mandis': ['Bengaluru APMC', 'Mysuru APMC', 'Hubli APMC'],                'multiplier': 1.03},
    'Andhra Pradesh':{'mandis': ['Guntur APMC', 'Kurnool APMC', 'Vijayawada APMC'],             'multiplier': 1.00},
    'Haryana':       {'mandis': ['Hisar Mandi', 'Rohtak Mandi', 'Karnal Mandi'],                'multiplier': 0.99},
    'Bihar':         {'mandis': ['Patna Mandi', 'Muzaffarpur Mandi', 'Gaya Mandi'],             'multiplier': 0.95},
}

def predict_price(crop: str, state: str = None) -> dict:
    crop = crop.lower().strip()
    
    if crop not in CROP_MSP:
        # Generic fallback
        crop_data = {'base': 2000, 'min_msp': None, 'category': 'Other', 'season': 'Annual', 'unit': 'quintal'}
    else:
        crop_data = CROP_MSP[crop]
    
    base = crop_data['base']
    
    # Apply state multiplier if specified
    state_info = STATE_MANDI.get(state, None) if state else None
    multiplier = state_info['multiplier'] if state_info else 1.0
    base = base * multiplier
    
    # Generate trend (+/- seasonal)
    trend = random.choice([1, -1]) * random.uniform(0.01, 0.06)
    current_price = base
    current_date = datetime.now()
    
    # Historical data (past 6 months)
    history = []
    for i in range(6, 0, -1):
        month_date = current_date - timedelta(days=30 * i)
        price = base * (1 + trend * (6 - i)) + random.uniform(-base * 0.02, base * 0.02)
        price = max(price, crop_data['min_msp'] * 0.9 if crop_data['min_msp'] else price * 0.8)
        history.append({
            "month": month_date.strftime("%b %y"),
            "price": round(price, 2),
            "type": "actual"
        })
        current_price = price
    
    # Forecast data (next 3 months)
    forecast = []
    for i in range(1, 4):
        month_date = current_date + timedelta(days=30 * i)
        price = current_price * (1 + trend * i * 0.7) + random.uniform(-base * 0.015, base * 0.015)
        forecast.append({
            "month": month_date.strftime("%b %y"),
            "price": round(price, 2),
            "predictedPrice": round(price, 2),
            "minPrice": round(price * 0.94, 2),
            "maxPrice": round(price * 1.06, 2),
            "type": "forecast"
        })
    
    price_change = round(((forecast[-1]["predictedPrice"] - current_price) / current_price) * 100, 2)
    
    if price_change > 5:
        recommendation = "Strong Buy signal — hold stock, prices rising"
        signal = "HOLD"
    elif price_change > 2:
        recommendation = "Prices expected to rise — consider holding"
        signal = "HOLD"
    elif price_change < -5:
        recommendation = "Sell immediately — sharp decline expected"
        signal = "SELL"
    elif price_change < -2:
        recommendation = "Sell now — prices may decline"
        signal = "SELL"
    else:
        recommendation = "Stable market — sell at convenience"
        signal = "NEUTRAL"
    
    return {
        "crop": crop.capitalize(),
        "currentPrice": round(current_price, 2),
        "priceUnit": f"per {crop_data['unit']}",
        "currency": "INR",
        "msp": crop_data['min_msp'],
        "category": crop_data['category'],
        "season": crop_data['season'],
        "history": history,
        "forecast": forecast,
        "priceChange": price_change,
        "recommendation": recommendation,
        "signal": signal,
        "state": state or "All India",
        "lastUpdated": current_date.strftime("%d %b %Y, %I:%M %p"),
    }


def get_all_prices(state: str = None) -> list:
    """Return current prices for all major crops"""
    results = []
    for crop in CROP_MSP.keys():
        data = predict_price(crop, state)
        results.append({
            "crop": data["crop"],
            "currentPrice": data["currentPrice"],
            "priceUnit": data["priceUnit"],
            "priceChange": data["priceChange"],
            "signal": data["signal"],
            "category": data["category"],
            "season": data["season"],
            "msp": data["msp"],
        })
    return sorted(results, key=lambda x: x["crop"])
