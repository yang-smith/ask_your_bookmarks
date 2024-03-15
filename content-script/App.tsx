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
  const [uploadcheck, setUploadcheck] = useState(true);
  const [session, setSession] = useState(null);
  const [screen, setScreen] = useState(SCREEN.SEARCH);
  const [error, setError] = useState('');

  async function getSession() {
    const { data: { session } } = await browser.runtime.sendMessage({ action: 'getSession' });
    console.log("getsesion", session);
    setSession(session);
  }

  async function checkScreen() {
    chrome.storage.local.get(['userId'], function(result){
      if(!result.userId){
        setScreen(SCREEN.SIGN_UP);
      }
    })
    chrome.storage.local.get(['process'], function(result){
      if(result.process){
        if(result.process>0 && result.process<100) {
          setUploadcheck(false);
          setScreen(SCREEN.UPLOAD);
        }
      }
    })
  }

  useEffect(() => {
    getSession();
    checkScreen();
  }, []);


  async function handleSignUp(email: string, password: string) {
    await browser.runtime.sendMessage({ action: 'signup', value: { email, password } });
    setScreen(SCREEN.SIGN_IN)
  }

  async function handleSignIn(email: string, password: string) {
    const { data, error } = await browser.runtime.sendMessage({ action: 'signin', value: { email, password } });
    if (error) return setError(error.message)
    // console.log(data.session);
    setSession(data.session)
    checkUpload();
  }

  async function checkUpload() {
    chrome.storage.local.get(['Uploadcheck'], function(result){
      if(result.Uploadcheck){
        if(result.Uploadcheck == false){
          setScreen(SCREEN.UPLOAD);
        } else {
          setScreen(SCREEN.SEARCH);
        }
      } else {
        setScreen(SCREEN.UPLOAD);
      }
    })
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
          <button className="py-2 px-4 bg-blue-400 hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition duration-300" onClick={() => setScreen(SCREEN.SEARCH)}>Search</button>
          {!uploadcheck && (
            <button className="py-2 px-4 bg-blue-400 hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition duration-300" onClick={() => setScreen(SCREEN.UPLOAD)}>Upload</button>
          )} 
          <button className="py-2 px-4 bg-blue-400 hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition duration-300" onClick={() => setScreen(SCREEN.AI)}>AI</button>
          <button className="py-2 px-4 bg-blue-400 hover:bg-blue-600 text-white font-semibold rounded-lg shadow transition duration-300" onClick={() => setScreen(SCREEN.BOOKMARKS)}>ALL</button>
          <button className="ml-auto py-2 px-4 border border-white rounded-md hover:bg-white hover:text-blue-700 transition duration-300" onClick={handleSignOut}>Sign out</button>
      </div>


      {/* {renderApp()} */}
      {AuthenticatedApp()}
    </div>
    // </div>
  )
}
export default App;