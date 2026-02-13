import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import SystemFooter from './components/SystemFooter';
import Home from './pages/Home';
import About from './pages/About';
import Documentation from './pages/Documentation';
import Login from './pages/Login';
import LawDashboard from './components/LawDashboard';
import ScrollToTop from './components/ScrollToTop'; // We'll create this helper

import FilmGrain from './components/effects/FilmGrain';
import AmbientBackground from './components/effects/AmbientBackground';

const Layout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-[#020202] text-gray-200 font-sans relative">
    <FilmGrain />
    <AmbientBackground />
    <Navbar />
    <main className="flex-grow pt-16 relative z-10">
      {children}
    </main>
    <SystemFooter />
  </div>
);

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          
          <Route 
            path="/gst" 
            element={
              <LawDashboard 
                title="GST Intelligence Hub" 
                domainId="gst" 
                contextDesc="tax scenario"
                definition="A comprehensive indirect tax charged on the supply of goods and services. It replaced multiple cascading taxes levied by the central and state governments."
                implDate="July 1, 2017"
              />
            } 
          />
          <Route 
            path="/income-tax" 
            element={
              <LawDashboard 
                title="Income Tax Advisory" 
                domainId="income-tax" 
                contextDesc="income tax query"
                definition="A direct tax levied on the income or profits of individuals and entities. Governed by the Income Tax Act, 1961."
                implDate="April 1, 1962"
              />
            } 
          />
          <Route 
            path="/fema" 
            element={
              <LawDashboard 
                title="FEMA Expert System" 
                domainId="fema" 
                contextDesc="foreign exchange scenario"
                definition="An Act to consolidate and amend the law relating to foreign exchange with the objective of facilitating external trade and payments."
                implDate="June 1, 2000"
              />
            } 
          />
          <Route 
            path="/company-law" 
            element={
              <LawDashboard 
                title="Company Law Compliance" 
                domainId="company-law" 
                contextDesc="regulatory query"
                definition="The legislation that governs the incorporation, responsibilities, and dissolution of companies in India."
                implDate="April 1, 2014"
              />
            } 
          />
          <Route path="/about" element={<About />} />
          <Route path="/docs" element={<Documentation />} />
          <Route path="/login" element={<Login />} />


        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
