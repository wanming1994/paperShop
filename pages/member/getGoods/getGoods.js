var app = getApp();
var util = require("../../../utils/util.js");
var order = require('../../../service/order.js');
var cart = require('../../../service/cart.js');
var receiver = require('../../../service/receiver.js');
var getPwd = require('../../../utils/getPassword.js');
var password = require('../../../service/common.js');
// pages/member/getGoods/getGoods.js
Page({
  /**
   * 页面的初始数据
   */
  data: {
    sum: 0,
    data: [],
    specifications: {},
    cartList: [],
    address: {},
    updateCartListFlag: true,
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    new order(res => {
      this.setData({
        data: res.data.data,
        sum: res.data.sum,
        address: res.data.address,
        addressId: res.data.address ? res.data.address.id : ''
      })
      this.getCartList(res.data.address.id ? res.data.address.id : '').then(res => {

      })
    }).myEcoupons()

  },
  //添加至购物车
  addToCard(et, eid, ec, sid) {
    return new Promise((resolve, reject) => {
      new cart(res => {
        this.data.updateCartListFlag = true
        resolve && resolve(res)
      }).add({
        ecouponsType: et,
        ecouponsId: eid,
        ecouponsCnt: ec,
        specificationId: sid,
        addressId: this.data.address.id || null
      })
    })
  },
  //收货地址
  chooseAddress: function () {
    var that = this;
    try {
      wx.chooseAddress({
        success: function (res) {
          new receiver(function (data) {
            wx.showToast({
              title: '保存成功',
              icon: 'success'
            })
            that.getCartList(data.data.id)
            // new order(res => {
            //   that.setData({
            //     address: res.data.address
            //   })
            // }).myEcoupons()
          }).save({
            provinceName: res.provinceName,
            cityName: res.cityName,
            countyName: res.countyName,
            detailInfo: res.detailInfo,
            userName: res.userName,
            telNumber: res.telNumber,
            nationalCode: res.nationalCode,
            postalCode: res.postalCode
          })
        },
        fail: function (err) {
          if (err.errMsg.indexOf('auth') > -1) {
            wx.showModal({
              title: '提示',
              content: '未授予地址权限，是否前往设置',
              success: function (res) {
                if (res.confirm) {
                  wx.openSetting()
                }
              }
            })
          }
        }
      })
    } catch (e) {
      util.errShow('微信版本过低')
    }
  },
  //获取购物车列表
  getCartList(addressId) {
    return new Promise((resolve, reject) => {
      if (!this.data.updateCartListFlag) {
        resolve && resolve(this.data.cartList)
      }
      new cart(res => {
        this.data.updateCartListFlag = false
        wx.hideLoading()
        this.setData({
          cartList: res.cartList,
          freight: res.freight
        })
        resolve && resolve(res)
      }).list({
        addressId: addressId
      })
    })
  },
  //获取购物车项，通过规格id
  getCartItemById(id) {
    const cartList = this.data.cartList
    for (let i = 0; i < cartList.length; i++) {
      if (cartList[i].goods_specifition_ids == id) {
        return cartList[i]
      }
    }
    return []
  },
  //更新购物车
  updateCart(cid, count) {
    return new Promise((resolve, reject) => {
      new cart(res => {
        this.data.updateCartListFlag = true
        resolve && resolve(res)
      }).edit({
        id: cid,
        count: count,
        addressId: this.data.address.id || null
      })
    })
  },
  //获取券id的规格
  getSpecifications(ecouponId) {
    return new Promise((resolve, reject) => {
      if (this.data.specifications[ecouponId]) {
        resolve && resolve(this.data.specifications[ecouponId])
      } else {
        new order(res => {
          this.data.specifications[ecouponId] = res.data[0].valueList
          this.setData({
            specifications: this.data.specifications
          })
          resolve && resolve(res.data[0].valueList)
        }).goodsAttribute({
          ecouponId: ecouponId
        })
      }
    })
  },
  //弹窗规格切换
  checkout(e) {
    const { id, index } = e.currentTarget.dataset
    const cartList = this.data.cartList
    const cartItem = this.getCartItemById(id)
    let actionData = this.data.actionData
    if (cartItem.length === 0) {
      this.setData({
        actionData: Object.assign(actionData, {
          shouldAddCard: true,
          goods_specifition_ids: actionData.specifications[index].id,
          number: 1
        })
      })
      return
    }
    this.setData({
      actionData: Object.assign(actionData, cartItem)
    })
  },
  //弹窗数据
  select: function (e) {
    const { id, ecouponsid, ecouponsname, count, name, ecouponstype } = e.currentTarget.dataset
    if (parseInt(count) === 0) {
      util.errShow("该类型暂无可提")
      return
    }
    this.getSpecifications(ecouponsid).then(sList => {
      let actionData = {
        specifications: sList
      }
      const cartItem = this.data.cartList.filter(item => {
        return item.goods_specifition_ids == sList[0].id
      })
      if (cartItem.length === 0) {
        actionData = Object.assign(actionData, {
          goods_specifition_ids: sList[0].id,
          number: 1,
          goods_name: ecouponsname,
          ecoupon_type: ecouponstype,
          ecoupon_id: ecouponsid,
          shouldAddCard: true
        })
        this.setData({
          showAction: true,
          actionData
        })
      } else {
        actionData = Object.assign(actionData, this.getCartItemById(sList[0].id))
        this.setData({
          showAction: true,
          actionData: actionData
        })
      }
    })
  },
  //弹出框toggle
  toggleMask(e) {
    this.data.showAction && this.getCartList(this.data.addressId)
    this.setData({
      showAction: !this.data.showAction,
      buyType: e.currentTarget.dataset.type,
      _swiper: this.data._swiper,
      selectData: {}
    })
  },
  //加加减减
  revisenum(e) {
    const { btype, id } = e.currentTarget.dataset
    const cartItem = this.getCartItemById(id)
    const showAction = this.data.showAction
    const num = showAction ? parseInt(this.data.actionData.number) : parseInt(cartItem.number)
    const shouldAddCard = showAction && this.data.actionData.shouldAddCard
    let result
    switch (btype) {
      case 'reduce':
        result = num - 1
        break
      case 'input':
        if (e.detail.value == num) return
        result = e.detail.value
        break
      case 'add':
        result = num + 1
        break
      default:
        result = 0
    }
    if (result >= 0) {
      if (shouldAddCard) {
        this.setData({
          actionData: Object.assign(this.data.actionData, { number: result })
        })
        return
      }
      this.updateCart(cartItem.id, result).then(res => {
        if (showAction) this.data.actionData.number = result
        showAction ? this.setData({
          actionData: this.data.actionData
        }) : this.getCartList(this.data.addressId)
      })
    }
  },
  //弹窗确认
  paySubmit() {
    const actionData = this.data.actionData
    if (actionData.shouldAddCard) {
      this.addToCard(actionData.ecoupon_type, actionData.ecoupon_id, actionData.number, actionData.goods_specifition_ids).then(res => {
        this.getCartList(this.data.addressId)
        this.setData({
          showAction: false
        })
      })
      return
    }
    this.getCartList(this.data.addressId)
    this.setData({
      showAction: false
    })
  },
  //购买提交
  buySubmit() {
    var that = this;
    new order(function (res) {
      wx.hideLoading()
      that.setData({
        userScoreInput: res.data.userScore,
        scoreMax: parseInt(res.data.userScore),
        showBuyDetail: true,
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
      orderType: 2,
      addressId: this.data.address.id || null,
      userScore: 0      
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
            duration: 1000,
            success:function(){
              wx.redirectTo({
                url: '/pages/pay/success?orderId=' + that.data.orderId
              })
            }
          })
        },
        'fail': function (res) {
        }
      })
    }).goPay({
      orderId: that.data.orderId
    })

  },
  closeMask() {
    this.setData({
      showBuyDetail: false,
    })
    new order(res => {
      this.setData({
        data: res.data.data,
        sum: res.data.sum,
        address: res.data.address,
        addressId: res.data.address ? res.data.address.id : ''
      })
      this.getCartList(res.data.address.id ? res.data.address.id : '').then(res => {

      })
    }).myEcoupons()
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
})
