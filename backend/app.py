from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
import time

app = Flask(__name__)
CORS(app)
load_dotenv()

# API key for Gemini API (your updated key)
API_KEY = 'AIzaSyCmCmLTaVf2iMlbxLN9NFoL1u_LPQJclV4'
GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/models/gemini-1.5-pro:generateContent'

# In-memory store for user data
users_data = {}

# Helper function to call Gemini API
def call_gemini(prompt, max_tokens=200):
    try:
        response = requests.post(
            f"{GEMINI_API_URL}?key={API_KEY}",
            json={
                'contents': [{'parts': [{'text': prompt}]}],
                'generationConfig': {'maxOutputTokens': max_tokens}
            },
            headers={'Content-Type': 'application/json'}
        )
        response_data = response.json()
        if 'error' in response_data:
            print(f"API Error: {response_data['error']}")
            return None, response_data['error']['message']
        return response_data['candidates'][0]['content']['parts'][0]['text'], None
    except requests.exceptions.RequestException as e:
        print(f"Request Error: {str(e)}")
        return None, f'Failed to fetch data: {str(e)}'
    except KeyError as e:
        print(f"KeyError in response parsing: {str(e)}")
        print(f"Full response: {response_data}")
        return None, 'Unexpected response format from API'
    except Exception as e:
        print(f"Unexpected Error: {str(e)}")
        return None, str(e)

# Helper function to clean Markdown
def clean_text(text):
    """Remove Markdown formatting like **bold** from text."""
    return text.replace('**', '').replace('*', '').strip()

@app.route('/explain-topic', methods=['POST'])
def explain_topic():
    data = request.json
    topic = data.get('topic')
    class_standard = data.get('classStandard')
    user_id = data.get('userId', 'default_user')
    if not topic or not class_standard:
        print("Validation Error: Topic or classStandard missing")
        return jsonify({'error': 'Topic and classStandard are required'}), 400

    print(f"Received request - User: {user_id}, Topic: {topic}, Class Standard: {class_standard}")
    prompt = f"Explain {topic} in a clear, concise way for a {class_standard} student."
    explanation, error = call_gemini(prompt)
    if error:
        return jsonify({'error': error}), 500

    if user_id not in users_data:
        users_data[user_id] = {'profile': {}, 'progress': [], 'learning_session': {}}

    return jsonify({'explanation': explanation})

@app.route('/re-explain-topic', methods=['POST'])
def re_explain_topic():
    data = request.json
    topic = data.get('topic')
    style = data.get('style')
    if not topic or not style:
        print("Validation Error: Topic or style missing")
        return jsonify({'error': 'Topic and style are required'}), 400

    prompt = (
        f"Explain {topic} in a simpler way for a beginner." if style == 'simpler'
        else f"Explain {topic} with a real-world example suitable for a student."
    )
    explanation, error = call_gemini(prompt)
    if error:
        return jsonify({'error': error}), 500

    return jsonify({'explanation': explanation})

@app.route('/generate-questions', methods=['POST'])
def generate_questions():
    data = request.json
    topic = data.get('topic')
    class_standard = data.get('classStandard')
    user_id = data.get('userId', 'default_user')
    if not topic or not class_standard:
        print("Validation Error: Topic or classStandard missing")
        return jsonify({'error': 'Topic and classStandard are required'}), 400

    prompt = (
        f"Generate exactly 3 questions about {topic} for a {class_standard} student. "
        f"1. Easy (definition-based question). 2. Medium (conceptual understanding question). "
        f"3. Hard (application or analysis question). Format each as:\n"
        f"- Question: [question text]\n  Answer: [answer text]\n"
    )
    qa_text, error = call_gemini(prompt, max_tokens=800)
    if error:
        return jsonify({'error': error}), 500

    questions = {}
    current_level = None
    current_question = None
    current_answer = None
    for line in qa_text.split('\n'):
        line = line.strip()
        if not line:
            continue
        if line.startswith('- Question:'):
            if current_level and current_question and current_answer:
                questions[current_level] = {'question': current_question, 'answer': current_answer}
            if 'easy' not in questions:
                current_level = 'easy'
            elif 'medium' not in questions:
                current_level = 'medium'
            else:
                current_level = 'hard'
            current_question = line.replace('- Question:', '').strip()
        elif line.startswith('Answer:') and current_level and current_question:
            current_answer = line.replace('Answer:', '').strip()

    if current_level and current_question and current_answer:
        questions[current_level] = {'question': current_question, 'answer': current_answer}

    required_levels = ['easy', 'medium', 'hard']
    for level in required_levels:
        if level not in questions:
            questions[level] = {
                'question': f"What is a basic {level} question about {topic}?",
                'answer': f"This is a placeholder answer for the {level} question about {topic}."
            }

    return jsonify(questions)

