//获取应用实例
var app = getApp()
var Order = require('../../../service/order.js')
var util = require('../../../utils/util')
var actionsheet = require('../../../template/actionsheet/actionsheet.js')
var payTemp = require("../../../template/password/payPassword")
var Balance = require("../../../service/balance.js")
var getPwd = require("../../../utils/getPassword.js")
var util = require("../../../utils/util.js")

Page(Object.assign({}, actionsheet, payTemp, {
  data: {
    winHeight: 0,//设备高度度
    all: [],//全部
    unpaid: [],//待支付
    unreciver: [],//待签收
    unreview: [],//待评价
    unshipped: [],//待发货
    currentTab: 0,//显示全部
    p501Tips: '下拉刷新',
    p0Tips: '下拉刷新',
    p201Tips: '下拉刷新',
    p402Tips: '下拉刷新',
    p300Tips: '下拉刷新',
    sType: ["p501", "p0", "p201", "p300", "p402"],
    scroll: [0, 0, 0, 0, 0],
    isPay: false
  },
  bindChange: function (e) {//滑动选项卡
    var that = this;
    that.setData({ currentTab: e.detail.current });
  },
  swichNav: function (e) {//点击选项卡
    var that = this;
    if (this.data.currentTab === e.currentTarget.dataset.current) {
      return false;
    } else {
      that.setData({
        currentTab: e.currentTarget.dataset.current
      })
    }
  },
  touchstart: function (e) {
    this.data.startTouches = e.changedTouches[0]
  },
  touchmove: function (e) {
    this.data.moveTouches = e.changedTouches[0]
  },
  touchend: function (e) {
    let index = this.data.currentTab,
      sTypeList = this.data.sType,
      startTouch = this.data.startTouches,
      Y = e.changedTouches[0].pageY - startTouch.pageY,
      X = Math.abs(e.changedTouches[0].pageX - startTouch.pageX)

    if (this.data.scroll[index] > 10) {
      return false
    }
    this.data.endTouches = e.changedTouches[0]
    if (Y > 50 && X < 200) {
      if (wx.startPullDownRefresh) {
        wx.startPullDownRefresh()
        paging(this, sTypeList[index], 'up', function () {
          wx.stopPullDownRefresh()
        })
      } else {
        wx.showLoading({
          title: '加载中...',
        })
        paging(this, sTypeList[index], 'up', function () {
          wx.hideLoading()
        })
      }
    }
  },
  onPullDownRefresh() {
    let index = this.data.currentTab,
      sTypeList = this.data.sType
    paging(this, sTypeList[index], 'up', function () {
      wx.stopPullDownRefresh()
    })
  },
  scroll: function (e) {
    let index = this.data.currentTab
    this.data.scroll[index] = e.detail.scrollTop
  },
  lower: function () {
    var index = this.data.currentTab
    var sTypeList = this.data.sType
    paging(this, sTypeList[index], 'down')
  },
  onLoad: function (options) {//页面加载
    var that = this;
    var id = options.id ? options.id : 0
    var systemInfo = wx.getSystemInfoSync()
    this.ActionsheetSet({
      item: [
        {
          name: '支付类型',
          content: '转账',
          more: false,
          fn: '',
          index: 0,
          data: null
        },
        {
          name: '付款方式',
          content: '微信支付',
          more: true,
          fn: 'changeMethod',
          index: 1,
          data: null
        }
      ]
    })

    this.PayTempSet({
      iconFn: 'returnChangeMethod'
    })
    this.setData({
      currentTab: id,
      winHeight: systemInfo.windowHeight
    })
  },
  onShow() {
    var that = this
    var id = that.data.currentTab
    paging(that, that.data.sType[id], 'up', function () {
      for (var i = 0; i < that.data.sType.length; i++) {
        if (i == id) { continue }
        paging(that, that.data.sType[i], 'up')
      }
    })
  },
  PayTempSuccess(val) {
    var that = this
    var sTypeList = this.data.sType
    var index = this.data.currentTab
    var sn = this.ActionsheetGetItem(1).sn
    wx.showToast({
      title: '支付请求中',
      icon: 'loading',
      mask: true,
      duration: 50000
    })
    getPwd(val, function (pwd) {
      new Order(function (data) {
        wx.showToast({
          title: data.message.content,
          icon: 'success'
        })
        setTimeout(() => {
          util.navigateTo({
            url: '/pages/pay/success?sn=' + sn
          })
        }, 500)
        paging(that, sTypeList[index], 'up')
        that.PayTempClose()
      }, function () {
        that.PayTempClear()
      }).paymentSubmit({
        paymentPluginId: 'balancePayPlugin',
        enPassword: pwd,
        sn: sn
      })
    })
  },
  returnChangeMethod() {
    this.PayTempClose()
    this.ActionsheetShow()
  },
  changeMethod() {//修改支付方式
    var data = ['微信支付', '余额支付'], that = this
    wx.showActionSheet({
      itemList: data,
      success: function (res) {
        if (typeof res.tapIndex !== 'undefined') {
          that.ActionsheetSetItem({
            fn: 'changeMethod',
            content: data[res.tapIndex],
            more: true,
            data: {
              type: res.tapIndex == 0 ? 'weixinPayPlugin' : 'balancePayPlugin',
              sn: that.ActionsheetGetItem(1).sn
            }
          }, 1)
        }
      },
      fail: function (res) {
        that.ActionsheetSetItem({ content: data[0] }, 1)
      }
    })
  },
  weixinPayCanClick: true,
  actionsheetConfirm(e) {//弹框确定
    var selectData = this.ActionsheetGetItem(1)
    var that = this
    var sTypeList = this.data.sType
    var index = this.data.currentTab
    if (selectData.type == 'weixinPayPlugin') {
      if (!this.weixinPayCanClick) {
        return
      }
      that.weixinPayCanClick = false
      new Order(function (data) {
        wx.requestPayment({
          'timeStamp': data.data.timeStamp,
          'nonceStr': data.data.nonceStr,
          'package': data.data.package,
          'signType': data.data.signType,
          'paySign': data.data.paySign,
          'success': function (res) {
            that.weixinPayCanClick = true
            paging(that, sTypeList[index], 'up')
            this.ActionsheetHide()
          },
          'fail': function (res) {
            that.weixinPayCanClick = true

          },
          'complete': function () {
            that.weixinPayCanClick = true
          }
        })
      }).paymentSubmit({
        paymentPluginId: 'weixinPayPlugin',
        sn: selectData.sn
      })
      return
    }
    this.ActionsheetHide()
    this.PayTempShow()
  },

  //用于表单提交模板推送
  formSubmit(e) {

    var formId = e.detail.formId;
    var info = e.detail.target.dataset.info
    var sTypeList = this.data.sType
    var index = this.data.currentTab
    var that = this
    if (that.data.isPay) {
      return
    }
    wx.showToast({
      title: '信息获取中',
      icon: 'loading',
      duration: 50000
    })
    that.setData({
      isPay: true
    })
    setTimeout(function () {
      that.setData({
        isPay: false
      })
    }, 2000)
    new Order((data) => {
      wx.hideToast()
      wx.requestPayment({
        'timeStamp': data.data.timeStamp,
        'nonceStr': data.data.nonceStr,
        'package': data.data.package,
        'signType': 'MD5',
        'paySign': data.data.paySign,
        'success': function (res) {
          wx.showToast({
            title: '支付成功',
            icon: 'success',
            duration: 1000,
            success: function () {
              wx.redirectTo({
                url: '/pages/pay/success?orderId=' + info
              })
            }
          })
        },
        'fail': function (res) {
        }
      })

    }).goPay({
      orderId: info,
      userScore: 0
    })
  },

  methodBtn(e) {
    var info = e.currentTarget.dataset.info
    var opType = e.currentTarget.dataset.type
    var sTypeList = this.data.sType
    var index = this.data.currentTab
    var that = this
    if (!opType || !info) return
    switch (opType) {
      case 'refund'://取消订单
        wx.showModal({
          title: '提示',
          content: '是否确认取消该订单',
          success: function (res) {
            if (res.confirm) {
              new Order((data) => {
                wx.showToast({
                  title: '取消成功',
                  icon: 'success',
                  duration: 1000
                })
                paging(that, sTypeList[index], 'up')
              }).cancelOrder({
                orderId: info
              })
            } else if (res.cancel) {

            }
          }
        })
        break;
      case 'return'://退货
        wx.showModal({
          title: '提示',
          content: '是否确认申请退货',
          success: function (res) {
            if (res.confirm) {
              new Order((data) => {
                wx.showToast({
                  title: data.message.content,
                  icon: 'success',
                  duration: 1000
                })
                paging(that, sTypeList[index], 'up')
              }).return({
                id: info
              })
            } else if (res.cancel) {

            }
          }
        })
        break;
      case 'confirm'://签收
        wx.showModal({
          title: '提示',
          content: '是否确认收货',
          success: function (res) {
            if (res.confirm) {
              new Order((data) => {
                wx.showToast({
                  title: '签收成功',
                  icon: 'success',
                  duration: 1000
                })
                paging(that, sTypeList[index], 'up')
              }).confirm({
                orderId: info
              })
            } else if (res.cancel) {

            }
          }
        })
        break;
      case 'delete'://删除订单
        wx.showModal({
          title: '提示',
          content: '是否确认删除该订单，删除后不可恢复',
          success: function (res) {
            if (res.confirm) {
              new Order((data) => {
                wx.showToast({
                  title: '删除成功',
                  icon: 'success',
                  duration: 1000
                })
                paging(that, sTypeList[index], 'up')
              }).deleteOrder({
                orderId: info
              })
            } else if (res.cancel) {

            }
          }
        })
        break;
      case 'remind'://提醒卖家发货/退货
        new Order((data) => {
          wx.showToast({
            title: data.message.content,
            icon: 'success',
            duration: 1000
          })
        }).remind({
          id: info
        })
        break;
      case 'evaluate':// 前去评价
        util.navigateTo({
          url: 'orderEvaluate/orderEvaluate?id=' + info,
        })
        break;
      case 'waitpay'://付款
        wx.showToast({
          title: '信息获取中',
          icon: 'loading',
          duration: 50000
        })
        new Order((res) => {
          new Order((data) => {
            wx.hideToast()
            that.ActionsheetSet({ "header": "￥" + data.data.amount.toFixed(2) })
            that.ActionsheetSetItem({ content: data.data.memo }, 0)
            that.ActionsheetSetItem({
              fn: data.data.useBalance ? 'changeMethod' : '',
              content: '微信支付',
              more: data.data.useBalance,
              data: {
                type: 'weixinPayPlugin',
                sn: res.data
              }
            }, 1)
            that.ActionsheetShow()
          }).paymentView({
            sn: res.data
          })
        }).tradePayment({
          id: info
        })
        break;
      case 'logistics':
        util.navigateTo({
          url: '/pages/member/order/logistics/logistics?no=' + info,
        })
        break;
    }
  },
  pageModel: {
    'p501': {
      pageNumber: 0,
      pageSize: 10,
      totalPages: 999
    },
    'p0': {
      pageNumber: 0,
      pageSize: 10,
      totalPages: 999
    },
    'p201': {
      pageNumber: 0,
      pageSize: 10,
      totalPages: 999
    },
    'p402': {
      pageNumber: 0,
      pageSize: 10,
      totalPages: 999
    },
    'p300': {
      pageNumber: 0,
      pageSize: 10,
      totalPages: 999
    }
  }
}))

