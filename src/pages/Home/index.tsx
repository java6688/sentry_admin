import { Typography } from 'antd'
import './index.css'

const { Title, Text } = Typography

function Home() {
  return (
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
  )
}

export default Home
