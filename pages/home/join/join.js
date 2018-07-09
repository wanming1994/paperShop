let order = require("../../../service/order.js"),
  member = require("../../../service/member.js"),
  app = getApp(),
  util = require("../../../utils/util.js")
// pages/home/join/join.js
Page({

  /**
   * 页面的初始数据
   */
  data: {

  },
  // bindgetuserinfo(e) {
  //   let that = this
  //   console.log(e)
  //   if (e.detail.errMsg.indexOf('fail') > -1) {
  //     wx.showToast({
  //       title: '请授权用户信息!',
  //       icon: 'none'
  //     })
  //   } else {
  //     new member(res => {
  //       wx.showModal({
  //         title: '提示',
  //         content: '确认成为“' + that.data.recommendUser + '”的会员',
  //         success: function (res) {
  //           if (res.confirm) {
  //             var that = this;
  //             new order(function (res) {
  //               new member(res => {
  //                 if (res.data.mobile) {
  //                   new member(res => {
  //                     wx.navigateTo({
  //                       url: '../productDetails/productDetails?id=' + res.data.id,
  //                     })
  //                   }).getscoreProductt()
  //                 } else {
  //                   util.navigateTo({
  //                     url: '../../member/bind/bind?where=member',
  //                   })
  //                 }
  //               }).view()
  //               // wx.showToast({
  //               //   title: '加入成功',
  //               //   icon: 'success',
  //               //   duration: 1000
  //               // })
  //               // setTimeout(function () {
  //               //   wx.switchTab({
  //               //     url: '/pages/home/home',
  //               //   })
  //               // }, 1500)
  //             }, function (err) {
  //               if (err.errno == 1 && err.errmsg == '你已经是会员了') {
  //                 setTimeout(function () {
  //                   wx.switchTab({
  //                     url: '/pages/home/home',
  //                   })
  //                 }, 500)
  //               }
  //             }).submit({
  //               orderType: 3,
  //               recommendUserId: wx.getStorageSync('extension') ? wx.getStorageSync('extension') : ''
  //             })
  //           }
  //         }
  //       })
  //     }).updateView({
  //       avatarUrl: e.detail.userInfo.avatarUrl,
  //       nickName: e.detail.userInfo.nickName/*  */
  //     })
  //   }
  // },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.LOGIN_STATUS) {
      this.getData(options)
    } else {
      app.loginOkCallbackList.push(() => {
        this.getData(options)
      })
    }
  },

  getData(options) {
    var that = this;
    if (options.extension) {
      wx.setStorageSync('extension', options.extension);
    }
    new member(function(data) {
      that.setData({
        recommendUser: data.data.userName
      })
    }).getUserName({
      userId: wx.getStorageSync('extension') ? wx.getStorageSync('extension') : ''
    })
    new member(function(res) {
      if (res.data.userIsMember != 1) {
        //创建订单submit
        new order(function(res) {
          wx.showToast({
            title: '恭喜您成为会员',
            icon: 'success',
            duration: 1000
          })
        }, function(err) {
          if (err.errno == 1 && err.errmsg == '你已经是会员了') {
            setTimeout(function() {
              wx.switchTab({
                url: '/pages/home/home',
              })
            }, 500)
          }
        }).submit({
          orderType: 3,
          recommendUserId: wx.getStorageSync('extension') ? wx.getStorageSync('extension') : ''
        })
      } else {
        setTimeout(function() {
          wx.switchTab({
            url: '/pages/home/home',
          })
        }, 1)
      }
    }).view()
  },

  goHome: function() {
    wx.switchTab({
      url: '/pages/home/home',
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  }
})