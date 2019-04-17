let swiperAutoHeight = require("../../template/swiper/swiper.js"),
  Product = require("../../service/product.js"),
  Cart = require("../../service/cart.js"),
  Coupon = require("../../service/coupon.js"),
  member = require("../../service/member.js"),
  order = require("../../service/order.js"),
  Tenant = require("../../service/tenant.js"),
  Ad = require("../../service/ad.js"),
  app = getApp(),
  util = require("../../utils/util.js")
Page(Object.assign({}, swiperAutoHeight, {

  /**
   * 页面的初始数据
   */
  data: {
    imgUrls: [
      'https://www.sincereglobe.com/IMAGE/BANNER1.jpg',
      'https://www.sincereglobe.com/IMAGE/BANNER2.jpg'
    ],
    indicatorDots: false,
    autoplay: true,
    interval: 4000,
    duration: 1000,
    limitSize: 1,
    limitPage: 1,
    timer: null
  },

  //邀请
  joinUs: function() {
    new member(function(res) {
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
  goVideo: function() {
    util.navigateTo({
      url: '/pages/home/video/video',
    })
  },

  //商品详情
  goProductDeatil: function(e) {
    var id = e.currentTarget.dataset.id;
    var promotionId = e.currentTarget.dataset.proid ? e.currentTarget.dataset.proid : ''
    util.navigateTo({
      url: '/pages/home/productDetails/productDetails?id=' + id + '&promotionId=' + promotionId,
    })
  },

  //加入购物车
  addCart: function(e) {
    var id = e.currentTarget.dataset.id;
    new Cart(res => {
      wx.showToast({
        title: '加入成功',
        icon: 'none'
      })
    }).add({
      productId: id,
      speid: '-1',
      count: 1,
      type: 'cart'
    })
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    if (app.globalData.LOGIN_STATUS) {
      this.getData(options)
    } else {
      app.loginOkCallbackList.push(() => {
        this.getData(options)
      })
    }
    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          winWidth: res.windowWidth,
          winHeight: res.windowHeight
        })
      }
    })
  },
  nextLimit() {
    var that = this
    clearInterval(that.timer);
    if (this.data.limitPage == this.data.limitCount) {
      this.setData({
        limitPage: 1
      })
    } else {
      this.setData({
        limitPage: ++that.data.limitPage
      })
    }
    new Product(res => {
      var len = res.data.data.length
      if (len == 0) {
        that.setData({
          limitLength: true,
          limitCount: res.data.count
        })
      } else {
        that.setData({
          limitLength: false,
          limitCount: res.data.count
        })
      }

      function time1() {
        var limitsell = res.data.data
        for (var i = 0; i < limitsell.length; i++) {
          // 活动是否已经开始
          var totalSecond = limitsell[i].beginDate / 1000 - Date.parse(new Date()) / 1000;
          // 活动是否已经结束
          var endSecond = limitsell[i].endDate / 1000 - Date.parse(new Date()) / 1000;
          // 秒数

          if (totalSecond < 0 && endSecond > 0) {
            var second = endSecond;
          } else {
            var second = totalSecond;
          }

          // 天数位
          var day = Math.floor(second / 3600 / 24);
          var dayStr = day.toString();
          if (dayStr.length == 1) dayStr = '0' + dayStr;

          // 小时位
          var hr = Math.floor((second - day * 3600 * 24) / 3600);
          var hrStr = hr.toString();
          if (hrStr.length == 1) hrStr = '0' + hrStr;

          // 分钟位
          var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
          var minStr = min.toString();
          if (minStr.length == 1) minStr = '0' + minStr;

          // 秒位
          var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
          var secStr = sec.toString();
          if (secStr.length == 1) secStr = '0' + secStr;
          totalSecond--;
          if (totalSecond < 0 && endSecond > 0) {
            limitsell[i].txt = '马上秒'
            limitsell[i].countDownDay = dayStr
            limitsell[i].countDownHour = hrStr
            limitsell[i].countDownMinute = minStr
            limitsell[i].countDownSecond = secStr
            that.setData({
              limitsell: limitsell
            });
          } else if (totalSecond > 0) {
            limitsell[i].txt = '即将开秒'
            limitsell[i].countDownDay = dayStr
            limitsell[i].countDownHour = hrStr
            limitsell[i].countDownMinute = minStr
            limitsell[i].countDownSecond = secStr

            that.setData({
              limitsell: limitsell
            });
          } else if (totalSecond < 0 && endSecond < 0) {
            clearInterval(that.timer);
            limitsell[i].txt = '去看看'
            limitsell[i].countDownDay = '00'
            limitsell[i].countDownHour = '00'
            limitsell[i].countDownMinute = '00'
            limitsell[i].countDownSecond = '00'
            that.setData({
              limitsell: limitsell
            });
          }
        }
        that.setData({
          limitsell: limitsell,
        })
      }
      time1();
      that.timer = setInterval(time1, 1000);
    }).indexPromotion({
      size: 1,
      page: that.data.limitPage
    })
  },
  getData: function(options) {
    var that = this;
    if (options.extension) {
      wx.setStorageSync('extension', options.extension)
      //创建加入会员订单submit
      new order(function(res) {

      }).submit({
        orderType: 3,
        recommendUserId: options.extension
      })
    }
    new Product(res => {
      var len = res.data.data.length
      if (len == 0) {
        that.setData({
          limitLength: true,
          limitCount: res.data.count
        })
      } else {
        that.setData({
          limitLength: false,
          limitCount: res.data.count
        })
      }

      function time1() {
        var limitsell = res.data.data
        for (var i = 0; i < limitsell.length; i++) {
          // 活动是否已经开始
          var totalSecond = limitsell[i].beginDate / 1000 - Date.parse(new Date()) / 1000;
          // 活动是否已经结束
          var endSecond = limitsell[i].endDate / 1000 - Date.parse(new Date()) / 1000;
          // 秒数

          if (totalSecond < 0 && endSecond > 0) {
            var second = endSecond;
          } else {
            var second = totalSecond;
          }

          // 天数位
          var day = Math.floor(second / 3600 / 24);
          var dayStr = day.toString();
          if (dayStr.length == 1) dayStr = '0' + dayStr;

          // 小时位
          var hr = Math.floor((second - day * 3600 * 24) / 3600);
          var hrStr = hr.toString();
          if (hrStr.length == 1) hrStr = '0' + hrStr;

          // 分钟位
          var min = Math.floor((second - day * 3600 * 24 - hr * 3600) / 60);
          var minStr = min.toString();
          if (minStr.length == 1) minStr = '0' + minStr;

          // 秒位
          var sec = second - day * 3600 * 24 - hr * 3600 - min * 60;
          var secStr = sec.toString();
          if (secStr.length == 1) secStr = '0' + secStr;
          totalSecond--;
          if (totalSecond < 0 && endSecond > 0) {
            limitsell[i].txt = '马上秒'
            limitsell[i].countDownDay = dayStr
            limitsell[i].countDownHour = hrStr
            limitsell[i].countDownMinute = minStr
            limitsell[i].countDownSecond = secStr
            that.setData({
              limitsell: limitsell
            });
          } else if (totalSecond > 0) {
            limitsell[i].txt = '即将开秒'
            limitsell[i].countDownDay = dayStr
            limitsell[i].countDownHour = hrStr
            limitsell[i].countDownMinute = minStr
            limitsell[i].countDownSecond = secStr

            that.setData({
              limitsell: limitsell
            });
          } else if (totalSecond < 0 && endSecond < 0) {
            clearInterval(that.timer);
            limitsell[i].txt = '去看看'
            limitsell[i].countDownDay = '00'
            limitsell[i].countDownHour = '00'
            limitsell[i].countDownMinute = '00'
            limitsell[i].countDownSecond = '00'
            that.setData({
              limitsell: limitsell
            });
          }
        }
        that.setData({
          limitsell: limitsell,
        })
      }
      time1();
      that.timer = setInterval(time1, 1000);
    }).indexPromotion({
      size: 1,
      page: 1
    })

    new Product(function(data) {
      that.setData({
        categoryList: data.data.categoryList,
        banner: data.data.banner,
        hotGoodsList: data.data.hotGoodsList
      })



      // console.log(data)
    }).list()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  //分享
  onShareAppMessage: function(res) {
    var that = this;
    if (res.from === 'button') {
      // 来自页面内转发按钮

    }
    return {
      title: '邀请您加入天然壹家',
      path: 'pages/home/home?extension=' + app.globalData.memberInfo.userId,
      success: function(res) {
        // 转发成功
        wx.showToast({
          title: '转发成功',
          icon: 'success'
        })
      },
      fail: function(res) {
        // 转发失败
      }
    }
  }
}))