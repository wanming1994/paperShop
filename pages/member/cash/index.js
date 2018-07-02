// pages/member/cash/index.js
let member = require("../../../service/member.js"),
  app = getApp(),
  util = require("../../../utils/util.js")
Page({

  /**
   * 页面的初始数据
   */
  data: {},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  input(e) {
    this.setData({
      cashAmount: e.detail.value
    })
  },
  cashAll() {
    this.setData({
      cashAmount: this.data.money
    })
  },
  cashSubmit() {
    if (!this.data.cashAmount) {
      wx.showToast({
        title: '请输入提现金额',
        icon: 'none'
      })
    } else if (this.data.cashAmount > this.data.money) {
      wx.showToast({
        title: '超出可提现金额',
        icon: 'none'
      })
    } else {
      new member(res => {
        wx.showToast({
          title: '提现成功',
          icon: 'none'
        })
        setTimeout(function() {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      }).getscoreProductt({
        money: this.data.cashAmount
      })
    }
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
    new member(res => {
      this.setData({
        money: res.data.bonus
      })
    }).view()
  }
})