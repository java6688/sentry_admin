import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Typography, Layout, Menu, Card, Descriptions, Tag, Space, Button, Spin, message, Breadcrumb } from 'antd'
import { ArrowLeftOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { ErrorCategory, ErrorCategoryLabels, ErrorStatus, ErrorStatusLabels } from '../../enum'
import { getErrorDetail, type ErrorItem } from '../../api'
import './index.css'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

function ErrorDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const [errorDetail, setErrorDetail] = useState<ErrorItem | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return
      try {
        const data = await getErrorDetail(Number(id))
        setErrorDetail(data)
      } catch {
        message.error('获取错误详情失败')
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  const getSelectedKey = () => {
    if (location.pathname === '/dashboard') return '2'
    return '1'
  }

  const handleMenuClick = (key: string) => {
    if (key === '1') navigate('/home')
    if (key === '2') navigate('/dashboard')
  }

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

  const getCategoryTag = (category: string) => {
    const color = category === ErrorCategory.API_ERROR ? 'orange' : category === ErrorCategory.FRONTEND_ERROR ? 'purple' : 'blue'
    return <Tag color={color}>{ErrorCategoryLabels[category as ErrorCategory]}</Tag>
  }

  if (loading) {
    return (
      <Layout className="error-detail-layout">
        <Header className="error-detail-header">
          <Title level={4} className="error-detail-logo">Sentry Admin</Title>
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
        <Content className="error-detail-content">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
            <Spin size="large" tip="加载中..." />
          </div>
        </Content>
        <Footer className="error-detail-footer">
          Sentry Admin ©2025 Created by Sentry
        </Footer>
      </Layout>
    )
  }

  if (!errorDetail) {
    return (
      <Layout className="error-detail-layout">
        <Header className="error-detail-header">
          <Title level={4} className="error-detail-logo">Sentry Admin</Title>
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
        <Content className="error-detail-content">
          <Card className="error-detail-card">
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <Text type="secondary">未找到该错误信息</Text>
              <br /><br />
              <Button type="primary" onClick={() => navigate('/dashboard')}>
                返回信息面板
              </Button>
            </div>
          </Card>
        </Content>
        <Footer className="error-detail-footer">
          Sentry Admin ©2025 Created by Sentry
        </Footer>
      </Layout>
    )
  }

  return (
    <Layout className="error-detail-layout">
      <Header className="error-detail-header">
        <Title level={4} className="error-detail-logo">Sentry Admin</Title>
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
      <Content className="error-detail-content">
        <Breadcrumb style={{ marginBottom: 16 }}>
          <Breadcrumb.Item>
            <a onClick={() => navigate('/home')}>首页</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>
            <a onClick={() => navigate('/dashboard')}>信息面板</a>
          </Breadcrumb.Item>
          <Breadcrumb.Item>错误详情</Breadcrumb.Item>
        </Breadcrumb>

        <Card className="error-detail-card">
          <div style={{ marginBottom: 16 }}>
            <Button
              type="text"
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate('/dashboard')}
            >
              返回信息面板
            </Button>
          </div>

          <Title level={4}>错误详情</Title>

          <Descriptions bordered column={2} size="small">
            <Descriptions.Item label="错误 ID">{errorDetail.id}</Descriptions.Item>
            <Descriptions.Item label="错误类型">
              <Tag color="red">{errorDetail.type}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="错误分类">
              {getCategoryTag(errorDetail.category)}
            </Descriptions.Item>
            <Descriptions.Item label="错误状态">
              {getStatusTag(errorDetail.status)}
            </Descriptions.Item>
            <Descriptions.Item label="发生时间" span={2}>
              <Space>
                <ClockCircleOutlined />
                <Text type="secondary">{errorDetail.createdAt}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="错误消息" span={2}>
              <div style={{
                padding: '12px',
                background: '#f5f5f5',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '13px',
                wordBreak: 'break-all'
              }}>
                {errorDetail.message}
              </div>
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </Content>
      <Footer className="error-detail-footer">
        Sentry Admin ©2025 Created by Sentry
      </Footer>
    </Layout>
  )
}

export default ErrorDetail
