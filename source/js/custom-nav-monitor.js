// 监控 scroll-down 按钮点击
(function () {
  var btn = document.getElementById('scroll-down');
  var header = document.getElementById('page-header');
  var homeTop = document.getElementById('home_top');
  var bbTimeList = document.getElementById('bbTimeList');

  console.log('========== scroll-down 诊断 ==========');
  console.log('scroll-down 元素:', btn);
  console.log('#page-header:', header);
  console.log('#page-header.classList:', header ? [].slice.call(header.classList) : 'null');
  console.log('#home_top:', homeTop);
  console.log('#bbTimeList:', bbTimeList);
  console.log('GLOBAL_CONFIG_SITE:', window.GLOBAL_CONFIG_SITE);
  console.log('======================================');

  if (!btn) {
    console.warn('[监控] 未找到 #scroll-down 元素');
    return;
  }

  // 监听点击
  btn.addEventListener('click', function (e) {
    console.log('%c【点击事件触发】', 'color: blue; font-weight: bold;');
    console.log('目标元素:', e.target);
    console.log('#page-header.classList:', [].slice.call(header.classList));

    // 尝试执行原逻辑
    if (bbTimeList) {
      console.log('执行: bbTimeList.offsetTop - 62 =', bbTimeList.offsetTop - 62);
    } else if (homeTop) {
      console.log('执行: homeTop.offsetTop - 60 =', homeTop.offsetTop - 60);
    } else {
      console.warn('[警告] 找不到 #bbTimeList 和 #home_top！');
    }
  }, true); // true = 捕获阶段

  // 监听所有点击事件
  document.addEventListener('click', function (e) {
    if (e.target.closest('#scroll-down') || e.target.id === 'scroll-down') {
      console.log('%c【click 事件】', 'color: orange;');
      console.log('事件目标:', e.target);
      console.log('事件阶段:', e.eventPhase === 1 ? '捕获' : e.eventPhase === 2 ? '目标' : '冒泡');
      console.log('isDefaultPrevented:', e.defaultPrevented);
      console.log('isPropagationStopped:', e.cancelBubble);
    }
  });

  console.log('[监控] scroll-down 点击监控已启动');
})();
