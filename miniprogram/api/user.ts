import fly from '../utils/request'

export function Get (params: any) {
    return fly.get('/api', params)
}

