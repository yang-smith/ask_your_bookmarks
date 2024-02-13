import React, { useEffect, useState } from "react";
import { Formik, Form, Field } from "formik";
import browser from "webextension-polyfill";

const Upload = ({onScreenChange}) => {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0); 

  const handleStartUpload = () =>{
    browser.runtime.sendMessage({ action: 'startUpload' });
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
      <h1 className="text-lg font-bold text-slate-800 py-6">Restruct your bookmarks</h1>
      <div className='flex flex-col gap-y-2'>
        <button onClick={handleStartUpload}>
            start
        </button>
        {loading && (
          <>
            <div className="w-full bg-gray-200 rounded-full dark:bg-gray-700">
              <div className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full" style={{ width: `${progress}%` }}> Doing... {progress}% </div>
            </div>
            <p className="text-slate-700">Please wait, in progress...</p>
          </>
        )}
        {!loading && (
          <p className="text-slate-700">Completed!</p>
        )}
        { (
          <p className={'font-bold text-orange-600'}></p>
        )}
      </div>
    </>
  );
};

export default Upload;
