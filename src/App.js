import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { sliceName as generalSliceName } from './core/reducer';
import { actionNames } from './core/constants';
import { getAuthLocalStorage, setAuthLocalStorage, getExpiresCurrentUnixMilli } from './core/utilities';
import { appConfigurations } from './core/constants';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.general.user);
  const tokensSecured = useSelector(state => state.general.tokensSecured);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idenaAuthToken = urlParams.get('token');
    const { tokens } = getAuthLocalStorage();
    if (tokens) {
      const { expiresUnixMilli, currentUnixMilli } = getExpiresCurrentUnixMilli(tokens.refresh.expires);
      if (expiresUnixMilli - 10000 > currentUnixMilli) {
        dispatch({ type: actionNames[generalSliceName].updateTokensSecured, payload: true });
        return;
      }
    }
    setAuthLocalStorage('', '');
    if (idenaAuthToken) {
      dispatch({ type: actionNames.processLogin, payload: idenaAuthToken });
    }
  }, []);

  useEffect(() => {
    let intervalId;
    if (tokensSecured) {
      const { user } = getAuthLocalStorage();
      dispatch({ type: actionNames[generalSliceName].updateUser, payload: user });
      intervalId = setInterval(() => {
        dispatch({ type: actionNames.refreshTokens });
      }, appConfigurations.refreshTokensMinutes * 60 * 1000);
    } else {
      dispatch({ type: actionNames[generalSliceName].updateUser, payload: null });
      intervalId && clearInterval(intervalId);
    }
    return () => intervalId && clearInterval(intervalId);
  }, [tokensSecured]);

  const idenaSignIn = () => {
    const token = uuidv4();
    const params = new URLSearchParams({
      token,
      callback_url: encodeURIComponent(`${appConfigurations.localBaseUrl}?token=${token}`),
      nonce_endpoint: `${appConfigurations.apiBaseUrl}/auth/start-session`,
      authentication_endpoint: `${appConfigurations.apiBaseUrl}/auth/authenticate`,
      favicon_url: `${appConfigurations.localBaseUrl}/favicon.ico`
    });

    window.location.href = `${appConfigurations.idenaSignInUrl}?` + params.toString();
  };

  const signOut = () => {
    dispatch({ type: actionNames.processlogout });
  };

  return (
    <div className="App">
      <div>Hello World</div>
      <div>{tokensSecured ? <button onClick={() => signOut()}>Sign Out</button> : <button onClick={() => idenaSignIn()}>Sign in with Idena</button>}</div>
      <div>User Address: {user?.address}</div>
    </div>
  );
}

export default App;
