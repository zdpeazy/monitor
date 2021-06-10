/**
 * 监控白屏
 * caniuse.com 可以i查看api的兼容性
 */
import onload from '../utils/onload';
import tracker from '../utils/tracker';
import getLastEvent from '../utils/getLastEvent';
import getSelector from '../utils/getSelector';

export function timing() {
  /**
   * elementtiming 最有意义的绘制的元素属性
   * setTimeout(() => {
     let content = document.getElementsByClassName('content')[0];
     let h1 = document.createElement('h1');
     h1.innerHTML = '我是页面中最有意义的内容';
     h1.setAttribute('elementtiming', 'meaningful')
     content.append(h1);
   }, 2000)
   */
  let FMP, LCP;
  // 增加一个性能条目的观察者
  new PerformanceObserver((entryList, observer) => {
    let perfEntres = entryList.getEntries();
    FMP = perfEntres[0]; // startTime是页面中开始渲染的时间 2s以后
    observer.disconnect(); // 不在观察了
  }).observe({
    entryTypes: ['element'] // 观察页面中有意义的元素
  })

  new PerformanceObserver((entryList, observer) => {
    let perfEntres = entryList.getEntries();
    LCP = perfEntres[0];
    observer.disconnect(); // 不在观察了
  }).observe({
    entryTypes: ['largest-contentful-paint'] // 观察页面中最大的元素绘制
  })

  // FID 首次交互延迟
  new PerformanceObserver((entryList, observer) => {
    let lastEvent = getLastEvent();
    let firstInput = entryList.getEntries()[0];
    console.log('FID', firstInput)
    // processingStart  开始处理的时间
    // startTime  开始点击的时间
    // 差值 就是处理的延迟
    if(firstInput){
      let inputDelay = firstInput.processingStart - firstInput.startTime;
      let duration = firstInput.duration; // 处理的耗时
      if(inputDelay > 0 || duration > 0){
        tracker.send({
          kind: 'experience', // 用户体验时间
          type: 'firstInputDelay', //首次输入延迟
          inputDelay, //延迟时间
          duration, // 处理的时间
          startTime: firstInput.startTime,
          selector: lastEvent ? getSelector(lastEvent.path || lastEvent.target) : ''
        })
      }
    }
    observer.disconnect(); // 不在观察了
  }).observe({
    type: 'first-input',
    buffered: true
  }) // 用户的第一次交互，点击页面，输入


  // DOM加载时候执行逻辑
  onload(function () {
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

      let FP = performance.getEntriesByName('first-paint')[0]; // 首次绘制
      let FCP = performance.getEntriesByName('first-contentful-paint')[0]; // 首次有内容的绘制

      // 开始发送性能指标
      console.log('FP', FP)
      console.log('FCP', FCP)
      console.log('FMP', FMP)
      console.log('LCP', LCP)
      tracker.send({
        kind: 'experience', // 用户体验时间
        type: 'paint', //统计每个阶段的时间
        firstPaint: FP.startTime,
        firstContentfulPaint: FCP.startTime,
        firstMeaningfulPaint: FMP.startTime,
        largestContentfulPaint: LCP.startTime
      })

    }, 3000)
  })

}