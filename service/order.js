let Ajax = require('./ajax.js')
let config = require('../utils/config.js')

module.exports = class Order extends Ajax {
  /**
   * 我的订单列表
   * tenantId 商家Id
   * type {unshipped 待发货, unpaid 待支付, unreciver 待签收, unreview 待评价}
   * pageSize 每页记录数
   * pageNumber 页码
   */
  list(data) {
    super.get({
      url: "order/list",
      data: data
    });
  }

  /**
     * 订单明细
     * id 子订单Id
     */
  view(data) {
    super.get({
      url: "order/detail",
      data: data,
      success: this.fn
    });
  }

  /**
   * 订单提交
   * 数量
   * 商品id
   */
  submit(data) {
    super.post({
      url: "order/submit",
      data: data
    });
  }

  /**
   * 积分价格换算
   * useScore 使用的分数
   */
  calPoint(data) {
    super.post({
      url: "user/bonusConvert",
      data: data
    });
  }

  /**
   * 根据价格换算积分
   * useMoney 使用的分数
   */
  moneyConvert(data) {
    super.post({
      url: "user/moneyConvert",
      data: data
    });
  }
  /**
   * 发起支付
   * orderId, 订单id
   * userScore使用的分数
   */
  goPay(data) {
    super.post({
      url: "pay/pay_prepay",
      data: data
    });
  }

  /**
   * 商品提货
   * 
   */
  myEcoupons(data) {
    super.post({
      url: "ecoupons/myEcoupons",
      data: data
    });
  }

  /**
     * 电子券获取商品规格
     * ecouponId
     */
  goodsAttribute(data) {
    super.post({
      url: "ecoupons/goodsAttribute",
      data: data
    });
  }


  /**
   * 取消订单
   * orderId
   */
  cancelOrder(data) {
    super.post({
      url: "order/cancelOrder",
      data: data
    });
  }

  /**
   * 取消订单
   * orderId
   */
  confirm(data) {
    super.get({
      url: "order/confirmOrder",
      data: data
    });
  }


  /**
   * 删除订单
   * orderId
   */
  deleteOrder(data) {
    super.get({
      url: "order/deleteOrder",
      data: data
    });
  }

  /**
   * 支付详情页面
   * orderId
   */
  payResult(data) {
    super.get({
      url: "order/payResult",
      data: data
    });
  }









  /**
  * 根据快递单号查询快递类型
  * num 快递单号
  */
  getType(data) {
    super.get({
      url: 'https://m.kuaidi100.com/autonumber/auto',
      data: data,
      hideErrorTip: true
    });
  }


  /**
    * 获取快递单号详细物流信息
    * type  快递类型
    * postid 快递单号
    */
  logistics(data) {
    super.get({
      url: 'https://m.kuaidi100.com/query',
      data: data,
      hideErrorTip: true
    });
  }



}