@app.route('/evaluate-answers', methods=['POST'])
def evaluate_answers():
    data = request.json
    user_id = data.get('userId', 'default_user')
    user_answers = data.get('userAnswers')
    correct_answers = data.get('correctAnswers')
    topic = data.get('topic')
    if not user_answers or not correct_answers or not topic:
        print("Validation Error: userAnswers, correctAnswers, or topic missing")
        return jsonify({'error': 'userAnswers, correctAnswers, and topic are required'}), 400

    feedback = {}
    score = 0
    for level in ['easy', 'medium', 'hard']:
        user_ans = user_answers[level]
        correct_ans = correct_answers[level]['answer']
        prompt = f"Compare the user answer '{user_ans}' with the correct answer '{correct_ans}'. Is it correct or close? Provide feedback in 1-2 sentences."
        fb_text, error = call_gemini(prompt, max_tokens=100)
        if error:
            return jsonify({'error': error}), 500
        feedback[level] = fb_text
        if 'correct' in fb_text.lower():
            score += 1 if level == 'easy' else 2 if level == 'medium' else 3

    if user_id not in users_data:
        users_data[user_id] = {'profile': {}, 'progress': [], 'learning_session': {}}
    test_result = {
        'topic': topic,
        'score': score,
        'maxScore': 6,
        'feedback': feedback,
        'timestamp': int(time.time())
    }
    users_data[user_id]['progress'].append(test_result)

    return jsonify({'score': score, 'feedback': feedback})

@app.route('/save-profile', methods=['POST'])
def save_profile():
    data = request.json
    user_id = data.get('userId', 'default_user')
    name = data.get('name')
    dob = data.get('dateOfBirth')
    standard = data.get('standard')
    if not name or not dob or not standard:
        print("Validation Error: name, dateOfBirth, or standard missing")
        return jsonify({'error': 'name, dateOfBirth, and standard are required'}), 400

    if user_id not in users_data:
        users_data[user_id] = {'profile': {}, 'progress': [], 'learning_session': {}}
    users_data[user_id]['profile'] = {'name': name, 'dateOfBirth': dob, 'standard': standard}
    return jsonify({'message': 'Profile saved successfully'})

@app.route('/get-profile', methods=['GET'])
def get_profile():
    user_id = request.args.get('userId', 'default_user')
    if user_id not in users_data or 'profile' not in users_data[user_id]:
        return jsonify({'profile': {}})
    return jsonify({'profile': users_data[user_id]['profile']})

@app.route('/get-overall-progress', methods=['GET'])
def get_overall_progress():
    user_id = request.args.get('userId', 'default_user')
    if user_id not in users_data or not users_data[user_id]['progress']:
        return jsonify({'totalScore': 0, 'totalMaxScore': 0, 'percentage': 0})

    progress = users_data[user_id]['progress']
    total_score = sum(test['score'] for test in progress)
    total_max_score = sum(test['maxScore'] for test in progress)
    percentage = (total_score / total_max_score * 100) if total_max_score > 0 else 0
    return jsonify({
        'totalScore': total_score,
        'totalMaxScore': total_max_score,
        'percentage': round(percentage, 2)
    })

@app.route('/get-learning-history', methods=['GET'])
def get_learning_history():
    user_id = request.args.get('userId', 'default_user')
    if user_id not in users_data or not users_data[user_id]['progress']:
        return jsonify({'history': []})

    history = users_data[user_id]['progress']
    for entry in history:
        entry['date'] = time.strftime('%Y-%m-%d %H:%M:%S', time.localtime(entry['timestamp']))
    return jsonify({'history': history})

@app.route('/get-topic-wise-report', methods=['GET'])
def get_topic_wise_report():
    user_id = request.args.get('userId', 'default_user')
    if user_id not in users_data or not users_data[user_id]['progress']:
        return jsonify({'report': {}})

    progress = users_data[user_id]['progress']
    report = {}
    for test in progress:
        topic = test['topic']
        if topic not in report:
            report[topic] = {'totalScore': 0, 'totalMaxScore': 0, 'tests': 0}
        report[topic]['totalScore'] += test['score']
        report[topic]['totalMaxScore'] += test['maxScore']
        report[topic]['tests'] += 1

    for topic in report:
        report[topic]['percentage'] = round(
            (report[topic]['totalScore'] / report[topic]['totalMaxScore'] * 100)
            if report[topic]['totalMaxScore'] > 0 else 0, 2
        )
    return jsonify({'report': report})

# Fix: Remove duplicate route decorator
@app.route('/start-learning', methods=['POST'])
def start_learning():
    data = request.json
    chapter = data.get('chapter')
    class_standard = data.get('classStandard')
    user_id = data.get('userId', 'default_user')
    if not chapter or not class_standard:
        print("Validation Error: Chapter or classStandard missing")
        return jsonify({'error': 'Chapter and classStandard are required'}), 400

    if user_id not in users_data:
        users_data[user_id] = {'profile': {}, 'progress': [], 'learning_session': {}}

    # Your updated prompt
    prompt = (
        f"List 10 subtopics for the chapter '{chapter}' suitable for a {class_standard} student. "
        f"Start with an 'Introduction to {chapter}' as the first subtopic, followed by 9 key subtopics. "
        f"Format as:\n1. Introduction to {chapter}\n2. [subtopic]\n3. [subtopic]\n... up to 10."
    )
    subtopics_text, error = call_gemini(prompt, max_tokens=300)
    if error:
        return jsonify({'error': f'Failed to get subtopics: {error}'}), 500

    subtopics = []
    for line in subtopics_text.split('\n'):
        line = line.strip()
        if line and line[0].isdigit() and '.' in line:
            subtopics.append(line.split('.', 1)[1].strip())
    if len(subtopics) < 1:
        return jsonify({'error': 'Could not parse subtopics'}), 500

    if not subtopics[0].startswith(f"Introduction to {chapter}"):
        subtopics.insert(0, f"Introduction to {chapter}")

    users_data[user_id]['learning_session'] = {
        'chapter': chapter,
        'class_standard': class_standard,
        'subtopics': subtopics[:10],
        'current_subtopic_index': 0
    }

    return teach_subtopic(user_id)

