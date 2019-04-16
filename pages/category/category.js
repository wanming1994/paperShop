let Product = require("../../service/product.js"),
  Cart = require("../../service/cart.js"),
  app = getApp(),
  util = require("../../utils/util.js")

Page({
  data: {
    // text:"这是一个页面"
    navList: [],
    goodsList: [],
    id: 0,
    currentCategory: {},
    scrollLeft: 0,
    scrollTop: 0,
    scrollHeight: 0,
    page: 1,
    size: 10000
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    if (options.id) {
      that.setData({
        id: parseInt(options.id)
      });
    }

    wx.getSystemInfo({
      success: function(res) {
        that.setData({
          scrollHeight: res.windowHeight
        });
      }
    });


    this.getCategoryInfo();

  },
  getCategoryInfo: function() {
    let that = this;
    new Product((res) => {
      that.setData({
        navList: res.data.brotherCategory,
        currentCategory: res.data.currentCategory
      });

      //nav位置
      let currentIndex = 0;
      let navListCount = that.data.navList.length;
      for (let i = 0; i < navListCount; i++) {
        currentIndex += 1;
        if (that.data.navList[i].id == that.data.id) {
          break;
        }
      }
      if (currentIndex > navListCount / 2 && navListCount > 5) {
        that.setData({
          scrollLeft: currentIndex * 60
        });
      }
      that.getGoodsList();
    }).category({
      id: this.data.id
    })
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
    console.log(1);
  },
  onHide: function() {
    // 页面隐藏
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
  getGoodsList: function() {
    var that = this;
    new Product((res) => {
      that.setData({
        goodsList: res.data.data,
      });
    }).categoryList({
      categoryId: that.data.id,
      page: that.data.page,
      size: that.data.size
    })
  },
  onUnload: function() {
    // 页面关闭
  },
  switchCate: function(event) {
    if (this.data.id == event.currentTarget.dataset.id) {
      return false;
    }
    var that = this;
    var clientX = event.detail.x;
    var currentTarget = event.currentTarget;
    if (clientX < 60) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft - 60
      });
    } else if (clientX > 330) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft
      });
    }
    this.setData({
      id: event.currentTarget.dataset.id
    });

    this.getCategoryInfo();
  }
})