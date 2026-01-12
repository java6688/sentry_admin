import { Layout, Menu, Typography } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import './index.css'

const { Header, Content, Footer } = Layout
const { Title } = Typography

interface LayoutProps {
  children: React.ReactNode
}

function MainLayout({ children }: LayoutProps) {
  const navigate = useNavigate()
  const location = useLocation()

  const getSelectedKey = () => {
    if (location.pathname === '/dashboard' || location.pathname.startsWith('/error/')) return '2'
    return '1'
  }

  const handleMenuClick = (key: string) => {
    if (key === '1') navigate('/home')
    if (key === '2') navigate('/dashboard')
  }

  return (
    <Layout className="main-layout">
      <Header className="main-header">
        <Title level={4} className="main-logo">Sentry Admin</Title>
        <Menu
          mode="horizontal"
          selectedKeys={[getSelectedKey()]}
          onClick={({ key }) => handleMenuClick(key)}
          items={[
            { key: '1', label: '首页' },
            { key: '2', label: '信息面板' },
          ]}
        />
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

export default MainLayout