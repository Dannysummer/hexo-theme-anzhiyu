// 文章已读状态管理 + 未读卡片扫光动画
(function() {
  const STORAGE_KEY = 'anzhiyu_read_posts';
  let lastUrl = location.href;

  // ========== 未读卡片扫光动画配置 ==========
  // 默认配置
  const DEFAULT_SHINE_CONFIG = {
    enable: true,
    angle: 10,
    duration: '4s',
    delay: '2s',
    gradient: 'rgba(255, 255, 255, 0.2)'
  };

  // 从 Hexo 主题配置中读取扫光参数
  function getShineConfig() {
    // 尝试从全局配置读取
    if (typeof theme !== 'undefined' && theme.unreadCardShine) {
      return { ...DEFAULT_SHINE_CONFIG, ...theme.unreadCardShine };
    }
    return DEFAULT_SHINE_CONFIG;
  }

  // 动态注入扫光动画 CSS
  function injectShineAnimation() {
    const config = getShineConfig();
    
    // 如果未启用，直接返回
    if (!config.enable) return;

    // 检查是否已注入
    if (document.getElementById('unread-card-shine-style')) return;

    const style = document.createElement('style');
    style.id = 'unread-card-shine-style';

    // 构建带倾斜角度的扫光 CSS
    const angle = config.angle || 20;
    const duration = config.duration || '3s';
    const delay = config.delay || '0.5s';
    const gradient = config.gradient || 'rgba(255, 255, 255, 0.1)';

    style.textContent = `
      /* 未读文章卡片 - 可配置倾斜扫光效果 */
      .recent-post-item:has(.unvisited-post:not(.is-read)) {
        position: relative;
        overflow: hidden;
      }

      /* 倾斜扫光效果 */
      .recent-post-item:has(.unvisited-post:not(.is-read))::before {
        content: '';
        position: absolute;
        top: 0;
        left: -150%;
        width: 200%;
        height: 150%;
        background: linear-gradient(
          ${90 + angle}deg,
          transparent 0%,
          ${gradient} 50%,
          transparent 100%
        );
        animation: card-shine-diagonal ${duration} ease-in-out infinite;
        pointer-events: none;
        z-index: 10;
        transform: skewX(-${angle}deg);
      }

      /* 卡片扫光动画 - 波浪式延迟 */
      .recent-post-item:has(.unvisited-post:not(.is-read)):nth-child(1)::before {
        animation-delay: 0s;
      }
      .recent-post-item:has(.unvisited-post:not(.is-read)):nth-child(2)::before {
        animation-delay: ${delay};
      }
      .recent-post-item:has(.unvisited-post:not(.is-read)):nth-child(3)::before {
        animation-delay: calc(${delay} * 2);
      }
      .recent-post-item:has(.unvisited-post:not(.is-read)):nth-child(4)::before {
        animation-delay: calc(${delay} * 3);
      }
      .recent-post-item:has(.unvisited-post:not(.is-read)):nth-child(5)::before {
        animation-delay: calc(${delay} * 4);
      }
      .recent-post-item:has(.unvisited-post:not(.is-read)):nth-child(n+6)::before {
        animation-delay: calc(${delay} * 5);
      }

      /* 倾斜扫光动画关键帧 */
      @keyframes card-shine-diagonal {
        0% {
          left: -150%;
          opacity: 0;
        }
        20% {
          opacity: 1;
        }
        80% {
          opacity: 1;
        }
        100% {
          left: 100%;
          opacity: 0;
        }
      }
    `;

    document.head.appendChild(style);
  }
  // ========== 扫光动画配置结束 ==========

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
    
    // 注入扫光动画
    injectShineAnimation();
    
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
