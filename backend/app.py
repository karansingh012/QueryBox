import os
import sys
import json
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()
import uuid
import time
from flask import Flask, request, jsonify
from flask_cors import CORS 
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, asdict
import traceback
import logging
import random

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    import google.generativeai as genai
    GOOGLE_AI_AVAILABLE = True
except ImportError:
    GOOGLE_AI_AVAILABLE = False
    logger.error("Google AI not available. Install: pip install google-generativeai")

try:
    from supabase import create_client, Client
    SUPABASE_AVAILABLE = True
except ImportError:
    SUPABASE_AVAILABLE = False
    logger.error("Supabase not available. Install: pip install supabase")

# --- Supabase Client Setup ---
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

supabase = None
if SUPABASE_AVAILABLE and SUPABASE_URL and SUPABASE_KEY:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        SUPABASE_AVAILABLE = True
        logger.info("✅ Supabase connected successfully")
    except Exception as e:
        logger.error(f"❌ Supabase connection failed: {e}")
        SUPABASE_AVAILABLE = False
else:
    logger.warning("⚠️ Supabase not configured. Using in-memory storage.")
    SUPABASE_AVAILABLE = False

# In-memory storage fallback
sessions_memory = {}

# Rate limiting and caching
api_call_count = 0
api_reset_time = datetime.now() + timedelta(days=1)
question_cache = {}
answer_cache = {}

# --- Core Data Models ---
@dataclass
class Question:
    id: str
    text: str
    role: str
    category: str = "technical"
    source: str = "generated"

@dataclass
class Evaluation:
    feedback: str
    score: int
    clarity: int
    correctness: int
    completeness: int

