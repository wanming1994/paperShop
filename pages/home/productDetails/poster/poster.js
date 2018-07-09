// pages/canvas/canvas.js
var app = getApp()
let util = require('../../../../utils/util.js')
var common = require('../../../../service/common.js')
var product = require('../../../../service/product.js')
var member = require('../../../../service/member.js')
Page(Object.assign({}, {

  /**
   * 页面的初始数据
   */
  data: {
    canvasw: '',
    canvash: ''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    if (app.globalData.LOGIN_STATUS) {
      this.getData(options)
    } else {
      app.loginOkCallbackList.push(() => {
        this.getData(options)
      })
    }

  },
  getData(options) {
    var id = options.id
    var that = this;
    new product(res => {
      this.setData({
        productImg: res.data.info.list_pic_url,
        name: res.data.info.name,
        price: res.data.info.retail_price,
        memberPrice: res.data.info.member_price,
        id: id
      })
    }).view({
      id: id
    })

    var res1 = '/resources/images/product/poster.png'
    var headImg = '',
      picImg = '';
    new product((res) => {
      wx.downloadFile({
        url: res.data,
        success: function(res) {
          that.setData({
            qrcode: res.tempFilePath
          })
          wx.downloadFile({
            url: that.data.productImg,
            success: function(res) {
              picImg = res.tempFilePath
              wx.getSystemInfo({
                success: function(res) {
                  that.setData({
                    canvasw: res.windowWidth + 'px',
                    canvash: res.windowHeight + 'px'
                  })
                  var w = res.windowWidth;
                  var h = res.windowHeight;
                  const ctx = wx.createCanvasContext('myCanvas')
                  ctx.setFillStyle('rgb(255, 255, 255)')
                  ctx.fillRect(0, 0, w, h)
                  ctx.drawImage(res1, 0, 0, w, h) //背景图大
                  ctx.save();
                  ctx.beginPath()

                  //商品名称
                  ctx.setTextAlign('center')
                  ctx.setFillStyle('rgb(0, 0, 0)')
                  ctx.setFontSize(18)
                  ctx.fillText(that.data.name, w / 2, 0.54 * h)

                  ctx.setTextAlign('center')
                  ctx.setFillStyle('rgb(0, 0, 0)')
                  ctx.setFontSize(20)
                  ctx.fillText('￥' + that.data.price, w / 2, 0.59 * h)
                  ctx.setFillStyle('rgb(205,51,51)')
                  ctx.setFontSize(16)
                  ctx.fillText('会员价' + '￥' + that.data.memberPrice, w / 2 + 10, 0.64 * h)



                  ctx.drawImage(picImg, 0.2 * w, 0.13 * h, 0.60 * w, 0.60 * w) //商品图片
                  ctx.drawImage(that.data.qrcode, 0.35 * w, 0.70 * h, 0.3 * w, 0.3 * w) //小程序二维码
                  ctx.draw();
                  setTimeout(function () {
                    wx.showModal({
                      title: '提示',
                      content: '长按可保存海报至相册，再去分享朋友圈',
                    })
                  }, 500)
                },
                fail: function(e) {
                  console.log(e)
                }
              })
            }
          })


        }
      })
    }).createUserQRCode({
      goodsId: options.id
    })
  },
  bindlongtap() {
    wx.canvasToTempFilePath({
      //通过id 指定是哪个canvas
      canvasId: 'myCanvas',
      success(res) {
        //成功之后保存到本地
        // console.log(res)
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function(res) {
            wx.showToast({
              title: '图片已保存相册',
              icon: 'success',
              duration: 2000
            })
          },
          fail: function(res) {
            console.log(res)
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  }
}))