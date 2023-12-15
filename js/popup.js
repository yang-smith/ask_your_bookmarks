console.log("Popup script loaded");

document.getElementById('search-button').addEventListener('click', function() {
    console.log("search")
    const query = document.getElementById('search-input').value;
    if (query) {
        // 执行搜索逻辑
        console.log("Searching for:", query);
        // 调用向量化和搜索函数
    }
    chrome.bookmarks.getTree(bookmarkItems => {
        console.log(bookmarkItems); // 这里可以处理书签数据
        // 在这里添加代码以在用户点击按钮时处理或导出书签
      });
});
