// src/components/transport/TransportSystem.jsx
import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Form, Badge, Modal, Alert, Spinner, InputGroup } from 'react-bootstrap';
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
      active: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      maintenance: 'bg-amber-100 text-amber-700 border-amber-200',
      inactive: 'bg-slate-100 text-slate-700 border-slate-200',
      available: 'bg-blue-100 text-blue-700 border-blue-200'
    };
    const statusText = {
      active: t('transport.active'),
      maintenance: t('transport.maintenance'),
      inactive: t('transport.inactive'),
      available: t('transport.available')
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[status] || variants.inactive}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'active' ? 'bg-emerald-500' : status === 'available' ? 'bg-blue-500' : status === 'maintenance' ? 'bg-amber-500' : 'bg-slate-500'}`}></span>
        {statusText[status]?.toUpperCase() || status.toUpperCase()}
      </span>
    );
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
    <div className="transport-system">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <i className="bx bx-car mr-2 text-emerald-600"></i>
            {t('transport.systemTitle')}
          </h2>
          <p className="text-slate-500 text-sm mt-1">{t('transport.systemSubtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 font-medium text-sm"
        >
          <i className="bx bx-plus mr-2 text-lg"></i>
          {t('transport.addNewVehicle')}
        </button>
      </div>

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
                        style={{ height: '48px', fontSize: '15px' }}
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
                      style={{ height: '48px', fontSize: '15px' }}
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
                      className="form-control-lg h-12"
                      style={{ height: '48px', fontSize: '15px' }}
                    >
                      <option value="">{t('transport.allStatus')}</option>
                      <option value="available" className="text-slate-700">{t('transport.available')}</option>
                      <option value="active" className="text-slate-700">{t('transport.active')}</option>
                      <option value="maintenance" className="text-slate-700">{t('transport.maintenance')}</option>
                      <option value="inactive" className="text-slate-700">{t('transport.inactive')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Type Tabs */}
      <div className="mb-6">
        <div className="inline-flex bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveType('type1')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeType === 'type1'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {t('transport.type1')}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeType === 'type1' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
              }`}>
              {type1Vehicles.length}
            </span>
          </button>
          <button
            onClick={() => setActiveType('type2')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeType === 'type2'
              ? 'bg-white text-emerald-600 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
              }`}
          >
            {t('transport.type2')}
            <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${activeType === 'type2' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'
              }`}>
              {type2Vehicles.length}
            </span>
          </button>
        </div>
      </div>

      {/* Vehicles Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 flex items-center">
            <i className="bx bx-list-ul mr-2 text-emerald-600"></i>
            {activeType === 'type1' ? t('transport.tenWheelers') : t('transport.twelveWheelers')}
          </h3>
          <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-white rounded border border-slate-200">
            {currentData.length} Vehicles
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-white">
          {loading || contextLoading ? (
            <div className="text-center py-12">
              <Spinner animation="border" variant="success" role="status" />
              <p className="mt-2 text-sm text-slate-500">{t('transport.loading')}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-sm uppercase text-slate-700 font-semibold tracking-wider">
                  <th className="px-6 py-4">{t('transport.vehicleNumber')}</th>
                  <th className="px-6 py-4">{t('transport.driverName')}</th>
                  <th className="px-6 py-4">{t('transport.contact')}</th>
                  <th className="px-6 py-4">{t('transport.route')}</th>
                  <th className="px-6 py-4 text-center">{t('transport.capacity')}</th>
                  <th className="px-6 py-4 text-center">{t('transport.status')}</th>
                  <th className="px-6 py-4 text-right">{t('transport.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {currentData.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <i className="bx bx-car text-3xl text-slate-300"></i>
                        </div>
                        <p className="text-lg font-medium text-slate-600">{t('transport.noVehiclesFound')}</p>
                        <p className="text-sm mb-4">{t('transport.clickAddVehicle')}</p>
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-lg text-sm font-medium hover:bg-emerald-100 transition-colors"
                        >
                          {t('transport.addNewVehicle')}
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentData.map(transport => (
                    <tr key={transport.firebaseId || transport.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-800 text-base">{transport.vehicleNumber}</div>
                        <div className="text-sm text-slate-500 mt-0.5">ID: {transport.firebaseId?.slice(-6) || '...'}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mr-3 text-xs font-bold">
                            {transport.driverName?.charAt(0)}
                          </div>
                          <span className="text-slate-700 font-medium text-base">{transport.driverName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-base text-slate-700 font-mono bg-slate-50 px-2 py-1 rounded inline-block">
                          {transport.driverContact || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center text-slate-700 text-base">
                          <i className="bx bx-map text-slate-400 mr-2"></i>
                          {transport.route}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                          {transport.capacity}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(transport.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-100">
                          {(transport.status === 'available' || transport.status === 'active') && (
                            <button
                              onClick={() => handleOpenTripModal(transport)}
                              className="p-2 rounded-lg text-emerald-600 hover:bg-emerald-50 border border-transparent hover:border-emerald-100 transition-all"
                              title={t('transport.createTrip')}
                            >
                              <i className="bx bx-plus-circle text-xl"></i>
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingTransport(transport);
                              setShowEditModal(true);
                            }}
                            className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all"
                            title="Edit Vehicle"
                          >
                            <i className="bx bx-edit text-xl"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteTransport(transport)}
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                            title="Delete Vehicle"
                          >
                            <i className="bx bx-trash text-xl"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>

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
                    style={{ height: '48px', fontSize: '15px' }}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.statusLabel')}</Form.Label>
                  <Form.Select
                    value={newTransport.status}
                    onChange={(e) => setNewTransport(prev => ({ ...prev, status: e.target.value }))}
                    style={{ height: '48px', fontSize: '15px' }}
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
    </div>
  );
};

export default TransportSystem;
