//获取应用实例
var app = getApp()
var Order = require('../../../../service/order.js')
var util = require('../../../../utils/util')
var actionsheet = require('../../../../template/actionsheet/actionsheet')
var payTemp = require("../../../../template/password/payPassword")
var Balance = require("../../../../service/balance.js")
var getPwd = require("../../../../utils/getPassword.js")
var util = require("../../../../utils/util.js")
var config = require("../../../../utils/config.js")

var getData = function (that, id) {
  var details = []
  new Order((data) => {
    details = data.data;
    var baseUrl = config.BASE_URL;
    var logType = ''
    var log = []
    // for (var i = 0; i < details.orderLogs.length; i++) {
    //   if (logType !== details.orderLogs[i].type) {
    //     log.push(details.orderLogs[i])
    //   }
    //   logType = details.orderLogs[i].type
    // }
    // details.orderLogs = log
    that.setData({
      details: details,
      pickUpcodeUrl: baseUrl + details.pickUpCodeUrl
    })

    if (details.orderInfo.order_status_text == '未付款') {
      that.ActionsheetSet({
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
          },
        ]
      })
      that.PayTempSet({
        iconFn: 'returnChangeMethod'
      })
    }
  }).view({ orderId: id })
}
Page(Object.assign({}, actionsheet, payTemp, {

  /**
   * 页面的初始数据
   */
  data: {
    details: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var id = options.id
    this.setData({
      id: id
    })
    getData(this, id)

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
        getData(that, that.data.id)
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
        that.ActionsheetSetItem({ content: data[0] })
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
            getData(that, that.data.id)
            that.ActionsheetHide()
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
    that.ActionsheetHide()
    that.PayTempShow()
  },

  //用于表单提交模板推送
  formSubmit(e) {

    var formId = e.detail.formId;
    var info = e.detail.target.dataset.info
    var sTypeList = this.data.sType
    var index = this.data.currentTab
    var that = this
    wx.showToast({
      title: '信息获取中',
      icon: 'loading',
      duration: 50000
    })
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
                  title: data.message.content,
                  icon: 'success',
                  duration: 1000
                })
                getData(that, that.data.id)
              }).refund({
                id: info
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
                getData(that, that.data.id)
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
                getData(that, that.data.id)
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
              }).confirm({
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

  //进商品详情
  goProductDetails: function (e) {
    var productId = e.currentTarget.dataset.id;
    util.navigateTo({
      url: '/pages/home/productDetails/productDetails?id=' + productId
    })
  },
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
}))