import React, { useState, useEffect } from 'react';
import { MdOutlineLightMode, MdOutlineDarkMode } from "react-icons/md";

const Quiz = () => {

    // State variables
    const [quizData, setQuizData] = useState(null); // Holds quiz data
    const [currentQuestion, setCurrentQuestion] = useState(0); // Index of the current question
    const [score, setScore] = useState(0); // User's score
    const [isQuizCompleted, setIsQuizCompleted] = useState(false); // Indicates if quiz is completed
    const [selectedAnswers, setSelectedAnswers] = useState([]); // Stores the selected answers for each question
    const [streak, setStreak] = useState(0); // Current streak of correct answers
    const [highScore, setHighScore] = useState(() => localStorage.getItem('highScore') || 0); // Fetches high score from localStorage
    const [answerFeedback, setAnswerFeedback] = useState([]); // Stores feedback on answers (correct/incorrect)
    const [timer, setTimer] = useState(15 * 60); // Global timer in seconds (15 minutes)
    const [isTimerActive, setIsTimerActive] = useState(true); // Controls whether the timer is active
    const [isDark, setIsDark] = useState(() => JSON.parse(localStorage.getItem('theme')) || false); // Dark mode toggle

    // Fetch quiz data from API
    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                const response = await fetch('/api/Uw5CrX');
                const data = await response.json();
                setQuizData(data);
            } catch (error) {
                console.error('Error fetching quiz data:', error);
            }
        };

        fetchQuizData();
    }, []);

    // Timer logic
    useEffect(() => {
        if (isTimerActive && !isQuizCompleted) {
            const timerInterval = setInterval(() => {
                setTimer((prevTimer) => {
                    if (prevTimer <= 1) {
                        clearInterval(timerInterval);
                        setIsQuizCompleted(true); // Automatically complete the quiz when time runs out
                        return 0;
                    }
                    return prevTimer - 1;
                });
            }, 1000);

            return () => clearInterval(timerInterval); // Cleanup the interval on unmount or change
        }
    }, [isTimerActive, isQuizCompleted]);

    // Theme toggle handler
    const handleTheme = () => {
        const newTheme = !isDark;
        localStorage.setItem('theme', JSON.stringify(newTheme)); // Save the theme to localStorage
        setIsDark(newTheme); // Toggle theme
    };

    // Handle answer selection (correct/incorrect)
    const handleAnswerSelection = (isCorrect, option) => {
        const updatedAnswers = [...selectedAnswers];
        updatedAnswers[currentQuestion] = option; // Save selected answer for the current question
        setSelectedAnswers(updatedAnswers);

        const updatedFeedback = [...answerFeedback];
        updatedFeedback[currentQuestion] = isCorrect ? 'correct' : 'incorrect'; // Save feedback for the current question
        setAnswerFeedback(updatedFeedback);

        if (isCorrect) {
            setScore(score + parseFloat(quizData.correct_answer_marks)); // Increase score
            setStreak(streak + 1); // Increase streak
        } else {
            setScore(score - parseFloat(quizData.negative_marks)); // Decrease score for incorrect answers
            setStreak(0); // Reset streak
        }
    };

    // Handle the transition to the next question
    const handleNextQuestion = () => {
        if (currentQuestion < quizData?.questions?.length - 1) {
            setCurrentQuestion(currentQuestion + 1); // Move to the next question
        } else {
            setIsQuizCompleted(true); // Mark quiz as completed when there are no more questions
            setIsTimerActive(false); // Stop the timer
            if (score > highScore) {
                setHighScore(score);
                localStorage.setItem('highScore', score); // Save new high score
            }
        }
    };

    // Handle the transition to the previous question
    const handlePreviousQuestion = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1); // Move to the previous question
        }
    };

    // Restart the quiz
    const restartQuiz = () => {
        setCurrentQuestion(0);
        setScore(0);
        setIsQuizCompleted(false);
        setSelectedAnswers([]);
        setAnswerFeedback([]);
        setStreak(0);
        setTimer(15 * 60); // Reset global timer
        setIsTimerActive(true); // Restart the timer
    };

    // Loading state
    if (!quizData) {
        return (
            <div className="flex justify-center items-center h-screen text-xl font-semibold text-gray-800 dark:text-white">
                Loading...
            </div>
        );
    }

    // Main quiz content
    return (
        <div className={`${isDark ? 'dark bg-gradient-to-r from-gray-700 to-slate-800' : 'bg-gradient-to-r from-cyan-300 to-purple-400'} min-h-screen flex justify-center items-center p-4`}>
            {/* Theme toggle button */}
            <div
                className='absolute top-3 right-3 cursor-pointer text-2xl dark:text-white dark:bg-gray-900 bg-gray-100 p-3 rounded-full'
                onClick={handleTheme}
            >
                {isDark ? <MdOutlineLightMode /> : <MdOutlineDarkMode />}
            </div>

            {/* Quiz content */}
            <div className="bg-white dark:bg-gray-900 dark:text-white shadow-lg rounded-lg p-6 w-full max-w-2xl">
                <h1 className="text-3xl font-bold text-center mb-4">{quizData.title || 'Quiz App'}</h1>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-2">Topic: {quizData.topic || 'General Knowledge'}</p>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-2">High Score: {highScore}</p>

                {!isQuizCompleted ? (
                    <>
                        {/* Timer display */}
                        <p className="p-4 text-center text-md font-medium text-gray-800 dark:text-gray-100">
                            Time Remaining: {Math.floor(timer / 60)}:{timer % 60}
                        </p>
                        <h2 className="text-2xl font-semibold text-center mb-4">
                            Question {currentQuestion + 1} of {quizData.questions.length}
                        </h2>

                        {/* Progress bar */}
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 mb-4">
                            <div
                                className="bg-[#1aa388] h-4 rounded-full"
                                style={{ width: `${((currentQuestion + 1) / quizData.questions.length) * 100}%` }}
                            ></div>
                        </div>

                        {/* Question description */}
                        <h3 className="text-lg font-medium mb-4 text-gray-700 dark:text-gray-200">
                            {quizData.questions[currentQuestion].description}
                        </h3>

                        {/* Options */}
                        <div className="grid gap-4">
                            {quizData?.questions[currentQuestion]?.options?.map((option, index) => {
                                const isSelected = selectedAnswers[currentQuestion] === option;
                                const isCorrect = option.is_correct;
                                const isWrong = answerFeedback[currentQuestion] === 'incorrect' && !isCorrect;
                                const isAnswered = selectedAnswers[currentQuestion] !== undefined; // Check if question is answered

                                return (
                                    <button
                                        key={index}
                                        onClick={() => handleAnswerSelection(isCorrect, option)}
                                        disabled={isAnswered} // Disable button if question is already answered
                                        className={`cursor-pointer p-3 rounded-lg border transition-all ${isSelected
                                            ? isCorrect
                                                ? 'bg-[#05b592] text-white'
                                                : isWrong
                                                    ? 'bg-red-700 text-white'
                                                    : ''
                                            : isCorrect && answerFeedback[currentQuestion] === 'incorrect'
                                                ? 'bg-[#05b592] text-white'
                                                : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                                            }`}
                                    >
                                        {option.description}
                                    </button>
                                );
                            })}
                        </div>

                        {/* Show Correct Answer Section */}
                        {selectedAnswers[currentQuestion] && (
                            <div className="mt-4 p-3 bg-[#c7ebe4] rounded-lg">
                                <p className="text-center font-semibold text-[#05b592]">
                                    Correct Answer: {quizData.questions[currentQuestion].options.find(opt => opt.is_correct).description}
                                </p>
                            </div>
                        )}

                        {/* Navigation buttons */}
                        <div className="flex justify-between mt-6">
                            <button
                                onClick={handlePreviousQuestion}
                                className={`${currentQuestion === 0 ? 'cursor-not-allowed' : 'cursor-pointer'} bg-gray-500 dark:bg-gray-600 text-white p-3 rounded-lg hover:bg-gray-600 dark:hover:bg-gray-500`}
                                disabled={currentQuestion === 0}
                            >
                                Previous
                            </button>
                            <button
                                onClick={handleNextQuestion}
                                className="cursor-pointer bg-[#1aa388] text-white p-3 rounded-lg hover:bg-[#1ab181]"
                            >
                                Next
                            </button>
                        </div>
                        <p className="mt-4 text-center text-sm text-gray-600 dark:text-gray-400">Current Streak: {streak}</p>
                    </>
                ) : (
                    <div className="text-center">
                        <h1 className="text-3xl font-bold mb-4">Quiz Completed!</h1>
                        <p className="text-lg mb-4">
                            Your Score: {score.toFixed(2)} / {quizData.questions.length * parseFloat(quizData.correct_answer_marks)}
                        </p>
                        <p className="text-lg mb-6">Longest Streak: {streak}</p>
                        <button
                            onClick={restartQuiz}
                            className="cursor-pointer bg-[#05b592] hover:bg-[#1ab181] text-white p-3 rounded-lg w-full"
                        >
                            Restart Quiz
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Quiz;