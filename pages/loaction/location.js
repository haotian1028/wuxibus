// pages/loaction/location.js
var datalist_ = [];
var positions = [];
var route;
var that, thatonshow;
var Maker = [];
var moveLatitude = "";
var moveLongitude = "";
var a;
Page({
  ifRunTime: function (route) { //runtimetest
    var time = new Date(); //实时时间
    var starttime0 = new Date(); //去程开始时间
    starttime0.setHours(7);
    starttime0.setMinutes(30);
    var stoptime0 = new Date(); //去程结束时间
    stoptime0.setHours(9);
    stoptime0.setMinutes(20);
    var starttime1 = new Date(); //回程开始时间
    starttime1.setHours(18); //Should be 18
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
    latitude: null,
    longitude: null,
    markers: [],
    polyline: [],
    scale: null,
  },
  iniData() {
    datalist_ = [];
    positions = [];
    Maker = [];
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.iniData();
    that = this;
    route = options.route;
    console.log(route);
    var database = options.route;
    //获取数据库中收藏信息
    wx.cloud.database().collection(database)
      .get()
      .then(res => {
        var len = res.data.length;
        var dataList = new Array();
        for (var i = 0; i < len; i++) {
          if (res.data[i].tag != "USER") {
            dataList.push(res.data[i]);
          }
        }
        this.setData({
          datalist: dataList,
        })
        datalist_ = dataList;
        console.log(datalist_);
        var len = datalist_.length;
        for (var i = 0; i < len; i++) {
          Maker[i] = {
            longitude: Number(datalist_[i].longitude),
            latitude: Number(datalist_[i].latitude),
            iconPath: "/icon/stop.png",
            id: i + 1,
            width: 35,
            height: 35,
          };
          positions[i] = {
            longitude: Number(datalist_[i].longitude),
            latitude: Number(datalist_[i].latitude)
          };
          // Maker[len] = {
          //   iconPath: "/icon/bus.png",
          //   id: 0,
          //   latitude: positions[0].latitude,
          //   longitude: positions[0].longitude,
          //   width: 30,
          //   height: 30
          // }
        }
        console.log(positions);

        that.setData({
          scale: 12,
          latitude: positions[4].latitude,
          longitude: positions[4].longitude,
          markers: Maker,
          polyline: [{
            points: positions,
            color: "#FA9000",
            width: 5,
            arrowLine: true,
            borderWidth: 1 //线的边框宽度，还有很多参数，请看文档 
          }],
        })
        // that.startroute();
      })
      .catch(res => {
        console.log("获取失败", res)
      })
  },
  // startroute: function (e) {
  //   thatonshow = this;
  //   that.MapContext = wx.createMapContext('123');
  //   that.MapContext.moveAlong({
  //     markerId: 0,
  //     path: positions,
  //     duration: 20000,
  //     autoRotate: true,
  //   });
  //   console.log("check if moveAlong")
  // },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getBusData();


  },
  getBusData: function () {
    var len = datalist_.length;
    var that = this;
    wx.cloud.database().collection('busLocation')
      .where({
        route: route,
      })
      .get()
      .then(res => {
        var databasetime = new Date(res.data[0].timeTamp);
        // var ifstop = res.data[0].ifStop;
        var timeEnd0 = new Date();
        timeEnd0.setSeconds(databasetime.getSeconds() - 180)
        console.log(databasetime)
        //服务器时间处于客户端时间的前3分内即视作同步成功
        console.log("stop获取成功", res)
        if (databasetime < timeEnd0) {
          moveLatitude = res.data[0].latitude;
          moveLongitude = res.data[0].longitude;
          console.log("失去同步")
          Maker[len]={
            iconPath: "/icon/bus.png",
            id: 100,
            latitude: moveLatitude,
            longitude: moveLongitude,
            width: 20,
            height: 20
          }
        } else {
          moveLatitude = res.data[0].latitude;
          moveLongitude = res.data[0].longitude;
          Maker[len]={
            iconPath: "/icon/bus.png",
            id: 100,
            latitude: moveLatitude,
            longitude: moveLongitude,
            width: 30,
            height: 30
          }
          // if (ifstop) {
          //   that.setData({
          //     route11msg1: "已到站点: " + res.data[0].currentStop + " 请尽快上车",
          //   })
          // } else {
          //   that.setData({
          //     route11msg1: "行驶中，上一站 " + res.data[0].currentStop,
          //   })
          // }
        }
        console.log(Maker)
        that.setData({
          markers: Maker
        })
        console.log("move postition:" + moveLatitude + " " + moveLongitude)
      })
      .catch(res => {
        console.log("获取失败", res)
      })
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    var that = this;
    var ifruntime = this.ifRunTime(route);
    this.onLoad();
    if (ifruntime) {
      // this.setData({
      //   route11msg0: "班车运行中"
      // }) //只用处于运行时间时才自动查询数据库
      //先执行一次
      console.log("班车运行中")
      a = setInterval(function () {
        //循环执行代码
        that.getBusData();
        if (!ifruntime) //跳出条件,不在运行时间就不会查询数据库了
        {
          clearInterval(a)
        }
      }, 10000) //十秒钟查询一次数据库
    } else {
      // that.setData({
      //   route11msg0: "不在运行时间",
      //   route11msg1: "",
      // })
      console.log("不在运行时间")
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    clearInterval(a)//结束查询


  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    clearInterval(a)


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