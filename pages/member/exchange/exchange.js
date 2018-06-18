
var app = getApp()
var product = require("../../../service/product.js")
var order = require("../../../service/order.js")
var member = require("../../../service/member.js")
var util = require("../../../utils/util")
Page({

  /**
   * 页面的初始数据
   */
  data: {
    size: 5,
    selectDataCount: 1,
    showAction: false
  },
  toHistory() {
    util.navigateTo({
      url: './history'
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    new product(function (data) {
      that.setData({
        exchangeList: data.data.exchangeGoodsList,
        size: that.data.size,
        page: 1
      });
    }).exchangeList({
      page: 1,
      size: that.data.size
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    new member(function (data) {
      if (data.data.mobile) {
        that.setData({
          canExc: true
        })
      } else {
        that.setData({
          canExc: false
        })
      }
    }).view()
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  //兑换提交
  goExchange: function (e) {
    console.log(e.currentTarget.dataset.index)
    this.setData({
      selectProduct: this.data.exchangeList[e.currentTarget.dataset.index],
      selectId: e.currentTarget.dataset.id,
      price: e.currentTarget.dataset.price,
      showAction: true,
      calcAmount: this.data.exchangeList[e.currentTarget.dataset.index].retail_price
    })



  },
  catchActionMask(e) {
    return false;
  },
  //弹出框toggle
  toggleMask(t) {
    this.setData({
      showAction: false,
    })
  },
  paySubmitSel(e) {
    var that = this;
    var price = parseInt(this.data.price);
    var count = parseInt(this.data.selectDataCount);
    var totalAmount = price * count
    if (that.data.canExc) {
      wx.showModal({
        title: '兑换提示',
        content: '确认花费' + totalAmount + '积分兑换商品吗?',
        success: function (res) {
          if (res.confirm) {
            new order(function (res) {
              wx.showToast({
                title: '兑换成功',
                duration: 1000
              })
              that.setData({
                showAction: false
              })
            }).submit({
              goodsId: that.data.selectId,
              goodsAmount: that.data.selectDataCount,
              orderType: 1
            })
          }
        }
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '绑定手机后才可兑换商品，是否前去绑定',
        cancelText: '取消',
        confirmText: '立即前去',
        success: function (res) {
          if (res.confirm) {
            util.navigateTo({
              url: '/pages/member/bind/bind',
            })
          } else if (res.cancel) {
            console.log('用户点击取消')
          }
        }
      })
    }
  },

  //立即购买选择数量
  revisenum(e) {
    let stype = e.currentTarget.dataset.btype,
      min = 0,
      goodsAmount = parseInt(this.data.selectDataCount) || 0
    switch (stype) {
      case 'input':
        goodsAmount = (e.detail.value < 1) ? 1 : e.detail.value
        break;
      case 'add':
        goodsAmount = goodsAmount + 1
        break;

      case 'reduce':
        goodsAmount = goodsAmount - 1 < 1 ? 1 : --goodsAmount
        break;
    }
    this.setData({
      "selectDataCount": goodsAmount,
      calcAmount: goodsAmount * (this.data.price)
    })
  },
  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    var that = this;
    wx.showNavigationBarLoading();  //加载的状态
    new product(function (data) {
      var exchangeList = data.data.exchangeGoodsList
      that.setData({
        exchangeList: exchangeList,
        size: that.data.size,
        page: 1
      });
      if (data.data.exchangeGoodsList.length == 0) {
        that.setData({
          tips: '没有更多啦~',
          showtips: false
        })
      }
      wx.stopPullDownRefresh()
      wx.hideNavigationBarLoading()
    }).exchangeList({
      size: that.data.size,
      page: 1
    });
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    var that = this;
    wx.showNavigationBarLoading();
    var page = this.data.page;
    var exchangeList = this.data.exchangeList;
    new product(function (data) {
      wx.hideNavigationBarLoading() //完成停止加载
      if (data.data.exchangeGoodsList.length < that.data.size) {
        that.setData({
          tips: '没有更多啦~',
          showtips: false
        })
      } else {
        exchangeList = exchangeList.concat(data.data.exchangeGoodsList)
        that.setData({
          exchangeList: exchangeList,
          loading: false,
          tips: '努力加载中',
          showtips: false,
          page: page
        })
      }
    }).exchangeList({
      size: that.data.size,
      page: ++page
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})