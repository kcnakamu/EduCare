import requests
from transformers import pipeline
from google.cloud import firestore
from google.oauth2 import service_account

# Use the absolute path to the service account key JSON file
credentials = service_account.Credentials.from_service_account_file(
    "/Users/siddharthareddy/Desktop/Developer/EduCare/EduCare/backend/serviceAccountKey.json"
)

# Initialize Firestore client with credentials
db = firestore.Client(credentials=credentials)

def tokenize(transcript):
    '''
    Input: Transcript from Firestore (doctor_notes, patient_notes)
    Output: Dictionary of key words
    '''
    # Load the model and perform token classification
    pipe = pipeline("token-classification", model="Clinical-AI-Apollo/Medical-NER", aggregation_strategy='simple')
    result = pipe(transcript)

    report_dict = {}
    for entity in result:
        report_dict.setdefault(entity['entity_group'], []).append(entity['word'])

    # Remove duplicates from each list
    for key in report_dict:
        if isinstance(report_dict[key], list):
            report_dict[key] = list(set(report_dict[key]))  # Ensure unique entries

    return report_dict

def query_icd10cm(terms):
    '''
    Query the term for ICD-10-CM codes and descriptions.
    '''
    url = "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search"
    params = {'sf': 'code,name', 'terms': terms}

    response = requests.get(url, params=params)

    if response.status_code == 200:
        data = response.json()
        codes = data[1]
        descriptions = data[3]
        result = [(code, desc[1]) for code, desc in zip(codes, descriptions)]
        return result
    else:
        return None

def add_icd(key_dict):
    '''
    Add ICD-10-CM codes to the keyword dictionary.
    '''
    diseases = key_dict.get('DISEASE_DISORDER', [])
    for disease in diseases:
        output = [disease, query_icd10cm(disease)]
        key_dict.setdefault('DISEASE_ICD', []).append(output)
    return key_dict

def fetch_notes_from_firestore(document_id):
    '''
    Fetch doctor_notes and patient_notes from Firestore.
    '''
    doc_ref = db.collection("meeting_summaries").document(document_id)
    doc = doc_ref.get()

    if doc.exists:
        data = doc.to_dict()
        return data.get("doctor_notes", ""), data.get("patient_notes", "")
    else:
        raise ValueError("No such document found!")

def save_to_firestore(data, document_id):
    '''
    Save the parser output to Firestore under a new collection 'parser_output'.
    '''
    doc_ref = db.collection("parser_output").document(document_id)
    doc_ref.set(data)  # Save data to Firestore

if __name__ == "__main__":  
    document_id = "vMGc7EC72SrLODfpYs0i"  # Replace with your Firestore document ID

    # Fetch the notes from Firestore
    doctor_notes, patient_notes = fetch_notes_from_firestore(document_id)

    # Combine notes and process them
    combined_notes = doctor_notes + " " + patient_notes
    tokens = tokenize(combined_notes)  # Ensure tokenize is called correctly
    tokens_with_icd = add_icd(tokens)  # Augment tokens with ICD-10 codes

    print(tokens_with_icd)  # Output the processed result

    # Save the parsed result to Firestore
    save_to_firestore(tokens_with_icd, document_id)

    print(f"Parsed output saved to Firestore with document ID: {document_id}")
