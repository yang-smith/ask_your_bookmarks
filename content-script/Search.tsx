import React, { useState } from 'react';

type Props = {
  onSearch: (query: string) => void; // 定义 onSearch prop 类型
};

const SearchComponent = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [resultsPerPage, setResultsPerPage] = useState(5);


  const handleSearchClick = async () => {
    if (query.trim() !== '') {
      console.log("Searching for:", query);
      try {
        // 发送搜索请求到你的API
        const searchResponse = await fetch('https://supabase-server.vercel.app/api/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query, topK: 10 }) // 根据需要调整topK值
        });

        if (!searchResponse.ok) {
          throw new Error(`Search request failed: ${searchResponse.statusText}`);
        }

        const searchData = await searchResponse.json();
        console.log('Search results:', searchData);
        setSearchResults(searchData); // 保存搜索结果到状态
        setCurrentPage(1); // 重置到第一页
      } catch (error) {
        console.error('Error during search:', error);
      }
    }
  };
  // 计算总页数
  const totalPages = Math.ceil(searchResults.length / resultsPerPage);

  // 获取当前页的结果
  const currentResults = searchResults.slice(
    (currentPage - 1) * resultsPerPage,
    currentPage * resultsPerPage
  );

  const handlePageClick = (newPage) => {
    setCurrentPage(newPage);
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
        />
        <button
          className="h-10 px-4 py-2 bg-blue-500 text-white rounded-md"
          onClick={handleSearchClick}
        >
          Ask
        </button>
      </div>
      {/* 搜索结果和分页等其他功能将在这里实现 */}
      <div className="flex-1 overflow-y-auto space-y-4">
        {currentResults.map((result, index) => (
          <div key={index} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
            <h3 className="font-semibold">{result.pageContent}</h3>
            <p className="text-sm text-gray-500">{result.metadata.url}</p>
          </div>
        ))}
      </div>
      {/* 分页导航 */}
      <div className="mt-4 flex w-full justify-center">
        <nav aria-label="pagination">
          <ul className="flex flex-row items-center gap-2">
            {/* 上一页按钮 */}
            {currentPage > 1 && (
              <li>
                <button
                  aria-label="Go to previous page"
                  onClick={() => handlePageClick(currentPage - 1)}
                  className="inline-flex items-center justify-center gap-1 rounded-md bg-blue-500 text-white px-3 py-2 hover:bg-blue-600 transition-colors"
                >
                  {/* 使用 SVG 图标 */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                  </svg>
                  <span>Previous</span>
                </button>
              </li>
            )}
            {/* 分页数字按钮 */}
            {[...Array(totalPages).keys()].map(page => (
              <li key={page}>
                <button
                  onClick={() => handlePageClick(page + 1)}
                  aria-current={page + 1 === currentPage ? 'page' : undefined}
                  className={`w-9 h-9 flex items-center justify-center rounded-md text-sm font-medium transition-colors ${page + 1 === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                  {page + 1}
                </button>
              </li>
            ))}
            {/* 下一页按钮 */}
            {currentPage < totalPages && (
              <li>
                <button
                  aria-label="Go to next page"
                  onClick={() => handlePageClick(currentPage + 1)}
                  className="inline-flex items-center justify-center gap-1 rounded-md bg-blue-500 text-white px-3 py-2 hover:bg-blue-600 transition-colors"
                >
                  <span>Next</span>
                  {/* 使用 SVG 图标 */}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </li>
            )}
          </ul>
        </nav>
      </div>

    </div>
  );
};

export default SearchComponent;
