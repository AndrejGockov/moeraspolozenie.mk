import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Navbar } from './Components/Navbar/Navbar';
import { Login } from "./Components/Auth/Login/Login";
import { Register } from "./Components/Auth/Register/Register";
import { ProtectedRoute } from './Components/ProtectedRoute/ProtectedRoute';
import { PublicRoute } from "./Components/PublicRoute/PublicRoute";
import { Quote } from './Components/Quote/Quote';
import { QuoteProvider } from './Context/QuoteContext';
import { ResetPassword } from "./Components/Auth/ResetPassword/ResetPassword";
import { Quiz } from "./Components/Quiz/Quiz";
import { QuizCompleted } from "./Components/Quiz/QuizCompleted";
import { Dashboard } from "./Components/Dashboard/Dashboard";
import { Home } from "./Components/Home/Home";
import { Footer } from "./Components/Footer/Footer";
import { AuthProvider } from "./hooks/useAuth";
import { QuizGuard } from "./Components/Quiz/QuizGuard";

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
