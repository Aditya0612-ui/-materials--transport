import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Form, Badge, Modal, Alert, Spinner } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import 'boxicons/css/boxicons.min.css';
import FirebaseService from '../../services/firebaseService';
import './TransportStyles.css';

const TransportHistory = () => {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [viewingTrip, setViewingTrip] = useState(null);
  const [showAlert, setShowAlert] = useState({ show: false, message: '', variant: 'success' });
  const [filters, setFilters] = useState({
    search: '',
    status: '',
    dateFrom: '',
    dateTo: ''
  });

  const [newTrip, setNewTrip] = useState({
    tripId: '',
    vehicleNumber: '',
    driverName: '',
    route: '',
    startDate: '',
    endDate: '',
    distance: '',
    fuelUsed: '',
    cost: '',
    status: 'planned',
    customerName: '',
    customerAddress: ''
  });

  // Firebase subscription for trips
  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeToTrips((tripsData) => {
      setTrips(tripsData || []);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Firebase subscription for vehicles
  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeToTransportSystem((vehiclesData) => {
      setVehicles(vehiclesData || []);
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Show error alerts
  useEffect(() => {
    if (error) {
      setShowAlert({ show: true, message: error, variant: 'danger' });
      setError(null);
    }
  }, [error]);

  const generateTripId = () => {
    return `TRIP${Date.now().toString().slice(-6)}`;
  };

  const handleAddTrip = async () => {
    if (!newTrip.vehicleNumber || !newTrip.driverName || !newTrip.route || !newTrip.startDate) {
      setShowAlert({ show: true, message: t('transport.fillRequiredFields'), variant: 'danger' });
      return;
    }

    setLoading(true);
    try {
      const tripData = {
        ...newTrip,
        tripId: newTrip.tripId || generateTripId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const result = await FirebaseService.addTrip(tripData);

      if (result && result.success) {
        setShowAlert({ show: true, message: t('transport.tripAddedSuccess'), variant: 'success' });
        setNewTrip({
          tripId: '',
          vehicleNumber: '',
          driverName: '',
          route: '',
          startDate: '',
          endDate: '',
          distance: '',
          fuelUsed: '',
          cost: '',
          status: 'planned',
          customerName: '',
          customerAddress: ''
        });
        setShowAddModal(false);
      } else {
        setShowAlert({ show: true, message: 'Error adding trip: ' + (result?.error || 'Unknown error'), variant: 'danger' });
      }
    } catch (error) {
      console.error('Error adding trip:', error);
      setShowAlert({ show: true, message: 'Error adding trip', variant: 'danger' });
    }
    setLoading(false);
  };

  const handleEditTrip = async () => {
    if (!editingTrip.vehicleNumber || !editingTrip.driverName || !editingTrip.route) {
      setShowAlert({ show: true, message: t('transport.fillRequiredFields'), variant: 'danger' });
      return;
    }

    setLoading(true);
    try {
      const updates = {
        ...editingTrip,
        updatedAt: new Date().toISOString()
      };

      const result = await FirebaseService.updateTrip(editingTrip.firebaseId || editingTrip.id, updates);

      if (result && result.success) {
        setShowAlert({ show: true, message: t('transport.tripUpdatedSuccess'), variant: 'success' });
        setShowEditModal(false);
        setEditingTrip(null);
      } else {
        setShowAlert({ show: true, message: 'Error updating trip: ' + (result?.error || 'Unknown error'), variant: 'danger' });
      }
    } catch (error) {
      console.error('Error updating trip:', error);
      setShowAlert({ show: true, message: 'Error updating trip', variant: 'danger' });
    }
    setLoading(false);
  };

  const handleDeleteTrip = async (trip) => {
    if (window.confirm(`${t('transport.confirmDelete')} trip ${trip.tripId}?`)) {
      setLoading(true);
      try {
        const result = await FirebaseService.deleteTrip(trip.firebaseId || trip.id);

        if (result && result.success) {
          setShowAlert({ show: true, message: t('transport.tripDeletedSuccess'), variant: 'success' });
        } else {
          setShowAlert({ show: true, message: 'Error deleting trip: ' + (result?.error || 'Unknown error'), variant: 'danger' });
        }
      } catch (error) {
        console.error('Error deleting trip:', error);
        setShowAlert({ show: true, message: 'Error deleting trip', variant: 'danger' });
      }
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      planned: 'primary',
      'in-progress': 'warning',
      completed: 'success',
      cancelled: 'danger'
    };

    const statusText = {
      planned: t('transport.planned'),
      'in-progress': t('transport.inProgress'),
      completed: t('transport.completed'),
      cancelled: t('transport.cancelled')
    };

    return <Badge bg={statusClasses[status]}>{statusText[status] || status}</Badge>;
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = !filters.search ||
      trip.tripId?.toLowerCase().includes(filters.search.toLowerCase()) ||
      trip.vehicleNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
      trip.driverName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      trip.route?.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = !filters.status || trip.status === filters.status;

    const matchesDateFrom = !filters.dateFrom ||
      new Date(trip.startDate) >= new Date(filters.dateFrom);

    const matchesDateTo = !filters.dateTo ||
      new Date(trip.startDate) <= new Date(filters.dateTo);

    return matchesSearch && matchesStatus && matchesDateFrom && matchesDateTo;
  });

  const getTotalStats = () => {
    const total = trips.length;
    const completed = trips.filter(t => t.status === 'completed').length;
    const inProgress = trips.filter(t => t.status === 'in-progress').length;
    const planned = trips.filter(t => t.status === 'planned').length;
    const totalDistance = trips.reduce((sum, t) => sum + (parseFloat(t.distance) || 0), 0);
    const totalCost = trips.reduce((sum, t) => sum + (parseFloat(t.cost) || 0), 0);

    return { total, completed, inProgress, planned, totalDistance, totalCost };
  };

  const stats = getTotalStats();

  return (
    <div className="transport-history">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 flex items-center">
            <i className="bx bx-history mr-2 text-emerald-600"></i>
            {t('transport.historyTitle')}
          </h2>
          <p className="text-slate-500 text-sm mt-1">{t('transport.historySubtitle')}</p>
        </div>
      </div>

      {/* Alert */}
      {showAlert.show && (
        <div className={`mb-4 p-4 rounded-lg border flex items-center justify-between ${showAlert.variant === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
          }`}>
          <div className="flex items-center">
            <i className={`bx ${showAlert.variant === 'success' ? 'bx-check-circle' : 'bx-error-circle'} mr-2 text-xl`}></i>
            {showAlert.message}
          </div>
          <button onClick={() => setShowAlert({ show: false, message: '', variant: 'success' })} className="text-current hover:opacity-75">
            <i className="bx bx-x text-xl"></i>
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 mb-6">
        <div className="flex items-center mb-4">
          <i className="bx bx-filter text-emerald-600 mr-2"></i>
          <h6 className="font-semibold text-slate-800 m-0">{t('transport.filtersSearch')}</h6>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">{t('common.search')}</label>
            <div className="relative">
              <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                className="w-full pl-10 pr-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                placeholder={t('transport.searchTripsPlaceholder')}
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                style={{ color: '#1e293b' }}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">{t('transport.status')}</label>
            <select
              className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              style={{ color: '#1e293b' }}
            >
              <option value="">{t('transport.allStatus')}</option>
              <option value="planned">{t('transport.planned')}</option>
              <option value="in-progress">{t('transport.inProgress')}</option>
              <option value="completed">{t('transport.completed')}</option>
              <option value="cancelled">{t('transport.cancelled')}</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">{t('transport.fromDate')}</label>
            <input
              type="date"
              className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              style={{ color: '#1e293b', colorScheme: 'light' }}
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1 uppercase tracking-wide">{t('transport.toDate')}</label>
            <div className="flex gap-2">
              <input
                type="date"
                className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                style={{ color: '#1e293b', colorScheme: 'light' }}
              />
              <button
                onClick={() => setFilters({ search: '', status: '', dateFrom: '', dateTo: '' })}
                className="px-3 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
                title={t('transport.clearFilters')}
              >
                <i className="bx bx-reset text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Trips Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 flex items-center">
            <i className="bx bx-list-ul mr-2 text-emerald-600"></i>
            {t('transport.tripList')}
          </h3>
          <span className="text-xs text-slate-500 font-medium px-2 py-1 bg-white rounded border border-slate-200">
            {filteredTrips.length} Trips
          </span>
        </div>

        <div className="overflow-x-auto scrollbar-white">
          {loading ? (
            <div className="text-center py-12">
              <Spinner animation="border" variant="success" role="status" />
              <p className="mt-2 text-sm text-slate-500">{t('transport.loading')}</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-sm uppercase text-slate-700 font-semibold tracking-wider">
                  <th className="px-6 py-4">{t('transport.tripId')}</th>
                  <th className="px-6 py-4">{t('transport.vehicle')}</th>
                  <th className="px-6 py-4">{t('transport.driver')}</th>
                  <th className="px-6 py-4">{t('transport.route')}</th>
                  <th className="px-6 py-4">{t('transport.startDate')}</th>
                  <th className="px-6 py-4">{t('transport.distance')}</th>
                  <th className="px-6 py-4">{t('transport.cost')}</th>
                  <th className="px-6 py-4">{t('transport.status')}</th>
                  <th className="px-6 py-4 text-right">{t('transport.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="text-center py-12">
                      <div className="flex flex-col items-center justify-center text-slate-400">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                          <i className="bx bx-trip text-3xl text-slate-300"></i>
                        </div>
                        <p className="text-lg font-medium text-slate-600">{t('transport.noTripsFound')}</p>
                        <p className="text-sm mb-4">{t('transport.clickAddTrip')}</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map(trip => (
                    <tr key={trip.firebaseId || trip.id} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <span className="font-semibold text-slate-800 text-base">{trip.tripId}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-medium text-base">{trip.vehicleNumber}</td>
                      <td className="px-6 py-4 text-slate-700 text-base">{trip.driverName}</td>
                      <td className="px-6 py-4 text-slate-700">
                        <div className="flex items-center">
                          <i className="bx bx-map text-slate-400 mr-1"></i>
                          {trip.route}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-mono text-sm">
                        {new Date(trip.startDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-slate-700 text-base">{trip.distance} km</td>
                      <td className="px-6 py-4 text-slate-700 font-medium text-base">₹{trip.cost}</td>
                      <td className="px-6 py-4">
                        {getStatusBadge(trip.status)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end space-x-2 opacity-100">
                          <button
                            onClick={() => {
                              setViewingTrip(trip);
                              setShowViewModal(true);
                            }}
                            className="p-2 rounded-lg text-blue-500 hover:bg-blue-50 border border-transparent hover:border-blue-100 transition-all"
                            title="View Details"
                          >
                            <i className="bx bx-show text-xl"></i>
                          </button>
                          <button
                            onClick={() => {
                              setEditingTrip(trip);
                              setShowEditModal(true);
                            }}
                            className="p-2 rounded-lg text-indigo-500 hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all"
                            title="Edit Trip"
                          >
                            <i className="bx bx-edit text-xl"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteTrip(trip)}
                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 border border-transparent hover:border-red-100 transition-all"
                            title="Delete Trip"
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

      {/* Add Trip Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('transport.addNewTrip')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.tripId')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('transport.autoGenerated')}
                    value={newTrip.tripId}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, tripId: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.vehicleNumberRequired')}</Form.Label>
                  <Form.Select
                    value={newTrip.vehicleNumber}
                    onChange={(e) => {
                      const selectedVehicle = vehicles.find(v => v.vehicleNumber === e.target.value);
                      setNewTrip(prev => ({
                        ...prev,
                        vehicleNumber: e.target.value,
                        driverName: selectedVehicle?.driverName || ''
                      }));
                    }}
                  >
                    <option value="">{t('transport.selectVehicle')}</option>
                    {vehicles.map((vehicle) => (
                      <option key={vehicle.id || vehicle.vehicleNumber} value={vehicle.vehicleNumber}>
                        {vehicle.vehicleNumber} - {vehicle.driverName} ({vehicle.status})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.driverNameRequired')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('transport.autoFilled')}
                    value={newTrip.driverName}
                    readOnly
                    className="bg-light"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.routeRequired')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('transport.routePlaceholder')}
                    value={newTrip.route}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, route: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.startDateRequired')}</Form.Label>
                  <Form.Control
                    type="date"
                    value={newTrip.startDate}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.endDateLabel')}</Form.Label>
                  <Form.Control
                    type="date"
                    value={newTrip.endDate}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.distanceKmLabel')}</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder={t('transport.enterZero')}
                    value={newTrip.distance}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, distance: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.fuelUsedLabel')}</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder={t('transport.enterZero')}
                    value={newTrip.fuelUsed}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, fuelUsed: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.costLabel')}</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder={t('transport.enterZero')}
                    value={newTrip.cost}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, cost: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.statusLabel')}</Form.Label>
                  <Form.Select
                    value={newTrip.status}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, status: e.target.value }))}
                  >
                    <option value="planned">{t('transport.planned')}</option>
                    <option value="in-progress">{t('transport.inProgress')}</option>
                    <option value="completed">{t('transport.completed')}</option>
                    <option value="cancelled">{t('transport.cancelled')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('transport.customerName')}</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder={t('transport.enterCustomerName')}
                    value={newTrip.customerName}
                    onChange={(e) => setNewTrip(prev => ({ ...prev, customerName: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Customer Address */}
            <Form.Group className="mb-3">
              <Form.Label>{t('transport.customerAddress')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                placeholder={t('transport.enterCustomerAddress')}
                value={newTrip.customerAddress}
                onChange={(e) => setNewTrip(prev => ({ ...prev, customerAddress: e.target.value }))}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            {t('transport.cancel')}
          </Button>
          <Button variant="primary" onClick={handleAddTrip} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t('transport.adding')}
              </>
            ) : (
              t('transport.addTrip')
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Edit Trip Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('transport.editTrip')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingTrip && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('transport.tripId')}</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingTrip.tripId}
                      onChange={(e) => setEditingTrip(prev => ({ ...prev, tripId: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('transport.vehicleNumberRequired')}</Form.Label>
                    <Form.Select
                      value={editingTrip.vehicleNumber}
                      onChange={(e) => {
                        const selectedVehicle = vehicles.find(v => v.vehicleNumber === e.target.value);
                        setEditingTrip(prev => ({
                          ...prev,
                          vehicleNumber: e.target.value,
                          driverName: selectedVehicle?.driverName || prev.driverName
                        }));
                      }}
                    >
                      <option value="">{t('transport.selectVehicle')}</option>
                      {vehicles.map((vehicle) => (
                        <option key={vehicle.id || vehicle.vehicleNumber} value={vehicle.vehicleNumber}>
                          {vehicle.vehicleNumber} - {vehicle.driverName} ({vehicle.status})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('transport.driverNameRequired')}</Form.Label>
                    <Form.Control
                      type="text"
                      placeholder={t('transport.autoFilled')}
                      value={editingTrip.driverName}
                      readOnly
                      className="bg-light"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('transport.routeRequired')}</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingTrip.route}
                      onChange={(e) => setEditingTrip(prev => ({ ...prev, route: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('transport.startDate')}</Form.Label>
                    <Form.Control
                      type="date"
                      value={editingTrip.startDate}
                      onChange={(e) => setEditingTrip(prev => ({ ...prev, startDate: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('transport.endDateLabel')}</Form.Label>
                    <Form.Control
                      type="date"
                      value={editingTrip.endDate}
                      onChange={(e) => setEditingTrip(prev => ({ ...prev, endDate: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('transport.distanceKmLabel')}</Form.Label>
                    <Form.Control
                      type="number"
                      value={editingTrip.distance}
                      onChange={(e) => setEditingTrip(prev => ({ ...prev, distance: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('transport.fuelUsedLabel')}</Form.Label>
                    <Form.Control
                      type="number"
                      value={editingTrip.fuelUsed}
                      onChange={(e) => setEditingTrip(prev => ({ ...prev, fuelUsed: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('transport.costLabel')}</Form.Label>
                    <Form.Control
                      type="number"
                      value={editingTrip.cost}
                      onChange={(e) => setEditingTrip(prev => ({ ...prev, cost: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
              </Row>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('transport.statusLabel')}</Form.Label>
                    <Form.Select
                      value={editingTrip.status}
                      onChange={(e) => setEditingTrip(prev => ({ ...prev, status: e.target.value }))}
                    >
                      <option value="planned">{t('transport.planned')}</option>
                      <option value="in-progress">{t('transport.inProgress')}</option>
                      <option value="completed">{t('transport.completed')}</option>
                      <option value="cancelled">{t('transport.cancelled')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>{t('transport.customerName')}</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingTrip.customerName}
                      onChange={(e) => setEditingTrip(prev => ({ ...prev, customerName: e.target.value }))}
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Customer Address */}
              <Form.Group className="mb-3">
                <Form.Label>{t('transport.customerAddress')}</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={2}
                  placeholder={t('transport.enterCustomerAddress')}
                  value={editingTrip.customerAddress || ''}
                  onChange={(e) => setEditingTrip(prev => ({ ...prev, customerAddress: e.target.value }))}
                />
              </Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            {t('transport.cancel')}
          </Button>
          <Button variant="primary" onClick={handleEditTrip} disabled={loading}>
            {loading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                {t('transport.updating')}
              </>
            ) : (
              t('transport.updateTrip')
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Trip Details Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg">
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title>
            <i className="bx bx-show me-2"></i>
            {t('transport.tripDetails')} - {viewingTrip?.tripId}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewingTrip && (
            <div>
              {/* Trip Information */}
              <Card className="mb-3">
                <Card.Header className="bg-light">
                  <strong><i className="bx bx-info-circle me-2"></i>{t('transport.tripInformation')}</strong>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>{t('transport.tripId')}:</strong> {viewingTrip.tripId}</p>
                      <p><strong>{t('transport.status')}:</strong> {getStatusBadge(viewingTrip.status)}</p>
                      <p><strong>{t('transport.startDate')}:</strong> {new Date(viewingTrip.startDate).toLocaleDateString()}</p>
                      <p><strong>{t('transport.endDate')}:</strong> {viewingTrip.endDate ? new Date(viewingTrip.endDate).toLocaleDateString() : t('transport.notSet')}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>{t('transport.distance')}:</strong> {viewingTrip.distance || 0} km</p>
                      <p><strong>{t('transport.fuelUsed')}:</strong> {viewingTrip.fuelUsed || 0} L</p>
                      <p><strong>{t('transport.cost')}:</strong> ₹{viewingTrip.cost || 0}</p>
                      <p><strong>{t('transport.route')}:</strong> {viewingTrip.route}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Vehicle & Driver Information */}
              <Card className="mb-3">
                <Card.Header className="bg-light">
                  <strong><i className="bx bx-car me-2"></i>{t('transport.vehicleDriver')}</strong>
                </Card.Header>
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p><strong>{t('transport.vehicleNumber')}:</strong> {viewingTrip.vehicleNumber}</p>
                      <p><strong>{t('transport.driverName')}:</strong> {viewingTrip.driverName}</p>
                    </Col>
                    <Col md={6}>
                      <p><strong>{t('transport.driverContact')}:</strong> {viewingTrip.driverContact || 'N/A'}</p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              {/* Material & Customer Information */}
              {(viewingTrip.material || viewingTrip.cargo || viewingTrip.customerName) && (
                <Card className="mb-3">
                  <Card.Header className="bg-success text-white">
                    <strong><i className="bx bx-package me-2"></i>{t('transport.materialCustomerDetails')}</strong>
                  </Card.Header>
                  <Card.Body>
                    {/* Material Information */}
                    <div className="mb-3">
                      <h6 className="text-success mb-2">{t('transport.materialInformation')}</h6>
                      <Row>
                        <Col md={6}>
                          {viewingTrip.material && <p className="mb-2"><strong>{t('transport.materialType')}:</strong> {viewingTrip.material}</p>}
                          {viewingTrip.quantity && <p className="mb-2"><strong>{t('transport.quantity')}:</strong> {viewingTrip.quantity}</p>}
                        </Col>
                        <Col md={6}>
                          {viewingTrip.quantityPrice && <p className="mb-2"><strong>{t('transport.quantityPrice')}:</strong> ₹{viewingTrip.quantityPrice}</p>}
                          {viewingTrip.cargo && <p className="mb-2"><strong>{t('transport.cargo')}:</strong> {viewingTrip.cargo}</p>}
                        </Col>
                      </Row>
                    </div>

                    <hr />

                    {/* Customer Information */}
                    <div>
                      <h6 className="text-success mb-2">{t('transport.customerInformation')}</h6>
                      <Row>
                        <Col md={6}>
                          {viewingTrip.customerName && <p className="mb-2"><strong>{t('transport.customerName')}:</strong> {viewingTrip.customerName}</p>}
                          {viewingTrip.customerPhone && <p className="mb-2"><strong>{t('transport.customerPhone')}:</strong> {viewingTrip.customerPhone}</p>}
                        </Col>
                        <Col md={6}>
                          {viewingTrip.fromLocation && <p className="mb-2"><strong>{t('transport.fromLocation')}:</strong> {viewingTrip.fromLocation}</p>}
                          {viewingTrip.toLocation && <p className="mb-2"><strong>{t('transport.toLocation')}:</strong> {viewingTrip.toLocation}</p>}
                        </Col>
                      </Row>
                      {viewingTrip.customerAddress && (
                        <Row>
                          <Col md={12}>
                            <p className="mb-0"><strong>{t('transport.customerAddress')}:</strong><br />{viewingTrip.customerAddress}</p>
                          </Col>
                        </Row>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              )}

              {/* Notes */}
              {viewingTrip.notes && (
                <Card>
                  <Card.Header className="bg-light">
                    <strong><i className="bx bx-note me-2"></i>{t('transport.notes')}</strong>
                  </Card.Header>
                  <Card.Body>
                    <p className="mb-0">{viewingTrip.notes}</p>
                  </Card.Body>
                </Card>
              )}

              {/* Timestamps */}
              <div className="mt-3 text-muted small">
                <p className="mb-1"><strong>{t('transport.created')}:</strong> {viewingTrip.createdAt ? new Date(viewingTrip.createdAt).toLocaleString() : 'N/A'}</p>
                <p className="mb-0"><strong>{t('transport.lastUpdated')}:</strong> {viewingTrip.updatedAt ? new Date(viewingTrip.updatedAt).toLocaleString() : 'N/A'}</p>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowViewModal(false)}>
            {t('transport.close')}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setShowViewModal(false);
              setEditingTrip(viewingTrip);
              setShowEditModal(true);
            }}
          >
            <i className="bx bx-edit me-2"></i>
            {t('transport.editTrip')}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default TransportHistory;
