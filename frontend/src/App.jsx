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






import AddSeat from "./lib/AddSeat";
import SeatsPage from "./lib/SeatsPage";
import UserSeats from "./lib/UserSeats";
import SeatAvailability from "./lib/SeatAvailability";
import CheckAvailability from "./lib/CheckAvailability";
import MyBookings from "./lib/MyBookings";
import AllBookings from "./lib/AllBookings";



import AddFoundItem from "./FoundandLost/AddFoundItem";
import AllFoundItems from "./FoundandLost/AllFoundItems";
import FoundItemDetails from "./FoundandLost/FoundItemDetails";
import MyFoundItems from "./FoundandLost/MyFoundItems";
import SuggestItem from "./FoundandLost/SuggestItem";

import AllLostItems from "./FoundandLost/AllLostItems";
import MyLostItems from "./FoundandLost/MyLostItems";
import LostItemDetail from "./FoundandLost/LostItemDetail";
import AddLostItem from "./FoundandLost/AddLostItem";



import LandingPage from "./landing/LandingPage";

import './App.css';
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} />
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


<Route path="/materials/all" element={<AllMaterials />} />
<Route path="/materials/my" element={<MyMaterials />} />
             




        <Route path="/librarianhome" element={<LibrarianHome />} />
           <Route path="/sddSeat" element={<AddSeat />} />
             <Route path="/seatsPage" element={<SeatsPage/>} />
              <Route path="/userSeats" element={<UserSeats/>} />
                   <Route path="/seatAvailability" element={<SeatAvailability/>} />
                    <Route path="/checkAvailability" element={<CheckAvailability/>} />
                     <Route path="/myBookings" element={<MyBookings/>} />
                     <Route path="/all-bookings" element={<AllBookings />} />


                      <Route path="/add-found" element={<AddFoundItem  />} />
                       <Route path="/found-items" element={<AllFoundItems  />} />
                        <Route path="/found-item/:id" element={<FoundItemDetails  />} />
                         <Route path="/my-found" element={<MyFoundItems  />} />
                         <Route path="/suggest" element={<SuggestItem />} />

                         <Route path="/all-lost" element={<AllLostItems />} />
                         <Route path="/my-lost" element={<MyLostItems />} />
                          <Route path="/lost-item/:id" element={<LostItemDetail />} />
                           <Route path="/add-lost" element={<AddLostItem />} />
                           


                     
      </Routes>
    </Router>
  );
}

export default App;
