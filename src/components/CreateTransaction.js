import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { actionNames } from './../core/constants';
import DraftTransaction from './DraftTransaction';
import TransactionForm from './TransactionForm';

function CreateTransaction() {
  const dispatch = useDispatch();
  const location = useLocation();
  const walletId = location.pathname.split('/create-transaction')?.[0].split('/')?.pop();
  const walletDraftTransactionsObj = useSelector(state => state.general.walletDraftTransactions);
  const wallets = useSelector(state => state.general.data.wallets);
  const user = useSelector(state => state.general.user);

  const [wallet, setWallet] = useState(undefined);
  const [isWalletSigner, setIsWalletSigner] = useState(false);
  const [draftTransaction, setDraftTransaction] = useState(undefined);

  useEffect(() => {
    dispatch({ type: actionNames.getWalletDraftTransactions, payload: { walletId } });
  }, []);

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

  useEffect(() => {
    if (!walletDraftTransactionsObj[walletId]) {
      return;
    }
    setDraftTransaction(walletDraftTransactionsObj[walletId]);
  }, [walletDraftTransactionsObj]);

  useEffect(() => {
    if (!wallet || !user || !draftTransaction) {
      return;
    }
    if (location.pathname.endsWith('/create-transaction/signing')) {
      const urlParams = new URLSearchParams(window.location.search);
      const tx = urlParams.get('tx');
      if (tx) {
        dispatch({ type: actionNames.signingDraftTransaction, payload: { tx, user, wallet, draftTransaction } });
      }
    }
    if (location.pathname.endsWith('/create-transaction/executing')) {
      const urlParams = new URLSearchParams(window.location.search);
      const tx = urlParams.get('tx');
      if (tx) {
        dispatch({ type: actionNames.executingDraftTransaction, payload: { tx, user, wallet, draftTransaction } });
      }
    }
  }, [wallet, user, draftTransaction]);

  return (
    <div className="CreateTransaction">
      <h2>Create Transaction</h2>
      {draftTransaction ? (
        <DraftTransaction user={user} wallet={wallet} isWalletSigner={isWalletSigner} draftTransaction={draftTransaction} />
      ) : (
        <TransactionForm wallet={wallet} isWalletSigner={isWalletSigner} />
      )}
    </div>
  );
}

export default CreateTransaction;
