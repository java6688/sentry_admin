import { useEffect, useState, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Card, Descriptions, Tag, Button, Space, Typography, Spin, message } from 'antd'
import { ArrowLeftOutlined, EditOutlined, UserOutlined } from '@ant-design/icons'
import 'react-quill-new/dist/quill.snow.css'
import {
  getBugReportDetail,
  BugPriority,
  BugStatus,
  BugPriorityMap,
  BugStatusMap,
  type BugReport,
} from '../../api/bug-report'
import BugReportModal from './components/BugReportModal'
import AssignModal from './components/AssignModal'

const { Title } = Typography

export default function BugReportDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState<BugReport | null>(null)
  
  // Modals
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)

  const loadData = useCallback(async () => {
    if (!id) return
    setLoading(true)
    try {
      const res = await getBugReportDetail(id)
      setData(res.data)
    } catch (error) {
      console.error(error)
      message.error('加载详情失败')
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const getPriorityColor = (priority: BugPriority) => {
    switch (priority) {
      case BugPriority.LOW: return 'green'
      case BugPriority.MEDIUM: return 'blue'
      case BugPriority.HIGH: return 'orange'
      case BugPriority.CRITICAL: return 'red'
      default: return 'default'
    }
  }

  const getStatusColor = (status: BugStatus) => {
    switch (status) {
      case BugStatus.OPEN: return 'red'
      case BugStatus.IN_PROGRESS: return 'processing'
      case BugStatus.RESOLVED: return 'success'
      case BugStatus.CLOSED: return 'default'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!data) {
    return (
      <div style={{ padding: 24, textAlign: 'center' }}>
        <Title level={4}>未找到问题报告</Title>
        <Button onClick={() => navigate('/bug-reports')}>返回列表</Button>
      </div>
    )
  }

  return (
    <div style={{ padding: 24 }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
            <Space align="start">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate('/bug-reports')}
                style={{ marginTop: 4 }}
              >
                返回
              </Button>
              <div>
                <Title level={3} style={{ margin: 0 }}>{data.title}</Title>
                <Space style={{ marginTop: 8 }}>
                  <Tag color={getPriorityColor(data.priority)}>
                    {BugPriorityMap[data.priority]}
                  </Tag>
                  <Tag color={getStatusColor(data.status)}>
                    {BugStatusMap[data.status]}
                  </Tag>
                  <span style={{ color: '#8c8c8c' }}>
                    ID: {data.id}
                  </span>
                </Space>
              </div>
            </Space>
            <Space>
              <Button 
                icon={<UserOutlined />} 
                onClick={() => setAssignModalOpen(true)}
              >
                指派
              </Button>
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                onClick={() => setEditModalOpen(true)}
              >
                编辑
              </Button>
            </Space>
          </div>

          <Descriptions bordered column={2}>
            <Descriptions.Item label="指派给">
              {data.assigneeId ? `User #${data.assigneeId}` : '未指派'}
            </Descriptions.Item>
            <Descriptions.Item label="报告人">
              User #{data.reporterId}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {data.createdAt}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {data.updatedAt}
            </Descriptions.Item>
          </Descriptions>

          <div style={{ marginTop: 24 }}>
            <Title level={5}>问题描述</Title>
            <div className="ql-container ql-snow" style={{ border: 'none' }}>
              <div 
                className="ql-editor"
                style={{ padding: 0, minHeight: 100 }}
                dangerouslySetInnerHTML={{ __html: data.description }} 
              />
            </div>
          </div>
        </Card>
      </Space>

      <BugReportModal
        open={editModalOpen}
        editing={data}
        onClose={() => setEditModalOpen(false)}
        onSuccess={() => {
          setEditModalOpen(false)
          loadData()
        }}
      />

      <AssignModal
        open={assignModalOpen}
        bugReport={data}
        onClose={() => setAssignModalOpen(false)}
        onSuccess={() => {
          setAssignModalOpen(false)
          loadData()
        }}
      />

      {/* Override some styles for read-only view */}
      <style>{`
        .ql-editor img {
          max-width: 100%;
          height: auto;
          margin: 8px 0;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  )
}
