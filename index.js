let _ex_config = null;
chrome.runtime.onMessage.addListener(function (request) {
  console.log('chrome.runtime.onMessage:', request);
  if (request.config) {
    _ex_config = request.config;
    console.log(_ex_config);
    setTimeout(() => {
      watchDanmaku();
      watchChatHistory();
      // watchSpecilChatHistory(); // 特殊直播间
    }, 500)
  }
})

function watchDanmaku() {
  let danmakuContainer = document.getElementsByClassName('danmaku-item-container')[0];
  let defaultMap = _ex_config.default;
  let wordMap = _ex_config.map;

  // 啊B代码里估计有一直用到regexp，Regexp.$1用不了

  let hrefs = location.href.split('live.bilibili.com/');
  let roomCode = parseInt(hrefs[1]);

  if(!danmakuContainer) {
    let iframes = document.querySelectorAll('iframe');
    for(let i = 0; i < iframes.length; i++) {
      danmakuContainer = iframes[i].contentDocument.getElementsByClassName('danmaku-item-container')[0];
      if(danmakuContainer) break;
    }
  }

  if (!danmakuContainer || !wordMap || !defaultMap)
    return;

  let config = {
    attributes: false,
    childList: true,
    subtree: true
  }


  const callback = function (mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        for (let node of mutation.addedNodes) {
          if (node.nodeType === 1) {
            node = node.childNodes[0]
          }

          // 这里为啥我修改了textContent会反过来触发callback而下面的不会？？？
          coroutine.addTask(
            () => changeDanmaku(node, node.textContent, { defaultMap, wordMap, roomCode })
          )
          // if (node.nodeType === 3) {
          //   // if(node.parentNode.dataset.first_insert === 'true') {
          //   //   node.parentNode.dataset.first_insert = 'false';
          //   //   continue;
          //   // }
          //   coroutine.addTask(
          //     () => changeDanmaku(node.parentNode, node.textContent, { defaultMap, wordMap, roomCode })
          //   )
          // } else {
          //   continue;
          //   node.dataset.first_insert = 'true';
          //   coroutine.addTask(
          //     () => changeDanmaku(node, node.textContent, { defaultMap, wordMap, roomCode })
          //   )
          // }
        }
      }
      else if (mutation.type === 'subtree') {
        console.log('The subtree attribute was modified.');
      }
    }
  };

  // 创建一个观察器实例并传入回调函数
  const observer = new MutationObserver(callback);

  // 以上述配置开始观察目标节点
  observer.observe(danmakuContainer, config);
}

function watchChatHistory() {
  let chatHistory = document.getElementById('chat-history-list');
  let defaultMap = _ex_config.default;
  let wordMap = _ex_config.map;

  // 啊B代码里估计有一直用到regexp，Regexp.$1用不了

  let hrefs = location.href.split('live.bilibili.com/');
  let roomCode = parseInt(hrefs[1]);

  // 特殊直播间会使用iframe嵌入直播页面
  if(!chatHistory) {
    let iframes = document.querySelectorAll('iframe');
    for(let i = 0; i < iframes.length; i++) {
      chatHistory = iframes[i].contentDocument.getElementById('chat-history-list');
      if(chatHistory) break;
    }
  }

  if (!chatHistory || !wordMap || !defaultMap)
    return;

  let config = {
    attributes: false,
    childList: true,
    subtree: true
  }


  const callback = function (mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        console.log('A child node has been added or removed.');
        for (let node of mutation.addedNodes) {
          let children = node.children;
          if (!children) continue;

          let chatNode = (() => {
            for (let i = 0; i < children.length; i++) {
              if (children[i].className.indexOf('danmaku-content') > -1)
                return children[i];
            }
          })();

          if (!chatNode) continue;

          let chatText = chatNode.textContent;
          coroutine.addTask(
            () => changeDanmaku(chatNode, chatText, { defaultMap, wordMap, roomCode })
          )
        }
      }
      else if (mutation.type === 'subtree') {
        console.log('The subtree attribute was modified.');
      }
      // console.log(mutation);
    }
  };

  // 创建一个观察器实例并传入回调函数
  const observer = new MutationObserver(callback);

  // 以上述配置开始观察目标节点
  observer.observe(chatHistory, config);
}

function watchSpecilChatHistory() {
  let chatHistory = document.getElementById('chat-items');
  let defaultMap = _ex_config.default;
  let wordMap = _ex_config.map;

  // 啊B代码里估计有一直用到regexp，Regexp.$1用不了

  let hrefs = location.href.split('live.bilibili.com/');
  let roomCode = parseInt(hrefs[1]);

  if (!chatHistory || !wordMap || !defaultMap)
    return;

  let config = {
    attributes: false,
    childList: true,
    subtree: true
  }


  const callback = function (mutationsList, observer) {
    // Use traditional 'for loops' for IE 11
    for (let mutation of mutationsList) {
      if (mutation.type === 'childList') {
        console.log('A child node has been added or removed.');
        for (let node of mutation.addedNodes) {
          let children = node.children;
          if (!children) continue;

          let chatNode = (() => {
            for (let i = 0; i < children.length; i++) {
              if (children[i].className.indexOf('danmaku-content') > -1)
                return children[i];
            }
          })();

          if (!chatNode) continue;

          let chatText = chatNode.textContent;
          coroutine.addTask(
            () => changeDanmaku(chatNode, chatText, { defaultMap, wordMap, roomCode })
          )
        }
      }
      else if (mutation.type === 'subtree') {
        console.log('The subtree attribute was modified.');
      }
    }
  };

  // 创建一个观察器实例并传入回调函数
  const observer = new MutationObserver(callback);

  // 以上述配置开始观察目标节点
  observer.observe(chatHistory, config);
}


/**
 * @param {Node} node
 * @param {string} text
 */
function changeDanmaku(node, text, { defaultMap, wordMap, roomCode }) {
  // "default": {
  //   "prefix": "11",
  //   "suffix": "22"
  // },
  // "map": [
  //   {
  //     "word": "草",
  //     "mode": "word", //word reg eval
  //     "exact": true,
  //     "replace": "我爱你",
  //     "prefix": "",
  //     "suffix": "沙月月",
  //     "room": "",
  //     "color": ""
  //   }
  // ]
  for (let w of wordMap) {
    let { word, replace, room, mode = 'word', color = '', exact = false, suffix = '', prefix = '' } = w;
    if (!replace || !word || (room && roomCode != room))
      continue;

    if (mode === 'word') {
      let hit = exact ? text === word : text.indexOf(word) > -1
      if (hit) {
        let oldText = text;
        let newText = oldText.replace(word, replace);
        while(oldText !== newText) {
          oldText = newText;
          newText = oldText.replace(word, replace);
        }

        // color && (node.style.color = color);
        node.textContent = `${prefix || ''}${newText}${suffix || ''}`;
        return;
      }
    } else if (mode === 'reg') {
      try {
        let reg = new RegExp(word, 'g');
        if (reg.test(text)) {
          let newText = text.replace(reg, replace);

          // color && (node.style.color = color);
          node.textContent = `${prefix || ''}${newText}${suffix || ''}`;
          return;
        }
      } catch {
        console.error(`配置错误：${JSON.stringify(w)}`)
      }
    } else if (mode === 'eval' && text === word) {
      try {
        node.textContent = eval(replace);
        return;
      } catch {
        console.error(`配置错误：${JSON.stringify(w)}`)
      }
    }
  }

  text = `${defaultMap.prefix || ''}${text}${defaultMap.suffix || ''}`;
  node.textContent = text;
}