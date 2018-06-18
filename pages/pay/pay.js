let app = getApp();
let actionsheet = require("../../template/actionsheet/payactionsheet.js");
let util = require('../../utils/util.js');
let receiver = require('../../service/receiver.js');
let order = require('../../service/order.js');
let product = require('../../service/product.js');
let tenant = require('../../service/tenant.js');
let member = require('../../service/member.js');

Page(Object.assign({}, actionsheet, {
  /**
   * 页面的初始数据
   */
  data: {
    goodsAmount: 1,
    usePoint: true,
    userScoreInput: 100
  },


  onLoad: function (options) {
    let that = this;
    let id = options.id;
    this.data.id = id;
    new product((res) => {
      this.setData({
        productData: res.data,
        totalAmount: res.data.info.retail_price
      })
      new member(function (res) {
        that.setData({
          scoreMax: res.data.bonus
        })
        that.calcPointMoney(that.data.totalAmount, res.data.bonus)
      }).view()

    }).view({
      id: id
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
    let val = parseInt(e.detail.value) ? parseInt(e.detail.value):0
    console.log(val > this.data.scoreMax)
    if (val > this.data.scoreMax){
      this.setData({
        userScoreInput: this.data.scoreMax
      })
    }else{
      this.setData({
        userScoreInput: val
      })
    }
  
    this.calcPointMoney(this.data.totalAmount, userScoreInput ? userScoreInput:0)

  },

  //输入积分，总价格换算
  calcPointMoney: function (totalAmount, scoreInput) {
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
          if (bdata.data.useBonus > that.data.scoreMax){
            that.setData({
              userScoreInput: scoreInput,
              trueAmount: that.data.totalAmount - data.data.scoreMoney,
              canTransMoney: data.data.scoreMoney,
              canusePoint: that.data.scoreMax
            })
          }else{
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


  //立即购买选择数量
  revisenum(e) {
    let stype = e.currentTarget.dataset.type,
      min = 1,
      max = 10,
      goods_number = this.data.productData.info.goods_number,
      goodsAmount = this.data.goodsAmount
    switch (stype) {
      case 'input':
        goodsAmount = (!isNaN(e.detail.value) && e.detail.value >= min && e.detail.value <= goods_number) ? e.detail.value : goodsAmount
        break;
      case 'add':
        goodsAmount = goodsAmount + 1 <= goods_number ? goodsAmount + 1 : goods_number
        break;
      case 'reduce':
        goodsAmount = goodsAmount - 1 < min ? 1 : --goodsAmount
        break;
    }
    this.setData({
      goodsAmount: goodsAmount,
      totalAmount: goodsAmount * (this.data.productData.info.retail_price)
    })
    if (this.data.usePoint) {
      this.calcPointMoney(this.data.totalAmount, this.data.scoreMax)
    } else {
      this.calcPointMoney(this.data.totalAmount, 0)
    }
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

  //确认下单提交
  formSubmit: function (e) {
    var that = this;
    new member(function(res){
      if (res.data.userIsMember==1){
        //创建订单submit
        new order(function (res) {
          wx.hideLoading();
          if (that.data.trueAmount == 0) {
            wx.redirectTo({
              url: '/pages/pay/success?orderId=' + res.data.orderInfo.id,
            })
          }
          that.setData({
            showPayDetail: true,
            orderId: res.data.orderInfo.id
          })
          that.setData({
            orderInfo: res.data.orderInfo
          })
        }).submit({
          goodsId: that.data.id,
          goodsAmount: that.data.goodsAmount,
          orderType: 0,
          userScore: that.data.usePoint ? that.data.userScoreInput : 0
        })
      }else{
        wx.showModal({
          title: '提示',
          content: '您还不是会员，成为会员后才可下单',
          cancelText: '取消',
          confirmText: '立即成为',
          success: function (res) {
            if (res.confirm) {
              util.navigateTo({
                url: '/pages/home/join/join',
              })
            } else if (res.cancel) {
              console.log('用户点击取消')
            }
          }
        })
      }
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

  }
}))