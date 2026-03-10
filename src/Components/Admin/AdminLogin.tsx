import { Button, TextField, VerticalStack, TextStyle } from 'jiffy-ui';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import loginImage from '../../assets/images/login.png';
import logo from '../../assets/images/black-logo.png';

const AdminLogin = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    // Check if already logged in as admin
    useEffect(() => {
        const adminToken = localStorage.getItem('adminToken');
        if (adminToken) {
            navigate('/C6XChange/admin/dashboard');
        }
    }, [navigate]);

    const handleLogin = () => {
        setError('');
        
        if (!username || !password) {
            setError('Please enter both username and password');
            return;
        }

        // Admin credentials
        if (username === 'admin' && password === 'admin123') {
            const token = 'admin-token-' + Date.now();
            localStorage.setItem('adminToken', token);
            localStorage.setItem('adminUsername', username);
            localStorage.setItem('adminLoginTime', new Date().toISOString());
            
            navigate('/C6XChange/admin/dashboard');
        } else {
            setError('Invalid admin credentials');
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
                                    <h1>Admin Portal - <span>C6Xchange</span></h1>
                                    <p>
                                        Manage credit buying requests and approve transactions
                                    </p>
                                    <div style={{
                                        marginTop: '15px',
                                        padding: '12px',
                                        backgroundColor: '#fff3cd',
                                        borderRadius: '8px',
                                        border: '1px solid #ffc107'
                                    }}>
                                        <p style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px', color: '#856404', margin: 0 }}>
                                            Admin Access Only
                                        </p>
                                        <div style={{ fontSize: '13px', color: '#856404', marginTop: '8px' }}>
                                            <div>Username: <strong>admin</strong></div>
                                            <div>Password: <strong>admin123</strong></div>
                                        </div>
                                    </div>
                                </div>
                                <VerticalStack gap={5}>
                                    <TextField
                                        label='Admin Username'
                                        required={true}
                                        placeholder='Enter admin username'
                                        type='text'
                                        value={username}
                                        onChange={(value: any) => {
                                            setError('');
                                            if (typeof value === 'string') {
                                                setUsername(value);
                                            } else if (value?.target?.value !== undefined) {
                                                setUsername(value.target.value);
                                            }
                                        }}
                                    />

                                    <TextField
                                        label='Password'
                                        placeholder='Enter admin password'
                                        required={true}
                                        type='password'
                                        value={password}
                                        onChange={(value: any) => {
                                            setError('');
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
                                    <Button
                                        isFullWidth
                                        onClick={handleLogin}
                                    >
                                        Login as Admin
                                    </Button>
                                </VerticalStack>
                                <div className='login-back-link'>
                                    <a href="/C6XChange" style={{ 
                                        color: '#667eea', 
                                        textDecoration: 'none', 
                                        fontSize: '16px',
                                        fontWeight: '500',
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '5px'
                                    }}>
                                        ← Back to Home
                                    </a>
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

export default AdminLogin;
