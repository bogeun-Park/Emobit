import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';
import { useSelector } from 'react-redux';

function BoardCreate() {
    const axios = useAxios();
    const navigate = useNavigate();
    const auth = useSelector(state => state.auth);

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!auth.isAuthenticated) {
            alert('로그인이 필요합니다.');
            navigate('/login');
            return;
        }

        const confirmed = window.confirm('게시글을 작성하시겠습니까?');
        if (!confirmed) return;

        axios.post('/board/create_process', {
            title: title,
            content: content,
        })
            .then(res => {
                console.log('게시글 작성 완료:', res.data);
                alert('게시글이 성공적으로 작성되었습니다.');
                navigate('/board');
            })
            .catch(error => {
                console.error('게시글 작성 실패:', error);

                // 인증 오류(401)인 경우에만 로그인 페이지로 리다이렉트
                if (error.response && error.response.status === 401) {
                    alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                    navigate('/login');
                } else {
                    alert('게시글 작성 중 오류가 발생했습니다.');
                }
            });
    };

    return (
        <div>
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

                <button type="submit">저장</button>
            </form>
        </div>
    );
}

export default BoardCreate;