import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function Proposals() {
  const user = useSelector(state => state.general.user);
  const currentWallet = useSelector(state => state.general.data.wallets?.[0]);
  const wallets = useSelector(state => state.general.data.wallets);
  const proposals = useSelector(state => state.general.data.proposals);

  const [isCurrentDelegate, setIsCurrentDelegate] = useState(false);
  const [proposalsGrouped, setProposalsGrouped] = useState([]);

  useEffect(() => {
    if (!currentWallet || !user) {
      return;
    }
    setIsCurrentDelegate(currentWallet.signers.includes(user.address));
  }, [currentWallet, user]);

  useEffect(() => {
    if (!proposals?.length || !wallets?.length) {
      return;
    }

    const proposalsGrouped = {};
    for (let i = 0; i < wallets.length; i++) {
      const walletId = wallets[i].id;
      proposalsGrouped[walletId] = proposals?.filter(proposal => proposal.wallet === walletId);
    }
    setProposalsGrouped(proposalsGrouped);
  }, [proposals, wallets]);

  return (
    <div>
      <h2>Proposals</h2>
      {isCurrentDelegate && (
        <>
          <Link to="/create-proposal">CREATE PROPOSAL</Link>
        </>
      )}
      {wallets?.map(wallet => (
        <div key={wallet.round}>
          <h3>Round {wallet.round}</h3>
          {proposalsGrouped[wallet.id] ? (
            proposalsGrouped[wallet.id].map(proposal => (
              <div key={proposal.id} style={{ marginBottom: 15 }}>
                <div>
                  <b>{proposal.title}</b>
                </div>
                <div>{proposal.description}</div>
                <div>
                  <b>Associated Oracle:</b> {proposal.oracle}
                </div>
                <div>
                  <b>Acceptance Status:</b> {proposal.acceptanceStatus}
                </div>
                <div>
                  <b>Funding Status:</b> {proposal.fundingStatus}
                </div>
                {!!proposal.transactions.length && (
                  <div>
                    <b>Transactions:</b> {proposal.transactions.join(', ')}
                  </div>
                )}
                {isCurrentDelegate && (
                  <div>
                    <Link to={`/proposals/${proposal.id}/edit`}>EDIT PROPOSAL</Link>
                  </div>
                )}
              </div>
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
