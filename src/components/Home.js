import { Link } from 'react-router-dom';
import './Home.css';

function Home() {
  return (
    <div className="Home">
      <h2>The Idena Community Wallet</h2>
      <div>
        <div>
          Built on <i>Ubiubi2018#9073&apos;s</i> winning governance proposal found here:{' '}
          <a href="https://ubiubi2018.medium.com/proposal-for-governance-mechanism-for-idena-community-wallet-1d3f42819a50" target="_blank" rel="noreferrer">
            All power to the oracles!
          </a>
        </div>
      </div>
      <Link to="/terms-of-service">Terms Of Service</Link>
    </div>
  );
}

export default Home;
