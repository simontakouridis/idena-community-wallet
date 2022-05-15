import React, { useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { ToastContainer, toast } from 'react-toastify';
import { sliceName as generalSliceName } from './core/reducer';
import { actionNames } from './core/constants';
import { getAuthLocalStorage, removeAuthLocalStorage, getExpiresCurrentUnixMilli, truncateAddress } from './core/utilities';
import { appConfigurations } from './core/constants';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';
function App() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.general.user);
  const users = useSelector(state => state.general.data.users);
  const tokensSecured = useSelector(state => state.general.tokensSecured);
  const error = useSelector(state => state.general.error);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const idenaAuthToken = urlParams.get('token');
    const { tokens } = getAuthLocalStorage();
    if (tokens) {
      const { expiresUnixMilli, currentUnixMilli } = getExpiresCurrentUnixMilli(tokens.refresh.expires);
      if (expiresUnixMilli - 10000 > currentUnixMilli) {
        dispatch({ type: actionNames.refreshTokens });
        dispatch({ type: actionNames[generalSliceName].updateTokensSecured, payload: true });
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
      <div className="Container">
        {user && (
          <div>
            <div>
              <a href={`https://scan.idena.io/address/${user.address}`} target="_blank" rel="noreferrer">
                <img className="UserImg" src={`https://robohash.org/${user.address}?set=set1`} />
              </a>
            </div>
            <div>
              <a href={`https://scan.idena.io/address/${user.address}`} target="_blank" rel="noreferrer">
                {truncateAddress(user.address)}
              </a>
            </div>
          </div>
        )}
        <div className="SignInButtonDiv">
          {tokensSecured ? <button onClick={() => signOut()}>Sign Out</button> : <button onClick={() => idenaSignIn()}>Sign in with Idena</button>}
        </div>
        {users && (
          <div className="UsersDiv">
            <table>
              <thead>
                <tr>
                  <th colSpan="2">All users:</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.address}>
                    <td>
                      <img className="UsersImg" src={`https://robohash.org/${user.address}?set=set1`} />
                    </td>
                    <td style={{ paddingTop: '10px' }}>
                      <a href={`https://scan.idena.io/address/${user.address}`} target="_blank" rel="noreferrer">
                        {truncateAddress(user.address)}
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
}

export default App;
