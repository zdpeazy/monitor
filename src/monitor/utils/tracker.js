let host = 'cn-beijing.log.aliyuncs.com';
let project = 'monitor-test-zdp';
let logStore = 'monitor-store';
let userAgent = require('user-agent');

function getExtraData(){
  console.log(navigator.userAgent)
  return {
    title: document.title,
    url: location.href,
    timestamp: Date.now(),
    userAgent: userAgent.parse(navigator.userAgent).full
  }
}

class SendTracker {
  constructor(){
    this.url = `http://${project}.${host}/logstores/${logStore}/track`; // 上报的路径
    this.xhr = new XMLHttpRequest();
  }

  // 发送数据
  send(data = {}){
    let extraData = getExtraData();
    let log = {
      ...extraData,
      ...data
    }
    // 阿里云的要求 对象的值不能是数字
    for(let key in log){
      if(typeof(log[key]) === 'number'){
        log[key] = `${log[key]}`
      }
    }
    console.log(log)
    let body = JSON.stringify({
      __logs__: [log]
    });
    
    this.xhr.open('POST', this.url, true);
    this.xhr.setRequestHeader('Content-Type', 'application/json') // 请求体类型
    this.xhr.setRequestHeader('x-log-apiversion', '0.6.0') // 版本号
    this.xhr.setRequestHeader('x-log-bodyrawsize', body.length) // 请求体的大小
    this.xhr.onload = function(){
      // console.log(this.xhr.responseText);
    }
    this.xhr.onerror = function(error){
      // console.log(error);
    }
    this.xhr.send(body)
  }

}

export default new SendTracker();