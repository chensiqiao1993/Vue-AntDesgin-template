// eslint-disable-next-line
import axios, { Method, AxiosResponse } from 'axios'
import { getToken } from '@/utils/common'
import { httpCode } from '@/config'
import { notification } from 'ant-design-vue'

interface AxiosReqConfig{
    url:string
    method:Method
    headers:any
    data:any
    params:any
}
const pending: any[] = [] // 声明一个数组用于存储每个ajax请求的取消函数和ajax标识

/* 利用axios的cancelToken进行防重复提交 */
// 如需允许多个提交同时发出。则需要在请求配置config中增加 neverCancel 属性，并设置为true
const removePending: any = (config: any, f: any) => {
  // 获取请求的url
  const flagUrl = config.url
  // 判断该请求是否在请求队列中
  if (pending.indexOf(flagUrl) !== -1) {
    // 如果在请求中，并存在f,f即axios提供的取消函数
    if (f) {
      f('cancelDuplicateRequest') // 执行取消重复请求操作
    } else {
      pending.splice(pending.indexOf(flagUrl), 1) // 把这条记录从数组中移除
    }
  } else {
    // 如果不存在在请求队列中，加入队列
    if (f) {
      pending.push(flagUrl)
    }
  }
}

/* 创建axios实例  AxiosInstance*/
const http: any = axios.create({
  timeout: 5000, // 请求超时时间
  baseURL: process.env.VUE_APP_BASE_API
})

http.interceptors.request.use((config:AxiosReqConfig) => {
  config.headers['token'] = getToken()
  return config
}, (error:any) => {
  console.log(error)
  return Promise.reject(error)
})

http.interceptors.response.use((response:AxiosResponse) => {
  removePending(response.config)
  const res = response.data

  if (res.code !== httpCode.success) {
    notification.error({
      message: '登录错误',
      description: res.message
    })
  }
  return res
}, (error:any) => {
  console.log('err' + error) // for debug
  return Promise.reject(error)
})

export default http
