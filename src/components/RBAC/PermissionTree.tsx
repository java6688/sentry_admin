import { useEffect, useState, useMemo } from 'react'
import { Tree } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { getPermissionTree, type Permission } from '../../api/rbac'

interface Props {
  checkedKeys: string[]
  onChange: (keys: string[]) => void
}

function toTreeData(perms: Permission[]): DataNode[] {
  const byParent = new Map<number | undefined, Permission[]>()
  perms.forEach(p => {
    const k = p.parentId
    const arr = byParent.get(k) || []
    arr.push(p)
    byParent.set(k, arr)
  })
  const build = (parentId?: number): DataNode[] => {
    const children = byParent.get(parentId) || []
    return children.map(c => ({
      key: String(c.code ?? c.id),
      title: c.code ? `${c.name} (${c.code})` : c.name,
      children: build(c.id),
    }))
  }
  return build(undefined)
}

export default function PermissionTree({ checkedKeys, onChange }: Props) {
  const [perms, setPerms] = useState<Permission[]>([])
  const treeData = useMemo(() => toTreeData(perms), [perms])

  useEffect(() => {
    getPermissionTree()
      .then(res => {
        setPerms(res.data)
      })
  }, [])

  return (
    <Tree
      checkable
      treeData={treeData}
      checkedKeys={checkedKeys}
      onCheck={(k) => onChange((Array.isArray(k) ? k : k.checked) as string[])}
    />
  )
}
