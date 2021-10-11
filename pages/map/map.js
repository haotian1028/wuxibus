// pages/route1_1.js
// 获取应用实例
const app = getApp();
let ifcollected = false;
let plugin = requirePlugin('routePlan');
let key = 'HVJBZ-GGDK6-AUCS7-M6JZX-WJAMO-ZWBSK'; //使用在腾讯位置服务申请的key
let referer = 'wuxi bus'; //调用插件的app的名称
var datalist_;
var route;
var a;
wx.cloud.init()

Page({
  //点击事件
  ontap: function (options) {
    var that = this;
    let index = options.currentTarget.dataset.index;
    console.log(index);
    // 根据index找到test对应索引中对应要修改的参数
    let ifCollected = "datalist[" + index + "].ifcollcected";
    let Tag = "datalist[" + index + "].tag";
    console.log("点击获取的数据", options.currentTarget.dataset)

    if (options.currentTarget.dataset.item.ifcollected == false) {
      wx.showActionSheet({
        itemList: [
          '导航',
          '收藏'
        ],
        success(res) {
          if (res.tapIndex == 0) {
            // wx.navigateTo({
            //   url: 'plugin://routePlan/index?key=' + key + '&referer=' + referer + '&endPoint=' + endPoint1 + '&mode=' + "walking"
            // })
            wx.openLocation({
              latitude: Number(options.currentTarget.dataset.item.latitude),
              longitude: Number(options.currentTarget.dataset.item.longitude),
              name: options.currentTarget.dataset.item.name,
              scale: 28
            })
          }
          if (res.tapIndex == 1) {
            wx.cloud.callFunction({
                name: "collect",
                data: {
                  route: route,
                  id: options.currentTarget.dataset.item._id,
                  name: options.currentTarget.dataset.item.name,
                  time: options.currentTarget.dataset.item.time,
                  latitude: options.currentTarget.dataset.item.latitude,
                  longitude: options.currentTarget.dataset.item.longitude,
                }
              })
              .then(res => {
                console.log("?改变收藏状态成功", res)
                that.setData({ //点击收藏即获得写入数据库的openid
                  openid: res.result,
                })
              })
              .catch(res => {
                console.log("?改变收藏状态失败", res)
              })
            that.setData({
              [ifCollected]: true,
              [Tag]: "已收藏"
            })
            options.currentTarget.dataset.item.ifcollected = true;

            //console.log(options.currentTarget.dataset.item.tag);
          }
        }
      })
    }

    if (options.currentTarget.dataset.item.ifcollected == true) {
      wx.showActionSheet({
        itemList: [
          '导航',
          '取消收藏'
        ],
        success(res) {
          if (res.tapIndex == 0) {
            // wx.navigateTo({
            //   url: 'plugin://routePlan/index?key=' + key + '&referer=' + referer + '&endPoint=' + endPoint1 + '&mode=' + "walking"
            // })
            wx.openLocation({
              latitude: Number(options.currentTarget.dataset.item.latitude),
              longitude: Number(options.currentTarget.dataset.item.longitude),
              name: options.currentTarget.dataset.item.name,
              scale: 28
            })
          }
          if (res.tapIndex == 1) {
            console.log(options.currentTarget.dataset.item);

            wx.cloud.callFunction({
                name: "discollect",
                data: {
                  route: route,
                  id: options.currentTarget.dataset.item._id,
                  openid: that.openid,
                }
              })
              .then(res => {
                console.log("改变收藏状态成功", res)
              })
              .catch(res => {
                console.log("改变收藏状态失败", res)
              })

            that.setData({
              [ifCollected]: false,
              [Tag]: null
            })
            options.currentTarget.dataset.item.ifcollected = false;
          }
        }
      })
    }

    // this.onLoad();


  },
  overview: function (options) {
    wx.navigateTo({
      url: '../loaction/location?route=' + route,
    })

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
    collect: null,
    datalist: [],
    openid: null,
    stop: null,
    route11msg0: null,
    route11msg1: "实时位置加载中...",
    routemsgtitle: "",
    routemsgtime: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var openid_;
    route = options.route;
    console.log(route);
    switch (route) {
      case "route1-1f":
        this.setData({
          routemsgtitle: "Route 1 去程",
          routemsgtime: "运行时间 7:40-9:40",
        })
        break;
      case "route1-2f":
        this.setData({
          routemsgtitle: "Route 1 回程",
          routemsgtime: "运行时间 18:00-19:10",
        })
        break;
      case "route2-1f":
        this.setData({
          routemsgtitle: "Route 2 去程",
          routemsgtime: "运行时间 7:40-9:40",
        })
        break;
      case "route2-2f":
        this.setData({
          routemsgtitle: "Route 2 回程",
          routemsgtime: "运行时间 18:00-19:10",
        })
        break;
    }
    wx.cloud.callFunction({
      name: 'getid',
      data: {
        message: 'helloCloud',
      }
    }).then(res => {
      console.log(res.result.openid) //res就将appid和openid返回了
      //做一些后续操作，不用考虑代码的异步执行问题。
      openid_ = res.result.openid;
      wx.cloud.database().collection(route)
        .get()
        .then(res => {
          console.log("获取成功", res)
          var len = res.data.length;
          var dataList = new Array();
          for (var i = 0; i < len; i++) {
            if (res.data[i].tag != "USER") {
              dataList.push(res.data[i])
            } else if (res.data[i].openid == openid_) {
              for (var j = 0; j < i - 1; j++) {
                if (res.data[j]._id == res.data[i].stopid) {
                  dataList[j].ifcollected = true;
                  dataList[j].tag = "已收藏";
                }
              }
            }
          }
          console.log(dataList);
          this.setData({
            datalist: dataList,
            openid: openid_
          })
          datalist_ = res.data;
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
  getBusData: function () {
    var that=this;

    wx.cloud.database().collection('busLocation')
      .where({
        route: route,
      })
      .get()
      .then(res => {
        var databasetime = new Date(res.data[0].timeTamp);
        var ifstop = res.data[0].ifStop;
        var timeEnd0 = new Date();
        timeEnd0.setSeconds(databasetime.getSeconds() - 180)
        //console.log(databasetime)
        //服务器时间处于客户端时间的前3分内即视作同步成功
        console.log("stop获取成功", res)
        if (databasetime < timeEnd0) {
          that.setData({
            route11msg1: "失去同步!",
          })
        } else {
          if (ifstop) {
            that.setData({
              route11msg1: "已到站点: " + res.data[0].currentStop + " 请尽快上车",
            })
          } else {
            that.setData({
              route11msg1: "行驶中，上一站 " + res.data[0].currentStop,
            })
          }
        }
        //console.log("datalist:", datalist.data)
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
      this.setData({
        route11msg0: "班车运行中"
      }) //只用处于运行时间时才自动查询数据库
      //先执行一次
      that.getBusData();
      a = setInterval(function () {
        //循环执行代码 
        that.getBusData();
        if (!ifruntime) //跳出条件,不在运行时间就不会查询数据库了
        {
          clearInterval(a)
        }
      }, 10000) //十秒钟查询一次数据库
    } else {
      that.setData({
        route11msg0: "不在运行时间",
        route11msg1: "",
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    console.log("go out!")
    clearInterval(a); 

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    console.log("go out!")
    clearInterval(a); //退出时终止查询数据库

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