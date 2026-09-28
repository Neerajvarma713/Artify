import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import * as authService from '../services/authService';
import { validateEmail, validatePassword, validateConfirmPassword } from '../utils/validators';
import { toast } from 'react-toastify';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    const emailCheck = validateEmail(email);
    const passwordCheck = validatePassword(newPassword);
    const confirmCheck = validateConfirmPassword(newPassword, confirmPassword);

    if (!emailCheck.isValid) nextErrors.email = emailCheck.message;
    if (!passwordCheck.isValid) nextErrors.password = passwordCheck.message;
    if (!confirmCheck.isValid) nextErrors.confirmPassword = confirmCheck.message;
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);
    try {
      const response = await authService.resetPassword({ email, newPassword });
      toast.success(response.message);
      navigate('/login');
    } catch (error) {
      toast.error(error.message || 'Unable to reset your password');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center bg-white p-4">
      <div className="w-100" style={{ maxWidth: '420px' }}>
        <h1 className="text-uppercase font-weight-black text-dark mb-2 letter-spacing-1 h3">RESET PASSWORD</h1>
        <p className="text-muted fs-7 mb-4">Enter your account email and choose a new password.</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group mb-3">
            <label className="text-uppercase text-xs font-weight-bold text-dark mb-1 letter-spacing-1">Email Address</label>
            <input
              type="email"
              className={`form-control rounded-0 py-3 ${errors.email ? 'is-invalid' : ''}`}
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="Enter your email address"
            />
            {errors.email && <div className="invalid-feedback fs-8">{errors.email}</div>}
          </div>

          <div className="form-group mb-3">
            <label className="text-uppercase text-xs font-weight-bold text-dark mb-1 letter-spacing-1">New Password</label>
            <input
              type="password"
              className={`form-control rounded-0 py-3 ${errors.password ? 'is-invalid' : ''}`}
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              placeholder="Create a new password"
            />
            {errors.password && <div className="invalid-feedback fs-8">{errors.password}</div>}
          </div>

          <div className="form-group mb-4">
            <label className="text-uppercase text-xs font-weight-bold text-dark mb-1 letter-spacing-1">Confirm Password</label>
            <input
              type="password"
              className={`form-control rounded-0 py-3 ${errors.confirmPassword ? 'is-invalid' : ''}`}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Repeat your new password"
            />
            {errors.confirmPassword && <div className="invalid-feedback fs-8">{errors.confirmPassword}</div>}
          </div>

          <button type="submit" className="btn btn-ajio-red rounded-0 w-100 py-3 text-uppercase font-weight-bold letter-spacing-1 fs-7 mb-3" disabled={isSubmitting}>
            {isSubmitting ? 'Resetting Password...' : 'Reset Password'}
          </button>
          <p className="text-center text-muted fs-7 mb-0">
            Remembered your password? <Link to="/login" className="text-ajio-red font-weight-bold text-decoration-none">Sign In</Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
