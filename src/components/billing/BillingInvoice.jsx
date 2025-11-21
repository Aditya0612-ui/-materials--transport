import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Form, Badge, Modal, Alert, Spinner, Container, InputGroup } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import 'boxicons/css/boxicons.min.css';
import html2pdf from 'html2pdf.js';
import FirebaseService from '../../services/firebaseService';
import './BillingStyles.css';

const BillingInvoice = () => {
  const { t } = useTranslation();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState({ show: false, message: '', variant: 'success' });
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Format date as DD/MM/YYYY for consistent display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Load trips from Firebase
  useEffect(() => {
    const unsubscribe = FirebaseService.subscribeToTrips((tripsData) => {
      setTrips(tripsData);
    });

    return () => unsubscribe();
  }, []);

  const handleViewInvoice = (trip) => {
    setSelectedTrip(trip);
    setShowInvoiceModal(true);
  };

  const handlePrintInvoice = () => {
    const element = document.getElementById('invoice-content');
    
    const opt = {
      margin: [10, 10, 10, 10],
      filename: `Invoice_${selectedTrip?.tripId || 'document'}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { 
        scale: 2.5,
        useCORS: true,
        letterRendering: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 850,
        windowHeight: 1200,
        scrollY: 0,
        scrollX: 0
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: false
      },
      pagebreak: { mode: 'avoid-all' }
    };

    html2pdf().set(opt).from(element).save();
  };

  const getStatusBadge = (status) => {
    const variants = {
      'planned': 'info',
      'in-progress': 'warning',
      'completed': 'success',
      'cancelled': 'danger'
    };
    const statusLabels = {
      'planned': t('billing.planned'),
      'in-progress': t('billing.inProgress'),
      'completed': t('billing.completed'),
      'cancelled': t('billing.cancelled')
    };
    return <Badge bg={variants[status] || 'secondary'}>{statusLabels[status] || status?.toUpperCase()}</Badge>;
  };

  const filteredTrips = trips.filter(trip => {
    const matchesSearch = 
      trip.tripId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.vehicleNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !filterStatus || trip.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <Container fluid className="billing-invoice py-4 no-print">
      {/* Header Section */}
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="mb-1">
                <i className="bx bx-receipt me-2 text-success"></i>{t('billing.title')}
              </h2>
              <p className="text-muted mb-0">{t('billing.subtitle')}</p>
            </div>
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

      {/* Filters Section */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h6 className="mb-0"><i className="bx bx-filter me-2"></i>{t('billing.filtersSearch')}</h6>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
                <Col lg={6} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="bx bx-search me-1 text-success"></i>{t('billing.searchInvoices')}
                    </Form.Label>
                    <InputGroup>
                      <InputGroup.Text><i className="bx bx-search"></i></InputGroup.Text>
                      <Form.Control
                        type="text"
                        placeholder={t('billing.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col lg={6} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-semibold">
                      <i className="bx bx-check-circle me-1 text-success"></i>{t('billing.status')}
                    </Form.Label>
                    <Form.Select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="">{t('billing.allStatus')}</option>
                      <option value="planned">{t('billing.planned')}</option>
                      <option value="in-progress">{t('billing.inProgress')}</option>
                      <option value="completed">{t('billing.completed')}</option>
                      <option value="cancelled">{t('billing.cancelled')}</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Invoices Table */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-light">
              <h6 className="mb-0">
                <i className="bx bx-list-ul me-2"></i>{t('billing.tripInvoices')}
              </h6>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">{t('billing.loading')}</span>
                  </Spinner>
                </div>
              ) : (
                <Table responsive striped hover className="mb-0">
                  <thead>
                    <tr>
                      <th>{t('billing.tripId')}</th>
                      <th>{t('billing.orderId')}</th>
                      <th>{t('billing.customer')}</th>
                      <th>{t('billing.vehicle')}</th>
                      <th>{t('billing.date')}</th>
                      <th>{t('billing.amount')}</th>
                      <th>{t('billing.status')}</th>
                      <th className="text-center">{t('billing.actions')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTrips.length === 0 ? (
                      <tr>
                        <td colSpan="8" className="text-center py-4">
                          <div className="text-muted">
                            <i className="bx bx-receipt fs-1 d-block mb-2"></i>
                            {t('billing.noInvoicesFound')}
                            <br />
                            <small>{t('billing.createTripsMessage')}</small>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredTrips.map(trip => (
                        <tr key={trip.firebaseId || trip.tripId}>
                          <td><strong>{trip.tripId}</strong></td>
                          <td>{trip.orderId}</td>
                          <td>
                            <div>
                              <strong>{trip.customerName}</strong>
                              <br />
                              <small className="text-muted">
                                <i className="bx bx-phone me-1"></i>
                                {trip.customerPhone}
                              </small>
                            </div>
                          </td>
                          <td>{trip.vehicleNumber}</td>
                          <td>{new Date(trip.startDate).toLocaleDateString()}</td>
                          <td className="text-success">
                            <strong>₹{parseFloat(trip.total || 0).toFixed(2)}</strong>
                          </td>
                          <td>{getStatusBadge(trip.status)}</td>
                          <td className="text-center">
                            <Button
                              variant="outline-success"
                              size="sm"
                              onClick={() => handleViewInvoice(trip)}
                              title={t('billing.viewInvoice')}
                            >
                              <i className="bx bx-show"></i> {t('billing.view')}
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

      {/* Invoice Modal */}
      <Modal 
        show={showInvoiceModal} 
        onHide={() => setShowInvoiceModal(false)} 
        size="xl"
        className="invoice-modal"
      >
        <Modal.Header closeButton className="no-print">
          <Modal.Title>
            <i className="bx bx-receipt me-2"></i>
            {t('billing.invoice')} - {selectedTrip?.tripId}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedTrip && (
            <div className="invoice-container" id="invoice-content">
              {/* Invoice Header */}
              <div className="invoice-header text-center mb-4">
                <h2 className="text-success mb-1">{t('billing.companyName')}</h2>
                <p className="text-muted mb-0">{t('billing.companySubtitle')}</p>
                <p className="text-muted">
                  <i className="bx bx-phone me-1"></i>+91 1234567890 | 
                  <i className="bx bx-envelope ms-2 me-1"></i>info@transport.com
                </p>
                <hr className="my-3" />
                <h4 className="text-uppercase">{t('billing.taxInvoice')}</h4>
              </div>

              {/* Invoice Details */}
              <Row className="mb-4">
                <Col md={6}>
                  <div className="border rounded p-3">
                    <h6 className="text-success mb-3">{t('billing.billTo')}</h6>
                    <p className="mb-1"><strong>{selectedTrip.customerName}</strong></p>
                    <p className="mb-1">
                      <i className="bx bx-phone me-1"></i>{selectedTrip.customerPhone}
                    </p>
                    {selectedTrip.customerAddress && (
                      <p className="mb-1">
                        <i className="bx bx-map me-1"></i>{selectedTrip.customerAddress}
                      </p>
                    )}
                    {selectedTrip.gstNumber && (
                      <p className="mb-0">
                        <strong>{t('billing.gstNo')}</strong> {selectedTrip.gstNumber}
                      </p>
                    )}
                  </div>
                </Col>
                <Col md={6}>
                  <div className="border rounded p-3">
                    <h6 className="text-success mb-3">{t('billing.invoiceDetails')}</h6>
                    <Row>
                      <Col xs={6}><strong>{t('billing.invoiceNo')}</strong></Col>
                      <Col xs={6}>{selectedTrip.tripId}</Col>
                    </Row>
                    <Row>
                      <Col xs={6}><strong>{t('billing.orderId')}</strong></Col>
                      <Col xs={6}>{selectedTrip.orderId}</Col>
                    </Row>
                    <Row>
                      <Col xs={6}><strong>{t('billing.date')}</strong></Col>
                      <Col xs={6}>{new Date(selectedTrip.startDate).toLocaleDateString()}</Col>
                    </Row>
                    <Row>
                      <Col xs={6}><strong>{t('billing.vehicle')}</strong></Col>
                      <Col xs={6}>{selectedTrip.vehicleNumber}</Col>
                    </Row>
                    <Row>
                      <Col xs={6}><strong>{t('transport.driverName')}</strong></Col>
                      <Col xs={6}>{selectedTrip.driverName}</Col>
                    </Row>
                  </div>
                </Col>
              </Row>

              {/* Route Details */}
              <Row className="mb-4">
                <Col>
                  <div className="border rounded p-3 bg-light">
                    <Row>
                      <Col md={5}>
                        <strong>{t('billing.from')}</strong> {selectedTrip.fromLocation}
                      </Col>
                      <Col md={2} className="text-center">
                        <i className="bx bx-right-arrow-alt fs-4 text-success"></i>
                      </Col>
                      <Col md={5}>
                        <strong>{t('billing.to')}</strong> {selectedTrip.toLocation}
                      </Col>
                    </Row>
                    {selectedTrip.distance && (
                      <Row className="mt-2">
                        <Col className="text-center">
                          <strong>{t('billing.distance')}</strong> {selectedTrip.distance} km
                        </Col>
                      </Row>
                    )}
                  </div>
                </Col>
              </Row>

              {/* Materials Table */}
              <div className="mb-4">
                <h6 className="text-success mb-3">{t('billing.materialDetails')}</h6>
                <Table bordered className="invoice-table">
                  <thead className="table-success">
                    <tr>
                      <th>{t('billing.sNo')}</th>
                      <th>{t('billing.material')}</th>
                      <th>{t('billing.quantity')}</th>
                      <th>{t('billing.unit')}</th>
                      <th>{t('billing.rate')}</th>
                      <th className="text-end">{t('billing.amount')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedTrip.materials?.map((material, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{material.material}</td>
                        <td>{material.quantity}</td>
                        <td>{material.unit}</td>
                        <td>{parseFloat(material.rate).toFixed(2)}</td>
                        <td className="text-end">{parseFloat(material.amount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>

              {/* Totals Section */}
              <Row>
                <Col md={7}></Col>
                <Col md={5}>
                  <Table bordered className="invoice-totals">
                    <tbody>
                      <tr>
                        <td><strong>{t('billing.materialsTotal')}</strong></td>
                        <td className="text-end">₹{parseFloat(selectedTrip.materialsTotal || 0).toFixed(2)}</td>
                      </tr>
                      {selectedTrip.transportCharges > 0 && (
                        <tr>
                          <td><strong>{t('billing.transportCharges')}</strong></td>
                          <td className="text-end">₹{parseFloat(selectedTrip.transportCharges || 0).toFixed(2)}</td>
                        </tr>
                      )}
                      {selectedTrip.otherCharges > 0 && (
                        <tr>
                          <td><strong>{t('billing.otherCharges')}</strong></td>
                          <td className="text-end">₹{parseFloat(selectedTrip.otherCharges || 0).toFixed(2)}</td>
                        </tr>
                      )}
                      <tr>
                        <td><strong>{t('billing.subtotal')}</strong></td>
                        <td className="text-end">₹{parseFloat(selectedTrip.subtotal || 0).toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td><strong>{t('billing.gst')}</strong></td>
                        <td className="text-end">₹{parseFloat(selectedTrip.gst || 0).toFixed(2)}</td>
                      </tr>
                      <tr className="table-success">
                        <td><strong>{t('billing.grandTotal')}</strong></td>
                        <td className="text-end"><strong className="fs-5">₹{parseFloat(selectedTrip.total || 0).toFixed(2)}</strong></td>
                      </tr>
                    </tbody>
                  </Table>
                </Col>
              </Row>

              {/* Footer */}
              <div className="invoice-footer mt-5 pt-3 border-top">
                <Row>
                  <Col md={6}>
                    <p className="mb-1"><strong>{t('billing.termsConditions')}</strong></p>
                    <ul className="small text-muted">
                      <li>{t('billing.paymentDue')}</li>
                      <li>{t('billing.disputes')}</li>
                      <li>{t('billing.goodsReturn')}</li>
                    </ul>
                  </Col>
                  <Col md={6} className="text-end">
                    <div className="mt-5 pt-3">
                      <p className="mb-0">_______________________</p>
                      <p className="mb-0"><strong>{t('billing.authorizedSignature')}</strong></p>
                    </div>
                  </Col>
                </Row>
                <div className="text-center mt-4 pt-3 border-top">
                  <p className="text-muted small mb-0">
                    {t('billing.thankYou')}
                  </p>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="no-print">
          <Button variant="secondary" onClick={() => setShowInvoiceModal(false)}>
            {t('billing.close')}
          </Button>
          <Button variant="success" onClick={handlePrintInvoice}>
            <i className="bx bx-printer me-2"></i>
            {t('billing.printDownload')}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default BillingInvoice;
