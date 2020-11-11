/// <reference path="../node_modules/miniprogram-api-typings/index.d.ts" />

interface IAppOption {
  globalData: {
    userInfo?: WechatMiniprogram.UserInfo,
  },
  userInfoReadyCallback?: WechatMiniprogram.GetUserInfoSuccessCallback,
  createMediaQueryObserver?():any,
}

interface ResponseData {
  code: string,
  data: any,
  message: string
}