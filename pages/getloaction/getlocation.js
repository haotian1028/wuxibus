wx.cloud.init()
var ifstart;
var route;
Page({
  onclick: function (params) {
    var flag = this.ifRunTime(route)
    var that = this;
    if (true) { //temp_for_test
      ifstart = true;
      wx.startLocationUpdateBackground({
        success: (res) => {
          console.log("success" + res);
        },
        fail: (res) => {
          console.log(res);
          wx.authorize({
            scope: 'scope.userLocationBackground'
          }); //authorize
        }
      })
      wx.onLocationChange(function (res) {
        that.setData({
          startLocation: "正在上传位置信息...",
          stopLocation: "点击结束上传"
        })

        console.log('location change', res);
        wx.cloud.callFunction({
            name: "uploadRoutedata",
            data: {
              route: route,
              latitude: res.latitude,
              longitude: res.longitude,
              speed: res.speed
            }
          })
          .then(res => {
            console.log("写入位置信息", res)
            that.setData({
              stop: res.result.stop
            })
          })
          .catch(res => {
            console.log("?获取位置信息失败", res)
          })
      })
    }

  },
  stopLocation: function (params) {
    ifstart = false;
    wx.stopLocationUpdate();
    wx.offLocationChange();
    this.setData({
      stopLocation: "未上传位置信息"
    })
    var options={route}
    this.onLoad(options);

  },
  ifRunTime: function (route) {
    var time = new Date(); //实时时间
    var starttime0 = new Date(); //去程开始时间
    starttime0.setHours(7);
    starttime0.setMinutes(40);
    var stoptime0 = new Date(); //去程结束时间
    stoptime0.setHours(9);
    stoptime0.setMinutes(20);
    var starttime1 = new Date(); //回程开始时间
    starttime1.setHours(18);
    starttime1.setMinutes(1);
    var stoptime1 = new Date(); //回程结束时间
    stoptime1.setHours(19);
    stoptime1.setMinutes(20);
    //7:40~9:20是大巴运行去程时间
    if (route == "route1-1f" || route == "route2-1f") {
      if (time >= starttime0 && time <= stoptime0) {
        return true;
      } else {
        return false;
      }
    } else if (route == "route1-2f" || route == "route2-2f") {
      if (time >= starttime1 && time <= stoptime1) {
        return true;
      } else {
        return false;
      }
    }
  },
  /**
   * 页面的初始数据
   */
  data: {
    stop: "",
    startLocation: "",
    stopLocation: "未上传位置信息",
    routemsg: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    route = options.route;
    this.setData({
      routemsg: route
    })
    console.log(route);
    var flag = this.ifRunTime(route);
    if (ifstart) {
      this.onclick();
      this.setData({
        startLocation: "正在上传位置信息...",
        stopLocation: "点击结束上传",
      })
    } else if (flag) {
      this.setData({
        startLocation: "已到运行时间，请点击上传实时位置"
      })
    } else {
      this.setData({
        startLocation: "未到运行时间，无须上传位置"
      })
    }

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})