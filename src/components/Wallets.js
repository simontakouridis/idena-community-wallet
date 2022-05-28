import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { truncateAddress, getWalletsFromStateDesc } from './../core/utilities';

function Wallets() {
  const user = useSelector(state => state.general.user);
  const wallets = useSelector(getWalletsFromStateDesc);

  const isAdmin = () => {
    return user?.role === 'admin';
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
                  {truncateAddress(signer)} {index !== arr.length - 1 && ', '}
                </span>
              </Link>
            ))}
          </div>
          <div>
            <b>Transactions:</b>
            <div>
              <a href="#">Create Transaction</a>
            </div>
          </div>
          {wallet?.transactions.map(transaction => (
            <div key={transaction}>{transaction}</div>
          ))}
        </div>
      ))}
    </>
  );
}

export default Wallets;
