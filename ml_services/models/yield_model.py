import random

# Comprehensive crop database with agronomic data
CROP_DATA = {
    'rice':       {'base_yield': 4.5,  'price_qtl': 2183,  'season': 'Kharif', 'duration': '120-150 days', 'unit': 'tonnes', 'water': 'High'},
    'wheat':      {'base_yield': 3.2,  'price_qtl': 2275,  'season': 'Rabi',   'duration': '110-130 days', 'unit': 'tonnes', 'water': 'Moderate'},
    'maize':      {'base_yield': 5.8,  'price_qtl': 2090,  'season': 'Kharif', 'duration': '90-110 days',  'unit': 'tonnes', 'water': 'Moderate'},
    'soybean':    {'base_yield': 2.2,  'price_qtl': 4600,  'season': 'Kharif', 'duration': '90-100 days',  'unit': 'tonnes', 'water': 'Moderate'},
    'cotton':     {'base_yield': 1.8,  'price_qtl': 6620,  'season': 'Kharif', 'duration': '150-180 days', 'unit': 'tonnes', 'water': 'Moderate'},
    'sugarcane':  {'base_yield': 70.0, 'price_qtl': 315,   'season': 'Annual', 'duration': '12-18 months', 'unit': 'tonnes', 'water': 'Very High'},
    'groundnut':  {'base_yield': 2.0,  'price_qtl': 6377,  'season': 'Kharif', 'duration': '100-120 days', 'unit': 'tonnes', 'water': 'Moderate'},
    'chickpea':   {'base_yield': 1.4,  'price_qtl': 5440,  'season': 'Rabi',   'duration': '90-110 days',  'unit': 'tonnes', 'water': 'Low'},
    'mustard':    {'base_yield': 1.8,  'price_qtl': 5650,  'season': 'Rabi',   'duration': '100-120 days', 'unit': 'tonnes', 'water': 'Low'},
    'onion':      {'base_yield': 25.0, 'price_qtl': 2200,  'season': 'Rabi',   'duration': '100-130 days', 'unit': 'tonnes', 'water': 'Moderate'},
    'tomato':     {'base_yield': 35.0, 'price_qtl': 1800,  'season': 'Annual', 'duration': '70-90 days',   'unit': 'tonnes', 'water': 'High'},
    'potato':     {'base_yield': 25.0, 'price_qtl': 1200,  'season': 'Rabi',   'duration': '90-110 days',  'unit': 'tonnes', 'water': 'High'},
    'turmeric':   {'base_yield': 7.5,  'price_qtl': 13500, 'season': 'Kharif', 'duration': '7-9 months',   'unit': 'tonnes', 'water': 'High'},
    'moong':      {'base_yield': 1.0,  'price_qtl': 8558,  'season': 'Kharif', 'duration': '60-75 days',   'unit': 'tonnes', 'water': 'Low'},
}

SOIL_MULTIPLIERS = {
    'loamy':  1.15,
    'clay':   0.90,
    'sandy':  0.75,
    'silt':   1.05,
    'red':    0.95,
    'black':  1.10,
    'alluvial': 1.20,
}

FERTILIZER_MULTIPLIERS = {
    'chemical':   1.20,
    'organic':    1.05,
    'integrated': 1.25,
    'none':       0.80,
}

IRRIGATION_MULTIPLIERS = {
    'drip':      1.30,
    'sprinkler': 1.15,
    'flood':     1.00,
    'rainfed':   0.85,
}

