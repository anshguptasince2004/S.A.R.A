from flask import Flask, request, jsonify, send_from_directory, send_file
import os
import shutil
from werkzeug.utils import secure_filename
from inference import run_inference
import base64
import pandas as pd
from flask_cors import CORS, cross_origin
from pdf_generator import generate_report_pdf

# ---------------- Configuration ----------------
UPLOAD_FOLDER = "uploads"
OUTPUT_FOLDER = "outputs"
ALLOWED_EXTENSIONS = {"csv"}

app = Flask(__name__)

# ✅ Allow frontend to access API
CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173"]}})

app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
app.config["OUTPUT_FOLDER"] = OUTPUT_FOLDER

# Ensure folders exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route("/generate-pdf", methods=["POST"])
def generate_pdf():
    try:
        data = request.json
        amendment_id = data.get("amendmentId")
        amendment_title = data.get("amendmentTitle", "Untitled Amendment")
        counts = data.get("counts", {})
        percentages = data.get("percentages", {})
        keywords = data.get("keywords", [])
        summaries = data.get("summaries", {})

        file_path = generate_report_pdf(amendment_id, amendment_title, counts, percentages, keywords, summaries)

        # --- Optional: store PDF to DB ---
        # with open(file_path, "rb") as f:
        #     pdf_bytes = f.read()
        #     # save pdf_bytes in MongoDB or another DB

        return send_file(file_path, as_attachment=True)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---------------- Utility Functions ----------------
def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def clear_folder(folder_path):
    """Deletes all files inside the given folder."""
    if os.path.exists(folder_path):
        for filename in os.listdir(folder_path):
            file_path = os.path.join(folder_path, filename)
            try:
                if os.path.isfile(file_path) or os.path.islink(file_path):
                    os.unlink(file_path)
                elif os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print(f"Failed to delete {file_path}. Reason: {e}")


def encode_image_to_base64(image_path):
    if os.path.exists(image_path):
        with open(image_path, "rb") as f:
            return base64.b64encode(f.read()).decode("utf-8")
    return None


# ---------------- Routes ----------------
# @app.route("/outputs/<filename>")
# def download_output(filename):
#     """Serve output files (CSV, wordclouds) directly."""
#     return send_from_directory(app.config["OUTPUT_FOLDER"], filename)


# @app.route("/analyze", methods=["POST"])
# def analyze():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files["file"]
        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400

        if not allowed_file(file.filename):
            return jsonify({"error": "Only CSV files are allowed"}), 400

        # Clear old files
        clear_folder(app.config["UPLOAD_FOLDER"])
        clear_folder(app.config["OUTPUT_FOLDER"])

        # Save uploaded CSV
        filename = secure_filename(file.filename)
        input_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
        file.save(input_path)

        # Prepare output CSV path
        output_filename = f"predicted_{filename}"
        output_path = os.path.join(app.config["OUTPUT_FOLDER"], output_filename)

        # Run inference (from inference.py)
        summaries = run_inference(input_path, output_path)

        # Load labeled CSV
        if not os.path.exists(output_path):
            return jsonify({"error": "Output CSV was not generated"}), 500

        df = pd.read_csv(output_path)
        if "label" not in df.columns:
            return jsonify({"error": "Output CSV missing 'label' column"}), 500

        counts = df["label"].value_counts().to_dict()
        counts_dict = {
            "negative": counts.get(0, 0),
            "neutral": counts.get(1, 0),
            "positive": counts.get(2, 0)
        }

        # WordCloud file paths
        negative_wc = os.path.join(app.config["OUTPUT_FOLDER"], "negative_wc.png")
        neutral_wc = os.path.join(app.config["OUTPUT_FOLDER"], "neutral_wc.png")
        positive_wc = os.path.join(app.config["OUTPUT_FOLDER"], "positive_wc.png")

        wordclouds = {
            "negative": {
                "base64": encode_image_to_base64(negative_wc),
                "url": f"/outputs/negative_wc.png"
            },
            "neutral": {
                "base64": encode_image_to_base64(neutral_wc),
                "url": f"/outputs/neutral_wc.png"
            },
            "positive": {
                "base64": encode_image_to_base64(positive_wc),
                "url": f"/outputs/positive_wc.png"
            }
        }

        response = {
            "sentiment_counts": counts_dict,
            "summaries": summaries,
            "wordclouds": wordclouds,
            "output_csv": f"/outputs/{output_filename}"  # direct link to CSV
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


@app.route("/analyze", methods=["POST"])
def analyze():
    try:
        if "file" not in request.files:
            return jsonify({"error": "No file part in the request"}), 400

        file = request.files["file"]
        amendment_id = request.form.get("amendmentId")  # 👈 get amendmentId
        if not amendment_id:
            return jsonify({"error": "Missing amendmentId"}), 400

        if file.filename == "":
            return jsonify({"error": "No file selected"}), 400
        if not allowed_file(file.filename):
            return jsonify({"error": "Only CSV files are allowed"}), 400

        # Amendment-specific folders
        amendment_upload_folder = os.path.join(app.config["UPLOAD_FOLDER"], amendment_id)
        amendment_output_folder = os.path.join(app.config["OUTPUT_FOLDER"], amendment_id)

        os.makedirs(amendment_upload_folder, exist_ok=True)
        os.makedirs(amendment_output_folder, exist_ok=True)

        # Clear only that amendment’s folders
        clear_folder(amendment_upload_folder)
        clear_folder(amendment_output_folder)

        # Save uploaded CSV
        filename = secure_filename(file.filename)
        input_path = os.path.join(amendment_upload_folder, filename)
        file.save(input_path)

        # Prepare output CSV path
        output_filename = f"predicted_{filename}"
        output_path = os.path.join(amendment_output_folder, output_filename)

        # Run inference
        summaries = run_inference(input_path, output_path)

        # Load labeled CSV
        if not os.path.exists(output_path):
            return jsonify({"error": "Output CSV was not generated"}), 500

        df = pd.read_csv(output_path)
        if "label" not in df.columns:
            return jsonify({"error": "Output CSV missing 'label' column"}), 500

        counts = df["label"].value_counts().to_dict()
        counts_dict = {
            "negative": counts.get(0, 0),
            "neutral": counts.get(1, 0),
            "positive": counts.get(2, 0)
        }

        # WordCloud paths
        wordclouds = {
            "negative": {"url": f"/outputs/{amendment_id}/negative_wc.png"},
            "neutral":  {"url": f"/outputs/{amendment_id}/neutral_wc.png"},
            "positive": {"url": f"/outputs/{amendment_id}/positive_wc.png"}
        }

        response = {
            "sentiment_counts": counts_dict,
            "summaries": summaries,
            "wordclouds": wordclouds,
            "output_csv": f"/outputs/{amendment_id}/{output_filename}"
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": f"Internal server error: {str(e)}"}), 500


# Serve per-amendment outputs
@app.route("/outputs/<amendment_id>/<filename>")
def download_output(amendment_id, filename):
    folder = os.path.join(app.config["OUTPUT_FOLDER"], amendment_id)
    return send_from_directory(folder, filename)


# ---------------- Run App ----------------
if __name__ == "__main__":
    # host=0.0.0.0 lets frontend reach backend if needed
    app.run(host="0.0.0.0", port=5000, debug=False)
