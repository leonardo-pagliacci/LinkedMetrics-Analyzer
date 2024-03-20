function showLoadingIndicator(show) {
    const loader = document.getElementById('loadingIndicator');
    if (show) {
        loader.classList.add('show');
    } else {
        loader.classList.remove('show');
    }
}

function analyzeProfile() {
    showLoadingIndicator(true);
    const button = document.querySelector('#linkedinInput button');
    button.classList.add('button-clicked');
    const profileUrl = document.getElementById('profile_url').value;

    fetch('/extract_analyze_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_url: profileUrl })
    })
    .then(response => response.ok ? response.json() : Promise.reject('Failed to load profile data'))
    .then(data => {
        window.profileAnalysisResult = data; // Save the analysis result for potential future use
        const resultDiv = document.getElementById('profileAnalysisResult');
        // Add subtitle dynamically
        let content = `
        <h3 class="result-title hidden">Profile Report</h3>
        <img src="${data.profilePictureUrl || 'placeholder.jpg'}" alt="Profile Picture" style="max-width: 100px; height: auto; display: block; margin: 0 auto;">
        <p><strong>Full Name:</strong> ${data.fullName || 'N/A'}</p>
        <p><strong>Location:</strong> ${data.location || 'N/A'}</p>
        <p><strong>Highest Degree:</strong> ${data.highestDegree ? `${data.highestDegree.level} - ${data.highestDegree.fieldOfStudy} - ${data.highestDegree.institution}` : 'N/A'}</p>
        <hr>
        <div style="display: flex; justify-content: space-between;">
            <div style="flex: 1;"><strong>Hard Skills:</strong><br>${Array.isArray(data.hardSkills) ? data.hardSkills.join(', ') : 'Not available'}</div>
            <div style="flex: 1; text-align: right;"><strong>Soft Skills:</strong><br>${Array.isArray(data.softSkills) ? data.softSkills.join(', ') : 'Not available'}</div>
        </div>
        <hr>
        <div style="display: flex; flex-direction: column;">
            <div><strong>Strengths:</strong><br>${Array.isArray(data.strengths) ? data.strengths.map(strength => `- ${strength}`).join('<br>') : 'Not available'}</div>
            <div style="margin-top: 10px;"><strong>Weaknesses:</strong><br>${Array.isArray(data.weaknesses) ? data.weaknesses.map(weakness => `- ${weakness}`).join('<br>') : 'Not available'}</div>
        </div>
        <hr>
        <p><strong>Improvement Suggestions:</strong><br>${Array.isArray(data.improvementSuggestions) ? data.improvementSuggestions.map(suggestion => `- ${suggestion}`).join('<br>') : data.improvementSuggestions || 'N/A'}</p>
        <p><strong>Career Suggestions:</strong><br>${Array.isArray(data.careerSuggestions) ? data.careerSuggestions.map(suggestion => `- ${suggestion}`).join('<br>') : 'N/A'}</p>
        `;
        resultDiv.innerHTML = content;
    })
    .catch(error => {
        console.error('Error:', error);
        const resultDiv = document.getElementById('profileAnalysisResult');
        resultDiv.innerHTML = `<p>Error occurred: ${error}</p>`;
    })
    .finally(() => {
        showLoadingIndicator(false);
        button.classList.remove('button-clicked');
    });
}




