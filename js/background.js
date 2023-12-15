chrome.runtime.onInstalled.addListener(function() {
    // 在安装扩展时执行的代码
    console.log("Ask Your Bookmarks extension installed.");
});

chrome.browserAction.onClicked.addListener(() => {
    chrome.bookmarks.getTree(bookmarkItems => {
      console.log(bookmarkItems); // 这里可以处理书签数据
      // 您可以在这里编写代码来进一步处理或导出书签
    });
  });
