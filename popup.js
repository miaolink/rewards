document.addEventListener('DOMContentLoaded', function() {
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const status = document.getElementById('status');
  const progressBar = document.getElementById('progressBar');
  const searchCountInput = document.getElementById('searchCount');
  const searchIntervalInput = document.getElementById('searchInterval');
  const urlSuffixInput = document.getElementById('urlSuffix');

  // 从storage加载设置
  chrome.storage.local.get(['searchCount', 'searchInterval', 'urlSuffix'], function(result) {
    if (result.searchCount) searchCountInput.value = result.searchCount;
    if (result.searchInterval) searchIntervalInput.value = result.searchInterval;
    if (result.urlSuffix) urlSuffixInput.value = result.urlSuffix;
  });

  // 保存设置
  function saveSettings() {
    chrome.storage.local.set({
      searchCount: parseInt(searchCountInput.value),
      searchInterval: parseInt(searchIntervalInput.value),
      urlSuffix: urlSuffixInput.value.trim()
    });
  }

  searchCountInput.addEventListener('change', saveSettings);
  searchIntervalInput.addEventListener('change', saveSettings);
  urlSuffixInput.addEventListener('input', saveSettings);

  // 开始搜索
  startBtn.addEventListener('click', function() {
    const searchCount = parseInt(searchCountInput.value);
    const searchInterval = parseInt(searchIntervalInput.value);
    const urlSuffix = urlSuffixInput.value.trim();
    
    if (searchCount < 1 || searchInterval < 1) {
      status.textContent = '请输入有效的设置';
      return;
    }

    // 验证URL补充参数格式
    if (urlSuffix && !urlSuffix.startsWith('&')) {
      status.textContent = 'URL补充参数必须以&开头';
      return;
    }

    chrome.runtime.sendMessage({
      action: 'startSearch',
      searchCount: searchCount,
      searchInterval: searchInterval,
      urlSuffix: urlSuffix
    });

    startBtn.disabled = true;
    stopBtn.disabled = false;
    status.textContent = '正在搜索...';
  });

  // 停止搜索
  stopBtn.addEventListener('click', function() {
    chrome.runtime.sendMessage({action: 'stopSearch'});
    
    startBtn.disabled = false;
    stopBtn.disabled = true;
    status.textContent = '已停止搜索';
    progressBar.style.width = '0%';
  });

  // 监听来自background script的消息
  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action === 'updateProgress') {
      const progress = (request.current / request.total) * 100;
      progressBar.style.width = progress + '%';
      status.textContent = `搜索进度: ${request.current}/${request.total}`;
    } else if (request.action === 'searchComplete') {
      startBtn.disabled = false;
      stopBtn.disabled = true;
      status.textContent = '搜索完成！';
      progressBar.style.width = '100%';
    } else if (request.action === 'searchError') {
      startBtn.disabled = false;
      stopBtn.disabled = true;
      status.textContent = '搜索出错: ' + request.error;
      progressBar.style.width = '0%';
    }
  });

  // 检查当前状态
  chrome.runtime.sendMessage({action: 'getStatus'}, function(response) {
    if (response && response.isSearching) {
      startBtn.disabled = true;
      stopBtn.disabled = false;
      status.textContent = '正在搜索...';
      if (response.progress) {
        const progress = (response.progress.current / response.progress.total) * 100;
        progressBar.style.width = progress + '%';
      }
    }
  });

  // 实时更新示例URL
  function updateExampleUrl() {
    const urlSuffix = urlSuffixInput.value.trim();
    const exampleUrl = document.getElementById('exampleUrl');
    
    if (urlSuffix) {
      const sampleKeyword = '测试关键词';
      const fullUrl = `https://www.bing.com/search?q=${encodeURIComponent(sampleKeyword)}${urlSuffix}`;
      exampleUrl.textContent = `完整URL示例: ${fullUrl}`;
    } else {
      exampleUrl.textContent = '示例: &qs=HS&sk=HS3&sc=8-0&cvid=8130CC689B484DB3BDB96687EFD44C65&FORM=QBLH&sp=4&lq=0';
    }
  }

  urlSuffixInput.addEventListener('input', updateExampleUrl);
  
  // 初始化示例URL
  updateExampleUrl();
}); 