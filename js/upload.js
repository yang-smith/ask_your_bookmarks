
async function fetchDescription(url){
    // 特殊URL处理
    if (url.includes('github.com')) {
        const response = await fetch(url);
        const html = await response.text();
        const match = html.match(/<meta name="twitter:description" content="([^"]+)"/i);
        if(match){
            if(match[1].includes('Contribute to')){
                return null;
            }
            return match[1];
        }
        return null;
    } else if (url.includes('youtube.com')) {
        console.log(`YouTube: ${url}`);
        return null;
    } else if (url.startsWith('chrome-extension://') || url.startsWith('moz-extension://')) {
        console.log(`Processing extension URL: ${url}`);
        return 'extension';
    }

    // 通用网页处理
    try {
        const response = await fetch(url);
        const html = await response.text();
        const metaRegex = /<meta\s+(?:name="description"|\s+property="og:description")\s+content="([^"]*)"/i;
        const match = html.match(metaRegex);
        return match ? match[1] : null;
    } catch (error) {
        console.error(`Error fetching description for ${url}:`, error);
        return null; 
    }
}

export async function fetchDescriptions(user, bookmarks, batchSize = 30) {
    let processed = 0;
    const errors = [];

    const processBatch = async (batch) => {
        const fetchPromises = batch.map(bookmark =>
            fetchDescription(bookmark.url)
                .then(description => {
                    bookmark.description = description;
                })
                .catch(error => {
                    errors.push({ url: bookmark.url, error: error.message });
                })
        );
        await Promise.allSettled(fetchPromises);
        processed += batch.length;
        console.log(`Processed ${processed}/${bookmarks.length} bookmarks`);
    };

    while (processed < bookmarks.length) {
        const batch = bookmarks.slice(processed, processed + batchSize);
        await processBatch(batch);
    }

    console.log(errors); 
    bookmarks.user = user;
    console.log(bookmarks); 
    // sendBookmarksToAPI(bookmarks);
}

async function sendBookmarksToAPI(bookmarks) {
    try {
        // const response = await fetch('http://localhost:3000/api/addBookmarks', {
        const response = await fetch('https://supabase-server.vercel.app/api/addBookmarks', {
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
