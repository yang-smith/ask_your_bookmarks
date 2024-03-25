
let process = 0;
let count = 0;
let errors = [];


async function fetchGitHubRepoDescriptionFromUrl(githubRepoUrl) {
    const urlPattern = /https:\/\/github\.com\/([^\/]+)\/([^\/]+)/;
    const match = githubRepoUrl.match(urlPattern);

    if (!match) {
        return 'Invalid GitHub URL';
    }

    const owner = match[1];
    const repo = match[2];

    const apiUrl = `https://api.github.com/repos/${owner}/${repo}`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        const repoData = await response.json();

        if (response.ok) {
            return repoData.description || '';
        } else {
            return `Error: ${repoData.message}`;
        }
    } catch (error) {
        console.error('Error fetching GitHub repository description:', error);
        return null;
    }
}

async function fetchYouTubeVideoDescription(videourl) {
    const urlObj = new URL(videourl);
    let videoId = '';

    if (urlObj.hostname === 'youtu.be') {
        id = urlObj.pathname.split('/')[1];
    } else if (urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtube.com') {
        if (urlObj.pathname === '/watch') {
            id = urlObj.searchParams.get('v');
        } else if (urlObj.pathname.startsWith('/embed/')) {
            id = urlObj.pathname.split('/')[2];
        }
    }

    const apiKey = 'AIzaSyCU_zRSQ4LvnQ49wTcEHDcyfWhMCSCYEk0'; 
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${apiKey}&part=snippet`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.items.length > 0) {
            const description = data.items[0].snippet.description;
            return description;
        } else {
            return 'Description not found';
        }
    } catch (error) {
        console.error('Error fetching YouTube video description:', error);
        return null;
    }
}

async function fetchDescription(url) {
    if (url.includes('github.com')) {
        return fetchGitHubRepoDescriptionFromUrl(url);
    } else if (url.includes('youtube.com')) {
        return fetchYouTubeVideoDescription(url);
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const timeoutPromise = (timeout) => new Promise((_, reject) => {
        setTimeout(() => {
            controller.abort();
            reject(new Error('Request timed out'));
        }, timeout);
    });

    try {
        // 使用 HEAD 请求作为预检测
        const headResponse = await fetch(url, { method: 'HEAD', signal });
        if (!headResponse.ok) throw new Error(`HEAD request failed with status ${headResponse.status}`);

        // 然后执行 GET 请求获取完整的 HTML
        const fetchPromise = fetch(url, { signal }).then(response => response.text());
        const html = await Promise.race([fetchPromise, timeoutPromise(10000)]);

        let description = null;
        // 拓展搜索范围
        const metaTagsRegex = /<meta\s+(?:name="description"|property="og:description"|name="twitter:description")\s+content="([^"]*)"/ig;
        let match;
        while ((match = metaTagsRegex.exec(html)) !== null) {
            if (match[1] && (!description || description.length < match[1].length)) {
                // 选择最长的description
                description = match[1];
            }
        }

        return description;
    } catch (error) {
        console.error(`Error fetching description for ${url}:`, error);
        if (typeof errors !== 'undefined') {
            errors.push({ url: url, error: error.message });
        }
        return null;
    }
}




export async function fetchDescriptions(user_id, bookmarks, batchSize = 30) {
    let processed = 0;
    count = 0;
    const total = bookmarks.length;

    const sendBatchToAPI = async (batch) => {
        console.log(`Sending ${batch.length} bookmarks to API`);
        try {
            await sendBookmarksToAPI(batch);
        } catch (error) {
            console.error("Error sending bookmarks to API:", error);
        }
    };

    const processBatch = async (batch) => {
        const fetchPromises = batch.map(bookmark =>
            fetchDescription(bookmark.url)
                .then(description => {
                    bookmark.description = description;
                })
                .catch(error => {
                    console.log("error in");
                })
                .finally(()=>{
                    bookmark.user_id = user_id;
                    count++;
                    process = Math.round((count / total) * 100);
                    chrome.storage.local.set({ process: process });
                })
        );
        await Promise.allSettled(fetchPromises);
        processed += batch.length;
        console.log(`Processed ${processed}/${bookmarks.length} bookmarks`);
    };

    while (processed < bookmarks.length) {
        const batch = bookmarks.slice(processed, processed + batchSize);
        await processBatch(batch);
        await sendBatchToAPI(batch);
    }

    console.log(errors); 
    console.log(bookmarks); 
    process = 100;
    chrome.storage.local.set({ Uploadcheck: true });
}

export async function addSingleBookmark(user_id, bookmark) {
    bookmark.description = await fetchDescription(bookmark.url);
    bookmark.user_id = user_id;
    sendBookmarksToAPI([bookmark]);
}


async function sendBookmarksToAPI(bookmarks) {
    try {
        // const response = await fetch('http://localhost:3000/api/addBookmarks', {
        // const response = await fetch('https://supabase-server.vercel.app/api/addBookmarks', {
        // const response = await fetch('https://api.bookmarkbot.fun/api/addBookmarks', {
            const response = await fetch('https://api.bookmarkbot.fun/api/addBookmarksTest', {
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


