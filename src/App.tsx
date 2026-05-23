import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Navbar } from './components/Navbar/Navbar';
import { Login } from "./components/Auth/Login/Login";
import { Register } from "./components/Auth/Register/Register";
import { ProtectedRoute } from './components/ProtectedRoute/ProtectedRoute';
import { Quote } from './components/Quote/Quote';
import { QuoteProvider } from './Context/QuoteContext';
import { ResetPassword } from "./components/Auth/ResetPassword/ResetPassword";
import { DailyQuiz } from "./components/DailyQuiz/DailyQuiz";
import { QuizCompleted } from "./components/DailyQuiz/QuizCompleted";
import { Dashboard } from "./components/Dashboard/Dashboard";
import { Home } from "./components/Home/Home";

function App() {
    return (
        <QuoteProvider>
            <Router>
                <div className="App">
                    <Navbar />
                    <main className="content-body">
                        <Routes>
                            <Route path="/" element={<Home />} />
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route
                                path="/dashboard"
                                element={
                                    <ProtectedRoute>
                                        <Dashboard />
                                    </ProtectedRoute>
                                }
                            />
                            <Route
                                path="/quiz"
                                element={
                                    <ProtectedRoute>
                                        <DailyQuiz />
                                    </ProtectedRoute>
                                }
                            />
                            <Route path="/quiz/completed" element={<QuizCompleted />} />
                            <Route path="/quote" element={<Quote />} />
                            <Route path="/reset-password" element={<ResetPassword />} />
                        </Routes>
                    </main>
                </div>
            </Router>
        </QuoteProvider>
    );
}
export default App;
