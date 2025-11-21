// src/components/maintenance/MaintenanceSchedule.jsx
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
  Dropdown,
  Alert,
  ProgressBar
} from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useMaintenanceContext } from '../../context/MaintenanceContext';
import './MaintenanceStyles.css';

const MaintenanceSchedule = () => {
  const { t } = useTranslation();
  const {
    maintenanceSchedule,
    addMaintenanceSchedule,
    updateMaintenanceSchedule,
    deleteMaintenanceSchedule,
    formatCurrency,
    loading,
    error,
    setError
  } = useMaintenanceContext();

  // Component ready for user input

  const [showModal, setShowModal] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [sortBy, setSortBy] = useState('scheduledDate');
  const [sortOrder, setSortOrder] = useState('asc');

  const [formData, setFormData] = useState({
    vehicleId: '',
    vehicleName: '',
    maintenanceType: 'Preventive',
    serviceType: '',
    scheduledDate: '',
    scheduledTime: '',
    priority: 'Medium',
    status: 'Scheduled',
    estimatedCost: '',
    estimatedDuration: '',
    serviceCenter: '',
    serviceContact: '',
    description: '',
    assignedTechnician: '',
    notes: ''
  });

  // Filter and sort maintenance schedule
  const filteredSchedule = maintenanceSchedule
    .filter(item => {
      const matchesSearch = 
        item.vehicleId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.serviceType.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      const matchesPriority = filterPriority === 'all' || item.priority === filterPriority;
      
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'scheduledDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      } else if (sortBy === 'estimatedCost') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleShowModal = (schedule = null) => {
    if (schedule) {
      setEditingSchedule(schedule);
      setFormData({
        vehicleId: schedule.vehicleId,
        vehicleName: schedule.vehicleName,
        maintenanceType: schedule.maintenanceType,
        serviceType: schedule.serviceType,
        scheduledDate: schedule.scheduledDate,
        scheduledTime: schedule.scheduledTime,
        priority: schedule.priority,
        status: schedule.status || 'Scheduled',
        estimatedCost: schedule.estimatedCost.toString(),
        estimatedDuration: schedule.estimatedDuration,
        serviceCenter: schedule.serviceCenter,
        serviceContact: schedule.serviceContact,
        description: schedule.description,
        assignedTechnician: schedule.assignedTechnician,
        notes: schedule.notes || ''
      });
    } else {
      setEditingSchedule(null);
      setFormData({
        vehicleId: '',
        vehicleName: '',
        maintenanceType: 'Preventive',
        serviceType: '',
        scheduledDate: '',
        scheduledTime: '',
        priority: 'Medium',
        status: 'Scheduled',
        estimatedCost: '',
        estimatedDuration: '',
        serviceCenter: '',
        serviceContact: '',
        description: '',
        assignedTechnician: '',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchedule(null);
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
    
    // Validate required fields
    if (!formData.vehicleId || !formData.vehicleName || !formData.serviceType || 
        !formData.scheduledDate || !formData.scheduledTime || !formData.estimatedCost) {
      setError('Please fill in all required fields');
      return;
    }
    
    const scheduleData = {
      ...formData,
      estimatedCost: parseFloat(formData.estimatedCost) || 0,
      currentKm: Math.floor(Math.random() * 50000) + 20000, // Random for demo
      nextDueKm: Math.floor(Math.random() * 60000) + 40000, // Random for demo
      lastService: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    console.log('Submitting schedule data:', scheduleData);

    try {
      let result;
      if (editingSchedule) {
        console.log('Updating schedule with ID:', editingSchedule.id);
        result = await updateMaintenanceSchedule(editingSchedule.id, scheduleData);
      } else {
        console.log('Adding new schedule');
        result = await addMaintenanceSchedule(scheduleData);
      }

      console.log('Operation result:', result);

      if (result && result.success) {
        console.log('Schedule saved successfully');
        handleCloseModal();
      } else {
        console.error('Failed to save schedule:', result?.error);
        setError(result?.error || 'Failed to save maintenance schedule');
      }
    } catch (err) {
      console.error('Error saving maintenance schedule:', err);
      setError(err.message || 'An error occurred while saving');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this maintenance schedule?')) {
      try {
        console.log('Deleting schedule with ID:', id);
        const result = await deleteMaintenanceSchedule(id);
        console.log('Delete result:', result);
        
        if (!result || !result.success) {
          setError(result?.error || 'Failed to delete maintenance schedule');
        }
      } catch (err) {
        console.error('Error deleting maintenance schedule:', err);
        setError(err.message || 'An error occurred while deleting');
      }
    }
  };


  const getStatusBadge = (status) => {
    const statusColors = {
      'Scheduled': 'primary',
      'In Progress': 'warning',
      'Completed': 'success',
      'Pending': 'secondary',
      'Cancelled': 'danger'
    };
    return <Badge bg={statusColors[status] || 'secondary'}>{status}</Badge>;
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'Critical': 'danger',
      'High': 'warning',
      'Medium': 'info',
      'Low': 'success'
    };
    return <Badge bg={priorityColors[priority] || 'secondary'}>{priority}</Badge>;
  };

  const getMaintenanceTypeBadge = (type) => {
    const typeColors = {
      'Preventive': 'success',
      'Corrective': 'warning',
      'Emergency': 'danger'
    };
    return <Badge bg={typeColors[type] || 'secondary'}>{type}</Badge>;
  };

  return (
    <Container fluid className="maintenance-schedule-container">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">
                <i className="bx bx-calendar me-2"></i>
                {t('maintenanceSchedule.title')}
              </h2>
              <p className="text-muted mb-0">{t('maintenanceSchedule.subtitle')}</p>
            </div>
            <Button 
              variant="success" 
              onClick={() => handleShowModal()}
              className="d-flex align-items-center"
            >
              <i className="bx bx-plus me-2"></i>
              {t('maintenanceSchedule.scheduleButton')}
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
        <Col md={4}>
          <InputGroup>
            <InputGroup.Text>
              <i className="bx bx-search"></i>
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder={t('maintenanceSchedule.searchPlaceholder')}
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
            <option value="all">{t('maintenanceSchedule.allStatus')}</option>
            <option value="Scheduled">{t('maintenanceSchedule.scheduled')}</option>
            <option value="In Progress">{t('serviceHistory.inProgress')}</option>
            <option value="Pending">{t('maintenanceSchedule.pending')}</option>
            <option value="Completed">{t('serviceHistory.completed')}</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
          >
            <option value="all">{t('maintenanceSchedule.allPriority')}</option>
            <option value="Critical">{t('maintenanceSchedule.critical')}</option>
            <option value="High">{t('maintenanceSchedule.high')}</option>
            <option value="Medium">{t('maintenanceSchedule.medium')}</option>
            <option value="Low">{t('maintenanceSchedule.low')}</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="scheduledDate">{t('maintenanceSchedule.sortByDate')}</option>
            <option value="priority">{t('maintenanceSchedule.sortByPriority')}</option>
            <option value="estimatedCost">{t('maintenanceSchedule.sortByCost')}</option>
            <option value="vehicleName">{t('maintenanceSchedule.sortByVehicle')}</option>
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

      {/* Maintenance Schedule Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0">
            <i className="bx bx-list-ul me-2"></i>
            {t('maintenanceSchedule.scheduledMaintenance')} ({filteredSchedule.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>{t('maintenanceSchedule.vehicleDetails')}</th>
                  <th>{t('maintenanceSchedule.serviceInfo')}</th>
                  <th>{t('maintenanceSchedule.schedule')}</th>
                  <th>{t('maintenanceSchedule.priority')}</th>
                  <th>{t('maintenanceSchedule.status')}</th>
                  <th>{t('maintenanceSchedule.cost')}</th>
                  <th>{t('maintenanceSchedule.technician')}</th>
                  <th>{t('common.actions')}</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedule.length > 0 ? (
                  filteredSchedule.map((schedule, index) => (
                  <tr key={`${schedule.id}-${index}`}>
                    <td>
                      <div>
                        <strong>{schedule.vehicleId}</strong>
                        <br />
                        <small className="text-muted">{schedule.vehicleName}</small>
                        <br />
                        <small className="text-info">
                          {schedule.currentKm?.toLocaleString()} km
                        </small>
                      </div>
                    </td>
                    <td>
                      <div>
                        {getMaintenanceTypeBadge(schedule.maintenanceType)}
                        <br />
                        <strong>{schedule.serviceType}</strong>
                        <br />
                        <small className="text-muted">{schedule.serviceCenter}</small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{new Date(schedule.scheduledDate).toLocaleDateString()}</strong>
                        <br />
                        <small className="text-muted">{schedule.scheduledTime}</small>
                        <br />
                        <small className="text-info">{schedule.estimatedDuration}</small>
                      </div>
                    </td>
                    <td>
                      {getPriorityBadge(schedule.priority)}
                    </td>
                    <td>
                      {getStatusBadge(schedule.status)}
                    </td>
                    <td>
                      <strong>{formatCurrency(schedule.estimatedCost)}</strong>
                    </td>
                    <td>
                      <div>
                        <strong>{schedule.assignedTechnician}</strong>
                        <br />
                        <small className="text-muted">{schedule.serviceContact}</small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleShowModal(schedule)}
                          title="Edit Schedule"
                        >
                          <i className="bx bx-edit"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(schedule.id)}
                          title="Delete Schedule"
                        >
                          <i className="bx bx-trash"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="text-center py-5">
                      <i className="bx bx-calendar-x display-1 text-muted"></i>
                      <h5 className="mt-3 text-muted">No maintenance schedules found</h5>
                      <p className="text-muted">Click "Schedule New Maintenance" to add your first maintenance schedule.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add/Edit Modal */}
      <Modal show={showModal} onHide={handleCloseModal} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bx bx-calendar-plus me-2"></i>
            {editingSchedule ? t('maintenanceSchedule.editMaintenanceSchedule') : t('maintenanceSchedule.scheduleNewMaintenance')}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            {loading && (
              <div className="text-center mb-3">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">{t('common.loading')}</span>
                </div>
                <p className="mt-2 text-muted">{t('maintenanceSchedule.savingSchedule')}</p>
              </div>
            )}
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('serviceHistory.vehicleId')} *</Form.Label>
                  <Form.Control
                    type="text"
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleInputChange}
                    placeholder="e.g., TN34AB1234"
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
                    placeholder="e.g., Tata LPT 1613"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('maintenanceSchedule.maintenanceType')} *</Form.Label>
                  <Form.Select
                    name="maintenanceType"
                    value={formData.maintenanceType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Preventive">{t('maintenanceSchedule.preventive')}</option>
                    <option value="Corrective">{t('maintenanceSchedule.corrective')}</option>
                    <option value="Emergency">{t('maintenanceSchedule.emergency')}</option>
                  </Form.Select>
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
                    placeholder="e.g., Engine Oil Change"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('maintenanceSchedule.scheduledDate')} *</Form.Label>
                  <Form.Control
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('maintenanceSchedule.scheduledTime')} *</Form.Label>
                  <Form.Control
                    type="time"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('maintenanceSchedule.priority')} *</Form.Label>
                  <Form.Select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Low">{t('maintenanceSchedule.low')}</option>
                    <option value="Medium">{t('maintenanceSchedule.medium')}</option>
                    <option value="High">{t('maintenanceSchedule.high')}</option>
                    <option value="Critical">{t('maintenanceSchedule.critical')}</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('maintenanceSchedule.status')} *</Form.Label>
                  <Form.Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Scheduled">{t('maintenanceSchedule.scheduled')}</option>
                    <option value="In Progress">{t('serviceHistory.inProgress')}</option>
                    <option value="Completed">{t('serviceHistory.completed')}</option>
                    <option value="Pending">{t('maintenanceSchedule.pending')}</option>
                    <option value="Cancelled">{t('serviceHistory.cancelled')}</option>
                  </Form.Select>
                  <Form.Text className="text-muted">
                    {t('maintenanceSchedule.currentStatus')}
                  </Form.Text>
                </Form.Group>
              </Col>
            </Row>

            {formData.status === 'Completed' && (
              <Row>
                <Col md={12}>
                  <Alert variant="success" className="mb-3">
                    <i className="bx bx-check-circle me-2"></i>
                    {t('maintenanceSchedule.completedAlert')}
                  </Alert>
                </Col>
              </Row>
            )}
            {formData.status === 'In Progress' && (
              <Row>
                <Col md={12}>
                  <Alert variant="info" className="mb-3">
                    <i className="bx bx-time-five me-2"></i>
                    {t('maintenanceSchedule.inProgressAlert')}
                  </Alert>
                </Col>
              </Row>
            )}
            {formData.status === 'Cancelled' && (
              <Row>
                <Col md={12}>
                  <Alert variant="warning" className="mb-3">
                    <i className="bx bx-error-circle me-2"></i>
                    {t('maintenanceSchedule.cancelledAlert')}
                  </Alert>
                </Col>
              </Row>
            )}

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('maintenanceSchedule.estimatedCost')} (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="estimatedCost"
                    value={formData.estimatedCost}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="100"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('maintenanceSchedule.estimatedDuration')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 hours"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('maintenanceSchedule.assignedTechnician')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="assignedTechnician"
                    value={formData.assignedTechnician}
                    onChange={handleInputChange}
                    placeholder="e.g., Rajesh Kumar"
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
                    placeholder="e.g., Tata Motors Service Center"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>{t('maintenanceSchedule.serviceContact')}</Form.Label>
                  <Form.Control
                    type="text"
                    name="serviceContact"
                    value={formData.serviceContact}
                    onChange={handleInputChange}
                    placeholder="e.g., +91 9876543210"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>{t('maintenanceSchedule.description')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder={t('maintenanceSchedule.descriptionPlaceholder')}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>{t('maintenanceSchedule.additionalNotes')}</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder={t('maintenanceSchedule.notesPlaceholder')}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              {t('common.cancel')}
            </Button>
            <Button variant="success" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  {t('maintenanceSchedule.saving')}
                </>
              ) : (
                <>
                  <i className="bx bx-save me-2"></i>
                  {editingSchedule ? t('maintenanceSchedule.updateSchedule') : t('maintenanceSchedule.scheduleMaintenance')}
                </>
              )}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default MaintenanceSchedule;
