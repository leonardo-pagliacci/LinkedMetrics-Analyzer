import os
import json
import logging
from urllib.parse import urlparse, unquote
from linkedin_api import Linkedin
from openai import OpenAI
from dotenv import load_dotenv
import fitz
import PyPDF2
import re
from flask import request 
from linkedin_extractor import (extract_linkedin_id, linkedin_profile_extractor, extract_linkedin_job_id,
                                linkedin_job_description_extractor, extract_linkedin_company_id,
                                linkedin_company_info_extractor, linkedin_job_company_extractor)

# Load environment variables
load_dotenv()

# Suppress INFO logs
logging.getLogger("httpx").setLevel(logging.WARNING)

# Securely load and check for environment variables
linkedin_username = os.getenv("LINKEDIN_USERNAME")
linkedin_password = os.getenv("LINKEDIN_PASSWORD")
openai_api_key = os.getenv("OPENAI_API_KEY")
if not all([linkedin_username, linkedin_password, openai_api_key]):
    raise ValueError("Missing required credentials.")

api = Linkedin(linkedin_username, linkedin_password)
client = OpenAI(api_key=openai_api_key)

def upload_resume_and_analyze(file):
    if file is None:
        return {'error': 'No resume file provided'}, 400
    
    try:
        # Read the stream content into a bytes object
        file_stream = file.read()  # This reads the file content into bytes
        
        # Now use the bytes to open the PDF with fitz
        doc = fitz.open("pdf", file_stream)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()

        # OpenAI prompt
        prompt = f'''Given the following resume text, extract and organize the information into a structured format as shown in the template. Ensure that all relevant details such as full name, headline, summary, industry name, location, experience, education, languages, projects, and skills are accurately captured. Follow the template structure closely, adjusting for any additional categories or missing information as necessary.

                Resume Text:
                {text}

                Template for Structured Format:
                {{
                  "fullName": "[Full Name]",
                  "headline": "[Position | Specialization]",
                  "summary": "[Brief summary including skills, experiences, and objectives]",
                  "industryName": "[Industry]",
                  "locationName": "[City, Country]",
                  "geoCountryName": "[Country]",
                  "geoLocationName": "[City, City]",
                  "experience": [
                    {{
                      "locationName": "[City, Country]",
                      "geoLocationName": "[City, Country]",
                      "companyName": "[Company Name]",
                      "timePeriod": {{"startDate": {{"month": [Month], "year": [Year]}}, "endDate": {{"month": [Month], "year": [Year]}}}},
                      "industries": ["[Industry]"],
                      "title": "[Job Title]"
                    }},
                    # Add more experience entries as needed
                  ],
                  "education": [
                    {{
                      "schoolName": "[Institution Name]",
                      "timePeriod": {{"startDate": {{"year": [Year]}}, "endDate": {{"year": [Year]}}}},
                      "degreeName": "[Degree]",
                      "fieldOfStudy": "[Field of Study]"
                    }},
                    # Add more education entries as needed
                  ],
                  "languages": [
                    {{"name": "[Language]", "proficiency": "[Proficiency Level]"}},
                    # Add more languages as needed
                  ],
                  "projects": [
                    # Optional: Include any relevant projects
                  ],
                  "skills": ["[Skill 1]", "[Skill 2]"]
                }}

                Please structure the information from the resume text accordingly.
                '''
        
        # Assuming 'client' is an initialized OpenAI client
        response = client.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": "You are a helpful HR analytics assistant designed to output JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.5,
            max_tokens=1024,
            seed=42
        )

        # Return the structured data from OpenAI's response
        return json.loads(response.choices[0].message.content), 200

    except Exception as e:
        return {'error': f"Failed to process the uploaded file: {e}"}, 500

