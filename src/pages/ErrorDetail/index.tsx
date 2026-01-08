import { useState, useEffect } from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import { Typography, Layout, Menu, Card, Descriptions, Tag, Space, Button, Spin, message, Breadcrumb } from 'antd'
import { ArrowLeftOutlined, ClockCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { ErrorCategory, ErrorCategoryLabels, ErrorStatus, ErrorStatusLabels, ProjectLabels, EnvironmentLabels } from '../../enum'
import { getErrorDetail, type ErrorItem } from '../../api'
import './index.css'

const { Header, Content, Footer } = Layout
const { Title, Text } = Typography

// 安全渲染函数，确保只渲染字符串类型的数据
const safeRender = (data: unknown): string => {
  if (data === null || data === undefined) {
    return 'N/A';
  }
  try {
    if (typeof data === 'string') {
      return data;
    } else if (typeof data === 'object') {
      // 尝试解析可能已经是字符串的JSON
      const jsonString = JSON.stringify(data, null, 2);
      return jsonString;
    } else {
      // 其他类型（数字、布尔等）直接转换为字符串
      return String(data);
    }
  } catch (e) {
    console.error('数据渲染失败:', e);
    return '数据格式错误，无法解析';
  }
}

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
            <Spin size="large">
              <div style={{ padding: 50, textAlign: 'center' }}>加载中...</div>
            </Spin>
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
        <Breadcrumb style={{ marginBottom: 16 }} items={[
          { title: <a onClick={() => navigate('/home')}>首页</a> },
          { title: <a onClick={() => navigate('/dashboard')}>信息面板</a> },
          { title: '错误详情' },
        ]} />

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
            <Descriptions.Item label="所属项目">
              <Tag color="blue">{ProjectLabels[errorDetail.project]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="运行环境">
              <Tag color="green">{EnvironmentLabels[errorDetail.environment]}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="发生时间" span={2}>
              <Space>
                <ClockCircleOutlined />
                <Text type="secondary">{dayjs(errorDetail.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="请求URL">{errorDetail.url || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="请求方法">
              {errorDetail.method ? <Tag color="orange">{errorDetail.method}</Tag> : 'N/A'}
            </Descriptions.Item>
            <Descriptions.Item label="响应状态码" span={2}>{errorDetail.statusCode || 'N/A'}</Descriptions.Item>
            <Descriptions.Item label="请求负载" span={2}>
              <div style={{
                padding: '12px',
                background: '#f5f5f5',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '13px',
                wordBreak: 'break-all',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {safeRender(errorDetail.payload)}
              </div>
            </Descriptions.Item>
            <Descriptions.Item label="响应数据" span={2}>
              <div style={{
                padding: '12px',
                background: '#f5f5f5',
                borderRadius: '4px',
                fontFamily: 'monospace',
                fontSize: '13px',
                wordBreak: 'break-all',
                maxHeight: '200px',
                overflow: 'auto'
              }}>
                {safeRender(errorDetail.responseData)}
              </div>
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
