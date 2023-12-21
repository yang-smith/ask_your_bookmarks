chrome.runtime.onInstalled.addListener(() => {
    chrome.bookmarks.getTree(processBookmarks);
});

function processBookmarks(bookmarkTreeNodes) {
    let bookmarks = [];
    bookmarkTreeNodes.forEach(node => {
        extractBookmarks(node, bookmarks);
    });
    // 处理书签数据，例如，向量化
    console.log(bookmarks);
    // sendBookmarksToAPI(bookmarks);
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

async function sendBookmarksToAPI(bookmarks) {
    try {
        const response = await fetch('http://localhost:3000/api/addBookmarks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ bookmarks })
        });
        const data = await response.json();
        console.log('Bookmarks successfully sent to the API:', data);
    } catch (error) {
        console.error('Error sending bookmarks to the API:', error);
    }
}

