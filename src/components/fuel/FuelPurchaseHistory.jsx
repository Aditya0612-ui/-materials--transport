import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Badge, Modal, InputGroup, Container, Alert, Spinner, OverlayTrigger, Popover } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { exportToExcel } from '../../utils/excelExport';
import firebaseService from '../../services/firebaseService';
import 'boxicons/css/boxicons.min.css';
import './FuelStyles.css';

const FuelPurchaseHistory = () => {
  const { t } = useTranslation();
  const [fuelData, setFuelData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    fuelType: 'all',
    vehicleNumber: ''
  });
  const [newPurchase, setNewPurchase] = useState({
    date: '',
    vehicleNumber: '',
    fuelType: 'petrol',
    quantity: '',
    pricePerLiter: '',
    totalAmount: '',
    pumpName: '',
    billNumber: ''
  });
  const [showCustomPumpInput, setShowCustomPumpInput] = useState(false);
  const [customPumpName, setCustomPumpName] = useState('');
  const [showEditCustomPumpInput, setShowEditCustomPumpInput] = useState(false);
  const [editCustomPumpName, setEditCustomPumpName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Subscribe to Firebase fuel purchases
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToFuelPurchases((purchases) => {
      setFuelData(purchases);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Filter data based on filters
  useEffect(() => {
    let filtered = fuelData;

    if (filters.dateFrom) {
      filtered = filtered.filter(item => item.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(item => item.date <= filters.dateTo);
    }
    if (filters.fuelType !== 'all') {
      filtered = filtered.filter(item => item.fuelType.toLowerCase() === filters.fuelType);
    }
    if (filters.vehicleNumber) {
      filtered = filtered.filter(item => 
        item.vehicleNumber.toLowerCase().includes(filters.vehicleNumber.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [filters, fuelData]);

  const handleAddPurchase = async () => {
    if (!newPurchase.date || !newPurchase.vehicleNumber || !newPurchase.quantity || !newPurchase.pricePerLiter) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    const totalAmount = parseFloat(newPurchase.quantity) * parseFloat(newPurchase.pricePerLiter);
    
    const purchase = {
      ...newPurchase,
      quantity: parseFloat(newPurchase.quantity),
      pricePerLiter: parseFloat(newPurchase.pricePerLiter),
      totalAmount: totalAmount,
      status: 'completed'
    };

    try {
      const result = await firebaseService.addFuelPurchase(purchase);
      if (result.success) {
        setNewPurchase({
          date: '',
          vehicleNumber: '',
          fuelType: 'petrol',
          quantity: '',
          pricePerLiter: '',
          totalAmount: '',
          pumpName: '',
          billNumber: ''
        });
        setShowCustomPumpInput(false);
        setCustomPumpName('');
        setShowAddModal(false);
      } else {
        setError('Failed to add fuel purchase');
      }
    } catch (err) {
      console.error('Error adding fuel purchase:', err);
      setError('Error adding fuel purchase');
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing purchase details
  const handleViewPurchase = (purchase) => {
    setSelectedPurchase(purchase);
    setShowViewModal(true);
  };

  // Handle editing purchase
  const handleEditPurchase = (purchase) => {
    setEditingPurchase({ ...purchase });
    setShowEditModal(true);
  };

  // Handle saving edited purchase
  const handleSaveEdit = async () => {
    if (!editingPurchase.date || !editingPurchase.vehicleNumber || !editingPurchase.quantity || !editingPurchase.pricePerLiter) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    const totalAmount = parseFloat(editingPurchase.quantity) * parseFloat(editingPurchase.pricePerLiter);
    const updatedPurchase = {
      ...editingPurchase,
      quantity: parseFloat(editingPurchase.quantity),
      pricePerLiter: parseFloat(editingPurchase.pricePerLiter),
      totalAmount: totalAmount
    };

    try {
      const result = await firebaseService.updateFuelPurchase(editingPurchase.id, updatedPurchase);
      if (result.success) {
        setShowEditModal(false);
        setEditingPurchase(null);
        setShowEditCustomPumpInput(false);
        setEditCustomPumpName('');
      } else {
        setError('Failed to update fuel purchase');
      }
    } catch (err) {
      console.error('Error updating fuel purchase:', err);
      setError('Error updating fuel purchase');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting purchase
  const handleDeletePurchase = async (purchaseId) => {
    if (window.confirm('Are you sure you want to delete this fuel purchase record?')) {
      setLoading(true);
      setError(null);

      try {
        const result = await firebaseService.deleteFuelPurchase(purchaseId);
        if (!result.success) {
          setError('Failed to delete fuel purchase');
        }
      } catch (err) {
        console.error('Error deleting fuel purchase:', err);
        setError('Error deleting fuel purchase');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    return (
      <Badge bg={status === 'completed' ? 'success' : 'warning'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  // Handle export to Excel
  const handleExport = () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    const columns = [
      { key: 'date', header: 'Date' },
      { key: 'vehicleNumber', header: 'Vehicle Number' },
      { key: 'fuelType', header: 'Fuel Type' },
      { key: 'quantity', header: 'Quantity (L)' },
      { key: 'pricePerLiter', header: 'Price per Liter (₹)' },
      { key: 'totalAmount', header: 'Total Amount (₹)', formatter: (val) => val.toFixed(2) },
      { key: 'pumpName', header: 'Pump Name' },
      { key: 'billNumber', header: 'Bill Number' },
      { key: 'status', header: 'Status' }
    ];

    exportToExcel(filteredData, 'Fuel_Purchase_History', 'Fuel Purchases', columns);
  };

  // Create popover content for fuel purchase details
  const createPurchasePopover = (purchase) => (
    <Popover id={`popover-${purchase.id}`} style={{ maxWidth: '350px' }}>
      <Popover.Header as="h3">
        <div className="d-flex justify-content-between align-items-center">
          <span>Purchase Details</span>
          {getStatusBadge(purchase.status)}
        </div>
      </Popover.Header>
      <Popover.Body>
        <div className="mb-2">
          <strong>Purchase ID:</strong> {purchase.id}
        </div>
        <div className="mb-2">
          <strong>Vehicle:</strong> {purchase.vehicleNumber}
        </div>
        <div className="mb-2">
          <strong>Date:</strong>
          <div><small className="text-muted"><i className="bx bx-calendar me-1"></i>{new Date(purchase.date).toLocaleDateString('en-IN')}</small></div>
        </div>
        <div className="mb-2">
          <strong>Fuel Type:</strong> 
          <Badge 
            bg={purchase.fuelType === 'Diesel' ? 'warning' : purchase.fuelType === 'Petrol' ? 'danger' : 'info'} 
            className="ms-1"
          >
            {purchase.fuelType}
          </Badge>
        </div>
        <div className="mb-2">
          <strong>Quantity:</strong> {purchase.quantity} Liters
        </div>
        <div className="mb-2">
          <strong>Rate:</strong> ₹{purchase.pricePerLiter}/L
        </div>
        <div className="mb-2">
          <strong>Total Amount:</strong> <span className="text-success fw-bold">₹{purchase.totalAmount.toFixed(2)}</span>
        </div>
        <div className="mb-2">
          <strong>Pump:</strong> {purchase.pumpName}
        </div>
        <div className="mb-0">
          <strong>Bill No:</strong> {purchase.billNumber}
        </div>
      </Popover.Body>
    </Popover>
  );

  return (
    <Container fluid className="fuel-purchase-history py-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="mb-1"><i className="bx bx-gas-pump me-2 text-primary"></i>{t('fuelPurchase.title')}</h2>
              <p className="text-muted mb-0">{t('fuelPurchase.subtitle')}</p>
            </div>
            <Button 
              variant="primary" 
              size="lg"
              onClick={() => setShowAddModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <i className="bx bx-plus"></i>
              {t('fuelPurchase.addButton')}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Filters Section */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h6 className="mb-0"><i className="bx bx-filter me-2"></i>{t('fuelPurchase.filtersSearch')}</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col lg={3} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="bx bx-calendar me-1 text-primary"></i>{t('fuelPurchase.fromDate')}
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="form-control-lg"
                    />
                  </Form.Group>
                </Col>
                <Col lg={3} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="bx bx-calendar me-1 text-primary"></i>{t('fuelPurchase.toDate')}
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.dateTo}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                      className="form-control-lg"
                    />
                  </Form.Group>
                </Col>
                <Col lg={3} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="bx bx-gas-pump me-1 text-primary"></i>{t('fuelPurchase.fuelType')}
                    </Form.Label>
                    <Form.Select
                      value={filters.fuelType}
                      onChange={(e) => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
                      className="form-control-lg"
                    >
                      <option value="all">{t('fuelPurchase.allTypes')}</option>
                      <option value="petrol">{t('fuelUse.petrol')}</option>
                      <option value="diesel">{t('fuelUse.diesel')}</option>
                      <option value="cng">{t('fuelUse.cng')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col lg={3} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="bx bx-car me-1 text-primary"></i>{t('fuelPurchase.vehicleNumber')}
                    </Form.Label>
                    <InputGroup size="lg">
                      <InputGroup.Text><i className="bx bx-search"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder={t('fuelPurchase.searchVehicle')}
                        value={filters.vehicleNumber}
                        onChange={(e) => setFilters(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
              </Row>
              
              {/* Clear Filters Button */}
              <Row className="mt-3">
                <Col>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setFilters({ dateFrom: '', dateTo: '', fuelType: 'all', vehicleNumber: '' })}
                    className="d-flex align-items-center gap-2"
                  >
                    <i className="bx bx-refresh"></i>
                    {t('fuelPurchase.clearFilters')}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Data Table */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0"><i className="bx bx-table me-2"></i>{t('fuelPurchase.purchaseRecords')} ({filteredData.length})</h6>
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" size="sm" onClick={handleExport}>
                    <i className="bx bx-export me-1"></i>{t('common.export')}
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0" style={{ minWidth: '900px' }}>
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '90px' }}><i className="bx bx-calendar me-1"></i>{t('fuelPurchase.date')}</th>
                      <th style={{ width: '110px' }}><i className="bx bx-car me-1"></i>{t('fuelPurchase.vehicle')}</th>
                      <th style={{ width: '80px' }}><i className="bx bx-gas-pump me-1"></i>{t('fuelPurchase.fuel')}</th>
                      <th style={{ width: '70px' }}><i className="bx bx-droplet me-1"></i>{t('fuelPurchase.qty')}</th>
                      <th style={{ width: '80px' }}><i className="bx bx-rupee me-1"></i>{t('fuelPurchase.pricePerL')}</th>
                      <th style={{ width: '90px' }}><i className="bx bx-calculator me-1"></i>{t('fuelPurchase.total')}</th>
                      <th style={{ width: '120px' }}><i className="bx bx-store me-1"></i>{t('fuelPurchase.pump')}</th>
                      <th style={{ width: '90px' }}><i className="bx bx-receipt me-1"></i>{t('fuelPurchase.billNo')}</th>
                      <th style={{ width: '80px' }}><i className="bx bx-check-circle me-1"></i>{t('fuelPurchase.status')}</th>
                      <th style={{ width: '80px' }}><i className="bx bx-cog me-1"></i>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map(item => (
                      <tr key={item.id} className="align-middle">
                        <td>
                          <small>{new Date(item.date).toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short'
                          })}</small>
                        </td>
                        <td>
                          <strong className="text-primary" style={{ fontSize: '0.85rem' }}>
                            {item.vehicleNumber}
                          </strong>
                        </td>
                        <td>
                          <Badge 
                            bg={item.fuelType === 'Diesel' ? 'warning' : item.fuelType === 'Petrol' ? 'danger' : 'info'}
                            className="px-2 py-1"
                            style={{ fontSize: '0.7rem' }}
                          >
                            {item.fuelType}
                          </Badge>
                        </td>
                        <td>
                          <span className="fw-semibold">{item.quantity}</span>
                          <small className="text-muted">L</small>
                        </td>
                        <td>
                          <small className="fw-semibold">₹{item.pricePerLiter}</small>
                        </td>
                        <td>
                          <small className="fw-bold text-success">₹{(item.totalAmount/1000).toFixed(1)}k</small>
                        </td>
                        <td>
                          <small className="text-truncate" style={{ maxWidth: '100px', display: 'block' }}>
                            {item.pumpName}
                          </small>
                        </td>
                        <td>
                          <code className="bg-light px-1 py-1 rounded" style={{ fontSize: '0.7rem' }}>
                            {item.billNumber}
                          </code>
                        </td>
                        <td>{getStatusBadge(item.status)}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline-info"
                              title="View Details"
                              style={{ padding: '0.25rem 0.4rem' }}
                              onClick={() => handleViewPurchase(item)}
                            >
                              <i className="bx bx-show" style={{ fontSize: '0.8rem' }}></i>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline-primary"
                              title="Edit"
                              style={{ padding: '0.25rem 0.4rem' }}
                              onClick={() => handleEditPurchase(item)}
                            >
                              <i className="bx bx-edit-alt" style={{ fontSize: '0.8rem' }}></i>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline-danger"
                              title="Delete"
                              style={{ padding: '0.25rem 0.4rem' }}
                              onClick={() => handleDeletePurchase(item.id)}
                            >
                              <i className="bx bx-trash" style={{ fontSize: '0.8rem' }}></i>
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
              
              {filteredData.length === 0 && (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bx bx-gas-pump" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                  </div>
                  <h5 className="text-muted">No Fuel Purchase Records Found</h5>
                  <p className="text-muted mb-3">No records match your current filter criteria.</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowAddModal(true)}
                    className="d-flex align-items-center gap-2 mx-auto"
                  >
                    <i className="bx bx-plus"></i>
                    Add First Purchase Record
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* Add Purchase Modal */}
      <Modal show={showAddModal} onHide={() => {
        setShowAddModal(false);
        setShowCustomPumpInput(false);
        setCustomPumpName('');
      }} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="d-flex align-items-center gap-2">
            <i className="bx bx-gas-pump"></i>
            {t('fuelPurchase.addNewFuelPurchase')}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bx bx-calendar me-1 text-primary"></i>{t('fuelPurchase.date')} *
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={newPurchase.date}
                    onChange={(e) => setNewPurchase(prev => ({ ...prev, date: e.target.value }))}
                    size="lg"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bx bx-car me-1 text-primary"></i>{t('fuelPurchase.vehicleNumber')} *
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., MH12AB1234"
                    value={newPurchase.vehicleNumber}
                    onChange={(e) => setNewPurchase(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                    size="lg"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bx bx-gas-pump me-1 text-primary"></i>{t('fuelPurchase.fuelType')} *
                  </Form.Label>
                  <Form.Select
                    value={newPurchase.fuelType}
                    onChange={(e) => setNewPurchase(prev => ({ ...prev, fuelType: e.target.value }))}
                    size="lg"
                  >
                    <option value="Petrol">{t('fuelUse.petrol')}</option>
                    <option value="Diesel">{t('fuelUse.diesel')}</option>
                    <option value="CNG">{t('fuelUse.cng')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bx bx-droplet me-1 text-primary"></i>{t('fuelUse.quantityLiters')} *
                  </Form.Label>
                  <Form.Control
                    type="number"
                    placeholder={t('fuelPurchase.enterQuantity')}
                    value={newPurchase.quantity}
                    onChange={(e) => setNewPurchase(prev => ({ ...prev, quantity: e.target.value }))}
                    size="lg"
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bx bx-rupee me-1 text-primary"></i>{t('fuelPurchase.pricePerLiter')} *
                  </Form.Label>
                  <InputGroup size="lg">
                    <InputGroup.Text>₹</InputGroup.Text>
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newPurchase.pricePerLiter}
                      onChange={(e) => setNewPurchase(prev => ({ ...prev, pricePerLiter: e.target.value }))}
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bx bx-calculator me-1 text-success"></i>{t('fuelPurchase.totalAmount')}
                  </Form.Label>
                  <InputGroup size="lg">
                    <InputGroup.Text>₹</InputGroup.Text>
                    <Form.Control
                      type="text"
                      value={newPurchase.quantity && newPurchase.pricePerLiter ? 
                        (parseFloat(newPurchase.quantity) * parseFloat(newPurchase.pricePerLiter)).toFixed(2) : '0.00'}
                      readOnly
                      className="bg-light fw-bold"
                    />
                  </InputGroup>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bx bx-store me-1 text-primary"></i>{t('fuelPurchase.pumpName')}
                  </Form.Label>
                  <Form.Select
                    value={showCustomPumpInput ? "Other" : newPurchase.pumpName}
                    onChange={(e) => {
                      if (e.target.value === "Other") {
                        setShowCustomPumpInput(true);
                        setCustomPumpName('');
                        setNewPurchase(prev => ({ ...prev, pumpName: '' }));
                      } else {
                        setShowCustomPumpInput(false);
                        setCustomPumpName('');
                        setNewPurchase(prev => ({ ...prev, pumpName: e.target.value }));
                      }
                    }}
                    size="lg"
                  >
                    <option value="">{t('fuelPurchase.selectPump')}</option>
                    <option value="Indian Oil">Indian Oil (IOCL)</option>
                    <option value="Bharat Petroleum">Bharat Petroleum (BPCL)</option>
                    <option value="Hindustan Petroleum">Hindustan Petroleum (HPCL)</option>
                    <option value="Reliance Petroleum">Reliance Petroleum</option>
                    <option value="Essar Oil">Essar Oil</option>
                    <option value="Shell India">Shell India</option>
                    <option value="Nayara Energy">Nayara Energy</option>
                    <option value="Jio-bp">Jio-bp</option>
                    <option value="Other">{t('fuelPurchase.otherCustom')}</option>
                  </Form.Select>
                  {showCustomPumpInput && (
                    <Form.Control
                      type="text"
                      placeholder={t('fuelPurchase.enterCustomPumpName')}
                      value={customPumpName}
                      onChange={(e) => {
                        setCustomPumpName(e.target.value);
                        setNewPurchase(prev => ({ ...prev, pumpName: e.target.value }));
                      }}
                      size="lg"
                      className="mt-2"
                    />
                  )}
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-semibold">
                    <i className="bx bx-receipt me-1 text-primary"></i>{t('fuelPurchase.billNumber')}
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('fuelPurchase.enterBillNumber')}
                    value={newPurchase.billNumber}
                    onChange={(e) => setNewPurchase(prev => ({ ...prev, billNumber: e.target.value }))}
                    size="lg"
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button 
            variant="outline-secondary" 
            onClick={() => {
              setShowAddModal(false);
              setShowCustomPumpInput(false);
              setCustomPumpName('');
            }}
            className="d-flex align-items-center gap-2"
            size="lg"
          >
            <i className="bx bx-x"></i>
            {t('common.cancel')}
          </Button>
          <Button 
            variant="primary" 
            onClick={handleAddPurchase}
            className="d-flex align-items-center gap-2"
            size="lg"
          >
            <i className="bx bx-plus"></i>
            {t('fuelPurchase.addPurchase')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Purchase Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title className="d-flex align-items-center gap-2">
            <i className="bx bx-show"></i>
            Purchase Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPurchase && (
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <strong>Date:</strong>
                  <p className="mb-1">{selectedPurchase.date}</p>
                </div>
                <div className="mb-3">
                  <strong>Vehicle Number:</strong>
                  <p className="mb-1">{selectedPurchase.vehicleNumber}</p>
                </div>
                <div className="mb-3">
                  <strong>Fuel Type:</strong>
                  <p className="mb-1">{selectedPurchase.fuelType}</p>
                </div>
                <div className="mb-3">
                  <strong>Quantity:</strong>
                  <p className="mb-1">{selectedPurchase.quantity} L</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <strong>Price per Liter:</strong>
                  <p className="mb-1">₹{selectedPurchase.pricePerLiter}</p>
                </div>
                <div className="mb-3">
                  <strong>Total Amount:</strong>
                  <p className="mb-1 text-success fw-bold">₹{selectedPurchase.totalAmount}</p>
                </div>
                <div className="mb-3">
                  <strong>Pump Name:</strong>
                  <p className="mb-1">{selectedPurchase.pumpName}</p>
                </div>
                <div className="mb-3">
                  <strong>Bill Number:</strong>
                  <p className="mb-1">{selectedPurchase.billNumber}</p>
                </div>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Purchase Modal */}
      <Modal show={showEditModal} onHide={() => {
        setShowEditModal(false);
        setShowEditCustomPumpInput(false);
        setEditCustomPumpName('');
      }} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="d-flex align-items-center gap-2">
            <i className="bx bx-edit-alt"></i>
            Edit Fuel Purchase
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingPurchase && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><i className="bx bx-calendar me-1"></i>Date *</Form.Label>
                    <Form.Control
                      type="date"
                      value={editingPurchase.date}
                      onChange={(e) => setEditingPurchase({...editingPurchase, date: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><i className="bx bx-car me-1"></i>Vehicle Number *</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="e.g., MH12AB1234"
                      value={editingPurchase.vehicleNumber}
                      onChange={(e) => setEditingPurchase({...editingPurchase, vehicleNumber: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><i className="bx bx-droplet me-1"></i>{t('fuelPurchase.fuelType')}</Form.Label>
                    <Form.Select
                      value={editingPurchase.fuelType}
                      onChange={(e) => setEditingPurchase({...editingPurchase, fuelType: e.target.value})}
                    >
                      <option value="petrol">{t('fuelUse.petrol')}</option>
                      <option value="diesel">{t('fuelUse.diesel')}</option>
                      <option value="cng">{t('fuelUse.cng')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><i className="bx bx-tachometer me-1"></i>Quantity (Liters) *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="e.g., 50.5"
                      value={editingPurchase.quantity}
                      onChange={(e) => setEditingPurchase({...editingPurchase, quantity: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><i className="bx bx-rupee me-1"></i>Price per Liter *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      placeholder="e.g., 95.50"
                      value={editingPurchase.pricePerLiter}
                      onChange={(e) => setEditingPurchase({...editingPurchase, pricePerLiter: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label><i className="bx bx-store me-1"></i>Pump Name</Form.Label>
                    <Form.Select
                      value={showEditCustomPumpInput ? "Other" : editingPurchase.pumpName}
                      onChange={(e) => {
                        if (e.target.value === "Other") {
                          setShowEditCustomPumpInput(true);
                          setEditCustomPumpName(editingPurchase.pumpName || '');
                          setEditingPurchase({...editingPurchase, pumpName: ''});
                        } else {
                          setShowEditCustomPumpInput(false);
                          setEditCustomPumpName('');
                          setEditingPurchase({...editingPurchase, pumpName: e.target.value});
                        }
                      }}
                    >
                      <option value="">Select Pump</option>
                      <option value="Indian Oil">Indian Oil (IOCL)</option>
                      <option value="Bharat Petroleum">Bharat Petroleum (BPCL)</option>
                      <option value="Hindustan Petroleum">Hindustan Petroleum (HPCL)</option>
                      <option value="Reliance Petroleum">Reliance Petroleum</option>
                      <option value="Essar Oil">Essar Oil</option>
                      <option value="Shell India">Shell India</option>
                      <option value="Nayara Energy">Nayara Energy</option>
                      <option value="Jio-bp">Jio-bp</option>
                      <option value="Other">Other (Custom)</option>
                    </Form.Select>
                    {showEditCustomPumpInput && (
                      <Form.Control
                        type="text"
                        placeholder="Enter custom pump name"
                        value={editCustomPumpName}
                        onChange={(e) => {
                          setEditCustomPumpName(e.target.value);
                          setEditingPurchase({...editingPurchase, pumpName: e.target.value});
                        }}
                        className="mt-2"
                      />
                    )}
                  </Form.Group>
                </Col>
              </Row>
              
              <Form.Group className="mb-3">
                <Form.Label><i className="bx bx-receipt me-1"></i>Bill Number</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g., HP001234"
                  value={editingPurchase.billNumber}
                  onChange={(e) => setEditingPurchase({...editingPurchase, billNumber: e.target.value})}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button 
            variant="outline-secondary" 
            onClick={() => {
              setShowEditModal(false);
              setShowEditCustomPumpInput(false);
              setEditCustomPumpName('');
            }}
            className="d-flex align-items-center gap-2"
          >
            <i className="bx bx-x"></i>
            Cancel
          </Button>
          <Button 
            variant="primary" 
            onClick={handleSaveEdit}
            className="d-flex align-items-center gap-2"
          >
            <i className="bx bx-save"></i>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default FuelPurchaseHistory;
