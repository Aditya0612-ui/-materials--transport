import React, { useState } from 'react';
import { Container, Row, Col, Card, Button, Spinner, Form, Alert, InputGroup } from 'react-bootstrap';
import 'boxicons/css/boxicons.min.css';
import { useAuth } from '../../context/AuthContext';
import { authHelpers } from '../../config/firebase';
import './LoginPage.css';

const LoginPage = () => {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

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

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) {
      showAlert('Please enter both email and password', 'warning');
      return;
    }

    setEmailLoading(true);
    try {
      const result = await authHelpers.signIn(formData.email, formData.password);
      if (result.success) {
        showAlert('Login successful!', 'success');
      } else {
        console.error('❌ Email sign-in failed:', result.error);
        showAlert(`Login failed: ${result.error}`, 'danger');
      }
    } catch (error) {
      console.error('❌ Email sign-in error:', error);
      showAlert(`Login error: ${error.message}`, 'danger');
    } finally {
      setEmailLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      const result = await signInWithGoogle();
      if (result.success) {
        showAlert('Google login successful!', 'success');
      } else {
        console.error('❌ Google sign-in failed:', result.error);
        showAlert(`Google login failed: ${result.error}`, 'danger');
      }
    } catch (error) {
      console.error('❌ Google sign-in error:', error);
      showAlert(`Google login error: ${error.message}`, 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="simple-login-page">
      <Container>
        <Row className="min-vh-100 align-items-center justify-content-center">
          <Col md={6} lg={4}>
            <Card className="login-card shadow-lg">
              <Card.Body className="p-5">
                <div className="text-center mb-4">
                  <div className="logo-icon mb-3">
                    <i className="bx bx-building" style={{fontSize: '60px', color: '#065f46'}}></i>
                  </div>
                  <h3 className="login-title">Construction Materials & Transport</h3>
                  <p className="login-subtitle text-muted">Management Dashboard</p>
                </div>

                {alert.show && (
                  <Alert variant={alert.type} className="mb-3">
                    {alert.message}
                  </Alert>
                )}

                {/* Email/Password Login Form */}
                <Form onSubmit={handleEmailLogin} className="mb-4">
                  <Form.Group className="mb-3">
                    <Form.Label className="login-label">
                      <i className="bx bx-envelope me-2"></i>
                      Email Address
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="login-input-icon">
                        <i className="bx bx-envelope"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type="email"
                        name="email"
                        placeholder="Enter your email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="login-input"
                        disabled={emailLoading || isLoading}
                        required
                      />
                    </InputGroup>
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label className="login-label">
                      <i className="bx bx-lock me-2"></i>
                      Password
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text className="login-input-icon">
                        <i className="bx bx-lock"></i>
                      </InputGroup.Text>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleInputChange}
                        className="login-input"
                        disabled={emailLoading || isLoading}
                        required
                      />
                      <Button
                        variant="outline-secondary"
                        onClick={() => setShowPassword(!showPassword)}
                        className="password-toggle-btn"
                        disabled={emailLoading || isLoading}
                      >
                        {showPassword ? 
                          <i className="bx bx-hide"></i> : 
                          <i className="bx bx-show"></i>
                        }
                      </Button>
                    </InputGroup>
                  </Form.Group>

                  <div className="d-grid mb-3">
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={emailLoading || isLoading}
                      className="email-login-btn"
                    >
                      {emailLoading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Signing in...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-log-in me-2"></i>
                          Sign In
                        </>
                      )}
                    </Button>
                  </div>
                </Form>

                {/* Divider */}
                <div className="login-divider mb-3">
                  <hr />
                  <span>Or continue with</span>
                  <hr />
                </div>

                {/* Google Login */}
                <div className="d-grid gap-3">
                  <Button
                    variant="outline-danger"
                    size="lg"
                    onClick={handleGoogleLogin}
                    disabled={isLoading || emailLoading}
                    className="google-login-btn"
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Signing in...
                      </>
                    ) : (
                      <>
                        <i className="bx bxl-google me-2" style={{fontSize: '20px'}}></i>
                        Continue with Google
                      </>
                    )}
                  </Button>
                </div>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    Secure authentication powered by Firebase
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default LoginPage;
