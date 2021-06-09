/**
 * 监控js错误 
 */
import getLastEvent from '../utils/getLastEvent';
import getSelector from '../utils/getSelector';
import tracker from '../utils/tracker';

export function injectJsError(){
  // 监听全局未捕获的错误
  window.addEventListener('error', event => { // 错误时间对象
    console.log(event)
    let lastEvent = getLastEvent(); //获取最后一个交互事件
    // 这是一个脚本加载错误
    if(event.target && (event.target.src || event.target.href)){
      tracker.send({
        kind: 'stability', // 监控指标打大类
        type: 'error', // 小类型 这是一个错误
        errorType: 'resourceError', // js或者css资源加载错误
        filename: event.target.src || event.target.href, // 哪个文件报错了
        tagName: event.target.tagName,
        seletor: getSelector(event.path) // 代表最后一个操作的元素路径
      });
    } else {
      tracker.send({
        kind: 'stability', // 监控指标打大类
        type: 'error', // 小类型 这是一个错误
        errorType: 'jsError', // js执行错误
        message: event.message, // 报错信息
        filename: event.filename, // 哪个文件报错了
        position: `${event.lineno}:${event.colno}`, // 报错行和列
        stack: getLines(event.error.stack), // 错误栈
        seletor: lastEvent ? getSelector(lastEvent.path) : '' // 代表最后一个操作的元素路径
      });
    }
    
  }, true); // true得加上，如果不加是监听不到资源加载错误的

  // 监听未捕获的promise错误
  window.addEventListener('unhandledrejection', event => {
    // console.log(event)
    let lastEvent = getLastEvent(); //获取最后一个交互事件
    let message;
    let filename;
    let lineno = 0;
    let colno = 0;
    let stack = '';
    let reason = event.reason;
    if(typeof(reason) === 'string'){
      message = reason;
    } else if(typeof(reason) === 'object'){
      if(reason.stack){
        let matchResult = reason.stack.match(/at\s+(.+):(\d+):(\d+)/)
        filename = matchResult[1];
        lineno = matchResult[2];
        colno = matchResult[3];
      }

      message = reason.message;
      stack = getLines(reason.stack);
    }

    tracker.send({
      kind: 'stability', // 监控指标打大类
      type: 'error', // 小类型 这是一个错误
      errorType: 'promiseError', // js执行错误
      message, // 报错信息
      filename, // 哪个文件报错了
      position: `${lineno}:${colno}`, // 报错行和列
      stack, // 错误栈
      seletor: lastEvent ? getSelector(lastEvent.path) : '' // 代表最后一个操作的元素
    });
    
  }, true)

  // 处理错误栈的数据
  function getLines(stack){
    return stack.split('\n').slice(1).map(item => item.replace(/^\s+at\s+/, '')).join('^');
  }
}