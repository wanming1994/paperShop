//获取应用实例
var app = getApp()
var Member = require("../../../service/member.js")
var util = require("../../../utils/util")
var countdown = util.countdown //验证码计时
Page({
  data: {
    fee: 0
  },
  onLoad: function(info) {
    new Member(res => {
      this.setData({
        fee: res.data.fee
      })
    }).applyPartner()
  },

  onShow: function() {

  },


  //输入框变化
  bindgetuserinfo(e) {
    let that = this
    console.log(e)
    if (e.detail.errMsg.indexOf('fail') > -1) {
      wx.showToast({
        title: '请授权用户信息!',
        icon: 'none'
      })
    } else {
      new Member(res => {
        new Member(res=>{

        }).payPartner()
      }).updateView({
        avatarUrl: e.detail.userInfo.avatarUrl,
        nickName: e.detail.userInfo.nickName /*  */
      })
    }
  },


  submit: function() { //提交

  }
})