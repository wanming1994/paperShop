

module.exports = {
  //ajax请求baseurl
  BASE_URL: "http://www.yunelink.com/estong-admin/api/",
  //登陆失败后尝试重复登陆次数
  LOGIN_ERROR_TRY_COUNT: 5,
  //登陆失败后多长时间间隔重新发起登陆请求
  LOGIN_ERROR_TRY_TIMEOUT: 1000,
  //上传接口地址
  UPLOAD_URL: "/applet/file/upload2local.jhtml",
  //上传临时文件接口地址
  UPLOAD_TEMP_URL: "applet/file/upload_temp.jhtml",
  //小程序id
  APPID: "wx833eb63309af7724"
}