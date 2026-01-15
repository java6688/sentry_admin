import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login/index";
import Home from "./pages/Home/index";
import Dashboard from "./pages/Dashboard/index";
import ErrorDetail from "./pages/ErrorDetail/index";
import Roles from "./pages/RBAC/Roles/index";
import Permissions from "./pages/RBAC/Permissions/index";
import UserRoles from "./pages/RBAC/UserRoles/index";
import AssignRolePermissions from "./pages/RBAC/AssignRolePermissions/index";
import Profile from "./pages/Profile/index";
import MainLayout from "./components/Layout/index";
import { ProtectedRoute } from "./components/ProtectedRoute";
import RBACRoute from "./components/RBAC/RBACRoute";
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
            <Route element={<RBACRoute requiredPerms={["error:read"]} />}>
              <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
              <Route path="/error/:id" element={<MainLayout><ErrorDetail /></MainLayout>} />
            </Route>
            <Route element={<RBACRoute requiredPerms={["rbac:role:read"]} />}>
              <Route path="/rbac/roles" element={<MainLayout><Roles /></MainLayout>} />
            </Route>
            <Route element={<RBACRoute requiredPerms={["rbac:perm:read"]} />}>
              <Route path="/rbac/permissions" element={<MainLayout><Permissions /></MainLayout>} />
            </Route>
            <Route element={<RBACRoute requiredPerms={["user:read"]} />}>
              <Route path="/rbac/user-roles" element={<MainLayout><UserRoles /></MainLayout>} />
            </Route>
            <Route element={<RBACRoute requiredPerms={["rbac:role:setPermissions"]} />}>
              <Route path="/rbac/assign-permissions" element={<MainLayout><AssignRolePermissions /></MainLayout>} />
            </Route>
            <Route path="/profile" element={<MainLayout><Profile /></MainLayout>} />
            <Route path="/rbac" element={<Navigate to="/rbac/roles" replace />} />
          </Route>
          {/* 根路径重定向到登录页 */}
          <Route path="/" element={<Navigate to="/login" replace />} />
        </Routes>
      </UserProvider>
    </BrowserRouter>
  );
}

export default App;
