import React, { useState } from 'react';
import { Modal, Form, Button, Alert, InputGroup, Spinner, Row, Col } from 'react-bootstrap';
import 'boxicons/css/boxicons.min.css';
import { useAuth } from '../../context/AuthContext';
import './AdminLogin.css';

const AdminLogin = ({ show, onHide, onLoginSuccess }) => {
  const { signInWithGoogle, signInWithFacebook, signInWithTwitter, signInWithGithub } = useAuth();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [rememberMe, setRememberMe] = useState(false);
  const [oauthLoading, setOauthLoading] = useState('');

  // Demo admin credentials
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
  };

  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 4000);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.username.trim()) {
      showAlert('Please enter username', 'danger');
      return;
    }
    
    if (!formData.password.trim()) {
      showAlert('Please enter password', 'danger');
      return;
    }

    setIsLoading(true);

    // Simulate API call delay
    setTimeout(() => {
      // Check credentials
      if (formData.username === ADMIN_CREDENTIALS.username && 
          formData.password === ADMIN_CREDENTIALS.password) {
        
        // Store login state
        const adminData = {
          username: formData.username,
          loginTime: new Date().toISOString(),
          rememberMe: rememberMe
        };

        if (rememberMe) {
          localStorage.setItem('adminAuth', JSON.stringify(adminData));
        } else {
          sessionStorage.setItem('adminAuth', JSON.stringify(adminData));
        }

        showAlert('✅ Login successful! Welcome Admin', 'success');
        
        setTimeout(() => {
          setIsLoading(false);
          onLoginSuccess(adminData);
          onHide();
          resetForm();
        }, 1000);
      } else {
        setIsLoading(false);
        showAlert('❌ Invalid username or password', 'danger');
      }
    }, 1500);
  };

  const resetForm = () => {
    setFormData({ username: '', password: '' });
    setShowPassword(false);
    setRememberMe(false);
    setAlert({ show: false, message: '', type: '' });
  };

  const handleDemoLogin = () => {
    setFormData({
      username: ADMIN_CREDENTIALS.username,
      password: ADMIN_CREDENTIALS.password
    });
    showAlert('Demo credentials filled. Click Login to continue.', 'info');
  };

  // OAuth handlers
  const handleOAuthLogin = async (provider, signInMethod) => {
    setOauthLoading(provider);
    try {
      const result = await signInMethod();
      if (result.success) {
        showAlert(`✅ ${provider} sign-in successful!`, 'success');
        setTimeout(() => {
          onLoginSuccess(result.user);
          onHide();
          resetForm();
        }, 1000);
      } else {
        showAlert(`❌ ${provider} sign-in failed: ${result.error}`, 'danger');
      }
    } catch (error) {
      console.error(`${provider} sign-in error:`, error);
      showAlert(`❌ ${provider} sign-in error: ${error.message}`, 'danger');
    } finally {
      setOauthLoading('');
    }
  };

  const handleGoogleLogin = () => handleOAuthLogin('Google', signInWithGoogle);
  const handleFacebookLogin = () => handleOAuthLogin('Facebook', signInWithFacebook);
  const handleTwitterLogin = () => handleOAuthLogin('Twitter', signInWithTwitter);
  const handleGithubLogin = () => handleOAuthLogin('GitHub', signInWithGithub);

  return (
    <Modal 
      show={show} 
      onHide={onHide} 
      centered 
      size="md" 
      onExited={resetForm}
      className="admin-login-modal"
      backdrop="static"
      keyboard={false}
    >
      <Modal.Header closeButton className="admin-login-header">
        <Modal.Title className="d-flex align-items-center">
          <div className="admin-icon-wrapper me-3">
            <i className="bx bx-user" style={{fontSize: '24px'}}></i>
          </div>
          Admin Login
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="admin-login-body">
        {alert.show && (
          <Alert variant={alert.type} className="mb-3 admin-alert">
            {alert.message}
          </Alert>
        )}

        <Form onSubmit={handleLogin}>
          <Form.Group className="mb-3">
            <Form.Label className="admin-label">
              <i className="bx bx-user me-2" style={{fontSize: '16px'}}></i>
              Username
            </Form.Label>
            <InputGroup>
              <InputGroup.Text className="admin-input-icon">
                <i className="bx bx-user" style={{fontSize: '18px'}}></i>
              </InputGroup.Text>
              <Form.Control
                type="text"
                name="username"
                placeholder="Enter admin username"
                value={formData.username}
                onChange={handleInputChange}
                className="admin-input"
                disabled={isLoading}
              />
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label className="admin-label">
              <i className="bx bx-lock me-2" style={{fontSize: '16px'}}></i>
              Password
            </Form.Label>
            <InputGroup>
              <InputGroup.Text className="admin-input-icon">
                <i className="bx bx-lock" style={{fontSize: '18px'}}></i>
              </InputGroup.Text>
              <Form.Control
                type={showPassword ? 'text' : 'password'}
                name="password"
                placeholder="Enter admin password"
                value={formData.password}
                onChange={handleInputChange}
                className="admin-input"
                disabled={isLoading}
              />
              <Button
                variant="outline-secondary"
                onClick={() => setShowPassword(!showPassword)}
                className="admin-password-toggle"
                disabled={isLoading}
              >
                {showPassword ? 
                  <i className="bx bx-hide" style={{fontSize: '18px'}}></i> : 
                  <i className="bx bx-show" style={{fontSize: '18px'}}></i>
                }
              </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Check
              type="checkbox"
              id="rememberMe"
              label="Remember me"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="admin-checkbox"
              disabled={isLoading}
            />
          </Form.Group>

          <div className="d-grid gap-2 mb-3">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={isLoading || oauthLoading}
              className="admin-login-btn"
            >
              {isLoading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Logging in...
                </>
              ) : (
                'Login'
              )}
            </Button>
          </div>

          <div className="text-center mb-3">
            <Button
              variant="outline-info"
              size="sm"
              onClick={handleDemoLogin}
              disabled={isLoading || oauthLoading}
              className="admin-demo-btn"
            >
              Fill Demo Credentials
            </Button>
          </div>

          {/* OAuth Divider */}
          <div className="oauth-divider mb-3">
            <hr />
            <span>Or continue with</span>
            <hr />
          </div>

          {/* OAuth Buttons */}
          <Row className="g-2 mb-3">
            <Col xs={6}>
              <Button
                variant="outline-danger"
                className="oauth-btn google-btn w-100"
                onClick={handleGoogleLogin}
                disabled={isLoading || oauthLoading}
              >
                {oauthLoading === 'Google' ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <i className="bx bxl-google me-2"></i>
                    Google
                  </>
                )}
              </Button>
            </Col>
            <Col xs={6}>
              <Button
                variant="outline-primary"
                className="oauth-btn facebook-btn w-100"
                onClick={handleFacebookLogin}
                disabled={isLoading || oauthLoading}
              >
                {oauthLoading === 'Facebook' ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <i className="bx bxl-facebook me-2"></i>
                    Facebook
                  </>
                )}
              </Button>
            </Col>
          </Row>

          <Row className="g-2">
            <Col xs={6}>
              <Button
                variant="outline-info"
                className="oauth-btn twitter-btn w-100"
                onClick={handleTwitterLogin}
                disabled={isLoading || oauthLoading}
              >
                {oauthLoading === 'Twitter' ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <i className="bx bxl-twitter me-2"></i>
                    Twitter
                  </>
                )}
              </Button>
            </Col>
            <Col xs={6}>
              <Button
                variant="outline-dark"
                className="oauth-btn github-btn w-100"
                onClick={handleGithubLogin}
                disabled={isLoading || oauthLoading}
              >
                {oauthLoading === 'GitHub' ? (
                  <Spinner size="sm" />
                ) : (
                  <>
                    <i className="bx bxl-github me-2"></i>
                    GitHub
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </Form>

        <div className="admin-credentials-info mt-4">
          <div className="alert alert-info">
            <strong>Demo Credentials:</strong><br />
            Username: <code>admin</code><br />
            Password: <code>admin123</code>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default AdminLogin;
