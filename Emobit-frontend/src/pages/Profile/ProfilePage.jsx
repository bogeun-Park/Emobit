import '../../styles/ProfilePage.css';
import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';
import NotFoundPage from '../NotFound/NotFoundPage';

function ProfilePage() {
    const axios = useAxios();

    const { username } = useParams();
    const [member, setMember] = useState(null);
    const [boards, setBoards] = useState(null);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        axios.get(`/profile/${username}`)
            .then((response) => {
                setMember(response.data.member);
                setBoards(response.data.boards);
                setNotFound(false);              
            })
            .catch((error) => {
                if (error.response && error.response.status === 404) {
                    setNotFound(true);
                } else {
                    console.error('프로필 불러오기 실패:', error);
                }
            });
    }, [username]);

    if (notFound) {
        return <NotFoundPage />;
    }

    if (!boards || !member) return null;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <img src={member.imageUrl} alt="" className="profile-image" />
                <div className="profile-info">
                    <h2>{member.displayName}</h2>
                    <p>@{member.username}</p>
                    <p>게시물 {boards.length}</p>
                </div>
            </div>

            <hr className="profile-divider" />

            <div className="post-grid">
                {boards.map((board) => (
                    <Link to={`/board/read/${board.id}`} key={board.id} className="post-item">
                        <img src={board.imageUrl} alt={board.title}/>
                    </Link>
                ))}
            </div>
        </div>
    );
}

export default ProfilePage;
