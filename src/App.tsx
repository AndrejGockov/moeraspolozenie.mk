import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Navbar } from './Components/Navbar/Navbar';
import { Login } from "./Components/Auth/Login/Login";
import { Register } from "./Components/Auth/Register/Register";
import { ProtectedRoute } from './Components/ProtectedRoute/ProtectedRoute';
import { Quote } from './Components/Quote/Quote';
import { QuoteProvider } from './Context/QuoteContext';
import { ResetPassword } from "./Components/Auth/ResetPassword/ResetPassword";

function Home() { return <h2>Home Page</h2>; }
function Dashboard() { return <h2>Dashboard Page (Protected)</h2>; }
function Quiz() { return <h2>Daily Quiz Page (Protected)</h2>; } // Placeholder

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
                                        <Quiz />
                                    </ProtectedRoute>
                                }
                            />
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
