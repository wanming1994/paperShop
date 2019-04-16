let Ajax = require('./ajax.js')

module.exports = class Product extends Ajax {


  /**
   * 商品热销列表
   *
   */
  list(data) {
    super.get({
      url: 'index/index',
      data: data
    });
  }


  /**
   * 商品详情
   * id 商品Id
   */
  view(data) {
    super.get({
      url: 'goods/detail',
      data: data
    });
  }


  /**
   * 兑换商品列表
   * page, size
   */
  exchangeList(data) {
    super.get({
      url: 'goods/exchangeList',
      data: data
    });
  }


  /**
   * 商品详情页分享
   * id 商品Id
   */
  share(data) {
    super.get({
      url: 'applet/product/share.jhtml',
      data: data

    });
  }



  /**
   * 分类
   * id 商品
   */
  category(data) {
    super.get({
      url: 'goods/category',
      data: data

    });
  }

  /**
   * 分类
   * id 商品
   */
  categoryList(data) {
    super.get({
      url: 'goods/list',
      data: data

    });
  }

  /**
   * 分类
   * id 商品
   */
  catalogIndex(data) {
    super.get({
      url: 'catalog/index',
      data: data
    });
  }


  /**
   * 分类
   * id 商品
   */
  catalogCurrent(data) {
    super.get({
      url: 'catalog/current',
      data: data
    });
  }


  /**
   * 生成二维码
   */
  createUserQRCode(data) {
    super.get({
      url: 'goods/createGoodsQRCode',
      hideErrorTip: true,
      data: data
    })
  }

  /**
   * 首页限时抢购商品
   */
  indexPromotion(data) {
    super.get({
      url: 'Promotion/list',
      hideErrorTip: true,
      data: data
    })
  }


}