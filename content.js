// Content script for Bing search pages
// 这个脚本会在Bing搜索页面中运行，可以用于一些辅助功能

console.log('Bing Rewards Auto Search content script loaded');

// 监听页面加载完成
document.addEventListener('DOMContentLoaded', function() {
  console.log('Bing search page loaded');
  
  // 可以在这里添加一些页面特定的功能
  // 比如检测搜索是否成功，或者添加一些UI元素
});

// 监听来自background script的消息
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if (request.action === 'checkSearchStatus') {
    // 检查搜索是否成功
    const searchResults = document.querySelector('#b_results');
    const hasResults = searchResults && searchResults.children.length > 0;
    
    sendResponse({
      success: hasResults,
      resultCount: hasResults ? searchResults.children.length : 0
    });
  }
});

// 页面加载完成后的处理
window.addEventListener('load', function() {
  // 可以在这里添加一些页面加载完成后的处理逻辑
  console.log('Bing search page fully loaded');
}); 