# --- Gemini LLM Integration ---
class GeminiInterviewBot:
    """Interacts with the Google Gemini API for interview logic."""
    
    def __init__(self, enable_caching=True, max_retries=3):
        self.enable_caching = enable_caching
        self.max_retries = max_retries
        self.development_mode = False
        
        if not GOOGLE_AI_AVAILABLE:
            logger.warning("Google AI library not available - using development mode")
            self.development_mode = True
            return
            
        api_key = os.getenv('GOOGLE_API_KEY')
        if not api_key or api_key == 'test_key_for_development':
            logger.warning("⚠️ No valid GOOGLE_API_KEY found - using development mode with fallback responses")
            self.development_mode = True
            return
        
        try:
            genai.configure(api_key=api_key)
            # Use gemini-2.0-flash for better performance and quota limits
            self.model = genai.GenerativeModel('gemini-2.0-flash')
            logger.info("✅ Gemini API connected successfully (using 2.0 Flash model)")
        except Exception as e:
            logger.error(f"❌ Failed to initialize Gemini API: {e} - falling back to development mode")
            self.development_mode = True

    def generate_question(self, role: str, mode: str, history: List[Dict]) -> Dict:
        """Generates a new interview question based on the role and mode."""
        global api_call_count, api_reset_time
        
        # Use fallback questions in development mode or if we've hit API limits
        if self.development_mode or self._check_api_limits():
            return self._get_fallback_question(role, mode, history)
        
        # Create cache key
        cache_key = f"question_{role}_{mode}_{len(history)}"
        if self.enable_caching and cache_key in question_cache:
            logger.info("Using cached question")
            return question_cache[cache_key]
        
        # Avoid repeating similar questions
        asked_questions = []
        if history:
            for item in history:
                if isinstance(item, dict) and 'question' in item:
                    q = item['question']
                    if isinstance(q, dict) and 'question' in q:
                        asked_questions.append(q['question'])
                    elif isinstance(q, str):
                        asked_questions.append(q)
        
        context = ""
        if asked_questions:
            context = f" Avoid similar to: {'; '.join(asked_questions[-1:])}"  # Reduced context to save tokens
        
        if mode == "technical":
            prompt_text = f"Technical interview question for {role}.{context} Just the question:"
        elif mode == "behavioral":
            prompt_text = f"STAR behavioral question for {role}.{context} Just the question:"
        else:
            prompt_text = f"Interview question for {role}.{context} Just the question:"
        
        # Try API call with retry logic
        for attempt in range(self.max_retries):
            try:
                response = self._make_api_call_with_retry(prompt_text, {
                    'temperature': 0.7,
                    'max_output_tokens': 150,  # Increased for better question quality
                    'top_p': 0.95,  # Optimized for 2.0 Flash
                    'top_k': 40
                })
                
                if not response or not response.text or not response.text.strip():
                    raise Exception("Empty response from Gemini")
                
                question_text = response.text.strip()
                
                # Remove quotes if present
                if question_text.startswith('"') and question_text.endswith('"'):
                    question_text = question_text[1:-1]
                
                result = {
                    "question": question_text,
                    "category": mode,
                    "id": str(uuid.uuid4())
                }
                
                # Cache the result
                if self.enable_caching:
                    question_cache[cache_key] = result
                
                api_call_count += 1
                return result
                
            except Exception as e:
                logger.warning(f"API attempt {attempt + 1} failed: {e}")
                if attempt == self.max_retries - 1:
                    logger.error(f"All API attempts failed for question generation")
                    break
                time.sleep(2 ** attempt + random.uniform(0, 1))  # Exponential backoff
        
        # Fallback to predefined questions
        return self._get_fallback_question(role, mode, history)

    def evaluate_answer(self, question_text: str, user_answer: str, role: str) -> Dict:
        """Evaluates a user's answer and provides detailed feedback and a score."""
        global api_call_count
        
        if not question_text or not user_answer:
            return self._get_fallback_evaluation("Invalid input")
        
        # Use smart fallback in development mode or if we've hit API limits
        if self.development_mode or self._check_api_limits():
            return self._get_smart_fallback_evaluation(user_answer)
        
        # Create cache key
        answer_hash = hash(f"{question_text[:100]}_{user_answer[:100]}")
        cache_key = f"eval_{answer_hash}"
        if self.enable_caching and cache_key in answer_cache:
            logger.info("Using cached evaluation")
            return answer_cache[cache_key]
        
        # Shortened prompt to save tokens
        prompt_text = f"""Evaluate this {role} interview answer:
Q: {question_text[:200]}...
A: {user_answer[:300]}...

JSON format only:
{{
    "feedback": "brief feedback (1-2 sentences)",
    "score": score_1_to_10,
    "clarity": clarity_1_to_10,
    "correctness": correctness_1_to_10,
    "completeness": completeness_1_to_10
}}"""
        
        # Try API call with retry logic
        for attempt in range(self.max_retries):
            try:
                response = self._make_api_call_with_retry(prompt_text, {
                    'temperature': 0.3,
                    'max_output_tokens': 250,  # Increased for better evaluation detail
                    'top_p': 0.9,  # More focused for evaluation
                    'top_k': 20
                })
                
                if not response or not response.text:
                    raise Exception("Empty API response")
                
                response_text = response.text.strip()
                
                # Try to parse JSON
                try:
                    eval_data = json.loads(response_text)
                except json.JSONDecodeError:
                    # Try to extract JSON from response
                    import re
                    json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_text, re.DOTALL)
                    if json_match:
                        eval_data = json.loads(json_match.group())
                    else:
                        logger.error(f"Failed to parse JSON from: {response_text}")
                        raise ValueError("JSON parsing failed")
                
                # Validate and sanitize data
                for key in ['score', 'clarity', 'correctness', 'completeness']:
                    if key in eval_data:
                        try:
                            eval_data[key] = max(1, min(10, int(float(eval_data[key]))))
                        except (ValueError, TypeError):
                            eval_data[key] = 5
                    else:
                        eval_data[key] = 5
                
                if 'feedback' not in eval_data or not isinstance(eval_data['feedback'], str):
                    eval_data['feedback'] = "Good effort on answering the question."
                
                # Cache the result
                if self.enable_caching:
                    answer_cache[cache_key] = eval_data
                
                api_call_count += 1
                return eval_data
                
            except Exception as e:
                logger.warning(f"API attempt {attempt + 1} failed: {e}")
                if attempt == self.max_retries - 1:
                    logger.error(f"All API attempts failed for answer evaluation")
                    break
                time.sleep(2 ** attempt + random.uniform(0, 1))  # Exponential backoff
        
        # Fallback evaluation
        return self._get_smart_fallback_evaluation(user_answer)
    
    def _get_fallback_evaluation(self, reason: str) -> Dict:
        """Return fallback evaluation"""
        return {
            "feedback": f"Thank you for your answer. {reason} occurred - your participation is valued.",
            "score": 6,
            "clarity": 6,
            "correctness": 6,
            "completeness": 6
        }
    
    def _get_smart_fallback_evaluation(self, user_answer: str) -> Dict:
        """Provide a more intelligent fallback evaluation based on answer length and content"""
        answer_length = len(user_answer.split())
        
        # Basic scoring based on answer characteristics
        if answer_length < 5:
            score = 3
            feedback = "Your answer is quite brief. Try to provide more detailed explanations in future responses."
        elif answer_length < 20:
            score = 5
            feedback = "Good start! Consider adding more details and examples to strengthen your answer."
        elif answer_length < 50:
            score = 7
            feedback = "Well-structured answer with good detail. Continue this approach for comprehensive responses."
        else:
            score = 8
            feedback = "Comprehensive and detailed response. Great job providing thorough explanations."
        
        # Check for technical keywords (basic heuristic)
        technical_keywords = ['algorithm', 'data', 'structure', 'function', 'class', 'method', 'variable', 'loop', 'condition']
        if any(keyword in user_answer.lower() for keyword in technical_keywords):
            score = min(10, score + 1)
        
        return {
            "feedback": feedback,
            "score": score,
            "clarity": score,
            "correctness": max(5, score - 1),
            "completeness": score
        }
    
    def _get_fallback_question(self, role: str, mode: str, history: List[Dict]) -> Dict:
        """Get fallback question when API is unavailable"""
        # Extensive fallback questions
        fallback_questions = {
            "technical": [
                "Explain the difference between a stack and a queue data structure.",
                "What is the time complexity of searching in a binary search tree?",
                "Describe how you would reverse a linked list.",
                "What are the principles of object-oriented programming?",
                "Explain the difference between synchronous and asynchronous programming.",
                "What is the difference between SQL and NoSQL databases?",
                "How would you optimize a slow database query?",
                "Explain the concept of REST APIs and their principles."
            ],
            "behavioral": [
                "Tell me about a time when you had to work under pressure to meet a deadline.",
                "Describe a situation where you had to learn a new technology quickly.",
                "Give me an example of when you had to resolve a conflict with a team member.",
                "Tell me about a project you're particularly proud of and why.",
                "Describe a time when you made a mistake and how you handled it.",
                "How do you handle competing priorities and tight deadlines?",
                "Tell me about a time when you had to give difficult feedback to someone.",
                "Describe your approach to learning new skills or technologies."
            ]
        }
        
        questions = fallback_questions.get(mode, fallback_questions["technical"])
        # Try to avoid repeating questions
        asked_count = len(history)
        question_index = asked_count % len(questions)
        
        return {
            "question": questions[question_index],
            "category": mode,
            "id": str(uuid.uuid4())
        }
    
    def _check_api_limits(self) -> bool:
        """Check if we've hit API limits"""
        global api_call_count, api_reset_time
        
        # Reset counter if a day has passed
        if datetime.now() >= api_reset_time:
            api_call_count = 0
            api_reset_time = datetime.now() + timedelta(days=1)
            logger.info("API limit counter reset")
        
        # Conservative limit for Gemini 2.0 Flash: stop at 180 to leave buffer (Free tier: 200 RPD)
        daily_limit = 200  # Gemini 2.0 Flash free tier limit
        conservative_limit = int(daily_limit * 0.9)  # Use 90% as buffer
        
        if api_call_count >= conservative_limit:
            logger.warning(f"Approaching API limit ({api_call_count}/{daily_limit}). Using fallbacks.")
            return True
        
        return False
    
    def _make_api_call_with_retry(self, prompt: str, config: Dict) -> Any:
        """Make API call with rate limit handling"""
        try:
            response = self.model.generate_content(prompt, generation_config=config)
            return response
        except Exception as e:
            error_str = str(e).lower()
            if '429' in error_str or 'quota' in error_str or 'rate' in error_str:
                logger.error(f"Rate limit exceeded: {e}")
                raise Exception("Rate limit exceeded")
            else:
                raise e

    def generate_summary(self, session_history: List[Dict]) -> Dict:
        """Generates a final summary report with strengths, improvements, and resources."""
        global api_call_count
        
        # Filter to answered questions only
        answered_questions = [h for h in session_history if h.get('answer') and h.get('evaluation')]
        
        if not answered_questions:
            return {
                "strengths": ["Participated in the interview"],
                "areas_for_improvement": ["Practice answering interview questions"],
                "suggested_resources": ["Technical interview preparation guides"],
                "final_score": "N/A"
            }
        
        # Calculate final score
        total_score = sum(h['evaluation']['score'] for h in answered_questions)
        final_score = f"{total_score / len(answered_questions):.1f}/10"
        
        # Use intelligent fallback in development mode or if we've hit API limits
        if self.development_mode or self._check_api_limits():
            return self._get_intelligent_summary_fallback(answered_questions, final_score)
        
        # Shortened history to save tokens
        history_text = "\n".join([
            f"Q: {self._extract_question_text(h['question'])[:100]}... Score: {h['evaluation']['score']}/10" 
            for h in answered_questions[:3]  # Only first 3 questions
        ])

        prompt_text = f"""Career coach summary for interview:
{history_text}

JSON only:
{{
    "strengths": ["strength1", "strength2"],
    "areas_for_improvement": ["area1", "area2"], 
    "suggested_resources": ["resource1", "resource2"]
}}"""

        # Try API call with retry logic
        for attempt in range(self.max_retries):
            try:
                response = self._make_api_call_with_retry(prompt_text, {
                    'temperature': 0.5,
                    'max_output_tokens': 300,  # Increased for comprehensive summaries
                    'top_p': 0.9,
                    'top_k': 30
                })
                
                if not response or not response.text:
                    raise Exception("Empty response")
                
                response_text = response.text.strip()
                
                try:
                    summary_data = json.loads(response_text)
                except json.JSONDecodeError:
                    import re
                    json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', response_text, re.DOTALL)
                    if json_match:
                        summary_data = json.loads(json_match.group())
                    else:
                        raise ValueError("No valid JSON found")

                summary_data['final_score'] = final_score
                
                # Ensure required fields
                for field in ['strengths', 'areas_for_improvement', 'suggested_resources']:
                    if field not in summary_data or not isinstance(summary_data[field], list):
                        summary_data[field] = ["Assessment not available"]

                api_call_count += 1
                return summary_data
                
            except Exception as e:
                logger.warning(f"Summary API attempt {attempt + 1} failed: {e}")
                if attempt == self.max_retries - 1:
                    logger.error(f"All API attempts failed for summary generation")
                    break
                time.sleep(2 ** attempt + random.uniform(0, 1))
        
        # Fallback summary
        return self._get_intelligent_summary_fallback(answered_questions, final_score)
    
    def _get_intelligent_summary_fallback(self, answered_questions: List[Dict], final_score: str) -> Dict:
        """Generate intelligent summary based on scores when API is unavailable"""
        avg_score = sum(h['evaluation']['score'] for h in answered_questions) / len(answered_questions)
        
        if avg_score >= 8:
            strengths = ["Excellent technical knowledge", "Clear and comprehensive answers", "Strong problem-solving approach"]
            improvements = ["Continue building on your strong foundation", "Consider leadership and mentoring opportunities"]
            resources = ["Advanced system design courses", "Technical leadership materials"]
        elif avg_score >= 6:
            strengths = ["Good understanding of fundamentals", "Solid communication skills", "Demonstrates learning ability"]
            improvements = ["Deepen technical knowledge in key areas", "Practice explaining complex concepts", "Work on more advanced projects"]
            resources = ["Advanced programming courses", "System design practice", "Technical interview guides"]
        else:
            strengths = ["Shows willingness to learn", "Participated actively in interview", "Demonstrates basic understanding"]
            improvements = ["Focus on fundamental concepts", "Practice coding problems regularly", "Build more hands-on experience"]
            resources = ["Basic programming tutorials", "Data structures and algorithms courses", "Coding practice platforms"]
        
        return {
            "strengths": strengths,
            "areas_for_improvement": improvements,
            "suggested_resources": resources,
            "final_score": final_score
        }
    
    def _extract_question_text(self, question_data) -> str:
        """Extract question text from various formats"""
        if isinstance(question_data, str):
            return question_data
        elif isinstance(question_data, dict):
            if 'question' in question_data:
                return question_data['question']
            elif 'text' in question_data:
                return question_data['text']
        return "Question text not available"

