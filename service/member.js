let Ajax = require('./ajax.js')

module.exports = class Member extends Ajax {
  /**
   * 登陆接口
   * @param String js_code wx.login获得
   * @param Number cid 1
   */
  login(data) {
    super.post({
      url: 'auth/login_by_weixin',
      hideErrorTip: true,
      data: data
    })
  }

  /**
   * 获取用户基本信息
   */
  view(data) {
    super.get({
      url: 'user/info',
      hideErrorTip: true,
      data: data
    })
  }

  /**
   * 更新用户基本信息
   */
  updateView(data) {
    super.post({
      url: 'user/update',
      hideErrorTip: true,
      data: data
    })
  }

  /**
   * 生成二维码
   */
  createUserQRCode(data) {
    super.get({
      url: 'user/createUserQRCode',
      hideErrorTip: true,
      data: data
    })
  }

  /**
   * 影响力接口
   */
  userRecommend(data) {
    super.get({
      url: 'user/userRecommend',
      hideErrorTip: true,
      data: data
    })
  }

  /**
   * 兑换订单
   */
  goodsexchange(data) {
    super.get({
      url: 'goodsexchange/list',
      hideErrorTip: true,
      data: data
    })
  }





  /**
   * 绑定手机号发送短信
   * @param:
   * mobile  手机号
   */
  sendMsgToBindPhone(data) {
    super.post({
      url: "user/smscode",
      data: data
    })
  }

  /**
   * 绑定手机号确定
   *  phone  和 smsCode
   */
  bindPhone(data) {
    super.post({
      url: "user/bindMobile",
      data: data
    })
  }


  /**
   * 获取推荐人
   *  recommendUserId
   */
  getUserName(data) {
    super.get({
      url: "user/getUserName",
      data: data
    })
  }

  /**
   * 获取用户积分列表
   *  getBillList
   * page size
   */
  getBillList(data) {
    super.get({
      url: "Billflow/getBillList",
      data: data
    })
  }


  /**
   * 获取积分商品
   */
  getscoreProductt(data) {
    super.get({
      url: "goods/getSepcialGoods",
      data: data
    })
  }

  /**
   * 提现发起
   * money金额
   */
  getscoreProductt(data) {
    super.post({
      url: "Withdraw/withDrawMoney",
      data: data
    })
  }


  /**
   * 获取合伙人价格
   */
  applyPartner(data) {
    super.post({
      url: "user/applyPartner",
      data: data
    })
  }


  /**
   * 合伙人支付
   */
  payPartner(data) {
    super.post({
      url: "user/payPartner",
      data: data
    })
  }

  /**
   * 获取huiyuan价格
   */
  applyMember(data) {
    super.post({
      url: "user/applyMember",
      data: data
    })
  }
  
  /**
   * 会员支付
   */
  payMember(data) {
    super.post({
      url: "user/payMember",
      data: data
    })
  }


}