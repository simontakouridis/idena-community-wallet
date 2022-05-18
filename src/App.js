import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { sliceName as generalSliceName } from './core/reducer';
import { actionNames } from './core/constants';
import { getAuthLocalStorage, removeAuthLocalStorage, getExpiresCurrentUnixMilli } from './core/utilities';
import { appConfigurations } from './core/constants';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import SignIn from './components/SignIn';
import Home from './components/Home';
import Delegates from './components/Delegates';
import Proposals from './components/Proposals';
import Wallet from './components/Wallet';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  const dispatch = useDispatch();
  const tokensSecured = useSelector(state => state.general.tokensSecured);
  const error = useSelector(state => state.general.error);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idenaAuthToken = urlParams.get('token');
    const { tokens } = getAuthLocalStorage();
    if (tokens) {
      const { expiresUnixMilli, currentUnixMilli } = getExpiresCurrentUnixMilli(tokens.refresh.expires);
      if (expiresUnixMilli - 10000 > currentUnixMilli) {
        dispatch({ type: actionNames[generalSliceName].updateTokensSecured, payload: true });
        dispatch({ type: actionNames.refreshTokens });
        return;
      }
    }
    removeAuthLocalStorage();
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

      dispatch({ type: actionNames.getData });
    } else {
      dispatch({ type: actionNames[generalSliceName].updateUser, payload: null });
      intervalId && clearInterval(intervalId);

      dispatch({ type: actionNames[generalSliceName].clearData });
    }
    return () => intervalId && clearInterval(intervalId);
  }, [tokensSecured]);

  useEffect(() => {
    if (error) {
      toast(error);
    }
  }, [error]);

  return (
    <BrowserRouter>
      <div className="App">
        <div className="Container">
          <SignIn />
          <Link to="/">Home</Link> | <Link to="/delegates">Delegates</Link> | <Link to="/proposals">Proposals</Link> | <Link to="/wallet">Wallet</Link>
          <Routes>
            <Route path="/delegates" element={<Delegates />} />
            <Route path="/proposals" element={<Proposals />} />
            <Route path="/wallet" element={<Wallet />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </div>
        <ToastContainer />
      </div>
    </BrowserRouter>
  );
}

export default App;