# --- Helper Functions ---
def get_session_data(session_id: str) -> Optional[Dict]:
    """Get session data from Supabase or memory"""
    if not session_id:
        return None
        
    if SUPABASE_AVAILABLE and supabase:
        try:
            response = supabase.table('sessions').select('*').eq('sessionId', session_id).execute()
            if response.data:
                session_data = response.data[0]
                try:
                    session_data['history'] = json.loads(session_data.get('history', '[]'))
                except (json.JSONDecodeError, TypeError):
                    session_data['history'] = []
                return session_data
        except Exception as e:
            logger.error(f"Supabase fetch error: {e}")
    
    return sessions_memory.get(session_id)

def save_session_data(session_id: str, session_data: Dict) -> bool:
    """Save session data to Supabase or memory"""
    if not session_id or not session_data:
        return False
        
    if SUPABASE_AVAILABLE and supabase:
        try:
            db_data = session_data.copy()
            db_data['history'] = json.dumps(session_data.get('history', []))
            
            # Check if session exists
            existing = supabase.table('sessions').select('sessionId').eq('sessionId', session_id).execute()
            
            if existing.data:
                supabase.table('sessions').update(db_data).eq('sessionId', session_id).execute()
            else:
                supabase.table('sessions').insert(db_data).execute()
            return True
        except Exception as e:
            logger.error(f"Supabase save error: {e}")
    
    # Fallback to memory
    sessions_memory[session_id] = session_data
    return True

