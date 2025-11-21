import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Row, Col, Badge, Modal, InputGroup, ProgressBar, Container, Spinner, Alert } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { exportToExcel } from '../../utils/excelExport';
import firebaseService from '../../services/firebaseService';
import 'boxicons/css/boxicons.min.css';
import './FuelStyles.css';

const FuelUseRecords = () => {
  const { t } = useTranslation();
  const [vehicles, setVehicles] = useState([]);
  const [fuelRecords, setFuelRecords] = useState([]);
  const [filteredRecords, setFilteredRecords] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    recordType: 'all'
  });
  const [newRecord, setNewRecord] = useState({
    vehicleNumber: '',
    date: '',
    recordType: 'fuel_fill',
    quantity: '',
    odometer: '',
    fuelType: 'diesel',
    efficiency: '',
    notes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Subscribe to Firebase fuel records
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToFuelRecords((records) => {
      setFuelRecords(records);
    });

    // Subscribe to vehicles (if needed)
    const unsubscribeVehicles = firebaseService.subscribeToVehicles((vehicleData) => {
      setVehicles(vehicleData);
    });

    return () => {
      unsubscribe();
      unsubscribeVehicles();
    };
  }, []);

  // Filter records
  useEffect(() => {
    let filtered = fuelRecords;

    if (selectedVehicle !== 'all') {
      filtered = filtered.filter(record => record.vehicleNumber === selectedVehicle);
    }

    if (filters.dateFrom) {
      filtered = filtered.filter(record => record.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(record => record.date <= filters.dateTo);
    }
    if (filters.recordType !== 'all') {
      filtered = filtered.filter(record => record.recordType === filters.recordType);
    }

    setFilteredRecords(filtered);
  }, [fuelRecords, selectedVehicle, filters]);

  const handleAddRecord = async () => {
    if (!newRecord.vehicleNumber || !newRecord.date || !newRecord.quantity || !newRecord.odometer) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    const record = {
      ...newRecord,
      quantity: parseFloat(newRecord.quantity),
      odometer: parseInt(newRecord.odometer),
      efficiency: parseFloat(newRecord.efficiency) || 0
    };

    try {
      const result = await firebaseService.addFuelRecord(record);
      if (result.success) {
        setNewRecord({
          vehicleNumber: '',
          date: '',
          recordType: 'fuel_fill',
          quantity: '',
          odometer: '',
          fuelType: 'diesel',
          efficiency: '',
          notes: ''
        });
        setShowAddModal(false);
      } else {
        setError('Failed to add fuel record');
      }
    } catch (err) {
      console.error('Error adding fuel record:', err);
      setError('Error adding fuel record');
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing record details
  const handleViewRecord = (record) => {
    setSelectedRecord(record);
    setShowViewModal(true);
  };

  // Handle editing record
  const handleEditRecord = (record) => {
    setEditingRecord({ ...record });
    setShowEditModal(true);
  };

  // Handle saving edited record
  const handleSaveEdit = async () => {
    if (!editingRecord.vehicleNumber || !editingRecord.date || !editingRecord.quantity || !editingRecord.odometer) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    const updatedRecord = {
      ...editingRecord,
      quantity: parseFloat(editingRecord.quantity),
      odometer: parseInt(editingRecord.odometer),
      efficiency: parseFloat(editingRecord.efficiency) || 0
    };

    try {
      const result = await firebaseService.updateFuelRecord(editingRecord.id, updatedRecord);
      if (result.success) {
        setShowEditModal(false);
        setEditingRecord(null);
      } else {
        setError('Failed to update fuel record');
      }
    } catch (err) {
      console.error('Error updating fuel record:', err);
      setError('Error updating fuel record');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting record
  const handleDeleteRecord = async (recordId) => {
    if (window.confirm('Are you sure you want to delete this fuel record?')) {
      setLoading(true);
      setError(null);

      try {
        const result = await firebaseService.deleteFuelRecord(recordId);
        if (!result.success) {
          setError('Failed to delete fuel record');
        }
      } catch (err) {
        console.error('Error deleting fuel record:', err);
        setError('Error deleting fuel record');
      } finally {
        setLoading(false);
      }
    }
  };

  const getRecordTypeBadge = (type) => {
    const variants = {
      fuel_fill: 'success',
      fuel_consumption: 'primary',
      maintenance: 'warning',
      inspection: 'info'
    };
    const labels = {
      fuel_fill: 'FUEL FILL',
      fuel_consumption: 'CONSUMPTION',
      maintenance: 'MAINTENANCE',
      inspection: 'INSPECTION'
    };
    return <Badge bg={variants[type]}>{labels[type]}</Badge>;
  };

  const getFuelTypeBadge = (type) => {
    const variants = {
      Diesel: 'warning',
      Petrol: 'danger',
      CNG: 'info'
    };
    return <Badge bg={variants[type]}>{type}</Badge>;
  };

  const calculateVehicleStats = (vehicleNumber) => {
    const vehicleRecords = fuelRecords.filter(r => r.vehicleNumber === vehicleNumber);
    const totalFuelUsed = vehicleRecords.reduce((sum, r) => sum + r.quantity, 0);
    const avgEfficiency = vehicleRecords.length > 0 ? 
      vehicleRecords.reduce((sum, r) => sum + r.efficiency, 0) / vehicleRecords.length : 0;
    const totalCost = vehicleRecords.reduce((sum, r) => sum + (r.cost || 0), 0);
    
    return { totalFuelUsed, avgEfficiency, totalCost, recordCount: vehicleRecords.length };
  };

  const getFuelLevelPercentage = (current, capacity) => {
    return (current / capacity) * 100;
  };

  const getFuelLevelColor = (percentage) => {
    if (percentage > 70) return 'success';
    if (percentage > 30) return 'warning';
    return 'danger';
  };

  // Handle export to Excel
  const handleExport = () => {
    if (filteredRecords.length === 0) {
      alert('No data to export');
      return;
    }

    const columns = [
      { key: 'date', header: 'Date' },
      { key: 'vehicleNumber', header: 'Vehicle Number' },
      { key: 'recordType', header: 'Record Type' },
      { key: 'quantity', header: 'Quantity (L)' },
      { key: 'odometer', header: 'Odometer (km)' },
      { key: 'fuelType', header: 'Fuel Type' },
      { key: 'efficiency', header: 'Efficiency (km/L)' },
      { key: 'cost', header: 'Cost (₹)' },
      { key: 'notes', header: 'Notes' }
    ];

    exportToExcel(filteredRecords, 'Fuel_Use_Records', 'Fuel Records', columns);
  };

  return (
    <Container fluid className="fuel-use-records py-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h2 className="mb-1"><i className="bx bx-gas-pump me-2 text-primary"></i>{t('fuelUse.title')}</h2>
          <p className="text-muted mb-0">{t('fuelUse.subtitle')}</p>
        </div>
        <div>
          <Button 
            variant="primary" 
            onClick={() => setShowAddModal(true)}
            className="d-flex align-items-center gap-2"
          >
            <i className="bx bx-plus"></i>
            {t('fuelUse.addRecord')}
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h6 className="mb-0"><i className="bx bx-filter me-2"></i>{t('fuelUse.filtersVehicle')}</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col lg={3} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="bx bx-car me-1 text-primary"></i>{t('fuelUse.selectVehicle')}
                    </Form.Label>
                    <Form.Select
                      value={selectedVehicle}
                      onChange={(e) => setSelectedVehicle(e.target.value)}
                      className="form-control-lg"
                    >
                      <option value="all">{t('fuelUse.allVehicles')}</option>
                      {vehicles.map(vehicle => (
                        <option key={vehicle.id} value={vehicle.number}>
                          {vehicle.number} - {vehicle.type}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col lg={2} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="bx bx-calendar me-1 text-primary"></i>{t('fuelUse.fromDate')}
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={filters.dateFrom}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                      className="form-control-lg"
                    />
                  </Form.Group>
                </Col>
                <Col lg={2} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="bx bx-calendar me-1 text-primary"></i>{t('fuelUse.toDate')}
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
                      <i className="bx bx-list-ul me-1 text-primary"></i>{t('fuelUse.recordType')}
                    </Form.Label>
                    <Form.Select
                      value={filters.recordType}
                      onChange={(e) => setFilters(prev => ({ ...prev, recordType: e.target.value }))}
                      className="form-control-lg"
                    >
                      <option value="all">{t('fuelUse.allRecordTypes')}</option>
                      <option value="fuel_fill">{t('fuelUse.fuelFill')}</option>
                      <option value="fuel_consumption">{t('fuelUse.fuelConsumption')}</option>
                      <option value="maintenance">{t('fuelUse.maintenance')}</option>
                      <option value="inspection">{t('fuelUse.inspection')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col lg={2} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold text-white">Action</Form.Label>
                    <div>
                      <Button 
                        variant="outline-secondary" 
                        onClick={() => {
                          setSelectedVehicle('all');
                          setFilters({ dateFrom: '', dateTo: '', recordType: 'all' });
                        }}
                        className="w-100"
                        size="lg"
                      >
                        <i className="bx bx-refresh me-1"></i>
                        Clear
                      </Button>
                    </div>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Vehicle Status Cards */}
      {selectedVehicle !== 'all' && (
        <Row className="mb-4">
          {vehicles.filter(v => v.number === selectedVehicle).map(vehicle => {
            const stats = calculateVehicleStats(vehicle.number);
            const fuelPercentage = getFuelLevelPercentage(vehicle.currentFuel, vehicle.tankCapacity);
            
            return (
              <Col key={vehicle.id}>
                <Card className="border-primary shadow-sm">
                  <Card.Header className="bg-primary text-white">
                    <h6 className="mb-0">
                      <i className="bx bx-car me-2"></i>
                      {vehicle.number} - {vehicle.type}
                    </h6>
                  </Card.Header>
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <div className="mb-3">
                          <small className="fw-semibold">Current Fuel Level</small>
                          <ProgressBar 
                            now={fuelPercentage} 
                            variant={getFuelLevelColor(fuelPercentage)}
                            label={`${vehicle.currentFuel}L / ${vehicle.tankCapacity}L`}
                            className="mt-1"
                          />
                        </div>
                        <div className="mb-2"><strong>Fuel Type:</strong> {getFuelTypeBadge(vehicle.fuelType)}</div>
                        <div><strong>Total Distance:</strong> {vehicle.totalDistance.toLocaleString()} KM</div>
                      </Col>
                      <Col md={6}>
                        <div className="mb-2"><strong>Avg Efficiency:</strong> {vehicle.avgEfficiency} KM/L</div>
                        <div className="mb-2"><strong>Total Fuel Used:</strong> {stats.totalFuelUsed}L</div>
                        <div className="mb-2"><strong>Total Cost:</strong> ₹{stats.totalCost.toLocaleString()}</div>
                        <div><strong>Records:</strong> {stats.recordCount}</div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>
            );
          })}
        </Row>
      )}

      {/* Records Table */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h6 className="mb-0"><i className="bx bx-table me-2"></i>{t('fuelUse.fuelRecords')} ({filteredRecords.length})</h6>
                <div className="d-flex gap-2">
                  <Button variant="outline-primary" size="sm" onClick={handleExport}>
                    <i className="bx bx-export me-1"></i>{t('common.export')}
                  </Button>
                </div>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table hover className="mb-0" style={{ minWidth: '800px' }}>
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '100px' }}><i className="bx bx-calendar me-1"></i>{t('fuelUse.date')}</th>
                      <th style={{ width: '120px' }}><i className="bx bx-car me-1"></i>{t('fuelUse.vehicle')}</th>
                      <th style={{ width: '100px' }}><i className="bx bx-list-ul me-1"></i>{t('fuelUse.type')}</th>
                      <th style={{ width: '80px' }}><i className="bx bx-droplet me-1"></i>{t('fuelUse.qty')}</th>
                      <th style={{ width: '90px' }}><i className="bx bx-tachometer me-1"></i>{t('fuelUse.odometer')}</th>
                      <th style={{ width: '80px' }}><i className="bx bx-gas-pump me-1"></i>{t('fuelUse.fuel')}</th>
                      <th style={{ width: '90px' }}><i className="bx bx-trending-up me-1"></i>{t('fuelUse.efficiency')}</th>
                      <th style={{ width: '80px' }}><i className="bx bx-rupee me-1"></i>{t('fuelUse.cost')}</th>
                      <th style={{ width: '120px' }}><i className="bx bx-note me-1"></i>{t('fuelUse.notes')}</th>
                      <th style={{ width: '80px' }}><i className="bx bx-cog me-1"></i>{t('common.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRecords.map(record => (
                      <tr key={record.id} className="align-middle">
                        <td>
                          <small>{new Date(record.date).toLocaleDateString('en-IN', { 
                            day: '2-digit', 
                            month: 'short'
                          })}</small>
                        </td>
                        <td>
                          <strong className="text-primary" style={{ fontSize: '0.85rem' }}>
                            {record.vehicleNumber}
                          </strong>
                        </td>
                        <td>{getRecordTypeBadge(record.recordType)}</td>
                        <td>
                          <span className="fw-semibold">{record.quantity}</span>
                          <small className="text-muted">L</small>
                        </td>
                        <td>
                          <small className="fw-semibold">{(record.odometer/1000).toFixed(0)}k</small>
                        </td>
                        <td>{getFuelTypeBadge(record.fuelType)}</td>
                        <td>
                          <small className="fw-semibold">
                            {record.efficiency > 0 ? `${record.efficiency}` : '-'}
                          </small>
                        </td>
                        <td>
                          <small className="fw-bold text-success">
                            {record.cost ? `₹${(record.cost/1000).toFixed(1)}k` : '-'}
                          </small>
                        </td>
                        <td>
                          <small className="text-muted text-truncate" style={{ maxWidth: '100px', display: 'block' }}>
                            {record.notes || '-'}
                          </small>
                        </td>
                        <td>
                          <div className="d-flex gap-1">
                            <Button 
                              size="sm" 
                              variant="outline-info"
                              title="View Details"
                              style={{ padding: '0.25rem 0.5rem' }}
                              onClick={() => handleViewRecord(record)}
                            >
                              <i className="bx bx-show" style={{ fontSize: '0.8rem' }}></i>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline-primary"
                              title="Edit"
                              style={{ padding: '0.25rem 0.5rem' }}
                              onClick={() => handleEditRecord(record)}
                            >
                              <i className="bx bx-edit-alt" style={{ fontSize: '0.8rem' }}></i>
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline-danger"
                              title="Delete"
                              style={{ padding: '0.25rem 0.5rem' }}
                              onClick={() => handleDeleteRecord(record.id)}
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

              {filteredRecords.length === 0 && (
                <div className="text-center py-5">
                  <div className="mb-3">
                    <i className="bx bx-gas-pump" style={{ fontSize: '4rem', color: '#6c757d' }}></i>
                  </div>
                  <h5 className="text-muted">No Fuel Records Found</h5>
                  <p className="text-muted mb-3">No records match your current filter criteria.</p>
                  <Button 
                    variant="primary" 
                    onClick={() => setShowAddModal(true)}
                    className="d-flex align-items-center gap-2 mx-auto"
                  >
                    <i className="bx bx-plus"></i>
                    Add First Record
                  </Button>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Add Record Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>{t('fuelUse.addFuelUseRecord')}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('fuelUse.vehicleNumber')} *</Form.Label>
                  <Form.Select
                    value={newRecord.vehicleNumber}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                  >
                    <option value="">{t('fuelUse.selectVehicle')}</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.number}>
                        {vehicle.number} - {vehicle.type}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('fuelUse.date')} *</Form.Label>
                  <Form.Control
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, date: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('fuelUse.recordType')} *</Form.Label>
                  <Form.Select
                    value={newRecord.recordType}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, recordType: e.target.value }))}
                  >
                    <option value="fuel_fill">{t('fuelUse.fuelFill')}</option>
                    <option value="fuel_consumption">{t('fuelUse.fuelConsumption')}</option>
                    <option value="maintenance">{t('fuelUse.maintenance')}</option>
                    <option value="inspection">{t('fuelUse.inspection')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('fuelUse.fuelType')}</Form.Label>
                  <Form.Select
                    value={newRecord.fuelType}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, fuelType: e.target.value }))}
                  >
                    <option value="diesel">{t('fuelUse.diesel')}</option>
                    <option value="petrol">{t('fuelUse.petrol')}</option>
                    <option value="cng">{t('fuelUse.cng')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('fuelUse.quantityLiters')} *</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    value={newRecord.quantity}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, quantity: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('fuelUse.odometerReading')} *</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="0"
                    value={newRecord.odometer}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, odometer: e.target.value }))}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('fuelUse.efficiencyKML')}</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={newRecord.efficiency}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, efficiency: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={12}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('fuelUse.notes')}</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder={t('fuelUse.notesPlaceholder')}
                    value={newRecord.notes}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" onClick={handleAddRecord}>
            {t('fuelUse.addRecordButton')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* View Record Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-info text-white">
          <Modal.Title className="d-flex align-items-center gap-2">
            <i className="bx bx-show"></i>
            Fuel Record Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <Row>
              <Col md={6}>
                <div className="mb-3">
                  <strong>Vehicle Number:</strong>
                  <p className="mb-1">{selectedRecord.vehicleNumber}</p>
                </div>
                <div className="mb-3">
                  <strong>Date:</strong>
                  <p className="mb-1">{selectedRecord.date}</p>
                </div>
                <div className="mb-3">
                  <strong>Record Type:</strong>
                  <p className="mb-1">{getRecordTypeBadge(selectedRecord.recordType)}</p>
                </div>
                <div className="mb-3">
                  <strong>Quantity:</strong>
                  <p className="mb-1">{selectedRecord.quantity} L</p>
                </div>
              </Col>
              <Col md={6}>
                <div className="mb-3">
                  <strong>Odometer:</strong>
                  <p className="mb-1">{selectedRecord.odometer} km</p>
                </div>
                <div className="mb-3">
                  <strong>Fuel Type:</strong>
                  <p className="mb-1">{selectedRecord.fuelType}</p>
                </div>
                <div className="mb-3">
                  <strong>Efficiency:</strong>
                  <p className="mb-1">{selectedRecord.efficiency} km/L</p>
                </div>
                <div className="mb-3">
                  <strong>Notes:</strong>
                  <p className="mb-1">{selectedRecord.notes || 'No notes'}</p>
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

      {/* Edit Record Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-primary text-white">
          <Modal.Title className="d-flex align-items-center gap-2">
            <i className="bx bx-edit-alt"></i>
            Edit Fuel Record
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editingRecord && (
            <Form>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Vehicle Number *</Form.Label>
                    <Form.Control
                      type="text"
                      value={editingRecord.vehicleNumber}
                      onChange={(e) => setEditingRecord({...editingRecord, vehicleNumber: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date *</Form.Label>
                    <Form.Control
                      type="date"
                      value={editingRecord.date}
                      onChange={(e) => setEditingRecord({...editingRecord, date: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Record Type</Form.Label>
                    <Form.Select
                      value={editingRecord.recordType}
                      onChange={(e) => setEditingRecord({...editingRecord, recordType: e.target.value})}
                    >
                      <option value="fuel_fill">Fuel Fill</option>
                      <option value="fuel_consumption">Fuel Consumption</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inspection">Inspection</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Quantity (Liters) *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={editingRecord.quantity}
                      onChange={(e) => setEditingRecord({...editingRecord, quantity: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Odometer (km) *</Form.Label>
                    <Form.Control
                      type="number"
                      value={editingRecord.odometer}
                      onChange={(e) => setEditingRecord({...editingRecord, odometer: e.target.value})}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Fuel Type</Form.Label>
                    <Form.Select
                      value={editingRecord.fuelType}
                      onChange={(e) => setEditingRecord({...editingRecord, fuelType: e.target.value})}
                    >
                      <option value="diesel">Diesel</option>
                      <option value="petrol">Petrol</option>
                      <option value="cng">CNG</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
              
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Efficiency (km/L)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.1"
                      value={editingRecord.efficiency}
                      onChange={(e) => setEditingRecord({...editingRecord, efficiency: e.target.value})}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Notes</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={2}
                      value={editingRecord.notes}
                      onChange={(e) => setEditingRecord({...editingRecord, notes: e.target.value})}
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowEditModal(false)}
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

export default FuelUseRecords;
