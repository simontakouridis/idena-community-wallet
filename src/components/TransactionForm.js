import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { isValidAddress } from 'ethereumjs-util';
import { actionNames } from '../core/constants';
import loadingSvg from './../assets/loading.svg';
import './TransactionForm.css';

const clearTransaction = {
  title: '',
  category: '',
  otherDescription: '',
  proposal: '',
  recipient: '',
  amount: 0
};

function TransactionForm({ isWalletSigner, wallet }) {
  const dispatch = useDispatch();
  const isCreatingTransaction = useSelector(state => state.general.loaders.creatingTransaction);
  const isDeletingTransaction = useSelector(state => state.general.loaders.deletingTransaction);

  const [newTransaction, setNewTransaction] = useState(clearTransaction);

  useEffect(() => {
    if (!isCreatingTransaction) {
      return;
    }
    toast('DO NOT CLOSE OR RELOAD BROWSER!');
  }, [isCreatingTransaction]);

  const createDraftTransaction = () => {
    if (!newTransaction.title) {
      alert('Transaction title required!');
      return;
    }

    if (!newTransaction.category) {
      alert('Transaction category required!');
      return;
    }

    if (newTransaction.category === 'fundProposal' && !/^[a-z0-9]{24}$/.test(newTransaction.proposal)) {
      alert('Associated Proposal Id must be of 24 digits!');
      return;
    }

    if (newTransaction.category === 'other' && !newTransaction.otherDescription) {
      alert('Other category description required!');
      return;
    }

    if (!newTransaction.recipient || !isValidAddress(newTransaction.recipient)) {
      alert('Recipient address not valid!');
      return;
    }

    if (Number(newTransaction.amount) <= 0 || !Number.isInteger(Number(newTransaction.amount))) {
      alert('Whole number greater than 0 is required!');
      return;
    }

    dispatch({ type: actionNames.createDraftTransaction, payload: { wallet, newTransaction } });
  };

  const resetDraftTransaction = () => {
    setNewTransaction(clearTransaction);
  };

  return (
    <div className="TransactionForm">
      <div>
        <span>Title*:</span>
        <input value={newTransaction.title} onChange={e => setNewTransaction({ ...newTransaction, title: e.target.value })} placeholder="Transaction Title" />
      </div>
      <div>
        <span>Transaction Category*:</span>
        <select value={newTransaction.category} onChange={e => setNewTransaction({ ...newTransaction, category: e.target.value })}>
          <option value="">Select...</option>
          <option value="payForOracle">Pay For Oracle</option>
          <option value="fundProposal">Fund Proposal</option>
          <option value="setupNewWallet">Setup New Wallet</option>
          <option value="transferFundsToNewWallet">Transfer Funds To New Wallet</option>
          <option value="other">Other</option>
        </select>
      </div>
      {newTransaction.category === 'fundProposal' && (
        <div>
          <span>Proposal*:</span>
          <input value={newTransaction.proposal} onChange={e => setNewTransaction({ ...newTransaction, proposal: e.target.value })} placeholder="Proposal Id" />
        </div>
      )}
      {newTransaction.category === 'other' && (
        <div>
          <span>Other Description*:</span>
          <input
            value={newTransaction.otherDescription}
            onChange={e => setNewTransaction({ ...newTransaction, otherDescription: e.target.value })}
            placeholder="Other Description"
          />
        </div>
      )}
      <div>
        <span>Recipient*:</span>
        <input
          value={newTransaction.recipient}
          onChange={e => setNewTransaction({ ...newTransaction, recipient: e.target.value })}
          placeholder="Recipient Address"
        />
      </div>
      <div>
        <span>Amount (iDNA)*:</span>
        <input
          type="number"
          value={newTransaction.amount}
          onChange={e => setNewTransaction({ ...newTransaction, amount: e.target.value })}
          placeholder="Amount in iDNA"
        />
      </div>
      <button onClick={() => createDraftTransaction()} disabled={!isWalletSigner || isCreatingTransaction || isDeletingTransaction}>
        {isCreatingTransaction ? 'Creating Transaction...' : 'Create New Transaction'}
        {isCreatingTransaction && <img className="loadingImg" src={loadingSvg} />}
      </button>
      <button onClick={() => resetDraftTransaction()} disabled={!isWalletSigner || isCreatingTransaction || isDeletingTransaction}>
        Reset
      </button>
    </div>
  );
}

export default TransactionForm;
