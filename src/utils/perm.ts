export function getUserPerms(): string[] {
  try {
    const saved = localStorage.getItem('user')
    if (!saved) return []
    const obj = JSON.parse(saved)
    return Array.isArray(obj.permissions) ? obj.permissions : []
  } catch {
    return []
  }
}

export function hasPerm(code: string): boolean {
  return getUserPerms().includes(code)
}

export function hasAnyPerm(codes: string[]): boolean {
  const set = new Set(getUserPerms())
  return codes.some(c => set.has(c))
}

