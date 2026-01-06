import { BrowserRouter as Router, Routes, Route } from "react-router";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import StartupDetails from "./pages/StartupDetails";
import Analytics from "./pages/Analytics";
import Profile from "./pages/Profile";
import CreateStartup from "./pages/CreateStartup"; // New
import Favorites from "./pages/Favorites"; // New
import EditStartup from "./pages/EditStartup";
import CreateRound from "./pages/CreateRound";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              <Route path="/profile" element={<Profile />} />
              <Route path="/create-startup" element={<CreateStartup />} />
              <Route path="/favorites" element={<Favorites />} />

              <Route path="/startup/:id" element={<StartupDetails />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/startup/:id/edit" element={<EditStartup />} />
              <Route path="/startup/:id/new-round" element={<CreateRound />} />
            </Routes>
          </div>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
