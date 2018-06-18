// pages/home/home.js

var app = getApp(),
  member = require("../../../service/member.js"),
  util = require("../../../utils/util.js")

Page({

  /**
   * 页面的初始数据
   */
  data: {

  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },


  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
  // makePoster() {
  //   wx.navigateTo({
  //     url: '../poster/poster',
  //   })
  // },

  bindgetuserinfo(e) {
    let that = this
    if (e.detail.errMsg.indexOf('fail') > -1) {
      wx.showToast({
        title: '请授权用户信息!',
        icon: 'none'
      })
    } else {
      new member(res => {
        util.navigateTo({
          url: '../poster/poster',
        })
      }).updateView({
        avatarUrl: e.detail.userInfo.avatarUrl,
        nickName: e.detail.userInfo.nickName/*  */
      })
    }
  },
  //分享
  onShareAppMessage: function (res) {
    var that = this;
    console.log(app.globalData.memberInfo.userId)
    if (res.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: '邀请您加入大王纸尿裤',
        imageUrl: 'https://www.sincereglobe.com/IMAGE/share.jpg',
        path: '/pages/home/join/join?extension=' + app.globalData.memberInfo.userId,
        success: function (res) {
          console.log('/pages/home/home?extension=' + app.globalData.memberInfo.userId)
          // 转发成功
          wx.showToast({
            title: '转发成功',
            icon: 'success'
          })
        },
        fail: function (res) {
          // 转发失败
        }
      }

    }
    return {
      title: '邀请您加入大王纸尿裤',
      imageUrl: 'https://www.sincereglobe.com/IMAGE/share.jpg',
      path: '/pages/home/join/join?extension=' + app.globalData.memberInfo.userId,
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: '转发成功',
          icon: 'success'
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})