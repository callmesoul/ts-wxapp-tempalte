import { ApiBaseUrl, tokenName } from  '../config'
const Fly = require('../lib/fly.js')
const tokenFly= new Fly;
const fly = new Fly
const accountInfo = wx.getAccountInfoSync()
import { store } from '../store'

// base url 
fly.config.baseURL = ApiBaseUrl[accountInfo.miniProgram.envVersion] ? ApiBaseUrl[accountInfo.miniProgram.envVersion] : ApiBaseUrl.release
tokenFly.config.baseURL = ApiBaseUrl[accountInfo.miniProgram.envVersion] ? ApiBaseUrl[accountInfo.miniProgram.envVersion] : ApiBaseUrl.release


//添加请求拦截器
fly.interceptors.request.use(async (request: any) => {
    //给所有请求头部添加appid
    request.headers['appid']= accountInfo.miniProgram.appId

    // 如果 body isNotPermission = true 则表示免权限
    // 免权限 则不用获取token 和 用户信息
    if (request.body && request.body.isNotPermission) {
      
    } else {
      //给所有请求添加自定义header
      let token = wx.getStorageSync(tokenName)
      if (token && token !== '') {
          request.headers[tokenName] = token
          if (!store.userInfo) {
            fly.interceptors.request.lock();
            await getUserinfo(token)
            fly.interceptors.request.unlock();//解锁后，会继续发起请求队列中的任务，详情见后面文档
            return request; //只有最终返回request对象时，原来的请求才会继续
          }
      } else {
          fly.interceptors.request.lock();
          token = await login()
          if (!store.userInfo) {
            await getUserinfo(token)
          }
          request.headers[tokenName] = token
          fly.interceptors.request.unlock();//解锁后，会继续发起请求队列中的任务，详情见后面文档
          return request; //只有最终返回request对象时，原来的请求才会继续
      }
    }

    
  	//终止请求
  	//var err=new Error("xxx")
  	//err.request=request
  	//return Promise.reject(new Error(""))
  
    //可以显式返回request, 也可以不返回，没有返回值时拦截器中默认返回request
    return request;
})
 
//添加响应拦截器，响应拦截器会在then/catch处理之前执行
fly.interceptors.response.use(
  function (response: any) {
    // 当响应报 token无效或过期时
    if (response.data.code === 'C501') {
      fly.interceptors.response.lock()
      const token = wx.getStorageSync(tokenName)
      // 检查当前token有效性， 无效则先去登陆换取新token， 有效则重新发起请求
      return tokenFly.get(`/util/checkSessionKey.do?sessionKey=${token}`)
      .then(async (result: { data: { code: string; data: any; }; }) => {
        if (result.data.code === 'C200') {
          if (!result.data.data) {
            await login()
          }
        }
        fly.interceptors.response.unlock()
      })
      .then(() => {
        // log(`重新请求：path:${response.request.url}，baseURL:${response.request.baseURL}`)
        return fly.request(response.request);
      })
    } else {
      //只将请求结果的data字段返回
      if (response.data.code === 'C500') {
        wx.showToast({
          title: response.data.message,
          icon: 'none'
        })
      }
      return response.data
    }
  },
  function (error: any) {
    //发生网络错误后会走到这里
    new Error(error)
    //return Promise.resolve("ssss")
  }
)

function login () {
  return new Promise((resolve: (arg0: string) => void, reject:() => void) => {
    wx.login({
      success (res) {
          if (res.code) {
            //发起网络请求
            return tokenFly.post('/sso/wxLogin.do', { code: res.code }).then((result: any) => {
                if(result.data.code === 'C200') {
                    wx.setStorageSync(tokenName, result.data.data.sessionKey)
                    resolve(result.data.data.sessionKey)
                }
            })
          } else {
            new Error('登录失败！' + res.errMsg)
            reject()
          }
      },
      fail (err) {
        new Error('登录失败！' + err)
        reject()
      }
    })
  })     
}

function getUserinfo (token: string) {
  return new Promise((resolve: () => void) => {
    tokenFly.get('/user/getUserInfo.do', {}, { headers: { tokenName: token } }).then((result: { data: any }) => {
      if(result.data.code === 'C200') {
          store.setUserInfo({ userInfo: result.data.data })
          resolve()
      } else if (result.data.code === 'C501') {
        // token 过期
        login().then((_token: string) => {
          getUserinfo(_token).then(() => {
            resolve()
          })
        })
      }
    })
  })
}

export default fly