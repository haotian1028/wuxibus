// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  //const wxContext = cloud.getWXContext()
  var route = event.route;
  var latitude = Number(event.latitude);
  var longitude = Number(event.longitude);
  var speed = event.speed;
  var dataList = new Array();
  var stop = null;
  var ifruntime = ifRunTime(route);
  var currentStop = null;
  if (true) { //为了测试把runtime替换成了true
    await cloud.database().collection(route)
      .get()
      .then(res => {
        console.log("获取成功", res)
        var len = res.data.length;
        var counter = 0;
        for (var i = 0; i < len; i++) {
          if (res.data[i].tag != "USER") {
            dataList[counter] = {
              latitude: Number(res.data[i].latitude),
              longitude: Number(res.data[i].longitude),
              name: res.data[i].name,
            }
            counter++;
          }
        }
        console.log(dataList)
      })
    var len = dataList.length;
    var flag = true;
    for (var i = 0; i < len; i++) { //距离站点位置100m范围认为到站
      if (flag && (((dataList[i].latitude - 0.000899) <= latitude) && ((dataList[i].latitude + 0.000899) >= latitude)) && (((dataList[i].longitude - 0.001141) <= longitude) && ((dataList[i].longitude + 0.001141) >= longitude))) {
        console.log(dataList[i].name)
        stop = dataList[i].name;
        flag = false;
      }
    }
    var time = Number(new Date()); //获得当前时间戳
    if (flag == true) { //没有到站正在行驶中,只更新速度和时间戳
      await cloud.database().collection("busLocation").where({
        route: route,
      }).update({
        // data 传入需要局部更新的数据
        data: {
          ifStop: false,
          speed: speed,
          timeTamp: time,
          latitude: latitude,
          longitude: longitude,
        },
        success: function (res) {
          console.log(res.data)
        }
      })
      return {
        stop: "行驶中"
      }
    }
    await cloud.database().collection("busLocation").where({
      route: route,
    }).update({
      // data 传入需要局部更新的数据
      //为了保证到站的HTTP trigger只触发一次，先判断现有的数据，如果不同，触发HTTP Trigger，否则不触发
      data: {
        ifStop: true,
        currentStop: stop,
        speed: speed,
        timeTamp: time,
        latitude: latitude,
        longitude: longitude,
      },
      success: function (res) {
        console.log(res.data)
      }
    })

    return {
      test: dataList,
      stop: "已到站点" + stop,
      event: event,
    }
  } else {
    return {
      stop: "不在运行时间，无须上传位置"
    }
  }
}

function ifRunTime(route) {
  var time = new Date(); //实时时间
  //time.setHours(time.getHours+8);//UTC+8时间
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
}