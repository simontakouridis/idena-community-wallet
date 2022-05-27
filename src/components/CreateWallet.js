import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { actionNames } from './../core/constants';
import { isValidAddress } from 'ethereumjs-util';

function CreateWallet() {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(state => state.general.user);
  const isCreatingWallet = useSelector(state => state.general.loaders.creatingWallet);
  const isDeletingWallet = useSelector(state => state.general.loaders.deletingWallet);
  const isAddingSigner = useSelector(state => state.general.loaders.addingSigner);
  const isActivatingWallet = useSelector(state => state.general.loaders.activatingWallet);
  const draftWallet = useSelector(state => state.general.draftWallet);
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
    if (location.pathname === '/create-wallet/adding') {
      const urlParams = new URLSearchParams(window.location.search);
      const tx = urlParams.get('tx');
      if (tx) {
        dispatch({ type: actionNames.addingSignerToMultisigWallet, payload: { tx, user } });
      }
    }
  }, [user]);

  const createMultisigWallet = async () => {
    dispatch({ type: actionNames.createMultisigWallet, payload: { user } });
  };

  const deleteDraftWallet = async () => {
    dispatch({ type: actionNames.deleteDraftWallet, payload: { draftWallet } });
  };

  const activateDraftWallet = async () => {
    dispatch({ type: actionNames.activateDraftWallet, payload: { draftWallet } });
  };

  const addSignerToDraftWallet = async () => {
    if (!isValidAddress(signer)) {
      alert('Not a valid address!');
      return;
    }
    dispatch({ type: actionNames.addSignerToDraftWallet, payload: { signer, user, draftWallet } });
  };

  return (
    <>
      <h2>CreateWallet</h2>
      <button onClick={() => createMultisigWallet()} disabled={isCreatingWallet || draftWallet}>
        Create New Multisig Wallet
      </button>
      <div>isCreatingWallet: {isCreatingWallet ? 'true' : 'false'}</div>
      <br />
      <div style={{ wordBreak: 'break-all' }}>Wallets Created: {JSON.stringify(walletsCreated)}</div>
      <br />
      <div style={{ wordBreak: 'break-all' }}>Draft Wallet: {JSON.stringify(draftWallet)}</div>
      {draftWallet && (
        <>
          <button onClick={() => deleteDraftWallet()} disabled={isDeletingWallet}>
            Delete
          </button>
          <button disabled={draftWallet.signers.length < 5 || isActivatingWallet} onClick={() => activateDraftWallet()}>
            Activate
          </button>
          <div>
            <button disabled={draftWallet.signers.length >= 5 || isAddingSigner} onClick={() => addSignerToDraftWallet()}>
              Add Signer
            </button>
            <input disabled={draftWallet.signers.length >= 5 || isAddingSigner} value={signer} onChange={e => setSigner(e.target.value)} />
          </div>
        </>
      )}
    </>
  );
}

export default CreateWallet;
