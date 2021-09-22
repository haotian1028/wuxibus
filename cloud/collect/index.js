// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  let { OPENID, APPID, UNIONID } = cloud.getWXContext();
  return await cloud.database().collection(event.route)
            .add({
              data:{
                tag:"USER",
                name:event.name,
                time:event.time,
                latitude:event.latitude,
                longitude:event.longitude,
                stopid:event.id,
                openid:OPENID
              }
            })
            .then(res=>{
              console.log("改变收藏状态成功",res)
              return res
            })
            .catch(res=>{
              console.log("改变收藏状态失败",res)
              return res
            }),
            OPENID
}