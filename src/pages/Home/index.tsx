import { Typography, Layout, Menu } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import './index.css'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

function Home() {
  const navigate = useNavigate()
  const location = useLocation()

  const getSelectedKey = () => {
    if (location.pathname === '/dashboard') return '2'
    return '1'
  }

  const handleMenuClick = (key: string) => {
    if (key === '1') navigate('/home')
    if (key === '2') navigate('/dashboard')
  }

  return (
    <Layout className="home-layout">
      <Header className="home-header">
        <Title level={4} className="home-logo">Sentry Admin</Title>
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
      <Content className="home-content">
        <div className="home-welcome-card">
          <Title level={2} className="home-welcome-title">欢迎来到 Sentry Admin 系统</Title>
          <Text type="secondary" className="home-welcome-desc">
            这是一个基于 React + Ant Design 构建的后台管理系统模板，提供完善的用户管理和系统配置功能。
          </Text>
          <div className="home-stats">
            <div className="home-stat-item">
              <div className="home-stat-number">128</div>
              <div className="home-stat-label">系统用户</div>
            </div>
            <div className="home-stat-item">
              <div className="home-stat-number">56</div>
              <div className="home-stat-label">在线设备</div>
            </div>
            <div className="home-stat-item">
              <div className="home-stat-number">99.8%</div>
              <div className="home-stat-label">系统可用性</div>
            </div>
          </div>
        </div>
      </Content>
      <Footer className="home-footer">
        Sentry Admin ©2025 Created by Sentry
      </Footer>
    </Layout>
  )
}

export default Home
