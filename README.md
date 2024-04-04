![logo_ironhack_blue 7](https://user-images.githubusercontent.com/23629340/40541063-a07a0a8a-601a-11e8-91b5-2f13e4e6b441.png)

# Ironhack Data Analytics & Machine Learning Bootcamp 2024 - Final Project
Welcome to my GitHub repository showcasing the final project I completed as part of the Data Analytics & Machine Learning bootcamp at Ironhack, where I underwent six months of intensive training in data analytics, mastering foundational skills, programming proficiency, machine learning techniques, and project-based learning.

The culmination of this bootcamp is showcased in my final project, where I tackled a real-world problem using the skills and techniques acquired throughout the course.


# LinkedMetrics Analyzer

## Overview

LinkedMetrics Analyzer is a groundbreaking web application crafted within the Flask framework, aimed at helping how professionals interact with LinkedIn. At its core, LinkedMetrics Analyzer harnesses the advanced capabilities of OpenAI's language models to conduct meticulous analyses of LinkedIn profiles, job descriptions, and resumes. This application stands out as an indispensable tool for individuals and professionals striving to enhance their LinkedIn presence, decode intricate job descriptions, and foster optimal matches between job seekers and potential career opportunities.

## Core Features

- **LinkedIn Profile Analysis:** Generates insights into LinkedIn profiles, highlighting strengths, potential improvements, and actionable suggestions.
- **Job Description Insights:** Extracts critical information from LinkedIn job postings, providing an overview of job requirements and company details.
- **Resume Analysis:** Analyzes resume PDFs and structures the information for LinkedIn profile enhancement or job application purposes.
- **Compatibility Assessment:** Evaluates compatibility between LinkedIn profiles and job descriptions, offering a scored assessment based on various criteria.

<img width="1224" alt="Screenshot 2024-04-04 at 13 04 00" src="https://github.com/leonardo-pagliacci/LinkedMetrics-Analyzer/assets/110601781/22746c1f-df58-4f1e-b496-2d63a993b10e">

## Project Structure

The application's structure provides a clean separation of concerns:

```
app/
    /static/js/
        - app.js (Handles UI interactions and AJAX requests)
    /templates/
        - index.html (Main application interface)
- app.py (Flask server and routing logic)
- linkedin_extractor.py (LinkedIn data extraction logic)
- prompt_engineering.py (OpenAI model integration for analysis)
- requirements.txt (Dependencies)
- .env.example (API keys and credentials template)
```

### Detailed File Overview

- **app.py:** Flask application's main file, defining routes for analysis functions and serving the web interface.
- **linkedin_extractor.py:** Functions for extracting data from LinkedIn profiles and job postings.
- **prompt_engineering.py:** Utilizes OpenAI's models for data analysis, generating reports and compatibility scores.
- **requirements.txt:** Lists required Python packages for running the application.
- **.env.example:** Template for environment variables needed for LinkedIn and OpenAI API access.

## Setup and Installation

### Clone the Repository
Clone the project and navigate into the directory:
```bash
git clone <repository-url>
cd LinkedIn-Analyzer
```

### Install Dependencies
Install necessary Python packages:
```bash
pip install -r requirements.txt
```

### Environment Setup
Create a `.env` file from the `.env.example` template and fill in your credentials:
```plaintext
LINKEDIN_USERNAME=your_username
LINKEDIN_PASSWORD=your_password
OPENAI_API_KEY=your_openai_key
```

### Launch the Application
Start the Flask server and access the application at `http://localhost:5000`:
```bash
flask run
```

This README provides a comprehensive guide to setting up and understanding the LinkedIn Analyzer application, highlighting its features, structure, and setup process for users.
