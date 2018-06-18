// pages/home/home.js

let swiperAutoHeight = require("../../template/swiper/swiper.js"),
  Product = require("../../service/product.js"),
  Cart = require("../../service/cart.js"),
  Coupon = require("../../service/coupon.js"),
  member = require("../../service/member.js"),
  Tenant = require("../../service/tenant.js"),
  Ad = require("../../service/ad.js"),
  app = getApp(),
  util = require("../../utils/util.js")
Page(Object.assign({}, swiperAutoHeight, {
  data: {
    imgUrls: [
      'https://www.sincereglobe.com/IMAGE/BANNER1.jpg',
      'https://www.sincereglobe.com/IMAGE/BANNER2.jpg'
    ],
    indicatorDots: false,
    autoplay: true,
    interval: 4000,
    duration: 1000,
    winHeight: wx.getSystemInfoSync().windowHeight,
    showIndex: 0,
    isShow: false,
    startTouches: {},
    moveTouches: {},
  },
  //邀请
  joinUs: function () {
    new member(function (res) {
      if (res.data.userIsMember == 1) {
        util.navigateTo({
          url: '/pages/member/share/share'
        })
      } else {
        util.navigateTo({
          url: 'join/join'
        })
      }
    }).view()
  },

  //视频
  goVideo: function () {
    util.navigateTo({
      url: '/pages/home/video/video',
    })
  },

  //商品详情
  goProductDeatil: function (e) {
    var id = e.currentTarget.dataset.id;
    util.navigateTo({
      url: '/pages/home/productDetails/productDetails?id=' + id,
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.LOGIN_STATUS) {
      this.getData(options)
    } else {
      app.loginOkCallbackList.push(() => {
        this.getData(options)
      })
    }
  },

  getData: function (options) {
    var that = this;
    if (options.extension) {
      wx.setStorageSync('extension', options.extension)
    }
    new Product(function (data) {
      that.setData({
        productHotList: data.data.hotGoodsList
      })
      // console.log(data)
    }).list()
  },

  wrapScroll(e) {
    if (e.detail.scrollTop >= 95) {
      this.setData({
        isShow: true
      })
    }
  },
  touchStart(e) {
    this.data.startTouches = e.changedTouches[0]
  },
  touchMove(e) {
    this.data.moveTouches = e.changedTouches[0]
  },
  touchEnd(e) {
    // if (!this.data.isShow) return
    // console.log(e)
    let startTouch = this.data.startTouches,
      Y = e.changedTouches[0].pageY - startTouch.pageY,
      X = Math.abs(e.changedTouches[0].pageX - startTouch.pageX)
    this.data.endTouches = e.changedTouches[0]
    if (X > 200) return
    if (Y > 50) {
      if (this.data.showIndex === 0) {
        this.setData({
          isShow: false
        })
        return
      }
      this.setData({
        showIndex: --this.data.showIndex
      })
      // console.log('下拉')
    } else if (Y < -50 && this.data.showIndex < this.data.productHotList.length - 1) {
      this.setData({
        showIndex: ++this.data.showIndex
      })
      // console.log('上拉')
    }
  },
  //分享
  onShareAppMessage: function (res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮

    }
    return {
      title: '邀请您加入大王纸尿裤',
      path: 'pages/home/home?extension=' + app.globalData.memberInfo.userId,
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
}))