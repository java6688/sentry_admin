import React, { createContext, useState, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Modal, message } from 'antd';
import { logout as logoutApi } from '../api';

// 用户信息类型
interface UserInfo {
  id: number;
  username: string;
  email?: string;
  avatar?: string;
}

// 上下文类型
interface UserContextType {
  user: UserInfo | null;
  isLoggedIn: boolean;
  login: (userInfo: UserInfo, token: string) => void;
  logout: () => void;
}

// 从localStorage获取初始用户信息
const getInitialUser = (): UserInfo | null => {
  const savedUser = localStorage.getItem('user');
  if (savedUser) {
    try {
      return JSON.parse(savedUser);
    } catch (error) {
      console.error('Failed to parse saved user:', error);
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      return null;
    }
  }
  return null;
};

// 创建上下文
const UserContext = createContext<UserContextType | undefined>(undefined);

// 上下文提供者组件
const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  // 使用初始值直接从localStorage加载用户信息，而不是依赖useEffect
  const initialUser = getInitialUser();
  const [user, setUser] = useState<UserInfo | null>(initialUser);
  const [isLoggedIn, setIsLoggedIn] = useState(initialUser !== null);

  // 登录方法
  const login = (userInfo: UserInfo, token: string) => {
    setUser(userInfo);
    setIsLoggedIn(true);
    localStorage.setItem('user', JSON.stringify(userInfo));
    localStorage.setItem('token', token);
    // 登录成功后导航到首页
    navigate('/home');
  };

  // 退出登录方法
  const logout = async () => {
    try {
      // 调用退出登录接口
      await logoutApi();
      // 接口调用成功，执行退出登录逻辑
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem('user');
      localStorage.removeItem('token'); // 清除token
      // 退出登录后导航到登录页
      navigate('/login');
    } catch (error) {
      // 接口调用失败，显示确认框
      Modal.confirm({
        title: '退出登录失败',
        content: '退出登录失败，是否重新执行退出登录？',
        okText: '重新退出',
        cancelText: '取消',
        onOk: async () => {
          try {
            // 再次调用退出登录接口
            await logoutApi();
            // 接口调用成功，执行退出登录逻辑
            setUser(null);
            setIsLoggedIn(false);
            localStorage.removeItem('user');
            localStorage.removeItem('token'); // 清除token
            // 退出登录后导航到登录页
            navigate('/login');
          } catch (retryError) {
            // 再次调用失败，提示用户
            message.error('退出登录失败，请稍后重试');
          }
        },
        onCancel: () => {
          // 关闭Modal，不执行任何操作
        }
      });
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoggedIn, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

export { UserContext, UserProvider };