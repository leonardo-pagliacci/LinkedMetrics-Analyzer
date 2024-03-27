# Import necessary modules from Flask for web app creation and response handling
from flask import Flask, request, jsonify, render_template
# Import json for parsing JSON data
import json
# Import LinkedIn data extraction functions from linkedin_extractor.py
from linkedin_extractor import (
    linkedin_profile_extractor, 
    linkedin_job_description_extractor, 
    linkedin_company_info_extractor, 
    linkedin_job_company_extractor)
# Import analysis functions from prompt_engineering.py that utilize OpenAI's GPT models
from prompt_engineering import (
    analyze_linkedin_profile, 
    upload_resume_and_analyze,
    analyze_linkedin_jd, 
    job_matching_system)

# Initialize Flask app
app = Flask(__name__) 

# Define route for the index page, which serves the main HTML template
@app.route('/')
def index():
    # Render and return the index.html template
    return render_template('index.html')

# Define route for extracting and analyzing LinkedIn profile data
@app.route('/extract_analyze_profile', methods=['POST'])
def extract_and_analyze_profile():
    # Parse JSON data from the POST request
    data = request.json  
    # Get profile URL from the request data
    profile_url = data.get('profile_url')
    if profile_url:
        try:
            # Extract profile data from LinkedIn
            profile_data = linkedin_profile_extractor(profile_url)
            # Analyze extracted profile data using OpenAI
            analysis_result = analyze_linkedin_profile(profile_data)
            # Return the analysis result in JSON format
            return jsonify(analysis_result), 200
        except Exception as e:
            # Handle any errors during extraction or analysis
            return jsonify({'error': str(e)}), 500
    else:
        # Return error if profile URL is missing
        return jsonify({'error': 'Profile URL is required'}), 400

# Define route for uploading, analyzing resumes
@app.route('/upload_analyze_resume', methods=['POST'])
def handle_resume_upload():
    # Retrieve file from POST request
    file = request.files.get('resume')
    if not file:
        # Return error if no file is provided
        return jsonify({'error': 'No resume file provided'}), 400
    try:
        # Analyze the uploaded resume
        resume_data = upload_resume_and_analyze(file)
        if 'error' in resume_data:
            # Check for errors in resume analysis
            return jsonify(resume_data), 500  
        # Analyze the structured resume data
        analysis_result = analyze_linkedin_profile(resume_data)
        # Return analysis result
        return jsonify(analysis_result), 200
    except Exception as e:
        # Handle any exceptions during the process
        return jsonify({'error': str(e)}), 500

# Define route for extracting and analyzing job data from LinkedIn
@app.route('/extract_analyze_job', methods=['POST'])
def extract_analyze_job():
    # Parse JSON data from the POST request
    data = request.json 
    # Get job URL from the request data
    job_url = data.get('job_url')
    if job_url:
        try:  
            # Extract and combine job and company data from LinkedIn
            job_data = linkedin_job_company_extractor(job_url)
            # Analyze the job description using OpenAI
            jd_analysis_result = analyze_linkedin_jd(job_data)
            # Return the job description analysis result
            return jsonify(jd_analysis_result), 200
        except Exception as e:
            # Handle errors during extraction or analysis
            return jsonify({'error': str(e)}), 500
    else:
        # Return error if job URL is missing
        return jsonify({'error': 'Job URL is required'}), 400

# Define route for matching LinkedIn profiles with job descriptions
@app.route('/match_profiles', methods=['POST'])
def match_profiles():
    # Parse JSON data from the POST request
    data = request.json
    if not data:
        # Return error if request data is not JSON
        return jsonify({'error': 'Request must be JSON'}), 400

    # Get profile and job data from the request
    profile_data = data.get('profile_data')
    job_data = data.get('job_data')
    if not profile_data or not job_data:
        # Return error if either profile or job data is missing
        return jsonify({'error': 'Both profile_data and job_data are required'}), 400

    try:
        # Match the profile with the job description
        match_result = job_matching_system(profile_data, job_data)
        # Return the match result
        return jsonify(match_result), 200
    except Exception as e:
        # Handle any errors during matching
        return jsonify({'error': str(e)}), 500

# Run the Flask
if __name__ == '__main__':
    app.run(debug=True)