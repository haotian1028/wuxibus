// index.js
// 获取应用实例
const app = getApp()
let ifcollected = false;
let plugin = requirePlugin('routePlan');
let key = 'HVJBZ-GGDK6-AUCS7-M6JZX-WJAMO-ZWBSK'; //使用在腾讯位置服务申请的key
let referer = 'wuxi bus'; //调用插件的app的名称
wx.cloud.init()
//console.log(app.globalData.test.subtest);

Page({
  data: {
    notice: false,
    content: null,
    datalist: [],
    datalist2: [],
    datalist3: [],
    datalist4: [],
    routeflag: false,
    routeurl: "",
    ALLdatalist: [],
    routemsg: "师傅的专属位置上传界面，未到运行时间",
    loading: true,
    Datalist: [{
        title: "Route 1  去程",
        msg: "始发站：火车站北广场",
        msg2: "运行时间：7:50—9:00",
        msg3: "RT1",
        url: "../map/map?route=route1-1f",
        icon: "/icon/back.png",
        color: "#39FF"

      },
      {
        title: "Route 1  回程",
        msg: "始发站：海豚A座",
        msg2: "运行时间：6:10—7:00",
        msg3: "RT1",
        url: "../map/map?route=route1-2f",
        icon: "/icon/go.png",
        color: "#39FF"
      },
      {
        title: "Route 2  去程",
        msg: "始发站：小桃园地铁站",
        msg2: "运行时间：7:50—9:00",
        msg3: "RT2",
        url: "../map/map?route=route2-1f",
        icon: "/icon/back.png",
        color: "#CEB992"

      },
      {
        title: "Route 2  回程",
        msg: "始发站：海豚A座",
        msg2: "运行时间：6:10—7:00",
        msg3: "RT2",
        url: "../map/map?route=route2-2f",
        icon: "/icon/go.png",
        color: "#CEB992"
      }
    ],
  },

  ifHere: function (positon) { //附近50m的距离，如果到站的话司机的面板上的等待人数会自动减去1
    if ((((positon.latitude - 0.000899) <= positon.curLatitude) && ((positon.latitude + 0.000899) >= positon.curLatitude)) && (((positon.longitude - 0.001141) <= positon.curLongitude) && ((positon.longitude + 0.001141) >= positon.curLongitude))) {
      return true;
    } else {
      return false;
    }
  },
  // 事件处理函数
  Ontap: function (options) {

    wx.navigateTo({
      url: options.target.dataset.item.url,
    })
  },
  ontap: function (options) {

    var that = this;
    console.log("ONTAP!!!!!点击获取的数据", options.currentTarget.dataset.index);
    var index = options.currentTarget.dataset.index;
    var position = {
      'latitude': options.currentTarget.dataset.item.latitude,
      'longitude': options.currentTarget.dataset.item.longitude,
      'curLatitude': "",
      'curLongitude': "",
    }

    let endPoint1 = JSON.stringify({ //终点
      'name': options.currentTarget.dataset.item.name,
      'latitude': options.currentTarget.dataset.item.latitude,
      'longitude': options.currentTarget.dataset.item.longitude,
    });
    console.log("first" + options.currentTarget.dataset.item.reserve)
    if (options.currentTarget.dataset.item.reserve == false) {
      wx.showActionSheet({
        itemList: [
          '导航',
          '预约到站'
        ],
        success(res) {
          if (res.tapIndex == 0) {
            wx.navigateTo({
              url: 'plugin://routePlan/index?key=' + key + '&referer=' + referer + '&endPoint=' + endPoint1 + '&mode=' + "walking"
            })
          }
          if (res.tapIndex == 1) {
            //点击触发我将会迟到选项,在此之前判断①是否过站，②是否到达班车运营时间
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
            var flag = true;
            wx.onLocationChange(function (res) { //持续获得位置
              //console.log('location change', res);
              position = {
                'latitude': options.currentTarget.dataset.item.latitude,
                'longitude': options.currentTarget.dataset.item.longitude,
                'name': options.currentTarget.dataset.item.name,
                'curLatitude': res.latitude,
                'curLongitude': res.longitude,
              }

              // console.log(position);

              if (that.ifHere(position) && flag) {
                console.log(options.currentTarget.dataset.item)
                var data=options.currentTarget.dataset.item
                console.log(data)
               
                flag = false;
                
                console.log("!!!" + that.ifHere(position));
                that.setData({
                  notice: true,
                  content: "您已经到达" + data.name + ", 到站预约将取消"
                })
                switch (data.route) {
                  case "route1-1f":
                    var TAG = "RT1去程"
                    break;
                  case "route1-2f":
                    var TAG = "RT1回程"
                    break;
                  case "route2-1f":
                    var TAG = "RT2去程"
                    break;
                  case "route2-2f":
                    var TAG = "RT2回程"
                    break;
                }
                let Tag = "ALLdatalist[" + index + "].Tag";
                let Flag = "ALLdatalist[" + index + "].reserve";
                wx.cloud.callFunction({
                    name: "reserve",
                    data: {
                      route: data.route,
                      id: data._id,
                      flag: false,
                    }
                  }).then(res => {
                    console.log("成功取消预约", res)
                    wx.stopLocationUpdate();
                    that.setData({
                      [Tag]: TAG,
                      [Flag]: false,
                    })
                    data.reserve = false;
                    console.log(data.reserve)
                  })
                  .catch(res => {
                    console.log("改变预约状态失败", res)
                  })

              }

            })
            switch (options.currentTarget.dataset.item.route) {
              case "route1-1f":
                var TAG = "RT1去程"
                break;
              case "route1-2f":
                var TAG = "RT1回程"
                break;
              case "route2-1f":
                var TAG = "RT2去程"
                break;
              case "route2-2f":
                var TAG = "RT2回程"
                break;
            }


            let Tag = "ALLdatalist[" + index + "].Tag";
            let Flag = "ALLdatalist[" + index + "].reserve"



            wx.cloud.callFunction({
                name: "reserve",
                data: {
                  route: options.currentTarget.dataset.item.route,
                  id: options.currentTarget.dataset.item._id,
                  flag: true,
                }
              }).then(res => {
                console.log("成功预约", res)
                that.setData({
                  [Tag]: TAG + ", 已预约",
                  [Flag]: true
                })
                options.currentTarget.dataset.reserve = true;
                console.log("later" + options.currentTarget.dataset.reserve)

              })
              .catch(res => {
                console.log("改变收藏状态失败", res)
              })


          }

        }


      })
    } else if (options.currentTarget.dataset.item.reserve == true) {

      wx.showActionSheet({
        itemList: [
          '导航',
          '取消预约'
        ],
        success(res) {
          if (res.tapIndex == 0) {
            wx.navigateTo({
              url: 'plugin://routePlan/index?key=' + key + '&referer=' + referer + '&endPoint=' + endPoint1 + '&mode=' + "walking"
            })
          }
          if (res.tapIndex == 1) {

            //点击触发我将会迟到选项,在此之前判断①是否过站，②是否到达班车运营时间

            switch (options.currentTarget.dataset.item.route) {
              case "route1-1f":
                var TAG = "RT1去程"
                break;
              case "route1-2f":
                var TAG = "RT1回程"
                break;
              case "route2-1f":
                var TAG = "RT2去程"
                break;
              case "route2-2f":
                var TAG = "RT2回程"
                break;
            }

            let Tag = "ALLdatalist[" + index + "].Tag";
            let Flag = "ALLdatalist[" + index + "].reserve";


            wx.cloud.callFunction({
                name: "reserve",
                data: {
                  route: options.currentTarget.dataset.item.route,
                  id: options.currentTarget.dataset.item._id,
                  flag: false,
                }
              }).then(res => {

                wx.stopLocationUpdate();

                that.setData({
                  [Tag]: TAG,
                  [Flag]: false,
                })
                console.log("set!!!成功取消预约", res)

                options.currentTarget.dataset.reserve = false;
                console.log(options.currentTarget.dataset)
                console.log(that.Alldatalist)
              })
              .catch(res => {
                console.log("改变预约状态失败", res)
              })
          }
        }
      })
    }



    // this.onLoad();
  },
  Reserve: function (data, index) {

    console.log("!!!" + index)
    var position;
    console.log(data)

    var that = this;
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
    wx.onLocationChange(function (res) { //持续获得位置
      position = {
        'latitude': data.latitude,
        'longitude': data.longitude,
        'curLatitude': res.latitude,
        'curLongitude': res.longitude,
        'name': data.name
      }

      console.log(position);
      console.log(that.ifHere(position));
      if (that.ifHere(position)) {
        wx.stopLocationUpdate()
        console.log("!!!" + that.ifHere(position));

        that.setData({
          notice: true,
          content: "您已经到达" + data.name + ", 到站预约将取消"
        })



        switch (data.route) {
          case "route1-1f":

            var TAG = "RT1去程"
            break;
          case "route1-2f":

            var TAG = "RT1回程"
            break;
          case "route2-1f":

            var TAG = "RT2去程"
            break;
          case "route2-2f":

            var TAG = "RT2回程"
            break;
        }

        let Tag = "ALLdatalist[" + index + "].Tag";
        let Flag = "ALLdatalist[" + index + "].reserve";


        wx.cloud.callFunction({
            name: "reserve",
            data: {
              route: data.route,
              id: data._id,
              flag: false,
            }
          }).then(res => {
            console.log("成功取消预约", res)
            wx.stopLocationUpdate();

            that.setData({
              [Tag]: TAG,
              [Flag]: false,
            })
            data.reserve = false;
            console.log(data.reserve)
          })
          .catch(res => {
            console.log("改变预约状态失败", res)
          })
      }

    })

  },
  ifRunTime: function (route) {
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

  onLoad: function (options) {
    var that = this;
    wx.cloud.callFunction({
      name: 'getid',
      data: {
        message: 'helloCloud',
      }
    }).then(res => {
      console.log(res.result.openid)
      if (true) { //res.result.openid == "oB9mv5XpFxSS9Yni0GL92Wijqznc") {
        if (true) { //that.ifRunTime("route1-1f")) {
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
      } else if (res.result.openid == "oB9mv5c8ONADNylM5UqmXJBUg_Aw") {
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
      var ALLdatalist = [];
      wx.cloud.database().collection('route1-1f')
        .where({
          tag: "USER",
          openid: res.result.openid,
        })
        .get()
        .then(res => {

          var len = res.data.length;
          for (var i = 0; i < len; i++) {
            res.data[i]['route'] = 'route1-1f'
            if (res.data[i]['reserve'] == true) {
              res.data[i]['Tag'] = "RT1去程, 已预约"
              console.log(res.data[i]);
              this.Reserve(res.data[i],i)
             
            } else {
              res.data[i]['Tag'] = "RT1去程"
            }
          }
          ALLdatalist = ALLdatalist.concat(res.data)
          console.log(ALLdatalist)
          this.setData({
            ALLdatalist: ALLdatalist
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

          var len = res.data.length;
          for (var i = 0; i < len; i++) {
            console.log(res.data[i]);
            res.data[i]['route'] = 'route1-2f'

            if (res.data[i]['reserve'] == true) {
              res.data[i]['Tag'] = "RT1回程, 已预约"
              this.Reserve(res.data[i],i)
            } else {
              res.data[i]['Tag'] = "RT1回程"
            }
          }
          ALLdatalist = ALLdatalist.concat(res.data)
          this.setData({
            ALLdatalist: ALLdatalist
          })

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

          var len = res.data.length;
          for (var i = 0; i < len; i++) {
            console.log(res.data[i]);
            res.data[i]['route'] = 'route2-1f'
            if (res.data[i]['reserve'] == true) {
              res.data[i]['Tag'] = "RT2去程, 已预约"
              this.Reserve(res.data[i],i)
              
            } else {
              res.data[i]['Tag'] = "RT2去程"
            }
          }
          ALLdatalist = ALLdatalist.concat(res.data)
          this.setData({
            ALLdatalist: ALLdatalist
          })
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

          var len = res.data.length;
          for (var i = 0; i < len; i++) {
            console.log(res.data[i]);
            res.data[i]['route'] = 'route2-2f'
            if (res.data[i]['reserve'] == true) {
              res.data[i]['Tag'] = "RT2回程, 已预约"
              this.Reserve(res.data[i],i)
              
            } else {
              res.data[i]['Tag'] = "RT2回程"
            }
          }
          ALLdatalist = ALLdatalist.concat(res.data)
          console.log(ALLdatalist)
          this.setData({
            datalist4: res.data,
            ALLdatalist: ALLdatalist
          })
        })
        .catch(res => {
          console.log("获取失败", res)
        })

    })




  },
  onReady: function () {


  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.onLoad();

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.onUnload();
    console.log("!!!exit")

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})