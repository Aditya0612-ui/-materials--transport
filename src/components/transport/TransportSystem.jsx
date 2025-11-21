import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Form, Badge, Modal, Alert, Spinner, Container, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import 'boxicons/css/boxicons.min.css';
import { useTransportContext } from '../../context/TransportContext';
import FirebaseService from '../../services/firebaseService';

const TransportSystem = () => {
  const { t } = useTranslation();
  const {
    vehicles,
    getVehiclesByType,
    getVehicleStats,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    loading: contextLoading,
    error,
    setError
  } = useTransportContext();

  const [activeType, setActiveType] = useState('type1');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showTripModal, setShowTripModal] = useState(false);
  const [editingTransport, setEditingTransport] = useState(null);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, message: '', variant: 'success' });
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    type: ''
  });
  const [newTransport, setNewTransport] = useState({
    vehicleNumber: '',
    driverName: '',
    driverContact: '',
    route: '',
    capacity: '',
    status: 'available'
  });

  const [newTrip, setNewTrip] = useState({
    tripId: '',
    orderId: '',
    vehicleNumber: '',
    driverName: '',
    driverContact: '',
    fromLocation: '',
    toLocation: '',
    materials: [{ material: '', quantity: '', unit: 'Tons', rate: '', amount: '' }],
    startDate: '',
    estimatedEndDate: '',
    distance: '',
    customerName: '',
    customerPhone: '',
    customerAddress: '',
    gstNumber: '',
    transportCharges: '',
    otherCharges: '',
    status: 'planned'
  });

  const stats = getVehicleStats();
  const type1Vehicles = getVehiclesByType('type1');
  const type2Vehicles = getVehiclesByType('type2');

  // Show error alerts
  useEffect(() => {
    if (error) {
      setShowAlert({ show: true, message: error, variant: 'danger' });
      setError(null);
    }
  }, [error, setError]);

  const handleAddTransport = async () => {
    if (!newTransport.vehicleNumber || !newTransport.driverName || !newTransport.route) {
      setShowAlert({ show: true, message: 'Please fill all required fields', variant: 'danger' });
      return;
    }

    setLoading(true);
    try {
      const transportData = {
        ...newTransport,
        type: activeType,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await addVehicle(transportData);

      if (result && result.success) {
        setShowAlert({ show: true, message: '✅ Vehicle added successfully!', variant: 'success' });
        setNewTransport({
          vehicleNumber: '',
          driverName: '',
          driverContact: '',
          route: '',
          capacity: '',
          status: 'available'
        });
        setShowAddModal(false);
      } else {
        setShowAlert({ show: true, message: 'Error adding vehicle: ' + (result?.error || 'Unknown error'), variant: 'danger' });
      }
    } catch (error) {
      console.error('Error adding transport:', error);
      setShowAlert({ show: true, message: 'Error adding vehicle', variant: 'danger' });
    }
    setLoading(false);
  };

  const handleEditTransport = async () => {
    if (!editingTransport.vehicleNumber || !editingTransport.driverName || !editingTransport.route) {
      setShowAlert({ show: true, message: 'Please fill all required fields', variant: 'danger' });
      return;
    }

    setLoading(true);
    try {
      const updates = {
        ...editingTransport,
        updatedAt: new Date().toISOString()
      };

      const result = await updateVehicle(editingTransport.firebaseId || editingTransport.id, updates);

      if (result && result.success) {
        setShowAlert({ show: true, message: '✅ Vehicle updated successfully!', variant: 'success' });
        setShowEditModal(false);
        setEditingTransport(null);
      } else {
        setShowAlert({ show: true, message: 'Error updating vehicle: ' + (result?.error || 'Unknown error'), variant: 'danger' });
      }
    } catch (error) {
      console.error('Error updating transport:', error);
      setShowAlert({ show: true, message: 'Error updating vehicle', variant: 'danger' });
    }
    setLoading(false);
  };

  const handleDeleteTransport = async (transport) => {
    if (window.confirm(`Are you sure you want to delete vehicle ${transport.vehicleNumber}?`)) {
      setLoading(true);
      try {
        console.log('Deleting transport:', transport);
        console.log('Using ID:', transport.firebaseId || transport.id);

        const result = await deleteVehicle(transport.firebaseId || transport.id);

        if (result && result.success) {
          setShowAlert({ show: true, message: '✅ Vehicle deleted successfully!', variant: 'success' });
        } else {
          console.error('Delete failed:', result);
          setShowAlert({ show: true, message: 'Error deleting vehicle: ' + (result?.error || 'Unknown error'), variant: 'danger' });
        }
      } catch (error) {
        console.error('Error deleting transport:', error);
        setShowAlert({ show: true, message: 'Error deleting vehicle: ' + error.message, variant: 'danger' });
      }
      setLoading(false);
    }
  };

  const handleOpenTripModal = (vehicle) => {
    setSelectedVehicle(vehicle);
    setNewTrip({
      tripId: `TRIP${Date.now().toString().slice(-6)}`,
      orderId: `ORD${Date.now().toString().slice(-6)}`,
      vehicleNumber: vehicle.vehicleNumber,
      driverName: vehicle.driverName,
      driverContact: vehicle.driverContact || '',
      fromLocation: '',
      toLocation: '',
      materials: [{ material: '', quantity: '', unit: 'Tons', rate: '', amount: '' }],
      startDate: new Date().toISOString().split('T')[0],
      estimatedEndDate: '',
      distance: '',
      customerName: '',
      customerPhone: '',
      customerAddress: '',
      gstNumber: '',
      transportCharges: '',
      otherCharges: '',
      status: 'planned'
    });
    setShowTripModal(true);
  };

  const handleAddMaterial = () => {
    setNewTrip(prev => ({
      ...prev,
      materials: [...prev.materials, { material: '', quantity: '', unit: 'Tons', rate: '', amount: '' }]
    }));
  };

  const handleRemoveMaterial = (index) => {
    if (newTrip.materials.length > 1) {
      setNewTrip(prev => ({
        ...prev,
        materials: prev.materials.filter((_, i) => i !== index)
      }));
    }
  };

  const handleMaterialChange = (index, field, value) => {
    setNewTrip(prev => {
      const updatedMaterials = [...prev.materials];
      updatedMaterials[index] = { ...updatedMaterials[index], [field]: value };

      // Auto-calculate amount if quantity and rate are present
      if (field === 'quantity' || field === 'rate') {
        const quantity = parseFloat(updatedMaterials[index].quantity) || 0;
        const rate = parseFloat(updatedMaterials[index].rate) || 0;
        updatedMaterials[index].amount = (quantity * rate).toFixed(2);
      }

      return { ...prev, materials: updatedMaterials };
    });
  };

  const calculateTotalAmount = () => {
    const materialsTotal = newTrip.materials.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    const transport = parseFloat(newTrip.transportCharges) || 0;
    const other = parseFloat(newTrip.otherCharges) || 0;
    const subtotal = materialsTotal + transport + other;
    const gst = subtotal * 0.18; // 18% GST
    const total = subtotal + gst;

    return { materialsTotal, transport, other, subtotal, gst, total };
  };

  const handleAddTrip = async () => {
    // Validate required fields
    if (!newTrip.fromLocation || !newTrip.toLocation || !newTrip.startDate) {
      setShowAlert({ show: true, message: 'Please fill all required fields (From, To, Start Date)', variant: 'danger' });
      return;
    }

    // Validate at least one material
    const hasValidMaterial = newTrip.materials.some(m => m.material && m.quantity && m.rate);
    if (!hasValidMaterial) {
      setShowAlert({ show: true, message: 'Please add at least one material with quantity and rate', variant: 'danger' });
      return;
    }

    // Validate customer details
    if (!newTrip.customerName || !newTrip.customerPhone) {
      setShowAlert({ show: true, message: 'Please fill customer name and phone number', variant: 'danger' });
      return;
    }

    setLoading(true);
    try {
      const totals = calculateTotalAmount();
      const tripData = {
        ...newTrip,
        ...totals,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await FirebaseService.addTrip(tripData);

      if (result && result.success) {
        setShowAlert({ show: true, message: '✅ Trip created successfully!', variant: 'success' });
        setShowTripModal(false);
        setSelectedVehicle(null);

        // Update vehicle status to 'active' if it was 'available'
        if (selectedVehicle.status === 'available') {
          await updateVehicle(selectedVehicle.firebaseId || selectedVehicle.id, {
            ...selectedVehicle,
            status: 'active',
            updatedAt: new Date().toISOString()
          });
        }
      } else {
        setShowAlert({ show: true, message: 'Error creating trip: ' + (result?.error || 'Unknown error'), variant: 'danger' });
      }
    } catch (error) {
      console.error('Error creating trip:', error);
      setShowAlert({ show: true, message: 'Error creating trip', variant: 'danger' });
    }
    setLoading(false);
  };

  const getStatusBadge = (status) => {
    const variants = {
      active: 'success',
      maintenance: 'warning',
      inactive: 'secondary',
      available: 'info'
    };
    const statusText = {
      active: t('transport.active'),
      maintenance: t('transport.maintenance'),
      inactive: t('transport.inactive'),
      available: t('transport.available')
    };
    return <Badge bg={variants[status]}>{statusText[status]?.toUpperCase() || status.toUpperCase()}</Badge>;
  };

  // Filter vehicles based on search, status, and type filters
  const filterVehicles = (vehiclesList) => {
    return vehiclesList.filter(vehicle => {
      // Search filter - check vehicle number, driver name, and route
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = !filters.search ||
        vehicle.vehicleNumber?.toLowerCase().includes(searchLower) ||
        vehicle.driverName?.toLowerCase().includes(searchLower) ||
        vehicle.route?.toLowerCase().includes(searchLower) ||
        vehicle.driverContact?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus = !filters.status || vehicle.status === filters.status;

      // Type filter
      const matchesType = !filters.type || vehicle.type === filters.type;

      return matchesSearch && matchesStatus && matchesType;
    });
  };

  // Get base data based on active type, then apply filters
  const baseData = activeType === 'type1' ? type1Vehicles : type2Vehicles;
  const currentData = filterVehicles(baseData);

  return (
    <Container fluid className="transport-system py-4">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="mb-1"><i className="bx bx-car me-2 text-primary"></i>{t('transport.systemTitle')}</h2>
              <p className="text-muted mb-0">{t('transport.systemSubtitle')}</p>
            </div>
            <Button
              variant="primary"
              size="lg"
              onClick={() => setShowAddModal(true)}
              className="d-flex align-items-center gap-2"
            >
              <i className="bx bx-plus"></i>
              {t('transport.addNewVehicle')}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Alert */}
      {showAlert.show && (
        <Row className="mb-3">
          <Col>
            <Alert
              variant={showAlert.variant}
              dismissible
              onClose={() => setShowAlert({ show: false, message: '', variant: 'success' })}
            >
              {showAlert.message}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Stats Cards */}
      <Row className="mb-4 g-3">
        <Col xs={6} xl={3} lg={3} md={6} sm={6}>
          <Card className="stats-card border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3">
              <div className="icon-wrapper mb-2" style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #065f46 0%, #047857 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bx bx-car" style={{ fontSize: '24px', color: 'white' }}></i>
              </div>
              <h3 className="mb-1 fw-bold" style={{ color: '#065f46' }}>{stats.total}</h3>
              <p className="mb-0 text-muted small text-center">{t('transport.totalVehicles')}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} xl={3} lg={3} md={6} sm={6}>
          <Card className="stats-card border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3">
              <div className="icon-wrapper mb-2" style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bx bx-check-shield" style={{ fontSize: '24px', color: 'white' }}></i>
              </div>
              <h3 className="mb-1 fw-bold text-success">{stats.active}</h3>
              <p className="mb-0 text-muted small text-center">{t('transport.active')}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} xl={3} lg={3} md={6} sm={6}>
          <Card className="stats-card border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3">
              <div className="icon-wrapper mb-2" style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bx bx-wrench" style={{ fontSize: '24px', color: 'white' }}></i>
              </div>
              <h3 className="mb-1 fw-bold text-warning">{stats.maintenance}</h3>
              <p className="mb-0 text-muted small text-center">{t('transport.maintenance')}</p>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={6} xl={3} lg={3} md={6} sm={6}>
          <Card className="stats-card border-0 shadow-sm h-100">
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-3">
              <div className="icon-wrapper mb-2" style={{
                width: '50px',
                height: '50px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <i className="bx bx-pause-circle" style={{ fontSize: '24px', color: 'white' }}></i>
              </div>
              <h3 className="mb-1 fw-bold text-secondary">{stats.inactive}</h3>
              <p className="mb-0 text-muted small text-center">{t('transport.inactive')}</p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Filters Section */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h6 className="mb-0"><i className="bx bx-filter me-2"></i>{t('transport.filtersSearch')}</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col lg={4} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="bx bx-search me-1 text-primary"></i>{t('transport.searchVehicles')}
                    </Form.Label>
                    <InputGroup size="lg">
                      <InputGroup.Text><i className="bx bx-search"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder={t('transport.searchPlaceholder')}
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col lg={4} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="bx bx-car me-1 text-primary"></i>{t('transport.vehicleType')}
                    </Form.Label>
                    <Form.Select
                      value={filters.type}
                      onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                      className="form-control-lg"
                    >
                      <option value="">{t('transport.allTypes')}</option>
                      <option value="type1">{t('transport.type1')}</option>
                      <option value="type2">{t('transport.type2')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col lg={4} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="bx bx-check-circle me-1 text-primary"></i>{t('transport.status')}
                    </Form.Label>
                    <Form.Select
                      value={filters.status}
                      onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                      className="form-control-lg"
                    >
                      <option value="">{t('transport.allStatus')}</option>
                      <option value="available">{t('transport.available')}</option>
                      <option value="active">{t('transport.active')}</option>
                      <option value="maintenance">{t('transport.maintenance')}</option>
                      <option value="inactive">{t('transport.inactive')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Type Tabs */}
      <Row className="mb-3">
        <Col>
          <div className="d-flex gap-2">
            <Button
              variant={activeType === 'type1' ? 'primary' : 'outline-primary'}
              onClick={() => setActiveType('type1')}
            >
              {t('transport.type1')} - {type1Vehicles.length} {t('transport.vehiclesCount')}
            </Button>
            <Button
              variant={activeType === 'type2' ? 'success' : 'outline-success'}
              onClick={() => setActiveType('type2')}
            >
              {t('transport.type2')} - {type2Vehicles.length} {t('transport.vehiclesCount')}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Vehicles Table */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                <i className="bx bx-list-ul me-2"></i>
                {activeType === 'type1' ? t('transport.tenWheelers') : t('transport.twelveWheelers')}
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              {loading || contextLoading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">{t('transport.loading')}</span>
                  </Spinner>
                </div>
              ) : (
                <Table responsive striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>{t('transport.vehicleNumber')}</th>
                      <th>{t('transport.driverName')}</th>
                      <th>{t('transport.contact')}</th>
                      <th>{t('transport.route')}</th>
                      <th>{t('transport.capacity')}</th>
                      <th>{t('transport.status')}</th>
                      <th className="text-center">{t('transport.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentData.length === 0 ? (
                      <tr>
                        <td colSpan="7" className="text-center py-4">
                          <div className="text-muted">
                            <i className="bx bx-car fs-1 d-block mb-2"></i>
                            {t('transport.noVehiclesFound')}
                            <br />
                            <small>{t('transport.clickAddVehicle')}</small>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      currentData.map(transport => (
                        <tr key={transport.firebaseId || transport.id}>
                          <td><strong>{transport.vehicleNumber}</strong></td>
                          <td>{transport.driverName}</td>
                          <td>
                            <small className="text-muted">
                              <i className="bx bx-phone me-1"></i>
                              {transport.driverContact || 'N/A'}
                            </small>
                          </td>
                          <td>{transport.route}</td>
                          <td className="text-center">{transport.capacity}</td>
                          <td>{getStatusBadge(transport.status)}</td>
                          <td className="text-center">
                            {(transport.status === 'available' || transport.status === 'active') && (
                              <Button
                                variant="outline-success"
                                size="sm"
                                className="me-1"
                                onClick={() => handleOpenTripModal(transport)}
                                title={t('transport.createNewTrip')}
                              >
                                <i className="bx bx-plus-circle"></i> {t('transport.createTrip')}
                              </Button>
                            )}
                            <Button
                              variant="outline-primary"
                              size="sm"
                              className="me-1"
                              onClick={() => {
                                setEditingTransport(transport);
                                setShowEditModal(true);
                              }}
                            >
                              <i className="bx bx-edit"></i>
                            </Button>
                            <Button
                              variant="outline-danger"
                              size="sm"
                              onClick={() => handleDeleteTransport(transport)}
                            >
                              <i className="bx bx-trash"></i>
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Vehicle Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('transport.addNewVehicle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.vehicleNumberRequired')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., MH12AB1234"
                    value={newTransport.vehicleNumber}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.driverNameRequired')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter driver name"
                    value={newTransport.driverName}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, driverName: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.driverContact')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter contact number"
                    value={newTransport.driverContact}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, driverContact: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.routeRequired')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Mumbai-Pune"
                    value={newTransport.route}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, route: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.capacityLabel')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., 10 Ton"
                    value={newTransport.capacity}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, capacity: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.statusLabel')}</Form.Label>
                  <Form.Select
                    value={newTransport.status}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="available">{t('transport.available')}</option>
                    <option value="active">{t('transport.active')}</option>
                    <option value="maintenance">{t('transport.maintenance')}</option>
                    <option value="inactive">{t('transport.inactive')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            {t('transport.cancel')}
          </Button>
          <Button variant="primary" onClick={handleAddTransport} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t('transport.adding')}
              </>
            ) : (
              t('transport.addVehicle')
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Vehicle Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('transport.editVehicle')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingTransport && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vehicle Number *</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingTransport.vehicleNumber}
                      onChange={(e) => setEditingTransport(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Driver Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingTransport.driverName}
                      onChange={(e) => setEditingTransport(prev => ({ ...prev, driverName: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Driver Contact</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingTransport.driverContact}
                      onChange={(e) => setEditingTransport(prev => ({ ...prev, driverContact: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Route *</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingTransport.route}
                      onChange={(e) => setEditingTransport(prev => ({ ...prev, route: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Capacity</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingTransport.capacity}
                      onChange={(e) => setEditingTransport(prev => ({ ...prev, capacity: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select
                      value={editingTransport.status}
                      onChange={(e) => setEditingTransport(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="available">Available</option>
                      <option value="active">Active</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inactive">Inactive</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            {t('transport.cancel')}
          </Button>
          <Button variant="primary" onClick={handleEditTransport} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t('transport.updating')}
              </>
            ) : (
              t('transport.updateVehicle')
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* New Trip Modal */}
      <Modal show={showTripModal} onHide={() => setShowTripModal(false)} size="lg">
        <Modal.Header closeButton className="bg-success text-white">
          <Modal.Title>
            <i className="bx bx-plus-circle me-2"></i>
            Create New Trip - {selectedVehicle?.vehicleNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* Vehicle & Driver Info (Read-only) */}
            <Card className="mb-3 bg-light">
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <strong>Vehicle:</strong> {newTrip.vehicleNumber}
                  </Col>
                  <Col md={4}>
                    <strong>Driver:</strong> {newTrip.driverName}
                  </Col>
                  <Col md={4}>
                    <strong>Contact:</strong> {newTrip.driverContact || 'N/A'}
                  </Col>
                </Row>
              </Card.Body>
            </Card>

            {/* Trip Details */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Trip ID</Form.Label>
                  <Form.Control
                    type="text"
                    value={newTrip.tripId}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    value={newTrip.status}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="planned">Planned</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            {/* Location Details */}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>From Location *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Mumbai Warehouse"
                    value={newTrip.fromLocation}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, fromLocation: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>To Location *</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="e.g., Pune Construction Site"
                    value={newTrip.toLocation}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, toLocation: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Customer Details Section */}
            <div className="mb-4">
              <h6 className="text-success mb-3">
                <i className="bx bx-user me-2"></i>Customer Details
              </h6>
              <div className="border rounded p-3 bg-light">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Customer Name *</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter customer name"
                        value={newTrip.customerName}
                        onChange={(e) => setNewTrip(prev => ({ ...prev, customerName: e.target.value }))}
                        required
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Customer Phone *</Form.Label>
                      <Form.Control
                        type="tel"
                        placeholder="Enter phone number"
                        value={newTrip.customerPhone}
                        onChange={(e) => setNewTrip(prev => ({ ...prev, customerPhone: e.target.value }))}
                        required
                      />
                    </Form.Group>
                  </Col>
                </Row>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>GST Number</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter GST number (optional)"
                        value={newTrip.gstNumber}
                        onChange={(e) => setNewTrip(prev => ({ ...prev, gstNumber: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Customer Address</Form.Label>
                      <Form.Control
                        type="text"
                        placeholder="Enter customer address"
                        value={newTrip.customerAddress}
                        onChange={(e) => setNewTrip(prev => ({ ...prev, customerAddress: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                </Row>
              </div>
            </div>

            {/* Materials Section */}
            <div className="mb-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="text-success mb-0">
                  <i className="bx bx-package me-2"></i>Material Details
                </h6>
                <Button
                  variant="outline-success"
                  size="sm"
                  onClick={handleAddMaterial}
                >
                  <i className="bx bx-plus me-1"></i>Add Material
                </Button>
              </div>

              {newTrip.materials.map((material, index) => (
                <div key={index} className="border rounded p-3 mb-3 bg-light position-relative">
                  {newTrip.materials.length > 1 && (
                    <Button
                      variant="outline-danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-2"
                      onClick={() => handleRemoveMaterial(index)}
                    >
                      <i className="bx bx-trash"></i>
                    </Button>
                  )}

                  <Row>
                    <Col md={6}>
                      <Form.Group className="mb-3">
                        <Form.Label>Material Type *</Form.Label>
                        <Form.Select
                          value={material.material}
                          onChange={(e) => handleMaterialChange(index, 'material', e.target.value)}
                          required
                        >
                          <option value="">Select Material</option>
                          <option value="Cement">Cement (OPC/PPC)</option>
                          <option value="Bricks">Bricks (Red Clay/Fly Ash)</option>
                          <option value="Sand">Sand (River/M-Sand)</option>
                          <option value="Aggregates">Aggregates (10mm/20mm)</option>
                          <option value="Concrete">Ready Mix Concrete</option>
                          <option value="Steel">Steel/TMT Bars</option>
                          <option value="Other">Other Materials</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Quantity *</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="e.g., 10"
                          value={material.quantity}
                          onChange={(e) => handleMaterialChange(index, 'quantity', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group className="mb-3">
                        <Form.Label>Unit</Form.Label>
                        <Form.Select
                          value={material.unit}
                          onChange={(e) => handleMaterialChange(index, 'unit', e.target.value)}
                        >
                          <option value="Tons">Tons</option>
                          <option value="Bags">Bags</option>
                          <option value="brass">brass</option>
                          <option value="Pieces">Pieces</option>
                          <option value="Kg">Kg</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                  <Row>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Rate per Unit (₹) *</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="Enter rate"
                          value={material.rate}
                          onChange={(e) => handleMaterialChange(index, 'rate', e.target.value)}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group className="mb-3">
                        <Form.Label>Amount (₹)</Form.Label>
                        <Form.Control
                          type="text"
                          value={material.amount}
                          readOnly
                          className="bg-white"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>

            {/* Additional Charges */}
            <div className="mb-4">
              <h6 className="text-success mb-3">
                <i className="bx bx-money me-2"></i>Additional Charges
              </h6>
              <div className="border rounded p-3 bg-light">
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Transport Charges (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter transport charges"
                        value={newTrip.transportCharges}
                        onChange={(e) => setNewTrip(prev => ({ ...prev, transportCharges: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Other Charges (₹)</Form.Label>
                      <Form.Control
                        type="number"
                        placeholder="Enter other charges"
                        value={newTrip.otherCharges}
                        onChange={(e) => setNewTrip(prev => ({ ...prev, otherCharges: e.target.value }))}
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Total Summary */}
                <div className="mt-3 pt-3 border-top">
                  <Row>
                    <Col md={6}>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Materials Total:</span>
                        <strong>₹{calculateTotalAmount().materialsTotal.toFixed(2)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Transport Charges:</span>
                        <strong>₹{calculateTotalAmount().transport.toFixed(2)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Other Charges:</span>
                        <strong>₹{calculateTotalAmount().other.toFixed(2)}</strong>
                      </div>
                    </Col>
                    <Col md={6}>
                      <div className="d-flex justify-content-between mb-2">
                        <span>Subtotal:</span>
                        <strong>₹{calculateTotalAmount().subtotal.toFixed(2)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span>GST (18%):</span>
                        <strong>₹{calculateTotalAmount().gst.toFixed(2)}</strong>
                      </div>
                      <div className="d-flex justify-content-between mb-2 text-success">
                        <strong>Grand Total:</strong>
                        <strong className="fs-5">₹{calculateTotalAmount().total.toFixed(2)}</strong>
                      </div>
                    </Col>
                  </Row>
                </div>
              </div>
            </div>

            {/* Date & Distance */}
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Start Date *</Form.Label>
                  <Form.Control
                    type="date"
                    value={newTrip.startDate}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Estimated End Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={newTrip.estimatedEndDate}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, estimatedEndDate: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Distance (km)</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="e.g., 150"
                    value={newTrip.distance}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, distance: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>

          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowTripModal(false)}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleAddTrip} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Creating Trip...
              </>
            ) : (
              <>
                <i className="bx bx-check-circle me-2"></i>
                Create Trip
              </>
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default TransportSystem;
