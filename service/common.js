
let Ajax = require("./ajax.js")

module.exports = class Commom extends Ajax {
  getPublicKey(data) {
    super.get({
      url: "applet/common/public_key.jhtml",
      data: data
    })
  }

  getToken(data) {
    super.get({
      url: "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxd32c6f0a8ce28e23&secret=0745c8d62cd709fbc3a3a4a42560d0a3",
      data: data
    })
  }


// access_token scene page width
  getCode(data) {
    super.post({
      url: "https://api.weixin.qq.com/wxa/getwxacodeunlimit",
      data: data
    })
  }

  getCodeb(data) {
    super.post({
      url: "https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode",
      data: data
    })
  }

  
}