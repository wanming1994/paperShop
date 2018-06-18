let Ajax = require('./ajax.js')

module.exports = class Receiver extends Ajax {
    /**
     * 根据收货地址国家码获取区域编码
     * code 国家码
     */
    getAreaId(data) {
        super.get({
            url:'applet/area/getAreaIdByCode.jhtml',
            data:data
        });
    }


    /**
     * 保存收货地址
     * areaId 区域Id
     * consignee 收货人
     * address 详细地址
     * phone 电话
     */
    save(data) {
        super.post({
          url: 'address/save',
            data: data
        });
    }

    /**
     * 收货地址设为默认
     * id 收货地址Id
     */
    setDefault(data) {
        super.post({
            url:'applet/member/receiver/setIsDefault.jhtml',
            data:data
        });
    }
}