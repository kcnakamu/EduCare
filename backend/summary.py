from google.cloud import firestore
from google.oauth2 import service_account
from openai import OpenAI

# Initialize Firestore client with credentials
credentials = service_account.Credentials.from_service_account_file(
    "/Users/siddharthareddy/Desktop/Developer/EduCare/EduCare/backend/serviceAccountKey.json"
)
db = firestore.Client(credentials=credentials)

# Initialize OpenAI client
client = OpenAI()

def summarize(document_id):
    """
    Fetch transcript from Firestore using document_id and generate a summary with OpenAI.
    Save the generated summary into Firestore under the 'openai_summary_1' collection.
    """
    try:
        # Fetch transcript from Firestore
        transcript = fetch_transcript(document_id)
        
        if not transcript:
            print("No transcript found for the given document ID.")
            return
        
        # Generate summary using OpenAI
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a medical assistant that generates detailed, concise, "
                        "and straightforward post-appointment reports for patients. "
                        "Based on the transcript, create a 5 sentence summary for the report."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Write a post-appointment report 5 sentence summary based on this transcript: {transcript}.",
                },
            ],
        )

        # Extract the generated summary text
        report_text = completion.choices[0].message.content

        # Save the summary to Firestore
        save_summary_to_firestore(document_id, report_text)

        print("Summary saved successfully in Firestore.")
        return report_text

    except Exception as e:
        print(f"Error during summarization: {str(e)}")

def fetch_transcript(document_id):
    """
    Fetch transcript from Firestore using the given document ID.
    """
    try:
        doc_ref = db.collection("meeting_summaries").document(document_id)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            return data.get("transcription", "")
        else:
            print("Document doesn't exist.")
            return None
    except Exception as e:
        print(f"Error fetching transcript: {str(e)}")
        return None

def save_summary_to_firestore(document_id, summary):
    """
    Save the generated summary to Firestore under the 'openai_summary_1' collection.
    """
    try:
        summary_ref = db.collection("openai_summary_1").document(document_id)
        summary_data = {"document_id": document_id, "summary": summary}

        # Save or update the summary document in Firestore
        summary_ref.set(summary_data)
    except Exception as e:
        print(f"Error saving summary to Firestore: {str(e)}")

if __name__ == "__main__":
    # Replace 'test_large' with your actual document ID
    generated_summary = summarize("test_large")
    print(f"Generated Summary: {generated_summary}")