import pyaudio
import asyncio
import json
import os
import websockets
from datetime import datetime
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore

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
full_transcription = ""  # Store the complete transcription

def mic_callback(input_data, frame_count, time_info, status_flag):
    """Handles microphone data streaming."""
    audio_queue.put_nowait(input_data)
    return (input_data, pyaudio.paContinue)

async def run():
    """Establishes connection with Deepgram and streams microphone data."""
    url = "wss://api.deepgram.com/v1/listen?punctuate=true&encoding=linear16&sample_rate=16000"
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
            global full_transcription  # Use global to accumulate the transcript

            async for msg in ws:
                res = json.loads(msg)
                if res.get("is_final"):
                    transcript = (
                        res.get("channel", {})
                        .get("alternatives", [{}])[0]
                        .get("transcript", "")
                    )
                    if transcript:
                        print(f"Transcript: {transcript}")
                        full_transcription += f" {transcript}"  # Accumulate the full transcript

                    if "goodbye" in transcript.lower():
                        await ws.send(json.dumps({"type": "CloseStream"}))
                        print("🟢 'Goodbye' detected. Saving final transcript.")
                        save_full_transcription_to_firestore(full_transcription)

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

def save_full_transcription_to_firestore(transcript):
    """Saves the entire transcription session to Firestore."""
    doc_ref = db.collection("transcriptions").document()
    data = {
        "full_transcript": transcript.strip(),  # Remove leading/trailing spaces
        "timestamp": datetime.now().isoformat()
    }
    doc_ref.set(data)  # Save the full transcription as one document
    print("🟢 Full transcription saved to Firestore.")

def main():
    try:
        print("🎤 Starting microphone stream...")
        asyncio.run(run())
    except Exception as e:
        print(f"🔴 ERROR: {e}")

if __name__ == "__main__":
    main()
