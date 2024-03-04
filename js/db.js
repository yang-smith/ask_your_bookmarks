

export function incrementBookmarkClick(url, title, count = 1) {
  chrome.storage.local.get([url], function(result) {
      let data = result[url] ? result[url] : {count: 0, title: title};
      data.count += count;

      chrome.storage.local.set({[url]: data}, function() {
          console.log(`Updated click count for ${url} (${title}): ${data.count}`);
      });
  });
}


export  function displayAllBookmarkClicks() {
    chrome.storage.local.get(null, function(items) { 
      for (let url in items) {
        if (url.startsWith('http')) {
            console.log(`${url} has been clicked ${items[url]} times`);
        }
      }
    });
}

function initializeBookmarks() {
  chrome.bookmarks.getTree(function(bookmarkTreeNodes) {
      function processNode(nodes) {
          nodes.forEach(function(node) {
              if (node.children) {
                  processNode(node.children); 
              } else {
                  node.clickCount = 0;
              }
          });
      }

      processNode(bookmarkTreeNodes);

      chrome.storage.local.set({'bookmarks': bookmarkTreeNodes}, function() {
          console.log('Bookmarks initialized and saved with click count.');
      });
  });
}

function checkAndInitializeBookmarks() {
  chrome.storage.local.get('bookmarks', function(result) {
    if (!result.bookmarks) {
      initializeBookmarks();
    } else {
      console.log('Bookmarks already initialized.');
    }
  });
}