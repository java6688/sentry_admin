import { Navigate, Outlet } from 'react-router-dom'
import { hasAnyPerm } from '../../utils/perm'

interface Props {
  requiredPerms: string[]
}

export default function RBACRoute({ requiredPerms }: Props) {
  const allowed = hasAnyPerm(requiredPerms)
  if (!allowed) {
    return <Navigate to="/home" replace />
  }
  return <Outlet />
}

