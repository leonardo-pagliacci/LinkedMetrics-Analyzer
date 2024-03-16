import os
import json
from linkedin_api import Linkedin
from urllib.parse import urlparse, unquote
from dotenv import load_dotenv

# Load environment variables from a .env file
load_dotenv()

# Logging 
linkedin_username = os.getenv("LINKEDIN_USERNAME")
linkedin_password = os.getenv("LINKEDIN_PASSWORD")
api = Linkedin(linkedin_username, linkedin_password)

# Check if credentials are available
if not linkedin_username or not linkedin_password:
    raise ValueError("LinkedIn credentials not found in environment variables.")
 
def extract_linkedin_id(profile_url):
    """
    Extracts the LinkedIn ID from a given profile URL, handling various URL formats.
    """
    # Decode URL to handle any encoded characters
    decoded_url = unquote(profile_url)
    
    # Parse the URL to get the path part
    path = urlparse(decoded_url).path
    
    # Strip leading and trailing slashes then split by slashes
    path_parts = path.strip("/").split("/")
    
    # LinkedIn ID is expected to be the last part of the path
    linkedin_id = path_parts[-1]
    
    return linkedin_id

def linkedin_profile_extractor(profile_url):
    """
    Extracts and structures key information from a LinkedIn profile using its URL.

    This function retrieves comprehensive details from a LinkedIn profile, including the user's
    full name, professional headline, summary, industry, location, experience, education, languages,
    projects, and skills. It is designed to parse the profile URL to extract the LinkedIn ID,
    which is then used to fetch the profile data through API calls. The retrieved data is
    structured into a readable and accessible format, suitable for various applications such as
    professional networking, recruitment, and personal branding services.

    Parameters:
    - profile_url (str): The URL of the LinkedIn profile to be analyzed.

    Returns:
    - dict: A dictionary containing structured information about the LinkedIn profile. This includes:
        - 'fullName': The full name of the profile owner.
        - 'headline': The professional headline.
        - 'summary': A brief professional summary.
        - 'industryName': The industry of the profile owner.
        - 'locationName': The general location name.
        - 'geoCountryName': The country name.
        - 'geoLocationName': The specific geographical location.
        - 'experience': A list of dictionaries, each representing a work experience entry.
        - 'education': A list of dictionaries, each representing an education entry.
        - 'languages': A list of languages listed on the profile.
        - 'projects': A list of dictionaries, each representing a project entry.
        - 'skills': A list of skills listed on the profile.
        - 'profilePictureUrl': profile image url
    """
    
    # Extract the LinkedIn ID from the URL using the refined extraction function
    linkedin_id = extract_linkedin_id(profile_url)

    # Use the API calls with the extracted LinkedIn ID
    profile = api.get_profile(linkedin_id)

    # Basic information extraction remains the same
    extracted_info = {
        'fullName': f"{profile.get('firstName', '')} {profile.get('lastName', '')}".strip(),
        'headline': profile.get('headline', ''),
        'summary': profile.get('summary', ''),
        'industryName': profile.get('industryName', ''),
        'locationName': profile.get('locationName', ''),
        'geoCountryName': profile.get('geoCountryName', ''),
        'geoLocationName': profile.get('geoLocationName', ''),
        'experience': [],
        'education': [],
        'languages': profile.get('languages', 'No languages listed'),
        'projects': [],
        'skills': [],
        'profilePictureUrl': None

    }

    # Streamline experience details
    for exp in profile.get('experience', []):
        experience_detail = {
            'locationName': exp.get('locationName', ''),
            'geoLocationName': exp.get('geoLocationName', ''),
            'companyName': exp.get('companyName', ''),
            'timePeriod': exp.get('timePeriod', {}),
            'industries': exp.get('company', {}).get('industries', []),
            'title': exp.get('title', '')
        }
        extracted_info['experience'].append(experience_detail)

    # Streamline education details
    for edu in profile.get('education', []):
        education_detail = {
            'schoolName': edu.get('schoolName', ''),
            'timePeriod': edu.get('timePeriod', {}),
            'degreeName': edu.get('degreeName', ''),
            'fieldOfStudy': edu.get('fieldOfStudy', '')
        }
        extracted_info['education'].append(education_detail)
        
    # Streamline project details
    projects_raw = profile.get('projects', [])
    for project in projects_raw:
        project_detail = {
            'title': project.get('title', ''),
            'timePeriod': project.get('timePeriod', {}),
            'description': project.get('description', '')
        }
        extracted_info['projects'].append(project_detail)
        
    # Extract skills using the LinkedIn ID
    skills = api.get_profile_skills(linkedin_id)
    extracted_info['skills'] = [skill['name'] for skill in skills] if skills else 'No skills listed'
    
    # Extract the highest profile image resolution
    if 'displayPictureUrl' in profile:
        base_url = profile['displayPictureUrl']
        # Directly check for the presence of each key in priority order
        image_keys = ['img_800_800', 'img_400_400', 'img_200_200', 'img_100_100']
        for key in image_keys:
            if key in profile:
                extracted_info['profilePictureUrl'] = base_url + profile[key]
                break 
    
    return extracted_info

from urllib.parse import urlparse, unquote

def extract_linkedin_job_id(job_url):
    
    decoded_url = unquote(job_url)
    path = urlparse(decoded_url).path
    path_parts = path.strip("/").split("/")
    try:
        view_index = path_parts.index("view")
        job_id = path_parts[view_index + 1] if len(path_parts) > view_index + 1 else None
    except ValueError:
        job_id = None
        
    return job_id

