
let app = getApp(),
  Order = require('../../../../service/order.js'),
  util = require("../../../../utils/util.js")
Page({
  data: {
    list:[],
    no:''
  },
  onLoad: function (options) {
    let no = options.no
    this.setData({
      no: no
    })
    new Order(res => {

    }, res => {
      new Order(data => {

      }, data => {

        let list = data.data.data
        list = list.map(v => {
          let [day, time] = v.time.split(' ')
          return {
            day: day,
            time: time,
            originalTime:v.time,
            content: v.context
          }
        })

        this.setData({
          list: list
        })
      }).logistics({
        type: res.data[0].comCode,
        postid: no
      })
    }).getType({
      num: no
    })
  },
  onReady: function () {

  },
  onShow: function () {

  },
  onHide: function () {

  },
  onUnload: function () {

  },
  onPullDownRefresh: function () {

  },
  onReachBottom: function () {

  },
  onShareAppMessage: function () {

  }
})