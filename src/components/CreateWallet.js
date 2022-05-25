import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { actionNames } from './../core/constants';

function CreateWallet() {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(state => state.general.user);
  const isCreatingWallet = useSelector(state => state.general.loaders.creatingWallet);
  const isDeletingWallet = useSelector(state => state.general.loaders.deletingWallet);
  const walletCreating = useSelector(state => state.general.walletCreating);
  const walletsCreated = useSelector(state => state.general.walletsCreated);

  const [signer, setSigner] = useState('');

  useEffect(() => {
    if (!user) {
      return;
    }
    dispatch({ type: actionNames.getUserWallets, payload: { user } });
    if (location.pathname === '/create-wallet/creating') {
      const urlParams = new URLSearchParams(window.location.search);
      const tx = urlParams.get('tx');
      if (tx) {
        dispatch({ type: actionNames.creatingMultisigWallet, payload: { tx, user } });
      }
    }
  }, [user]);

  const createMultisigWallet = async () => {
    dispatch({ type: actionNames.createMultisigWallet, payload: { user } });
  };

  const deleteWalletCreating = async () => {
    dispatch({ type: actionNames.deleteWalletCreating, payload: { walletCreating } });
  };

  const addSignerToWalletCreating = async () => {
    dispatch({ type: actionNames.addSignerToWalletCreating, payload: { signer, user, walletCreating } });
  };

  return (
    <>
      <h2>CreateWallet</h2>
      <button onClick={() => createMultisigWallet()} disabled={isCreatingWallet || walletCreating}>
        Create New Multisig Wallet
      </button>
      <div>isCreatingWallet: {isCreatingWallet ? 'true' : 'false'}</div>
      <br />
      <div>Past Wallets Created: {JSON.stringify(walletsCreated)}</div>
      <br />
      <div>Current Wallet Creation: {JSON.stringify(walletCreating)}</div>
      {walletCreating && (
        <>
          <button onClick={() => deleteWalletCreating()} disabled={isDeletingWallet}>
            Delete
          </button>
          <button onClick={() => addSignerToWalletCreating()}>Add Signer</button>
          <input value={signer} onChange={e => setSigner(e.target.value)} />
        </>
      )}
    </>
  );
}

export default CreateWallet;
