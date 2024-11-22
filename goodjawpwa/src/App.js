// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import BaseNose from './pages/BaseNose';
import FaceDetection from './pages/FaceDetection';
import EvaluateAnalysisResultPage from './pages/EvaluateAnalysisResultPage'

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/" element={<BaseNose />} />
                <Route path="/FaceDetection" element={<FaceDetection />} />
                <Route path="/EvaluateAnalysisResultPage" element={<EvaluateAnalysisResultPage />} />
            </Routes>
        </Router>
    );
};

export default App;