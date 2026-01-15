import { Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/LoginPage";
import Register from "./pages/RegisterPage";
import Home from "./pages/HomePage";
import About from "./pages/AboutPage";
import Play from "./pages/playPage";
import Analysis from "./pages/AnalysisPage";
import Database from "./pages/DatabasePage";
import Navbar from "./components/Navbar";
import Game from "./pages/gamePage";
import { useAuth } from "./authContext";
import MyGames from "./pages/MyGamesPage";

function App() {
    const { isLoggedIn } = useAuth();

    return (
        <div className="min-h-screen flex flex-col">
            <Navbar />
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={isLoggedIn ? <Navigate to="/" /> : <Login />} />
                <Route path="/register" element={isLoggedIn ? <Navigate to="/" /> : <Register />} />
                <Route path="/about" element={<About />} />
                <Route path="/play" element={isLoggedIn ? <Play /> : <Navigate to="/" />} />
                <Route path="/game/:id" element={isLoggedIn ? <Game /> : <Navigate to="/" />} />
                <Route path="/database" element={isLoggedIn ? <Database /> : <Navigate to="/" />} />
                <Route path="/analysis" element={isLoggedIn ? <Analysis /> : <Navigate to="/" />} />
                <Route path="/mygames" element={isLoggedIn ? <MyGames /> : <Navigate to="/" />} />
            </Routes>
        </div>
    );
}

export default App;

