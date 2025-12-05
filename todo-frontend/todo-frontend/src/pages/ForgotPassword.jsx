import React, { useState } from 'react';
import axios from 'axios';

const ForgotPassword = () => {
    const [mobileNumber, setMobileNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Request OTP, 2: Verify OTP & Reset Password
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleRequestOtp = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            const response = await axios.post('/api/auth/forgot-password-request-otp', { mobileNumber });
            setMessage(response.data.message);
            setStep(2);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to request OTP. Please try again.');
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        if (newPassword !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        try {
            const response = await axios.post('/api/auth/forgot-password-verify-otp-reset', { 
                mobileNumber, 
                otp, 
                newPassword 
            });
            setMessage(response.data.message + ' You can now log in with your new password.');
            // Optionally redirect to login page
            // navigate('/login'); 
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h2>Forgot Password</h2>
            {message && <p style={{ color: 'green' }}>{message}</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {step === 1 && (
                <form onSubmit={handleRequestOtp}>
                    <div>
                        <label htmlFor="mobileNumber">Mobile Number:</label>
                        <input
                            type="text"
                            id="mobileNumber"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', margin: '5px 0', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Request OTP</button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleResetPassword}>
                    <div>
                        <label htmlFor="otp">OTP:</label>
                        <input
                            type="text"
                            id="otp"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', margin: '5px 0', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="newPassword">New Password:</label>
                        <input
                            type="password"
                            id="newPassword"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', margin: '5px 0', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <div>
                        <label htmlFor="confirmPassword">Confirm New Password:</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            style={{ width: '100%', padding: '8px', margin: '5px 0', borderRadius: '4px', border: '1px solid #ddd' }}
                        />
                    </div>
                    <button type="submit" style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Reset Password</button>
                </form>
            )}
        </div>
    );
};

export default ForgotPassword;
