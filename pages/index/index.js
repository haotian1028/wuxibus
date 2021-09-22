// index.js
// 获取应用实例
const app = getApp()
//console.log(app.globalData.test.subtest);

Page({
  data: {
    rt1msg1:'火车站北广场-海豚A座',
    rt1msg2:'海豚A座-火车站北广场',
    rt2msg1:'小桃园地铁站-海豚A座',
    rt2msg2:'海豚A座-小桃园地铁站',
    
  },
  // 事件处理函数
  
  onLoad() {
    
  },

  /**
  * 用户点击右上角分享
  */
 onShareAppMessage: function () {
  
}
})