def linkedin_job_description_extractor(job_url):
    
    """
    Extracts key information from a LinkedIn job posting based on the provided job URL. This function is designed
    to simplify the process of retrieving job details by focusing on core aspects such as the job title, company name,
    company URL, and a text description of the job.

    Parameters:
    - job_url (str): The URL of the LinkedIn job posting.

    Returns:
    - extracted_job_info (dict): A dictionary containing the extracted information from the job posting, including:
        - 'title': The title of the job.
        - 'companyName': The name of the company offering the job.
        - 'companyURL': A URL to the company's LinkedIn page.
        - 'descriptionText': The text description of the job, outlining responsibilities, requirements, and other job details.

    The function assumes access to an API or mechanism (simulated here) that allows fetching detailed job information
    using a job identifier extracted from the job URL. It structures the extracted information into a readable and
    easily accessible format for further processing or analysis.

    Usage:
    This function can be particularly useful for job seekers, recruiters, or researchers interested in analyzing job
    market trends, gathering information on specific job openings, or extracting data for job recommendation systems.
    """
    
    # Extract the LinkedIn Job ID from the URL
    job_id = extract_linkedin_job_id(job_url)
    
    # Simulating fetching job details from LinkedIn API with job_id
    job_description = api.get_job(job_id)  # This is a placeholder for the actual API call

    # Accessing company details
    company_details = job_description.get('companyDetails', {}).get('com.linkedin.voyager.deco.jobs.web.shared.WebCompactJobPostingCompany', {}).get('companyResolutionResult', {})
    company_name = company_details.get('name', 'Company name not found')
    company_url = company_details.get('url', 'Company URL not found')

    # Structuring the extracted job description details
    extracted_job_info = {
        'title': job_description.get('title', ''),
        'companyName': company_name,
        'companyURL': company_url,
        'descriptionText': job_description.get('description', {}).get('text', '')
    }

    return extracted_job_info

from urllib.parse import urlparse, unquote

def extract_linkedin_company_id(company_url):
    """
    Extracts the LinkedIn company ID (universal name) from a given company URL.
    """
    decoded_url = unquote(company_url)
    path = urlparse(decoded_url).path
    path_parts = path.strip("/").split("/")
    
    # Assuming the URL format is https://www.linkedin.com/company/[company-id]/
    company_id = path_parts[-1] if path_parts[-2] == 'company' else None
    return company_id

def linkedin_company_info_extractor(company_url):
    
    """
    Retrieves detailed information about a company from LinkedIn based on the provided company URL.

    This function extracts various pieces of company information, including the company's name, description, staff count,
    industry, specialties, and follower count. It first extracts the company ID from the URL, then uses that ID to fetch
    and compile detailed company information from LinkedIn's API or a similar data source.

    Parameters:
    - company_url (str): The URL of the company's LinkedIn page.

    Returns:
    - company_info (dict): A dictionary containing key information about the company, such as:
        - 'name': The name of the company.
        - 'description': A brief description of the company.
        - 'staffCount': The number of employees at the company.
        - 'industry': The primary industry or industries the company operates in.
        - 'specialties': A list of the company's specialties or areas of expertise.
        - 'followerCount': The number of followers the company has on LinkedIn.

    Note:
    The function relies on the ability to extract a company ID from the given URL and fetch data from an API or data source
    that provides comprehensive company information based on that ID.

    Usage:
    - This function can be used to gather insights about a company's presence and reputation on LinkedIn, aiding in
    market research, competitive analysis, or job search preparation.
    """
    
    # Extract the LinkedIn company ID from the URL
    company_id = extract_linkedin_company_id(company_url)
    
    company_data = api.get_company(company_id)  
    
     # Extracting basic company information
    company_info = {
        'name': company_data.get('name', 'N/A'),
        'description': company_data.get('description', ''),
        'staffCount': company_data.get('staffCount', 'N/A'),
        'industry': ', '.join([industry['localizedName'] for industry in company_data.get('companyIndustries', [])]),
        'specialties': company_data.get('specialities', []),
        'followerCount': company_data.get('followingInfo', {}).get('followerCount', 'N/A'),
    }

    return company_info


def linkedin_job_company_extractor(job_url):
    
    """
    Extracts and combines details of a job description and its associated company information from LinkedIn based on a job URL.

    This function performs two main tasks:
    1. Extracts job description details from LinkedIn using the given job URL.
    2. Extracts the company's information associated with the job using the 'companyURL' found in the job description details.

    Parameters:
    - job_url (str): The URL of the job posting on LinkedIn.

    Returns:
    - combined_info (dict): A dictionary containing both the job description details and the company information. The company information is nested under the 'companyInfo' key within the returned dictionary.

    Usage:
    - To obtain comprehensive details about a job and its posting company on LinkedIn, pass the job posting URL to this function.
    """
    
    # Extract job description details
    job_description_details = linkedin_job_description_extractor(job_url)
    
    # Extract 'companyURL' from job description details
    company_url = job_description_details['companyURL']
    
    # Then, use the extracted 'companyURL' to get company information
    company_info_details = linkedin_company_info_extractor(company_url)
    
    # Combine job description details with company information
    combined_info = {
        **job_description_details,
        'companyInfo': company_info_details
    }
    
    return combined_info