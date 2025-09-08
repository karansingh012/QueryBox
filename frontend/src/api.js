import axios from 'axios';

// API configuration
const API_BASE_URL = import.meta.env.PROD 
  ? 'https://queryboxai-backend-production.up.railway.app'  // Railway backend
  : 'http://127.0.0.1:5001';  // Local development

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.log('API Request:', config.method?.toUpperCase(), config.url, config.data);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('API Response Error:', error.response?.status, error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// API service class
class InterviewAPI {
  constructor() {
    this.currentSessionId = null;
    this.currentQuestionNumber = 1;
  }

  async startInterview(role, mode, numQuestions = 5) {
    try {
      const response = await apiClient.post('/start_interview', {
        role,
        mode,
        num_questions: numQuestions,
      });

      this.currentSessionId = response.data.sessionId;
      this.currentQuestionNumber = response.data.questionNumber;

      return {
        sessionId: response.data.sessionId,
        question: response.data.question,
        questionNumber: response.data.questionNumber,
        totalQuestions: response.data.totalQuestions,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Failed to start interview:', error);
      throw new Error(error.response?.data?.error || 'Failed to start interview');
    }
  }

  async submitAnswer(answer) {
    if (!this.currentSessionId) {
      throw new Error('No active interview session');
    }

    try {
      const response = await apiClient.post('/submit_answer', {
        sessionId: this.currentSessionId,
        answer: answer.trim(),
      });

      const result = {
        feedback: response.data.feedback,
        score: response.data.score,
        clarity: response.data.clarity,
        correctness: response.data.correctness,
        completeness: response.data.completeness,
        completed: response.data.completed || false,
      };

      if (!result.completed && response.data.nextQuestion) {
        result.nextQuestion = response.data.nextQuestion;
        result.questionNumber = response.data.questionNumber;
        result.totalQuestions = response.data.totalQuestions;
        this.currentQuestionNumber = response.data.questionNumber;
      }

      return result;
    } catch (error) {
      console.error('Failed to submit answer:', error);
      throw new Error(error.response?.data?.error || 'Failed to submit answer');
    }
  }

  async getSummary() {
    if (!this.currentSessionId) {
      throw new Error('No active interview session');
    }

    try {
      const response = await apiClient.get(`/get_summary/${this.currentSessionId}`);

      return {
        overallScore: parseFloat(response.data.final_score) || 0,
        totalQuestions: response.data.totalQuestions || 0,
        strengths: response.data.strengths || [],
        weaknesses: response.data.areas_for_improvement || [],
        resources: response.data.suggested_resources || [],
        sessionId: response.data.sessionId,
        role: response.data.role,
        completedAt: response.data.completedAt,
      };
    } catch (error) {
      console.error('Failed to get summary:', error);
      throw new Error(error.response?.data?.error || 'Failed to get interview summary');
    }
  }

  async checkHealth() {
    try {
      const response = await apiClient.get('/health');
      return response.data;
    } catch (error) {
      console.error('Health check failed:', error);
      throw new Error('Backend service is not available');
    }
  }

  // Reset session state
  resetSession() {
    this.currentSessionId = null;
    this.currentQuestionNumber = 1;
  }

  // Get current session info
  getSessionInfo() {
    return {
      sessionId: this.currentSessionId,
      questionNumber: this.currentQuestionNumber,
    };
  }
}

// Create and export singleton instance
const api = new InterviewAPI();

export default api;

// Legacy mock API for fallback (keeping the same interface as before)
export const mockApi = {
  generateQuestion: (role, mode, questionNumber) => {
    const questions = {
      technical: {
        'Software Engineer': [
          "Explain the difference between async/await and Promises in JavaScript. When would you use each?",
          "Design a system to handle 1 million concurrent users. What are your key considerations?",
          "Implement a function to find the longest palindromic substring in a given string.",
          "How would you optimize a slow database query? Walk me through your approach.",
          "Explain the concept of closures in JavaScript with a practical example."
        ],
        'Product Manager': [
          "How would you prioritize features for a new mobile app with limited engineering resources?",
          "A key metric has dropped 15% this week. How do you investigate and respond?",
          "Design a recommendation system for an e-commerce platform.",
          "How would you measure the success of a new feature launch?",
          "Walk me through how you would conduct user research for a new product."
        ],
        'Data Analyst': [
          "Explain the difference between correlation and causation with a practical example.",
          "How would you detect and handle outliers in a dataset?",
          "Design an A/B test to measure the impact of a new homepage design.",
          "What statistical methods would you use to forecast quarterly sales?",
          "How would you approach cleaning and preparing messy data for analysis?"
        ]
      },
      behavioral: [
        "Tell me about a time when you had to work with a difficult team member. How did you handle it?",
        "Describe a situation where you had to learn something completely new under a tight deadline.",
        "Give me an example of when you had to make a decision with incomplete information.",
        "Tell me about a time you failed at something important. What did you learn?",
        "Describe a situation where you had to influence someone without direct authority."
      ]
    };

    const roleQuestions = mode === 'behavioral' 
      ? questions.behavioral 
      : questions.technical[role] || questions.technical['Software Engineer'];
    
    return roleQuestions[questionNumber % roleQuestions.length];
  },

  evaluateAnswer: (answer, role, mode) => {
    const baseScore = Math.floor(Math.random() * 3) + 7; // 7-10 range
    
    return {
      overallScore: baseScore,
      clarity: baseScore + Math.floor(Math.random() * 2) - 1,
      correctness: baseScore + Math.floor(Math.random() * 2) - 1,
      completeness: baseScore - Math.floor(Math.random() * 2),
      feedback: "Your answer demonstrates good understanding of the concept. Consider providing more specific examples to strengthen your response.",
      strengths: ["Clear communication", "Good structure", "Relevant examples"],
      improvements: ["Add more detail", "Consider edge cases", "Include metrics"]
    };
  },

  generateSummary: (answers, role, mode) => {
    const avgScore = answers.length > 0 ? answers.reduce((sum, a) => sum + a.evaluation.overallScore, 0) / answers.length : 0;
    
    return {
      overallScore: Math.round(avgScore * 10) / 10,
      totalQuestions: answers.length,
      strengths: [
        "Strong communication skills",
        "Good problem-solving approach",
        "Relevant work experience mentioned"
      ],
      weaknesses: [
        "Could provide more specific examples",
        "Consider discussing trade-offs more",
        "Elaborate on implementation details"
      ],
      resources: [
        "Practice more coding problems on LeetCode",
        "Read 'System Design Interview' book",
        "Join mock interview platforms like Pramp",
        "Study behavioral interview frameworks"
      ]
    };
  }
};
