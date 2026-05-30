# ResumeAnalyzer AI

ResumeAnalyzer AI is a full-stack AI-powered application that helps candidates prepare for interviews by analyzing their resume, self-description, and target job description. The platform generates a personalized interview preparation report, including technical questions, behavioral questions, skill gap analysis, and a structured preparation plan.

## Features

### Resume Analysis

* Upload resume files for analysis
* Extract candidate information
* Compare candidate profile against job requirements

### AI-Powered Interview Report

Generate a detailed interview preparation report containing:

#### Match Score

* Overall compatibility score between candidate profile and job description

#### Technical Questions

* Role-specific technical interview questions
* Expected answers
* Interviewer's intention behind each question

#### Behavioral Questions

* Behavioral and situational interview questions
* Suggested answers
* Interviewer's evaluation criteria

#### Skill Gap Analysis

* Missing or weak skills identified
* Severity classification (Low, Medium, High)

#### Personalized Preparation Plan

* Day-wise preparation roadmap
* Actionable tasks and learning objectives

## Tech Stack

### Frontend

* React
* Vite
* Axios
* Sass

### Backend

* Node.js
* Express.js

### Database

* MongoDB
* Mongoose

### AI Integration

* Gemini 3 Flash Preview

### DevOps & Deployment

* Docker
* AWS
* Vercel

## Project Architecture

```text
┌────────────────────┐
│      React App     │
│  (Vite + Sass)     │
└─────────┬──────────┘
          │
          │ Axios API Calls
          ▼
┌────────────────────┐
│    Express API     │
└─────────┬──────────┘
          │
   ┌──────┴──────┐
   │             │
   ▼             ▼
MongoDB      Gemini AI
(Mongoose)   (Analysis Engine)
```

## Workflow

1. User enters:

   * Self Description
   * Job Description

2. User uploads resume

3. Backend processes the request

4. Gemini AI analyzes:

   * Resume
   * User profile
   * Job requirements

5. Application generates an interview report

6. User receives:

   * Match Score
   * Technical Questions
   * Behavioral Questions
   * Skill Gaps
   * Preparation Plan

## Sample Response Structure

```json
{
  "title": "Frontend Developer Interview Report",
  "matchScore": 85,
  "technicalQuestions": [
    {
      "question": "What are React Hooks?",
      "intention": "Evaluate React fundamentals",
      "answer": "React Hooks allow functional components to use state and lifecycle features."
    }
  ],
  "behaviourQuestions": [
    {
      "question": "Describe a challenging project you worked on.",
      "intention": "Assess problem-solving and ownership",
      "answer": "Explain the challenge, actions taken, and results achieved."
    }
  ],
  "skillGaps": [
    {
      "skill": "Docker",
      "severity": "Medium"
    }
  ],
  "preparationPlan": [
    {
      "day": 1,
      "focus": "React Fundamentals",
      "task": [
        "Review Hooks",
        "Practice component design"
      ]
    }
  ]
}
```
