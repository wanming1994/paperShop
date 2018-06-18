let config = require('../utils/config')
let util = require('../utils/util')
let BASE_URL = config.BASE_URL

module.exports = class Ajax {
  constructor(fn = function () { }, errFn = function () { }) {
    this.fn = fn
    this.errFn = errFn
  }
  get(options) {
    this.request(options, 'GET')
  }
  post(options) {
    this.request(options, 'POST')
  }
  request(options, method = 'GET') {
    options = typeof options == 'string' ? { url: options } : options
    if (!/^https?:\/\/([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/.test(options.url)) {
      options.url = BASE_URL + options.url
    }
    let _this = this
    wx.request({
      url: options.url,
      method: method,
      data: options.data,
      header: Object.assign({
        'Content-Type': 'application/json',
        // 'Cookie': 'JSESSIONID=' + wx.getStorageSync('JSESSIONID'),
        'X-Nideshop-Token': wx.getStorageSync('token')
      }, options.header),
      success(res) {
        if (res.data.errno=='0') {
          _this.fn(res.data)
        } else if (res.data.errno == '1' || res.data.errno == '400') {
          _this.errFn(res.data)
          !options.hideErrorTip ? util.errShow(res.data.errmsg) : ''
        }
        //  else if(res.data.message.type=='success'){
        //   _this.fn(res.data)
        // }
        else{
          // _this.errFn(res)
          // !options.hideErrorTip ? util.errShow('服务器错误') : ''
        }
      },
      error(err) {
        // console.log(err)
        _this.errFn(err)
        wx.getNetworkType({
          success: function (res) {
            var networkType = res.networkType
            if (networkType == 'none') {
              util.errShow('网络连接失败', 4000)
            } else {
              util.errShow('未知错误', 4000)
            }
          }
        })
      }
    })
  }
}
