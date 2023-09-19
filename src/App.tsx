import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Home, Toolkits, ProfilePage, Dashboard } from "./pages";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/profile' element={<ProfilePage />} />
        <Route path='/toolkits' element={<Toolkits />} />
        <Route path='/dashboard' element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
