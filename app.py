"""
NeuroConcrete — app.py
Flask backend for Concrete Compressive Strength Prediction System.
Uses a pre-trained Extra Trees Regressor (concrete_strength_model.pkl).
"""

import os
import pickle
import numpy as np
import pandas as pd
from flask import Flask, render_template, request, jsonify

# ─── Feature Columns ──────────────────────────────────────────────
# Must match the exact column names used during model training
FEATURE_COLUMNS = [
    "cement",
    "slag",
    "ash",
    "water",
    "superplastic",
    "coarseagg",
    "fineagg",
    "age",
]

# ─── App Factory ──────────────────────────────────────────────────
app = Flask(__name__)
app.secret_key = os.environ.get("SECRET_KEY", "concreteai-secret-2024")

# ─── Load Model ───────────────────────────────────────────────────
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "concrete_strength_model.pkl")

model = None
try:
    with open(MODEL_PATH, "rb") as f:
        model = pickle.load(f)
    print(f"[OK] Model loaded from {MODEL_PATH}")
except FileNotFoundError:
    print(f"[WARN] Model file not found at {MODEL_PATH}. Predictions will be disabled.")
except Exception as exc:
    print(f"[ERROR] Failed to load model: {exc}")


# ─── Helper ───────────────────────────────────────────────────────
def _run_prediction(values: list) -> float:
    """Run prediction using a DataFrame (avoids sklearn feature-name warnings)."""
    try:
        df = pd.DataFrame([values], columns=FEATURE_COLUMNS)
        return float(model.predict(df)[0])
    except Exception:
        # Fallback: plain numpy array
        arr = np.array([values], dtype=float)
        return float(model.predict(arr)[0])


# ─── Routes ───────────────────────────────────────────────────────
@app.route("/")
def index():
    """Render the main page."""
    return render_template("index.html", prediction_text=None)


@app.route("/predict", methods=["POST"])
def predict():
    """
    Handle HTML form submission and return an updated page.

    Form fields expected:
        cement, slag, flyash, water, superplasticizer,
        coarseaggregate, fineaggregate, age
    """
    if model is None:
        return render_template(
            "index.html",
            prediction_text="Model not loaded. Ensure concrete_strength_model.pkl exists.",
        )

    try:
        values = [
            float(request.form.get("cement",           0) or 0),
            float(request.form.get("slag",             0) or 0),
            float(request.form.get("flyash",           0) or 0),
            float(request.form.get("water",            0) or 0),
            float(request.form.get("superplasticizer", 0) or 0),
            float(request.form.get("coarseaggregate",  0) or 0),
            float(request.form.get("fineaggregate",    0) or 0),
            float(request.form.get("age",             28) or 28),
        ]

        prediction = _run_prediction(values)
        result_text = f"Predicted Compressive Strength: {prediction:.2f} MPa"

    except (ValueError, TypeError) as exc:
        result_text = f"Invalid input values. Please check your entries. ({exc})"
    except Exception as exc:
        result_text = f"Prediction error: {exc}"

    return render_template("index.html", prediction_text=result_text)


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
        data = request.get_json(force=True, silent=True)
        if not data:
            return jsonify({"status": "error", "message": "Invalid or missing JSON body"}), 400

        values = [
            float(data.get("cement",           0) or 0),
            float(data.get("slag",             0) or 0),
            float(data.get("flyash",           0) or 0),
            float(data.get("water",            0) or 0),
            float(data.get("superplasticizer", 0) or 0),
            float(data.get("coarseaggregate",  0) or 0),
            float(data.get("fineaggregate",    0) or 0),
            float(data.get("age",             28) or 28),
        ]

        prediction = _run_prediction(values)
        return jsonify({
            "status":     "success",
            "prediction": round(prediction, 2),
            "unit":       "MPa",
        })

    except (ValueError, TypeError) as exc:
        return jsonify({"status": "error", "message": f"Invalid values: {exc}"}), 400
    except Exception as exc:
        return jsonify({"status": "error", "message": str(exc)}), 500


@app.route("/health")
def health():
    """Health-check endpoint for deployment platforms."""
    return jsonify({
        "status": "ok",
        "model_loaded": model is not None,
    })


# ─── Entry Point ──────────────────────────────────────────────────
if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "false").lower() == "true"
    app.run(debug=debug, host="0.0.0.0", port=port)
