import browser from "webextension-polyfill";
import supabase from './js/supabase_client';
import { fetchDescriptions } from "./js/upload";

let userId = null;

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
    const user = (await supabase.auth.getUser()).data.user;
    if (user) {
      userId = user.id;
    }
    // console.log('User ID:', userId);
    response({ data, error });
  } else if (action === 'getSession') {
    supabase.auth.getSession().then(response);
  } else if (action === 'signout') {
    const { error } = await supabase.auth.signOut();
    response({ data: null, error });
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

browser.runtime.onInstalled.addListener(() => {
  browser.bookmarks.getTree().then(processBookmarks).catch(error => console.error(error));
});

function processBookmarks(bookmarkTreeNodes) {
  let bookmarks = [];
  bookmarkTreeNodes.forEach(node => {
    extractBookmarks(node, bookmarks);
  });
  console.log(bookmarks);
  fetchDescriptions(userId, bookmarks);
  // You can now process the bookmarks as needed
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
