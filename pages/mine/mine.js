// pages/mine/mine.js

const app = getApp();
let ifcollected = false;
let plugin = requirePlugin('routePlan');
let key = 'HVJBZ-GGDK6-AUCS7-M6JZX-WJAMO-ZWBSK'; //使用在腾讯位置服务申请的key
let referer = 'wuxi bus'; //调用插件的app的名称
wx.cloud.init()
Page({

  ontap: function (options) {
    console.log("点击获取的数据", options.currentTarget.dataset.item.tag)
    let endPoint1 = JSON.stringify({ //终点
      'name': options.currentTarget.dataset.item.name,
      'latitude': options.currentTarget.dataset.item.latitude,
      'longitude': options.currentTarget.dataset.item.longitude,
    });
    wx.navigateTo({
      url: 'plugin://routePlan/index?key=' + key + '&referer=' + referer + '&endPoint=' + endPoint1 + '&mode=' + "walking"
    })


    // this.onLoad();


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
    starttime1.setHours(8);//Should be 18
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
    datalist: [],
    datalist2: [],
    datalist3: [],
    datalist4: [],
    routeflag: false,
    routeurl: "",
    routemsg: "师傅的专属位置上传界面，未到运行时间",

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.cloud.callFunction({
      name: 'getid',
      data: {
        message: 'helloCloud',
      }
    }).then(res => {
      console.log(res.result.openid)
      if(true){//res.result.openid == "oB9mv5ZPafuTiWT9dSpS3cglffG8") {
        if (that.ifRunTime("route1-1f")) {
          that.setData({
            routeflag: true,
            routeurl: "../getloaction/getlocation?route=route1-1f",
            routemsg: "RT1去程运行时间，请点击此按钮"
          })
        } else if (that.ifRunTime("route1-2f")) {
          that.setData({
            routeflag: true,
            routeurl: "../getloaction/getlocation?route=route1-2f",
            routemsg: "RT1回程运行时间，请点击此按钮"
          })

        }
        console.log("route1-1's driver")
      } else if (res.result.openid == "123") {
        if (that.ifRunTime("route2-1f")) {
          that.setData({
            routeflag: true,
            routeurl: "../getloaction/getlocation?route=route2-1f",
            routemsg: "RT2去程运行时间，请点击此按钮"
          })
        } else if (that.ifRunTime("route2-2f")) {
          that.setData({
            routeflag: true,
            routeurl: "../getloaction/getlocation?route=route2-2f",
            routemsg: "RT2回程运行时间，请点击此按钮"
          }) //for driver2
        }
      }
      // that.setData({
      //   routeflag: true,
      //   routeurl: "../getloaction/getlocation?route=route1-2f"
      // })//for test
      //获取数据库中收藏信息
      wx.cloud.database().collection('route1-1f')
        .where({
          tag: "USER",
          openid: res.result.openid,
        })
        .get()
        .then(res => {
          console.log("获取成功", res)
          this.setData({
            datalist: res.data
          })
          //console.log("datalist:", datalist.data)
        })
        .catch(res => {
          console.log("获取失败", res)
        })
      wx.cloud.database().collection('route1-2f')
        .where({
          tag: "USER",
          openid: res.result.openid,
        })
        .get()
        .then(res => {
          console.log("获取成功", res)
          this.setData({
            datalist2: res.data
          })
          //console.log("datalist:", datalist.data)
        })
        .catch(res => {
          console.log("获取失败", res)
        })

      wx.cloud.database().collection('route2-1f')
        .where({
          tag: "USER",
          openid: res.result.openid,
        })
        .get()
        .then(res => {
          console.log("获取成功", res)
          this.setData({
            datalist3: res.data
          })
          //console.log("datalist:", datalist.data)
        })
        .catch(res => {
          console.log("获取失败", res)
        })

      wx.cloud.database().collection('route2-2f')
        .where({
          tag: "USER",
          openid: res.result.openid,
        })
        .get()
        .then(res => {
          console.log("获取成功", res)
          this.setData({
            datalist4: res.data
          })
          //console.log("datalist:", datalist.data)
        })
        .catch(res => {
          console.log("获取失败", res)
        })
    })


  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    //this.onUnload();

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