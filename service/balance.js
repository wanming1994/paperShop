let Ajax = require('./ajax.js')

module.exports = class Balance extends Ajax {
    /**
     * 登陆接口
     * @param String js_code wx.login获得
     * @param Number cid 1
     */
    login(data) {
        super.post({
            url: '/applet/login.jhtml',
            data: data
        })
    }


    /**
     * 读取会员余额资料
     */
    balance(data) {
        super.get({
            url: "applet/member/wallet/view.jhtml",
            data: data
        })
    }

    /**
     * 提现银行卡保存
     * memberBankId 银行编号 对应 bandInfo
     * amount 提现金额
     * enPassword 加密后的支付密码
     */

    cashBank(data) {
        super.post({
            url: "applet/member/wallet/withdraw.jhtml",
            data: data
        })
    }

    /**
     * 提现到微信
     * memberBankId 银行编号 对应 bandInfo
     * amount 提现金额
     * enPassword 加密后的支付密码
     */

    cashWeixin(data) {
        super.post({
            url: "applet/member/wallet/weixin_withdraw.jhtml",
            data: data
        })
    }

    /**
     * 计算提现支付手续费
     * amount 提现金额
     */
    calcFee(data) {
        super.post({
            url: "applet/member/wallet/calculate.jhtml",
            data: data
        })
    }

    /**
     * 钱包充值
     * amount 充值金额
     */
    fillWallet(data) {
        super.post({
            url: "applet/member/wallet/fill.jhtml",
            data: data
        })
    }


    /**
     * 本人账单流水明细
     * begin_date 开始时间
     * end_date 结束时间
     * pageSize 页大小
     * pageNumber 页码
     */
    billList(data) {
        super.get({
            url: "applet/member/wallet/bill.jhtml",
            data: data
        })
    }

    /**
     * 本人账单统计
     * begin_date 开始时间
     * end_date 结束时间
     */
    billSumer(data) {
        super.get({
            url: "applet/member/wallet/bill_sumer.jhtml",
            data: data
        })
    }





}