# --- Flask App Setup ---
app = Flask(__name__)
CORS(app)

# Initialize Gemini bot
try:
    llm = GeminiInterviewBot()
    if llm.development_mode:
        print(f"⚠️ Running in DEVELOPMENT MODE - using fallback responses")
        print(f"🔑 To use real AI responses, set a valid GOOGLE_API_KEY in .env file")
except Exception as e:
    logger.error(f"Failed to initialize Gemini bot: {e}")
    print(f"❌ Critical Error: {e}")
    print("Please ensure you have set the GOOGLE_API_KEY environment variable")
    sys.exit(1)

def get_user_id():
    return str(uuid.uuid4())

@app.route('/health')
def health_check():
    """Endpoint for health check."""
    global api_call_count, api_reset_time
    
    return jsonify({
        "status": "healthy",
        "ai_provider": "Google Gemini 2.0 Flash",
        "supabase_connected": SUPABASE_AVAILABLE and supabase is not None,
        "api_usage": {
            "calls_today": api_call_count,
            "limit": 200,  # Gemini 2.0 Flash free tier
            "remaining": max(0, 200 - api_call_count),
            "reset_time": api_reset_time.isoformat(),
            "cache_sizes": {
                "questions": len(question_cache),
                "evaluations": len(answer_cache)
            }
        },
        "timestamp": datetime.now().isoformat()
    })

