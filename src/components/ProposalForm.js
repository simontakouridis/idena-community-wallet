import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isValidAddress } from 'ethereumjs-util';
import { actionNames } from '../core/constants';
import { arrayDuplicates } from '../core/utilities';
import loadingSvg from './../assets/loading.svg';
import './ProposalForm.css';

const newProposal = {
  title: '',
  description: '',
  oracle: '',
  acceptanceStatus: '',
  fundingStatus: '',
  transactions: []
};

function ProposalForm({ proposal }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.general.user);
  const currentWallet = useSelector(state => state.general.data.wallets?.[0]);
  const isCreatingEditingProposal = useSelector(state => state.general.loaders.creatingEditingProposal);
  const isDeletingProposal = useSelector(state => state.general.loaders.deletingProposal);

  const [isCurrentDelegate, setIsCurrentDelegate] = useState(false);
  const [newEditedProposal, setNewEditedProposal] = useState(newProposal);

  useEffect(() => {
    if (!proposal) {
      return;
    }
    setNewEditedProposal({ ...newProposal, ...proposal });
  }, [proposal]);

  useEffect(() => {
    if (!currentWallet || !user) {
      return;
    }
    setIsCurrentDelegate(currentWallet.signers.includes(user.address));
  }, [currentWallet, user]);

  const createEditProposal = () => {
    if (!newEditedProposal.title) {
      alert('Proposal title required!');
      return;
    }

    if (newEditedProposal.oracle && !isValidAddress(newEditedProposal.oracle)) {
      alert('Oracle address not valid!');
      return;
    }

    if (newEditedProposal.transactions.some(transaction => !/^[a-z0-9]{24}$/.test(transaction))) {
      alert('Transaction Ids must be of 24 digits!');
      return;
    }

    if (newEditedProposal.transactions.length && arrayDuplicates(newEditedProposal.transactions)) {
      alert('Transaction Ids cannot be duplicated!');
      return;
    }

    dispatch({ type: proposal ? actionNames.editProposal : actionNames.createProposal, payload: { newEditedProposal } });
  };

  const deleteProposal = () => {
    if (window.confirm('Are you sure you want to delete this proposal?')) {
      dispatch({ type: actionNames.deleteProposal, payload: { proposalId: newEditedProposal.id } });
    }
  };

  const resetProposal = () => {
    setNewEditedProposal(proposal ? { ...newProposal, ...proposal } : newProposal);
  };

  return (
    <div className="ProposalForm">
      {proposal && (
        <div>
          <i>Proposal Id: {proposal.id}</i>
        </div>
      )}
      <div>
        <span>Title*:</span>
        <input
          value={newEditedProposal.title}
          onChange={e => setNewEditedProposal({ ...newEditedProposal, title: e.target.value })}
          placeholder="Proposal Title"
        />
      </div>
      <div>
        <span>Description:</span>
        <input
          value={newEditedProposal.description}
          onChange={e => setNewEditedProposal({ ...newEditedProposal, description: e.target.value })}
          placeholder="Proposal Description"
        />
      </div>
      <div>
        <span>Oracle:</span>
        <input
          value={newEditedProposal.oracle}
          onChange={e => setNewEditedProposal({ ...newEditedProposal, oracle: e.target.value })}
          placeholder="Oracle Address"
        />
      </div>
      <div>
        <span>Acceptance Status:</span>
        <select
          disabled={!proposal}
          value={newEditedProposal.acceptanceStatus}
          onChange={e => setNewEditedProposal({ ...newEditedProposal, acceptanceStatus: e.target.value })}
        >
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div>
        <span>Funding Status:</span>
        <select
          disabled={!proposal}
          value={newEditedProposal.fundingStatus}
          onChange={e => setNewEditedProposal({ ...newEditedProposal, fundingStatus: e.target.value })}
        >
          <option value="pending">Pending</option>
          <option value="funded">Funded</option>
          <option value="unfunded">Unfunded</option>
        </select>
      </div>
      <div>
        <div>Associated Transactions:</div>
        {newEditedProposal.transactions.map((transaction, i) => (
          <div key={i}>
            <input
              disabled={!proposal}
              value={transaction}
              onChange={e =>
                setNewEditedProposal({ ...newEditedProposal, transactions: newEditedProposal.transactions.map((tx, j) => (j === i ? e.target.value : tx)) })
              }
              placeholder="Transaction Id"
            />
            <button onClick={() => setNewEditedProposal({ ...newEditedProposal, transactions: newEditedProposal.transactions.filter((tx, j) => j !== i) })}>
              Remove
            </button>
          </div>
        ))}
        <button disabled={!proposal} onClick={() => setNewEditedProposal({ ...newEditedProposal, transactions: [...newEditedProposal.transactions, ''] })}>
          Add Transaction
        </button>
      </div>
      <button onClick={() => createEditProposal()} disabled={!isCurrentDelegate || isCreatingEditingProposal || isDeletingProposal}>
        {isCreatingEditingProposal ? (proposal ? 'Editing Proposal...' : 'Creating Proposal...') : proposal ? 'Edit Proposal' : 'Create New Proposal'}
        {isCreatingEditingProposal && <img className="loadingImg" src={loadingSvg} />}
      </button>
      {proposal && (
        <button onClick={() => deleteProposal()} disabled={!isCurrentDelegate || isCreatingEditingProposal || isDeletingProposal}>
          {isDeletingProposal ? 'Deleting Proposal' : 'Delete Proposal'}
          {isDeletingProposal && <img className="loadingImg" src={loadingSvg} />}
        </button>
      )}
      <button onClick={() => resetProposal()} disabled={!isCurrentDelegate || isCreatingEditingProposal || isDeletingProposal}>
        Reset
      </button>
    </div>
  );
}

export default ProposalForm;
