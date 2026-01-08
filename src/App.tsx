import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AliveScope, KeepAlive } from "react-activation";
import Login from "./pages/Login/index";
import Home from "./pages/Home/index";
import Dashboard from "./pages/Dashboard/index";
import ErrorDetail from "./pages/ErrorDetail/index";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AliveScope>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<KeepAlive><Dashboard /></KeepAlive>} />
          <Route path="/error/:id" element={<ErrorDetail />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </AliveScope>
    </BrowserRouter>
  );
}

export default App;
