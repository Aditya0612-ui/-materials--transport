import React, { useState, useEffect } from 'react';
import { Form, Button, Alert, Row, Col, Modal, InputGroup, Spinner, Nav } from 'react-bootstrap';
import smsService from '../../services/smsService';
import './VerificationSystem.css';

const VerificationSystem = ({ show, onHide, onVerificationComplete }) => {
  // Verification type state
  const [verificationType, setVerificationType] = useState('phone');

  // Bill verification states
  const [billNumber, setBillNumber] = useState('');
  const [billAmount, setBillAmount] = useState('');

  // Phone OTP states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpTimer, setOtpTimer] = useState(0);

  // Common states
  const [isLoading, setIsLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });

  const showAlert = (message, type = 'info') => {
    setAlert({ show: true, message, type });
    setTimeout(() => setAlert({ show: false, message: '', type: '' }), 5000);
  };

  // OTP Timer Effect
  useEffect(() => {
    let interval = null;
    if (otpTimer > 0) {
      interval = setInterval(() => {
        setOtpTimer(timer => timer - 1);
      }, 1000);
    } else if (otpTimer === 0) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  // Send OTP function
  const sendOtp = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      showAlert('Please enter a valid 10-digit phone number', 'danger');
      return;
    }

    if (!smsService.validatePhoneNumber(phoneNumber)) {
      showAlert('Please enter a valid Indian mobile number', 'danger');
      return;
    }

    setIsLoading(true);

    try {
      // Generate OTP using SMS service
      const newOtp = smsService.generateOTP(6);
      setGeneratedOtp(newOtp);

      // Send OTP via SMS service
      const result = await smsService.sendOTP(phoneNumber, newOtp);

      if (result.success) {
        showAlert(
          `OTP sent successfully to ${smsService.formatPhoneNumber(phoneNumber)}! ${result.otp ? `Demo OTP: ${result.otp}` : ''
          }`,
          'success'
        );

        setIsOtpSent(true);
        setOtpTimer(120); // 2 minutes timer
      } else {
        showAlert(`Failed to send OTP: ${result.error}`, 'danger');
      }
    } catch (error) {
      console.error('Error sending OTP:', error);
      showAlert('Failed to send OTP. Please try again.', 'danger');
    } finally {
      setIsLoading(false);
    }
  };

  // Verify OTP function
  const verifyOtp = () => {
    if (!otp || otp.length !== 6) {
      showAlert('Please enter a valid 6-digit OTP', 'danger');
      return;
    }

    if (otp !== generatedOtp) {
      showAlert('Invalid OTP. Please check and try again.', 'danger');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showAlert('✅ Phone verification successful!', 'success');
      setTimeout(() => {
        onVerificationComplete('2fa_phone');
        onHide();
        resetForm();
      }, 1000);
    }, 1500);
  };

  const handleBillVerification = () => {
    if (!billNumber || !billAmount) {
      showAlert('Please enter both bill number and amount', 'danger');
      return;
    }

    if (billAmount < 1) {
      showAlert('Please enter a valid bill amount', 'danger');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      showAlert('✅ Bill verification successful!', 'success');
      setTimeout(() => {
        onVerificationComplete('2fa_bill');
        onHide();
        resetForm();
      }, 1000);
    }, 1500);
  };

  const resetForm = () => {
    // Reset bill verification
    setBillNumber('');
    setBillAmount('');

    // Reset phone OTP verification
    setPhoneNumber('');
    setOtp('');
    setGeneratedOtp('');
    setIsOtpSent(false);
    setOtpTimer(0);

    // Reset common states
    setAlert({ show: false, message: '', type: '' });
    setIsLoading(false);
  };

  return (
    <Modal show={show} onHide={onHide} centered size="md" onExited={resetForm} className="verification-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="bx bx-shield-check me-2"></i>
          Two-Factor Authentication
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {alert.show && (
          <Alert variant={alert.type} className="mb-3">
            {alert.message}
          </Alert>
        )}

        {/* Verification Type Selector */}
        <Nav variant="pills" className="mb-4 verification-nav">
          <Nav.Item>
            <Nav.Link
              active={verificationType === 'phone'}
              onClick={() => setVerificationType('phone')}
              className="verification-tab"
            >
              <i className="bx bx-phone me-2"></i>
              Phone OTP
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              active={verificationType === 'bill'}
              onClick={() => setVerificationType('bill')}
              className="verification-tab"
            >
              <i className="bx bx-receipt me-2"></i>
              Bill Verification
            </Nav.Link>
          </Nav.Item>
        </Nav>

        <Form>
          {verificationType === 'phone' && (
            <div className="phone-verification">
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="bx bx-phone me-2"></i>
                      Phone Number
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text>+91</InputGroup.Text>
                      <Form.Control
                        type="tel"
                        placeholder="Enter 10-digit phone number"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        disabled={isOtpSent}
                        maxLength={10}
                        style={{ height: '48px', fontSize: '15px' }}
                      />
                    </InputGroup>
                  </Form.Group>

                  {!isOtpSent ? (
                    <Button
                      variant="success"
                      onClick={sendOtp}
                      disabled={isLoading || phoneNumber.length !== 10}
                      className="w-100 mb-3"
                    >
                      {isLoading ? (
                        <>
                          <Spinner size="sm" className="me-2" />
                          Sending OTP...
                        </>
                      ) : (
                        <>
                          <i className="bx bx-message-dots me-2"></i>
                          Send OTP
                        </>
                      )}
                    </Button>
                  ) : (
                    <>
                      <Form.Group className="mb-3">
                        <Form.Label>
                          <i className="bx bx-key me-2"></i>
                          Enter OTP
                          {otpTimer > 0 && (
                            <span className="text-muted ms-2">
                              ({Math.floor(otpTimer / 60)}:{(otpTimer % 60).toString().padStart(2, '0')})
                            </span>
                          )}
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="Enter 6-digit OTP"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          maxLength={6}
                          className="text-center otp-input"
                          style={{ height: '48px', fontSize: '15px', letterSpacing: '0.5em' }}
                        />
                      </Form.Group>

                      <Row className="g-2">
                        <Col>
                          <Button
                            variant="primary"
                            onClick={verifyOtp}
                            disabled={isLoading || otp.length !== 6}
                            className="w-100"
                          >
                            {isLoading ? (
                              <>
                                <Spinner size="sm" className="me-2" />
                                Verifying...
                              </>
                            ) : (
                              <>
                                <i className="bx bx-check-circle me-2"></i>
                                Verify OTP
                              </>
                            )}
                          </Button>
                        </Col>
                        <Col xs="auto">
                          <Button
                            variant="outline-secondary"
                            onClick={() => {
                              setIsOtpSent(false);
                              setOtp('');
                              setOtpTimer(0);
                            }}
                            disabled={isLoading}
                          >
                            <i className="bx bx-refresh"></i>
                          </Button>
                        </Col>
                      </Row>

                      {otpTimer === 0 && (
                        <div className="text-center mt-3">
                          <Button
                            variant="link"
                            onClick={sendOtp}
                            disabled={isLoading}
                            className="p-0"
                          >
                            Resend OTP
                          </Button>
                        </div>
                      )}
                    </>
                  )}
                </Col>
              </Row>
            </div>
          )}

          {verificationType === 'bill' && (
            <div className="bill-verification">
              <Row>
                <Col>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="bx bx-receipt me-2"></i>
                      Bill Number
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter bill number"
                      value={billNumber}
                      onChange={(e) => setBillNumber(e.target.value)}
                      style={{ height: '48px', fontSize: '15px' }}
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>
                      <i className="bx bx-rupee me-2"></i>
                      Bill Amount
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text>₹</InputGroup.Text>
                      <Form.Control
                        type="number"
                        placeholder="Enter bill amount"
                        value={billAmount}
                        onChange={(e) => setBillAmount(e.target.value)}
                        style={{ height: '48px', fontSize: '15px' }}
                      />
                    </InputGroup>
                  </Form.Group>
                  <Button
                    variant="primary"
                    onClick={handleBillVerification}
                    disabled={isLoading || !billNumber || !billAmount}
                    className="w-100"
                  >
                    {isLoading ? (
                      <>
                        <Spinner size="sm" className="me-2" />
                        Verifying Bill...
                      </>
                    ) : (
                      <>
                        <i className="bx bx-check-circle me-2"></i>
                        Verify Bill
                      </>
                    )}
                  </Button>
                </Col>
              </Row>
            </div>
          )}
        </Form>

      </Modal.Body>
    </Modal>
  );
};

export default VerificationSystem;
