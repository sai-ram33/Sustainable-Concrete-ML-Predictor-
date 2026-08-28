from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import pandas as pd
import joblib
import os

# ==========================================
# 1. CREATE THE FLASK APP
#    static_folder points to your frontend folder (one level up).
#    static_url_path="" means files there are served directly at
#    the root URL, e.g. frontend/style.css -> yoursite.com/style.css
# ==========================================
app = Flask(__name__, static_folder="../frontend", static_url_path="")
CORS(app)  # Enable CORS for all routes

# ==========================================
# 2. LOAD ALL MODELS ONCE, WHEN THE SERVER STARTS
# ==========================================
MODELS_DIR = os.path.join(os.path.dirname(__file__), "models")

rf_compressive = joblib.load(os.path.join(MODELS_DIR, "rf_compressive.pkl"))
rf_split = joblib.load(os.path.join(MODELS_DIR, "rf_split.pkl"))
rf_flexural = joblib.load(os.path.join(MODELS_DIR, "rf_flexural.pkl"))
rf_absorption = joblib.load(os.path.join(MODELS_DIR, "rf_absorption.pkl"))
rf_sorptivity = joblib.load(os.path.join(MODELS_DIR, "rf_sorptivity.pkl"))
rf_acid = joblib.load(os.path.join(MODELS_DIR, "rf_acid.pkl"))

strength_features = joblib.load(os.path.join(MODELS_DIR, "strength_features.pkl"))
durability_features = joblib.load(os.path.join(MODELS_DIR, "durability_features.pkl"))
acid_features = joblib.load(os.path.join(MODELS_DIR, "acid_features.pkl"))

print("All models loaded. Flask server ready.")


# ==========================================
# 3. PREDICTION FUNCTION
# ==========================================
def predict_concrete_properties(mix, include_acid=False):
    df = pd.DataFrame([mix])
    results = {}

    strength_input = df[strength_features]
    results["CompressiveStrength_MPa"] = float(rf_compressive.predict(strength_input)[0])
    results["SplitTensileStrength_MPa"] = float(rf_split.predict(strength_input)[0])
    results["FlexuralStrength_MPa"] = float(rf_flexural.predict(strength_input)[0])

    durability_input = df[durability_features]
    results["WaterAbsorption_pct"] = float(rf_absorption.predict(durability_input)[0])
    results["Sorptivity_mm_per_sqrt_s"] = float(rf_sorptivity.predict(durability_input)[0])

    if include_acid:
        acid_input = df[acid_features]
        loss = float(rf_acid.predict(acid_input)[0])
        results["AcidStrengthLoss_pct"] = loss
        results["AcidStrengthRetention_pct"] = round(100 - loss, 3)
    else:
        results["AcidStrengthLoss_pct"] = 0.0
        results["AcidStrengthRetention_pct"] = 100.0

    return results


# ==========================================
# 4. ROUTES
# ==========================================

@app.route("/")
def home():
    return send_from_directory(app.static_folder, "index.html")


@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()
    include_acid = bool(data.get("acid_attack", False))

    mix = {
        "Cement_kg_m3": float(data["Cement_kg_m3"]),
        "Water_kg_m3": float(data["Water_kg_m3"]),
        "Fine_Aggregate_Sand_kg_m3": float(data["Fine_Aggregate_Sand_kg_m3"]),
        "Coarse_Aggregate_kg_m3": float(data["Coarse_Aggregate_kg_m3"]),
        "FlyAsh_pct": float(data["FlyAsh_pct"]),
        "GGBS_pct": float(data["GGBS_pct"]),
        "SilicaFume_pct": float(data["SilicaFume_pct"]),
        "RHA_pct": float(data["RHA_pct"]),
        "Water_Binder_Ratio": float(data["Water_Binder_Ratio"]),
        "Curing_Age_days": float(data["Curing_Age_days"]),
        "Curing_Condition": data["Curing_Condition"],
    }

    if include_acid:
        mix["Acid_Type"] = data["Acid_Type"]
        mix["Acid_Concentration_pct"] = float(data["Acid_Concentration_pct"])
        mix["Acid_Exposure_Duration_days"] = float(data["Acid_Exposure_Duration_days"])
        mix["Acid_Exposure_Condition"] = data["Acid_Exposure_Condition"]

    result = predict_concrete_properties(mix, include_acid=include_acid)

    # Predict strength at 4 fixed ages, for the chart
    chart_ages = [3, 7, 28, 90]
    chart_data = {"ages": chart_ages, "compressive": [], "split": [], "flexural": []}
    for age in chart_ages:
        age_mix = dict(mix)
        age_mix["Curing_Age_days"] = age
        strength_input = pd.DataFrame([age_mix])[strength_features]
        chart_data["compressive"].append(float(rf_compressive.predict(strength_input)[0]))
        chart_data["split"].append(float(rf_split.predict(strength_input)[0]))
        chart_data["flexural"].append(float(rf_flexural.predict(strength_input)[0]))

    return jsonify({"result": result, "chart": chart_data})


@app.route("/api/model-info")
def model_info():
    csv_path = os.path.join(MODELS_DIR, "final_results_summary.csv")
    df = pd.read_csv(csv_path)
    return jsonify(df.to_dict(orient="records"))


# ==========================================
# 5. RUN THE SERVER (local testing only —
#    deployment will use gunicorn instead, see below)
# ==========================================
if __name__ == "__main__":
    app.run(debug=True)