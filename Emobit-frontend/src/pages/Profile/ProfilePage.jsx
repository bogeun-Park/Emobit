import { useSelector } from 'react-redux';

function ProfilePage() {
    const auth = useSelector(state => state.auth);

    return (
        <div>
            <h3>{auth.username}({auth.displayName})</h3>
        </div>
    );
}

export default ProfilePage;