def predict_yield(inputs: dict) -> dict:
    crop = inputs.get('crop', 'rice').lower().strip()
    area = max(float(inputs.get('area', 1.0)), 0.01)
    rainfall = float(inputs.get('rainfall', 100))
    temperature = float(inputs.get('temperature', 25))
    soil_type = inputs.get('soilType', 'loamy').lower()
    fertilizer = inputs.get('fertilizer', 'chemical').lower()
    irrigation = (inputs.get('irrigation') or 'flood').lower()
    season = (inputs.get('season') or '').lower()

    crop_info = CROP_DATA.get(crop, CROP_DATA['rice'])
    base_yield = crop_info['base_yield']

    # ── Factor calculations ───────────────────────────────────────
    # Rainfall factor
    if rainfall < 30:
        rain_factor = 0.60
    elif 30 <= rainfall < 80:
        rain_factor = 0.85
    elif 80 <= rainfall <= 250:
        rain_factor = 1.10
    elif 250 < rainfall <= 400:
        rain_factor = 1.00
    else:
        rain_factor = 0.75  # waterlogging

    # Temperature factor (crop-specific optimal range ~25-30°C)
    if 20 <= temperature <= 32:
        temp_factor = 1.05
    elif 15 <= temperature < 20 or 32 < temperature <= 38:
        temp_factor = 0.90
    else:
        temp_factor = 0.75

    soil_factor = SOIL_MULTIPLIERS.get(soil_type, 1.0)
    fertilizer_factor = FERTILIZER_MULTIPLIERS.get(fertilizer, 1.0)
    irrigation_factor = IRRIGATION_MULTIPLIERS.get(irrigation, 1.0)

    # Small random variance ±5%
    variance = random.uniform(0.95, 1.05)

    # Combined yield prediction
    yield_per_ha = (base_yield * rain_factor * temp_factor *
                    soil_factor * fertilizer_factor * irrigation_factor * variance)
    yield_per_ha = round(yield_per_ha, 2)

    total_yield = round(yield_per_ha * area, 2)
    total_yield_qtl = round(total_yield * 10, 1)  # tonnes → quintals

    # Revenue calculation (prices per quintal)
    price_per_qtl = crop_info['price_qtl']
    estimated_revenue = round(total_yield_qtl * price_per_qtl)
    cost_per_ha = _estimate_cost(crop, fertilizer, irrigation, area)
    profit = estimated_revenue - cost_per_ha

    # Confidence score based on input completeness
    confidence = 75
    if irrigation != 'rainfed': confidence += 5
    if fertilizer != 'none': confidence += 5
    if soil_type != 'sandy': confidence += 5
    confidence = min(confidence + random.randint(0, 8), 97)

    # Factor breakdown for display
    factors = [
        {'name': 'Soil Quality',   'impact': soil_factor,      'label': soil_type.capitalize()},
        {'name': 'Rainfall',       'impact': rain_factor,      'label': f'{rainfall} mm'},
        {'name': 'Temperature',    'impact': temp_factor,      'label': f'{temperature}°C'},
        {'name': 'Fertilizer',     'impact': fertilizer_factor,'label': fertilizer.capitalize()},
        {'name': 'Irrigation',     'impact': irrigation_factor,'label': irrigation.capitalize()},
    ]

    # Tips
    tips = _generate_tips(rain_factor, soil_type, fertilizer, irrigation, crop)

    # Monthly yield projection (simulate month-wise)
    monthly = _monthly_projection(crop, crop_info['duration'], total_yield)

    return {
        'crop': crop.capitalize(),
        'areaHectares': area,
        'season': crop_info['season'],
        'duration': crop_info['duration'],
        'waterRequirement': crop_info['water'],
        'yieldPerHectare': yield_per_ha,
        'totalYield': total_yield,
        'totalYieldQuintals': total_yield_qtl,
        'unit': crop_info['unit'],
        'estimatedRevenue': estimated_revenue,
        'estimatedCost': cost_per_ha,
        'estimatedProfit': profit,
        'pricePerQuintal': price_per_qtl,
        'confidence': confidence,
        'factors': factors,
        'tips': tips,
        'monthlyProjection': monthly,
    }


def _estimate_cost(crop, fertilizer, irrigation, area):
    """Rough per-area cost estimate in INR"""
    base_costs = {
        'rice': 45000, 'wheat': 30000, 'maize': 28000, 'soybean': 25000,
        'cotton': 55000, 'sugarcane': 80000, 'groundnut': 35000,
        'chickpea': 20000, 'mustard': 22000, 'onion': 60000,
        'tomato': 80000, 'potato': 70000, 'turmeric': 100000, 'moong': 18000,
    }
    base = base_costs.get(crop, 30000)
    fert_cost = {'chemical': 1.1, 'organic': 1.05, 'integrated': 1.15, 'none': 0.90}
    irr_cost = {'drip': 1.20, 'sprinkler': 1.10, 'flood': 1.0, 'rainfed': 0.85}
    total = base * fert_cost.get(fertilizer, 1.0) * irr_cost.get(irrigation, 1.0) * area
    return round(total)


def _generate_tips(rain_factor, soil_type, fertilizer, irrigation, crop):
    tips = []
    if rain_factor < 0.85:
        tips.append('💧 Rainfall is low — consider supplemental irrigation or drought-resistant varieties.')
    if rain_factor > 1.05:
        tips.append('🌧️ Good rainfall — ensure proper drainage to prevent waterlogging.')
    if soil_type == 'sandy':
        tips.append('🌱 Sandy soil drains fast — add organic compost to improve water retention.')
    if fertilizer == 'none':
        tips.append('🧪 Apply balanced NPK fertilizer to boost yield by up to 20%.')
    if fertilizer == 'integrated':
        tips.append('✅ Integrated nutrient management is optimal — excellent choice.')
    if irrigation == 'drip':
        tips.append('💧 Drip irrigation saves 30-40% water — great for water efficiency.')
    if irrigation == 'rainfed':
        tips.append('☔ Rainfed farming is risky — consider micro-irrigation for yield stability.')
    if crop in ['tomato', 'onion', 'potato']:
        tips.append('🌡️ Monitor temperature closely — this crop is sensitive to heat stress.')
    if not tips:
        tips.append('✅ Your inputs look well-balanced. Continue with recommended crop management.')
    return tips[:3]


def _monthly_projection(crop, duration, total_yield):
    """Simulate cumulative yield growth month by month"""
    months = 4 if 'month' not in duration else 6
    projection = []
    for i in range(1, months + 1):
        # S-curve growth
        progress = (i / months) ** 1.5
        projection.append({
            'month': f'Month {i}',
            'cumulativeYield': round(total_yield * progress, 2),
            'growthStage': ['Germination', 'Vegetative', 'Flowering', 'Grain Fill', 'Maturity', 'Harvest'][min(i - 1, 5)],
        })
    return projection
