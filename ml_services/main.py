from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Import dummy model functions
from models.crop_model import predict_crop
from models.disease_model import predict_disease
from models.yield_model import predict_yield
from models.price_model import predict_price, get_all_prices, STATE_MANDI

app = FastAPI(title="KesaanConnect ML Microservices")

# Allow CORS for local development/Express backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class CropInput(BaseModel):
    N: float
    P: float
    K: float
    temperature: float
    humidity: float
    ph: float
    rainfall: float

class YieldInput(BaseModel):
    crop: str
    area: float
    soilType: str
    rainfall: float
    temperature: float = None
    fertilizer: str = None
    irrigation: str = None
    season: str = None

@app.get("/health")
def health_check():
    return {"status": "ok", "message": "ML Microservices are running"}

@app.post("/predict/crop")
def get_crop_recommendation(data: CropInput):
    result = predict_crop(data.dict())
    return {"success": True, "data": result}

@app.post("/predict/disease")
async def get_disease_detection(image: UploadFile = File(...)):
    # Read image bytes if needed for real CNN model
    content = await image.read()
    result = predict_disease(image.filename, content)
    return {"success": True, "data": result}

@app.post("/predict/yield")
def get_yield_prediction(data: YieldInput):
    result = predict_yield(data.dict())
    return {"success": True, "data": result}

@app.get("/predict/price")
def get_price_forecast(crop: str, state: str = None):
    result = predict_price(crop, state)
    return {"success": True, "data": result}

@app.get("/predict/prices/all")
def get_all_prices_endpoint(state: str = None):
    result = get_all_prices(state)
    return {"success": True, "data": result}

@app.get("/predict/states")
def get_states():
    return {"success": True, "data": list(STATE_MANDI.keys())}

@app.get("/predict/mandis")
def get_mandis(state: str):
    info = STATE_MANDI.get(state, None)
    if not info:
        return {"success": False, "message": "State not found"}
    return {"success": True, "data": info['mandis']}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
