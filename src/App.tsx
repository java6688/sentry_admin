import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/index";
import Home from "./pages/Home/index";
import Dashboard from "./pages/Dashboard/index";
import ErrorDetail from "./pages/ErrorDetail/index";
import MainLayout from "./components/Layout/index";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { UserProvider } from "./contexts/UserContext";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <UserProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          {/* 受保护路由 */}
          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<MainLayout><Home /></MainLayout>} />
            <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
            <Route path="/error/:id" element={<MainLayout><ErrorDetail /></MainLayout>} />
          </Route>
          {/* 根路径重定向到登录页 */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
