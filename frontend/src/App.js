import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { LanguageProvider } from "./contexts/LanguageContext";
import { AuthProvider } from "./contexts/AuthContext";
import { Navbar } from "./components/Navbar";
import { Footer } from "./components/Footer";
import { LandingPage } from "./pages/LandingPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { DashboardPage } from "./pages/DashboardPage";
import { CargoPage } from "./pages/CargoPage";
import { PassengerPage } from "./pages/PassengerPage";
import { PricingPage } from "./pages/PricingPage";
import "@/App.css";

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <div className="App min-h-screen bg-[#09090b] flex flex-col">
          <BrowserRouter>
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/cargo" element={<CargoPage />} />
                <Route path="/passenger" element={<PassengerPage />} />
                <Route path="/pricing" element={<PricingPage />} />
              </Routes>
            </main>
            <Footer />
          </BrowserRouter>
          <Toaster 
            position="top-right" 
            theme="dark"
            toastOptions={{
              style: {
                background: '#18181b',
                border: '1px solid #27272a',
                color: '#fff',
              },
            }}
          />
        </div>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