# THIS FUNCTION RETURN JSON
def analyze_linkedin_profile(profile_dict):
    """
    Analyzes the given LinkedIn profile dictionary using OpenAI.

    :param jd_dict: A dictionary containing LinkedIn profile information.
    :return: Analysis result from OpenAI.
    """

    # Convert the LinkedIn profile dictionary into a textual prompt
    
    profile_info = json.dumps(profile_dict, indent=2)
    
    prompt = f'''
    Analyze the LinkedIn profile provided below and generate a structured analysis in JSON format and structured according to the specified JSON schema. Emphasize the overview, strengths, and weaknesses. The analysis should translate any non-English text to English while preserving Named Entities in their original language. 
    The analysis should provide a clear, detailed overview, highlighting the individual's professional journey, key strengths, areas for improvement, and actionable suggestions for enhancing their profile. 
    Skills listed in the 'skills' section and those implied in the headline, summary, and project descriptions should be emphasized.

    **LinkedIn Profile Data Structure:**
    {profile_info}

    **Required JSON Analysis Schema:**

    {{
      "fullName": "The full name of the individual.",
      "location": "City, Country.",
      "overview": "A detailed and insightful summary of the individual's professional journey, focusing on significant achievements, experiences, and the value they bring to their field.",
      "highestDegree": {{
        "level": "The highest level of academic achievement (Doctorate, Master's, Bachelor's).",
        "fieldOfStudy": "Field of study in English.",
        "institution": "Institution name in the original language.",
        "graduationDate": "Graduation date (most recent if multiple degrees)."
      }},
      "profilePictureUrl": "URL to the profile picture.",
      "languages": ["List of languages the individual speaks, along with proficiency levels if available. Find the native language if not provided"],
      "hardSkills": ["List of hard skills relevant to their field and position."],
      "softSkills": ["List of soft skills that highlight interpersonal and professional competencies."],
      "strengths": ["In-depth analysis of key strengths, showcasing specific examples from the profile."],
      "weaknesses": ["Honest evaluation of potential areas for improvement with constructive feedback."],
      "improvementSuggestions": ["Actionable advice to enhance the profile, tailored to address identified weaknesses."],
      "careerSuggestions": ["List of job recommendations or career paths that align with the individual's skills and aspirations."]
    }}
  '''

    response = client.chat.completions.create(
      model="gpt-3.5-turbo-0125",
      response_format={ "type": "json_object" },
      messages=[
        {"role": "system", "content": "You are a helpful HR analytics assistant designed to output JSON."},
        {"role": "user", "content": prompt},
        
      ],
      temperature=0.5,
      max_tokens=1024,
      seed = 42
    )
    return json.loads(response.choices[0].message.content)


    
# THIS FUNCTION RETURN JSON

def analyze_linkedin_jd(jd_dict):
    """
    Analyzes the given LinkedIn Job Description dictionary using OpenAI.

    :param jd_dict: A dictionary containing LinkedIn Job Description information.
    :return: Analysis result from OpenAI.
    """

    # Convert the LinkedIn JD dictionary into a textual prompt
    jd_info = json.dumps(jd_dict, indent=2)
    
    prompt = f'''
    Analyze the job description provided below and generate a structured analysis in JSON format, following the specified JSON schema. Focus on the job title, detailed job responsibilities, company information, location, experience and academic requirements, necessary skills, and key responsibilities. Translate any non-English text to English while preserving Named Entities in their original language. The analysis should prioritize providing a clear and concise overview, highlighting important details and offering insights into the job and the company.
    **Job Description Data Structure:**
    {jd_info}

    **Required JSON Analysis Schema:**

    {{
      "jobTitle": "Clearly state the job title.",
      "location": "Identify and mention the job location, considering the description or the company's primary location if not explicitly stated.",
      "overview": "A concise summary highlighting key job responsibilities, technologies involved, and the role's significance within the company.",
      "companyInfo": {{
        "name": "The company name.",
        "linkedinUrl": "The LinkedIn URL of the company.",
        "overview": "A brief summary of the company's mission, vision, and unique qualities.",
        "specialties": ["List the company's areas of expertise or specializations."]
      }},
      "experienceLevel": "Detail the required experience level (e.g., entry-level, mid-senior, senior), inferring from responsibilities and skills if not explicitly mentioned.",
      "academicRequirements": {{
        "degreeLevel": "Infer the necessary academic degree level based on the description, suggesting relevant fields of study for technical roles."
      }},
      "skillsRequired": {{
        "hardSkills": ["List of hard skills required for the position."],
        "softSkills": ["List of soft skills important for success in the role."]
      }},
      "languageRequirements": ["Specify the primary language needed for the role and any additional beneficial languages based on the company's location and culture."],
      "keyResponsibilities": ["Highlight the 10 major responsibilities associated with the position, formatted for clarity."]
    }}

    The analysis should maintain a professional tone, be comprehensive, and adhere closely to the JSON schema provided, ensuring that all sections are filled with relevant and insightful information.
    '''
    response = client.chat.completions.create(
    model="gpt-3.5-turbo-0125",
    response_format={ "type": "json_object" },
    messages=[
      {"role": "system", "content": "You are a helpful HR analytics assistant designed to output JSON."},
      {"role": "user", "content": prompt},
      
    ],
    temperature=0.5,
    max_tokens=1024,
    seed = 42
  )
    return json.loads(response.choices[0].message.content)



