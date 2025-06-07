# AI Tutor – Web-based AI-Powered Learning App

**AI Tutor** is a web application that provides an interactive, subject-focused tutoring experience. The app offers a real-time **chat interface** to converse with an AI tutor, **subject-wise content generation** (summaries, quizzes, etc.), and **Q\&A capabilities** powered by Google’s advanced language model (Gemini). It was developed during the **Binary Battle 2025** hackathon (Navonmesh event at Scope Global Skills University, Bhopal), where the team secured 5th place and had the opportunity to meet **Aman Gupta** (co-founder of boAt).

## Key Features

* **AI Chatbot Interface:** Talk to the AI tutor in a conversational chat UI. The tutor can explain concepts, answer questions, and provide study tips in real time.
* **Subject-Specific Content Generation:** Generate customized educational content (summaries, explanations, quizzes) for different subjects on demand.
* **Interactive Q\&A:** Ask the AI tutor subject-related questions and get detailed answers, leveraging the power of large language models (LLMs).
* **User Profiles & Progress:** Users can sign up, track their learning progress, and save favorite topics (powered by Firebase/MongoDB backend).
* **Educational Guidance:** The app uses Google’s Gemini API (Vertex AI) for content generation, enabling rich, multimodal learning resources.

## Technology Stack

* **Frontend:** React – a JavaScript library for building user interfaces. We use React (with Vite) to create a responsive chat and navigation UI.
* **Backend:** Flask – a lightweight Python web framework. Flask handles API endpoints for chat messages, content generation, and user data.
* **Database:** MongoDB – a scalable NoSQL document database (or Firebase for authentication). Used to store user profiles, conversation history, and generated content.
* **AI/API:** Google Gemini API – provides access to Google’s latest generative LLMs for content generation. The backend calls the Gemini REST API to produce responses to user queries.

## Hackathon Background

This project was built for **Binary Battle 2025**, a 24-hour software hackathon held at Scope Global Skills University (Bhopal) as part of the Navonmesh fest. Our team worked intensively on a smart AI tutoring solution and earned **5th place** among all teams. During the event, we also had the honor of meeting **Aman Gupta**, co-founder of boAt Lifestyle, who shared inspiring insights on technology and entrepreneurship.

## Setup Instructions

To run the AI Tutor app locally, follow these steps:

1. **Clone the repository:**

   ```bash
   git clone https://github.com/Shauryaraje7/Ai-Tutor-.git
   cd Ai-Tutor-
   ```

2. **Configure the Backend (Flask):**

   * Navigate to the backend directory: `cd backend`.
   * Create a Python virtual environment and activate it (e.g., `python3 -m venv venv && source venv/bin/activate`).
   * Install required Python packages (Flask, requests, etc.):

     ```bash
     pip install -r requirements.txt
     ```
   * Create a `.env` file in the `backend` folder with your configuration (you may copy from `.env.example` if provided). Set at least:

     ```
     GEMINI_API_KEY=your_google_cloud_api_key
     MONGODB_URI=your_mongodb_connection_string
     ```
   * Ensure MongoDB is running locally or use a hosted MongoDB (like Atlas). If using MongoDB Atlas, obtain the connection string and set `MONGODB_URI` accordingly.
   * Start the Flask server:

     ```bash
     flask run
     ```

     By default, the backend will run on `http://localhost:5000`.

3. **Configure the Frontend (React/Vite):**

   * In a new terminal, go to the frontend directory: `cd frontend`.
   * Install Node.js dependencies:

     ```bash
     npm install
     ```
   * (Optional) If the app uses Firebase authentication, create a `.env` in the `frontend` folder with your Firebase config keys (as `VITE_FIREBASE_API_KEY`, etc.).
   * Start the development server:

     ```bash
     npm run dev
     ```

     This will launch the React app (typically at `http://localhost:3000`).

4. **API Key and Services:**

   * **Gemini API Key:** Obtain a Google Cloud API key with access to Vertex AI Generative Models (Gemini). Set `GEMINI_API_KEY` in the backend `.env`. More on Gemini API here.
   * **MongoDB:** If running locally, install MongoDB Community Server and ensure the service is running. Otherwise, set up a free MongoDB Atlas cluster and use that connection string.

## Usage Instructions

Once both servers are running:

* Open the app in your browser (e.g., go to `http://localhost:3000`).
* **Sign Up / Log In:** Create an account or log in (Firebase Auth) to access the tutor features.
* **Chat with the Tutor:** Use the chat panel to ask questions or request content. For example, “Explain Newton’s laws of motion” or “Give me a practice quiz on algebra.” The AI tutor will respond using Gemini’s LLM.
* **Select Subjects:** Choose the subject/topic of interest (e.g., Math, Science, History) from the sidebar. The content generation and answers will be tailored to that subject.
* **View Profile and Progress:** Check the profile/progress section to see saved conversations or quiz scores.
* **Server Logs:** The backend console will log incoming requests and responses for debugging. You can also inspect the MongoDB database to see stored chats and user data.

## Screenshots

Below are placeholder images for key parts of the AI Tutor app. Replace these with actual screenshots of your app’s UI before publishing:

* **Chat Interface:**
  ![Chat Interface Screenshot](path/to/chat_interface.png)
* **Subject Content Generation:**
  ![Content Generation Screenshot](path/to/content_generation.png)
* **Quiz and Progress:**
  ![Quiz Interface Screenshot](path/to/quiz_interface.png)

*(Screenshots are for illustration. Update with real images of the app once available.)*

## Contributing

Contributions are welcome! To contribute:

* Fork the repository and create a new feature branch (e.g., `feature-new-topic`).
* Commit your changes in that branch, then push to your fork.
* Submit a pull request describing your feature or fix.
* Ensure code is well-documented and follows existing style.
* Report any issues or suggest enhancements via GitHub Issues.

Please review existing [issues](https://github.com/Shauryaraje7/Ai-Tutor-/issues) to avoid duplicates, and describe your changes clearly in PRs. For guidance on contribution guidelines, see GitHub’s documentation on [setting guidelines for repository contributors](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions).

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT) – see the LICENSE file for details. All source code is open source and free to use under MIT terms.
