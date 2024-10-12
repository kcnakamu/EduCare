'''
Read the transcript output from Deepgram, extract keywords such as symptoms, prescriptions, diagnostic procedure, etc.
Augment any diagnostic procedure with CPT and diagnostics with DSM.

Input: Heaped Transcript of Doctor-Patient Conversation
Output: Dictonary of key categores (symptom, testing procedures, diagnosis, prescriptions, vitals)
'''
import requests
from transformers import pipeline

def tokenize(transcript):
    '''
    Input: Transcript from DeepGram
    Output: Dictionary of key words
    '''
    # Load model and feed in result
    pipe = pipeline("token-classification", model="Clinical-AI-Apollo/Medical-NER", aggregation_strategy='simple')
    result = pipe(transcript)

    report_dict = {}
    for entity in result:
        report_dict.setdefault(entity['entity_group'], []).append(entity['word'])
    
    return report_dict

def query_icd10cm(terms):
    '''
    Query the term for icd 10 codes and descriptions
    '''
    # Base URL for the ICD-10-CM API
    url = "https://clinicaltables.nlm.nih.gov/api/icd10cm/v3/search"
    
    # Parameters for the API query
    params = {
        'sf': 'code,name',  # Fields to retrieve: code and name
        'terms': terms,     # Search terms
    }
    
    # Sending the GET request to the API
    response = requests.get(url, params=params)
    
    # Checking if the request was successful
    if response.status_code == 200:
        data = response.json()  # Parse the JSON response
        # Process the returned data
        codes = data[1]
        descriptions = data[3]
        result = []
        for code, desc in zip(codes, descriptions):
            result.append((code,desc[1]))  # Display the code and its description
        return result
    else:
        return None

def add_icd(key_dict):
    '''
    Input: Keyword dictionary; output from tokenize
    Output: Same dictionary, include a new key "DISEASE_ICD" (list of diseases) in format:
        list of 
    '''
    diseases = key_dict['DISEASE_DISORDER']
    for disease in diseases:
        output = [disease,query_icd10cm(disease)]
        key_dict.setdefault('DISEASE_ICD',[]).append(output)
    return key_dict

if __name__ == "__main__":
    input = "I think you suffer from depression and hypertension."
    tokens = tokenize(input)
    tokens = add_icd(tokens)
    print(tokens)