function paging(that, sType, direction, cb) {
  var tips = that.data[sType + 'Tips']
  var info = that.data[sType]
  if (direction == 'up') {
    info = []
  }
  if (direction !== 'up' && that.pageModel[sType].pageNumber + 1 > that.pageModel[sType].totalPages) {
    return
  }
  that.setData({
    [sType + 'Tips']: '加载中...'
  })
  new Order(function (data) {
    that.pageModel[sType].totalPages = data.data.pageModel.totalPages
    if (data.data.pageModel.totalPages == 0) {
      that.setData({
        [sType + 'Tips']: '您还没有相关的订单！',
        [sType]: []
      })
      cb ? cb() : ''
      return
    }
    info = info.concat(data.data.data)
    if (data.data.pageModel.totalPages <= data.data.pageModel.pageNumber) {
      that.setData({
        [sType + 'Tips']: '没有更多啦~',
        [sType]: info
      })
      if (data.data.pageModel.totalPages < data.data.pageModel.pageNumber) {
        cb ? cb() : ''
        return
      }
    } else {
      that.setData({
        [sType + 'Tips']: "上拉加载",
        [sType]: info
      })
    }
    cb ? cb() : ''
  }).list({
    type: sType.substr(1),
    pageNumber: direction == 'up' ? that.pageModel[sType].pageNumber = 1 : ++that.pageModel[sType].pageNumber,
    pageSize: that.pageModel[sType].pageSize
  })
}

