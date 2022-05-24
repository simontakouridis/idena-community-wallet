import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function Wallet() {
  const user = useSelector(state => state.general.user);

  const canCreateNewWallet = () => {
    return user?.role === 'admin';
  };

  return (
    <>
      <h2>Wallet</h2>

      {canCreateNewWallet() && (
        <>
          <Link to="/create-wallet">CREATE WALLET</Link>
        </>
      )}
    </>
  );
}

export default Wallet;
