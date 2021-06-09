/**
 * 监控白屏
 */
 import onload from '../utils/onload';
 import tracker from '../utils/tracker';
 
 export function timing(){
   // DOM加载时候执行逻辑
  onload(function(){
    setTimeout(() => {
      const {
        fetchStart,
        connectStart,
        connectEnd,
        requestStart,
        responseStart,
        responseEnd,
        domLoading,
        domInteractive,
        domContentLoadedEventStart,
        domContentLoadedEventEnd,
        loadEventStart
      } = performance.timing; // 已废弃
      tracker.send({
        kind: 'experience', // 用户体验时间
        type: 'timing', //统计每个阶段的时间
        connectTime: connectEnd - connectStart, //连接时间
        ttfbTime: responseStart - requestStart, // 首字节到达时间
        responseTime: responseEnd - responseStart, // 响应的读取时间
        parseDOMTime: loadEventStart - domLoading, // DOM解析的时间
        domContentLoadedTime: domContentLoadedEventEnd - domContentLoadedEventStart, //
        timeToInteractive: domInteractive - fetchStart, // 首次可交互时间
        loadTime: loadEventStart - fetchStart, // 完整的加载时间
      })

    }, 3000)
  })
   
 }