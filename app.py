from flask import Flask, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enables CORS for all routes

@app.route("/upload", methods=["POST"])
def upload_audio():
    if "audio" not in request.files:
        return "No audio file uploaded", 400

    audio_file = request.files["audio"]
    # Just a placeholder for any further processing of the audio file
    print(f"Received file: {audio_file.filename}")


if __name__ == "__main__":
    app.run(debug=True)
