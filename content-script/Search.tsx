import React, { useEffect, useState } from 'react';
import browser from "webextension-polyfill";
import { incrementBookmarkClick } from '../js/db';

type Props = {
  onSearch: (query: string) => void;
};

const SearchComponent = ({ BackToSign }) => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [frequentlyUsedBookmarks, setFrequentlyUsedBookmarks] = useState([]);

  useEffect(() => {
    chrome.storage.local.get(null, function (items) {
      const bookmarks = Object.keys(items)
        .filter(url => url.startsWith('http'))
        .map(url => ({
          url: url,
          title: items[url].title,
          count: items[url].count
        }));

      const sortedBookmarks = bookmarks.sort((a, b) => b.count - a.count);
      setFrequentlyUsedBookmarks(sortedBookmarks);
    });

  }, []);

  const handleSearchClick = async () => {
    if (query.trim() !== '') {
      console.log("Searching for:", query);
      try {
        const response = await browser.runtime.sendMessage({ action: 'getUserid' });
        // const searchResponse = await fetch('https://supabase-server.vercel.app/api/search', {
        const searchResponse = await fetch('https://api.bookmarkbot.fun/api/search', {
          // const searchResponse = await fetch('http://localhost:3000/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query, topK: 15, userId: response.user_id })
        });

        if (!searchResponse.ok) {
          throw new Error(`Search request failed: ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();
        // console.log('Search results:', searchData);
        setSearchResults(searchData);
      } catch (error) {
        console.error('Error during search:', error);
      }
    }
  };

  const openUrlInNewTab = (url, title) => {
    chrome.tabs.create({ url, active: false });
    incrementBookmarkClick(url, title, 1);
  };


  return (
    <div className="flex flex-col h-full p-4">
      <div className="flex items-center gap-2 mb-4">
        <input
          className="flex-grow h-10 rounded-md border px-3 text-sm"
          placeholder="What do you want?"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearchClick();
            }
          }}
        />
        <button
          className="h-10 px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={handleSearchClick}
        >
          Search
        </button>
      </div>
      {/* 搜索结果*/}
      <div className="flex-1 overflow-y-auto space-y-1">
        {searchResults.map((result, index) => {
          // 分割标题和描述
          const [title, description] = result.pageContent.split('\n');

          const openUrlInNewTab = (url, title) => {
            chrome.tabs.create({ url, active: false });
            incrementBookmarkClick(url, title, 1);
          };

          return (
            <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
              <h3 className="font-semibold">
                <a href="#" onClick={() => openUrlInNewTab(result.metadata.url, title)} className="hover:underline">
                  {title}
                </a>
              </h3>
              <p className="text-sm text-gray-500">{description}</p>
            </div>
          );
        })}
      </div>
      {searchResults.length === 0 && (
        <div>
          {frequentlyUsedBookmarks.map((bookmark, index) => (
            <div key={index} className="mb-2">
              <p className="text-sm text-gray-600">
                <a href="#" onClick={() => openUrlInNewTab(bookmark.url, bookmark.title)} className="hover:underline">
                  {bookmark.title} <span className="text-xs text-gray-500">(Clicked {bookmark.count})</span>
                </a>
              </p>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default SearchComponent;
