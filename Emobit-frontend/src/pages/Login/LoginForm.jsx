import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';

function LoginForm (props) {
    const axios = useAxios();
    const navigate = useNavigate();

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username || !password) {
            alert('아이디와 비밀번호를 입력하세요.');
            return;
        }

        axios.post('/login', { username, password })
            .then(response => {
                console.log('로그인 성공:', response);
                navigate('/');
            })
            .catch(error => {
                console.error('로그인 실패:', error);
            });
    };

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
