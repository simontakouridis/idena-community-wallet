import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actionNames } from '../core/constants';
import loadingSvg from './../assets/loading.svg';
import './CreateProposal.css';

function CreateProposal() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.general.user);
  const currentWallet = useSelector(state => state.general.data.wallets?.[0]);

  const isCreatingProposal = useSelector(state => state.general.loaders.creatingProposal);

  const [isCurrentDelegate, setIsCurrentDelegate] = useState(false);
  const [newProposal, setNewProposal] = useState({
    title: '',
    description: '',
    oracle: '',
    accepted: '',
    status: '',
    transaction: ''
  });

  useEffect(() => {
    if (!currentWallet || !user) {
      return;
    }
    setIsCurrentDelegate(currentWallet.signers.includes(user.address));
  }, [currentWallet, user]);

  const createProposal = () => {
    dispatch({ type: actionNames.createProposal, payload: { newProposal } });
  };

  return (
    <div className="CreateProposal">
      <h2>Create Proposal</h2>
      <div>
        <span>Title:</span>
        <input value={newProposal.title} onChange={e => setNewProposal({ ...newProposal, title: e.target.value })} placeholder="Proposal Title" />
      </div>
      <div>
        <span>Description:</span>
        <input
          value={newProposal.description}
          onChange={e => setNewProposal({ ...newProposal, description: e.target.value })}
          placeholder="Proposal Description"
        />
      </div>
      <div>
        <span>Oracle:</span>
        <input value={newProposal.oracle} onChange={e => setNewProposal({ ...newProposal, oracle: e.target.value })} placeholder="Oracle Address" />
      </div>

      <div>
        <span>Accepted:</span>
        <input value={newProposal.accepted} onChange={e => setNewProposal({ ...newProposal, accepted: e.target.value })} placeholder="Proposal Accepted" />
      </div>
      <div>
        <span>Status:</span>
        <input value={newProposal.status} onChange={e => setNewProposal({ ...newProposal, status: e.target.value })} placeholder="Proposal Status" />
      </div>
      <div>
        <span>Transaction:</span>
        <input
          value={newProposal.transaction}
          onChange={e => setNewProposal({ ...newProposal, transaction: e.target.value })}
          placeholder="Proposal Transaction"
        />
      </div>
      <button onClick={() => createProposal()} disabled={!isCurrentDelegate}>
        {isCreatingProposal ? 'Creating Proposal...' : 'Create New Proposal'}
        {isCreatingProposal && <img className="loadingImg" src={loadingSvg} />}
      </button>
    </div>
  );
}

export default CreateProposal;
