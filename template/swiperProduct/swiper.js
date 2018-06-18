

module.exports = {
  _adswiperimageload(e) {
    let screenWidth = wx.getSystemInfoSync().screenWidth
    let name = e.currentTarget.dataset.name
    let imageWidth = e.detail.width
    let imageHeight = e.detail.height
    let height = (screenWidth / imageWidth) * imageHeight
    let _swiper = this.data._swiper ? this.data._swiper : {}
    if (_swiper[name] && _swiper[name].height >= height) {
      return
    }
    _swiper[name] = {}
    _swiper[name].height = height
    _swiper[name].videoShow = true
    this.setData({
      _swiper: _swiper
    })
  },
  _swiper_video_toogle(e) {
    let name = e.currentTarget.dataset.name
    let stype = e.currentTarget.dataset.type
    this.data._swiper[name].videoShow = stype == 1 ? false : true 
    this.setData({
      _swiper: this.data._swiper
    })
  }
}