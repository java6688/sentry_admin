import { useCallback, useEffect, useState } from 'react'
import { Table, Button, Space, Tag, Modal, message, Select } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import {
  getBugReportList,
  deleteBugReport,
  BugPriority,
  BugStatus,
  BugPriorityMap,
  BugStatusMap,
  type BugReport,
} from '../../api/bug-report'
import BugReportModal from './components/BugReportModal'
import AssignModal from './components/AssignModal'
import './index.css'

export default function BugReportList() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<BugReport[]>([])
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [total, setTotal] = useState(0)

  // Filters
  const [filters, setFilters] = useState<{ status?: BugStatus; priority?: BugPriority }>({})

  // Modals
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [editingReport, setEditingReport] = useState<BugReport | null>(null)
  const [assigningReport, setAssigningReport] = useState<BugReport | null>(null)

  const loadData = useCallback(async (p: number, ps: number) => {
    setLoading(true)
    try {
      const res = await getBugReportList({
        page: p,
        limit: ps,
        status: filters.status,
        priority: filters.priority,
      })
      // Adjust based on actual API response structure
      // Assuming res.data contains { list, total, page, limit, totalPages }
      // The API definition returns PaginationResponse<BugReport> which expects data.list
      // If the backend returns flat data, we might need to adjust.
      // For now assuming standard wrapper as per rbac.ts example.
      if (res.data && Array.isArray(res.data.list)) {
        setData(res.data.list)
        setTotal(res.data.pagination.total)
        setPage(res.data.pagination.page)
        setPageSize(res.data.pagination.pageSize)
      }
    } catch (error) {
      console.error(error)
      message.error('加载列表失败')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadData(1, pageSize)
  }, [filters, pageSize, loadData]) // Reset to page 1 on filter change

  // Reload when page changes
  useEffect(() => {
    loadData(page, pageSize)
  }, [page, pageSize, loadData])

  const handleDelete = (record: BugReport) => {
    Modal.confirm({
      title: '确认删除该问题报告？',
      content: '删除后无法恢复',
      onOk: async () => {
        try {
          await deleteBugReport(record.id)
          message.success('删除成功')
          loadData(page, pageSize)
        } catch (error) {
          console.error(error)
          message.error('删除失败')
        }
      },
    })
  }

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

  const columns: ColumnsType<BugReport> = [
    {
      title: '标题',
      dataIndex: 'title',
      width: 300,
      render: (text, record) => (
        <a onClick={() => navigate(`/bug-reports/${record.id}`)}>{text}</a>
      ),
    },
    {
      title: '优先级',
      dataIndex: 'priority',
      width: 100,
      render: (priority: BugPriority) => (
        <Tag color={getPriorityColor(priority)}>{BugPriorityMap[priority]}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: BugStatus) => (
        <Tag color={getStatusColor(status)}>{BugStatusMap[status]}</Tag>
      ),
    },
    {
      title: '指派给',
      dataIndex: 'assigneeId',
      width: 100,
      render: (assigneeId: number) => assigneeId ? `User #${assigneeId}` : '未指派',
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="link" onClick={() => navigate(`/bug-reports/${record.id}`)}>查看</Button>
          <Button type="link" onClick={() => { setEditingReport(record); setCreateModalOpen(true) }}>编辑</Button>
          <Button type="link" onClick={() => { setAssigningReport(record); setAssignModalOpen(true) }}>指派</Button>
          <Button type="link" danger onClick={() => handleDelete(record)}>删除</Button>
        </Space>
      ),
    },
  ]

  return (
    <div className="bug-report-page">
      <div className="toolbar">
        <Button type="primary" onClick={() => { setEditingReport(null); setCreateModalOpen(true) }}>
          创建问题
        </Button>
        <Select
          placeholder="状态筛选"
          style={{ width: 120 }}
          allowClear
          onChange={(val) => setFilters(prev => ({ ...prev, status: val }))}
        >
          {Object.values(BugStatus).map(s => (
            <Select.Option key={s} value={s}>{BugStatusMap[s]}</Select.Option>
          ))}
        </Select>
        <Select
          placeholder="优先级筛选"
          style={{ width: 120 }}
          allowClear
          onChange={(val) => setFilters(prev => ({ ...prev, priority: val }))}
        >
          {Object.values(BugPriority).map(p => (
            <Select.Option key={p} value={p}>{BugPriorityMap[p]}</Select.Option>
          ))}
        </Select>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={data}
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          onChange: (p, ps) => {
            setPage(p)
            setPageSize(ps)
          },
          showSizeChanger: true,
        }}
      />

      <BugReportModal
        open={createModalOpen}
        editing={editingReport}
        onClose={() => { setCreateModalOpen(false); setEditingReport(null) }}
        onSuccess={() => { setCreateModalOpen(false); setEditingReport(null); loadData(page, pageSize) }}
      />

      <AssignModal
        open={assignModalOpen}
        bugReport={assigningReport}
        onClose={() => { setAssignModalOpen(false); setAssigningReport(null) }}
        onSuccess={() => { setAssignModalOpen(false); setAssigningReport(null); loadData(page, pageSize) }}
      />
    </div>
  )
}
