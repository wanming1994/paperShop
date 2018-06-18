let Ajax = require('./ajax.js')

module.exports = class coupon extends Ajax {
    /**
     * 我的优惠券
     * tenantId 商家Id
     * pageSize 每页记录数
     * pageNumber 页码
     */
    list(data) {
        super.get({
            url:"coupon/list",
            data: data,
            success: this.fn
        });
    }

    /**
     * 店铺可领用优惠券
     * tenantId 店铺Id
     * pageSize 页大小
     * pageNumber 页码
     */
    listT(data) {
        super.get({
            url:"applet/coupon/list.jhtml",
            data: data
        });
    }

    /**
     * 领取优惠券
     * id 优惠券Id
     */
    pickup(data){
        super.post({
            url:'applet/coupon/pickup.jhtml',
            data: data
        });
    }

    /**
    * 会员卡列表
    * tenantId 数量
    */
    cardlist (data) {
      super.get({
        url:'weixin/member/card/list.jhtml',
        data: data,
      });
    }

}