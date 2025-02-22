import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { saveAttempt } from "../utils/indexedDB";
import { Sparkles, Trophy, Zap, Lightbulb, AlertCircle, Shield } from "lucide-react";

const originalQuestions = [
    { 
      id: 1, 
      type: "mc", 
      question: "Which planet is closest to the Sun?", 
      options: ["Venus", "Mercury", "Earth", "Mars"], 
      answer: "Mercury" 
    },
    { 
      id: 2, 
      type: "mc", 
      question: "Which data structure organizes items in a First-In, First-Out (FIFO) manner?", 
      options: ["Stack", "Queue", "Tree", "Graph"], 
      answer: "Queue" 
    },
    { 
      id: 3, 
      type: "mc", 
      question: "Which of the following is primarily used for structuring web pages?", 
      options: ["Python", "Java", "HTML", "C++"], 
      answer: "HTML" 
    },
    { 
      id: 4, 
      type: "mc", 
      question: "Which chemical symbol stands for Gold?", 
      options: ["Au", "Gd", "Ag", "Pt"], 
      answer: "Au" 
    },
    { 
      id: 5, 
      type: "mc", 
      question: "Which of these processes is not typically involved in refining petroleum?", 
      options: ["Fractional distillation", "Cracking", "Polymerization", "Filtration"], 
      answer: "Filtration" 
    },
    { 
      id: 6, 
      type: "integer", 
      question: "What is the value of 12 + 28?", 
      answer: 40 
    },
    { 
      id: 7, 
      type: "integer", 
      question: "How many states are there in the United States?", 
      answer: 50 
    },
    { 
      id: 8, 
      type: "integer", 
      question: "In which year was the Declaration of Independence signed?", 
      answer: 1776 
    },
    { 
      id: 9, 
      type: "integer", 
      question: "What is the value of pi rounded to the nearest integer?", 
      answer: 3 
    },
    { 
      id: 10, 
      type: "integer", 
      question: "If a car travels at 60 mph for 2 hours, how many miles does it travel?", 
      answer: 120,
    },
];

// Fisher-Yates shuffle algorithm
const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Character power definitions
const characterPowers = {
  "🚀 Astronaut": { 
    name: "Time Boost", 
    description: "Add 15 seconds to the timer",
    icon: <Zap className="w-5 h-5" />,
    action: (state, setState) => {
      setState({ ...state, timeLeft: state.timeLeft + 15 });
      return "Added 15 seconds to the timer!";
    }
  },
  "🧙 Wizard": { 
    name: "Reveal Answer", 
    description: "Reveals the correct answer",
    icon: <Sparkles className="w-5 h-5" />,
    action: (state, setState) => {
      setState({ ...state, hintShown: true });
      return "The correct answer has been revealed!";
    }
  },
  "⚔️ Knight": { 
    name: "Second Chance", 
    description: "Lets you retry the current question",
    icon: <Trophy className="w-5 h-5" />,
    action: (state, setState) => {
      setState({ ...state, selectedAnswer: "", wrongAnswerSelected: null });
      return "You can try this question again!";
    }
  },
  "🐉 Dragon Tamer": { 
    name: "Dragon Shield", 
    description: "Freeze the timer for this question",
    icon: <Shield className="w-5 h-5" />,
    action: (state, setState) => {
      setState({ ...state, timerFrozen: true });
      return "Dragon Shield activated! Timer frozen for this question.";
    }
  },
  "🕵️ Detective": { 
    name: "50/50", 
    description: "Eliminates two wrong answers (MC only)",
    icon: <Lightbulb className="w-5 h-5" />,
    action: (state, setState) => {
      if (state.currentQuestion.type !== "mc") {
        return "This power only works on multiple choice questions!";
      }
      
      const correctAnswer = state.currentQuestion.answer;
      const wrongOptions = state.currentQuestion.options.filter(opt => opt !== correctAnswer);
      const eliminatedOptions = wrongOptions.slice(0, 2);
      
      setState({ ...state, eliminatedOptions });
      return "Two wrong answers have been eliminated!";
    }
  }
};