@app.route('/admin/api-status')
def api_status():
    """Detailed API usage status for monitoring."""
    global api_call_count, api_reset_time
    
    hours_until_reset = (api_reset_time - datetime.now()).total_seconds() / 3600
    
    return jsonify({
        "api_usage": {
            "calls_today": api_call_count,
            "daily_limit": 200,  # Gemini 2.0 Flash free tier
            "remaining_calls": max(0, 200 - api_call_count),
            "usage_percentage": min(100, (api_call_count / 200) * 100),
            "reset_time": api_reset_time.isoformat(),
            "hours_until_reset": max(0, hours_until_reset)
        },
        "cache_status": {
            "question_cache_size": len(question_cache),
            "answer_cache_size": len(answer_cache),
            "cache_hit_potential": "High" if len(question_cache) > 10 else "Medium" if len(question_cache) > 5 else "Low"
        },
        "fallback_status": {
            "using_fallbacks": api_call_count >= 180,  # 90% of 200
            "fallback_reason": "Approaching API limit" if api_call_count >= 180 else "Normal operation"
        },
        "recommendations": [
            "Consider upgrading to paid tier" if api_call_count >= 180 else "API usage within normal range",
            "Cache is helping reduce API calls" if len(question_cache) > 5 else "Consider enabling caching",
            f"Reset in {hours_until_reset:.1f} hours" if hours_until_reset > 0 else "Reset time passed"
        ]
    })

