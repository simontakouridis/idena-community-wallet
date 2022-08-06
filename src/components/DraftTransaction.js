import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { actionNames } from '../core/constants';
import { truncateAddress } from './../core/utilities';
import loadingSvg from './../assets/loading.svg';
import './DraftTransaction.css';

function DraftTransaction({ user, wallet, isWalletSigner, draftTransaction }) {
  const dispatch = useDispatch();
  const isSigningTransaction = useSelector(state => state.general.loaders.signingTransaction);
  const isDeletingTransaction = useSelector(state => state.general.loaders.deletingTransaction);
  const isExecutingTransaction = useSelector(state => state.general.loaders.executingTransaction);
  const isManuallyExecutingTransaction = useSelector(state => state.general.loaders.manuallyExecutingTransaction);

  const [standardDisabled, setStandardDisabled] = useState(true);
  const [txHash, setTxHash] = useState('');

  useEffect(() => {
    if (!isSigningTransaction && !isExecutingTransaction) {
      return;
    }
    toast('DO NOT CLOSE OR RELOAD BROWSER!');
  }, [isSigningTransaction, isExecutingTransaction]);

  useEffect(() => {
    setStandardDisabled(!isWalletSigner || isSigningTransaction || isDeletingTransaction || isExecutingTransaction || isManuallyExecutingTransaction);
  }, [isWalletSigner, isSigningTransaction, isDeletingTransaction, isExecutingTransaction, isManuallyExecutingTransaction]);

  const signDraftTransaction = () => {
    if (window.confirm('Are you sure you want to sign and approve this draft transaction?')) {
      dispatch({ type: actionNames.signDraftTransaction, payload: { user, wallet, draftTransaction } });
    }
  };

  const deleteDraftTransaction = () => {
    if (window.confirm('Are you sure you want to delete this draft transaction?')) {
      dispatch({ type: actionNames.deleteDraftTransaction, payload: { draftTransaction } });
    }
  };

  const executeDraftTransaction = () => {
    if (window.confirm('Are you sure you want to execute on this transaction? It will irreversibly send the funds!')) {
      dispatch({ type: actionNames.executeDraftTransaction, payload: { user, wallet, draftTransaction } });
    }
  };

  const manuallyExecuteDraftTransaction = () => {
    if (!txHash || !txHash.match(/^0x([A-Fa-f0-9]{64})$/)) {
      alert('Not a valid Push Tx Hash!');
      return;
    }
    if (window.confirm('Are you sure you want to manually execute on this transaction?')) {
      dispatch({ type: actionNames.manuallyExecuteDraftTransaction, payload: { tx: txHash, user, wallet, draftTransaction } });
    }
  };

  return (
    <div className="DraftTransaction">
      <div>
        <b>Draft Transaction</b>
      </div>
      <div>
        <b>Title:</b> {draftTransaction.title}
      </div>
      <div>
        <b>Category:</b> {draftTransaction.category}
      </div>
      {draftTransaction.category === 'fundProposal' && (
        <div>
          <b>Proposal Id:</b> {draftTransaction.proposal}
        </div>
      )}
      {draftTransaction.category === 'other' && (
        <div>
          <b>Other Description:</b> {draftTransaction.otherDescription}
        </div>
      )}
      <div>
        <b>Recipient:</b> {draftTransaction.recipient}
      </div>
      <div>
        <b>Amount:</b> {draftTransaction.amount} iDNA
      </div>
      <div>
        <b>Signers:</b>{' '}
        {draftTransaction?.sends?.length ? (
          draftTransaction.sends.map((signer, index, arr) => (
            <Link key={signer} to={`/delegates/${signer}`}>
              <span>
                {truncateAddress(signer)} {index !== arr.length - 1 && ', '}
              </span>
            </Link>
          ))
        ) : (
          <i>no signers</i>
        )}
      </div>
      <div>
        <button onClick={() => signDraftTransaction()} disabled={draftTransaction?.sends?.includes(user?.address) || standardDisabled}>
          {isSigningTransaction ? 'Signing Transaction...' : 'Sign Transaction'}
          {isSigningTransaction && <img className="loadingImg" src={loadingSvg} />}
        </button>
      </div>
      <div>
        <button onClick={() => deleteDraftTransaction()} disabled={standardDisabled}>
          {isDeletingTransaction ? 'Deleting Transaction...' : 'Delete Transaction'}
          {isDeletingTransaction && <img className="loadingImg" src={loadingSvg} />}
        </button>
        <button disabled={draftTransaction?.sends?.length < 3 || standardDisabled} onClick={() => executeDraftTransaction()}>
          {isExecutingTransaction ? 'Executing Transaction...' : 'Execute Transaction'}
          {isExecutingTransaction && <img className="loadingImg" src={loadingSvg} />}
        </button>
      </div>
      <div>
        <button disabled={draftTransaction?.sends?.length < 3 || standardDisabled} onClick={() => manuallyExecuteDraftTransaction()}>
          {isManuallyExecutingTransaction ? 'Manually Executing...' : 'Manually Execute'}
          {isManuallyExecutingTransaction && <img className="loadingImg" src={loadingSvg} />}
        </button>
        <input
          disabled={draftTransaction?.sends?.length < 3 || standardDisabled}
          value={txHash}
          onChange={e => setTxHash(e.target.value)}
          placeholder="Push Tx Hash"
        />
      </div>
    </div>
  );
}

export default DraftTransaction;
