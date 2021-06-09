/**
 * 监控ajax
 */
import tracker from '../utils/tracker';

export function injectXHR(){
  let XMLHttpRequest = window.XMLHttpRequest;
  let oldOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function(method, url, async){
    if(!url.match(/logstores/) && !url.match(/sockjs/)){  // 过滤上传接口和测试环境socket
      this.logData = {
        method,
        url,
        async
      }
    }
    return oldOpen.apply(this, arguments)
  }

  let oldSend = XMLHttpRequest.prototype.send;
  
  // fetch怎么监听？
  // axios 背后有两张 如果是brower=>XMLHttpRequest  node=>http
  XMLHttpRequest.prototype.send = function(body){
    if(this.logData){
      let startTime = Date.now(); // 在发送之前记录开始的时间
      // XMLHttpRequest readyState 0 1 2 3 4 当是4的时候进入load回调
      // status 2xx 304的时候成功，其他是进入error
      let handler = (type) => (event) => {
        let duration = Date.now() - startTime;
        let status = this.status;
        let statusText = this.statusText; //ok Server Error
        tracker.send({
          kind: 'stability',
          type: 'xhr',
          eventType: type, // load error abort
          pathname: this.logData.url, // 请求路径
          status: status + '-' + statusText, // 状态码
          duration, // 请求时间
          response: this.response ? JSON.stringify(this.response) : '', // 响应体
          params: body || '' // 请求体
        })


      }
      this.addEventListener('load', handler('load'), false)
      this.addEventListener('error', handler('error'), false)
      this.addEventListener('abort', handler('abort'), false)
    }
    return oldSend.apply(this, arguments)
  }
}