@app.route('/admin/clear-cache', methods=['POST'])
def clear_cache():
    """Clear API response caches."""
    global question_cache, answer_cache
    
    old_q_size = len(question_cache)
    old_a_size = len(answer_cache)
    
    question_cache.clear()
    answer_cache.clear()
    
    return jsonify({
        "message": "Cache cleared successfully",
        "cleared": {
            "questions": old_q_size,
            "evaluations": old_a_size
        }
    })

@app.route('/start_interview', methods=['POST'])
def start_interview():
    """API endpoint to start a new interview session."""
    try:
        data = request.get_json() or {}
        role = data.get('role', 'Software Engineer')
        mode = data.get('mode', 'technical')
        num_questions = int(data.get('num_questions', 3))
        
        # Validate inputs
        if mode not in ['technical', 'behavioral']:
            mode = 'technical'
        num_questions = min(max(num_questions, 1), 10)  # Limit 1-10
        
        user_id = get_user_id()
        session_id = str(uuid.uuid4())
        
        # Generate first question
        try:
            first_q = llm.generate_question(role=role, mode=mode, history=[])
        except Exception as e:
            logger.error(f"Failed to generate first question: {e}")
            return jsonify({"error": "Failed to generate interview question. Please try again."}), 500
        
        # Create session data
        session_data = {
            "sessionId": session_id,
            "userId": user_id,
            "role": role,
            "mode": mode,
            "numQuestions": num_questions,
            "history": [{
                "question": first_q,
                "answer": None,
                "evaluation": None
            }],
            "currentQuestionIndex": 0,
            "startTime": datetime.now().isoformat(),
            "endTime": None
        }
        
        # Save session
        if not save_session_data(session_id, session_data):
            return jsonify({"error": "Failed to create session"}), 500
        
        return jsonify({
            "sessionId": session_id,
            "question": first_q['question'],
            "numQuestions": num_questions,
            "questionNumber": 1,
            "totalQuestions": num_questions,
            "message": "Interview started successfully"
        })
        
    except Exception as e:
        logger.error(f"Start interview error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to start interview. Please try again."}), 500

