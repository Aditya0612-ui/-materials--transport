// src/components/forms/AddFuelRecordForm.jsx
import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { useDashboard } from '../../context/DashboardContext';

const AddFuelRecordForm = ({ show, onHide }) => {
  const { actions, loading, vehicles } = useDashboard();
  const [formData, setFormData] = useState({
    id: '',
    vehicleId: '',
    driverName: '',
    fuelType: 'diesel',
    quantity: '',
    pricePerLiter: '',
    totalAmount: '',
    fuelStationName: '',
    fuelStationLocation: '',
    odometer: '',
    date: new Date().toISOString().split('T')[0],
    time: new Date().toTimeString().split(' ')[0].substring(0, 5),
    paymentMethod: 'cash',
    billNumber: '',
    notes: '',
    efficiency: '',
    previousOdometer: ''
  });
  const [errors, setErrors] = useState({});
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  const fuelTypes = [
    { value: 'diesel', label: '⛽ Diesel' },
    { value: 'petrol', label: '⛽ Petrol' },
    { value: 'cng', label: '🔋 CNG' },
    { value: 'electric', label: '🔌 Electric' }
  ];

  const paymentMethods = [
    { value: 'cash', label: '💵 Cash' },
    { value: 'card', label: '💳 Card' },
    { value: 'upi', label: '📱 UPI' },
    { value: 'credit', label: '🏦 Credit' },
    { value: 'fuel_card', label: '⛽ Fuel Card' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-calculate total amount
      if (name === 'quantity' || name === 'pricePerLiter') {
        const quantity = parseFloat(name === 'quantity' ? value : prev.quantity) || 0;
        const price = parseFloat(name === 'pricePerLiter' ? value : prev.pricePerLiter) || 0;
        newData.totalAmount = (quantity * price).toFixed(2);
      }
      
      // Auto-calculate fuel efficiency
      if (name === 'odometer' || name === 'previousOdometer' || name === 'quantity') {
        const currentOdo = parseFloat(name === 'odometer' ? value : prev.odometer) || 0;
        const prevOdo = parseFloat(name === 'previousOdometer' ? value : prev.previousOdometer) || 0;
        const fuelQty = parseFloat(name === 'quantity' ? value : prev.quantity) || 0;
        
        if (currentOdo > prevOdo && fuelQty > 0) {
          const distance = currentOdo - prevOdo;
          newData.efficiency = (distance / fuelQty).toFixed(2);
        }
      }
      
      // Auto-fill driver name when vehicle is selected
      if (name === 'vehicleId') {
        const selectedVehicle = vehicles.find(v => v.id === value);
        if (selectedVehicle) {
          newData.driverName = selectedVehicle.driver;
        }
      }
      
      return newData;
    });
    
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
      newErrors.id = 'Fuel record ID is required';
    }
    if (!formData.vehicleId) {
      newErrors.vehicleId = 'Vehicle selection is required';
    }
    if (!formData.quantity) {
      newErrors.quantity = 'Fuel quantity is required';
    } else if (parseFloat(formData.quantity) <= 0) {
      newErrors.quantity = 'Quantity must be greater than 0';
    }
    if (!formData.pricePerLiter) {
      newErrors.pricePerLiter = 'Price per liter is required';
    } else if (parseFloat(formData.pricePerLiter) <= 0) {
      newErrors.pricePerLiter = 'Price must be greater than 0';
    }
    if (!formData.fuelStationName.trim()) {
      newErrors.fuelStationName = 'Fuel station name is required';
    }
    if (!formData.odometer) {
      newErrors.odometer = 'Odometer reading is required';
    }
    if (!formData.date) {
      newErrors.date = 'Date is required';
    }
    if (!formData.time) {
      newErrors.time = 'Time is required';
    }

    // Validation for odometer readings
    if (formData.previousOdometer && formData.odometer) {
      if (parseFloat(formData.odometer) <= parseFloat(formData.previousOdometer)) {
        newErrors.odometer = 'Current odometer must be greater than previous reading';
      }
    }

    // Date validation
    if (formData.date && new Date(formData.date) > new Date()) {
      newErrors.date = 'Date cannot be in the future';
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
      const fuelRecordData = {
        ...formData,
        quantity: parseFloat(formData.quantity),
        pricePerLiter: parseFloat(formData.pricePerLiter),
        totalAmount: parseFloat(formData.totalAmount),
        odometer: parseFloat(formData.odometer),
        previousOdometer: formData.previousOdometer ? parseFloat(formData.previousOdometer) : null,
        efficiency: formData.efficiency ? parseFloat(formData.efficiency) : null,
        datetime: `${formData.date}T${formData.time}:00`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await actions.addFuelRecord(fuelRecordData);

      if (result.success) {
        setSubmitStatus({ 
          type: 'success', 
          message: `Fuel record ${formData.id} added successfully!` 
        });
        
        // Reset form after successful submission
        setTimeout(() => {
          handleReset();
          onHide();
        }, 1500);
      } else {
        setSubmitStatus({ 
          type: 'error', 
          message: result.error || 'Failed to add fuel record' 
        });
      }
    } catch (error) {
      setSubmitStatus({ 
        type: 'error', 
        message: 'An error occurred while adding the fuel record' 
      });
    }
  };

  const handleReset = () => {
    setFormData({
      id: '',
      vehicleId: '',
      driverName: '',
      fuelType: 'diesel',
      quantity: '',
      pricePerLiter: '',
      totalAmount: '',
      fuelStationName: '',
      fuelStationLocation: '',
      odometer: '',
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0].substring(0, 5),
      paymentMethod: 'cash',
      billNumber: '',
      notes: '',
      efficiency: '',
      previousOdometer: ''
    });
    setErrors({});
    setSubmitStatus({ type: '', message: '' });
  };

  const generateFuelRecordId = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const day = today.getDate().toString().padStart(2, '0');
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `FUEL-${year}${month}${day}-${randomNum}`;
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>⛽ Add Fuel Record</Modal.Title>
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
              <h6 className="mb-3">📋 Basic Information</h6>
              
              <Form.Group className="mb-3">
                <Form.Label>Fuel Record ID *</Form.Label>
                <div className="d-flex">
                  <Form.Control
                    type="text"
                    name="id"
                    value={formData.id}
                    onChange={handleInputChange}
                    placeholder="e.g., FUEL-2024-001"
                    isInvalid={!!errors.id}
                  />
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setFormData(prev => ({ ...prev, id: generateFuelRecordId() }))}
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
                <Form.Label>Vehicle *</Form.Label>
                <Form.Select
                  name="vehicleId"
                  value={formData.vehicleId}
                  onChange={handleInputChange}
                  isInvalid={!!errors.vehicleId}
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map(vehicle => (
                    <option key={vehicle.id} value={vehicle.id}>
                      🚛 {vehicle.id} - {vehicle.driver} ({vehicle.location})
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {errors.vehicleId}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Driver Name</Form.Label>
                <Form.Control
                  type="text"
                  name="driverName"
                  value={formData.driverName}
                  onChange={handleInputChange}
                  placeholder="Auto-filled from vehicle"
                  readOnly
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date *</Form.Label>
                    <Form.Control
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      isInvalid={!!errors.date}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.date}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Time *</Form.Label>
                    <Form.Control
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      isInvalid={!!errors.time}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.time}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Fuel Type</Form.Label>
                <Form.Select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                >
                  {fuelTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Fuel Details */}
            <Col md={6}>
              <h6 className="mb-3">⛽ Fuel Details</h6>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantity (Liters) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      step="0.01"
                      placeholder="e.g., 50.00"
                      isInvalid={!!errors.quantity}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.quantity}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Price/Liter (₹) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="pricePerLiter"
                      value={formData.pricePerLiter}
                      onChange={handleInputChange}
                      step="0.01"
                      placeholder="e.g., 95.50"
                      isInvalid={!!errors.pricePerLiter}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.pricePerLiter}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Total Amount (₹)</Form.Label>
                <Form.Control
                  type="number"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleInputChange}
                  step="0.01"
                  placeholder="Auto-calculated"
                  readOnly
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fuel Station Name *</Form.Label>
                <Form.Control
                  type="text"
                  name="fuelStationName"
                  value={formData.fuelStationName}
                  onChange={handleInputChange}
                  placeholder="e.g., Indian Oil Petrol Pump"
                  isInvalid={!!errors.fuelStationName}
                />
                <Form.Control.Feedback type="invalid">
                  {errors.fuelStationName}
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Station Location</Form.Label>
                <Form.Control
                  type="text"
                  name="fuelStationLocation"
                  value={formData.fuelStationLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., Mumbai-Pune Highway"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Payment Method</Form.Label>
                    <Form.Select
                      name="paymentMethod"
                      value={formData.paymentMethod}
                      onChange={handleInputChange}
                    >
                      {paymentMethods.map(method => (
                        <option key={method.value} value={method.value}>
                          {method.label}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Bill Number</Form.Label>
                    <Form.Control
                      type="text"
                      name="billNumber"
                      value={formData.billNumber}
                      onChange={handleInputChange}
                      placeholder="e.g., INV-001234"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Col>
          </Row>

          {/* Odometer & Efficiency */}
          <Row>
            <Col>
              <h6 className="mb-3">📊 Odometer & Efficiency</h6>
              
              <Row>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Current Odometer (km) *</Form.Label>
                    <Form.Control
                      type="number"
                      name="odometer"
                      value={formData.odometer}
                      onChange={handleInputChange}
                      placeholder="e.g., 45000"
                      isInvalid={!!errors.odometer}
                    />
                    <Form.Control.Feedback type="invalid">
                      {errors.odometer}
                    </Form.Control.Feedback>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Previous Odometer (km)</Form.Label>
                    <Form.Control
                      type="number"
                      name="previousOdometer"
                      value={formData.previousOdometer}
                      onChange={handleInputChange}
                      placeholder="e.g., 44500"
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fuel Efficiency (km/l)</Form.Label>
                    <Form.Control
                      type="number"
                      name="efficiency"
                      value={formData.efficiency}
                      onChange={handleInputChange}
                      step="0.01"
                      placeholder="Auto-calculated"
                      readOnly
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group className="mb-3">
                    <Form.Label>Distance Covered (km)</Form.Label>
                    <Form.Control
                      type="text"
                      value={formData.odometer && formData.previousOdometer ? 
                        (parseFloat(formData.odometer) - parseFloat(formData.previousOdometer)).toFixed(0) : ''}
                      placeholder="Auto-calculated"
                      readOnly
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
                  placeholder="Any additional notes about the fuel purchase..."
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
            '✅ Add Fuel Record'
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default AddFuelRecordForm;
