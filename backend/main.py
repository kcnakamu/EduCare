import pyaudio
import asyncio
import json
import os
import websockets
from datetime import datetime, timedelta
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
import spacy

# Load scispaCy model for medical NLP
nlp = spacy.load("en_core_sci_sm")

# Load environment variables from .env file
load_dotenv()
API_KEY = os.getenv("DEEPGRAM_API_KEY")

if not API_KEY:
    raise ValueError("🔴 ERROR: Deepgram API key is not set in the .env file.")

# Initialize Firebase
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# Configuration
FORMAT = pyaudio.paInt16
CHANNELS = 1
RATE = 16000
CHUNK = 8000
audio_queue = asyncio.Queue()

# Initialize variables
speaker_transcripts = {0: [], 1: []}  # Track doctor and patient notes by speaker ID

def mic_callback(input_data, frame_count, time_info, status_flag):
    """Handles microphone data streaming."""
    audio_queue.put_nowait(input_data)
    return (input_data, pyaudio.paContinue)

async def run():
    """Establishes connection with Deepgram and streams microphone data."""
    url = "wss://api.deepgram.com/v1/listen?diarize=true&punctuate=true&encoding=linear16&sample_rate=16000"
    headers = {"Authorization": f"Token {API_KEY}"}

    async with websockets.connect(url, extra_headers=headers) as ws:
        print("🟢 Successfully opened Deepgram streaming connection.")

        async def sender():
            """Streams audio data from the microphone."""
            try:
                while True:
                    mic_data = await audio_queue.get()
                    await ws.send(mic_data)
            except websockets.exceptions.ConnectionClosedOK:
                await ws.send(json.dumps({"type": "CloseStream"}))
                print("🟢 Closed Deepgram connection.")
            except Exception as e:
                print(f"Error during streaming: {e}")

        async def receiver():
            """Receives and prints transcription results."""
            async for msg in ws:
                res = json.loads(msg)
                if res.get("is_final"):
                    process_transcription(res)

        async def microphone():
            """Captures microphone input."""
            audio = pyaudio.PyAudio()
            stream = audio.open(
                format=FORMAT,
                channels=CHANNELS,
                rate=RATE,
                input=True,
                frames_per_buffer=CHUNK,
                stream_callback=mic_callback,
            )
            stream.start_stream()

            while stream.is_active():
                await asyncio.sleep(0.1)

            stream.stop_stream()
            stream.close()

        await asyncio.gather(microphone(), sender(), receiver())

def process_transcription(res):
    """Processes and categorizes the transcription by speaker."""
    words = res["channel"]["alternatives"][0].get("words", [])
    for word_info in words:
        speaker = word_info.get("speaker", "unknown")
        word = word_info["word"]
        speaker_transcripts[speaker].append(word)

        if "goodbye" in word.lower():
            print("🟢 'Goodbye' detected. Saving final transcript.")
            save_summary_to_firestore()

def generate_meeting_summary():
    """Generates a structured summary from the meeting."""
    # Extract key medical terms using scispaCy
    patient_notes = " ".join(speaker_transcripts[1])
    doctor_notes = " ".join(speaker_transcripts[0])
    
    patient_doc = nlp(patient_notes)
    doctor_doc = nlp(doctor_notes)

    patient_keywords = [ent.text for ent in patient_doc.ents]
    doctor_keywords = [ent.text for ent in doctor_doc.ents]

    summary = {
        "meeting_minutes": len(patient_notes.split()) + len(doctor_notes.split()),
        "patient_concerns": patient_keywords,
        "doctor_diagnosis": doctor_keywords,
        "follow_up_required": "yes" if "follow" in doctor_notes.lower() else "no",
        "prescription_given": any(keyword.lower() in doctor_notes.lower() for keyword in ["medication", "drug", "prescription"]),
    }

    return summary

def save_summary_to_firestore():
    """Saves the generated summary to Firestore."""
    summary = generate_meeting_summary()
    timestamp = datetime.now().isoformat()

    data = {
        "doctor_notes": " ".join(speaker_transcripts[0]),
        "patient_notes": " ".join(speaker_transcripts[1]),
        "summary": summary,
        "timestamp": timestamp
    }

    doc_ref = db.collection("meeting_summaries").document()
    doc_ref.set(data)
    print("🟢 Meeting summary saved to Firestore.")

def main():
    try:
        print("🎤 Starting microphone stream...")
        asyncio.run(run())
    except Exception as e:
        print(f"🔴 ERROR: {e}")

if __name__ == "__main__":
    main()
