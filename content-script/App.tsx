import browser from "webextension-polyfill";
import { useEffect, useState } from "react";
import SignIn from "./SignIn";
import SearchComponent from "./Search";
import React from "react";
import Upload from "./Upload";
import AIComponent from "./Ai";
import BookMarks from "./Bookmarks";

enum SCREEN {
  SIGN_IN, SIGN_UP, SEARCH, UPLOAD, AI, BOOKMARKS
}

const App = () => {
  const [fact, setFact] = useState('Click the button to fetch a fact!');
  const [loading, setLoading] = useState(false);
  const [uploadcheck, setUploadcheck] = useState(true);
  const [session, setSession] = useState(null);
  const [screen, setScreen] = useState(SCREEN.SEARCH);
  const [error, setError] = useState('');

  async function getSession() {
    const { data: { session } } = await browser.runtime.sendMessage({ action: 'getSession' });
    console.log("getsesion", session);
    setSession(session);
  }
  async function getUploadcheck() {    
    chrome.storage.local.get(['Uploadcheck'], function(result){
      if(result.Uploadcheck){
        setUploadcheck(result.Uploadcheck);
      }
    })

    chrome.storage.local.get(['userId'], function(result){
      if(!result.userId){
        setScreen(SCREEN.SIGN_UP);
      }
    })
  }

  useEffect(() => {
    getSession();
    getUploadcheck();
    const handleMessage = (message, sender, sendResponse) => {
      if (message.action === "showSignIn") {
        setScreen(SCREEN.SIGN_IN);
      }
    };
    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, []);

  async function handleOnClick() {
    setLoading(true);
    const { data } = await browser.runtime.sendMessage({ action: 'fetch' });
    setFact(data);
    setLoading(false);
  }

  async function handleSignUp(email: string, password: string) {
    await browser.runtime.sendMessage({ action: 'signup', value: { email, password } });
    setScreen(SCREEN.SIGN_IN)
  }

  async function handleSignIn(email: string, password: string) {
    const { data, error } = await browser.runtime.sendMessage({ action: 'signin', value: { email, password } });
    if (error) return setError(error.message)
    // console.log(data.session);
    setSession(data.session)
    await getUploadcheck();
    console.log("if uploadcheck: ", uploadcheck);
    if (uploadcheck) {
      setScreen(SCREEN.SEARCH);
    } else {
      setScreen(SCREEN.UPLOAD);
    }
  }

  async function handleSignOut() {
    const signOutResult = await browser.runtime.sendMessage({ action: 'signout' });
    setScreen(SCREEN.SIGN_IN);
    setSession(signOutResult.data);
  }

  function AuthenticatedApp() {
    const screenComponents = {
      [SCREEN.SIGN_IN]: (
        <SignIn
          title="Sign In"
          onSignIn={handleSignIn}
          onScreenChange={() => {
            setScreen(SCREEN.SIGN_UP);
            setError('');
          }}
          helpText={'Create an account'}
          error={error}
        />
      ),
      [SCREEN.SIGN_UP]: (
        <SignIn
          onSignIn={handleSignUp}
          title="Sign Up"
          onScreenChange={() => {
            setScreen(SCREEN.SIGN_IN);
            setError('');
          }}
          helpText={'Got an account? Sign in'}
          error={error}
        />
      ),
      [SCREEN.UPLOAD]: <Upload onScreenChange={() => setScreen(SCREEN.SEARCH)} />,
      [SCREEN.SEARCH]: <SearchComponent BackToSign={() => setScreen(SCREEN.SIGN_IN)} />,
      [SCREEN.AI]: <AIComponent ChangeToSearch={() => setScreen(SCREEN.SEARCH)} />,
      [SCREEN.BOOKMARKS]: <BookMarks ChangeToSearch={() => setScreen(SCREEN.SEARCH)} />,
    };
  
    return screenComponents[screen] || <div>Screen not found</div>;
  }

  return (
    // <div className='absolute top-0 left-0'>
    <div className='flex flex-col gap-4 p-4 shadow-sm bg-gradient-to-r from-purple-100 to-blue-200 w-96 rounded-md'>
      <div>
        <div className="font-bold">App Logo</div>
          <button className="py-2 px-4 bg-blue-400 hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition duration-300" onClick={() => setScreen(SCREEN.SEARCH)}>搜索</button>
          <button className="py-2 px-4 bg-blue-400 hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition duration-300" onClick={() => setScreen(SCREEN.UPLOAD)}>上传</button>
          <button className="py-2 px-4 bg-blue-400 hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition duration-300" onClick={() => setScreen(SCREEN.AI)}>AI</button>
          <button className="py-2 px-4 bg-blue-400 hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition duration-300" onClick={() => setScreen(SCREEN.BOOKMARKS)}>书签</button>
        {session && (
          <button className="ml-auto py-2 px-4 border border-white rounded-md hover:bg-white hover:text-blue-700 transition duration-300" onClick={handleSignOut}>
            登出
          </button>
        )}
        {!session && (
          <button className="ml-auto py-2 px-4 border border-white rounded-md hover:bg-white hover:text-blue-700 transition duration-300" onClick={() => setScreen(SCREEN.SIGN_IN)}>
            Sign in
          </button>
        )}
      </div>


      {/* {renderApp()} */}
      {AuthenticatedApp()}
    </div>
    // </div>
  )
}
export default App;