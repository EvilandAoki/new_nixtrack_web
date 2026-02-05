import { env } from '../config/env'

export const getFileUrl = (path: string | undefined): string => {
    if (!path) return ''
    if (path.startsWith('http')) return path

    // Ensure we don't have double slashes if path starts with /
    const cleanPath = path.startsWith('/') ? path : `/${path}`
    return `${env.baseUrl}${cleanPath}`
}
