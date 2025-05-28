import '../../styles/ProfilePage.css';
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAxios } from '../../contexts/AxiosContext';

function ProfilePage() {
    const axios = useAxios();
    const auth = useSelector(state => state.auth);

    const [myBoards, setMyBoards] = useState([]);

    useEffect(() => {
        if (!auth.isAuthenticated) {
            return;
        }

        axios.get(`/myBoards/${auth.id}`)
            .then((response) => {
                setMyBoards(response.data);
            })
            .catch((err) => {
                console.error('게시판 목록 불러오기 실패:', err);
            });
    }, [auth]);

    return (
        <div className="profile-container">
            <div className="profile-header">
                <img src={auth.imageUrl} alt="" className="profile-image" />
                <div className="profile-info">
                    <h2>{auth.displayName}</h2>
                    <p>@{auth.username}</p>
                    <p>게시물 {myBoards.length}</p>
                </div>
            </div>

            <hr className="profile-divider" />

            <div className="post-grid">
                {myBoards.map((board) => (
                    <Link to={`/board/read/${board.id}`} key={board.id} className="post-item">
                        <img src={board.imageUrl} alt={board.title}/>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default ProfilePage;
