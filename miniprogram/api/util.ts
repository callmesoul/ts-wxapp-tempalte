import fly from '../utils/request'

export function GetQiNiuToken (params: any) {
    return fly.get('/api', params)
}

