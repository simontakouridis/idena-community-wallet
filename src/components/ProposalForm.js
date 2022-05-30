import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { isValidAddress } from 'ethereumjs-util';
import { actionNames } from '../core/constants';
import loadingSvg from './../assets/loading.svg';
import './ProposalForm.css';

function ProposalForm({ proposal }) {
  const dispatch = useDispatch();
  const user = useSelector(state => state.general.user);
  const currentWallet = useSelector(state => state.general.data.wallets?.[0]);
  const isCreatingEditingProposal = useSelector(state => state.general.loaders.creatingEditingProposal);
  const isDeletingProposal = useSelector(state => state.general.loaders.deletingProposal);

  const [isCurrentDelegate, setIsCurrentDelegate] = useState(false);
  const [newEditedProposal, setNewEditedProposal] = useState({
    title: '',
    description: '',
    oracle: '',
    acceptanceStatus: '',
    fundingStatus: '',
    transaction: ''
  });

  useEffect(() => {
    if (!proposal) {
      return;
    }
    setNewEditedProposal({ ...newEditedProposal, ...proposal });
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

    if (newEditedProposal.transaction && !/^\d{24}$/.test(newEditedProposal.transaction)) {
      alert('Transaction Id must be 24 digits!');
      return;
    }

    dispatch({ type: proposal ? actionNames.editProposal : actionNames.createProposal, payload: { newEditedProposal } });
  };

  const deleteProposal = () => {
    dispatch({ type: actionNames.deleteProposal, payload: { proposalId: newEditedProposal.id } });
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
        <span>Transaction Id:</span>
        <input
          disabled={!proposal}
          value={newEditedProposal.transaction}
          onChange={e => setNewEditedProposal({ ...newEditedProposal, transaction: e.target.value })}
          placeholder="Transaction Id"
        />
      </div>
      <button onClick={() => createEditProposal()} disabled={!isCurrentDelegate}>
        {isCreatingEditingProposal ? (proposal ? 'Editing Proposal...' : 'Creating Proposal...') : proposal ? 'Edit Proposal' : 'Create New Proposal'}
        {isCreatingEditingProposal && <img className="loadingImg" src={loadingSvg} />}
      </button>
      {proposal && (
        <button onClick={() => deleteProposal()} disabled={!isCurrentDelegate}>
          {isDeletingProposal ? 'Deleting Proposal' : 'Delete Proposal'}
          {isDeletingProposal && <img className="loadingImg" src={loadingSvg} />}
        </button>
      )}
    </div>
  );
}

export default ProposalForm;
