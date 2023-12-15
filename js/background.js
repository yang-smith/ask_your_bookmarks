chrome.runtime.onInstalled.addListener(function() {
    // 在安装扩展时执行的代码
    console.log("Ask Your Bookmarks extension installed.");
});

chrome.runtime.onInstalled.addListener(() => {
    chrome.bookmarks.getTree(processBookmarks);
});

function processBookmarks(bookmarkTreeNodes) {
    let bookmarks = [];
    bookmarkTreeNodes.forEach(node => {
        extractBookmarks(node, bookmarks);
    });
    // 处理书签数据，例如，向量化
}

function extractBookmarks(node, bookmarks) {
    if (node.children) {
        node.children.forEach(child => extractBookmarks(child, bookmarks));
    } else {
        if (node.url) {
            bookmarks.push({ title: node.title, url: node.url });
        }
    }
}

async function vectorizeBookmarks(bookmarks) {
    const responses = [];

    for (const bookmark of bookmarks) {
        const response = await fetch('https://api.openai.com/v1/engines/your-model/embeddings', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer YOUR_OPENAI_API_KEY`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ input: bookmark.title })
        });
        const data = await response.json();
        responses.push(data);
    }

    // 在这里处理向量化的结果
}

