import { Layout, Menu, Typography, Avatar, Dropdown, Space } from 'antd'
import type { MenuProps } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { LogoutOutlined } from '@ant-design/icons'
import { useUser } from '../../hooks/useUser'
import { hasPerm } from '../../utils/perm'
import './index.css'

const { Header, Content, Footer } = Layout
const { Title } = Typography

interface LayoutProps {
  children: React.ReactNode
}

export default function MainLayout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { user, logout } = useUser()

  const getSelectedKey = () => {
    if (location.pathname === '/dashboard' || location.pathname.startsWith('/error/')) return 'dashboard'
    if (location.pathname.startsWith('/rbac/user-roles')) return 'user'
    if (location.pathname.startsWith('/rbac/assign-permissions')) return 'rbac-assign-perms'
    if (location.pathname.startsWith('/rbac/permissions')) return 'rbac-permissions'
    if (location.pathname.startsWith('/rbac/roles') || location.pathname === '/rbac') return 'rbac-roles'
    if (location.pathname.startsWith('/home')) return 'home'
    return 'home'
  }

  const handleMenuClick = (key: string) => {
    if (key === 'home') navigate('/home')
    if (key === 'dashboard') navigate('/dashboard')
    if (key === 'rbac-roles') navigate('/rbac/roles')
    if (key === 'rbac-permissions') navigate('/rbac/permissions')
    if (key === 'rbac-assign-perms') navigate('/rbac/assign-permissions')
    if (key === 'user') navigate('/rbac/user-roles')
  }

  // 退出登录处理
  const handleLogout = () => {
    logout()
  }

  // 下拉菜单选项
  const dropdownMenu = {
    items: [
      {
        key: 'profile',
        label: '个人信息',
        onClick: () => navigate('/profile')
      },
      {
        key: 'logout',
        label: (
          <Space>
            <LogoutOutlined />
            退出登录
          </Space>
        ),
        onClick: handleLogout
      }
    ]
  }

  return (
    <Layout className="main-layout">
      <Header className="main-header">
        <Title level={4} className="main-logo">Sentry Admin</Title>
        <Menu
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          onClick={({ key }) => handleMenuClick(key)}
          items={(() => {
            const notNull = <T,>(x: T | null): x is T => x !== null
            const rbacChildren = [
              hasPerm('rbac:role:read') ? { key: 'rbac-roles', label: '角色管理' } : null,
              hasPerm('rbac:perm:read') ? { key: 'rbac-permissions', label: '权限管理' } : null,
              hasPerm('rbac:role:setPermissions') ? { key: 'rbac-assign-perms', label: '分配权限(批量)' } : null,
            ].filter(notNull)
            const items: MenuProps['items'] = [
              { key: 'home', label: '首页' },
              hasPerm('error:read') ? { key: 'dashboard', label: '信息面板' } : null,
              rbacChildren.length > 0
                ? {
                    key: 'rbac',
                    label: (
                      <span className="menu-label-with-arrow">
                        权限管理 <span className="arrow-icon">▼</span>
                      </span>
                    ),
                    children: rbacChildren,
                  }
                : null,
              hasPerm('user:read') ? { key: 'user', label: '用户管理' } : null,
            ].filter(notNull)
            return items
          })()}
        />
        {/* 用户信息区域 */}
        {user && (
          <div className="user-info">
            <Dropdown menu={dropdownMenu} trigger={['hover']}>
              <Space>
                <Avatar src={user.avatar} alt={user.username} />
                <span className="username">{user.username}</span>
                <span className="arrow-icon">▼</span>
              </Space>
            </Dropdown>
          </div>
        )}
      </Header>
      <Content className="main-content">
        {children}
      </Content>
      <Footer className="main-footer">
        Sentry Admin ©2025 Created by Sentry
      </Footer>
    </Layout>
  )
}
