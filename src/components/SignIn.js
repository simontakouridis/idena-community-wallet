import React from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useDispatch, useSelector } from 'react-redux';
import { actionNames } from './../core/constants';
import { truncateAddress } from './../core/utilities';
import { appConfigurations } from './../core/constants';
import './Signin.css';

function SignIn() {
  const user = useSelector(state => state.general.user);
  const tokensSecured = useSelector(state => state.general.tokensSecured);

  const dispatch = useDispatch();

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
    <div className="SignIn">
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
    </div>
  );
}

export default SignIn;
