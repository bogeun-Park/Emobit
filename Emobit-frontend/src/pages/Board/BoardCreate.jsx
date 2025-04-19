import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';

function BoardCreate() {
    const axios = useAxios();
    const navigate = useNavigate();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        
        axios.get('/login/auth')
            .then(response => {
                const user = response.data;

                if (user && user.id) {
                    axios.post('/board/create_process', {
                        title: title,
                        content: content,
                        createdBy: user.id
                    })
                        .then(res => {
                            console.log('게시글 작성 완료:', res.data);
                            alert('게시글이 성공적으로 작성되었습니다.');
                            navigate('/board');
                        })
                        .catch(err => {
                            console.error('게시글 작성 실패:', err);
                            alert('게시글 작성 중 오류가 발생했습니다.');
                        });
                } else {
                    alert('로그인이 필요합니다.');
                }
            })
            .catch(error => {
                console.error('인증 실패:', error);
                alert('로그인 정보 확인 중 오류가 발생했습니다.');
            });
    };

    return (
        <div>
            <h2>게시판 작성</h2>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="title">제목</label>
                    <input type="text" id="title" name="title" value={title} onChange={(e) => setTitle(e.target.value)} required/>
                </div>

                <div style={{ display: 'flex' }}>
                    <label htmlFor="content">내용</label>
                    <textarea id="content" value={content} onChange={(e) => setContent(e.target.value)} rows={8} required/>
                </div>

                <button type="submit">제출</button>
            </form>
        </div>
    );
}

export default BoardCreate;