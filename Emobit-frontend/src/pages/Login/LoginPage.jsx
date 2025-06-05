import '../../styles/LoginRegisterPage.css';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAxios } from '../../contexts/AxiosContext';
import { useDispatch, useSelector } from 'react-redux';
import { authAction } from '../../redux/Slice/authSlice';

function LoginPage() {
    const axios = useAxios();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const auth = useSelector(state => state.auth);

    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        if (auth.isAuthenticated) {
            navigate('/');
        }
    }, [auth, navigate]);

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!username || !password) {
            alert('아이디와 비밀번호를 입력하세요.');
            return;
        }

        axios.post('/login', { username, password })
            .then(response => {
                axios.get('/login/auth').then(authResponse => {
                    const { id, displayName, role, imageUrl } = authResponse.data;
                    dispatch(authAction.login({ username, id, displayName, role, imageUrl }));
                });

                navigate('/');
            })
            .catch(error => {
                console.error('로그인 실패:', error);
                alert('로그인 정보가 잘못되었습니다.');
            });
    };

    const handleRegisterClick = () => {
        navigate('/login/register');
    };

    return (
        <div className="login-Register-container">
            <div className="login-Register-box">
                <div className="logo-wrapper" onClick={() => navigate('/')}>
                    <span className="logo-text">Emobit</span>
                </div>

                <form onSubmit={handleSubmit} className="login-Register-form">
                    <input type="text" placeholder="아이디" value={username} onChange={(e) => setUsername(e.target.value)}/>
                    <input type="password" placeholder="비밀번호" value={password} onChange={(e) => setPassword(e.target.value)}/>
                    <button type="submit" className="login-Register-button">로그인</button>
                </form>

                <div className="divider">
                    <div className="line"></div>
                    <span className="or-text">또는</span>
                    <div className="line"></div>
                </div>

                <div className="forgot-password">
                    <button onClick={() => alert("비밀번호 재설정 기능 준비 중입니다.")}>비밀번호를 잊으셨나요?</button>
                </div>

                <div className="login-register-link">
                    <span>계정이 없으신가요?</span>
                    <button onClick={handleRegisterClick}>가입하기</button>
                </div>
            </div>
        </div>
    );
}

export default LoginPage;
