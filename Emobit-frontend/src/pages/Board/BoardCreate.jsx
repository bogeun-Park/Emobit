import '../../styles/BoardCreate.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';
import { useSelector } from 'react-redux';
import presignedUrlAxios from 'axios';

function BoardCreate() {
    const axios = useAxios();
    const navigate = useNavigate();
    const auth = useSelector(state => state.auth);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];

        // 사용자가 파일 선택을 취소한 경우 아무 처리도 하지 않음
        if (!file) {         
            return;
        }

        setImage(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleInputContent = (e) => {
        if (e.target.value.length <= 2000) {
            setContent(e.target.value);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!auth.isAuthenticated) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        const confirmed = window.confirm('게시글을 작성하시겠습니까?');
        if (!confirmed) return;

        let imageUrl = '';
        try {
            if (image) {
                // Presigned URL 요청
                const presignedRes = await axios.get(`/board/PresignedUrl?filename=${image.name}`);
                const presignedUrl = presignedRes.data;

                // Object Storage에 이미지 업로드
                await presignedUrlAxios.put(presignedUrl, image, {
                    headers: { 'Content-Type': image.type },
                });

                imageUrl = presignedUrl.replace(/\/p\/[^/]+\//, "/");
            }

            await axios.post('/board/create_process', {
                title,
                content,
                imageUrl,
            });

            alert('게시글이 성공적으로 작성되었습니다.');
            navigate('/board');
        } catch (error) {
            console.error('에러 발생:', error);
            if (error.response?.status === 401) {
                alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                navigate('/login');
            } else {
                alert('게시글 작성 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div className="board-create-container">
            <form onSubmit={handleSubmit} className="board-create-form">

                <div className="form-header">
                    <span className="create-title">Diary 작성</span>
                    <button type="submit" className="submit-button-header">공유하기</button>
                </div>

                <input type="text" className="input-title" placeholder="제목을 입력하세요" value={title} onChange={(e) => setTitle(e.target.value)}/>

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
                            <img src={auth.imageUrl || '/default-profile.png'} alt="" className="content-user-image"/>
                            <span className="username">{auth.username || '사용자'}</span>
                        </div>

                        <textarea className="input-content" value={content} onChange={handleInputContent}/>
                        <div className="content-length">{content.length} / 2000</div>

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

export default BoardCreate;
