var app = getApp()
let util = require('../../utils/util.js')
let Cart = require('../../service/cart.js')

// pages/cart/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    cartList: [],//购物车列表
    total: 0,//计算总价
    checkAll: false,//是否选择全部
    selectedId: [],//已选择商品id
    // mailPromotion: null,//包邮信息
  },
  //商品check事件
  checkItemChange(e) {
    //tip:setData设置数据会响应到页面，但会有延时，this.data不响应页面

    let value = e.detail.value
    let cartList = this.data.cartList
    for (let i = 0, j = cartList.length; i < j; i++) {
      if (value.indexOf(cartList[i].id + '') + 1 || value.indexOf(cartList[i].id) + 1) {
        cartList[i].checked = 1
      } else {
        cartList[i].checked = 0
      }
    }
    new Cart(res => {
      this.data.cartList = cartList
      this.data.selectedId = value
      this.setData({
        checkAll: [...new Set(e.detail.value)].length === this.data.cartList.length,
        cartList: cartList,
        checkedGoodsAmount: res.data.cartTotal.checkedGoodsAmount
      })
      this.calcTotal()
    }).selected({
      cartIds: value
    })
  },
  deleteItem(e) {
    let cartList = this.data.cartList
    let name = e.currentTarget.dataset.name
    let id = e.currentTarget.dataset.id
    let that = this
    wx.showModal({
      title: '提示',
      content: '是否确定删除该商品',
      success: function (res) {
        if (res.confirm) {
          new Cart((res) => {
            that.onShow()
          }).delete({
            cartIds: [id]
          })
        } else if (res.cancel) {

        }
      }
    })
  },
  //添加、减少商品数目
  revisenum(e) {
    let that = this
    let data = e.currentTarget.dataset
    let id = data.id, rtype = data.type, min = data.min
    let localnum = this.getItemById(id).number
    let result = min
    if (localnum < min) {
      this.setNum(id, min)
      return
    }
    if (rtype == 'add') {
      this.setNum(id, ++localnum)
      return
    }
    if (rtype == 'reduce') {
      this.setNum(id, localnum - 1 <= min ? min : --localnum)
      return
    }

  },
  //通过id获取商品
  getItemById(id) {
    let cartList = this.data.cartList
    for (let i = 0, j = cartList.length; i < j; i++) {
      if (cartList[i].id == id) {
        return cartList[i]
      }
    }
  },
  //输入商品数目
  inputnum(e) {
    let id = e.currentTarget.dataset.id
    let val = e.detail.value
    if (isNaN(val)) {
      this.setNum(id, val)
      return
    }
    this.setNum(id, val)
  },

  //全选check事件
  checkAllChange(e) {
    let that = this
    let selectAll = e.detail.value.length
    let cartList = this.data.cartList
    let selectedId = []
    for (let i = 0, j = cartList.length; i < j; i++) {
      cartList[i].checked = selectAll
      selectedId.push(cartList[i].id)
    }
    new Cart(res => {
      //设置已选择商品
      this.data.selectedId = selectAll ? selectedId : []
      this.setData({
        cartList: cartList,
        checkedGoodsAmount:res.data.cartTotal.checkedGoodsAmount
      })
      this.calcTotal()
    }).selected({
      cartIds: selectAll ? selectedId : []
    })
  },
  //计算总价
  calcTotal() {
    let selectedId = this.data.selectedId, total = 0
    if (selectedId.length == 0) {
      this.setData({
        total: total
      })
      return
    }
    selectedId = [...new Set(selectedId)]
    selectedId.forEach((val, index) => {
      let item = this.getItemById(val)
      if (item)
        total += item.number * item.price
    })
    this.setData({
      total: total.toFixed(2)
    })
  },
  //设置商品数量
  setNum(id, num) {
    let cartList = this.data.cartList
    let that = this
    if (this.getItemById(id).number == num) return
    //编辑数目调用接口
    new Cart(function (data) {
      for (let i = 0, j = cartList.length; i < j; i++) {
        if (cartList[i].id == id) {
          cartList[i].number = num
          that.data.cartList = cartList
          that.setData({
            cartList: that.data.cartList,
            checkedGoodsAmount: data.data.cartTotal.checkedGoodsAmount
          })
          break
        }
      }
      that.calcTotal()
    }, function (err) {
      util.errShow(err.message.content)
      that.setData({
        cartList: that.data.cartList
      })
    }).edit({
      cartId: id,
      count: num
    })
  },
  onLoad: function (options) {

  },
  getCartDataWhenLogin() {
    var that = this
    new Cart(function (data) {
      // if (!data.data.tenants || data.data.tenants.length == 0) {
      //   that.setData({
      //     cartList: [],
      //     total: 0,
      //     checkAll: false,
      //     selectedId: [],
      //     mailPromotion: null,
      //     getDataComplete: true
      //   })
      //   return
      // }
      console.log(data.cartList)
      let selectedId = [], cartList = data.cartList
      for (let i = 0, j = cartList.length; i < j; i++) {
        if (cartList[i].checked==1) {
          selectedId.push(cartList[i].id)
        }
      }
      that.data.selectedId = selectedId

      that.setData({
        cartList: cartList,
        checkAll: [...new Set(selectedId)].length === cartList.length,
        selectedId: selectedId,
        // mailPromotion: mailPromotion,
        getDataComplete: true,
        checkedGoodsAmount: data.cartTotal.checkedGoodsAmount
      })

      that.calcTotal()
    }).list()
  },
  onShow: function () {
    this.setData({
      getDataComplete: false
    })
    if (app.globalData.LOGIN_STATUS) {
      this.getCartDataWhenLogin()
    } else {
      app.loginOkCallbackList.push(() => {
        this.getCartDataWhenLogin()
      })
    }
  },
  //点击去逛逛
  goIndex() {
    wx.switchTab({
      url: '/pages/home/home'
    })
  },
  //结算
  submit: function () {
    if (this.data.selectedId.length <= 0) {
      util.errShow('请选择结算商品')
    } else {
      util.navigateTo({
        url: '../pay/orderPay',
      })
    }
  },

  //购物车点击进商品详情
  goProductDetail: function (e) {
    var id = e.currentTarget.dataset.id;
    util.navigateTo({
      url: '/pages/home/productDetails/productDetails?id=' + id,
    })
  }
})