def job_matching_system(profile_json, jd_json):
    
    """
    Evaluates the compatibility between a LinkedIn profile and a job description based on specified criteria and weights.

    This function assesses how well a LinkedIn profile matches with a job description (JD) using criteria such as skill matching,
    experience relevance, education alignment, soft skills and cultural fit, and language proficiency. Each criterion is assigned a weight, contributing to an overall compatibility score. 
    The analysis includes a detailed breakdown of match status, percentage matches for each criterion, and suggestions for improving the LinkedIn profile to align more closely with the job description.

    Parameters:
    - profile_json (dict): A dictionary containing LinkedIn profile data structured in JSON format.
    - jd_json (dict): A dictionary containing job description data structured in JSON format.

    Returns:
    - dict: A JSON object containing the overall compatibility score, detailed analysis for each criterion, and improvement suggestions.
    """

    
    # Prompt for comparison and scoring
    prompt = f"""
    Evaluate the compatibility between a detailed LinkedIn profile and a job description, aiming to derive a comprehensive compatibility score on a scale from 0 to 100.
    Your analysis should factor in various criteria, each with its own weight, to provide both quantitative and qualitative insights into the match.
    **Compatibility Criteria:**
    1. Skill Depth and Specialization (25% weight): Assess the depth and specialization of skills, going beyond mere presence to evaluate expertise levels.
    2. Experience Progression and Relevance (25% weight): Evaluate the relevance of career progression and past achievements to the job's requirements.
    3. Educational Achievements and Specializations (15% weight): Analyze the level, relevance, and prestige of educational qualifications.
    4. Cultural Alignment and Soft Skills (15% weight): Judge the cultural fit and assess soft skills such as leadership, communication, and teamwork.
    5. Language Fluency and International Exposure (10% weight): Review language skills and any experience in international or diverse environments.
    6. Growth Potential and Learning Agility (10% weight): Estimate the candidate's capacity for growth and quick learning in new areas.

    **Analysis Output Schema:**

    {{
    "Overall Compatibility Score": "An aggregate score reflecting the overall match quality, represented as a percentage.",
    "Details": {{
      "Skill Matching": {{
        "Match Status": "Indicate whether there is a match, partial match, or no match.",
        "Percentage Match": "Provide a numerical score (0-100) reflecting the skill match quality.",
        "Matched Skills": "List skills that directly match between the profile and job description.",
        "Unmatched Skills": "List skills required by the job that the profile does not possess."
      }},
      "Experience Relevance": {{
        "Match Status": "Match, Partial Match, No Match",
        "Percentage Match": "Provide a numerical score (0-100) reflecting the experience relevance.",
        "Suggestions": "Recommendations for highlighting relevant experience more effectively."
      }},
      "Educational Alignment": {{
        "Match Status": "Match, Partial Match, No Match",
        "Percentage Match": "Provide a numerical score (0-100) reflecting the educational alignment.",
        "Suggestions": "Advice on emphasizing educational background in relation to job requirements."
      }},
      "Cultural and Soft Skills Fit": {{
        "Match Status": "Match, Partial Match, No Match",
        "Percentage Match": "Provide a numerical score (0-100) reflecting the cultural and soft skills fit.",
        "Suggestions": "Suggestions for demonstrating cultural fit and soft skills alignment with the job."
      }},
      "Language and International Experience": {{
        "Match Status": "Match, Partial Match, No Match",
        "Percentage Match": "Provide a numerical score (0-100) reflecting the match of language skills and international experience.",
        "Suggestions": "Tips on showcasing language skills and international exposure relevant to the job."
      }},
      "Growth Potential": {{
        "Match Status": "Match, Partial Match, No Match",
        "Percentage Match": "Provide a numerical score (0-100) reflecting the assessment of growth potential.",
        "Suggestions": "Insights on projecting learning agility and growth potential in alignment with job demands."
      }}
    }},
    "Summary": "A concise summary offering an overview of the match analysis, highlighting key points, areas of strong alignment, potential mismatches, and actionable recommendations for improvement."
    }}

    Your response should adhere to this schema, providing a clear, detailed, and insightful analysis based on the detailed LinkedIn profile and job description provided.

    LinkedIn Profile Summary:
    {json.dumps(profile_json, indent=4)}

    Job Description Summary:
    {json.dumps(jd_json, indent=4)}

    Aim for a professional tone, ensuring the analysis is comprehensive and structured according to the schema.
    """

        
        
    response = client.chat.completions.create(
      model="gpt-4-0125-preview",
      response_format={ "type": "json_object" },
      messages=[
        {"role": "system", "content": "You are a helpful HR analytics assistant designed to output JSON."},
        {"role": "user", "content": prompt},
        
      ],
      temperature=0.3,
      max_tokens=1024,
      seed = 42
    )
    
    return json.loads(response.choices[0].message.content)

