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
    const [confirmPassword, setConfirmPassword] = useState('');

    const [usernameError, setUsernameError] = useState('');
    const [passwordMatchMessage, setPasswordMatchMessage] = useState('');

    const checkUsernameAvailability = () => {
        if (!username.trim()) {
            setUsernameError('');
            return;
        }

        axios.get(`/register/check_username/${username}`)
            .then(response => {
                if (response.data) {
                    setUsernameError('');
                } else {
                    setUsernameError('사용 불가능한 아이디입니다.');
                }
            })
            .catch(error => {
                console.error('아이디 중복 확인 실패:', error);
                setUsernameError('아이디 확인 중 오류 발생');
            });
    };

    const handlePasswordChange = (e) => {
        const newPassword = e.target.value;
        setPassword(newPassword);
        updatePasswordMatchMessage(newPassword, confirmPassword);
    };

    const handleConfirmPasswordChange = (e) => {
        const newConfirm = e.target.value;
        setConfirmPassword(newConfirm);
        updatePasswordMatchMessage(password, newConfirm);
    };

    const updatePasswordMatchMessage = (pw1, pw2) => {
        if (!pw1 || !pw2) {
            setPasswordMatchMessage('');
            return;
        }

        if (pw1 === pw2) {
            setPasswordMatchMessage('비밀번호가 일치합니다.');
        } else {
            setPasswordMatchMessage('비밀번호가 일치하지 않습니다.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        if (!displayName || !username || !password || !confirmPassword) {
            alert('모든 항목을 입력해 주세요.');
            return;
        }

        if (usernameError) {
            alert('아이디를 다시 확인하세요.');
            return;
        }

        if (password !== confirmPassword) {
            alert('비밀번호가 일치하지 않습니다.');
            return;
        }

        const confirmed = window.confirm('가입하시겠습니까?');
        if (!confirmed) return;

        axios.post('/register_process', { displayName, username, password })
            .then(response => {                
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
                    <input type="text" placeholder="아이디" value={username} 
                        onChange={(e) => {
                            setUsername(e.target.value);
                            setUsernameError('');
                        }}
                        onBlur={checkUsernameAvailability}
                    />
                    {usernameError && (
                        <div className="form-message error">{usernameError}</div>
                    )}

                    <input type="text" placeholder="성명" value={displayName} onChange={(e) => setDisplayName(e.target.value)}/>
                    <input type="password" placeholder="비밀번호" value={password} onChange={handlePasswordChange}/>

                    <input type="password" placeholder="비밀번호 확인" value={confirmPassword} onChange={handleConfirmPasswordChange}/>
                    {passwordMatchMessage && (
                        <div className={`form-message ${password === confirmPassword ? 'success' : 'error'}`}>
                            {passwordMatchMessage}
                        </div>
                    )}

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
