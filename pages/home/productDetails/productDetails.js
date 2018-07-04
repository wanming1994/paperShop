let swiperAutoHeight = require("../../../template/swiperProduct/swiper.js"),
  Cart = require("../../../service/cart.js"),
  Product = require("../../../service/product.js"),
  order = require("../../../service/order.js"),
  WxParse = require('../../wxParse/wxParse.js'),
  app = getApp(),
  util = require("../../../utils/util.js")


function getRandomColor() {
  let rgb = []
  for (let i = 0; i < 3; ++i) {
    let color = Math.floor(Math.random() * 256).toString(16)
    color = color.length == 1 ? '0' + color : color
    rgb.push(color)
  }
  return '#' + rgb.join('')
}

Page(Object.assign({}, swiperAutoHeight, {

  onReady: function (res) {
    this.videoContext = wx.createVideoContext('myVideo')
  },
  inputValue: '',
  bindInputBlur: function (e) {
    this.inputValue = e.detail.value
  },
  /**
   * 页面的初始数据
   */
  data: {
    goodsAmount: 1,
    sys: app.globalData.sys,//系统信息
    productData: {},//数据
    showAction: false,//显示弹窗
    buyType: 'buy',//buy or cart
    specification: {},//商品规格
    canClick: [],
    pageLoad: false,//页面加载完成
    userScoreInput: 0,//付款使用积分
    scoreMax: 0,//可用积分
    selectData: {},//选中规格
    showShortcut: false
  },
  catchActionMask(e) {
    return false;
  },
  onLoad: function (options) {
    if (app.globalData.LOGIN_STATUS) {
      this.getData(options)
    } else {
      app.loginOkCallbackList.push(() => {
        this.getData(options)
      })
    }

  },
  getData(options) {
    console.log(app.globalData.LOGIN_STATUS)
    let that = this;
    let id = options.id;
    this.data.id = id;
    var extension = options.extension;
    if (options.extension) {
      wx.setStorageSync('extension', options.extension)
    }
    new Product((res) => {
      wx.setNavigationBarTitle({
        title: res.data.info.name
      })
      var introduction = res.data.info.goods_desc
      this.setData({
        productData: res.data,
        introduction: res.data.info.goods_desc,
        productList: res.data.productList,
        selectData: {
          id: res.data.productList[0] ? res.data.productList[0].id : '',
          number: res.data.productList[0] ? res.data.productList[0].goods_number : '',
          goodsid: res.data.productList[0] ? res.data.productList[0].goods_id : '',
          value: res.data.productList[0] ? res.data.productList[0].goods_specification_value : '',
          count: 1,
          retail_price: res.data.productList[0] ? res.data.productList[0].retail_price : '',
          member_price: res.data.productList[0] ? res.data.productList[0].member_price : '',
        }
      })

      if (introduction != null) {
        WxParse.wxParse('introduction', 'html', introduction, that, 5);
      }
      setTimeout(res => {
        this.setData({
          pageLoad: true
        })
      }, 200)
    }).view({
      id: id
    })
  },
  checkout(e) {
    this.data.selectData = Object.assign(this.data.selectData, e.currentTarget.dataset)
    this.setData({
      selectData: this.data.selectData
    })
  },
  //快捷导航点击事件
  openShortcut: function () {
    this.setData({
      showShortcut: !this.data.showShortcut
    })
  },
  //弹出框toggle
  toggleMask(t) {
    this.setData({
      showAction: t === undefined || t.currentTarget ? !this.data.showAction : t,
      buyType: (t.currentTarget && t.currentTarget.dataset.type) || this.data.buyType
    })
  },
  //立即购买选择数量
  revisenum(e) {
    let stype = e.currentTarget.dataset.btype,
      min = 0,
      goods_number = parseInt(this.data.selectData.number || this.data.productData.info.goods_number),
      goodsAmount = parseInt(this.data.selectData.count) || 0
    switch (stype) {
      case 'input':
        goodsAmount = (!isNaN(e.detail.value) && e.detail.value >= min && e.detail.value <= goods_number) ? e.detail.value : goodsAmount
        break;
      case 'add':
        goodsAmount = goodsAmount + 1 <= goods_number ? goodsAmount + 1 : goods_number
        break;


      case 'reduce':
        goodsAmount = goodsAmount - 1 < min ? min : --goodsAmount
        break;
    }
    this.setData({
      "selectData.count": goodsAmount
    })
  },
  //进入购物车
  toCart() {
    this.setData({
      showAction: false
    })
    wx.switchTab({
      url: '/pages/cart/cart',
    })
  },

  /**
  * 页面上拉触底事件的处理函数
  */
  onReachBottom: function () {

  },
  paySubmitSel() {
    if (!this.data.selectData.count) return

    new Cart(res => {
      if (this.data.buyType === 'buy') {
        util.navigateTo({
          url: '/pages/pay/orderPay',
        })
      } else {
        this.toggleMask(false);
        wx.showToast({
          title: '加入成功',
          duration: 1000
        })
      }
    }, function (err) {
      // if (err.errmsg == '会员才能购买') {
      //   wx.hideToast()

      //   wx.showModal({
      //     title: '提示',
      //     content: '成为会员才可购买商品，是否立即成为会员?',
      //     success: function (res) {
      //       if (res.confirm) {
      //         wx.navigateTo({
      //           url: '../join/join',
      //         })
      //       }
      //     }
      //   })
      // }
    }).add({
      productId: this.data.selectData.goodsid,
      speid: this.data.selectData.id,
      count: this.data.selectData.count,
      type: this.data.buyType,
    })
  },
  //立即购买确认按钮
  paySubmit: function () {
    let that = this;
    wx.showLoading()
    //创建订单submit
    new order(function (res) {
      wx.hideLoading()
      that.setData({
        userScoreInput: res.data.userScore,
        scoreMax: parseInt(res.data.userScore),
        showBuyDetail: true,
        showAction: false,
        actual_price: res.data.orderInfo.actual_price,
        orderId: res.data.orderInfo.id
      })

      //计算初始积分抵扣现金（默认使用最大积分来抵现）
      new order(function (data) {
        that.setData({
          scoreMoney: data.data.scoreMoney < that.data.actual_price ? data.data.scoreMoney : that.data.actual_price,
          trueAmount: res.data.orderInfo.actual_price - data.data.scoreMoney >= 0 ? res.data.orderInfo.actual_price - data.data.scoreMoney : 0
        })
      }).calPoint({
        useScore: res.data.userScore
      })

    }).submit({
      goodsId: that.data.productData.info.id,
      goodsAmount: that.data.goodsAmount,
      orderType: 0
    })
  },
  //去付款
  toBuyConfirm() {
    let that = this;
    //发起支付接口
    new order(function (data) {
      that.setData({
        showBuyDetail: false,
        showAction: false,
      })
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
            duration: 1000
          })
        },
        'fail': function (res) {
        }
      })
    }).goPay({
      orderId: that.data.orderId,
      userScore: that.data.userScoreInput
    })

  },
  closeMask() {
    this.setData({
      showBuyDetail: false,
      showAction: false,
    })
  },
  //付款输入积分
  userScoreInput(e) {
    let that = this;
    let val = parseInt(e.detail.value)
    let userScoreInput = val > this.data.scoreMax ? this.data.scoreMax : val
    new order(function (data) {
      that.setData({
        scoreMoney: data.data.scoreMoney,
        userScoreInput: userScoreInput ? userScoreInput : 0,
        // trueAmount: userScoreInput ? this.data.actual_price - userScoreInput : this.data.actual_price,
        trueAmount: that.data.actual_price - data.data.scoreMoney >= 0 ? that.data.actual_price - data.data.scoreMoney : 0
      })
    }).calPoint({
      useScore: userScoreInput ? userScoreInput : 0
    })

  },
  toggleshowShortcut: function () {
    this.setData({
      showShortcut: false
    })
  },
  //海报分享
  goShare() {
    wx.navigateTo({
      url: 'poster/poster?id=' + this.data.id,
    })
  },

  onShareAppMessage: function (res) {
    var that = this;
    this.setData({
      showShortcut: !this.data.showShortcut
    })
    if (res.from === 'button') {
      // 来自页面内转发按钮
      return {
        title: that.data.title,
        path: 'pages/home/productDetails/productDetails?id=' + that.data.id + '&extension=' + app.globalData.memberInfo.userId,
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
    return {
      title: that.data.title,
      path: 'pages/home/productDetails/productDetails?id=' + that.data.id + '&extension=' + app.globalData.memberInfo.userId,
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
  },

}))