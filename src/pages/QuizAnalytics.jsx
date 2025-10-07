import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { api } from '../lib/api';

const QuizAnalytics = () => {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const response = await api.get('/admin/quiz-exams');
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLeaderboard = async (quizId) => {
    try {
      const response = await api.get(`/admin/quiz-exams/${quizId}/leaderboard`);
      setLeaderboard(response.data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
    }
  };

  const handleQuizSelect = (quiz) => {
    setSelectedQuiz(quiz);
    loadLeaderboard(quiz.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-bca-black flex items-center justify-center">
        <div className="text-bca-cyan text-xl">Loading Analytics...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bca-black p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Quiz Analytics</h1>
          <p className="text-bca-gray-400">Performance insights and leaderboards for quiz exams</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Quiz List */}
          <div className="lg:col-span-1">
            <div className="bg-bca-gray-800 rounded-xl p-6 border border-bca-gray-700">
              <h2 className="text-xl font-semibold text-white mb-4">Quiz Exams</h2>
              <div className="space-y-3">
                {analytics.map((quiz) => (
                  <motion.div
                    key={quiz.id}
                    whileHover={{ scale: 1.02 }}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedQuiz?.id === quiz.id
                        ? 'bg-bca-gold/20 border border-bca-gold'
                        : 'bg-bca-gray-700 hover:bg-bca-gray-600'
                    }`}
                    onClick={() => handleQuizSelect(quiz)}
                  >
                    <h3 className="text-white font-medium mb-2">{quiz.title}</h3>
                    <div className="text-sm text-bca-gray-400 space-y-1">
                      <div>Course: {quiz.course?.title}</div>
                      <div>Month: {quiz.monthNumber}</div>
                      <div>Questions: {quiz.questions?.length || 0}</div>
                      <div>Attempts: {quiz.attempts?.length || 0}</div>
                    </div>
                    {quiz.analytics && (
                      <div className="mt-3 text-sm">
                        <div className="text-bca-cyan">
                          Avg Score: {quiz.analytics.averageScore?.toFixed(1)}%
                        </div>
                        <div className="text-bca-gold">
                          Highest: {quiz.analytics.highestScore?.toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Analytics Details */}
          <div className="lg:col-span-2">
            {selectedQuiz ? (
              <div className="space-y-6">
                {/* Quiz Stats */}
                <div className="bg-bca-gray-800 rounded-xl p-6 border border-bca-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4">
                    {selectedQuiz.title} - Analytics
                  </h2>
                  
                  {selectedQuiz.analytics ? (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-bca-gray-700 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-bca-cyan">
                          {selectedQuiz.analytics.averageScore?.toFixed(1)}%
                        </div>
                        <div className="text-bca-gray-400 text-sm">Average Score</div>
                      </div>
                      <div className="bg-bca-gray-700 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-bca-gold">
                          {selectedQuiz.analytics.highestScore?.toFixed(1)}%
                        </div>
                        <div className="text-bca-gray-400 text-sm">Highest Score</div>
                      </div>
                      <div className="bg-bca-gray-700 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-red-400">
                          {selectedQuiz.analytics.lowestScore?.toFixed(1)}%
                        </div>
                        <div className="text-bca-gray-400 text-sm">Lowest Score</div>
                      </div>
                      <div className="bg-bca-gray-700 p-4 rounded-lg text-center">
                        <div className="text-2xl font-bold text-white">
                          {selectedQuiz.analytics.totalAttempts}
                        </div>
                        <div className="text-bca-gray-400 text-sm">Total Attempts</div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-bca-gray-400 text-center py-8">
                      No analytics data available yet
                    </div>
                  )}
                </div>

                {/* Leaderboard */}
                <div className="bg-bca-gray-800 rounded-xl p-6 border border-bca-gray-700">
                  <h2 className="text-xl font-semibold text-white mb-4">Leaderboard</h2>
                  
                  {leaderboard.length > 0 ? (
                    <div className="space-y-3">
                      {leaderboard.map((attempt, index) => (
                        <motion.div
                          key={attempt.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className={`p-4 rounded-lg ${
                            index === 0 ? 'bg-bca-gold/20 border border-bca-gold' :
                            index === 1 ? 'bg-bca-cyan/20 border border-bca-cyan' :
                            index === 2 ? 'bg-bca-gray-600 border border-bca-gray-500' :
                            'bg-bca-gray-700'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                                index === 0 ? 'bg-bca-gold text-black' :
                                index === 1 ? 'bg-bca-cyan text-black' :
                                index === 2 ? 'bg-bca-gray-500 text-white' :
                                'bg-bca-gray-600 text-bca-gray-300'
                              }`}>
                                {index + 1}
                              </div>
                              <div>
                                <div className="text-white font-medium">
                                  {attempt.user?.name || 'Anonymous'}
                                </div>
                                <div className="text-bca-gray-400 text-sm">
                                  {attempt.user?.email}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-bold text-white">
                                {attempt.percentage?.toFixed(1)}%
                              </div>
                              <div className="text-bca-gray-400 text-sm">
                                {attempt.score} / {attempt.totalMarks} marks
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-bca-gray-400 text-center py-8">
                      No attempts yet
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="bg-bca-gray-800 rounded-xl p-6 border border-bca-gray-700 text-center">
                <div className="text-bca-gray-400">
                  Select a quiz exam to view analytics
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAnalytics;
