import browser from "webextension-polyfill";
import supabase from './js/supabase_client';
import { fetchDescriptions, addSingleBookmark } from "./js/upload";

let userId = null;
let Uploadcheck = false;

async function handleMessage({ action, value }, response) {
  if (action === 'signup') {
    const result = await supabase.auth.signUp(value);
    response({ message: 'Successfully signed up!', data: result });
  } else if (action === 'signin') {
    console.log('requesting auth');
    const { data, error } = await supabase.auth.signInWithPassword(value);
    // console.log(value);
    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      userId = user.id;
      chrome.storage.local.set({ userId: userId });
      chrome.storage.local.set({ value: value});
    }
    response({ data, error });
  } else if (action === 'getSession') {
    let session = await supabase.auth.getSession();
    if (!session) {
      const result = await new Promise((resolve, reject) => {
        chrome.storage.local.get(['value'], function(result) {
          resolve(result); 
        });
      });
      if (result.value) {
        await supabase.auth.signInWithPassword(result.value);
        console.log("resign in");
        session = await supabase.auth.getSession(); 
      }
    }
    console.log("response:", session);
    response(session);
  } else if (action === 'getUserid') {
    if(!userId){
      const user = (await supabase.auth.getUser()).data.user;
      if(user) {
        userId = user.id;
      }
    }
    response({ user_id: userId });
  } else if (action === 'getUploadcheck') {
    if(Uploadcheck == true){
      response({ Uploadcheck: Uploadcheck });
    } else {
      await getUploadcheck();
      response({ Uploadcheck: Uploadcheck });
    }
  }else if (action === 'signout') {
    const { error } = await supabase.auth.signOut();
    chrome.storage.local.set({ value: null});
    response({ data: null, error });
  } else if (action === 'startUpload') {
    browser.bookmarks.getTree().then(processBookmarks).catch(error => console.error(error));
  } else {
    response({ data: null, error: 'Unknown action' });
  }
}

chrome.storage.local.get(['value'], function(result){
  if(result.value){
    supabase.auth.signInWithPassword(result.value);
    console.log("resign in")
  } else {
    console.log("value init", result.value);
    chrome.runtime.sendMessage({action: "showSignIn"});
  }
})

chrome.storage.local.get(['Uploadcheck'], function(result){
  if(result.Uploadcheck){
    Uploadcheck = result.Uploadcheck;
    console.log("reUploadcheck",Uploadcheck)
  } else {
    console.log("Uploadcheck", result.Uploadcheck);
  }
})

chrome.storage.local.get(['userId'], function(result){
  if(result.userId){
    userId = result.userId;
    console.log("reset userId")
  }
})

chrome.bookmarks.onCreated.addListener((id, bookmark) => {
  console.log(`New bookmark created: ${bookmark.title} - ${bookmark.url}`);
  addSingleBookmark(userId, bookmark);
});

// supabase.auth.onAuthStateChange((event, session) => {
//   if (event === 'TOKEN_REFRESHED' && session) {
//     console.log('TOKEN_REFRESHED', session)
//     const refreshToken = session.refresh_token;
//     chrome.storage.local.set({ refreshToken: refreshToken });
//   }
// })
// setInterval(() => {
//   chrome.storage.local.get(['refreshToken'], function(result) {
//     console.log('Stored refreshToken:', result.refreshToken);
//   });
// }, 1000 * 60 * 1);

export function getCurrentUserId() {
  return userId;
}

browser.runtime.onMessage.addListener((msg, sender, response) => {
  handleMessage(msg, response);
  return true;
});


async function processBookmarks(bookmarkTreeNodes) {
  let bookmarks = [];
  bookmarkTreeNodes.forEach(node => {
    extractBookmarks(node, bookmarks);
  });
  console.log(bookmarks);
  await fetchDescriptions(userId, bookmarks);
}

function extractBookmarks(node, bookmarks) {
  if (node.children) {
    node.children.forEach(child => extractBookmarks(child, bookmarks));
  } else if (node.url) {
    bookmarks.push({ title: node.title || '', url: node.url });
  }
}

function deleteBookmark(url) {
  browser.bookmarks.search({ url }).then(bookmarkItems => {
    bookmarkItems.forEach(bookmarkItem => {
      if (bookmarkItem.id) {
        browser.bookmarks.remove(bookmarkItem.id);
      }
    });
  }).catch(error => console.error(error));
}

function getErrors() {
  return errors;
}

async function getUploadcheck() {
  if(userId){
    const searchResponse = await fetch('https://supabase-server.vercel.app/api/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ query:'anything', topK: 5, userId: userId}) 
    });
    const searchData = await searchResponse.json();
    // console.log("fetch upload check", searchData);
    if(searchData.length > 0){
      chrome.storage.local.set({ Uploadcheck: true });
      Uploadcheck = true;
      return;
    } 
  }
  Uploadcheck = false;
}

