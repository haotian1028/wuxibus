// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event.route + event.flag + event.id)
  await cloud.database().collection(event.route).where({
      tag: "USER",
      _id: event.id,
    }).update({
      data:{
      reserve: event.flag
      }})
    .then(res => {
      console.log("改变预约状态成功", res)
      return res
    })
    .catch(res => {
      console.log("改变预约状态失败", res)
      return res
    })
}