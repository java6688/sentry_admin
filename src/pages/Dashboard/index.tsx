import { useState, useEffect } from 'react'
import { Typography, Layout, Menu, Table, Tag, Space, Card, Statistic, message, Dropdown, Button, Select } from 'antd'
import { useNavigate, useLocation } from 'react-router-dom'
import { CheckCircleOutlined, ClockCircleOutlined, DownOutlined } from '@ant-design/icons'
import { ErrorCategory, ErrorCategoryLabels, ErrorStatus, ErrorStatusLabels } from '../../enum'
import { getErrorList, updateErrorStatus, type ErrorItem } from '../../api'
import './index.css'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const [errorData, setErrorData] = useState<ErrorItem[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<ErrorStatus | undefined>(undefined)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getErrorList(statusFilter)
        setErrorData(data)
      } catch {
        message.error('获取错误列表失败')
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [statusFilter])

  const getSelectedKey = () => {
    if (location.pathname === '/dashboard') return '2'
    return '1'
  }

  const handleMenuClick = (key: string) => {
    if (key === '1') navigate('/home')
    if (key === '2') navigate('/dashboard')
  }

  const handleStatusChange = async (id: number, status: ErrorStatus) => {
    await updateErrorStatus(id, status)
      setErrorData(prev =>
        prev.map(item =>
          item.id === id ? { ...item, status } : item
        )
      )
      message.success('状态更新成功')
  }

  const statusItems = [
    { key: ErrorStatus.UNRESOLVED, label: ErrorStatusLabels[ErrorStatus.UNRESOLVED] },
    { key: ErrorStatus.RESOLVED, label: ErrorStatusLabels[ErrorStatus.RESOLVED] },
    { key: ErrorStatus.IN_PROGRESS, label: ErrorStatusLabels[ErrorStatus.IN_PROGRESS] },
  ]

  const getStatusTag = (status?: string) => {
    switch (status) {
      case ErrorStatus.RESOLVED:
        return <Tag color="success">{ErrorStatusLabels[ErrorStatus.RESOLVED]}</Tag>
      case ErrorStatus.IN_PROGRESS:
        return <Tag color="processing">{ErrorStatusLabels[ErrorStatus.IN_PROGRESS]}</Tag>
      default:
        return <Tag color="default">{ErrorStatusLabels[ErrorStatus.UNRESOLVED]}</Tag>
    }
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
      filters: [
        { text: ErrorCategoryLabels[ErrorCategory.API_ERROR], value: ErrorCategory.API_ERROR },
        { text: ErrorCategoryLabels[ErrorCategory.FRONTEND_ERROR], value: ErrorCategory.FRONTEND_ERROR },
        { text: ErrorCategoryLabels[ErrorCategory.OTHER], value: ErrorCategory.OTHER },
      ],
      onFilter: (value: unknown, record: ErrorItem) => record.category === value,
      render: (category: string) => (
        <Tag color={category === ErrorCategory.API_ERROR ? 'orange' : category === ErrorCategory.FRONTEND_ERROR ? 'purple' : 'blue'}>
          {ErrorCategoryLabels[category as ErrorCategory]}
        </Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => getStatusTag(status),
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
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_: unknown, record: ErrorItem) => (
        <Space>
          <Button
            size="small"
            type="link"
            onClick={() => navigate(`/error/${record.id}`)}
          >
            查看详情
          </Button>
          <Dropdown
            menu={{
              items: statusItems,
              onClick: ({ key }) => handleStatusChange(record.id, key as ErrorStatus),
            }}
            trigger={['click']}
          >
            <Button size="small">
              修改状态 <DownOutlined />
            </Button>
          </Dropdown>
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
              styles={{ content: { color: '#667eea' } }}
            />
          </Card>
          <Card className="dashboard-stat-card">
            <Statistic
              title="API 错误"
              value={errorData.filter((item) => item.category === ErrorCategory.API_ERROR).length}
              prefix={<Tag color="orange">API</Tag>}
              styles={{ content: { color: '#f5576c' } }}
            />
          </Card>
          <Card className="dashboard-stat-card">
            <Statistic
              title="前端错误"
              value={errorData.filter((item) => item.category === ErrorCategory.FRONTEND_ERROR).length}
              prefix={<Tag color="purple">FE</Tag>}
              styles={{ content: { color: '#722ed1' } }}
            />
          </Card>
          <Card className="dashboard-stat-card">
            <Statistic
              title="其他错误"
              value={errorData.filter((item) => item.category === ErrorCategory.OTHER).length}
              prefix={<Tag color="blue">OTHER</Tag>}
              styles={{ content: { color: '#52c41a' } }}
            />
          </Card>
        </div>

        <Card title="错误日志" className="dashboard-card">
          <Space style={{ marginBottom: 16 }}>
            <Select
              placeholder="选择状态筛选"
              allowClear
              style={{ width: 150 }}
              value={statusFilter}
              onChange={setStatusFilter}
              options={[
                { value: ErrorStatus.UNRESOLVED, label: ErrorStatusLabels[ErrorStatus.UNRESOLVED] },
                { value: ErrorStatus.RESOLVED, label: ErrorStatusLabels[ErrorStatus.RESOLVED] },
                { value: ErrorStatus.IN_PROGRESS, label: ErrorStatusLabels[ErrorStatus.IN_PROGRESS] },
              ]}
            />
          </Space>
          <Table
            dataSource={errorData}
            columns={columns}
            rowKey="id"
            pagination={false}
            loading={loading}
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
