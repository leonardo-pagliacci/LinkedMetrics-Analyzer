function startLoadingIndicator(action, duration = 30000) {
    const updateInterval = 400; // Time between updates in milliseconds.
    let currentStep = 0;
    const totalSteps = duration / updateInterval;

    const indicator = document.querySelector(`.${action}-loading-indicator`);
    const text = document.querySelector(`.${action}-loading-text`);

    if (!indicator || !text) {
        console.error(`Elements for ${action} loading indicator not found.`);
        return;
    }

    indicator.style.width = "0%";
    text.innerText = "0%";

    // Update progress at regular intervals.
    const progressInterval = setInterval(() => {
        currentStep++;
        const percentage = Math.min((currentStep / totalSteps) * 100, 100); // Ensures max of 100%.
        updateLoadingProgress(indicator, text, percentage);

        if (currentStep >= totalSteps) {
            clearInterval(progressInterval);
            // Can optionally hide the indicator here or reset it for a new action.
        }
    }, updateInterval);

    return { indicator, text, progressInterval }; // Return the indicator, text, and progressInterval
}

// Resets or hides the loading indicator for a given action.
function stopLoadingIndicator(action) {
    const indicator = document.querySelector(`.${action}-loading-indicator`);
    const text = document.querySelector(`.${action}-loading-text`);

    if (!indicator || !text) {
        console.error(`Elements for ${action} loading indicator not found.`);
        return;
    }

    indicator.style.width = "0%";
    text.innerText = "Completed";
    // If desired, you can also add code here to change the visibility or display properties.
}

// Updates the loading progress indicator with the current percentage.
function updateLoadingProgress(indicator, text, percentage) {
    const roundedPercentage = Math.floor(percentage); // Round down to nearest integer
    indicator.style.width = `${roundedPercentage}%`; // Update the width of the indicator element
    text.innerText = `${roundedPercentage}%`; // Update the text content to display the rounded percentage without the percentage symbol
}


