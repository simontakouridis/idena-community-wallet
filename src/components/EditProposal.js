import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import ProposalForm from './ProposalForm';
import './EditProposal.css';

function EditProposal() {
  const location = useLocation();
  const proposalId = location.pathname.split('/edit')?.[0].split('/')?.pop();
  const proposals = useSelector(state => state.general.data.proposals);

  const [proposal, setProposal] = useState(null);

  useEffect(() => {
    if (!proposals?.length) {
      return;
    }
    const proposal = proposals.find(proposal => proposal.id === proposalId);
    setProposal(proposal);
  }, [proposals]);

  return (
    <div className="EditProposal">
      <h2>Edit Proposal</h2>
      <ProposalForm proposal={proposal} />
    </div>
  );
}

export default EditProposal;
