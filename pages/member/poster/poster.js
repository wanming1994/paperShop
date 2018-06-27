// pages/canvas/canvas.js
var app = getApp()
let util = require('../../../utils/util.js')
var common = require('../../../service/common.js')
var member = require('../../../service/member.js')
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
  onLoad: function (options) {
    if (app.globalData.LOGIN_STATUS) {
      this.getData(options)
    } else {
      app.loginOkCallbackList.push(() => {
        this.getData(options)
      })
    }

  },
  getData() {
    var that = this;
    new member(res=>{
      this.setData({
        nickName: res.data.nickName,
        avatarUrl: res.data.avatarUrl
      })
    }).view()
   
    var res1 = '/resources/images/member/poster_bg.png'
    var headImg = '';
    new member((res) => {
      wx.downloadFile({
        url: res.data,
        success: function (res) {
          that.setData({
            qrcode: res.tempFilePath
          })
          wx.downloadFile({
            url: that.data.avatarUrl,
            success: function (res) {
              headImg = res.tempFilePath
              wx.getSystemInfo({
                success: function (res) {
                  that.setData({
                    canvasw: res.windowWidth + 'px',
                    canvash: res.windowHeight + 'px'
                  })
                  var w = res.windowWidth;
                  var h = res.windowHeight;
                  const ctx = wx.createCanvasContext('myCanvas')
                  ctx.setFillStyle('rgb(255, 255, 255)')
                  ctx.fillRect(0, 0, w, h)
                  ctx.drawImage(res1, 0, 0, w, h)//背景图大
                  ctx.save();
                  ctx.beginPath()
                  ctx.arc(0.15 * w + 0.15 * w / 2, 0.56 * h + 0.15 * w / 2, 0.15 * w / 2, 0, 2 * Math.PI);
                  ctx.setStrokeStyle('#ffffff')
                  ctx.clip();
                  ctx.drawImage(headImg, 0.15 * w, 0.56 * h, 0.15 * w, 0.15 * w)//小程序二维码
                  ctx.stroke();
                  ctx.closePath();
                  ctx.restore();

                  ctx.setTextAlign('left')
                  ctx.setFillStyle('rgb(43, 43, 43)')
                  ctx.setFontSize(14)
                  ctx.fillText('我是' + that.data.nickName, 0.20 * h, 0.60 * h)
                  ctx.setFillStyle('rgb(137, 110, 87)')
                  ctx.setFontSize(16)
                  ctx.fillText('邀请您加入天然壹家', 0.20 * h, 0.63 * h)

                  ctx.drawImage(that.data.qrcode, 0.15 * h, 0.68 * h, 0.24 * w, 0.24 * w)//小程序二维码
                  ctx.draw();
                  setTimeout(function () {
                    wx.showModal({
                      title: '提示',
                      content: '长按可保存海报至相册，再去分享朋友圈',
                    })
                  }, 500)
                }, fail: function (e) {
                  console.log(e)
                }
              })
            }
          })


        }
      })
    }).createUserQRCode()
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
          success: function (res) {
            wx.showToast({
              title: '图片已保存相册',
              icon: 'success',
              duration: 2000
            })
          },
          fail: function (res) {
            console.log(res)
          }
        })
      }
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  }
}))