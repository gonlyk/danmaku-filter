let config = {};
function init() {
  let url = chrome.runtime.getURL('config.json');
  let xhr = new XMLHttpRequest();

  xhr.onload = (e) => {
    config = JSON.parse(xhr.response);
    chrome.storage.local.set({ config }, () => { })
  }
  xhr.onerror = () => {
    console.log(xhr.statusText);
  }

  xhr.open('GET', url);
  xhr.send(null);

  console.log(url)
}

// popup获取config
function getConfig() {
  return config;
}
// popup修改config的Map选项
function modifyConfigMap(pos, del, add) {
  if (!config || !config.map) {
    return false;
  }

  add ? config.map.splice(pos, del, add)
    : config.map.splice(pos, del);

  chrome.storage.local.set({ config }, () => { });
  return true;
}
// popup修改config的default选项
function modifyConfigDefault(prefix, suffix) {
  if (!config || !config.default) {
    return false;
  }

  config.default.prefix = prefix;
  config.default.suffix = suffix;
  chrome.storage.local.set({ config }, () => { });

  return true;
}

chrome.storage.local.get('config', function (item) {
  if (item.config) {
    config = item.config;
  } else {
    init();
  }
})

chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo && changeInfo.status === 'complete') {
    chrome.tabs.query({ // 查找当前tab
      active: true,
      currentWindow: true
    }, function (tabs) {
      if (tabs.length === 0) return;

      chrome.tabs.sendMessage(tabs[0].id, { config });
    })
  }
});