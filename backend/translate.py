from google.cloud import firestore
from google.oauth2 import service_account
from openai import OpenAI

# Initialize Firestore client with credentials
credentials = service_account.Credentials.from_service_account_file(
    # "/Users/siddharthareddy/Desktop/Developer/EduCare/EduCare/backend/serviceAccountKey.json"
    "/Users/aquachat77/Documents/HackHarv/serviceAccountKey.json"
)
db = firestore.Client(credentials=credentials)

# Initialize OpenAI client
client = OpenAI()

def fetch_final_summary(document_id):
    """
    Fetch final summary from Firestore using the given document ID.
    """
    try:
        doc_ref = db.collection("final_summary").document(document_id)
        doc = doc_ref.get()
        if doc.exists:
            data = doc.to_dict()
            return data.get("report")
        else:
            print("Document doesn't exist.")
            return None
    except Exception as e:
        print(f"Error fetching transcript: {str(e)}")
        return None

def translate(final_summary_id, language):
    report = fetch_final_summary(final_summary_id)

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are given a post-appointment report in English. Translate to a language you are prompted; accuracy is very important. If you are unsure, include that you are."
                ),
            },
            {
                "role": "user",
                "content": f"Translate a post-appointment transcript to {language}: {report}.",
            },
        ],
    )

    return completion.choices[0].message.content

if __name__ == "__main__":
    print(translate("test_large","Spanish"))