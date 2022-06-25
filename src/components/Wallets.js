import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { actionNames } from './../core/constants';
import { truncateAddress } from './../core/utilities';

function Wallets() {
  const dispatch = useDispatch();
  const user = useSelector(state => state.general.user);
  const wallets = useSelector(state => state.general.data.wallets);
  const addressDetails = useSelector(state => state.general.addressDetails);

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  const getContractDetails = address => {
    dispatch({ type: actionNames.getAddressDetails, payload: { address } });
  };

  const terminateMultisigWallet = wallet => {
    if (window.confirm('Are you sure you want to terminate this multisig contract? Termination will fail if the multisig has funds.')) {
      dispatch({ type: actionNames.terminateMultisigWallet, payload: { wallet, user } });
    }
  };

  return (
    <>
      <h2>Wallets</h2>
      {isAdmin() && (
        <>
          <Link to="/create-wallet">CREATE WALLET / ADD SIGNERS</Link>
        </>
      )}
      {wallets?.map((wallet, i) => (
        <div key={wallet.round}>
          <h3>Round {wallet.round}</h3>
          <div>
            <b>Address:</b> {wallet.address}
          </div>
          <div>
            <b>Author:</b> {wallet.author}
          </div>
          <div>
            <b>Signers:</b>{' '}
            {wallet?.signers.map((signer, j, arr) => (
              <Link key={signer} to={`/delegates/${signer}`}>
                <span>
                  {truncateAddress(signer)}
                  {j !== arr.length - 1 && ', '}
                </span>
              </Link>
            ))}
          </div>
          <div>
            <b>Transactions:</b> <Link to={`/wallet/${wallet.id}/transactions`}>{wallet.transactions?.length ?? 0} transactions</Link>
          </div>
          <div>
            <b>Current Balance:</b> {addressDetails?.[wallet.address]?.balance ?? '#'} iDNA{' '}
            <button onClick={() => getContractDetails(wallet.address)}>Get Current Balance</button>
          </div>
          {i !== 0 && wallet.author === user?.address && (
            <div>
              <button onClick={() => terminateMultisigWallet(wallet)}>Terminate Multisig</button>
            </div>
          )}
        </div>
      ))}
    </>
  );
}

export default Wallets;
