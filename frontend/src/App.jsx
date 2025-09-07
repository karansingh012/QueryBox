import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, 
  User, 
  Bot, 
  Code, 
  Users, 
  Play, 
  RotateCcw, 
  SkipForward, 
  Star, 
  CheckCircle, 
  AlertCircle, 
  BookOpen,
  TrendingUp,
  Target,
  Lightbulb,
  MessageSquare,
  Download,
  FileText
} from 'lucide-react';
import api from './api.js';
import brainLogo from './assets/brain.png';

// ============================================================================
// Home Component
// ============================================================================
const Home = ({ onStart, selectedRole, setSelectedRole, selectedMode, setSelectedMode, selectedDomain, setSelectedDomain }) => {
  const roles = ['Software Engineer', 'Product Manager', 'Data Analyst'];
  const domains = ['Frontend', 'Backend', 'ML', 'System Design'];

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Interview Preparation AI Bot
            </h1>
            <p className="text-xl text-gray-400">
              Your smart guide to crack interviews 🚀
            </p>
          </div>
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center mb-6">
                  <Target className="w-6 h-6 text-blue-400 mr-3" />
                  <h2 className="text-2xl font-semibold">Select Your Target Role</h2>
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-3">Job Role</label>
                  <select 
                    value={selectedRole}
                    onChange={(e) => setSelectedRole(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Choose a job role...</option>
                    {roles.map(role => (<option key={role} value={role}>{role}</option>))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-3">Domain (Optional)</label>
                  <div className="grid grid-cols-2 gap-3">
                    {domains.map(domain => (
                      <button
                        key={domain}
                        onClick={() => setSelectedDomain(selectedDomain === domain ? '' : domain)}
                        className={`p-3 rounded-lg border transition-all ${selectedDomain === domain ? 'bg-blue-500/20 border-blue-400 text-blue-300' : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'}`}
                      >{domain}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                <div className="flex items-center mb-6">
                  <MessageSquare className="w-6 h-6 text-purple-400 mr-3" />
                  <h2 className="text-2xl font-semibold">Interview Mode</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <button
                    onClick={() => setSelectedMode('technical')}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${selectedMode === 'technical' ? 'border-blue-400 bg-blue-500/10' : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'}`}
                  >
                    <div className="flex items-center mb-4"><Code className="w-8 h-8 text-blue-400 mr-3" /><h3 className="text-xl font-semibold">Technical</h3></div>
                    <p className="text-gray-400">Coding & system design</p>
                  </button>
                  <button
                    onClick={() => setSelectedMode('behavioral')}
                    className={`p-6 rounded-xl border-2 transition-all text-left ${selectedMode === 'behavioral' ? 'border-purple-400 bg-purple-500/10' : 'border-gray-600 bg-gray-700/30 hover:border-gray-500'}`}
                  >
                    <div className="flex items-center mb-4"><Users className="w-8 h-8 text-purple-400 mr-3" /><h3 className="text-xl font-semibold">Behavioral</h3></div>
                    <p className="text-gray-400">Soft skills & experiences</p>
                  </button>
                </div>
              </div>
              <button
                onClick={onStart}
                disabled={!selectedRole || !selectedMode}
                className={`w-full py-4 px-8 rounded-xl font-semibold text-lg transition-all flex items-center justify-center space-x-3 ${selectedRole && selectedMode ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}
              >
                <Play className="w-6 h-6" />
                <span>Start Interview Preparation</span>
              </button>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <div className="flex items-center mb-6">
                <Lightbulb className="w-6 h-6 text-yellow-400 mr-3" />
                <h3 className="text-xl font-semibold">Interview Tips</h3>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center mb-2"><BookOpen className="w-5 h-5 text-green-400 mr-2" /><h4 className="font-medium">Prepare Your Stories</h4></div>
                  <p className="text-sm text-gray-400">Use the STAR method (Situation, Task, Action, Result) for behavioral responses.</p>
                </div>
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center mb-2"><Code className="w-5 h-5 text-blue-400 mr-2" /><h4 className="font-medium">Practice Coding</h4></div>
                  <p className="text-sm text-gray-400">Review data structures, algorithms, and practice whiteboard coding for technical rounds.</p>
                </div>
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center mb-2"><MessageSquare className="w-5 h-5 text-purple-400 mr-2" /><h4 className="font-medium">Ask Questions</h4></div>
                  <p className="text-sm text-gray-400">Prepare thoughtful questions about the role, team, and company culture.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// ChatBox Component
// ============================================================================
const ChatBox = ({ messages, userInput, setUserInput, onSendMessage, isLoading }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`flex items-start max-w-3xl ${message.type === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${message.type === 'user' ? 'bg-blue-500 ml-3' : 'bg-purple-500 mr-3'}`}>
                {message.type === 'user' ? <User size={20} /> : <Bot size={20} />}
              </div>
              <div className={`rounded-2xl px-6 py-4 ${message.type === 'user' ? 'bg-blue-500 text-white' : message.isQuestion ? 'bg-purple-500/10 border border-purple-400/50 text-white' : 'bg-gray-700 text-gray-100'}`}>
                <div className="whitespace-pre-wrap">{message.content}</div>
                {message.timestamp && (<div className="text-xs mt-2 opacity-60">{message.timestamp}</div>)}
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start max-w-3xl">
              <div className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center bg-purple-500 mr-3"><Bot size={20} /></div>
              <div className="bg-gray-700 text-gray-100 rounded-2xl px-6 py-4">
                <div className="flex items-center space-x-2">
                  <div className="animate-bounce w-2 h-2 bg-purple-400 rounded-full"></div>
                  <div className="animate-bounce w-2 h-2 bg-purple-400 rounded-full" style={{animationDelay: '0.1s'}}></div>
                  <div className="animate-bounce w-2 h-2 bg-purple-400 rounded-full" style={{animationDelay: '0.2s'}}></div>
                  <span className="ml-2 text-gray-400">AI is thinking...</span>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="border-t border-gray-700 p-6">
        <div className="flex space-x-4">
          <textarea
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Type your answer here..."
            className="flex-1 bg-gray-700 border border-gray-600 rounded-xl px-4 py-3 text-white placeholder-gray-400 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
            onKeyDown={(e) => { if (e.key === 'Enter' && e.ctrlKey) { onSendMessage(); } }}
          />
          <button
            onClick={onSendMessage}
            disabled={!userInput.trim() || isLoading}
            className={`px-6 py-3 rounded-xl font-semibold transition-all flex items-center space-x-2 ${userInput.trim() && !isLoading ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-600 text-gray-400 cursor-not-allowed'}`}
          >
            <Send size={18} />
            <span>Send</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">Press Ctrl+Enter to send quickly</p>
      </div>
    </div>
  );
};

// ============================================================================
// Sidebar Component for Interview Page
// ============================================================================
const Sidebar = ({ selectedRole, selectedMode, selectedDomain, currentQuestion, totalQuestions, currentFeedback, onRetry, onSkip, onNext, onEndInterview }) => {
  return (
    <div className="w-80 bg-gray-800 border-r border-gray-700 p-6 pt-8 flex flex-col">
      <div className="mb-8">
        <h2 className="text-lg font-semibold text-white mb-4">Interview Details</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between"><span className="text-gray-400">Role:</span><span className="text-white font-medium">{selectedRole}</span></div>
          {selectedDomain && (<div className="flex justify-between"><span className="text-gray-400">Domain:</span><span className="text-white font-medium">{selectedDomain}</span></div>)}
          <div className="flex justify-between"><span className="text-gray-400">Mode:</span><span className="text-white font-medium capitalize">{selectedMode}</span></div>
          <div className="flex justify-between"><span className="text-gray-400">Progress:</span><span className="text-white font-medium">{currentQuestion + 1} of {totalQuestions}</span></div>
        </div>
      </div>
      <div className="mb-8">
        <div className="flex justify-between text-sm text-gray-400 mb-2"><span>Progress</span><span>{Math.round(((currentQuestion + 1) / totalQuestions) * 100)}%</span></div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full transition-all duration-300" style={{ width: `${((currentQuestion + 1) / totalQuestions) * 100}%` }}></div>
        </div>
      </div>
      {currentFeedback && (
        <div className="mb-8">
          <h3 className="text-md font-semibold text-white mb-4">Latest Feedback</h3>
          <div className="bg-gray-700/50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between"><span className="text-gray-300">Overall Score:</span><div className="flex items-center"><Star className="w-4 h-4 text-yellow-400 mr-1" /><span className="text-white font-semibold">{currentFeedback.overallScore}/10</span></div></div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-400">Clarity:</span><span className="text-green-400">{currentFeedback.clarity}/10</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Correctness:</span><span className="text-blue-400">{currentFeedback.correctness}/10</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-400">Completeness:</span><span className="text-purple-400">{currentFeedback.completeness}/10</span></div>
            </div>
            <div className="pt-3 border-t border-gray-600"><p className="text-xs text-gray-300 leading-relaxed">{currentFeedback.feedback}</p></div>
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <button onClick={onRetry} className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded-lg transition-all flex items-center justify-center"><RotateCcw size={12} className="mr-1" />Retry</button>
            <button onClick={onNext} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-xs rounded-lg transition-all flex items-center justify-center"><CheckCircle size={12} className="mr-1" />Next</button>
            <button onClick={onSkip} className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-xs rounded-lg transition-all flex items-center justify-center"><SkipForward size={12} className="mr-1" />Skip</button>
          </div>
        </div>
      )}
      <div className="mt-auto pt-6">
        <button onClick={onEndInterview} className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium">End Interview</button>
      </div>
    </div>
  );
};

// ============================================================================
// Interview Page Component
// ============================================================================
const Interview = ({ selectedRole, selectedMode, selectedDomain, onComplete, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState(null);
  const [interviewStarted, setInterviewStarted] = useState(false);
  const [interviewData, setInterviewData] = useState(null);
  const [error, setError] = useState(null);

  // Start interview when component mounts
  useEffect(() => {
    const startInterview = async () => {
      if (!interviewStarted) {
        setIsLoading(true);
        setError(null);
        
        try {
          const result = await api.startInterview(selectedRole, selectedMode, 5);
          
          setInterviewData(result);
          setTotalQuestions(result.totalQuestions);
          setCurrentQuestion(0);
          
          const welcomeMessage = { 
            type: 'bot', 
            content: `Welcome to your ${selectedMode} interview for the ${selectedRole} position! I'll ask you ${result.totalQuestions} questions. Let's begin!`, 
            timestamp: new Date().toLocaleTimeString() 
          };
          
          const questionMessage = { 
            type: 'bot', 
            content: result.question, 
            timestamp: new Date().toLocaleTimeString(), 
            isQuestion: true 
          };
          
          setMessages([welcomeMessage, questionMessage]);
          setInterviewStarted(true);
        } catch (err) {
          console.error('Failed to start interview:', err);
          setError(err.message || 'Failed to start interview');
          // Fallback to show error message
          const errorMessage = {
            type: 'bot',
            content: `Sorry, there was an error starting the interview: ${err.message}. Please check that the backend server is running.`,
            timestamp: new Date().toLocaleTimeString()
          };
          setMessages([errorMessage]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    startInterview();
  }, [selectedRole, selectedMode, interviewStarted]);

  const handleSendMessage = async () => {
    if (!userInput.trim() || isLoading || error) return;

    const userMessage = { 
      type: 'user', 
      content: userInput.trim(), 
      timestamp: new Date().toLocaleTimeString() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setCurrentFeedback(null);

    try {
      const result = await api.submitAnswer(userInput.trim());
      
      // Create evaluation feedback that matches the expected format
      const evaluation = {
        overallScore: result.score,
        clarity: result.clarity,
        correctness: result.correctness,
        completeness: result.completeness,
        feedback: result.feedback
      };
      
      setCurrentFeedback(evaluation);
      
      // Add feedback message to chat
      const feedbackMessage = {
        type: 'bot',
        content: result.feedback,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, feedbackMessage]);
      
      if (result.completed) {
        // Interview is complete, get summary
        setTimeout(async () => {
          try {
            const summaryData = await api.getSummary();
            onComplete(summaryData);
          } catch (summaryErr) {
            console.error('Failed to get summary:', summaryErr);
            // Fallback summary
            const fallbackSummary = {
              overallScore: result.score || 0,
              totalQuestions: totalQuestions,
              strengths: ['Completed the interview'],
              weaknesses: ['Summary generation failed'],
              resources: ['Please try again']
            };
            onComplete(fallbackSummary);
          }
        }, 2000);
      } else if (result.nextQuestion) {
        // Show next question
        setTimeout(() => {
          const nextQuestionMessage = {
            type: 'bot',
            content: result.nextQuestion,
            timestamp: new Date().toLocaleTimeString(),
            isQuestion: true
          };
          setMessages(prev => [...prev, nextQuestionMessage]);
          setCurrentQuestion(result.questionNumber - 1); // API returns 1-based, we use 0-based
          setCurrentFeedback(null);
        }, 1500);
      }
      
    } catch (err) {
      console.error('Failed to submit answer:', err);
      const errorMessage = {
        type: 'bot',
        content: `Sorry, there was an error processing your answer: ${err.message}`,
        timestamp: new Date().toLocaleTimeString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setUserInput('');
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    // This is handled automatically by the API response
    setCurrentFeedback(null);
  };

  const handleSkip = () => {
    // For skipping, we'll send a "skipped" answer
    setUserInput('I would like to skip this question.');
    setTimeout(() => {
      handleSendMessage();
    }, 100);
  };

  const handleRetry = () => {
    setCurrentFeedback(null);
    setUserInput('');
    const retryMessage = { 
      type: 'bot', 
      content: 'Feel free to try answering this question again.', 
      timestamp: new Date().toLocaleTimeString() 
    };
    setMessages(prev => [...prev, retryMessage]);
  };

  const handleEndInterview = () => {
    api.resetSession();
    onBack();
  };

  return (
    <div className="min-h-screen bg-gray-900 flex text-white pt-20">
      <Sidebar
        selectedRole={selectedRole}
        selectedMode={selectedMode}
        selectedDomain={selectedDomain}
        currentQuestion={currentQuestion}
        totalQuestions={totalQuestions}
        currentFeedback={currentFeedback}
        onRetry={handleRetry}
        onSkip={handleSkip}
        onNext={handleNextQuestion}
        onEndInterview={handleEndInterview}
      />
      <div className="flex-1 flex flex-col">
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 m-4 rounded-lg">
            <p><strong>Error:</strong> {error}</p>
            <p className="text-sm mt-2">Make sure the backend server is running on http://127.0.0.1:5000</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-3 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded transition-colors"
            >
              Retry
            </button>
          </div>
        )}
        <ChatBox
          messages={messages}
          userInput={userInput}
          setUserInput={setUserInput}
          onSendMessage={handleSendMessage}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

// ============================================================================
// Summary Component
// ============================================================================
const Summary = ({ summaryData, onRestart, onBack }) => {
  const handleExport = (format) => {
    if (format === 'JSON') {
      const dataStr = JSON.stringify(summaryData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `interview-summary-${Date.now()}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } else if (format === 'PDF') {
      alert('PDF export feature coming soon!');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white pt-24">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">Interview Complete! 🎉</h1>
          <p className="text-xl text-gray-400">Here's your detailed performance analysis</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50 text-center">
              <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full mb-6">
                <span className="text-4xl font-bold text-white">{summaryData.overallScore}/10</span>
              </div>
              <h2 className="text-2xl font-semibold mb-2">Overall Performance</h2>
              <p className="text-gray-400">You answered {summaryData.totalQuestions} questions with great effort!</p>
            </div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-green-400 mb-6 flex items-center"><CheckCircle className="w-6 h-6 mr-3" />Strengths</h3>
                <ul className="space-y-4">
                  {summaryData.strengths.map((strength, index) => (<li key={index} className="flex items-start"><span className="text-green-400 mr-3 mt-1">•</span><span className="text-gray-300">{strength}</span></li>))}
                </ul>
              </div>
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
                <h3 className="text-xl font-semibold text-orange-400 mb-6 flex items-center"><AlertCircle className="w-6 h-6 mr-3" />Areas for Improvement</h3>
                <ul className="space-y-4">
                  {summaryData.weaknesses.map((weakness, index) => (<li key={index} className="flex items-start"><span className="text-orange-400 mr-3 mt-1">•</span><span className="text-gray-300">{weakness}</span></li>))}
                </ul>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <h3 className="text-xl font-semibold text-blue-400 mb-6 flex items-center"><BookOpen className="w-6 h-6 mr-3" />Recommended Resources</h3>
              <div className="grid md:grid-cols-2 gap-4">
                {summaryData.resources.map((resource, index) => (<div key={index} className="p-4 bg-gray-700/30 rounded-lg border border-gray-600"><p className="text-gray-300">{resource}</p></div>))}
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4">Export Results</h3>
              <div className="space-y-3">
                <button onClick={() => handleExport('JSON')} className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all flex items-center justify-center space-x-2"><Download size={18} /><span>Export as JSON</span></button>
                <button onClick={() => handleExport('PDF')} className="w-full px-4 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all flex items-center justify-center space-x-2"><FileText size={18} /><span>Export as PDF</span></button>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4">What's Next?</h3>
              <div className="space-y-3">
                <button onClick={onRestart} className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center justify-center space-x-2"><RotateCcw size={18} /><span>New Interview</span></button>
                <button onClick={onBack} className="w-full px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all">Back to Home</button>
              </div>
            </div>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
              <h3 className="text-lg font-semibold mb-4">Session Stats</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-400">Questions:</span><span className="text-white">{summaryData.totalQuestions}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Avg Score:</span><span className="text-white">{summaryData.overallScore}/10</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Completion:</span><span className="text-green-400">100%</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// Main App Component
// ============================================================================
const App = () => {
  const [currentPage, setCurrentPage] = useState('home'); // 'home', 'interview', 'summary'
  const [selectedRole, setSelectedRole] = useState('');
  const [selectedMode, setSelectedMode] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('');
  const [summaryData, setSummaryData] = useState(null);

  const handleStartInterview = () => {
    if (!selectedRole || !selectedMode) {
      alert('Please select both role and interview mode');
      return;
    }
    setCurrentPage('interview');
  };

  const handleInterviewComplete = (summaryData) => {
    // summaryData is already formatted from the API
    setSummaryData(summaryData);
    setCurrentPage('summary');
  };

  const handleRestart = () => {
    api.resetSession(); // Reset the API session
    setSelectedRole('');
    setSelectedMode('');
    setSelectedDomain('');
    setSummaryData(null);
    setCurrentPage('home');
  };

  const handleBackToHome = () => {
    api.resetSession(); // Reset the API session
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-gray-900 relative">
      {/* Header with Logo and Name - Show on all pages */}
      <header className="absolute top-0 left-0 right-0 p-6 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-700/50">
        <div className="flex items-center space-x-3">
          <img 
            src={brainLogo} 
            alt="QueryBox Brain Logo" 
            className="w-8 h-8 filter invert brightness-0 contrast-100" 
          />
          <span className="text-xl font-bold text-white">QueryBox</span>
        </div>
      </header>
      
      {currentPage === 'home' && (
        <Home
          onStart={handleStartInterview}
          selectedRole={selectedRole}
          setSelectedRole={setSelectedRole}
          selectedMode={selectedMode}
          setSelectedMode={setSelectedMode}
          selectedDomain={selectedDomain}
          setSelectedDomain={setSelectedDomain}
        />
      )}

      {currentPage === 'interview' && (
        <Interview
          selectedRole={selectedRole}
          selectedMode={selectedMode}
          selectedDomain={selectedDomain}
          onComplete={handleInterviewComplete}
          onBack={handleBackToHome}
        />
      )}

      {currentPage === 'summary' && summaryData && (
        <Summary
          summaryData={summaryData}
          onRestart={handleRestart}
          onBack={handleBackToHome}
        />
      )}
    </div>
  );
};

export default App;