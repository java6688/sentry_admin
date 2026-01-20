import { useEffect, useState, useRef, useMemo, useCallback } from 'react'
import { Modal, Form, Input, Select, message } from 'antd'
import ReactQuill from 'react-quill-new'
import 'react-quill-new/dist/quill.snow.css'
import { BugPriority, BugPriorityMap, createBugReport, updateBugReport, uploadBugImage, type BugReport, type CreateBugReportDto } from '../../../api/bug-report'

interface BugReportModalProps {
  open: boolean
  editing?: BugReport | null
  onClose: () => void
  onSuccess: () => void
}

export default function BugReportModal({ open, editing, onClose, onSuccess }: BugReportModalProps) {
  const [form] = Form.useForm()
  const [loading, setLoading] = useState(false)
  const quillRef = useRef<ReactQuill>(null)

  useEffect(() => {
    if (open) {
      if (editing) {
        form.setFieldsValue({
          title: editing.title,
          description: editing.description,
          priority: editing.priority,
        })
      } else {
        form.resetFields()
        form.setFieldsValue({ priority: BugPriority.MEDIUM })
      }
    }
  }, [open, editing, form])

  const handleOk = async () => {
    try {
      const values = await form.validateFields()
      setLoading(true)
      
      const payload: CreateBugReportDto = {
        title: values.title,
        description: values.description,
        priority: values.priority,
      }

      if (editing) {
        await updateBugReport(editing.id, payload)
        message.success('更新成功')
      } else {
        await createBugReport(payload)
        message.success('创建成功')
      }
      
      onSuccess()
    } catch (error) {
      console.error(error)
      // Form validation error or API error
    } finally {
      setLoading(false)
    }
  }

  const imageHandler = useCallback(() => {
    const input = document.createElement('input')
    input.setAttribute('type', 'file')
    input.setAttribute('accept', 'image/*')
    input.click()

    input.onchange = async () => {
      const file = input.files?.[0]
      if (file) {
        try {
          const res = await uploadBugImage(file)
          const url = res.data
          const quill = quillRef.current?.getEditor()
          if (quill) {
            const range = quill.getSelection()
            const index = range ? range.index : 0
            quill.insertEmbed(index, 'image', url)
            // 将光标移动到图片后面
            quill.setSelection(index + 1, 0)
          }
        } catch (error) {
          console.error(error)
          message.error('图片上传失败')
        }
      }
    }
  }, [])

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ 'header': [1, 2, 3, false] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        [{ 'color': [] }, { 'background': [] }],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler
      }
    }
  }), [imageHandler])

  return (
    <Modal
      title={editing ? '编辑问题' : '创建问题'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      confirmLoading={loading}
      width={800}
      destroyOnClose
      // Fix for Quill tooltip focus issue in modal
      getContainer={false} 
      forceRender
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{ priority: BugPriority.MEDIUM }}
      >
        <Form.Item
          name="title"
          label="标题"
          rules={[{ required: true, message: '请输入标题' }]}
        >
          <Input placeholder="请输入问题标题" />
        </Form.Item>

        <Form.Item
          name="priority"
          label="优先级"
          rules={[{ required: true, message: '请选择优先级' }]}
        >
          <Select>
            <Select.Option value={BugPriority.LOW}>{BugPriorityMap[BugPriority.LOW]} (Low)</Select.Option>
            <Select.Option value={BugPriority.MEDIUM}>{BugPriorityMap[BugPriority.MEDIUM]} (Medium)</Select.Option>
            <Select.Option value={BugPriority.HIGH}>{BugPriorityMap[BugPriority.HIGH]} (High)</Select.Option>
            <Select.Option value={BugPriority.CRITICAL}>{BugPriorityMap[BugPriority.CRITICAL]} (Critical)</Select.Option>
          </Select>
        </Form.Item>

        <Form.Item
          name="description"
          label="描述"
          rules={[{ required: true, message: '请输入描述' }]}
        >
          <ReactQuill
            ref={quillRef}
            theme="snow"
            modules={modules}
            placeholder="请输入问题描述..."
            style={{ height: 300, marginBottom: 50 }} // margin for toolbar
          />
        </Form.Item>
      </Form>
    </Modal>
  )
}
