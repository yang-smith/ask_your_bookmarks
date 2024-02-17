
let process = 0;
let count = 0;
let errors = [];

async function fetchDescription(url) {
    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutPromise = (timeout) => new Promise((_, reject) => {
        const timeoutId = setTimeout(() => {
            controller.abort(); 
            reject(new Error('Request timed out')); 
        }, timeout);
    });

    try {
        const fetchPromise = fetch(url, { signal }).then(response => response.text());

        const html = await Promise.race([fetchPromise, timeoutPromise(10000)]); 

        let description = null;
        if (url.includes('github.com')) {
            const match = html.match(/<meta name="twitter:description" content="([^"]+)"/i);
            if (match && !match[1].includes('Contribute to')) {
                description = match[1];
            }
        } else if (url.includes('youtube.com')) {
            console.log(`YouTube: ${url}`);
        } else if (url.startsWith('chrome-extension://') || url.startsWith('moz-extension://')) {
            console.log(`Processing extension URL: ${url}`);
            description = 'extension';
        } else {
            const metaRegex = /<meta\s+(?:name="description"|\s+property="og:description")\s+content="([^"]*)"/i;
            const match = html.match(metaRegex);
            if (match) {
                description = match[1];
            }
        }
        return description;
    } catch (error) {
        console.error(`Error fetching description for ${url}:`, error);
        errors.push({ url: bookmark.url, error: error.message });
        return null;
    }
}



export async function fetchDescriptions(user_id, bookmarks, batchSize = 30) {
    let processed = 0;
    count = 0;
    const total = bookmarks.length;
    const processBatch = async (batch) => {
        const fetchPromises = batch.map(bookmark =>
            fetchDescription(bookmark.url)
                .then(description => {
                    bookmark.description = description;
                    bookmark.user_id = user_id;
                    count++;
                    process = Math.round((count / total) * 100);
                })
                .catch(error => {
                    console.log("error in");
                    bookmark.user_id = user_id;
                    count++;
                    process = Math.round((count / total) * 100);
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
    
    console.log(bookmarks); 
    process = 100;
    sendBookmarksToAPI(bookmarks);
}

export function getProcess(){
    return process;
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


