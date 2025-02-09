import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';

const QuizApp = () => {

    const [quizData, setQuizData] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [score, setScore] = useState(0);
    const [isQuizCompleted, setIsQuizCompleted] = useState(false);
    const [selectedAnswer, setSelectedAnswer] = useState(null);

    useEffect(() => {
        const fetchQuizData = async () => {
            try {
                const response = await fetch('https://api.jsonserve.com/Uw5CrX');
                const data = await response.json();
                setQuizData(data);
            } catch (error) {
                console.error('Error fetching quiz data:', error);
            }
        };

        fetchQuizData();
    }, []);

    const handleAnswerSelection = (isCorrect) => {
        if (isCorrect) {
            setScore(score + 1);
        }
        setSelectedAnswer(isCorrect);
    };

    const handleNextQuestion = () => {
        if (currentQuestion < quizData.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
            setSelectedAnswer(null);
        } else {
            setIsQuizCompleted(true);
        }
    };

    const restartQuiz = () => {
        setCurrentQuestion(0);
        setScore(0);
        setIsQuizCompleted(false);
        setSelectedAnswer(null);
    };

    if (!quizData.length) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gradient-to-r from-blue-200 to-purple-300 p-4">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-3xl mx-auto"
            >
                <Card className="shadow-lg">
                    <CardContent>
                        {!isQuizCompleted ? (
                            <>
                                <h1 className="text-2xl font-bold text-center mb-4">
                                    Question {currentQuestion + 1} of {quizData.length}
                                </h1>
                                <Progress value={((currentQuestion + 1) / quizData.length) * 100} className="mb-4" />
                                <h2 className="text-lg font-semibold mb-4">{quizData[currentQuestion].question}</h2>
                                <div className="grid gap-4">
                                    {quizData[currentQuestion].options.map((option, index) => (
                                        <button
                                            key={index}
                                            onClick={() => handleAnswerSelection(option.isCorrect)}
                                            className={`p-2 rounded border-2 transition-all ${selectedAnswer === option.isCorrect
                                                ? option.isCorrect
                                                    ? 'bg-green-500 text-white'
                                                    : 'bg-red-500 text-white'
                                                : 'hover:bg-blue-100'
                                                }`}
                                            disabled={selectedAnswer !== null}
                                        >
                                            {option.text}
                                        </button>
                                    ))}
                                </div>
                                {selectedAnswer !== null && (
                                    <Button onClick={handleNextQuestion} className="mt-4 w-full">
                                        Next
                                    </Button>
                                )}
                            </>
                        ) : (
                            <div className="text-center">
                                <h1 className="text-3xl font-bold">Quiz Completed!</h1>
                                <p className="text-lg my-4">Your Score: {score} / {quizData.length}</p>
                                <Button onClick={restartQuiz} className="w-full">
                                    Restart Quiz
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
};

export default QuizApp;