function analyzeProfile() {
    const profileUrl = document.getElementById('profile_url').value;
    fetch('/extract_analyze_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_url: profileUrl })
    })
    .then(response => response.json())
    .then(data => {
        window.profileAnalysisResult = data; // Store the profile analysis result globally
        const resultDiv = document.getElementById('profileAnalysisResult');
        resultDiv.innerHTML = JSON.stringify(data, null, 2); // Formatting the JSON for readability
    })
    .catch(error => console.error('Error:', error));
}

function analyzeJob() {
    const jobUrl = document.getElementById('job_url').value;
    fetch('/extract_analyze_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_url: jobUrl })
    })
    .then(response => response.json())
    .then(data => {
        window.jobAnalysisResult = data; // Store the job analysis result globally
        const resultDiv = document.getElementById('jobAnalysisResult');
        resultDiv.innerHTML = JSON.stringify(data, null, 2); // Formatting the JSON for readability
    })
    .catch(error => console.error('Error:', error));
}


function uploadAndAnalyzeResume() {
    const formData = new FormData();
    const resumeFile = document.getElementById('resume').files[0];
    if (!resumeFile) {
        alert("Please select a resume file to upload.");
        return;
    }
    formData.append('resume', resumeFile);

    fetch('/upload_analyze_resume', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        // Display the analysis result in the resumeAnalysisResult div
        const resultDiv = document.getElementById('resumeAnalysisResult');
        resultDiv.innerHTML = "<pre>" + JSON.stringify(data, null, 2) + "</pre>"; // Formatting the JSON for readability within a <pre> tag
    })
    .catch(error => {
        console.error('Error:', error);
        const resultDiv = document.getElementById('resumeAnalysisResult');
        resultDiv.textContent = 'Failed to analyze resume. Error: ' + error;
    });
}

function matchProfiles() {
    const profileData = window.profileAnalysisResult;
    const jobData = window.jobAnalysisResult;

    console.log("Sending for match:", profileData, jobData); // Debug log

    if (!profileData || !jobData) {
        alert('Profile or Job Data is missing!');
        return;
    }

    fetch('/match_profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            profile_data: profileData,
            job_data: jobData
        })
    })
    .then(response => {
        // Check if the response is ok (status in the range 200-299)
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        console.log("Match result:", data); // Debug log

        // Display the match result in the matchResult div
        const matchDiv = document.getElementById('matchResult');
        // This creates a preformatted text element to nicely format the JSON result
        matchDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    })
    .catch(error => {
        console.error('Error:', error);
        // Display an error message to the user
        const matchDiv = document.getElementById('matchResult');
        matchDiv.innerHTML = `<p>Error occurred: ${error.message}</p>`;
    });
}