function analyzeJob() {
    showLoadingIndicator(true);
    const button = document.querySelector('#job_url');
    button.classList.add('button-clicked');
    const jobUrl = document.getElementById('job_url').value;

    fetch('/extract_analyze_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_url: jobUrl })
    })
    .then(response => response.ok ? response.json() : Promise.reject('Failed to load job data'))
    .then(data => {
        window.jobAnalysisResult = data; // Save the job analysis result for potential future use
        const resultDiv = document.getElementById('jobAnalysisResult');
        // Dynamically add the subtitle
        let content = `
        <h3 class="result-title">Job Description Report</h3>
        <p><strong>Job Title:</strong> ${data.jobTitle || 'N/A'}</p>
        <p><strong>Location:</strong> ${data.location || 'N/A'}</p>
        <p><strong>Overview:</strong> ${data.overview || 'N/A'}</p>
        <hr>
        <p><strong>Experience Level:</strong> ${data.experienceLevel || 'N/A'}</p>
        <p><strong>Academic Requirements:</strong> Degree Level: ${data.academicRequirements ? data.academicRequirements.degreeLevel || 'Not specified' : 'N/A'}</p>
        <div class="flex-container">
            <div style="flex: 1;"><strong>Hard Skills Required:</strong><br>${Array.isArray(data.skillsRequired.hardSkills) ? data.skillsRequired.hardSkills.map(skill => `- ${skill}`).join('<br>') : 'Not available'}</div>
            <div style="flex: 1;" class="right-align"><strong>Soft Skills Required:</strong><br>${Array.isArray(data.skillsRequired.softSkills) ? data.skillsRequired.softSkills.map(skill => `- ${skill}`).join('<br>') : 'Not available'}</div>
        </div>
        <p><strong>Key Responsibilities:</strong><br>${Array.isArray(data.keyResponsibilities) ? data.keyResponsibilities.map(responsibility => `- ${responsibility}`).join('<br>') : 'Not available'}</p>
        <hr>
        <p style="text-align: center; font-weight: bold;">Company Info</p>
        <p><strong>Company Name:</strong> ${data.companyInfo ? data.companyInfo.name || 'N/A' : 'N/A'}</p>
        <p><strong>LinkedIn URL:</strong> <a href="${data.companyInfo && data.companyInfo.linkedinUrl ? data.companyInfo.linkedinUrl : '#'}" target="_blank">${data.companyInfo && data.companyInfo.linkedinUrl || 'N/A'}</a></p>
        <p><strong>Company Overview:</strong> ${data.companyInfo ? data.companyInfo.overview || 'N/A' : 'N/A'}</p>
        <p><strong>Specialties:</strong> ${Array.isArray(data.companyInfo && data.companyInfo.specialties) ? data.companyInfo.specialties.join(', ') : 'Not available'}</p>
    `;
        resultDiv.innerHTML = content;
    })
    .catch(error => {
        console.error('Error:', error);
        const resultDiv = document.getElementById('jobAnalysisResult');
        resultDiv.innerHTML = `<p>Error occurred: ${error}</p>`;
    })
    .finally(() => {
        showLoadingIndicator(false);
        button.classList.remove('button-clicked');
    });
}

function uploadAndAnalyzeResume() {
    showLoadingIndicator(true);
    const button = document.querySelector('#resumeInput button');
    button.classList.add('button-clicked');

    const formData = new FormData();
    const resumeFile = document.getElementById('resume').files[0];
    if (!resumeFile) {
        alert("Please select a resume file to upload.");
        showLoadingIndicator(false); // Hide loading indicator if no file selected
        button.classList.remove('button-clicked'); // Reset button color if no file selected
        return;
    }
    formData.append('resume', resumeFile);

    fetch('/upload_analyze_resume', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        window.profileAnalysisResult = data; // Save the analysis result for potential future use
        const resultDiv = document.getElementById('profileAnalysisResult');
        // Construct content with the given format
        let content = `
        <h3 class="result-title">Profile Report</h3>
        <img src="${data.profilePictureUrl || 'placeholder.jpg'}" alt="Profile Picture" style="max-width: 100px; height: auto; display: block; margin: 0 auto;">
        <p><strong>Full Name:</strong> ${data.fullName || 'N/A'}</p>
        <p><strong>Location:</strong> ${data.location || 'N/A'}</p>
        <p><strong>Highest Degree:</strong> ${data.highestDegree ? `${data.highestDegree.level} - ${data.highestDegree.fieldOfStudy} - ${data.highestDegree.institution}` : 'N/A'}</p>
        <hr>
        <div style="display: flex; justify-content: space-between;">
            <div style="flex: 1;"><strong>Hard Skills:</strong><br>${Array.isArray(data.hardSkills) ? data.hardSkills.join(', ') : 'Not available'}</div>
            <div style="flex: 1; text-align: right;"><strong>Soft Skills:</strong><br>${Array.isArray(data.softSkills) ? data.softSkills.join(', ') : 'Not available'}</div>
        </div>
        <hr>
        <div style="display: flex; flex-direction: column;">
            <div><strong>Strengths:</strong><br>${Array.isArray(data.strengths) ? data.strengths.map(strength => `- ${strength}`).join('<br>') : 'Not available'}</div>
            <div style="margin-top: 10px;"><strong>Weaknesses:</strong><br>${Array.isArray(data.weaknesses) ? data.weaknesses.map(weakness => `- ${weakness}`).join('<br>') : 'Not available'}</div>
        </div>
        <hr>
        <p><strong>Improvement Suggestions:</strong><br>${Array.isArray(data.improvementSuggestions) ? data.improvementSuggestions.map(suggestion => `- ${suggestion}`).join('<br>') : data.improvementSuggestions || 'N/A'}</p>
        <p><strong>Career Suggestions:</strong><br>${Array.isArray(data.careerSuggestions) ? data.careerSuggestions.map(suggestion => `- ${suggestion}`).join('<br>') : 'N/A'}</p>
        `;
        resultDiv.innerHTML = content;
    })
    .catch(error => {
        console.error('Error:', error);
        const resultDiv = document.getElementById('profileAnalysisResult');
        resultDiv.innerHTML = `<p>Error occurred: ${error.message}</p>`;
    })
    .finally(() => {
        showLoadingIndicator(false);
        button.classList.remove('button-clicked');
    });
}


