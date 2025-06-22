import '../../styles/ProfilePage.css';
import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAxios } from '../../contexts/AxiosContext';
import NotFoundPage from '../NotFound/NotFoundPage';
import presignedUrlAxios from 'axios';

function ProfilePage() {
    const axios = useAxios();
    const auth = useSelector(state => state.auth);
    const navigate = useNavigate();

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

    const handleClickImage = () => {
        if (auth.username === username) {
            document.getElementById('fileInput').click()
        }
    };

    const handleImageChange = async (e) => {
        const image = e.target.files[0];

        if (!image) return;

        try {
            if (image) {
                // Presigned URL 요청
                const presignedRes = await axios.get(`/member/PresignedUrl?filename=${image.name}`);
                const presignedUrl = presignedRes.data;

                // Object Storage에 이미지 업로드
                await presignedUrlAxios.put(presignedUrl, image, {
                    headers: { 'Content-Type': image.type },
                });

                let imagePath = presignedUrl.replace(/^.*\/o\//, "");
                await axios.put(`/member/imagePath_update/${auth.id}?imagePath=${encodeURIComponent(imagePath)}`)

                let imageUrl = presignedUrl.replace(/\/p\/[^/]+\//, "/");
                setMember(prev => ({ ...prev, imageUrl: imageUrl }));
            }
        } catch (error) {
            console.error('에러 발생:', error);
            if (error.response?.status === 401) {
                alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                navigate('/login');
            } else {
                alert('프로필 사진 변경중 오류가 발생했습니다.');
            }
        }
    };

    if (notFound) {
        return <NotFoundPage />;
    }

    if (!boards || !member) return null;

    return (
        <div className="profile-container">
            <div className="profile-header">
                <div className="profile-header-wrapper">                        
                    <img className={`profile-image ${auth.username === member.username ? 'clickable' : ''}`}
                        src={member.imageUrl} alt="" onClick={handleClickImage}
                    />
                    <input type="file" id="fileInput" accept="image/*" style={{ display: 'none' }}
                        onChange={handleImageChange}
                        onClick={(e) => { e.target.value = null; }}
                    />                    

                    <div className="profile-info">
                        <div className="profile-info-username">{member.username}</div>

                        <div className="profile-info-stats">
                            <span className="stats-label">게시물</span>
                            <span className="profile-info-board-count">{boards.length}</span>
                        </div>

                        <div className="profile-info-user-pc">
                            <div className="profile-info-displayName">{member.displayName}</div>
                            <div className="profile-info-content"></div>
                        </div>
                    </div>
                </div>

                <div className="profile-info-user-mobile">
                    <div className="profile-info-displayName">{member.displayName}</div>
                    <div className="profile-info-content"></div>
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
