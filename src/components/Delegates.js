import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import './Delegates.css';

function Delegates() {
  const wallets = useSelector(state => state.general.data.wallets);

  return (
    <div className="Delegates">
      <h2>Delegates</h2>
      {wallets?.map(wallet => (
        <div key={wallet.round}>
          <h3>Round {wallet.round}</h3>
          {wallet?.signers.map(signer => (
            <div key={signer}>
              <Link to={`/delegates/${signer}`}>
                <img className="UserImg" src={`https://robohash.org/${signer}?set=set1`} />
                <span>{signer}</span>
              </Link>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default Delegates;