function Quiz({ user }) {
  // Initialize with shuffled questions
  const [questions] = useState(() => shuffleArray(originalQuestions));
  
  const [quizState, setQuizState] = useState({
    currentQuestionIndex: 0, selectedAnswer: "", score: 0, quizCompleted: false, timeLeft: 30, isTimedOut: false,
    correctAnswerRevealed: false, wrongAnswerSelected: null, powerUsed: false, hintShown: false, eliminatedOptions: [],
    feedbackMessage: "", currentQuestion: questions[0], showAlert: false, alertMessage: "", timerFrozen: false,
  });

  const { width, height } = useWindowSize();

  // Reset some state when changing questions
  useEffect(() => {
    setQuizState(prev => ({
      ...prev, currentQuestion: questions[prev.currentQuestionIndex], correctAnswerRevealed: false, wrongAnswerSelected: null,
      hintShown: false, eliminatedOptions: [], feedbackMessage: "", timerFrozen: false,
    }));
  }, [quizState.currentQuestionIndex]);

  // Timer logic
  useEffect(() => {
    if (quizState.timeLeft === 0) {
      setQuizState(prev => ({ ...prev, isTimedOut: true }));
      setTimeout(() => {
        handleNext(true);
      }, 1000);
      return;
    }
    
    if (quizState.timerFrozen) {
      return;
    }
    
    const timer = setInterval(() => {
      setQuizState(prev => ({ ...prev, timeLeft: prev.timeLeft > 0 ? prev.timeLeft - 1 : 0 }));
    }, 1000);
    
    return () => clearInterval(timer);
  }, [quizState.timeLeft, quizState.timerFrozen]);

  // Custom alert function
  const showCustomAlert = (message) => {
    setQuizState(prev => ({ 
      ...prev, showAlert: true, alertMessage: message
    }));
    
    setTimeout(() => {
      setQuizState(prev => ({ ...prev, showAlert: false }));
    }, 3000);
  };

  // Close alert manually
  const closeAlert = () => {
    setQuizState(prev => ({ ...prev, showAlert: false }));
  };

  // Get Progress Bar Color
  const getProgressColor = () => {
    if (quizState.timerFrozen) return "bg-indigo-500";
    if (quizState.timeLeft > 20) return "bg-emerald-500";
    if (quizState.timeLeft > 10) return "bg-yellow-500";
    return "bg-red-500";
  };

  // Handle Multiple-Choice Answer Selection
  const handleAnswerSelection = (answer) => {
    if (quizState.isTimedOut) return;
    setQuizState(prev => ({ ...prev, selectedAnswer: answer }));
  };

  // Handle Integer-Type Answer Input
  const handleInputChange = (e) => {
    if (quizState.isTimedOut) return;
    setQuizState(prev => ({ ...prev, selectedAnswer: e.target.value }));
  };

  // Check if answer is correct
  const isCorrectAnswer = () => {
    const { currentQuestion, selectedAnswer } = quizState;
    
    if (currentQuestion.type === "mc") {
      return selectedAnswer === currentQuestion.answer;
    } else if (currentQuestion.type === "integer") {
      return Number(selectedAnswer) === currentQuestion.answer;
    }
    return false;
  };

  // Use character power
  const usePower = () => {
    const characterPower = characterPowers[user?.character];
    
    if (!characterPower || quizState.powerUsed) {
      showCustomAlert("Power has already been used in this quiz!");
      return;
    }
    
    const message = characterPower.action(quizState, setQuizState);
    
    setQuizState(prev => ({ 
      ...prev, 
      powerUsed: true, // This will now persist throughout the quiz
      feedbackMessage: message
    }));
    
    setTimeout(() => {
      setQuizState(prev => ({ ...prev, feedbackMessage: "" }));
    }, 2000);
  };

  // Handle Next button click
  const handleNext = (timeout = false, skip = false) => {
    if (!timeout && !skip && quizState.selectedAnswer === "") {
      showCustomAlert("Please select or enter an answer");
      return;
    }

    if (!quizState.correctAnswerRevealed && !timeout && !skip) {
      const correct = isCorrectAnswer();
      
      if (correct) {
        setQuizState(prev => ({ 
          ...prev, correctAnswerRevealed: true, score: prev.score + 1
        }));
      } else {
        setQuizState(prev => ({ 
          ...prev, correctAnswerRevealed: true, wrongAnswerSelected: prev.selectedAnswer
        }));
      }
      
      setTimeout(() => {
        proceedToNextQuestion();
      }, 1500);
      
      return;
    }

    proceedToNextQuestion();
  };

  // Move to next question or finish quiz
  const proceedToNextQuestion = () => {
    if (quizState.currentQuestionIndex < questions.length - 1) {
      setQuizState(prev => ({ 
        ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1, selectedAnswer: "", timeLeft: 30, isTimedOut: false,
        correctAnswerRevealed: false, wrongAnswerSelected: null, hintShown: false, eliminatedOptions: [], timerFrozen: false
      }));
    } else {
      finishQuiz();
    }
  };

  // Finish Quiz & Save to IndexedDB
  const finishQuiz = () => {
    setQuizState(prev => ({ ...prev, quizCompleted: true }));
    
    const attempt = {
      name: user?.name || "Anonymous", character: user?.character || "None", total: questions.length, date: new Date().toISOString(),
    };
    
    saveAttempt(attempt);
  };

  return (
    <motion.div 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}
    >
      {quizState.quizCompleted && quizState.score >= 1 && <Confetti width={width} height={height} />}

      {/* Custom Alert Popup */}
      <AnimatePresence>
        {quizState.showAlert && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          >
            <div className="fixed inset-0 bg-black/30" onClick={closeAlert}></div>
            <motion.div 
              className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 overflow-hidden"
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 py-2">
                <div className="flex justify-center pt-1">
                  <AlertCircle className="w-8 h-8 text-white" />
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-lg font-medium text-center mb-2">Attention Needed</h3>
                <p className="text-center text-gray-600">{quizState.alertMessage}</p>
                <div className="mt-6 text-center">
                  <button 
                    onClick={closeAlert}
                    className="px-4 py-2 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-lg"
                  >
                    Got it
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback message (for powers) */}
      <AnimatePresence>
        {quizState.feedbackMessage && (
          <motion.div
            className="fixed top-20 inset-x-0 flex justify-center"
            initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -50, opacity: 0 }}
          >
            <div className="bg-indigo-600 text-white px-6 py-3 rounded-full shadow-lg">
              {quizState.feedbackMessage}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.h2 
        className="text-3xl md:text-4xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600"
        initial={{ y: -20 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
      >
        {user?.name} ({user?.character})
      </motion.h2>

      <AnimatePresence mode="wait">
        {!quizState.quizCompleted ? (
          <motion.div 
            key="quiz"
            className="w-full max-w-xl p-6 bg-white rounded-2xl shadow-lg border border-gray-100"
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Progress Bar - Fixed to stay within bounds by using min-w-0 and overflow-hidden */}
            <div className="w-full h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${getProgressColor()}`}
                initial={{ width: "100%" }} animate={{ width: `${Math.min((quizState.timeLeft / 30) * 100, 100)}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>

            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold">Question {quizState.currentQuestionIndex + 1} / {questions.length}</h3>
              <span className={`font-mono ${
                quizState.timerFrozen ? 'text-indigo-500' : 
                quizState.timeLeft <= 10 ? 'text-red-500 animate-pulse' : 
                'text-gray-600'
              }`}>
                {quizState.timerFrozen ? "⏱️ FROZEN" : `⏳ ${quizState.timeLeft}s`}
              </span>
            </div>

            <motion.p 
              className="text-lg font-medium mb-6"
              initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
            >
              {quizState.currentQuestion.question}
            </motion.p>

            {/* Character Power Button */}
            {user?.character && characterPowers[user?.character] && (
              <div className="mb-6">
                <button
                  onClick={usePower}
                  disabled={quizState.powerUsed || quizState.isTimedOut}
                  className={`
                    flex items-center justify-center space-x-2
                    py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200
                    ${quizState.powerUsed ? 
                      'bg-gray-200 text-gray-500 cursor-not-allowed' : 
                      'bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-md'}
                  `}
                >
                  {characterPowers[user?.character].icon}
                  <span>{characterPowers[user?.character].name}</span>
                  {!quizState.powerUsed && <span className="ml-1 text-yellow-300">✨</span>}
                </button>
                <p className="text-xs text-gray-500 mt-1">
                  {characterPowers[user?.character].description}
                  {quizState.powerUsed && " (Already used)"}
                </p>
              </div>
            )}

            {/* Hint shown when Wizard power is used */}
            {quizState.hintShown && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <span className="font-semibold">Hint:</span> The correct answer is{" "}
                  {quizState.currentQuestion.type === "mc" 
                    ? quizState.currentQuestion.answer 
                    : quizState.currentQuestion.answer.toString()}
                </p>
              </div>
            )}

            {/* Multiple-Choice Question UI */}
            {quizState.currentQuestion.type === "mc" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {quizState.currentQuestion.options.map((option, index) => {
                  const isEliminated = quizState.eliminatedOptions.includes(option);
                  const isCorrect = option === quizState.currentQuestion.answer;
                  const isSelected = quizState.selectedAnswer === option;
                  const isWrongSelected = quizState.wrongAnswerSelected === option;
                  
                  let buttonStyle = "bg-gray-50 border-2 border-gray-200 text-gray-700 hover:border-blue-300";
                  
                  if (isEliminated) {
                    buttonStyle = "bg-gray-100 border-2 border-gray-200 text-gray-400 opacity-50";
                  } else if (quizState.correctAnswerRevealed) {
                    if (isCorrect) {
                      buttonStyle = "bg-green-100 border-2 border-green-500 text-green-700";
                    } else if (isWrongSelected) {
                      buttonStyle = "bg-red-100 border-2 border-red-500 text-red-700";
                    }
                  } else if (isSelected) {
                    buttonStyle = "bg-blue-100 border-2 border-blue-500 text-blue-700";
                  }
                  
                  return (
                    <motion.button
                      key={index}
                      whileHover={!isEliminated && !quizState.correctAnswerRevealed ? { scale: 1.02 } : {}}
                      whileTap={!isEliminated && !quizState.correctAnswerRevealed ? { scale: 0.98 } : {}}
                      className={`
                        py-4 px-6 rounded-xl text-lg font-medium transition-all duration-200
                        ${quizState.isTimedOut || isEliminated || quizState.correctAnswerRevealed ? 
                          'cursor-not-allowed' : 'hover:shadow-md'}
                        ${buttonStyle}
                      `}
                      onClick={() => !isEliminated && handleAnswerSelection(option)}
                      disabled={quizState.isTimedOut || isEliminated || quizState.correctAnswerRevealed}
                    >
                      {option}
                    </motion.button>
                  );
                })}
              </div>
            ) : (
              // Integer-Type Input UI
              <div>
                <motion.input
                  type="number"
                  value={quizState.selectedAnswer}
                  onChange={handleInputChange}
                  className={`
                    mt-4 w-full p-4 text-lg border-2 rounded-xl transition-all duration-200
                    ${quizState.isTimedOut || quizState.correctAnswerRevealed ? 
                      'opacity-50 cursor-not-allowed' : 
                      'focus:border-blue-500 focus:ring-2 focus:ring-blue-200'}
                    ${quizState.correctAnswerRevealed ? 
                      (isCorrectAnswer() ? 
                        'border-green-500 bg-green-50' : 
                        'border-red-500 bg-red-50') : 
                      'border-gray-200'}
                  `}
                  placeholder="Enter your answer"
                  disabled={quizState.isTimedOut || quizState.correctAnswerRevealed}
                  initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
                />
                
                {quizState.correctAnswerRevealed && !isCorrectAnswer() && (
                  <p className="mt-2 text-green-600 font-medium">
                    Correct answer: {quizState.currentQuestion.answer}
                  </p>
                )}
              </div>
            )}

            <motion.button
              onClick={() => handleNext(false)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className={`
                w-full mt-6 py-4 px-6 rounded-xl text-lg font-semibold text-white
                ${quizState.isTimedOut 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:shadow-lg'
                }
              `}
              disabled={quizState.isTimedOut}
            >
              {quizState.correctAnswerRevealed ? "Next Question" : "Submit Answer"}
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            key="results"
            className="text-center bg-white p-8 rounded-2xl shadow-lg border border-gray-100"
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3 }}
          >
            <motion.h3 
              className="text-2xl md:text-3xl font-bold mb-4"
              initial={{ y: -20 }} animate={{ y: 0 }}
            >
              {quizState.score >= questions.length / 2 ? "🎉 Fantastic Job!" : "Keep Learning! 📚"}
            </motion.h3>
            <motion.div
              initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <p className="text-xl mb-4">Final Score: {quizState.score} / {questions.length}</p>
              <p className="text-gray-600 mb-6">
                {quizState.score === questions.length 
                  ? "Perfect score! You're amazing! 🌟" 
                  : quizState.score >= questions.length / 2 
                    ? "Great effort! Keep it up! 💪" 
                    : "Practice makes perfect! Try again! 🎯"}
              </p>
              
              <button
                onClick={() => window.location.reload()}
                className="py-3 px-6 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg font-medium hover:shadow-md transition-all"
              >
                Try Again
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default Quiz;