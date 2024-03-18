import React, {useState } from 'react';
import browser from "webextension-polyfill";
import { Prompt, Prompt_zn } from './prompt';
import { displayAllBookmarkClicks, incrementBookmarkClick } from '../js/db';
// import ReactMarkdown from 'react-markdown';

const AIComponent = ({ ChangeToSearch }) => {
    const [query, setQuery] = useState('');
    const [content, setContent] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    const handleSearchClick = async () => {
        if (query.trim() !== '') {
            // console.log("Searching for:", query);
            setIsSearching(true);
            try {
                const response = await browser.runtime.sendMessage({ action: 'getUserid' });
                // const searchResponse = await fetch('https://supabase-server.vercel.app/api/search', {
                const searchResponse = await fetch('https://api.bookmarkbot.fun/api/search', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ query, topK: 10, userId: response.user_id })
                });
                if (!searchResponse.ok) {
                    throw new Error(`AI Search request failed: ${searchResponse.statusText}`);
                }
                const searchData = await searchResponse.json();
                let formattedString = '';
                searchData.forEach((item: { pageContent: string; metadata: { url: string; } }) => {
                    const [websiteName, description] = item.pageContent.split('\n');
                    const formattedDescription = description ? `- ${description}` : '';
                    const currentItemString = `(${websiteName})[${item.metadata.url}] ${formattedDescription}`;
                    formattedString += currentItemString + '\n';
                });

                const isChineseLanguage = navigator.language.startsWith('zh');

                const prompt = !isChineseLanguage 
                    ? Prompt(query, formattedString)
                    : Prompt_zn(query, formattedString);
                // console.log(prompt);
                // return;
                const messages = [
                    { "role": "system", "content": "you are a assitant" },
                    { "role": "user", "content": prompt }
                ];

                const controller = new AbortController();
                // const AIResponse = await fetch('https://supabase-server.vercel.app/api/stream', {
                const AIResponse = await fetch('https://api.bookmarkbot.fun/api/stream', {
                    // const AIResponse = await fetch('http://localhost:3000/api/stream', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    signal: controller.signal,
                    body: JSON.stringify({
                        model: 'gpt-3.5-turbo-16k',
                        messages: messages,
                        temperature: 0.2,
                        userId: response.user_id
                    }),
                });

                if (!AIResponse.ok) {
                    throw new Error(`AI request failed: ${AIResponse.statusText}`);
                }
                const data = AIResponse.body;
                // console.log(data);
                if (!data) {
                    console.log(data);
                    return;
                }

                const reader = data.getReader();
                const decoder = new TextDecoder();
                let done = false;
                let text = '';
                while (!done) {
                    const { value, done: doneReading } = await reader.read();
                    done = doneReading;
                    const chunkValue = decoder.decode(value);
                    text += chunkValue;
                    setContent(text);
                }

            } catch (error) {
                console.error('Error during search:', error);
            } finally {
                setIsSearching(false); 
            }
        }
    };

    const parseContent = (content) => {
        const lines = content.split('\n'); // 根据换行符分割内容
        return lines.map((line, index) => {
            if (!line) return null; // 跳过空行

            // 使用正则表达式匹配URL和描述
            const match = line.match(/\[(.*?)\]\((.*?)\)\s-\s(.*)/);
            if (match) {
                const [, title, url, description] = match;
                return (
                    <div key={index}>
                        <a href={url} target="_blank" rel="noopener noreferrer"><strong>{title}</strong></a> - {description}
                    </div>
                );
            }
            return <div key={index}>{line}</div>; // 对于不匹配的行，原样返回
        });
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
                    disabled={isSearching}
                >
                    {isSearching ? 'Asking...' : 'Ask'}
                </button>
            </div>
            {/* 添加内容显示区域 */}
            <div className="content-display" >
                {parseContent(content)}
            </div>


        </div>
    );
};

export default AIComponent;
