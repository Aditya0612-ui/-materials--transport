// src/components/maintenance/ServiceHistory.jsx
import React, { useState } from 'react';
import { 
  Container, 
  Row, 
  Col, 
  Card, 
  Table, 
  Button, 
  Badge, 
  Modal, 
  Form, 
  InputGroup,
  Alert,
  ListGroup,
  Accordion
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useMaintenanceContext } from '../../context/MaintenanceContext';
import './MaintenanceStyles.css';

const ServiceHistory = () => {
  const { t } = useTranslation();
  const {
    serviceHistory,
    addServiceHistory,
    updateServiceHistory,
    deleteServiceHistory,
    deleteAllServiceHistory,
    formatCurrency,
    loading,
    error,
    setError
  } = useMaintenanceContext();

  // Component ready for user input

  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedService, setSelectedService] = useState(null);
  const [editingService, setEditingService] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('serviceDate');
  const [sortOrder, setSortOrder] = useState('desc');

  const [formData, setFormData] = useState({
    vehicleId: '',
    vehicleName: '',
    serviceDate: '',
    serviceType: '',
    serviceCenter: '',
    technician: '',
    cost: '',
    duration: '',
    kmReading: '',
    workDone: '',
    partsUsed: '',
    feedback: '',
    rating: '5'
  });

  // Filter and sort service history
  const filteredHistory = serviceHistory
    .filter(item => {
      const matchesSearch = 
        item.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'serviceDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'cost') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleShowModal = (service = null) => {
    if (service) {
      setEditingService(service);
      setFormData({
        vehicleId: service.vehicleId || '',
        vehicleName: service.vehicleName || '',
        serviceDate: service.serviceDate || '',
        serviceType: service.serviceType || '',
        serviceCenter: service.serviceCenter || '',
        technician: service.technician || '',
        cost: service.cost ? service.cost.toString() : '',
        duration: service.duration || '',
        kmReading: service.kmReading ? service.kmReading.toString() : '',
        workDone: Array.isArray(service.workDone) ? service.workDone.join('\n') : (service.workDone || ''),
        partsUsed: Array.isArray(service.partsUsed) 
          ? service.partsUsed.map(part => `${part.name || ''} - ${part.quantity || ''} - ₹${part.cost || 0}`).join('\n')
          : (service.partsUsed || ''),
        feedback: service.feedback || '',
        rating: service.rating ? service.rating.toString() : '5'
      });
    } else {
      setEditingService(null);
      setFormData({
        vehicleId: '',
        vehicleName: '',
        serviceDate: '',
        serviceType: '',
        serviceCenter: '',
        technician: '',
        cost: '',
        duration: '',
        kmReading: '',
        workDone: '',
        partsUsed: '',
        feedback: '',
        rating: '5'
      });
    }
    setShowModal(true);
  };

  const handleShowDetails = (service) => {
    setSelectedService(service);
    setShowDetailsModal(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    const kmReading = formData.kmReading ? parseInt(formData.kmReading) : 0;
    
    const serviceData = {
      ...formData,
      cost: parseFloat(formData.cost),
      kmReading: kmReading,
      rating: parseFloat(formData.rating),
      workDone: [],
      partsUsed: [],
      status: 'Completed',
      nextServiceDue: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      nextServiceKm: kmReading + 5000,
      warranty: '6 months',
      invoiceNumber: editingService?.invoiceNumber || `INV-${Date.now()}`
    };

    try {
      let result;
      if (editingService) {
        result = await updateServiceHistory(editingService.id, serviceData);
      } else {
        result = await addServiceHistory(serviceData);
      }

      if (result.success) {
        setShowModal(false);
      }
    } catch (err) {
      console.error('Error saving service history:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this service record?')) {
      try {
        await deleteServiceHistory(id);
      } catch (err) {
        console.error('Error deleting service history:', err);
      }
    }
  };

  const handleDeleteAll = async () => {
    const confirmMessage = `⚠️ WARNING: Delete All Service History Records?\n\nThis will permanently delete ALL ${serviceHistory.length} service history records from the database.\n\nThis action CANNOT be undone!\n\nAre you absolutely sure you want to proceed?`;
    
    if (window.confirm(confirmMessage)) {
      // Double confirmation for safety
      const doubleConfirm = window.confirm('🚨 FINAL CONFIRMATION\n\nClick OK to permanently delete ALL service history records.\nClick Cancel to abort.');
      
      if (doubleConfirm) {
        try {
          const result = await deleteAllServiceHistory();
          if (result && result.success) {
            alert('✅ All service history records have been deleted successfully!');
          } else {
            alert('❌ Error deleting records: ' + (result?.error || 'Unknown error'));
          }
        } catch (err) {
          console.error('Error deleting all service history:', err);
          alert('❌ Error deleting records: ' + err.message);
        }
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Completed': 'success',
      'In Progress': 'warning',
      'Cancelled': 'danger'
    };
    return <Badge bg={statusColors[status] || 'secondary'}>{status}</Badge>;
  };

  const getRatingStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <i 
          key={i} 
          className={`bx ${i <= rating ? 'bxs-star' : 'bx-star'}`}
          style={{ color: i <= rating ? '#ffc107' : '#dee2e6' }}
        ></i>
      );
    }
    return stars;
  };

  return (
    <Container fluid className="service-history-container">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">
                <i className="bx bx-file me-2"></i>
                {t('serviceHistory.title')}
              </h2>
              <p className="text-muted mb-0">{t('serviceHistory.subtitle')}</p>
            </div>
            <Button 
              variant="success" 
              onClick={() => handleShowModal()}
              className="d-flex align-items-center"
            >
              <i className="bx bx-plus me-2"></i>
              {t('serviceHistory.addRecord')}
            </Button>
          </div>
        </Col>
      </Row>

      {/* Error Alert */}
      {error && (
        <Row className="mb-4">
          <Col>
            <Alert variant="danger" dismissible onClose={() => setError(null)}>
              <Alert.Heading>Error</Alert.Heading>
              {error}
            </Alert>
          </Col>
        </Row>
      )}

      {/* Filters and Search */}
      <Row className="mb-4">
        <Col md={6}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bx bx-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder={t('serviceHistory.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={2}>
          <Form.Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">{t('serviceHistory.allStatus')}</option>
            <option value="Completed">{t('serviceHistory.completed')}</option>
            <option value="In Progress">{t('serviceHistory.inProgress')}</option>
            <option value="Cancelled">{t('serviceHistory.cancelled')}</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="serviceDate">{t('serviceHistory.sortByDate')}</option>
            <option value="cost">{t('serviceHistory.sortByCost')}</option>
            <option value="rating">{t('serviceHistory.sortByRating')}</option>
            <option value="vehicleName">{t('serviceHistory.sortByVehicle')}</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button
            variant="outline-secondary"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="w-100"
          >
            <i className={`bx bx-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
            {sortOrder === 'asc' ? t('common.ascending') : t('common.descending')}
          </Button>
        </Col>
      </Row>

      {/* Service History Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0">
            <i className="bx bx-history me-2"></i>
            {t('serviceHistory.serviceRecords')} ({filteredHistory.length})
          </h5>
        </Card.Header>
        <Card.Body>
          <div className="table-responsive">
            <Table responsive striped hover>
              <thead>
                <tr>
                  <th>{t('serviceHistory.vehicle')}</th>
                  <th>{t('serviceHistory.serviceDetails')}</th>
                  <th>{t('serviceHistory.dateDuration')}</th>
                  <th>{t('serviceHistory.cost')}</th>
                  <th>{t('serviceHistory.rating')}</th>
                  <th>{t('serviceHistory.status')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredHistory.length > 0 ? (
                  filteredHistory.map((service, index) => (
                  <tr key={`${service.id}-${index}`}>
                    <td>
                      <div>
                        <strong>{service.vehicleId}</strong>
                        <br />
                        <small className="text-muted">{service.vehicleName}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{service.serviceType}</strong>
                        <br />
                        <small className="text-muted">{service.serviceCenter}</small>
                        <br />
                        <small className="text-info">{service.technician}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{new Date(service.serviceDate).toLocaleDateString()}</strong>
                        <br />
                        <small className="text-muted">{service.kmReading?.toLocaleString()} km</small>
                        <br />
                        <small className="text-info">{service.duration}</small>
                      </div>
                    </td>
                    <td>
                      <strong>{formatCurrency(service.cost)}</strong>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        {getRatingStars(service.rating)}
                        <small className="ms-2">({service.rating})</small>
                      </div>
                    </td>
                    <td>
                      {getStatusBadge(service.status)}
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-info"
                          size="sm"
                          onClick={() => handleShowDetails(service)}
                          title="View Details"
                        >
                          <i className="bx bx-show"></i>
                        </Button>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleShowModal(service)}
                          title="Edit Service"
                        >
                          <i className="bx bx-edit"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
                          title="Delete Service"
                        >
                          <i className="bx bx-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center py-5">
                      <i className="bx bx-file-blank display-1 text-muted"></i>
                      <h5 className="mt-3 text-muted">No service records found</h5>
                      <p className="text-muted">Click "Add Service Record" to add your first service record.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Service Details Modal */}
      <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bx bx-file-blank me-2"></i>
            {t('serviceHistory.serviceDetailsTitle')} - {selectedService?.invoiceNumber}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedService && (
            <Row>
              <Col md={6}>
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <h6 className="text-primary">{t('serviceHistory.vehicleInformation')}</h6>
                    <p><strong>{t('serviceHistory.vehicleId')}:</strong> {selectedService.vehicleId}</p>
                    <p><strong>{t('serviceHistory.vehicleName')}:</strong> {selectedService.vehicleName}</p>
                    <p><strong>{t('serviceHistory.kmReading')}:</strong> {selectedService.kmReading?.toLocaleString()} km</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={6}>
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <h6 className="text-primary">{t('serviceHistory.serviceInformation')}</h6>
                    <p><strong>{t('serviceHistory.serviceType')}:</strong> {selectedService.serviceType}</p>
                    <p><strong>{t('serviceHistory.serviceDate')}:</strong> {new Date(selectedService.serviceDate).toLocaleDateString()}</p>
                    <p><strong>{t('serviceHistory.duration')}:</strong> {selectedService.duration}</p>
                    <p><strong>{t('serviceHistory.cost')}:</strong> {formatCurrency(selectedService.cost)}</p>
                  </Card.Body>
                </Card>
              </Col>
              <Col md={12} className="mt-3">
                <Card className="border-0 bg-light">
                  <Card.Body>
                    <h6 className="text-primary">{t('serviceHistory.serviceFeedback')}</h6>
                    <div className="d-flex align-items-center mb-2">
                      <span className="me-2">{t('serviceHistory.rating')}:</span>
                      {getRatingStars(selectedService.rating)}
                      <span className="ms-2">({selectedService.rating}/5)</span>
                    </div>
                    <p className="mb-0">{selectedService.feedback}</p>
                  </Card.Body>
                </Card>
              </Col>
            </Row>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>
            {t('common.close')}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Add/Edit Service Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bx bx-plus me-2"></i>
            {editingService ? t('serviceHistory.editRecord') : t('serviceHistory.addNewRecord')}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('serviceHistory.vehicleId')} *</Form.Label>
                  <Form.Control
                    type="text"
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('serviceHistory.vehicleName')} *</Form.Label>
                  <Form.Control
                    type="text"
                    name="vehicleName"
                    value={formData.vehicleName}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('serviceHistory.serviceDate')} *</Form.Label>
                  <Form.Control
                    type="date"
                    name="serviceDate"
                    value={formData.serviceDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('serviceHistory.serviceType')} *</Form.Label>
                  <Form.Control
                    type="text"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('serviceHistory.cost')} (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('serviceHistory.kmReading')}</Form.Label>
                  <Form.Control
                    type="number"
                    name="kmReading"
                    value={formData.kmReading}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('serviceHistory.serviceCenter')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="serviceCenter"
                    value={formData.serviceCenter}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('serviceHistory.technician')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="technician"
                    value={formData.technician}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('serviceHistory.duration')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 hours"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('serviceHistory.ratingLabel')}</Form.Label>
                  <Form.Select
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                  >
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Form.Group className="mb-3">
              <Form.Label>{t('serviceHistory.feedback')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="feedback"
                value={formData.feedback}
                onChange={handleInputChange}
                placeholder={t('serviceHistory.feedbackPlaceholder')}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="success" type="submit">
              <i className="bx bx-save me-2"></i>
              {editingService ? t('serviceHistory.updateRecord') : t('serviceHistory.addRecordButton')}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default ServiceHistory;
