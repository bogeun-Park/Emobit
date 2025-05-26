import '../../styles/BoardUpdate.css'
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';
import presignedUrlAxios from 'axios';

function BoardUpdate() {
    const axios = useAxios();
    const navigate = useNavigate();

    const { boardId } = useParams();
    const [board, setBoard] = useState({ title: '', content: '' });
    const [image, setImage] = useState(null);

    useEffect(() => {
        axios.get(`/board/read/${boardId}`)
            .then((response) => {
                setBoard(response.data);
            })
            .catch((error) => {
                console.error('게시글을 가져오는 데 실패했습니다:', error);
                navigate('/board');
            });
    }, [boardId]);

    const handleChange = (e) => {
        const { id, value } = e.target;
    
        setBoard((prevBoard) => ({...prevBoard, [id]: value,}));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const confirmed = window.confirm('게시글을 수정하시겠습니까?');
        if (!confirmed) return;

        let imageUrl = board.imageUrl;
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

            await axios.put(`/board/update_process/${boardId}`, {
                title: board.title,
                content: board.content,
                beforeImageUrl: board.imageUrl,
                afterImageUrl: imageUrl
            })

            alert('게시글이 수정되었습니다!');
            navigate(`/board/read/${boardId}`);
        } catch (error) {
            console.error('게시글 수정 실패:', error);

            if (error.response && error.response.status === 401) {
                alert('로그인 세션이 만료되었습니다. 다시 로그인해주세요.');
                navigate('/login');
            } else {
                alert('게시글 작성 중 오류가 발생했습니다.');
            }
        }
    };

    return (
        <div className="boardUpdate-container">
            <h2>게시글 수정</h2>

            <form onSubmit={handleSubmit}>
                {image ? (
                    <img src={URL.createObjectURL(image)} alt="" style={{ width: '300px', height: '300px', objectFit: 'cover' }}/>
                ) : (
                    <img src={board.imageUrl} alt="" style={{ width: '300px', height: '300px', objectFit: 'cover' }} />
                )}

                <div>
                    <label htmlFor="title">제목</label>
                    <input type="text" id="title" value={board.title} onChange={handleChange}/>
                </div>

                <div style={{ display: 'flex' }}>
                    <label htmlFor="content">내용</label>
                    <textarea id="content" value={board.content} onChange={handleChange} rows={8}/>
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

export default BoardUpdate;
