let app = getApp(),
  util = require("../../utils/util.js"),
  member = require("../../service/member.js"),
  coupon = require("../../service/coupon.js")
Page({
  data: {
    memberInfo: app.globalData.memberInfo
  },
  onLoad: function (options) {

  },
  onReady: function () {

  },

  onShow: function () {
    var that = this;
    if (app.globalData.LOGIN_STATUS) {
      this.getInfoWhenLogin()
    } else {
      app.loginOkCallbackList.push(() => {
        this.getInfoWhenLogin()
      })
    }
  },
  getInfoWhenLogin: function () {
    var that = this;
    // that.setData({
    //   memberInfo:app.globalData.memberInfo
    // })
    new member(function (data) {
      that.setData({
        memberInfo: data.data
      })
    }).view()

    //优惠券数量
    new coupon(function (data) {
      that.setData({
        couponLength: data.data.length
      })
    }).list()

    // if (!wx.getStorageSync("isGetUserInfo")) {
    //   wx.getUserInfo({
    //     success: function (res) {
    //       new member(function () {
    //         wx.setStorageSync("isGetUserInfo", true)
    //       }, function () {
    //         wx.setStorageSync("isGetUserInfo", true)
    //       }).updateView({
    //         userInfo: res.userInfo
    //       })
    //       // that.setData({
    //       //   authSuccess: true,
    //       //   userInfo: res.userInfo
    //       // })
    //     },
    //     fail: function (err) {
    //       wx.setStorageSync("isGetUserInfo", false)
    //       if (err.errMsg.indexOf('auth') > -1) {
    //         wx.showModal({
    //           title: '提示',
    //           content: '未授予用户信息权限，部分功能会受到限制，是否前往设置',
    //           success: function (res) {
    //             if (res.confirm) {
    //               wx.openSetting()
    //             }
    //           }
    //         })
    //       }
    //     }
    //   })
    // }
  },
  getGoods() {
    util.navigateTo({
      url: 'getGoods/getGoods',
    })
  },

  //个人资料
  toInfo: function () {
    util.navigateTo({
      url: 'info/info',
    })
  },
  //积分兑换
  goExchange: function () {
    util.navigateTo({
      url: 'point/index',
    })
  },
  goCoupon: function () {
    util.navigateTo({
      url: 'coupon/list',
    })
  },
  //我的影响力
  toMyInfluence: function () {
    util.navigateTo({
      url: 'influence/influence',
    })
  },
  //分享
  goShare: function () {
    util.navigateTo({
      url: 'share/share',
    })
  },
  //绑定手机
  bindPhone: function () {
    if (this.data.memberInfo.mobile) {
      util.errShow('您已绑定')
    } else {
      util.navigateTo({
        url: 'bind/bind',
      })
    }

  },

  //我的订单
  toOrder: function (e) {
    var id = e.currentTarget.dataset.current
    util.navigateTo({
      url: 'order/order?id=' + id,
    })
  },
  bindgetuserinfo(e) {
    let that = this
    console.log(e)
    if (e.detail.errMsg.indexOf('fail') > -1) {
      wx.showToast({
        title: '请授权用户信息!',
        icon: 'none'
      })
    } else {
      new member(res => {
        wx.showToast({
          title: '授权成功',
          icon: 'none'
        })
        new member(function (data) {
          that.setData({
            memberInfo: data.data
          })
        }).view()
      }).updateView({
        avatarUrl: e.detail.userInfo.avatarUrl,
        nickName: e.detail.userInfo.nickName/*  */
      })
    }
  },
})