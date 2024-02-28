

export function incrementBookmarkClick(url) {
    chrome.storage.local.get([url], function(result) {
      let currentCount = result[url] ? result[url] : 0;
      currentCount++;
      chrome.storage.local.set({[url]: currentCount}, function() {
        console.log(`Updated click count for ${url}: ${currentCount}`);
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
  