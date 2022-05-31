import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { actionNames } from './../core/constants';

function CreateTransaction() {
  const dispatch = useDispatch();
  const location = useLocation();
  const walletId = location.pathname.split('/create-transaction')?.[0].split('/')?.pop();
  const walletTransactionsObj = useSelector(state => state.general.walletTransactions);
  const [draftTransaction, setDraftTransaction] = useState(undefined);

  useEffect(() => {
    dispatch({ type: actionNames.getWalletTransactions, payload: { walletId } });
  }, []);

  useEffect(() => {
    if (!walletTransactionsObj[walletId]?.length) {
      return;
    }
    setDraftTransaction(walletTransactionsObj[walletId].find(transaction => !transaction.push));
  }, [walletTransactionsObj]);

  return (
    <div className={'CreateTransaction'}>
      <h2>Create Transaction</h2>
      {draftTransaction}
    </div>
  );
}

export default CreateTransaction;
