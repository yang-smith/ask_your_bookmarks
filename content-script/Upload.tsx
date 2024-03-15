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
        chrome.storage.local.get(['process'], function(result){
          if(result.process){
            setProgress(result.process);
          }
        })
        if (progress !== 0) {
          setProgress(progress); // 更新进度
          setLoading(progress < 100); // 根据进度决定是否继续显示加载状态
          if (progress >= 100) {
            onScreenChange();
            clearInterval(intervalId);
          }
        }
      } catch (error) {
        console.error('Error requesting progress:', error);
      }
    };

    const intervalId = setInterval(requestProgress, 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <>
      <div className='flex flex-col items-center gap-y-4 py-6'>
        {/* {progress == 0 && (
          <button
            className="bg-indigo-500 text-white text-lg font-bold py-2 px-4 rounded hover:bg-indigo-700 focus:outline-none focus:shadow-outline"
            onClick={handleStartUpload}>
            Reconstruct Your Old Bookmarks
          </button>
        )} */}

        {(progress > 1 && progress < 100) && (
          <>
            <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
              <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${progress}%` }}> Doing... {progress}% </div>
            </div>
            <p className="text-slate-700">Please wait, Reinventing bookmarks...</p>
          </>
        )}
        {progress >= 100 && (
          <p className="text-slate-700">Completed!</p>
        )}
      </div>
    </>
  );
};

export default Upload;
