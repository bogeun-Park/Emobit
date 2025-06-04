import '../../styles/BoardCreateUpdate.css';
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useAxios } from '../../contexts/AxiosContext';
import presignedUrlAxios from 'axios';

function BoardUpdate() {
    const axios = useAxios();
    const navigate = useNavigate();
    const auth = useSelector(state => state.auth);

    const { boardId } = useParams();
    const [board, setBoard] = useState({ title: '', content: '', imageUrl: '' });
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    useEffect(() => {
        axios.get(`/board/read/${boardId}`)
            .then((response) => {
                setBoard(response.data);
                setPreview(response.data.imageUrl); // 기존 이미지 미리보기 설정
            })
            .catch((error) => {
                console.error('게시글을 가져오는 데 실패했습니다:', error);
                navigate('/board');
            });
    }, [boardId]);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setBoard((prev) => ({ ...prev, [id]: value }));
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        if (!file) return;

        setImage(file);

        // 새 이미지 미리보기 생성
        const reader = new FileReader();
        reader.onloadend = () => setPreview(reader.result);
        reader.readAsDataURL(file);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!auth.isAuthenticated) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        const confirmed = window.confirm('게시글을 수정하시겠습니까?');
        if (!confirmed) return;

        let imageUrl = board.imageUrl;
        try {
            if (image) {
                // Presigned URL 요청
                const presignedRes = await axios.get(`/board/PresignedUrl?filename=${image.name}`);
                const presignedUrl = presignedRes.data;

                // Object Storage에 이미지 업로드
                await presignedUrlAxios.put(presignedUrl, image, {
                    headers: { 'Content-Type': image.type }
                });

                imageUrl = presignedUrl.replace(/\/p\/[^/]+\//, "/");
            }

            await axios.put(`/board/update_process/${boardId}`, {
                title: board.title,
                content: board.content,
                beforeImageUrl: board.imageUrl,
                afterImageUrl: imageUrl
            });

            alert('게시글이 수정되었습니다!');
            navigate(`/board/read/${boardId}`);
        } catch (error) {
            console.error('게시글 수정 실패:', error);
            if (error.response?.status === 401) {
                alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                navigate('/login');
            } else {
                alert('게시글 수정 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div className="board-create-update-container">
            <form onSubmit={handleSubmit} className="board-create-update-form">

                <div className="form-header">
                    <span className="create-update-title">Diary 수정</span>
                    <button type="submit" className="submit-button-header">저장</button>
                </div>

                <input type="text" id="title" className="input-title" placeholder="제목을 입력하세요" value={board.title} onChange={handleChange} />

                <div className="form-content-wrapper">

                    <div className="image-upload-box" onClick={() => document.getElementById('fileInput').click()}>
                        {preview ? (
                            <img src={preview} alt="미리보기" />
                        ) : (
                            <span className="image-placeholder">이미지를 클릭하여 등록</span>
                        )}
                    </div>

                    <div className="form-input-area">
                        <div className="user-info">
                            <img src={auth.imageUrl} alt="" className="content-user-image" />
                            <span className="username">{auth.username || '사용자'}</span>
                        </div>

                        <textarea id="content" className="input-content" value={board.content} onChange={handleChange} maxLength={2000} placeholder="내용을 입력하세요"/>
                        <div className="content-length">{board.content.length} / 2000</div>

                        <div className="upload-action-row" style={{ display: 'none' }}>
                            <input type="file" id="fileInput" accept="image/*" 
                                onChange={handleImageChange} 
                                onClick={(e) => { e.target.value = null; }}
                            />
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}

export default BoardUpdate;
