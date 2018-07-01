let app = getApp();
let actionsheet = require("../../template/actionsheet/payactionsheet.js");
let util = require('../../utils/util.js');
let receiver = require('../../service/receiver.js');
let order = require('../../service/order.js');
let member = require('../../service/member.js');
let tenant = require('../../service/tenant.js');
let cart = require('../../service/cart.js');

Page(Object.assign({}, actionsheet, {

  /**
   * 页面的初始数据
   */
  data: {
    memo: '',
    addressIsGet: true,
    usePoint: true,
    getAddressCount: 10,
    selectDiscount: [],
    selectCoupon: {
      name: '未使用',
      code: ''
    },
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
            that.getAddress()
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
          if (err.errMsg.indexOf('auth deny') > -1) {
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

  onLoad: function (options) {
    var that = this;
    this.getAddress();
  },

  getAddress(fn) {
    var that = this
    this.data.addressIsGet = false
    new cart((data) => {
      that.data.addressIsGet = true
      that.setData({
        orderInfo: data.data,
        receiver: data.data.address,
        order: data.data.checkedGoodsList,
        totalAmount: data.data.orderTotalPrice,
        scoreMax: data.data.userBonus,
        couponList: data.data.couponList
      })
      //判断优惠券的数量
      if (data.data.couponList.length > 0 && data.data.userBonus > 0) {
        this.setData({
          selectDiscount: [
            {
              name: "使用优惠券",
              type: "coupon"
            }, {
              name: "使用积分",
              type: "score"
            }, {
              name: "不使用优惠",
              type: "none"
            }
          ],
          defaultDiscount: 'coupon'
        })
      } else if (data.data.userBonus > 0 && data.data.couponList.length == 0) {
        this.setData({
          selectDiscount: [
            {
              name: "使用积分",
              type: "score"
            }, {
              name: "不使用优惠",
              type: "none"
            }
          ],
          defaultDiscount: 'score'
        })
      } else if (data.data.userBonus <= 0 && data.data.couponList.length > 0) {
        this.setData({
          selectDiscount: [
            {
              name: "使用优惠券",
              type: "coupon"
            }, {
              name: "不使用优惠",
              type: "none"
            }
          ],
          defaultDiscount: 'coupon'
        })
      }
      that.calcPointMoney(that.data.totalAmount, data.data.userBonus)
    }).orderCon({})

  },

  //计算价格方法
  calcu: function (couponAmount) {
    var that = this;
    that.setData({
      trueAmount: that.data.totalAmount - couponAmount
    })
  },

  //显示
  toogleCouponSelect() {
    this.setData({
      showCouponSelect: !this.data.showCouponSelect
    })
  },
  //选择优惠券
  selectCoupon(e) {
    let couponId = e.currentTarget.dataset.id,
      name = e.currentTarget.dataset.name,
      couponAmout = e.currentTarget.dataset.amount;
    this.setData({
      selectCoupon: {
        couponId: couponId ? couponId : '',
        name: name ? name : (couponId ? '已使用' : '未使用')
      },
      showCouponSelect: false,
      couponId: couponId,
      couponAmout: couponAmout
    })
    this.calcu(couponAmout)
  },

  //买家留言
  inputMemo: function (e) {
    this.setData({
      memo: e.detail.value
    })
  },

  //选择是否使用积分
  clickUsePoint: function () {
    this.setData({
      usePoint: !this.data.usePoint
    })
    if (this.data.usePoint) {
      this.calcPointMoney(this.data.totalAmount, this.data.scoreMax)
    } else {
      this.calcPointMoney(this.data.totalAmount, 0)
    }
  },


  //付款输入积分
  userScoreInput(e) {
    let that = this;
    let val = parseInt(e.detail.value) ? parseInt(e.detail.value) : 0
    console.log(val > this.data.scoreMax)
    if (val > this.data.scoreMax) {
      this.setData({
        userScoreInput: this.data.scoreMax
      })
    } else {
      this.setData({
        userScoreInput: val
      })
    }

    this.calcPointMoney(this.data.totalAmount, this.data.userScoreInput ? this.data.userScoreInput : 0)

  },

  //输入积分，总价格换算
  calcPointMoney: function (totalAmount, scoreInput) {
    console.log(totalAmount + ',' + scoreInput)
    var that = this;
    //获取总积分
    new order(function (data) {
      //抵扣金额大于订单总额
      if (data.data.scoreMoney > totalAmount) {
        new order(function (cdata) {
          that.setData({
            userScoreInput: cdata.data.useBonus,
            trueAmount: 0,
            canTransMoney: totalAmount,
            canusePoint: cdata.data.useBonus
          })
        }).moneyConvert({
          useMoney: that.data.totalAmount
        })
      } else {
        new order(function (bdata) {
          if (bdata.data.useBonus > that.data.scoreMax) {
            that.setData({
              userScoreInput: scoreInput,
              trueAmount: that.data.totalAmount - data.data.scoreMoney,
              canTransMoney: data.data.scoreMoney,
              canusePoint: that.data.scoreMax
            })
          } else {
            that.setData({
              userScoreInput: scoreInput,
              trueAmount: that.data.totalAmount - data.data.scoreMoney,
              canTransMoney: data.data.scoreMoney,
              canusePoint: bdata.data.useBonus
            })
          }
        }).moneyConvert({
          useMoney: that.data.totalAmount
        })

      }
    }).calPoint({
      useScore: scoreInput
    })
  },


  //单选按钮选择配送方式
  radioChange: function (e) {
    var that = this;
    // console.log(e.detail.value);
    this.setData({
      defaultDiscount: e.detail.value
    })
    if(e.detail.value=='score'){
      that.calcPointMoney(that.data.totalAmount, that.data.canusePoint)
    }else if(e.detail.value=='coupon'){
      that.calcPointMoney(that.data.totalAmount, 0)
    } else if (e.detail.value == 'none') {
      that.calcPointMoney(that.data.totalAmount, 0)
    }
  },

  //确认下单提交
  formSubmit: function (e) {
    var formId = e.detail.formId;
    var that = this;
    //同城快递提交订单
    if (!this.data.addressIsGet && this.data.getAddressCount) {
      setTimeout(() => {
        this.formSubmit(e)
        --this.data.getAddressCount
      }, 200)
      return
    }
    new member(function (res) {
      // if (res.data.userIsMember >= 1) {
        if (!that.data.receiver.id) {
          util.errShow('请选择收货地址');
        } else {
          //创建订单submit
          new order(function (res) {
            wx.hideLoading();
            if (that.data.trueAmount == 0) {
              wx.redirectTo({
                url: '/pages/pay/success?orderId=' + res.data.orderInfo.id,
              })
            }else{
              wx.redirectTo({
                url: '/pages/pay/paySubit?id=' + res.data.orderInfo.id,
              })
            }
            // that.setData({
            //   showPayDetail: true,
            //   orderId: res.data.orderInfo.id
            // })
            // that.setData({
            //   payorderInfo: res.data.orderInfo
            // })
          }).submit({
            addressId: that.data.orderInfo.address.id,
            userScore: that.data.defaultDiscount=='score'?that.data.userScoreInput:0,
            orderType: 0,
            couponId: that.data.defaultDiscount == 'coupon' ? that.data.couponId:'',
            memo: that.data.memo
          })
        }
      // } 
      // else {
      //   wx.showModal({
      //     title: '提示',
      //     content: '您还不是会员，成为会员后才可下单',
      //     cancelText: '取消',
      //     confirmText: '立即成为',
      //     success: function (res) {
      //       if (res.confirm) {
      //         util.navigateTo({
      //           url: '/pages/home/join/join',
      //         })
      //       } else if (res.cancel) {
      //         console.log('用户点击取消')
      //       }
      //     }
      //   })
      // }
    }).view()

  },

  //去付款
  toBuyConfirm() {
    let that = this;
    //发起支付接口
    new order(function (data) {
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
  //关闭付款框
  toggleMaskPay: function () {
    this.setData({
      showPayDetail: false
    })
    wx.redirectTo({
      url: '/pages/member/order/order?id=1'
    })
  },
}))
