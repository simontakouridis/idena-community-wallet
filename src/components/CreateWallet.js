import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { actionNames } from './../core/constants';
import { isValidAddress } from 'ethereumjs-util';
import { truncateAddress } from './../core/utilities';
import { doNotCloseReloadBrowser } from './commonComponents';
import loadingSvg from './../assets/loading.svg';
import './CreateWallet.css';

function CreateWallet() {
  const dispatch = useDispatch();
  const location = useLocation();
  const user = useSelector(state => state.general.user);
  const draftWallet = useSelector(state => state.general.draftWallet);
  const currentWallet = useSelector(state => state.general.data.wallets?.[0]);
  const users = useSelector(state => state.general.data.users);

  const isCreatingWallet = useSelector(state => state.general.loaders.creatingWallet);
  const isDeletingWallet = useSelector(state => state.general.loaders.deletingWallet);
  const isAddingSigner = useSelector(state => state.general.loaders.addingSigner);
  const isActivatingWallet = useSelector(state => state.general.loaders.activatingWallet);

  const [signer, setSigner] = useState('');
  const [isCurrentDelegate, setIsCurrentDelegate] = useState(false);

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

  useEffect(() => {
    if (!currentWallet || !user) {
      return;
    }
    setIsCurrentDelegate(currentWallet.signers.includes(user.address));
  }, [currentWallet, user]);

  const canCreateMultisig = () => {
    return (!currentWallet && users?.length === 1) || isCurrentDelegate;
  };

  const createMultisigWallet = async () => {
    dispatch({ type: actionNames.createMultisigWallet, payload: { user } });
  };

  const deleteDraftWallet = async () => {
    if (window.confirm('Are you sure you want to delete this draft wallet? This action process will also terminate the multisig contract!')) {
      dispatch({ type: actionNames.deleteDraftWallet, payload: { draftWallet, user } });
    }
  };

  const activateDraftWallet = async () => {
    if (window.confirm('Are you sure you want to activate this draft wallet? It will create also create a new round!')) {
      dispatch({ type: actionNames.activateDraftWallet, payload: { draftWallet } });
    }
  };

  const addSignerToDraftWallet = async () => {
    if (!isValidAddress(signer)) {
      alert('Not a valid address!');
      return;
    }
    dispatch({ type: actionNames.addSignerToDraftWallet, payload: { signer, user, draftWallet } });
  };

  return (
    <div className="CreateWallet">
      <h2>Create Wallet</h2>
      <button onClick={() => createMultisigWallet()} disabled={isCreatingWallet || draftWallet || !canCreateMultisig()}>
        {isCreatingWallet ? 'Creating Wallet...' : 'Create New Multisig Wallet'}
        {isCreatingWallet && <img className="loadingImg" src={loadingSvg} />}
      </button>
      {isCreatingWallet && doNotCloseReloadBrowser}
      {draftWallet && (
        <div className="draftWalletContainer">
          <div>
            <div>
              <b>Draft wallet details</b>
            </div>
            <div>
              <b>Address:</b> {draftWallet.address}
            </div>
            <div>
              <b>Author:</b> {draftWallet.author}
            </div>
            <div>
              <b>Signers:</b>{' '}
              {draftWallet.signers[0] ? (
                draftWallet.signers.map((signer, index, arr) => (
                  <Link key={signer} to={`/delegates/${signer}`}>
                    <span>
                      {truncateAddress(signer)} {index !== arr.length - 1 && ', '}
                    </span>
                  </Link>
                ))
              ) : (
                <i>no signers added</i>
              )}
            </div>
          </div>
          <div>
            <button
              disabled={draftWallet.signers.length >= 5 || isAddingSigner || isDeletingWallet || isActivatingWallet}
              onClick={() => addSignerToDraftWallet()}
            >
              {isAddingSigner ? 'Adding Signer...' : 'Add Signer'}
              {isAddingSigner && <img className="loadingImg" src={loadingSvg} />}
            </button>
            <input
              disabled={draftWallet.signers.length >= 5 || isAddingSigner || isDeletingWallet || isActivatingWallet}
              value={signer}
              onChange={e => setSigner(e.target.value)}
              placeholder="New Signer Address"
            />
            {isAddingSigner && doNotCloseReloadBrowser}
          </div>
          <div>
            <button onClick={() => deleteDraftWallet()} disabled={isAddingSigner || isDeletingWallet || isActivatingWallet}>
              {isDeletingWallet ? 'Deleting Wallet...' : 'Delete Draft Wallet'}
              {isDeletingWallet && <img className="loadingImg" src={loadingSvg} />}
            </button>
            <button disabled={draftWallet.signers.length < 5 || isAddingSigner || isDeletingWallet || isActivatingWallet} onClick={() => activateDraftWallet()}>
              {isActivatingWallet ? 'Activating Wallet...' : 'Activate Draft Wallet'}
              {isActivatingWallet && <img className="loadingImg" src={loadingSvg} />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateWallet;
