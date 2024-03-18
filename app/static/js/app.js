function showLoadingIndicator(show) {
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = show ? 'block' : 'none';
}

function analyzeProfile() {
    // Show loading indicator
    showLoadingIndicator(true);

    // Change button color
    const button = document.querySelector('#linkedinInput button'); // Adjust if you have specific IDs or classes
    button.classList.add('button-clicked');

    const profileUrl = document.getElementById('profile_url').value;
    fetch('/extract_analyze_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_url: profileUrl })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        window.profileAnalysisResult = data;
        const resultDiv = document.getElementById('profileAnalysisResult');
        resultDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    })
    .catch(error => {
        console.error('Error:', error);
        const resultDiv = document.getElementById('profileAnalysisResult');
        resultDiv.innerHTML = `<p>Error occurred: ${error.message}</p>`;
    })
    .finally(() => {
        // Hide loading indicator and reset button color
        showLoadingIndicator(false);
        button.classList.remove('button-clicked');
    });
}


function analyzeJob() {
    showLoadingIndicator(true);
    const button = document.querySelector('#job_url').nextElementSibling; // Assuming the button is right next to the input
    button.classList.add('button-clicked');

    const jobUrl = document.getElementById('job_url').value;
    fetch('/extract_analyze_job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_url: jobUrl })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.json();
    })
    .then(data => {
        window.jobAnalysisResult = data;
        const resultDiv = document.getElementById('jobAnalysisResult');
        resultDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
    })
    .catch(error => {
        console.error('Error:', error);
        const resultDiv = document.getElementById('jobAnalysisResult');
        resultDiv.innerHTML = `<p>Error occurred: ${error.message}</p>`;
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
        window.profileAnalysisResult = data;
        const resultDiv = document.getElementById('profileAnalysisResult');
        resultDiv.innerHTML = `<pre>${JSON.stringify(data, null, 2)}</pre>`;
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

    const profileData = window.profileAnalysisResult;
    const jobData = window.jobAnalysisResult;

    if (!profileData || !jobData) {
        alert('Profile or Job Data is missing!');
        showLoadingIndicator(false); // Hide loading indicator immediately if data is missing
        button.classList.remove('button-clicked');
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
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
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
    })
    .finally(() => {
        showLoadingIndicator(false);
        button.classList.remove('button-clicked');
    });
}
