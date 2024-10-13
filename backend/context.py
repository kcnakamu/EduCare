from openai import OpenAI
client = OpenAI()

confirmed_test = {
        'PATIENT DETAILS': ("Jane Doe, Age 30, 130 pounds"),
        'SIGN_SYMPTOM': ['insomnia', 'headaches', 'tired', 'dizziness'], 
        'DURATION': ['couple of weeks'], 
        'DATE': ['two weeks ago'], 
        'LAB_VALUE': ['five hours', '7'], 
        'HISTORY': ['caffeine', 'foods', 'dehydration'], 
        'PRESCRIPTION': ['sleep aid'], 
        'DIAGNOSTIC_PROCEDURE': ['blood pressure', 'blood tests', 'MRI'], 
        'DISEASE_DISORDER': ['anemia', 'thyroid'], 
        'DISEASE_ICD': [['anemia', [('D64.9', 'Anemia, unspecified')],],['thyroid', [('E07.9', 'Disorder of thyroid, unspecified')]]]}
transcript = "Doctor: Good morning, Mrs. Johnson. How are you feeling today? Patient: Hi, Doctor. I’m not feeling well, actually. I've been experiencing headaches, some dizziness, and I’ve had trouble sleeping for the past couple of weeks. Doctor: I'm sorry to hear that. Let's start by going over your symptoms in more detail. When did you first start noticing the headaches and dizziness? Patient: The headaches started about two weeks ago. At first, they were mild, but now they're happening almost every day, usually in the afternoon. The dizziness happens mostly when I stand up too quickly, and it's getting worse. Doctor: And how would you rate the intensity of your headaches on a scale from 1 to 10, with 10 being the worst pain you've ever felt? Patient: I’d say it’s about a 7 most of the time. It’s really affecting my ability to concentrate at work. Doctor: I understand. Do you notice anything that seems to trigger the headaches, like stress, certain foods, or dehydration? Patient: I think stress could be a part of it. I’ve been under a lot of pressure at work lately. I try to drink water, but I’m not sure if I’m drinking enough. Doctor: Okay, that’s helpful information. Let’s talk about the trouble sleeping. How many hours are you getting each night, and are you waking up in the middle of the night? Patient: I’m probably getting around five hours of sleep, if that. I wake up multiple times and just can’t seem to fall back asleep. I feel tired all the time. Doctor: Chronic sleep deprivation can definitely contribute to headaches and dizziness. Have you had any changes in your diet, medications, or caffeine intake recently? Patient: I’ve been drinking more coffee, especially in the afternoon, to stay awake at work. Doctor: Caffeine can sometimes worsen headaches and affect your sleep, so that might be playing a role here. Based on what you’ve described, I’d like to run some basic tests to rule out any underlying conditions. We’ll check your blood pressure, do some blood tests for things like anemia or thyroid issues, and maybe an MRI if necessary. In the meantime, I recommend cutting back on caffeine and trying to manage your stress. I’ll also prescribe a mild sleep aid to help you rest better at night. Patient: Thank you, Doctor. I’ll give that a try. Doctor: You’re welcome. We’ll follow up after the test results come in, and we can adjust your treatment if needed. If anything gets worse in the meantime, don’t hesitate to call."

completion = client.chat.completions.create(
    model="gpt-4o-mini",
    messages=[
        {"role": "system", 
         "content": "You are a medical assistant that generates detailed, humanized post-appointment reports for patients. Include summary, patient demographics, reasons for visit, assessment findings, diagnoses, treatment plans, and patient education portion to explain the entire appointment in layman terms."},
        {
            "role": "user",
            "content": f'Write a post-appointment report based on these keywords: {confirmed_test}. Do not include any extraneous topics. Here is the transcript, only for context, but do not include anything more: {transcript}.'
        }
    ]
)

# Extract the generated report text
report_text = completion.choices[0].message.content

# Save the report to a text file
with open("patient_report_john_doe.txt", "w") as text_file:
    text_file.write(report_text)

print("Report saved as patient_report_john_doe.txt")