function toggleInputMethod() {
    var inputType = document.getElementById('inputType').value;
    var linkedinInputDiv = document.getElementById('linkedinInput');
    var resumeInputDiv = document.getElementById('resumeInput');

    if (inputType === 'linkedin') {
        linkedinInputDiv.style.display = 'block';
        resumeInputDiv.style.display = 'none';
    } else if (inputType === 'resume') {
        linkedinInputDiv.style.display = 'none';
        resumeInputDiv.style.display = 'block';
    }
}


function matchProfiles() {
    showLoadingIndicator(true);
    const button = document.querySelector('.match-button');
    button.classList.add('button-clicked');

    // Retrieve the stored profile and job analysis results
    const profileData = window.profileAnalysisResult;
    const jobData = window.jobAnalysisResult;

    // Check if profile and job data are present
    if (!profileData || !jobData) {
        alert('Profile or Job Data is missing!');
        showLoadingIndicator(false);
        button.classList.remove('button-clicked');
        return;
    }

    // Attempt to match profiles
    fetch('/match_profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            profile_data: profileData,
            job_data: jobData
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load match data');
        }
        return response.json();
    })
    .then(data => displayMatchResult(data)) // Display the match result
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('matchResult').innerHTML = `<p>Error occurred: ${error.message}</p>`;
    })
    .finally(() => {
        showLoadingIndicator(false);
        button.classList.remove('button-clicked');
    });
}

function displayMatchResult(data) {
    const matchDiv = document.getElementById('matchResult');
    const overallScoreColor = getScoreColor(data["Overall Compatibility Score"]);
    let content = `
        <p style="font-size: 24px; font-weight: bold; color: ${overallScoreColor}; text-align: center;">Overall Compatibility Score: ${data["Overall Compatibility Score"]}</p>
        <hr>
        ${generateMatchSection('Skill Matching', data.Details['Skill Matching'])}
        ${generateMatchSection('Experience Relevance', data.Details['Experience Relevance'])}
        ${generateMatchSection('Educational Alignment', data.Details['Educational Alignment'])}
        ${generateMatchSection('Cultural and Soft Skills Fit', data.Details['Cultural and Soft Skills Fit'])}
        ${generateMatchSection('Language and International Experience', data.Details['Language and International Experience'])}
        ${generateMatchSection('Growth Potential', data.Details['Growth Potential'])}
        <p style="font-weight: bold; text-align: center;">Summary</p>
        <p>${data.Summary}</p>
    `;
    matchDiv.innerHTML = content;
}


function getScoreColor(score) {
    if (score >= 90) return '#006400'; // darkgreen
    if (score >= 76) return '#008000'; // green
    if (score >= 60) return '#FFD700'; // gold
    return '#FFA500'; // orange
}

function generateMatchSection(title, sectionData) {
    const sectionColor = getScoreColor(sectionData["Percentage Match"]);
    let matchedSkillsContent, unmatchedSkillsContent;

    if (Array.isArray(sectionData["Matched Skills"]) && sectionData["Matched Skills"].length > 0) {
        matchedSkillsContent = sectionData["Matched Skills"].map(skill => `- ${skill}`).join('<br>');
    } else {
        matchedSkillsContent = 'Not available';
    }

    if (Array.isArray(sectionData["Unmatched Skills"]) && sectionData["Unmatched Skills"].length > 0) {
        unmatchedSkillsContent = sectionData["Unmatched Skills"].map(skill => `- ${skill}`).join('<br>');
    } else {
        unmatchedSkillsContent = 'Not available';
    }

    return `
        <div style="text-align: center;"><strong>${title}</strong>: ${sectionData["Match Status"]} <span style="color: ${sectionColor};">(${sectionData["Percentage Match"]}%)</span></div>
        <div style="display: flex; justify-content: space-between;">
            <div><strong>Matched Skills:</strong><br>${matchedSkillsContent}</div>
            <div><strong>Unmatched Skills:</strong><br>${unmatchedSkillsContent}</div>
        </div>
        <p><strong>Suggestions:</strong> ${sectionData["Suggestions"] || 'N/A'}</p>
        <hr>
    `;
}



