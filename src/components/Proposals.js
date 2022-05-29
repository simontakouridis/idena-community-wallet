import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function Proposals() {
  const user = useSelector(state => state.general.user);
  const wallets = useSelector(state => state.general.data.wallets);
  const proposals = useSelector(state => state.general.data.proposals);

  const [proposalsGrouped, setProposalsGrouped] = useState([]);

  useEffect(() => {
    if (!proposals?.length || !wallets?.length) {
      return;
    }

    const proposalsGrouped = {};
    for (let i = 0; i < wallets.length; i++) {
      const walletAddress = wallets[i].address;
      proposalsGrouped[walletAddress] = proposals?.filter(proposal => proposal.wallet === walletAddress);
    }
    setProposalsGrouped(proposalsGrouped);
  }, [proposals, wallets]);

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  // *               title: 'Title of Proposal'
  // *               description: 'Description of Proposal'
  // *               oracle: '0xebb1bc133f0db6869c8ba67d0ce94ea86be83bc1'
  // *               wallet: 62807ce6e069cd00272fa3af
  // *               accepted: pending
  // *               status: pending
  // *               transaction: 62807d2ce069cd00272fa3c0

  return (
    <div>
      <h2>Proposals</h2>
      {isAdmin() && (
        <>
          <Link to="/create-proposal">CREATE PROPOSAL</Link>
        </>
      )}
      {wallets?.map(wallet => (
        <div key={wallet.round}>
          <h3>Round {wallet.round}</h3>
          {proposalsGrouped[wallet.address] ? (
            proposalsGrouped[wallet.address].map(proposal => (
              <>
                <div>{JSON.stringify(proposal)}</div>
              </>
            ))
          ) : (
            <div>
              <i>No proposals</i>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default Proposals;
