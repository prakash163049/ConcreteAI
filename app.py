"""
ConcreteAI — app.py
Flask backend for Concrete Compressive Strength Prediction System.
Uses a pre-trained Extra Trees Regressor (concrete_strength_model.pkl).
"""

import os
import pickle
import numpy as np
import pandas as pd
from flask import Flask, render_template, request, jsonify

# Column names — exactly as stored in the trained model's feature_names_in_
# Verified by: model.feature_names_in_
FEATURE_COLUMNS = ["cement", "slag", "ash", "water", "superplastic", "coarseagg", "fineagg", "age"]

# ─── App Setup ────────────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "concreteai-secret-key-2024")

# ─── Load Model ───────────────────────────────────────────────────
MODEL_PATH = os.path.join(os.path.dirname(__file__), "concrete_strength_model.pkl")

try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    print(f"[OK] Model loaded from {MODEL_PATH}")
except FileNotFoundError:
    model = None
    print(f"[WARN] Model file not found at {MODEL_PATH}. Predictions will be disabled.")
except Exception as e:
    model = None
    print(f"[ERROR] Failed to load model: {e}")


# ─── Routes ───────────────────────────────────────────────────────
@app.route("/")
def index():
    """Render the main page (no prediction yet)."""
    return render_template("index.html", prediction_text=None)


@app.route("/predict", methods=["POST"])
def predict():
    """
    Accept form data, run ML prediction, return updated page.

    Expected form fields:
        cement, slag, flyash, water, superplasticizer,
        coarseaggregate, fineaggregate, age
    """
    if model is None:
        error_msg = "Model not loaded. Please ensure concrete_strength_model.pkl exists."
        return render_template("index.html", prediction_text=error_msg)

    try:
        # Parse inputs (same order as training features)
        values = [
            float(request.form.get("cement",          0)),
            float(request.form.get("slag",             0)),
            float(request.form.get("flyash",           0)),
            float(request.form.get("water",            0)),
            float(request.form.get("superplasticizer", 0)),
            float(request.form.get("coarseaggregate",  0)),
            float(request.form.get("fineaggregate",    0)),
            float(request.form.get("age",              28)),
        ]

        # Wrap in DataFrame with training column names to avoid sklearn warnings
        try:
            features_df  = pd.DataFrame([values], columns=FEATURE_COLUMNS)
            prediction   = model.predict(features_df)[0]
        except Exception:
            # Fallback: plain numpy array (still works, may show a warning)
            features_df  = np.array([values])
            prediction   = model.predict(features_df)[0]

        result_text  = f"Predicted Compressive Strength: {prediction:.2f} MPa"

    except (ValueError, TypeError) as e:
        result_text = f"Invalid input values. Please check your entries. ({e})"
    except Exception as e:
        result_text = f"Prediction error: {e}"

    return render_template("index.html", prediction_text=result_text)


# ─── Optional JSON API endpoint ───────────────────────────────────
@app.route("/api/predict", methods=["POST"])
def api_predict():
    """
    JSON API endpoint for AJAX / external integrations.

    Request body (JSON):
        {
            "cement": 300,
            "slag": 0,
            "flyash": 0,
            "water": 180,
            "superplasticizer": 0,
            "coarseaggregate": 1000,
            "fineaggregate": 800,
            "age": 28
        }

    Response:
        { "prediction": 48.72, "unit": "MPa", "status": "success" }
    """
    if model is None:
        return jsonify({"status": "error", "message": "Model not loaded"}), 503

    try:
        data   = request.get_json(force=True)
        values = [
            float(data.get("cement",          0)),
            float(data.get("slag",             0)),
            float(data.get("flyash",           0)),
            float(data.get("water",            0)),
            float(data.get("superplasticizer", 0)),
            float(data.get("coarseaggregate",  0)),
            float(data.get("fineaggregate",    0)),
            float(data.get("age",             28)),
        ]
        try:
            features_df = pd.DataFrame([values], columns=FEATURE_COLUMNS)
            prediction  = float(model.predict(features_df)[0])
        except Exception:
            features_df = np.array([values])
            prediction  = float(model.predict(features_df)[0])
        return jsonify({
            "status":     "success",
            "prediction": round(prediction, 2),
            "unit":       "MPa",
        })
    except Exception as e:
        return jsonify({"status": "error", "message": str(e)}), 400


# ─── Entry Point ──────────────────────────────────────────────────
if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
