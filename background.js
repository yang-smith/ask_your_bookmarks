import browser from "webextension-polyfill";
import supabase from './js/supabase_client';
import { fetchDescriptions, getProcess } from "./js/upload";

let userId = null;
let Uploadcheck = false;

async function handleMessage({ action, value }, response) {
  if (action === 'fetch') {
    const result = await fetch('https://meowfacts.herokuapp.com/');
    const { data } = await result.json();
    response({ message: 'Successfully fetched data!', data });
  } else if (action === 'signup') {
    const result = await supabase.auth.signUp(value);
    response({ message: 'Successfully signed up!', data: result });
  } else if (action === 'signin') {
    console.log('requesting auth');
    const { data, error } = await supabase.auth.signInWithPassword(value);
    if (data) {
      const refreshToken = data.session.refresh_token;
      chrome.storage.local.set({ refreshToken: refreshToken }, function () {
        console.log(refreshToken);
      });
    }
    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      userId = user.id;
    }
    response({ data, error });
  } else if (action === 'getSession') {
    supabase.auth.getSession().then(response);
  } else if (action === 'getUserid') {
    response({ user_id: userId });
  } else if (action === 'getUploadcheck') {
    if(Uploadcheck == true || userId == null){
      console.log("Uploadcheck == true || userId == null");
      response({ Uploadcheck: Uploadcheck });
    } else {
      Uploadcheck = await getUploadcheck();
      response({ Uploadcheck: Uploadcheck });
    }
  }else if (action === 'signout') {
    const { error } = await supabase.auth.signOut();
    response({ data: null, error });
  } else if (action === 'startUpload') {
    browser.bookmarks.getTree().then(processBookmarks).catch(error => console.error(error));
  } else if (action === 'getProcessed') {
    console.log(getProcess());
    const process = getProcess();
    response({ process: process });
  } else {
    response({ data: null, error: 'Unknown action' });
  }
}

export function getCurrentUserId() {
  return userId;
}

browser.runtime.onMessage.addListener((msg, sender, response) => {
  handleMessage(msg, response);
  return true;
});

// browser.runtime.onInstalled.addListener(() => {
//   browser.bookmarks.getTree().then(processBookmarks).catch(error => console.error(error));
// });

function processBookmarks(bookmarkTreeNodes) {
  let bookmarks = [];
  bookmarkTreeNodes.forEach(node => {
    extractBookmarks(node, bookmarks);
  });
  console.log(bookmarks);
  fetchDescriptions(userId, bookmarks);
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
      body: JSON.stringify({ query:'anything', topK: 10, userId: userId}) 
    });
    const searchData = await searchResponse.json();
    console.log(searchData.length);
    if(searchData.length > 0){
      return true;
    } else {
      return false;
    }
  }
  return false;
}



// async function checkAndRefreshToken() {
//   const session = supabase.auth.getSession();
//   const currentTime = Date.now() / 1000; // 获取当前时间，转换为秒

//   if (session) {
//     const expiresIn = session.expires_at - currentTime;
//     // 如果令牌在1分钟内即将过期，尝试刷新令牌
//     if (expiresIn < 60) {
//       const { data, error } = await supabase.auth.refreshSession(); // 刷新令牌

//       if (error) {
//         console.error('Error refreshing access token:', error.message);
//       } else {
//         console.log('Access token refreshed successfully.');
//         const refreshToken = data.session.refresh_token;
//         chrome.storage.local.set({ refreshToken: refreshToken }, function () {
//           console.log(refreshToken);
//         });
//       }
//     }
//   } else {
//     // 尝试使用 chrome.storage.local 中的刷新令牌登录
//     chrome.storage.local.get('refreshToken', async function (result) {
//       const refreshToken = result.refreshToken;
//       if (refreshToken) {
//         const { data, error } = await supabase.auth.signInWithRefreshToken(refreshToken);

//         if (error) {
//           console.error('Error signing in with refresh token:', error.message);
//           // 处理使用刷新令牌登录失败的情况，可能需要用户重新登录
//         } else {
//           console.log('Signed in with refresh token successfully.');
//           // 更新 chrome.storage.local 中的会话信息
//           chrome.storage.local.set({ session: JSON.stringify(data.session) });
//           // 更新会话信息
//         }
//       } else {
//         console.log('No refresh token found. User might need to log in.');
//         // 处理无刷新令牌的情况，可能需要用户登录
//       }
//     });

//   }
// }
