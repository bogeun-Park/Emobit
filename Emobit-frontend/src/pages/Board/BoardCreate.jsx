import '../../styles/BoardCreate.css'
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
                let presignedUrl = '';
                // Presigned URL 요청
                try {
                    const presignedRes = await axios.get(`/board/PresignedUrl?filename=${image.name}`);
                    presignedUrl = presignedRes.data;
                } catch (error) {
                    console.error('Presigned URL 요청 실패:', error);
                    return;
                }

                // Object Storage에 이미지 업로드
                try {
                    await presignedUrlAxios.put(presignedUrl, image, {
                        headers: {
                            'Content-Type': image.type
                        },
                    });

                    imageUrl = presignedUrl.replace(/\/p\/[^/]+\//, "/");
                } catch (error) {
                    console.error('오브젝트 스토리지 업로드 실패:', error);
                    return;
                }
            }

            await axios.post('/board/create_process', {
                title,
                content,
                imageUrl,
            });

            alert('게시글이 성공적으로 작성되었습니다.');
            navigate('/board');
        } catch (error) {
            console.error('게시글 작성 중 에러 발생:', error);

            if (error.response?.status === 401) {
                alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                navigate('/login');
            } else {
                alert('게시글 작성 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div className="boardCreate-container">
            <h2>게시판 작성</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">제목</label>
                    <input type="text" id="title" value={title} onChange={(e) => setTitle(e.target.value)}/>
                </div>

                <div style={{ display: 'flex' }}>
                    <label htmlFor="content">내용</label>
                    <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={8}/>
                </div>

                <div>
                    <label htmlFor="fileInput"></label>
                    <input type="file" id="fileInput" onChange={(e) => setImage(e.target.files[0])} />
                </div>

                <button type="submit">저장</button>
            </form>
        </div>
    );
}

export default BoardCreate;