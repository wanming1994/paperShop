let Ajax = require('./ajax.js')

module.exports = class Cart extends Ajax {
  /**
   * 购物车列表
   * tenantId 商家Id
   */
  list(data) {
    super.get({
      url: 'cart/getCart',
      data: data
    });
  }
  /**
   * 编辑数量
   * cid 购物项Id
   * count 数量
   * addressId 地址id
   */
  edit(data) {
    super.post({
      url: 'cart/update',
      data: data
    });
  }

  /**
   * 添加至购物车
   * ecouponsType 
   * ecouponsId 
   * ecouponsCnt
   * specificationId
   * addreddId
   *
   */
  add(data) {
    super.post({
      url: 'cart/add',
      data: data
    });
  }


  /**
   * 选择
   * cartIds 购物项Id(数组)
   */
  selected(data) {
    super.post({
      url: 'cart/checked',
      data: data,
      traditional: true
    });
  }
  /**
   * 删除
   * cartIds 购物项id(数组)
   */
  delete(data) {
    super.post({
      url: 'cart/delete',
      data: data,
      traditional: true
    });
  }

  /**
  * 确认订单页
  */
  orderCon(data) {
    super.post({
      url: 'cart/info',
      data: data
    });
  }

 

  /**
   * 购物车商品数量
   * tenantId 商家Id
   */
  count(data) {
    super.get({
      url: 'applet/cart/count.jhtml',
      data: data
    })
  }
}