chrome.runtime.onInstalled.addListener(() => {
    chrome.bookmarks.getTree(processBookmarks);
});

var errors = [];

function getErrors() {
    return errors;
}

function deleteBookmark(url) {
    chrome.bookmarks.search({ url: url }, function(bookmarkItems) {
        bookmarkItems.forEach(function(bookmarkItem) {
            chrome.bookmarks.remove(bookmarkItem.id);
        });
    });
}

function processBookmarks(bookmarkTreeNodes) {
    let bookmarks = [];
    bookmarkTreeNodes.forEach(node => {
        extractBookmarks(node, bookmarks);
    });
    // 处理书签数据，例如，向量化
    console.log(bookmarks);
    
    // setTimeout(function() {
    //     fetchDescriptions(bookmarks);
    // }, 1000);

    // sendBookmarksToAPI(bookmarks);
    // getUser('zy892065502@gmail.com')
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

async function getUser(email) {
    try {
        const response = await fetch('https://supabase-server.vercel.app/api/user', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        const data = await response.json();
        console.log('GET:', data);
    } catch (error) {
        console.error('Error sending bookmarks to the API:', error);
    }
}


async function fetchDescription(url) {
    // GitHub URL
    if (url.includes('github.com') ) {
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
    }
    // Youtube
    if (url.includes('youtube') ) {
        console.log(`Youtube: ${url}`);
        return null;
    }
    // 扩展程序URL
    if (url.startsWith('chrome-extension://') || url.startsWith('moz-extension://')) {
        console.log(`Processing extension URL: ${url}`);
        return 'extension'; 
    }

    try {
        const response = await fetch(url);
        const html = await response.text();
        const match = html.match(/ name="description" content="([^"]+)"/i);
        return match ? match[1] : null;
    } catch (error) {
        console.error(`Error fetching description for ${url}:`, error);
        // errors.push({url,error});
        if(error){
            if (error.code === 'ECONNRESET' || error.code === 'UND_ERR_CONNECT_TIMEOUT') {
                errors.push({ url, error: 'Timeout error', errorCode: error.code });
            } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
                errors.push({ url, error: 'Server not found or connection refused', errorCode: error.code });
            } else {
                errors.push({ url, error: 'Unknown error', errorCode: error.code });
            }
        }
        return null;
    }
}

async function fetchDescriptions(bookmarks, batchSize = 30) {
    let processed = 0;
    // const errors = [];
    const processBatch = async (batch) => {
        const fetchPromises = batch.map(bookmark =>
            fetchDescription(bookmark.url).then(description => {
                bookmark.description = description;
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
    sendBookmarksToAPI(bookmarks);
    // return errors;
}






const SUPABASE_URL = 'https://ssvohyeivwdlhzvxewbf.supabase.co'
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzdm9oeWVpdndkbGh6dnhld2JmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDI3ODI4NDYsImV4cCI6MjAxODM1ODg0Nn0.Ne6shcg2WOZpRqki0uvuIerpAHKbtsIeLTCpib-AOpM'

const { createClient } = supabase;
supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log('supabase?', supabase);



const handleMessage = async function(msg, sender, response){
  console.log('handle...');
  if(msg.command == 'logoutAuth'){
    let { error } = await supabase.auth.signOut();
    //check for error here.. then choose response..
    response({type: "un-auth", status: "success", message: true});
  }
  if(msg.command == 'checkAuth'){
    var user = await supabase.auth.user();
    if (user) {
      // User is signed in.
      response({type: "auth", status: "success", message: user});
    } else {
      // No user is signed in.
      response({type: "auth", status: "no-auth", message: false});
    }
  }
  if(msg.command == 'loginUser'){
    console.log(msg.data);
    var email = msg.data.e;
    var pass = msg.data.p;
    let { user, error } = await supabase.auth.signIn({
      email: email,
      password: pass
    });
    console.log(error, user);
    if (user) {
      // User is signed in.
      response({type: "auth", status: "success", message: user});
    } else {
      // No user is signed in.
      response({type: "auth", status: "no-auth", message: false});
    }
  }
  if(msg.command == 'signupUser'){
    console.log(msg.data);
    var email = msg.data.e;
    var pass = msg.data.p;
    let { user, error } = await supabase.auth.signUp({
      email: email,
      password: pass
    });
    console.log(error, user);
    if (user) {
      // User is signed in.
      response({type: "auth", status: "success", message: user});
    } else {
      // No user is signed in.
      response({type: "auth", status: "no-auth", message: false});
    }
  }
  return true;
}


chrome.runtime.onMessage.addListener((msg, sender, response) => {
  handleMessage(msg, sender, response);
  return true;
});
