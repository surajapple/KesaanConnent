import numpy as np
# from sklearn.ensemble import RandomForestClassifier

# Dummy crop rules replicating the previous JS logic, but in Python
# This is where you would load your trained Scikit-Learn model:
# model = joblib.load('crop_model.pkl')

def predict_crop(inputs: dict) -> dict:
    # Example inputs: {'N': 90, 'P': 42, 'K': 43, 'temperature': 21, 'humidity': 82, 'ph': 6.5, 'rainfall': 202}
    
    crops = [
        {"name": "Rice", "cond": {"N": [60,140], "P": [30,60], "K": [30,60], "temperature": [20,35], "humidity": [60,90], "ph": [5.5,7.0], "rainfall": [200,300]}},
        {"name": "Wheat", "cond": {"N": [60,120], "P": [30,60], "K": [30,60], "temperature": [10,25], "humidity": [40,70], "ph": [6.0,7.5], "rainfall": [50,100]}},
        {"name": "Maize", "cond": {"N": [60,140], "P": [30,80], "K": [20,60], "temperature": [18,35], "humidity": [50,80], "ph": [5.5,7.5], "rainfall": [60,110]}},
        {"name": "Cotton", "cond": {"N": [60,120], "P": [30,60], "K": [30,60], "temperature": [21,35], "humidity": [40,65], "ph": [6.0,8.0], "rainfall": [50,100]}},
        {"name": "Sugarcane", "cond": {"N": [100,200], "P": [30,70], "K": [50,90], "temperature": [24,38], "humidity": [50,80], "ph": [6.0,7.5], "rainfall": [100,200]}},
        {"name": "Tomato", "cond": {"N": [50,100], "P": [40,80], "K": [40,90], "temperature": [18,30], "humidity": [50,80], "ph": [5.5,7.0], "rainfall": [60,120]}},
    ]

    scored = []
    for crop in crops:
        score = 0
        total = 0
        for key, [min_val, max_val] in crop["cond"].items():
            total += 1
            val = inputs.get(key, 0)
            if min_val <= val <= max_val:
                score += 1
            else:
                # Partial score based on proximity
                mid = (min_val + max_val) / 2
                range_val = (max_val - min_val) / 2 or 1
                dist = abs(val - mid) / range_val
                score += max(0, 1 - dist * 0.5)
        
        confidence = int((score / total) * 100)
        scored.append({"name": crop["name"], "confidence": confidence})

    scored.sort(key=lambda x: x["confidence"], reverse=True)
    
    return {
        "crop": scored[0]["name"],
        "confidence": scored[0]["confidence"],
        "alternatives": [c["name"] for c in scored[1:4]]
    }
