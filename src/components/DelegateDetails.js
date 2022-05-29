import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import './DelegateDetails.css';

function DelegateDetails() {
  const users = useSelector(state => state.general.data.users);

  const location = useLocation();
  const userId = location.pathname.split('/')?.pop();

  const [user, setUser] = useState(null);

  useEffect(() => {
    if (!users?.length) {
      return;
    }
    const user = users.find(user => user.address === userId);
    setUser(user);
  }, [users]);

  return (
    <div className="DelegateDetails">
      <h2>Delegate Details</h2>
      {user && (
        <>
          <div>
            <img className="UserImg" src={`https://robohash.org/${user.address}?set=set1`} />
          </div>
          <div>
            <b>address:</b>{' '}
            <a href={`https://scan.idena.io/address/${user.address}`} target="_blank" rel="noreferrer">
              {user.address}
            </a>
          </div>
          <div>
            <b>name:</b> {user.name}
          </div>
          <div>
            <b>wallets:</b> {JSON.stringify(user.wallets)}
          </div>
        </>
      )}
    </div>
  );
}

export default DelegateDetails;
