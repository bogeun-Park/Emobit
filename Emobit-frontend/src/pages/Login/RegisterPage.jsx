import '../../styles/LoginRegisterPage.css';
import React, { useState } from 'react';
import { useAxios } from '../../contexts/AxiosContext';
import { useNavigate } from 'react-router-dom';

function RegisterPage() {
    const axios = useAxios();
    const navigate = useNavigate();

    const [displayName, setDisplayName] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!displayName || !username || !password) {
            alert('모든 항목을 입력하세요.');
            return;
        }

        axios.post('/login/register_process', { displayName, username, password })
            .then(response => {
                console.log('회원가입 성공:', response.data);
                navigate('/login/register/success');
            })
            .catch(error => {
                console.error('회원가입 실패:', error);
                alert('회원가입에 실패했습니다.');
            });
    };

    return (
        <div className="login-Register-container">
            <div className="login-Register-box">
                <div className="logo-wrapper" onClick={() => navigate('/')}>
                    <span className="logo-text">Emobit</span>
                </div>

                <div className="signup-message">
                    친구들과 다이어리를 공유, 소통하려면 가입하세요.
                </div>

                <form onSubmit={handleSubmit} className="login-Register-form">
                    <input type="text" placeholder="아이디" value={username} onChange={(e) => setUsername(e.target.value)} />
                    <input type="text" placeholder="성명" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                    <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)} />
                    <button type="submit" className="login-Register-button">가입하기</button>
                </form>

                <div className="divider">
                    <div className="line"></div>
                    <span className="or-text">또는</span>
                    <div className="line"></div>
                </div>

                <div className="login-register-link">
                    <span>이미 계정이 있으신가요?</span>
                    <button onClick={() => navigate('/login')}>로그인</button>
                </div>
            </div>
        </div>
    );
}

export default RegisterPage;
