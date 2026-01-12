import { Navigate, Outlet } from 'react-router-dom'
import { useUser } from '../hooks/useUser'

// 受保护路由组件
export const ProtectedRoute = () => {
  const { isLoggedIn, user } = useUser()

  // 直接从localStorage检查登录状态，不依赖于Context的状态更新
  const checkLoginStatus = () => {
    const savedUser = localStorage.getItem('user');
    return savedUser !== null;
  };

  // 初始加载时直接检查localStorage
  const hasSavedUser = checkLoginStatus();

  // 如果有保存的用户信息，但Context中的状态还未更新，等待一下再检查
  if (hasSavedUser && !isLoggedIn && !user) {
    return null; // 暂时不渲染，等待Context状态更新
  }

  // 如果未登录，重定向到登录页
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  // 如果已登录，渲染子路由
  return <Outlet />
}