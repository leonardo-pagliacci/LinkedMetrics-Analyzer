from flask import Flask, request, jsonify, render_template
import json
from linkedin_extractor import (
    linkedin_profile_extractor, 
    linkedin_job_description_extractor, 
    linkedin_company_info_extractor, 
    linkedin_job_company_extractor)
from prompt_engineering import (
    analyze_linkedin_profile, 
    upload_resume_and_analyze,
    analyze_linkedin_jd, 
    job_matching_system)

app = Flask(__name__) 

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/extract_analyze_profile', methods=['POST'])
def extract_and_analyze_profile():
    data = request.json  # Changed to request.json for AJAX requests
    profile_url = data.get('profile_url')
    if profile_url:
        try:
            profile_data = linkedin_profile_extractor(profile_url)
            analysis_result = analyze_linkedin_profile(profile_data)
            return jsonify(analysis_result), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Profile URL is required'}), 400

@app.route('/upload_analyze_resume', methods=['POST'])
def handle_resume_upload():
    file = request.files.get('resume')
    if not file:
        return jsonify({'error': 'No resume file provided'}), 400
    try:
        resume_data = upload_resume_and_analyze(file)
        if 'error' in resume_data:
            return jsonify(resume_data), 500  # If error in processing resume, return it
        analysis_result = analyze_linkedin_profile(resume_data)
        return jsonify(analysis_result), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/extract_analyze_job', methods=['POST'])
def extract_analyze_job():
    data = request.json  # Changed to request.json for AJAX requests
    job_url = data.get('job_url')
    if job_url:
        try:
            job_data = linkedin_job_company_extractor(job_url)
            jd_analysis_result = analyze_linkedin_jd(job_data)
            return jsonify(jd_analysis_result), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Job URL is required'}), 400

@app.route('/match_profiles', methods=['POST'])
def match_profiles():
    data = request.json  # Properly parse JSON body
    profile_data = data.get('profile_data')
    job_data = data.get('job_data')
    if profile_data and job_data:
        try:
            # Assuming job_matching_system function is prepared to handle the dictionaries
            match_result = job_matching_system(profile_data, job_data)
            return jsonify(match_result), 200
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    else:
        return jsonify({'error': 'Both profile and job description data are required'}), 400

if __name__ == '__main__':
    app.run(debug=True)