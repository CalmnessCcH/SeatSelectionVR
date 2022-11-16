import axios from 'axios'

const service = axios.create({
  baseURL: "",
  timeout: 30000,
  withCredentials: true, // 允许跨域 cookie
  headers: {
    'X-Requested-With': 'x-requested-with',
    'X-System-ID': 1, // 系统ID
  },
  xsrfCookieName: '_xsrf',
  xsrfHeaderName: 'X-Xsrftoken',
})

service.interceptors.request.use(
  config => {
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

service.interceptors.response.use(
  response => {
    let result = response.data
    return result
  },
  error => {
    return Promise.reject(error)
  }
)

// get
export const doGet = (url, params) => {
  return service.get(`/api/${url}`, {
    params
  })
}

// put
export const doPut = (url, data) => {
  return service({
    method: 'put',
    url: `/api/${url}`,
    data,
  })
}

// post
export const doPost = (url, data) => {
  return service({
    method: 'post',
    url: `/api/${url}`,
    data,
  })
}

// delete
export const doDelete = (url, data) => {
  return service({
    method: 'delete',
    url: `/api/${url}`,
    data
  })
}