import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { actionNames } from '../core/constants';

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
    <div className={'Transactions'}>
      <h2>Transactions</h2>
      <div>
        <b>Transactions:</b>
        {isWalletSigner && (
          <div>
            <Link to={`/wallet/${walletId}/create-transaction`}>Create Transaction</Link>
          </div>
        )}
      </div>
      {JSON.stringify(walletTransactions)}
    </div>
  );
}

export default Transactions;
