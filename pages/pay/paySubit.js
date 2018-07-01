let app = getApp();
let util = require('../../utils/util.js');
let Order = require('../../service/order.js');
let member = require('../../service/member.js');

Page(Object.assign({}, {
  /**
   * 页面的初始数据
   */
  data: {

  },


  onLoad: function(options) {
    var id = options.id
    new Order(data => {
      this.setData({
        details: data.data,
        id: options.id
      })
    }).view({
      orderId: id
    })
  },

  bindgetuserinfo(e) {
    let that = this
    if (e.detail.errMsg.indexOf('fail') > -1) {
      wx.showToast({
        title: '请授权用户信息!',
        icon: 'none'
      })
    } else {
      new member(res => {
        var that = this
        wx.showToast({
          title: '支付发起中',
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
            'success': function(res) {
              wx.showToast({
                title: '支付成功',
                icon: 'success',
                duration: 1000,
                success: function() {
                  wx.redirectTo({
                    url: '/pages/pay/success?orderId=' + that.data.id
                  })
                }
              })
            },
            'fail': function(res) {}
          })

        }).goPay({
          orderId: that.data.id,
          userScore: 0
        })
      }).updateView({
        avatarUrl: e.detail.userInfo.avatarUrl,
        nickName: e.detail.userInfo.nickName
      })
    }
  }

}))