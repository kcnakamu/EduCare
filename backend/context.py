from google.cloud import firestore
from google.oauth2 import service_account

from openai import OpenAI
client = OpenAI()

# Use the absolute path to the service account key JSON file
credentials = service_account.Credentials.from_service_account_file(
    "/Users/aquachat77/Documents/HackHarv/serviceAccountKey.json"
)

# Initialize Firestore client with credentials
db = firestore.Client(credentials=credentials)

def fetch_approved_details(summary_id, parser_id):
    '''
    Fetch approved summary and parser from Firestore.
    '''
    # Initialize Firebase using the service account key
    summary_ref = db.collection("meeting_summaries").document(summary_id)
    summary_doc = summary_ref.get()
    if summary_doc.exists:
        summary = summary_doc.to_dict()
        summary = summary['transcription']
    else:
        raise NameError("Summary document doesn't exist.")
    
    parser_ref = db.collection("parser_output").document(parser_id)
    parser_doc = parser_ref.get()
    if parser_doc.exists:
        parsed = parser_doc.to_dict()
    else:
        raise NameError("Parser document doesn't exist.")
    
    return summary, parsed

def generate_report(summary_id, parser_id):
    summary, parsed = fetch_approved_details(summary_id, parser_id)
    # test data
    # summary = 'so I’ve been having these stomach problems for a few months now it started out with just feeling a little uncomfortable after meals but now it’s gotten to the point where I’m really bloated after almost everything I eat sometimes I get these sharp pains in my abdomen too especially after bigger meals I wouldn’t say it’s constant but it’s happening a lot more frequently now maybe four or five times a week  how long does the pain last usually it lasts for about an hour or two and then it just goes away on its own but I’ve noticed that it’s taking longer to go away lately it used to go away quicker now I’ll be uncomfortable for the rest of the evening sometimes  have you noticed any particular foods that seem to trigger the pain or is it happening no matter what you eat I’ve tried paying attention to what I’m eating but there doesn’t seem to be a clear pattern some days it’s worse after greasy foods like pizza or burgers but then other times it’ll happen after something lighter like a salad it’s just really unpredictable  are you experiencing any nausea vomiting or changes in your bowel movements I feel nauseous sometimes especially when the pain is really bad but I haven’t thrown up or anything my bowel movements have been mostly normal though I’ve been going a bit more often lately maybe twice a day when I usually just go once  any weight loss or changes in appetite I haven’t lost any weight but my appetite is a little off sometimes I don’t feel like eating because I know I’ll feel bloated after  and any heartburn or acid reflux sometimes I get a bit of a burning feeling in my chest but it’s not too bad it comes and goes and it’s not every day  alright do you have any family history of gastrointestinal issues like acid reflux ulcers or anything like that my mom had some problems with acid reflux when she was younger but nothing major nobody else in my family has had any significant stomach problems though  thank you for sharing all that information based on your symptoms and the pattern of your discomfort I’d like to start by running some tests to see if we can narrow down what might be going on first I’ll examine your abdomen to check for any obvious tenderness or inflammation let me know if anything feels painful when I press here okay there’s some tenderness around the upper middle of your abdomen and a little on the left side too but it’s not too bad  that’s helpful next I’d like to order a few diagnostic tests to get a clearer picture the first one I recommend is an abdominal ultrasound this will allow us to look at your gallbladder liver and pancreas sometimes gallbladder problems can cause bloating and discomfort after eating and it’s important to rule that out I’ll also order some blood tests to check for infections inflammation or issues with your liver function and vitamin levels  how soon can we do the ultrasound I’d really like to know what’s going on we can schedule it within the next few days it’s a non-invasive test where they use a handheld device to take images of your organs it shouldn’t take more than 30 minutes or so once we have the results we’ll know if there’s anything to be concerned about  do you think this could be something serious like an ulcer or something worse I understand your concern but based on what you’ve told me and what I’ve examined so far it doesn’t seem like anything urgent or life-threatening ulcers and gallstones are possibilities but the ultrasound and blood tests should give us more answers if nothing shows up on those tests we may consider doing an endoscopy to take a closer look at your stomach and esophagus but let’s start with these tests first  okay I’d feel better just knowing what it is I’m glad we’re doing something about it  in the meantime while we’re waiting for the test results I want to recommend some things that might help manage your symptoms first try to avoid foods that are high in fat and spicy foods these can sometimes make bloating and discomfort worse also try eating smaller more frequent meals instead of three large ones throughout the day that can reduce the pressure on your stomach  I’ll definitely give that a try should I take anything for the pain when it gets really bad for now you can try over-the-counter antacids like omeprazole or famotidine these can help reduce the amount of acid your stomach produces and may alleviate some of the bloating and pain try taking one dose before meals for the next couple of weeks and see if that makes a difference  okay and is there anything else I should avoid besides fatty and spicy foods caffeine alcohol and carbonated drinks can also contribute to bloating so try cutting back on those as well  I’ll do that I drink a lot of coffee so that’s probably not helping is there anything I should watch out for with the antacids you mentioned they’re usually well tolerated but some people can experience side effects like headaches nausea or constipation if you notice anything unusual stop taking them and let me know and we can adjust the plan  got it and how soon can I expect to get the results from the ultrasound and blood tests the blood test results usually come back within a couple of days and the ultrasound results should be ready within 48 hours after the test I’ll give you a call as soon as we have the results and we can decide the next steps based on what we find  thank you I’ve just been so worried that something serious is wrong it’s been affecting my daily life a lot lately it’s completely understandable digestive issues can be really frustrating and uncomfortable but the good news is that we’re taking proactive steps to figure out what’s going on and in many cases these types of symptoms are manageable with the right treatment and lifestyle changes  I hope so I’ve been under a lot of stress with work too could that be making things worse stress can absolutely affect your digestive system when you’re stressed your body produces more of the hormones that can slow down digestion and cause stomach acid to increase it’s possible that stress is playing a role in your symptoms even if it’s not the root cause  what can I do to manage that should I try meditation or something like that stress reduction techniques can definitely help things like meditation deep breathing exercises or even yoga can make a big difference in how your body reacts to stress I’d suggest incorporating some of these into your daily routine and see if it helps reduce the frequency or intensity of your symptoms  I’ll try that I’ve been meaning to find ways to reduce stress anyway this seems like a good reason to start  definitely it’s a great way to take care of both your mental and physical health and it can complement the other things we’re doing to figure out what’s going on with your stomach  thanks again for all of this I’ve been feeling really overwhelmed by it all lately you’re welcome I’m glad you came in today we’re taking the right steps to get to the bottom of this and I’m confident we’ll find a solution soon'
    # parsed = {'DETAILED_DESCRIPTION': ['deep', 'tolerated', 'spicy', 'fatty', 'counter', 'carbonated drinks', '-the'], 'MEDICATION': ['meditation', 'antacids', 'omeprazole', 'yoga', 'famotidine'], 'SIGN_SYMPTOM': ['bloating', 'headaches', 'nausea', 'constipation'], 'DOSAGE': ['one dose before meals'], 'DURATION': ['couple of weeks'], 'DIAGNOSTIC_PROCEDURE': ['ultrasound', 'blood'], 'DATE': ['48 hours after', 'a couple of days', 'within'], 'THERAPEUTIC_PROCEDURE': ['breathing']}
    # Generate summary using OpenAI
    completion = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are a medical assistant that generates detailed, humanized post-appointment reports for patients."
                    "Based on the summary and key details, create a report, explaining every medical jargon."
                ),
            },
            {
                "role": "user",
                "content": f"Write a post-appointment report based on this summary and details: {summary}, {parsed}."
                "ONLY INCLUDE INFORMATION EXPLICITLY STATED IN THIS DATA.",
            },
        ],
    )

    # Extract the generated summary text
    report_text = completion.choices[0].message.content
    return report_text




if __name__ == "__main__":
    summary_id = "test_large"
    parser_id = "vMGc7EC72SrLODfpYs0i"
    # print(fetch_approved_details(summary_id, parser_id))
    print(generate_report(summary_id,parser_id))

# completion = client.chat.completions.create(
#     model="gpt-4o-mini",
#     messages=[
#         {"role": "system", 
#          "content": "You are a medical assistant that generates detailed, humanized post-appointment reports for patients. Include summary, patient demographics, reasons for visit, assessment findings, diagnoses, treatment plans, and patient education portion to explain the entire appointment in layman terms."},
#         {
#             "role": "user",
#             "content": f'Write a post-appointment report based on these keywords: {confirmed_test}. Do not include any extraneous topics. Here is the transcript, only for context, but do not include anything more: {transcript}.'
#         }
#     ]
# )

# # Extract the generated report text
# report_text = completion.choices[0].message.content

# # Save the report to a text file
# with open("patient_report_john_doe.txt", "w") as text_file:
#     text_file.write(report_text)

# print("Report saved as patient_report_john_doe.txt")
