import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Navbar } from './ui/components/Navbar/Navbar';
import { Login } from "./ui/pages/Auth/Login/Login";
import { Register } from "./ui/pages/Auth/Register/Register";
import { ProtectedRoute } from './ui/components/ProtectedRoute/ProtectedRoute';
import { PublicRoute } from "./ui/components/PublicRoute/PublicRoute";
import { Quote } from './ui/pages/Quote/Quote';
import { QuoteProvider } from './context/QuoteContext';
import { ResetPassword } from "./ui/pages/Auth/ResetPassword/ResetPassword";
import { Quiz } from "./ui/pages/Quiz/Quiz";
import { QuizCompleted } from "./ui/pages/Quiz/QuizCompleted";
import { Dashboard } from "./ui/components/Dashboard/Dashboard";
import { Home } from "./ui/pages/Home/Home";
import { Footer } from "./ui/components/Footer/Footer";
import { AuthProvider } from "./hooks/useAuth";
import { QuizGuard } from "./ui/pages/Quiz/QuizGuard";

function App() {
    return (
        <AuthProvider>
            <QuoteProvider>
                <Router>
                    <div className="App">
                        <Navbar />
                        <main className="content-body">
                            <Routes>
                                <Route path="/" element={<Home />} />
                                <Route
                                    path="/login"
                                    element = {
                                        <PublicRoute>
                                            <Login />
                                        </PublicRoute>
                                    }
                                />

                                <Route
                                    path="/register"
                                    element = {
                                        <PublicRoute>
                                            <Register />
                                        </PublicRoute>
                                    }
                                />
                                <Route
                                    path="/dashboard"
                                    element = {
                                        <ProtectedRoute>
                                            <Dashboard />
                                        </ProtectedRoute>
                                    }
                                />
                                <Route
                                    path="/quiz"
                                    element = {
                                        <ProtectedRoute>
                                            <QuizGuard>
                                                <Quiz />
                                            </QuizGuard>
                                        </ProtectedRoute>
                                    }
                                />
                                <Route path="/quiz/completed" element={<QuizCompleted />} />
                                <Route path="/quote" element={<Quote />} />
                                <Route path="/reset-password" element={<ResetPassword />} />
                            </Routes>
                        </main>
                        <Footer />
                    </div>
                </Router>
            </QuoteProvider>
        </AuthProvider>
    );
}
export default App;
