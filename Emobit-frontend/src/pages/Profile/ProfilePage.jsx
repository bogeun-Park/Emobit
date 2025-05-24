import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAxios } from '../../contexts/AxiosContext';

function ProfilePage() {
    const axios = useAxios();
    const auth = useSelector(state => state.auth);
        
    const [myBoards, setMyBoards] = useState([]);

    useEffect(() => {
        if (!auth.id) return;

        axios.get(`/myBoards/${auth.id}`)
            .then((response) => {
                setMyBoards(response.data);
            })
            .catch((err) => {
                console.error('게시판 목록 불러오기 실패:', err);
            });
    }, [auth]);

    return (
        <div>
            <h3>{auth.username}({auth.displayName})</h3>

            {myBoards.length > 0 && (
                <ul>
                    {myBoards.map((board) => (
                        <li key={board.id}>
                            <Link to={`/board/read/${board.id}`}>{board.title}</Link>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default ProfilePage;