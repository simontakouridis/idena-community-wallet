import { useDispatch, useSelector } from 'react-redux';
import { actionNames } from '../core/constants';
import loadingSvg from './../assets/loading.svg';

function DraftTransaction({ user, wallet, isWalletSigner, draftTransaction }) {
  const dispatch = useDispatch();
  const isSigningTransaction = useSelector(state => state.general.loaders.signingTransaction);
  const isDeletingTransaction = useSelector(state => state.general.loaders.deletingTransaction);
  const isExecutingTransaction = useSelector(state => state.general.loaders.executingTransaction);

  const signDraftTransaction = async () => {
    if (window.confirm('Are you sure you want to sign and approve this draft transaction?')) {
      dispatch({ type: actionNames.signDraftTransaction, payload: { user, wallet, draftTransaction } });
    }
  };

  const deleteDraftTransaction = async () => {
    if (window.confirm('Are you sure you want to delete this draft transaction?')) {
      dispatch({ type: actionNames.deleteDraftTransaction, payload: { draftTransaction } });
    }
  };

  const executeDraftTransaction = async () => {
    if (window.confirm('Are you sure you want to execute on this transaction? It will irreversibly send the funds!')) {
      dispatch({ type: actionNames.executeTransactionn, payload: { draftTransaction } });
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
        <b>Signers:</b> {draftTransaction?.sends?.length ? draftTransaction.sends.join(', ') : <i>no signers</i>}
      </div>
      <div>
        <button
          onClick={() => signDraftTransaction()}
          disabled={
            draftTransaction?.sends?.includes(user.address) || !isWalletSigner || isSigningTransaction || isDeletingTransaction || isExecutingTransaction
          }
        >
          {isSigningTransaction ? 'Signing Transaction...' : 'Sign Transaction'}
          {isSigningTransaction && <img className="loadingImg" src={loadingSvg} />}
        </button>
      </div>
      <div>
        <button onClick={() => deleteDraftTransaction()} disabled={!isWalletSigner || isSigningTransaction || isDeletingTransaction || isExecutingTransaction}>
          {isDeletingTransaction ? 'Deleting Transaction...' : 'Delete Transaction'}
          {isDeletingTransaction && <img className="loadingImg" src={loadingSvg} />}
        </button>
        <button
          disabled={draftTransaction?.sends?.length < 3 || !isWalletSigner || isSigningTransaction || isDeletingTransaction || isExecutingTransaction}
          onClick={() => executeDraftTransaction()}
        >
          {isExecutingTransaction ? 'Executing Transaction...' : 'Execute Transaction'}
          {isExecutingTransaction && <img className="loadingImg" src={loadingSvg} />}
        </button>
      </div>
    </div>
  );
}

export default DraftTransaction;
