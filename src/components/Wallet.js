import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

function Wallet() {
  const user = useSelector(state => state.general.user);

  const isAdmin = () => {
    return user?.role === 'admin';
  };

  return (
    <>
      <h2>Wallet</h2>

      {isAdmin() && (
        <>
          <Link to="/create-wallet">CREATE WALLET</Link>
        </>
      )}
    </>
  );
}

export default Wallet;
