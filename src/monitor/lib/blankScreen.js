/**
 * 监控白屏
 */
import onload from '../utils/onload';
import tracker from '../utils/tracker';

export function blankScreen(){
  const splitPoint = 100; // x轴或者y轴等分成多少份 越多越准确 但是计算量越大
  const wraperElements = ['html', 'body'];
  let emptyPoints = 0;

  // 获取dom节点
  function getSeletor(element){
    if(element.id){
      return `#${element.id}`;
    } else if(element.className){
      return `.${element.className.split(' ').filter(item => !!item).join('.')}`;
    } else {
      return element.nodeName.toLowerCase();
    }
  }

  // 判断是否是白屏DOM元素
  function isWrapper(element){
    let selector = getSeletor(element);
    if(wraperElements.includes(selector)){
      emptyPoints ++ 
    }
  }

  // DOM加载时候执行逻辑
  onload(function(){
    for(let i = 0; i < splitPoint; i ++){
      let xElements = document.elementsFromPoint(window.innerWidth * i / splitPoint, window.innerHeight / 2);
      let yElements = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight * i / splitPoint);
      isWrapper(xElements[0]);
      isWrapper(yElements[0]);
    }
  
    if(emptyPoints >= splitPoint * 2){
      let centerElements = document.elementsFromPoint(window.innerWidth / 2, window.innerHeight / 2)
      tracker.send({
        kind: 'stability',
        type: 'blank',
        emptyPoints,
        screen: window.screen.width + 'x' + window.screen.height,
        viewPoint: window.innerWidth + 'x' + window.innerHeight,
        selector: getSeletor(centerElements[0])
      })
    }
  })
  
}