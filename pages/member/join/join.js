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
    }).applyMember()
  },

  onShow: function() {
    new Member(res => {
      this.setData({
        userIsMember: res.data.userIsMember
      })
    }).view()
  },


  //加入会员
  bindgetuserinfo(e) {
    let that = this
    if (e.detail.errMsg.indexOf('fail') > -1) {
      wx.showToast({
        title: '请授权用户信息!',
        icon: 'none'
      })
    } else {
      new Member(res => {
        if (!this.data.userIsMember) {
          new Member(data => {
            wx.requestPayment({
              'timeStamp': data.data.timeStamp,
              'nonceStr': data.data.nonceStr,
              'package': data.data.package,
              'signType': 'MD5',
              'paySign': data.data.paySign,
              'success': function(res) {
                wx.showToast({
                  title: '恭喜您成为会员',
                  icon: 'success',
                  duration: 1000,
                  success: function() {
                    new Member(res => {
                      this.setData({
                        userIsMember: res.data.userIsMember
                      })
                    }).view()
                  }
                })
              },
              'fail': function(res) {}
            })
          }).payMember()
        } else {
          wx.showToast({
            title: '您已经是会员',
            icon: 'none'
          })
        }
      }).updateView({
        avatarUrl: e.detail.userInfo.avatarUrl,
        nickName: e.detail.userInfo.nickName /*  */
      })
    }
  },


  submit: function() { //提交

  }
})