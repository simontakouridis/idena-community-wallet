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

  return (
    <>
      <h2>Wallets</h2>
      {isAdmin() && (
        <>
          <Link to="/create-wallet">CREATE WALLET</Link>
        </>
      )}
      {wallets?.map(wallet => (
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
            {wallet?.signers.map((signer, index, arr) => (
              <Link key={signer} to={`/delegates/${signer}`}>
                <span>
                  {truncateAddress(signer)}
                  {index !== arr.length - 1 && ', '}
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
        </div>
      ))}
    </>
  );
}

export default Wallets;
