import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { actionNames } from '../core/constants';
import { truncateAddress } from '../core/utilities';
import './Transactions.css';

function Transactions() {
  const dispatch = useDispatch();
  const location = useLocation();
  const walletId = location.pathname.split('/transactions')?.[0].split('/')?.pop();
  const walletTransactionsObj = useSelector(state => state.general.walletTransactions);
  const wallets = useSelector(state => state.general.data.wallets);
  const user = useSelector(state => state.general.user);

  const [walletTransactions, setWalletTransactions] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [isWalletSigner, setIsWalletSigner] = useState(false);

  useEffect(() => {
    dispatch({ type: actionNames.getWalletTransactions, payload: { walletId } });
  }, []);

  useEffect(() => {
    if (!walletTransactionsObj[walletId]?.length) {
      return;
    }
    setWalletTransactions(walletTransactionsObj[walletId]);
  }, [walletTransactionsObj]);

  useEffect(() => {
    if (!wallets) {
      return;
    }
    setWallet(wallets.find(wallet => wallet.id === walletId));
  }, [wallets]);

  useEffect(() => {
    if (!wallet || !user) {
      return;
    }
    setIsWalletSigner(wallet.signers.includes(user.address));
  }, [wallet, user]);

  return (
    <div className="Transactions">
      <h2>Transactions</h2>
      <div>
        {isWalletSigner && (
          <div>
            <Link to={`/wallet/${walletId}/create-transaction`}>Create/Sign Transaction</Link>
          </div>
        )}
      </div>
      {walletTransactions.length &&
        walletTransactions.map(transaction => (
          <div key={transaction.id}>
            <div>
              <b>Id:</b> {transaction.id}
            </div>
            <div>
              <b>Title:</b> {transaction.title}
            </div>
            <div>
              <b>Category:</b> {transaction.category}
            </div>
            {transaction.category === 'fundProposal' && (
              <div>
                <b>Proposal Id:</b> {transaction.proposal}
              </div>
            )}
            {transaction.category === 'other' && (
              <div>
                <b>Other Reason:</b> {transaction.categoryOtherDescription}
              </div>
            )}
            <div style={{ wordBreak: 'break-all' }}>
              <b>Recipient:</b>{' '}
              <a href={`https://scan.idena.io/address/${transaction.recipient}`} target="_blank" rel="noreferrer">
                {transaction.recipient}
              </a>
            </div>
            <div>
              <b>Amount:</b> {transaction.amount} iDNA
            </div>
            <div>
              <b>Signers:</b>{' '}
              {transaction.sends.map((signer, index, arr) => (
                <Link key={signer} to={`/delegates/${signer}`}>
                  <span>
                    {truncateAddress(signer)}
                    {index !== arr.length - 1 && ', '}
                  </span>
                </Link>
              ))}
            </div>
            <div>
              <b>Executer:</b>{' '}
              <Link to={`/delegates/${transaction.push}`}>
                <span>{truncateAddress(transaction.push)}</span>
              </Link>
            </div>
            <div style={{ wordBreak: 'break-all' }}>
              <b>Tx Hash:</b>{' '}
              <a href={`https://scan.idena.io/transaction/${transaction.tx}`} target="_blank" rel="noreferrer">
                {transaction.tx}
              </a>
            </div>
          </div>
        ))}
    </div>
  );
}

export default Transactions;
