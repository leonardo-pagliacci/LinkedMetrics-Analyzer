function analyzeProfile() {
    const profileUrl = document.getElementById('profile_url').value;
    fetch('/extract_analyze_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_url: profileUrl })
    })
    .then(response => response.json())
    .then(data => {
        window.profileAnalysisResult = data;
        const resultDiv = document.getElementById('profileAnalysisResult');
        resultDiv.innerHTML = JSON.stringify(data, null, 2);
    })
    .catch(error => {
        console.error('Error:', error);
    });
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
        window.jobAnalysisResult = data;
        const resultDiv = document.getElementById('jobAnalysisResult');
        resultDiv.innerHTML = JSON.stringify(data, null, 2);
    })
    .catch(error => {
        console.error('Error:', error);
    });
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
        window.profileAnalysisResult = data;
        const resultDiv = document.getElementById('profileAnalysisResult');
        resultDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    })
    .catch(error => {
        console.error('Error:', error);
        const resultDiv = document.getElementById('profileAnalysisResult');
        resultDiv.textContent = `Failed to analyze resume. Error: ${error}`;
    });
}

function matchProfiles() {
    const profileData = window.profileAnalysisResult;
    const jobData = window.jobAnalysisResult;

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
        if (!response.ok) throw new Error('Network response was not ok');
        return response.json();
    })
    .then(data => {
        const matchDiv = document.getElementById('matchResult');
        matchDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    })
    .catch(error => {
        console.error('Error:', error);
        const matchDiv = document.getElementById('matchResult');
        matchDiv.innerHTML = `<p>Error occurred: ${error.message}</p>`;
    });
}
