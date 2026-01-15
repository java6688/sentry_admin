import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Typography, Card, Descriptions, Tag, Space, Button, Spin, message, Breadcrumb, Select } from 'antd'
import { ArrowLeftOutlined, ClockCircleOutlined } from '@ant-design/icons'
import dayjs from 'dayjs'
import { ErrorCategory, ErrorCategoryLabels, ErrorStatus, ErrorStatusLabels, ProjectLabels, EnvironmentLabels } from '../../enum'
import { getErrorDetail, updateErrorStatus, type ErrorItem } from '../../api'
import { hasPerm } from '../../utils/perm'
import './index.css'

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

// 浏览器信息类型定义
export type BrowserInfo = {
  name: string;
  version: string;
  os: string;
  osVersion: string;
  deviceType: string;
  screenResolution: string;
  language: string;
  userAgent: string;
};

// 定义错误详情接口，包含apiInfo和stackInfo
interface ErrorDetailData extends ErrorItem {
  apiInfoId?: number;
  stackInfoId?: number;
  browserInfo?: BrowserInfo;
  apiInfo?: {
    id: number;
    url: string;
    method: string;
    statusCode: number;
    payload: unknown;
    responseData: string;
  };
  stackInfo?: {
    id: number;
    column: number;
    filename: string;
    functionName: string;
    line: number;
  };
}

function ErrorDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [errorDetail, setErrorDetail] = useState<ErrorDetailData | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedStatus, setSelectedStatus] = useState<ErrorStatus | undefined>(undefined)
  const [statusUpdating, setStatusUpdating] = useState(false)

  const handleSaveStatus = async () => {
    if (!id || !selectedStatus) return
    setStatusUpdating(true)
    try {
      await updateErrorStatus(Number(id), selectedStatus)
      // 更新本地状态
      setErrorDetail(prev => prev ? { ...prev, status: selectedStatus } : null)
      message.success('状态更新成功')
    } finally {
      setStatusUpdating(false)
    }
  }

  useEffect(() => {
    const fetchDetail = async () => {
      if (!id) return
      try {
        const res = await getErrorDetail(Number(id))
        setErrorDetail(res.data)
        setSelectedStatus(res.data.status)
      } finally {
        setLoading(false)
      }
    }
    fetchDetail()
  }, [id])

  const getCategoryTag = (category: string) => {
    const color = category === ErrorCategory.API_ERROR ? 'orange' : category === ErrorCategory.FRONTEND_ERROR ? 'purple' : 'blue'
    return <Tag color={color}>{ErrorCategoryLabels[category as ErrorCategory]}</Tag>
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
        <Spin size="large">
          <div style={{ padding: 50, textAlign: 'center' }}>加载中...</div>
        </Spin>
      </div>
    )
  }

  if (!errorDetail) {
    return (
      <Card className="error-detail-card">
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">未找到该错误信息</Text>
          <br /><br />
          <Button type="primary" onClick={() => navigate('/dashboard')}>
            返回信息面板
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <>
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

        {/* 基本信息表 */}
        <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>基本信息</Title>
        <Descriptions bordered column={2} size="small">
          {/* 基本信息 */}
          <Descriptions.Item label="错误 ID">{errorDetail.id}</Descriptions.Item>
          <Descriptions.Item label="错误类型">
            <Tag color="red">{errorDetail.type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="错误分类">
            {getCategoryTag(errorDetail.category)}
          </Descriptions.Item>
          <Descriptions.Item label="错误状态">
            {hasPerm('error:resolve') ? (
              <Space>
                <Select
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  style={{ width: 120 }}
                >
                  {Object.entries(ErrorStatusLabels).map(([status, label]) => (
                    <Select.Option key={status} value={status}>
                      {label}
                    </Select.Option>
                  ))}
                </Select>
                <Button
                  type="primary"
                  size="small"
                  onClick={handleSaveStatus}
                  loading={statusUpdating}
                >
                  保存
                </Button>
              </Space>
            ) : (
              <Tag color={
                errorDetail.status === ErrorStatus.RESOLVED ? 'success' :
                errorDetail.status === ErrorStatus.IN_PROGRESS ? 'processing' : 'default'
              }>
                {ErrorStatusLabels[errorDetail.status]}
              </Tag>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="所属项目">
            <Tag color="blue">{ProjectLabels[errorDetail.project]}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="运行环境">
            <Tag color="green">{EnvironmentLabels[errorDetail.environment]}</Tag>
          </Descriptions.Item>
          {errorDetail.apiInfoId && <Descriptions.Item label="API信息ID">{errorDetail.apiInfoId}</Descriptions.Item>}
          {errorDetail.stackInfoId && <Descriptions.Item label="堆栈信息ID">{errorDetail.stackInfoId}</Descriptions.Item>}
          <Descriptions.Item label="发生时间" span={2}>
            <Space>
              <ClockCircleOutlined />
              <Text type="secondary">{dayjs(errorDetail.createdAt).format('YYYY-MM-DD HH:mm:ss')}</Text>
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

        {/* 调用栈信息表 */}
        <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>调用栈信息</Title>
        <Descriptions bordered column={2} size="small">
          {/* 堆栈信息 */}
          <Descriptions.Item label="文件名" span={2}>{errorDetail.stackInfo?.filename || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="函数名">{errorDetail.stackInfo?.functionName || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="行号">{errorDetail.stackInfo?.line || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="列号">{errorDetail.stackInfo?.column || 'N/A'}</Descriptions.Item>
        </Descriptions>

        {/* 浏览器信息表 */}
        <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>浏览器信息</Title>
        <Descriptions bordered column={2} size="small">
          {/* 浏览器信息 */}
          <Descriptions.Item label="浏览器" span={2}>
            {errorDetail.browserInfo?.name && errorDetail.browserInfo?.version
              ? `${errorDetail.browserInfo?.name} ${errorDetail.browserInfo?.version}`
              : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="操作系统">
            {errorDetail.browserInfo?.os && errorDetail.browserInfo?.osVersion
              ? `${errorDetail.browserInfo?.os} ${errorDetail.browserInfo?.osVersion}`
              : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="设备类型">{errorDetail.browserInfo?.deviceType || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="屏幕分辨率">{errorDetail.browserInfo?.screenResolution || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="语言">{errorDetail.browserInfo?.language || 'N/A'}</Descriptions.Item>
          <Descriptions.Item label="User Agent" span={2}>
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
              {errorDetail.browserInfo?.userAgent || 'N/A'}
            </div>
          </Descriptions.Item>
        </Descriptions>

        {/* 接口调用信息表 */}
        {errorDetail.apiInfoId && (
          <>
            <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>接口调用信息</Title>
            <Descriptions bordered column={2} size="small">
              {/* API信息 */}
              <Descriptions.Item label="API URL" span={2}>{errorDetail.apiInfo?.url || 'N/A'}</Descriptions.Item>
              <Descriptions.Item label="请求方法">
                {errorDetail.apiInfo?.method ? <Tag color="orange">{errorDetail.apiInfo.method}</Tag> : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="响应状态码">{errorDetail.apiInfo?.statusCode || 'N/A'}</Descriptions.Item>
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
                  {safeRender(errorDetail.apiInfo?.payload)}
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
                  {safeRender(errorDetail.apiInfo?.responseData)}
                </div>
              </Descriptions.Item>
            </Descriptions>
          </>
        )}
      </Card>
    </>
  )
}

export default ErrorDetail
