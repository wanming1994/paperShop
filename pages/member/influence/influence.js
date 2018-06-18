var app = getApp()
var member = require('../../../service/member.js')
var util = require('../../../utils/util')
var util = require("../../../utils/util.js")

Page({
  data: {
  
  },
  onLoad: function (options) {
    var that=this;
    new member(function(data){
      that.setData({
        data: data.data.userRecommend,
        memberList: data.data.directUserRecommend
      })
    }).userRecommend()
  },
  onReady: function () {
  
  },
  onShow: function () {
  
  }
})