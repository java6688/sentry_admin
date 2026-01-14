import { useEffect, useState } from 'react'
import { Card, Descriptions, message, Tag } from 'antd'
import { me } from '../../api'
import './index.css'

export default function Profile() {
  const [user, setUser] = useState<{ id: number; username: string; roles?: string[]; disabled?: boolean } | null>(null)

  useEffect(() => {
    me().then(res => setUser(res.data)).catch(() => {
      message.error('获取个人信息失败')
    })
  }, [])

  return (
    <div className="profile-page">
      <Card title="个人信息">
        <Descriptions column={1}>
          <Descriptions.Item label="用户ID">{user?.id ?? ''}</Descriptions.Item>
          <Descriptions.Item label="用户名">{user?.username ?? ''}</Descriptions.Item>
          <Descriptions.Item label="角色">{(user?.roles || []).join('、')}</Descriptions.Item>
          <Descriptions.Item label="状态">
            {user?.disabled ? <Tag color="red">禁用</Tag> : <Tag color="green">启用</Tag>}
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  )
}
