// src/components/forms/AddVehicleForm.jsx
import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useDashboard } from '../../context/DashboardContext';

const AddVehicleForm = ({ show, onHide }) => {
  const { actions, loading } = useDashboard();
  const [formData, setFormData] = useState({
    id: '',
    type: 'truck',
    model: '',
    year: '',
    capacity: '',
    status: 'available',
    driver: '',
    location: 'Mumbai',
    fuel: 100,
    registrationNumber: '',
    insuranceExpiry: '',
    lastMaintenance: '',
    nextMaintenance: '',
    fuelType: 'diesel',
    mileage: '',
    purchaseDate: '',
    purchasePrice: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const vehicleTypes = [
    { value: 'truck', label: '🚛 Truck' },
    { value: 'van', label: '🚐 Van' },
    { value: 'pickup', label: '🛻 Pickup' },
    { value: 'trailer', label: '🚚 Trailer' },
    { value: 'bus', label: '🚌 Bus' },
    { value: 'car', label: '🚗 Car' }
  ];

  const locations = [
    'Mumbai', 'Pune', 'Nashik', 'Aurangabad', 'Kolhapur', 'Solapur', 
    'Nagpur', 'Thane', 'Navi Mumbai', 'Panvel'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Required fields
    if (!formData.id.trim()) {
      newErrors.id = 'Vehicle ID is required';
    }
    if (!formData.model.trim()) {
      newErrors.model = 'Vehicle model is required';
    }
    if (!formData.year) {
      newErrors.year = 'Manufacturing year is required';
    } else if (formData.year < 1990 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = 'Please enter a valid year';
    }
    if (!formData.capacity) {
      newErrors.capacity = 'Capacity is required';
    }
    if (!formData.driver.trim()) {
      newErrors.driver = 'Driver name is required';
    }
    if (!formData.registrationNumber.trim()) {
      newErrors.registrationNumber = 'Registration number is required';
    }

    // Validation for dates
    if (formData.insuranceExpiry && new Date(formData.insuranceExpiry) < new Date()) {
      newErrors.insuranceExpiry = 'Insurance expiry date cannot be in the past';
    }

    // Validation for fuel level
    if (formData.fuel < 0 || formData.fuel > 100) {
      newErrors.fuel = 'Fuel level must be between 0 and 100';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setSubmitStatus({ type: '', message: '' });

    try {
      const vehicleData = {
        ...formData,
        year: parseInt(formData.year),
        capacity: parseFloat(formData.capacity),
        fuel: parseInt(formData.fuel),
        mileage: formData.mileage ? parseFloat(formData.mileage) : 0,
        purchasePrice: formData.purchasePrice ? parseFloat(formData.purchasePrice) : 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await actions.addVehicle(vehicleData);

      if (result.success) {
        setSubmitStatus({ 
          type: 'success', 
          message: `Vehicle ${formData.id} added successfully!` 
        });
        
        // Reset form after successful submission
        setTimeout(() => {
          handleReset();
          onHide();
        }, 1500);
      } else {
        setSubmitStatus({ 
          type: 'error', 
          message: result.error || 'Failed to add vehicle' 
        });
      }
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'An error occurred while adding the vehicle' 
      });
    }
  };

  const handleReset = () => {
    setFormData({
      id: '',
      type: 'truck',
      model: '',
      year: '',
      capacity: '',
      status: 'available',
      driver: '',
      location: 'Mumbai',
      fuel: 100,
      registrationNumber: '',
      insuranceExpiry: '',
      lastMaintenance: '',
      nextMaintenance: '',
      fuelType: 'diesel',
      mileage: '',
      purchaseDate: '',
      purchasePrice: '',
      notes: ''
    });
    setErrors({});
    setSubmitStatus({ type: '', message: '' });
  };

  const generateVehicleId = () => {
    const prefix = formData.type.toUpperCase().substring(0, 2);
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${timestamp}${randomNum}`;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>🚛 Add New Vehicle</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {submitStatus.message && (
          <Alert variant={submitStatus.type === 'success' ? 'success' : 'danger'}>
            {submitStatus.message}
          </Alert>
        )}

        <Form onSubmit={handleSubmit}>
          <Row>
            {/* Basic Information */}
            <Col md={6}>
              <h6 className="mb-3">🔧 Basic Information</h6>
              
              <Form.Group className="mb-3">
                <Form.Label>Vehicle ID *</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    placeholder="e.g., MH12AB1234"
                    isInvalid={!!errors.id}
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setFormData(prev => ({ ...prev, id: generateVehicleId() }))}
                    className="ms-2"
                  >
                    🎲
                  </Button>
                </div>
                <Form.Control.Feedback type="invalid">
                  {errors.id}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Vehicle Type *</Form.Label>
                <Form.Select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                >
                  {vehicleTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Model *</Form.Label>
                <Form.Control
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleInputChange}
                  placeholder="e.g., Tata 407, Mahindra Bolero"
                  isInvalid={!!errors.model}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.model}
                </Form.Control.Feedback>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Year *</Form.Label>
                    <Form.Control
                      type="number"
                      name="year"
                      value={formData.year}
                      onChange={handleInputChange}
                      min="1990"
                      max={new Date().getFullYear() + 1}
                      isInvalid={!!errors.year}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.year}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Capacity (tons) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleInputChange}
                      step="0.5"
                      min="0.5"
                      placeholder="e.g., 5.0"
                      isInvalid={!!errors.capacity}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.capacity}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Registration Number *</Form.Label>
                <Form.Control
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleInputChange}
                  placeholder="e.g., MH 12 AB 1234"
                  isInvalid={!!errors.registrationNumber}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.registrationNumber}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            {/* Operational Information */}
            <Col md={6}>
              <h6 className="mb-3">🚗 Operational Information</h6>
              
              <Form.Group className="mb-3">
                <Form.Label>Status</Form.Label>
                <Form.Select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                >
                  <option value="available">🟢 Available</option>
                  <option value="active">🔵 Active</option>
                  <option value="maintenance">🟡 Maintenance</option>
                  <option value="out-of-service">🔴 Out of Service</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Assigned Driver *</Form.Label>
                <Form.Control
                  type="text"
                  name="driver"
                  value={formData.driver}
                  onChange={handleInputChange}
                  placeholder="e.g., Rajesh Kumar"
                  isInvalid={!!errors.driver}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.driver}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Current Location</Form.Label>
                <Form.Select
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                >
                  {locations.map(location => (
                    <option key={location} value={location}>
                      📍 {location}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fuel Level (%)</Form.Label>
                    <Form.Control
                      type="number"
                      name="fuel"
                      value={formData.fuel}
                      onChange={handleInputChange}
                      min="0"
                      max="100"
                      isInvalid={!!errors.fuel}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.fuel}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fuel Type</Form.Label>
                    <Form.Select
                      name="fuelType"
                      value={formData.fuelType}
                      onChange={handleInputChange}
                    >
                      <option value="diesel">⛽ Diesel</option>
                      <option value="petrol">⛽ Petrol</option>
                      <option value="cng">🔋 CNG</option>
                      <option value="electric">🔌 Electric</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Insurance Expiry</Form.Label>
                <Form.Control
                  type="date"
                  name="insuranceExpiry"
                  value={formData.insuranceExpiry}
                  onChange={handleInputChange}
                  isInvalid={!!errors.insuranceExpiry}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.insuranceExpiry}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          {/* Additional Information */}
          <Row>
            <Col>
              <h6 className="mb-3">📋 Additional Information</h6>
              
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Mileage (km/l)</Form.Label>
                    <Form.Control
                      type="number"
                      name="mileage"
                      value={formData.mileage}
                      onChange={handleInputChange}
                      step="0.1"
                      placeholder="e.g., 12.5"
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Purchase Date</Form.Label>
                    <Form.Control
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleInputChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>Purchase Price (₹)</Form.Label>
                    <Form.Control
                      type="number"
                      name="purchasePrice"
                      value={formData.purchasePrice}
                      onChange={handleInputChange}
                      placeholder="e.g., 1500000"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Notes</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder="Any additional notes about the vehicle..."
                />
              </Form.Group>
            </Col>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="outline-secondary" onClick={handleReset}>
          🔄 Reset
        </Button>
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button 
          variant="primary" 
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Adding...
            </>
          ) : (
            '✅ Add Vehicle'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddVehicleForm;
