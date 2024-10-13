from google.cloud import firestore
from google.oauth2 import service_account
from openai import OpenAI

# Initialize Firestore client with credentials
credentials = service_account.Credentials.from_service_account_file(
    "serviceAccountKey.json"
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

        if doc.exists:  # Correct usage: .exists is a property, not callable
            data = doc.to_dict()
            return data.get("report", None)  # Return None if report field doesn't exist
        else:
            print(f"Document with ID {document_id} doesn't exist.")
            return None
    except Exception as e:
        print(f"Error fetching transcript: {str(e)}")
        return None

def translate(final_summary_id, language):
    """Translate the summary to the specified language."""
    report = fetch_final_summary(final_summary_id)

    if not report:
        raise ValueError(f"No report found for the given document ID: {final_summary_id}.")

    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are given a post-appointment report in English. Translate to a language you are prompted; "
                    "accuracy is very important. If you are unsure, include a note about that."
                ),
            },
            {
                "role": "user",
                "content": f"Translate this post-appointment report to {language}:\n\n{report}",
            },
        ],
    )

    return completion.choices[0].message.content

def save_translate_to_firestore(document_id, summary):
    """
    Save the generated summary to Firestore under the 'translated_report' collection.
    """
    try:
        summary_ref = db.collection("translated_report").document(document_id)
        summary_data = {
            "document_id": document_id,
            "summary": summary,
            "timestamp": firestore.SERVER_TIMESTAMP,
        }

        # Save or update the summary document in Firestore
        summary_ref.set(summary_data)
        print(f"🟢 Translated report saved for document ID: {document_id}")

    except Exception as e:
        print(f"Error saving summary to Firestore: {str(e)}")

if __name__ == "__main__":
    try:
        translated_summary = translate("test_large", "Japanese")
        save_translate_to_firestore("japanese_large", translated_summary)
    except ValueError as e:
        print(f"Translation Error: {e}")