@app.route('/submit_answer', methods=['POST'])
def submit_answer():
    """API endpoint to submit an answer and get the next question."""
    try:
        data = request.get_json() or {}
        session_id = data.get('sessionId', '').strip()
        user_answer = data.get('answer', '').strip()
        
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400
        
        if not user_answer:
            return jsonify({"error": "Answer cannot be empty"}), 400

        # Get session data
        session_data = get_session_data(session_id)
        if not session_data:
            return jsonify({"error": "Session not found"}), 404
            
        history = session_data.get('history', [])
        current_index = session_data.get('currentQuestionIndex', 0)
        num_questions = session_data.get('numQuestions', 3)
        role = session_data.get('role', 'Software Engineer')
        mode = session_data.get('mode', 'technical')

        if current_index >= len(history):
            return jsonify({"error": "No current question to answer"}), 400
            
        # Get current question
        current_question_data = history[current_index]['question']
        question_text = current_question_data.get('question', '') if isinstance(current_question_data, dict) else str(current_question_data)
        
        # Evaluate answer
        try:
            evaluation = llm.evaluate_answer(question_text, user_answer, role)
        except Exception as e:
            logger.error(f"Failed to evaluate answer: {e}")
            evaluation = {
                "feedback": "Thank you for your answer. Due to a technical issue, detailed feedback is not available.",
                "score": 6,
                "clarity": 6,
                "correctness": 6,
                "completeness": 6
            }

        # Update history
        history[current_index]['answer'] = user_answer
        history[current_index]['evaluation'] = evaluation

        next_index = current_index + 1
        response_data = {
            "message": "Answer submitted successfully",
            "feedback": evaluation.get('feedback', 'No feedback available'),
            "score": evaluation.get('score', 6),
            "clarity": evaluation.get('clarity', 6),
            "correctness": evaluation.get('correctness', 6),
            "completeness": evaluation.get('completeness', 6)
        }
        
        # Check if interview is complete
        if next_index >= num_questions:
            session_data['currentQuestionIndex'] = next_index
            session_data['endTime'] = datetime.now().isoformat()
            response_data['message'] = "Interview completed! Get your summary."
            response_data['completed'] = True
        else:
            # Generate next question
            try:
                next_q = llm.generate_question(role=role, mode=mode, history=history)
                history.append({
                    "question": next_q,
                    "answer": None,
                    "evaluation": None
                })
                session_data['currentQuestionIndex'] = next_index
                
                response_data['nextQuestion'] = next_q.get('question', 'Question not available')
                response_data['questionNumber'] = next_index + 1
                response_data['totalQuestions'] = num_questions
                response_data['completed'] = False
                
            except Exception as e:
                logger.error(f"Error generating next question: {e}")
                session_data['currentQuestionIndex'] = num_questions
                session_data['endTime'] = datetime.now().isoformat()
                response_data['message'] = "Interview completed due to technical issue."
                response_data['completed'] = True
        
        # Save updated session
        save_session_data(session_id, session_data)
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"Submit answer error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to process answer"}), 500

@app.route('/get_summary/<session_id>', methods=['GET'])
def get_summary(session_id):
    """API endpoint to get the final summary report."""
    try:
        if not session_id:
            return jsonify({"error": "Session ID is required"}), 400
            
        session_data = get_session_data(session_id)
        if not session_data:
            return jsonify({"error": "Session not found"}), 404
        
        history = session_data.get('history', [])
        
        try:
            summary = llm.generate_summary(history)
        except Exception as e:
            logger.error(f"Failed to generate summary: {e}")
            # Fallback summary
            answered_questions = [h for h in history if h.get('answer')]
            if answered_questions:
                scores = [h['evaluation']['score'] for h in answered_questions if h.get('evaluation', {}).get('score')]
                avg_score = f"{sum(scores)/len(scores):.1f}/10" if scores else "N/A"
            else:
                avg_score = "N/A"
            
            summary = {
                "strengths": ["Completed interview session"],
                "areas_for_improvement": ["Continue practicing"],
                "suggested_resources": ["Technical interview guides"],
                "final_score": avg_score
            }

        # Add metadata
        summary['sessionId'] = session_id
        summary['role'] = session_data.get('role')
        summary['totalQuestions'] = len([h for h in history if h.get('answer')])
        summary['completedAt'] = session_data.get('endTime')

        return jsonify(summary)
        
    except Exception as e:
        logger.error(f"Get summary error: {e}")
        logger.error(traceback.format_exc())
        return jsonify({"error": "Failed to generate summary"}), 500

if __name__ == '__main__':
    print("\n" + "="*50)
    print("🚀 Interview Bot Backend API Starting...")
    print("="*50)
    
    # Environment checks
    env_status = {
        'GOOGLE_API_KEY': bool(os.getenv('GOOGLE_API_KEY')),
        'SUPABASE_URL': bool(os.getenv('SUPABASE_URL')),
        'SUPABASE_KEY': bool(os.getenv('SUPABASE_KEY'))
    }
    
    print("📋 Environment Status:")
    for var, status in env_status.items():
        icon = "✅" if status else "❌"
        print(f"   {icon} {var}: {'Set' if status else 'Not Set'}")
    
    print(f"\n🧠 AI Provider: Google Gemini 2.0 Flash")
    print(f"💾 Database: {'Supabase' if SUPABASE_AVAILABLE else 'In-Memory Storage'}")
    print(f"🌐 Server: http://127.0.0.1:5001")
    print(f"🏥 Health: http://127.0.0.1:5001/health")
    print("="*50 + "\n")
    
    app.run(debug=True, port=5001, host='127.0.0.1')
