interface ResponseData<T> {
  code: number
  msg: string
  result: T
}

export function request<T = any>(url: string, data?: any, method: 'POST' | 'GET' = 'POST') {
  return fetch(url, {
    method,
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  }).then(async res => {
    if (res.ok) {
      const json = await res.json() as ResponseData<T>
      if (json.code === 0) return json.result

      return Promise.reject(json)
    }
    return Promise.reject(res)
  })
}

export function get<T>(url: string, data?: any) {
  return request<T>(url, data, 'GET')
}

export function post<T>(url: string, data?: any) {
  return request<T>(url, data, 'POST')
}

export function getKey() {
  return get<{
    publicKey: string
  }>('/cda/sys/v2/secretKey/getKey')
}

export function login(params: {
  username: string
  password: string
}) {
  return post<{
    accesstoken: string
  }>('/cda/oauth/v2/login', {
    code: '',
    type: 'sys',
    uuid: '',
    ...params,
  })
}
