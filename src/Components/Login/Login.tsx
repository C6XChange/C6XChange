import { Button, Checkbox, Divider, TextField, VerticalStack } from 'jiffy-ui';
import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import loginImage from '../../assets/images/login.png';
import logo from '../../assets/images/black-logo.png';
import { GoogleIcon } from '../../assets/Icons';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    // Redirect to dashboard if already authenticated
    useEffect(() => {
        if (isAuthenticated) {
            navigate('/C6XChange/dashboard');
        }
    }, [isAuthenticated, navigate]);

    const handleLogin = () => {
        setError('');
        
        if (!email || !password) {
            setError('Please enter both username and password');
            return;
        }

        const isSuccess = login(email, password);
        if (isSuccess) {
            navigate('/C6XChange/dashboard');
        } else {
            setError('Invalid username or password');
        }
    };

    return (
        <div className='login-container'>
            
            <div className='login-content'>
                <div className='login-form-container'>
                    <div className='login-form_left'>
                        <div className='login-form'>
                            <VerticalStack gap={5}>
                                <div className='login-form_left_header'>
                                    <img src={logo} alt="logo" />
                                    <h1>Hi, Welcome Back to <span>C6Xchange</span></h1>
                                    <p>
                                        Lorem Ipsum is the standard placeholder text used in 
                                        printing, web design, and graphic design to 
                                        demonstrate, document
                                    </p>
                                </div>
                                <div style={{
                                    padding: '12px',
                                    backgroundColor: '#f0f4ff',
                                    borderRadius: '8px',
                                    border: '1px solid #d0dff7',
                                    marginBottom: '10px'
                                }}>
                                    <p style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: '#334155', margin: 0 }}>
                                        Test Users:
                                    </p>
                                    <div style={{ fontSize: '13px', color: '#475569', lineHeight: '1.6', marginTop: '8px' }}>
                                        <div>• user1 / password1 (Admin)</div>
                                        <div>• user2 / password2 (Manager)</div>
                                        <div>• user3 / password3 (Trader)</div>
                                        <div>• user4 / password4 (Analyst)</div>
                                    </div>
                                </div>
                                <VerticalStack gap={5}>
                                    <TextField
                                        label='Username'
                                        required={true}
                                        placeholder='Enter your username'
                                        type='text'
                                        value={email}
                                        onChange={(value: any) => {
                                            setError('');
                                            // jiffy-ui TextField might pass value directly or event object
                                            if (typeof value === 'string') {
                                                setEmail(value);
                                            } else if (value?.target?.value !== undefined) {
                                                setEmail(value.target.value);
                                            }
                                        }}
                                    />

                                    <TextField
                                        label='Password'
                                        placeholder='Enter your password'
                                        required={true}
                                        type='password'
                                        value={password}
                                        onChange={(value: any) => {
                                            setError('');
                                            // jiffy-ui TextField might pass value directly or event object
                                            if (typeof value === 'string') {
                                                setPassword(value);
                                            } else if (value?.target?.value !== undefined) {
                                                setPassword(value.target.value);
                                            }
                                        }}
                                    />
                                    {error && (
                                        <div style={{ 
                                            color: '#d32f2f', 
                                            fontSize: '14px', 
                                            marginTop: '-10px',
                                            padding: '8px 12px',
                                            backgroundColor: '#ffebee',
                                            borderRadius: '4px',
                                            border: '1px solid #ffcdd2'
                                        }}>
                                            {error}
                                        </div>
                                    )}
                                    <Checkbox label='Keep me signed in' />
                                    <Button
                                        isFullWidth
                                        onClick={handleLogin}
                                    >
                                        Login
                                    </Button>
                                </VerticalStack>
                                <div className='login-form_left_divider'>
                                    <span>Or, login with your email</span>
                                    <Divider thickness='Thin' type='Solid' />
                                </div>
                                <Button variant='Secondary'  isFullWidth size='Large' icon={<GoogleIcon />} suffixIcon={<GoogleIcon />}  >
                                    Login with Google
                                </Button>
            <div className='login-back-link'>
                <Link to="/C6XChange" style={{ 
                    color: '#667eea', 
                    textDecoration: 'none', 
                    fontSize: '16px',
                    fontWeight: '500',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '5px'
                }}>
                    ← Back to Home
                </Link>
            </div>
                            </VerticalStack>
                        </div>
                    </div>
                    <div className='login-form_right'>
                        <img src={loginImage} alt="login image" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;