function analyzeProfile() {
    const profileUrl = document.getElementById('profile_url').value;

    // Start loading indicator
    const { indicator, text, progressInterval } = startLoadingIndicator('profile-analysis');
    const button = document.querySelector('#linkedinInput button');
    button.classList.add('button-clicked');

    fetch('/extract_analyze_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_url: profileUrl })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load profile data');
        }
        return response.json();
    })
    .then(data => {
        console.log(data); // Log the data for debugging purposes
        window.profileAnalysisResult = data; // Optionally save the data for future use
        const resultDiv = document.getElementById('profileAnalysisResult');
        resultDiv.innerHTML = ''; // Clear previous content
        resultDiv.style.display = 'block';

        // Define institution name based on whether it's an object with original or translated fields, or just a string
        let institutionName = '';
        if (data.highestDegree && typeof data.highestDegree.institution === 'object') {
            institutionName = data.highestDegree.institution.original || data.highestDegree.institution.translated;
        } else if (data.highestDegree && typeof data.highestDegree.institution === 'string') {
            institutionName = data.highestDegree.institution;
        }

        // Construct the rest of the content
        let content = `
            <h3 class="result-title">Profile Report</h3>
            <p><strong>Full Name:</strong> ${data.fullName || 'N/A'}</p>
            <p><strong>Location:</strong> ${data.location || 'N/A'}</p>
            <p><strong>Highest Degree:</strong> ${data.highestDegree ? `${data.highestDegree.level} - ${data.highestDegree.fieldOfStudy} - ${institutionName}` : 'N/A'}</p>
            <div><strong>Last Professional Experience:</strong> ${data.lastProfessionalExperience.companyName || 'N/A'} - ${data.lastProfessionalExperience.title || 'N/A'} - from ${data.lastProfessionalExperience.startDate || 'N/A'} to ${data.lastProfessionalExperience.endDate || 'Present'} - ${data.lastProfessionalExperience.locationName || 'N/A'}${Array.isArray(data.lastProfessionalExperience.industries) && data.lastProfessionalExperience.industries.length > 0 ? ' - Industry: ' + data.lastProfessionalExperience.industries.join(', ') : ''}</div>
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
        // Make the result container visible
        const containerDiv = document.getElementById('profileContainer');
        containerDiv.style.display = 'block'; // Or 'block', adjust as needed
        
        // Append the constructed content to the result div
        resultDiv.innerHTML += content;

        // Ensure the loading indicator reaches 100% before hiding
        updateLoadingProgress(indicator, text, 100);

        // Stop the loading indicator
        clearInterval(progressInterval);
        stopLoadingIndicator('profile-analysis'); 
        button.classList.remove('button-clicked');
    })
    .catch(error => {
        console.error('Error:', error);
        const resultDiv = document.getElementById('profileAnalysisResult');
        resultDiv.innerHTML = `<p>Error occurred: ${error}</p>`;
        
        // Stop the loading indicator in case of error
        clearInterval(progressInterval);
        stopLoadingIndicator('profile-analysis');
        button.classList.remove('button-clicked');
    });
}



function analyzeJob() {
    const jobUrl = document.getElementById('job_url').value;

    // Start loading indicator
    const { indicator, text, progressInterval } = startLoadingIndicator('job-analysis');
    const button = document.querySelector('#job_url + button');
    button.classList.add('button-clicked');

    fetch('/extract_analyze_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_url: jobUrl })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load job data');
        }
        return response.json();
    })
    .then(data => {
        console.log(data); // Log the data for debugging purposes
        window.jobAnalysisResult = data; // Save the job analysis result for potential future use
        const resultDiv = document.getElementById('jobAnalysisResult');
        resultDiv.style.display = 'block';

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

        // Make the result container visible
        const containerDiv = document.getElementById('jobContainer');
        containerDiv.style.display = 'block'; // Or 'block', adjust as needed

        resultDiv.innerHTML = content;

        // Ensure the loading indicator reaches 100% before hiding
        updateLoadingProgress(indicator, text, 100);

        // Stop the loading indicator after content is rendered
        clearInterval(progressInterval);
        stopLoadingIndicator('job-analysis');
        button.classList.remove('button-clicked');
    })
    .catch(error => {
        console.error('Error:', error);
        const resultDiv = document.getElementById('jobAnalysisResult');
        resultDiv.innerHTML = `<p>Error occurred: ${error}</p>`;
        // Stop the loading indicator in case of error
        clearInterval(progressInterval);
        stopLoadingIndicator('job-analysis');
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
        console.log(data); // Log the data for debugging purposes
        window.profileAnalysisResult = data; // Save the analysis result for potential future use
        const resultDiv = document.getElementById('profileAnalysisResult');
        resultDiv.innerHTML = ''; // Clear previous content to ensure no overlap of data
        resultDiv.style.display = 'block'; // Make sure the result container is visible

        // Construct content with the given format
        let content = `
        <h3 class="result-title">Profile Report</h3>
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
    // Start loading indicator
    const { indicator, text, progressInterval } = startLoadingIndicator('match');
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
    .then(data => {
        displayMatchResult(data); // Display the match result
        // Ensure the loading indicator reaches 100% before hiding
        updateLoadingProgress(indicator, text, 100);
        // Stop the loading indicator after content is rendered
        clearInterval(progressInterval);
        stopLoadingIndicator('match');
        button.classList.remove('button-clicked');
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById('matchResult').innerHTML = `<p>Error occurred: ${error.message}</p>`;
        // Stop the loading indicator in case of error
        clearInterval(progressInterval);
        stopLoadingIndicator('match');
        button.classList.remove('button-clicked');
    });
}


function displayMatchResult(data) {
    console.log(data); // Log the data for debugging purposes
    const matchDiv = document.getElementById('matchResult');
    matchDiv.style.display = 'block'; // Make the container visible
    // Extract the numerical value of the overall score for the color function
    const overallScore = parseInt(data["Overall Compatibility Score"], 10);
    const overallScoreColor = getScoreColor(overallScore);
    let content = `
        <div style="
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        padding: 20px;
        border: 1px solid #000000; /* Thinner Black border */
        border-radius: 10px;
        margin-bottom: 20px;
        box-sizing: border-box;
        ">Overall Compatibility Score: <span style="color: ${overallScoreColor};">${data["Overall Compatibility Score"]}%</span>
        </div>
        ${generateMatchSection('Skill Matching', data.Details['Skill Matching'], true)}
        ${generateMatchSection('Professional Relevance', data.Details['Experience Relevance'])}
        ${generateMatchSection('Educational Alignment', data.Details['Educational Alignment'])}
        ${generateMatchSection('Cultural and Soft Skills Fit', data.Details['Cultural and Soft Skills Fit'])}
        ${generateMatchSection('Language and International Experience', data.Details['Language and International Experience'])}
        ${generateMatchSection('Growth Potential', data.Details['Growth Potential'])}
        <div style="
        border: 1px solid #000000;
        padding: 10px;
        border-radius: 10px;
        margin-bottom: 20px;
        ">
            <div style="text-align: center; font-weight: bold;">Summary</div>
            <p style="text-align: justify; margin: 10px 0;">${data.Summary}</p>
        </div>
    `;

    matchDiv.innerHTML = content;
}

function getScoreColor(score) {
    const colorThresholds = [
        { threshold: 90, color: '#2E8B57' }, // Sea Green
        { threshold: 76, color: '#3CB371' }, // Medium Sea Green
        { threshold: 60, color: '#FFD700' }, // Contrasting Gold
        { threshold: 50, color: '#FFA500' }  // Modern Orange for scores between 60 and 75
    ];

    // Default to Dark Red for scores below the lowest threshold
    const lowestThresholdColor = '#D32F2F'; // Dark Red

    // Find the color corresponding to the score
    for (let i = 0; i < colorThresholds.length; i++) {
        if (score >= colorThresholds[i].threshold) {
            return colorThresholds[i].color;
        }
    }

    return lowestThresholdColor;
}


function generateMatchSection(title, sectionData) {
    const sectionColor = getScoreColor(sectionData["Percentage Match"]);
    
    // Transform the array of suggestions into a single string with bullet points, or directly use the string
    let suggestionsContent;
    if (Array.isArray(sectionData["Suggestions"]) && sectionData["Suggestions"].length > 0) {
        suggestionsContent = sectionData["Suggestions"].map(suggestion => `- ${suggestion}`).join('<br>');
    } else if (typeof sectionData["Suggestions"] === 'string') {
        suggestionsContent = sectionData["Suggestions"];
    } else {
        suggestionsContent = 'N/A';
    }

    let content = `<div style="text-align: center;"><strong>${title}</strong>: ${sectionData["Match Status"]} <span style="color: ${sectionColor};font-weight: bold;">${sectionData["Percentage Match"]}%</span></div>`;

    if (title === 'Skill Matching') {
        // Handle matched and unmatched skills content for "Skill Matching" section
        let matchedSkillsContent = sectionData["Matched Skills"] ? sectionData["Matched Skills"].map(skill => `- ${skill}`).join('<br>') : 'Not available';
        let unmatchedSkillsContent = sectionData["Unmatched Skills"] ? sectionData["Unmatched Skills"].map(skill => `- ${skill}`).join('<br>') : 'Not available';

        content += `
            <div style="display: flex; justify-content: space-between;">
                <div style="text-align: left;">
                    <strong>Matched Skills:</strong><br>${matchedSkillsContent}
                </div>
                <div style="text-align: right;">
                    <strong>Unmatched Skills:</strong><br>${unmatchedSkillsContent}
                </div>
            </div>
            <hr>
        `;
    } else {
        // For other sections, display the suggestions
        content += `<p style="text-align: left;"><strong>Suggestions:</strong><br>${suggestionsContent}</p><hr>`;
    }

    return content;
}
