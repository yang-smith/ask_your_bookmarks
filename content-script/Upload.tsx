import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import browser from "webextension-polyfill";

const Upload = ({ onScreenChange }) => {
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleStartUpload = () => {
    browser.runtime.sendMessage({ action: 'startUpload' });
    setLoading(true);
  }

  useEffect(() => {
    // 请求当前进度的函数
    const requestProgress = async () => {
      try {
        const response = await browser.runtime.sendMessage({ action: 'getProcessed' });
        if (response && response.process !== undefined) {
          setProgress(response.process); // 更新进度
          setLoading(response.process < 100); // 根据进度决定是否继续显示加载状态
          if (response.process >= 100) {
            clearInterval(intervalId);
            onScreenChange();
          }
        }
      } catch (error) {
        console.error('Error requesting progress:', error);
      }
    };

    // 定时请求进度信息
    const intervalId = setInterval(requestProgress, 1000);

    // 清理函数，组件卸载时清除定时器
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <div className='flex flex-col items-center gap-y-4 py-6'>
        <button
          className="bg-indigo-500 text-white text-lg font-bold py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:shadow-outline"
          onClick={handleStartUpload}>
          Reconstruct Your Old Bookmarks
        </button>

        {progress>1 && (
          <>
            <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
              <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${progress}%` }}> Doing... {progress}% </div>
            </div>
            <p className="text-slate-700">Please wait, in progress...</p>
          </>
        )}
        {progress>=100 && (
          <p className="text-slate-700">Completed!</p>
        )}
      </div>
    </>
  );
};

export default Upload;
