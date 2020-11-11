import { observable, action } from 'mobx-miniprogram'


export const store:any = observable({

    // 数据字段
    userInfo: null,
    
  
    // 计算属性
    get sum() {
      return this.numA + this.numB
    },
  
    // actions
    update: action(function (this: any) {
      const sum = this.sum
      this.numA = this.numB
      this.numB = sum
    })
  
})