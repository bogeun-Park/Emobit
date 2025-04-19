import React, { useState } from 'react';
import { useAxios } from '../../contexts/AxiosContext';
import { useNavigate } from 'react-router-dom';

function LoginPage() {
    const axios = useAxios();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username || !password) {
            alert('아이디와 비밀번호를 입력하세요.');
            return;
        }

        axios.post('/login/register_process', { displayName, username, password })
            .then(response => {
                console.log('회원가입 성공:', response.data);
                navigate('/login/register/sucess');
            })
            .catch(error => {
                console.error('회원가입 실패:', error);
            });
    };

    return (
        <div>
            <h2>회원가입</h2>
            
            <form onSubmit={handleSubmit}>
            <div>
                <label htmlFor="displayName">이름</label>
                <input
                    name="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="username">아이디</label>
                <input
                    name="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                />
            </div>

            <div>
                <label htmlFor="password">비밀번호</label>
                <input
                    name="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <p>
                <button type="submit">가입하기</button>
            </p>
        </form>
        </div>
    );
}

export default LoginPage;