def teach_subtopic(user_id):
    session = users_data[user_id].get('learning_session', {})
    if not session:
        return jsonify({'error': 'No active learning session'}), 400

    current_index = session['current_subtopic_index']
    subtopics = session['subtopics']
    chapter = session['chapter']
    class_standard = session['class_standard']

    if current_index >= len(subtopics):
        del users_data[user_id]['learning_session']
        return jsonify({'message': 'Chapter completed!', 'completed': True})

    subtopic = subtopics[current_index]

    # Enhanced prompt for teacher-like explanation
    if current_index == 0:
        prompt = (
            f"Act as an experienced teacher and provide a brief introduction to the chapter '{chapter}' "
            f"for a {class_standard} student. Include a simple overview, why it’s important, "
            f"and mention any key formulas or concepts they’ll learn."
        )
    else:
        prompt = (
            f"Act as an experienced teacher and explain '{subtopic}' from the chapter '{chapter}' "
            f"to a {class_standard} student. Use a clear, step-by-step approach. Include: "
            f"1. A definition or explanation of the concept. "
            f"2. Any relevant formulas (if applicable) with an explanation of each term. "
            f"3. A simple example to illustrate the concept. "
            f"Make it engaging and easy to understand."
        )
    explanation, error = call_gemini(prompt, max_tokens=300)  # Increased tokens for detailed response
    if error:
        return jsonify({'error': f'Failed to get explanation: {error}'}), 500
    explanation = clean_text(explanation)

    # Enhanced prompt for questions
    prompt = (
        f"Act as a teacher and generate 2 questions about '{subtopic}' for a {class_standard} student. "
        f"1. A basic question to check understanding of the concept or formula. "
        f"2. A practical question applying the concept or formula to a real-world scenario. "
        f"Format as: \n- Q: [question]\n  A: [answer with explanation]\n- Q: [question]\n  A: [answer with explanation]"
    )
    qa_text, error = call_gemini(prompt, max_tokens=400)  # Increased tokens for detailed answers
    if error:
        return jsonify({'error': f'Failed to get questions: {error}'}), 500
    qa_text = clean_text(qa_text)

    questions = []
    current_q = None
    for line in qa_text.split('\n'):
        line = line.strip()
        if line.startswith('- Q:'):
            current_q = line.replace('- Q:', '').strip()
        elif line.startswith('A:') and current_q:
            questions.append({'question': current_q, 'answer': line.replace('A:', '').strip()})
            current_q = None

    if len(questions) < 2:
        questions.append({'question': f"What is {subtopic}?", 'answer': 'Placeholder answer.'})

    return jsonify({
        'subtopic': subtopic,
        'explanation': explanation,
        'questions': questions,
        'current_index': current_index,
        'total_subtopics': len(subtopics)
    })

@app.route('/next-subtopic', methods=['POST'])
def next_subtopic():
    data = request.json
    user_id = data.get('userId', 'default_user')
    is_clear = data.get('isClear', True)

    if user_id not in users_data or 'learning_session' not in users_data[user_id]:
        return jsonify({'error': 'No active learning session'}), 400

    if not is_clear:
        return jsonify({'message': 'Please ask your doubts for clarification.'})

    users_data[user_id]['learning_session']['current_subtopic_index'] += 1
    return teach_subtopic(user_id)

@app.route('/resolve-doubt', methods=['POST'])
def resolve_doubt():
    data = request.json
    user_id = data.get('userId', 'default_user')
    doubt = data.get('doubt')

    if not doubt or user_id not in users_data or 'learning_session' not in users_data[user_id]:
        return jsonify({'error': 'Doubt or active session missing'}), 400

    session = users_data[user_id]['learning_session']
    subtopic = session['subtopics'][session['current_subtopic_index']]
    class_standard = session['class_standard']

    prompt = (
        f"Act as an experienced teacher and answer this doubt about '{subtopic}' "
        f"for a {class_standard} student: '{doubt}'. Provide a clear, concise explanation, "
        f"including any relevant formulas or examples if needed."
    )
    clarification, error = call_gemini(prompt, max_tokens=200)
    if error:
        return jsonify({'error': f'Failed to resolve doubt: {error}'}), 500

    clarification = clean_text(clarification)
    return jsonify({'clarification': clarification})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)