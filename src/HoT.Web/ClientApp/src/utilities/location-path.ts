
export function isInPath(path: string, withinPath: string) {
  return path === withinPath || withinPath.startsWith(`${path}.`)
}