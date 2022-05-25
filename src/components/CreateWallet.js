import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { actionNames } from './../core/constants';

function CreateWallet() {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(state => state.general.user);
  const isCreatingWallet = useSelector(state => state.general.loaders.creatingWallet);
  const walletCreating = useSelector(state => state.general.walletCreating);
  const walletsCreated = useSelector(state => state.general.walletsCreated);

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

  return (
    <>
      <h2>CreateWallet</h2>
      <div>Past Wallets Created: {walletsCreated}</div>
      <div>Current Wallet Creation: {walletCreating}</div>
      <button onClick={() => createMultisigWallet()} disabled={isCreatingWallet}>
        Create New Multisig Wallet
      </button>
      <div>isCreatingWallet: {isCreatingWallet}</div>
    </>
  );
}

export default CreateWallet;
