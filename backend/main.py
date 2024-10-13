from flask import Flask, request, jsonify
from flask_cors import CORS  # Import CORS to handle cross-origin requests
import pyaudio
import asyncio
import json
import os
import websockets
from datetime import datetime
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import spacy
from threading import Thread
from context import generate_report  # Import generate_report from context.py
from translate import translate

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}})

# Load environment variables
load_dotenv()

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/translate', methods=['POST'])
def translate_report():
    """Translate a report to the specified language and save it in Firestore."""
    try:
        data = request.get_json()
        document_id = data.get("document_id")
        language = data.get("language")

        if not document_id or not language:
            raise ValueError("Missing document_id or language in request.")

        # Perform translation
        translated_text = translate(document_id, language)

        # Save the translated report to Firestore
        translated_ref = db.collection("translated_report").document(document_id)
        translated_ref.set({
            "report": translated_text,
            "timestamp": firestore.SERVER_TIMESTAMP
        })

        print(f"🟢 Translated report saved to Firestore for document ID: {document_id}")
        return jsonify({"translated_report": translated_text}), 200

    except Exception as e:
        print(f"🔴 Error translating report: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/generate-report', methods=['POST'])
def generate_final_report():
    """
    Generate the final report and save it in Firestore.
    """
    try:
        data = request.get_json()
        print(f"📥 Received request data: {data}")

        summary_id = data.get('summary_id')
        parser_id = data.get('parser_id')

        if not summary_id or not parser_id:
            raise ValueError("Missing summary_id or parser_id in request.")

        # Generate the report using the function from context.py
        report = generate_report(summary_id, parser_id)

        # Save the report to Firestore
        final_summary_ref = db.collection("final_summary").document(summary_id)
        final_summary_ref.set({
            "report": report,
            "timestamp": firestore.SERVER_TIMESTAMP,
        })

        print("🟢 Report successfully saved to Firestore.")
        return jsonify({"message": "Report generated and saved successfully.", "report": report}), 200

    except Exception as e:
        print(f"🔴 Error generating report: {e}")
        return jsonify({"error": str(e)}), 500
    
if __name__ == '__main__':
    print("🎤 Starting Flask server...")
    app.run(host='0.0.0.0', port=5000)

# Load scispaCy model for medical NLP
nlp = spacy.load("en_core_sci_sm")

# Load environment variables from .env file
API_KEY = os.getenv("DEEPGRAM_API_KEY")

if not API_KEY:
    raise ValueError("🔴 ERROR: Deepgram API key is not set in the .env file.")

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

is_recording = False  # To track recording state
audio_queue = asyncio.Queue()  # Queue for audio streaming
speaker_transcripts = {0: [], 1: []}  # Track transcripts by speaker

def mic_callback(input_data, frame_count, time_info, status_flag):
    """Handles microphone data streaming."""
    audio_queue.put_nowait(input_data)
    return (input_data, pyaudio.paContinue)

@app.route('/start', methods=['POST'])
def start_recording():
    """Start recording."""
    global is_recording
    if not is_recording:
        is_recording = True
        Thread(target=run_recording).start()
        return jsonify({"message": "Recording started."}), 200
    return jsonify({"error": "Recording already in progress."}), 400

@app.route('/stop', methods=['POST'])
def stop_recording():
    """Stop recording and save transcript."""
    global is_recording
    if is_recording:
        is_recording = False
        save_summary_to_firestore()  # Save the transcript
        return jsonify({"message": "Recording stopped and transcript saved."}), 200
    return jsonify({"error": "No recording in progress."}), 400

def run_recording():
    """Run the recording process."""
    loop = asyncio.new_event_loop()  # Create a new event loop for the thread
    asyncio.set_event_loop(loop)
    loop.run_until_complete(run())  # Run the recording coroutine

async def run():
    """Stream audio data to Deepgram API."""
    url = "wss://api.deepgram.com/v1/listen?diarize=true&punctuate=true&encoding=linear16&sample_rate=16000"
    headers = {"Authorization": f"Token {API_KEY}"}

    async with websockets.connect(url, extra_headers=headers) as ws:
        print("🟢 Connected to Deepgram.")

        async def sender():
            """Send audio data."""
            try:
                while is_recording:
                    mic_data = await audio_queue.get()
                    await ws.send(mic_data)
            except websockets.exceptions.ConnectionClosedOK:
                await ws.send(json.dumps({"type": "CloseStream"}))
                print("🟢 Closed Deepgram connection.")

        async def receiver():
            """Receive transcription results."""
            async for msg in ws:
                res = json.loads(msg)
                if res.get("is_final"):
                    process_transcription(res)

        await asyncio.gather(sender(), receiver())

def process_transcription(res):
    """Process transcription results."""
    words = res["channel"]["alternatives"][0].get("words", [])
    for word_info in words:
        speaker = word_info.get("speaker", "unknown")
        word = word_info["word"]
        speaker_transcripts[speaker].append(word)

        if "goodbye" in word.lower():
            print("🟢 'Goodbye' detected. Saving transcript.")
            save_summary_to_firestore()

def generate_meeting_summary():
    """Generate meeting summary."""
    patient_notes = " ".join(speaker_transcripts[1])
    doctor_notes = " ".join(speaker_transcripts[0])

    patient_keywords = [ent.text for ent in nlp(patient_notes).ents]
    doctor_keywords = [ent.text for ent in nlp(doctor_notes).ents]

    return {
        "meeting_minutes": len(patient_notes.split()) + len(doctor_notes.split()),
        "patient_concerns": patient_keywords,
        "doctor_diagnosis": doctor_keywords,
        "follow_up_required": "yes" if "follow" in doctor_notes.lower() else "no",
        "concise_summary": " ".join([
            f"Patient reported: {', '.join(patient_keywords)}.",
            f"Doctor diagnosed: {', '.join(doctor_keywords)}."
        ]),
    }

def save_summary_to_firestore():
    """Save summary to Firestore."""
    summary = generate_meeting_summary()
    timestamp = datetime.now().isoformat()
    data = {
        "doctor_notes": " ".join(speaker_transcripts[0]),
        "patient_notes": " ".join(speaker_transcripts[1]),
        "summary": summary,
        "timestamp": timestamp,
    }
    db.collection("meeting_summaries").document().set(data)
    print("🟢 Summary saved to Firestore.")

