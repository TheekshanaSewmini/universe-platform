import { BrowserRouter as Router, Routes, Route } from "react-router-dom";


import Login from "./pages/Login";
import Signup from "./pages/Signup";       
import OTPVerify from "./pages/OTPVerify";
import Profile from "./pages/Profile";
import Home from "./pages/Home";
import AdminHome from "./pages/AdminHome";
import LibrarianHome from "./pages/LibrarianHome";
import SettingsPage from "./pages/SettingsPage";
import ForgotPassword from "./pages/ForgotPassword"

import MyMaterials from "./post/MyMaterials";
import AllMaterials from "./post/AllMaterials";


import LandingPage from "./landing/LandingPage";

import './App.css';


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} /> 
          <Route path="/forgot-password" element={<ForgotPassword />} />
   
        <Route path="/verify" element={<OTPVerify />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/adminhome" element={<AdminHome />} />
         <Route path="/librarianhome" element={<LibrarianHome />} />


<Route path="/materials/all" element={<AllMaterials />} />
<Route path="/materials/my" element={<MyMaterials />} />
             
  

                     
      </Routes>
    </Router>
  );
}

export default App;