import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';

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
      {JSON.stringify(user)}
    </div>
  );
}

export default DelegateDetails;
