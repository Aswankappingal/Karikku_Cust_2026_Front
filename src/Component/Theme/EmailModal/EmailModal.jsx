import React, { useState } from 'react';
import './EmailModal.scss';
import axios from 'axios';
import baseUrl from '../../../baseUrl';

const EmailModal = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSkip = () => {
    onClose();
  };

  const handleSubmit = async () => {
    if (!email) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('authToken');
      // We are wrapped in a try-catch, so if the endpoint doesn't exist, it will just fail gracefully and close the modal.
      await axios.post(`${baseUrl}/update-email`, { email }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      // Optionally update local storage user info
      let user = JSON.parse(localStorage.getItem('user'));
      if (user) {
        user.email = email;
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userData', JSON.stringify(user));
      }
    } catch (error) {
      console.error('Error updating email:', error);
    } finally {
      setLoading(false);
      onClose(); // Proceed regardless of error
    }
  };

  return (
    <div className='EmailModalMainWrapper'>
      <div className='modal-content email-modal-content'>
        <div className='modal-header'>
          <h3>Add Your Email</h3>
          <button className='close-button' onClick={handleSkip}>×</button>
        </div>

        <p className='acc-para' style={{ marginBottom: '20px' }}>
          Please provide your email address for order updates.
        </p>

        <div className='modal-body'>
          <div className='input-group'>
            <label htmlFor='email'>Email Address (Optional)</label>
            <input
              type='email'
              id='email'
              placeholder='Enter your email...'
              className='email-input'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <button
            className='continue-btn'
            onClick={handleSubmit}
            disabled={loading || !email}
            style={{
              opacity: (loading || !email) ? 0.7 : 1,
              cursor: (loading || !email) ? 'not-allowed' : 'pointer',
              marginBottom: '10px'
            }}
          >
            {loading ? 'Submitting...' : 'Submit'}
          </button>

          <button
            className='continue-btn skip-btn'
            onClick={handleSkip}
            disabled={loading}
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailModal;
