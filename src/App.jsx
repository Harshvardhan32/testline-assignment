import { Routes, Route } from 'react-router-dom';
import ErrorPage from './pages/ErrorPage';
import Quiz from './pages/Quiz';

const App = () => {
    return (
        <Routes>
            {/* Default Route for Quiz page */}
            <Route path="/" element={<Quiz />} />

            {/* Catch-all Route for handling 404 - Page Not Found */}
            <Route path="*" element={<ErrorPage />} />
        </Routes>
    );
};

export default App;