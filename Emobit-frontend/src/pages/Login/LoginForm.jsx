import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function LoginForm (props) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username || !password) {
            alert('아이디와 비밀번호를 입력하세요.');
            return;
        }

        axios.post(`${process.env.REACT_APP_API_URL}/api/login`, { username, password })
            .then(response => {
                console.log('로그인 성공:', response.data);
            })
            .catch(error => {
                console.error('로그인 실패:', error);
            });
    };

    const navigate = useNavigate();

    const handleRegisterClick = () => {
        navigate('/login/register');
    };

    return (
        <form onSubmit={handleSubmit}>
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
                <button type="button" onClick={handleRegisterClick}>SignUp</button>
                <button type="submit">Login</button>
            </p>
        </form>
    );
};

export default LoginForm;
