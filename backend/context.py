from google.cloud import firestore
from google.oauth2 import service_account
from openai import OpenAI

client = OpenAI()

# Use the absolute path to the service account key JSON file
credentials = service_account.Credentials.from_service_account_file(
    "/Users/siddharthareddy/Desktop/Developer/EduCare/EduCare/backend/serviceAccountKey.json"
)

# Initialize Firestore client with credentials
db = firestore.Client(credentials=credentials)

def fetch_approved_details(summary_id, parser_id):
    """
    Fetch approved summary and parser data from Firestore.
    """
    try:
        # Fetch summary data
        summary_ref = db.collection("openai_summary_1").document(summary_id)
        summary_doc = summary_ref.get()

        if not summary_doc.exists:
            raise ValueError(f"Summary document '{summary_id}' does not exist.")
        
        summary_data = summary_doc.to_dict()
        print(f"📄 Summary Data: {summary_data}")  # Log summary data

        # Fetch parser data
        parser_ref = db.collection("parser_output").document(parser_id)
        parser_doc = parser_ref.get()

        if not parser_doc.exists:
            raise ValueError(f"Parser document '{parser_id}' does not exist.")
        
        parser_data = parser_doc.to_dict()
        print(f"📄 Parser Data: {parser_data}")  # Log parser data

        return summary_data, parser_data

    except Exception as e:
        print(f"🔴 Error fetching approved details: {e}")
        raise

def generate_report(summary_id, parser_id):
    """
    Generate the final report using the summary and parser data.
    """
    summary_data, parser_data = fetch_approved_details(summary_id, parser_id)

    # Generate the report using OpenAI
    try:
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a medical assistant that generates detailed, humanized post-appointment reports for patients. "
                        "Based on the provided summary and parser data, create a report explaining medical terms."
                    ),
                },
                {
                    "role": "user",
                    "content": f"Write a post-appointment report based on these details: "
                               f"Summary: {summary_data}. "
                               f"Parser Output: {parser_data}. "
                               "ONLY INCLUDE INFORMATION EXPLICITLY STATED IN THIS DATA.",
                },
            ],
        )

        # Extract the generated summary text
        report_text = completion.choices[0].message.content
        print("🟢 Report Generated:\n", report_text)

        # Return the generated report
        return report_text

    except Exception as e:
        print(f"🔴 Error generating report with OpenAI: {e}")
        raise
