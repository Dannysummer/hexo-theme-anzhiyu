// 文章已读状态管理
(function() {
  const STORAGE_KEY = 'anzhiyu_read_posts';
  let lastUrl = location.href;

  // 获取已读文章列表
  function getReadPosts() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // 保存已读文章
  function saveReadPost(url) {
    const readPosts = getReadPosts();
    if (!readPosts.includes(url)) {
      readPosts.push(url);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(readPosts));
    }
  }

  // 标记文章为已读
  function markAsRead(url) {
    saveReadPost(url);
    updateAllTags();
  }

  // 更新所有匹配的文章标签
  function updateAllTags() {
    const readPosts = getReadPosts();
    document.querySelectorAll('.unvisited-post').forEach(function(el) {
      const postUrl = el.getAttribute('data-url');
      if (readPosts.includes(postUrl)) {
        el.classList.add('is-read');
        el.textContent = 'Read';
      }
    });
  }

  // 初始化：检查已读状态
  function init() {
    updateAllTags();
    bindEvents();
  }

  // 绑定点击事件
  function bindEvents() {
    // 点击整个卡片进入文章
    document.querySelectorAll('.recent-post-item').forEach(function(el) {
      el.addEventListener('click', function() {
        const unreadTag = el.querySelector('.unvisited-post');
        if (unreadTag && !unreadTag.classList.contains('is-read')) {
          const postUrl = unreadTag.getAttribute('data-url');
          if (postUrl) {
            saveReadPost(postUrl);
          }
        }
      });
    });

    // 点击 Unread 标签本身
    document.querySelectorAll('.unvisited-post').forEach(function(el) {
      el.addEventListener('click', function(e) {
        e.stopPropagation();
        const postUrl = this.getAttribute('data-url');
        if (postUrl) {
          saveReadPost(postUrl);
        }
      });
    });
  }

  // 检测 URL 变化并更新状态
  function checkUrlChange() {
    if (location.href !== lastUrl) {
      lastUrl = location.href;
      // URL 变化了，重新检查已读状态
      setTimeout(updateAllTags, 100);
    }
  }

  // 页面加载完成后初始化
  function onReady() {
    init();
    
    // 监听 popstate 事件（后退/前进按钮）
    window.addEventListener('popstate', function() {
      setTimeout(function() {
        updateAllTags();
        bindEvents();
      }, 100);
    });

    // 定期检查 URL 变化（作为备选方案）
    setInterval(checkUrlChange, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', onReady);
  } else {
    onReady();
  }

  // 监听 pageshow（后退按钮时触发）
  window.addEventListener('pageshow', function(event) {
    setTimeout(function() {
      updateAllTags();
    }, 100);
  });

  // 尝试监听可能的 pjax 事件
  document.addEventListener('pjax:complete', function() {
    setTimeout(function() {
      updateAllTags();
      bindEvents();
    }, 100);
  });

  document.addEventListener('pjax:success', function() {
    setTimeout(function() {
      updateAllTags();
      bindEvents();
    }, 100);
  });
})();
