from google.cloud import firestore
from google.oauth2 import service_account
from openai import OpenAI

credentials = service_account.Credentials.from_service_account_file(
    "/Users/aquachat77/Documents/HackHarv/serviceAccountKey.json"
)

# Initialize Firestore client with credentials
db = firestore.Client(credentials=credentials)


client = OpenAI()

def summarize(document_id):
    '''
    Fetch transcript from Firestore using document_id. Use OpenAI to generate a summary. 
    '''
    # Fetch transcript
    transcript = fetch_transcript(document_id)

    # Create Completion Model
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", 
            "content": "You are a medical assistant that generates detailed, concise, and straightforward post-appointment reports for patients. Based on the transcript, create a 5 sentence summary for the report."},
            {
                "role": "user",
                "content": f'Write a post-appointment report 5 sentence summary based on this transcript: {transcript}. Go straight into description, no header.'
            }
        ]
    )

    report_text = completion.choices[0].message.content
    return report_text


def fetch_transcript(document_id):
    '''
    Fetch transcript from Firestore.
    '''
    # Initialize Firebase using the service account key
    doc_ref = db.collection("meeting_summaries").document(document_id)
    doc = doc_ref.get()
    if doc.exists:
        data = doc.to_dict()
        return data['transcription']
    else:
        print("Document doesn't exist.")


if __name__ == "__main__":
    print(summarize("test_large"))


