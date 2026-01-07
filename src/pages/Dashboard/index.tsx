import { Typography, Layout, Menu, Table, Tag, Space, Card, Statistic } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import './index.css'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

const errorData = [
  {
    id: 7,
    type: 'TypeError',
    message: "Cannot read properties of null (reading 'nonexistent')",
    createdAt: '2026-01-07T09:24:19.324Z',
    category: 'API_ERROR',
  },
  {
    id: 6,
    type: 'TypeError',
    message: "window.nonExistentFunction is not a function",
    createdAt: '2026-01-07T09:23:34.576Z',
    category: 'OTHER',
  },
  {
    id: 5,
    type: 'TypeError',
    message: "Cannot read properties of null (reading 'nonexistent')",
    createdAt: '2026-01-07T09:21:33.985Z',
    category: 'OTHER',
  },
]

function Dashboard() {
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

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (text: string) => <Tag color="red">{text}</Tag>,
    },
    {
      title: '消息',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (category: string) => (
        <Tag color={category === 'API_ERROR' ? 'orange' : 'blue'}>
          {category}
        </Tag>
      ),
    },
    {
      title: '时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 200,
      render: (time: string) => (
        <Space>
          <ClockCircleOutlined />
          <Text type="secondary">{time}</Text>
        </Space>
      ),
    },
  ]

  return (
    <Layout className="dashboard-layout">
      <Header className="dashboard-header">
        <Title level={4} className="dashboard-logo">Sentry Admin</Title>
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
      <Content className="dashboard-content">
        <div className="dashboard-stats-row">
          <Card className="dashboard-stat-card">
            <Statistic
              title="总错误数"
              value={errorData.length}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#667eea' }}
            />
          </Card>
          <Card className="dashboard-stat-card">
            <Statistic
              title="API 错误"
              value={errorData.filter((item) => item.category === 'API_ERROR').length}
              prefix={<Tag color="orange">API</Tag>}
              valueStyle={{ color: '#f5576c' }}
            />
          </Card>
          <Card className="dashboard-stat-card">
            <Statistic
              title="其他错误"
              value={errorData.filter((item) => item.category === 'OTHER').length}
              prefix={<Tag color="blue">OTHER</Tag>}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
          <Card className="dashboard-stat-card">
            <Statistic
              title="今日告警"
              value={3}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </div>

        <Card title="错误日志" className="dashboard-card">
          <Table
            dataSource={errorData}
            columns={columns}
            rowKey="id"
            pagination={false}
          />
        </Card>
      </Content>
      <Footer className="dashboard-footer">
        Sentry Admin ©2025 Created by Sentry
      </Footer>
    </Layout>
  )
}

export default Dashboard
