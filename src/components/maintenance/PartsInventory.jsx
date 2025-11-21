// src/components/maintenance/PartsInventory.jsx
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
  ProgressBar,
  Dropdown
} from 'react-bootstrap';
import { useMaintenanceContext } from '../../context/MaintenanceContext';
import './MaintenanceStyles.css';

const PartsInventory = () => {
  const {
    partsInventory,
    addPart,
    updatePart,
    deletePart,
    getStockStatus,
    formatCurrency,
    getPartsStats,
    loading,
    error,
    setError
  } = useMaintenanceContext();

  // Component ready for user input

  const [showModal, setShowModal] = useState(false);
  const [editingPart, setEditingPart] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('partName');
  const [sortOrder, setSortOrder] = useState('asc');

  const stats = getPartsStats();

  // Helper function to format currency for display in cards
  const formatCurrencyForCard = (amount) => {
    const formatted = formatCurrency(amount);
    // If the formatted currency is too long, create a compact version
    if (formatted.length > 10) {
      if (amount >= 10000000) { // 1 crore or more
        return `₹${(amount / 10000000).toFixed(1)}Cr`;
      } else if (amount >= 100000) { // 1 lakh or more
        return `₹${(amount / 100000).toFixed(1)}L`;
      }
    }
    return formatted;
  };

  const [formData, setFormData] = useState({
    partNumber: '',
    partName: '',
    category: 'Engine Parts',
    brand: '',
    description: '',
    currentStock: '',
    minimumStock: '',
    maximumStock: '',
    unitPrice: '',
    unit: 'Pieces',
    supplier: '',
    supplierContact: '',
    location: '',
    expiryDate: '',
    vehicleCompatibility: ''
  });

  const categories = [
    'Engine Parts',
    'Brake System',
    'Filters',
    'Lubricants',
    'Tires',
    'Electrical',
    'Body Parts',
    'Suspension',
    'Transmission',
    'Cooling System'
  ];

  // Filter and sort parts inventory
  const filteredParts = partsInventory
    .filter(item => {
      const matchesSearch = 
        item.partName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || item.status === filterStatus;
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortBy === 'unitPrice' || sortBy === 'totalValue' || sortBy === 'currentStock') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

  const handleShowModal = (part = null) => {
    if (part) {
      setEditingPart(part);
      setFormData({
        partNumber: part.partNumber || '',
        partName: part.partName || '',
        category: part.category || 'Engine Parts',
        brand: part.brand || '',
        description: part.description || '',
        currentStock: part.currentStock ? part.currentStock.toString() : '',
        minimumStock: part.minimumStock ? part.minimumStock.toString() : '',
        maximumStock: part.maximumStock ? part.maximumStock.toString() : '',
        unitPrice: part.unitPrice ? part.unitPrice.toString() : '',
        unit: part.unit || 'Pieces',
        supplier: part.supplier || '',
        supplierContact: part.supplierContact || '',
        location: part.location || '',
        expiryDate: part.expiryDate || '',
        vehicleCompatibility: Array.isArray(part.vehicleCompatibility) 
          ? part.vehicleCompatibility.join(', ') 
          : (part.vehicleCompatibility || '')
      });
    } else {
      setEditingPart(null);
      setFormData({
        partNumber: '',
        partName: '',
        category: 'Engine Parts',
        brand: '',
        description: '',
        currentStock: '',
        minimumStock: '',
        maximumStock: '',
        unitPrice: '',
        unit: 'Pieces',
        supplier: '',
        supplierContact: '',
        location: '',
        expiryDate: '',
        vehicleCompatibility: ''
      });
    }
    setShowModal(true);
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
    
    const partData = {
      ...formData,
      currentStock: parseInt(formData.currentStock),
      minimumStock: parseInt(formData.minimumStock),
      maximumStock: parseInt(formData.maximumStock),
      unitPrice: parseFloat(formData.unitPrice),
      vehicleCompatibility: formData.vehicleCompatibility.split(',').map(v => v.trim()).filter(v => v),
      lastPurchaseDate: new Date().toISOString().split('T')[0],
      lastPurchaseQuantity: parseInt(formData.currentStock),
      lastPurchasePrice: parseFloat(formData.unitPrice),
      reorderLevel: Math.ceil(parseInt(formData.minimumStock) * 1.2),
      averageConsumption: Math.floor(Math.random() * 10) + 1
    };

    try {
      let result;
      if (editingPart) {
        result = await updatePart(editingPart.id, partData);
      } else {
        result = await addPart(partData);
      }

      if (result.success) {
        setShowModal(false);
      }
    } catch (err) {
      console.error('Error saving part:', err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this part from inventory?')) {
      try {
        await deletePart(id);
      } catch (err) {
        console.error('Error deleting part:', err);
      }
    }
  };

  const handleStockUpdate = async (id, newStock) => {
    try {
      await updatePart(id, { currentStock: newStock });
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusInfo = getStockStatus(1, 1); // Get color mapping
    const statusColors = {
      'Critical Stock': 'danger',
      'Low Stock': 'warning',
      'In Stock': 'success'
    };
    return <Badge bg={statusColors[status] || 'secondary'}>{status}</Badge>;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      'Engine Parts': 'bx-cog',
      'Brake System': 'bx-stop-circle',
      'Filters': 'bx-filter',
      'Lubricants': 'bx-droplet',
      'Tires': 'bx-circle',
      'Electrical': 'bx-bolt',
      'Body Parts': 'bx-car',
      'Suspension': 'bx-up-arrow-alt',
      'Transmission': 'bx-transfer',
      'Cooling System': 'bx-wind'
    };
    return icons[category] || 'bx-package';
  };

  const getStockProgressBar = (current, minimum, maximum) => {
    const percentage = (current / maximum) * 100;
    const status = getStockStatus(current, minimum);
    
    return (
      <div>
        <ProgressBar 
          now={percentage} 
          variant={status.color === 'danger' ? 'danger' : status.color === 'warning' ? 'warning' : 'success'}
          style={{ height: '8px' }}
        />
        <small className="text-muted">
          {current} / {maximum} {percentage.toFixed(0)}%
        </small>
      </div>
    );
  };

  return (
    <Container fluid className="parts-inventory-container">
      <Row className="mb-4">
        <Col>
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-0">
                <i className="bx bx-cog me-2"></i>
                Parts Inventory
              </h2>
              <p className="text-muted mb-0">Manage vehicle parts and spare parts inventory</p>
            </div>
            <Button 
              variant="success" 
              onClick={() => handleShowModal()}
              className="d-flex align-items-center"
            >
              <i className="bx bx-plus me-2"></i>
              Add New Part
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

      {/* Statistics Cards */}
      <Row className="mb-4 g-3">
        <Col xl={3} lg={6} md={6} sm={6}>
          <Card className="stats-card border-0 shadow-sm h-100">
            <Card.Body>
              <div className="stats-icon bg-primary">
                <i className="bx bx-package"></i>
              </div>
              <div className="stats-content ms-3">
                <div className="stats-value">{stats.totalParts}</div>
                <div className="stats-label">Total Parts</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6} md={6} sm={6}>
          <Card className="stats-card border-0 shadow-sm h-100">
            <Card.Body>
              <div className="stats-icon bg-success">
                <i className="bx bx-rupee"></i>
              </div>
              <div className="stats-content ms-3">
                <div 
                  className={`stats-value currency ${formatCurrency(stats.totalValue).length > 10 ? 'compact' : ''}`}
                  title={formatCurrency(stats.totalValue)}
                >
                  {formatCurrencyForCard(stats.totalValue)}
                </div>
                <div className="stats-label">Total Value</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6} md={6} sm={6}>
          <Card className="stats-card border-0 shadow-sm h-100">
            <Card.Body>
              <div className="stats-icon bg-danger">
                <i className="bx bx-error"></i>
              </div>
              <div className="stats-content ms-3">
                <div className="stats-value">{stats.criticalStock}</div>
                <div className="stats-label">Critical Stock</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
        <Col xl={3} lg={6} md={6} sm={6}>
          <Card className="stats-card border-0 shadow-sm h-100">
            <Card.Body>
              <div className="stats-icon bg-warning">
                <i className="bx bx-time"></i>
              </div>
              <div className="stats-content ms-3">
                <div className="stats-value">{stats.lowStock}</div>
                <div className="stats-label">Low Stock</div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Stock Alerts */}
      {(stats.criticalStock > 0 || stats.lowStock > 0) && (
        <Row className="mb-4">
          <Col>
            <Alert variant="warning" className="d-flex align-items-center">
              <i className="bx bx-error-circle me-2"></i>
              <div>
                <strong>Stock Alert:</strong> You have {stats.criticalStock} parts with critical stock levels 
                and {stats.lowStock} parts with low stock levels that need attention.
              </div>
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
              placeholder="Search by part name, number, or brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
        </Col>
        <Col md={2}>
          <Form.Select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="Critical Stock">Critical Stock</option>
            <option value="Low Stock">Low Stock</option>
            <option value="In Stock">In Stock</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Form.Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="partName">Sort by Name</option>
            <option value="category">Sort by Category</option>
            <option value="currentStock">Sort by Stock</option>
            <option value="unitPrice">Sort by Price</option>
            <option value="totalValue">Sort by Value</option>
          </Form.Select>
        </Col>
        <Col md={2}>
          <Button
            variant="outline-secondary"
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="w-100"
          >
            <i className={`bx bx-sort-${sortOrder === 'asc' ? 'up' : 'down'}`}></i>
            {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
          </Button>
        </Col>
      </Row>

      {/* Parts Inventory Table */}
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-white border-bottom">
          <h5 className="mb-0">
            <i className="bx bx-list-ul me-2"></i>
            Parts Inventory ({filteredParts.length})
          </h5>
        </Card.Header>
        <Card.Body className="p-0">
          <div className="table-responsive">
            <Table hover className="mb-0">
              <thead className="table-light">
                <tr>
                  <th>Part Details</th>
                  <th>Category</th>
                  <th>Stock Status</th>
                  <th>Pricing</th>
                  <th>Supplier</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParts.length > 0 ? (
                  filteredParts.map((part, index) => (
                  <tr key={`${part.id}-${index}`}>
                    <td>
                      <div>
                        <strong>{part.partName}</strong>
                        <br />
                        <small className="text-muted">{part.partNumber}</small>
                        <br />
                        <small className="text-info">{part.brand}</small>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center">
                        <i className={`bx ${getCategoryIcon(part.category)} me-2`}></i>
                        <span>{part.category}</span>
                      </div>
                    </td>
                    <td>
                      <div>
                        {getStatusBadge(part.status)}
                        <br />
                        {getStockProgressBar(part.currentStock, part.minimumStock, part.maximumStock)}
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{formatCurrency(part.unitPrice)}</strong>
                        <small className="text-muted">/{part.unit}</small>
                        <br />
                        <small className="text-success">
                          Total: {formatCurrency(part.totalValue)}
                        </small>
                      </div>
                    </td>
                    <td>
                      <div>
                        <strong>{part.supplier}</strong>
                        <br />
                        <small className="text-muted">{part.supplierContact}</small>
                      </div>
                    </td>
                    <td>
                      <small className="text-muted">{part.location}</small>
                    </td>
                    <td>
                      <div className="d-flex gap-2">
                        <Dropdown>
                          <Dropdown.Toggle 
                            variant="outline-info" 
                            size="sm"
                            id={`stock-dropdown-${part.id}`}
                          >
                            <i className="bx bx-package"></i>
                          </Dropdown.Toggle>
                          <Dropdown.Menu>
                            <Dropdown.Header>Update Stock</Dropdown.Header>
                            <Dropdown.Item 
                              onClick={() => handleStockUpdate(part.id, part.currentStock + 10)}
                            >
                              Add 10 units
                            </Dropdown.Item>
                            <Dropdown.Item 
                              onClick={() => handleStockUpdate(part.id, part.currentStock + 50)}
                            >
                              Add 50 units
                            </Dropdown.Item>
                            <Dropdown.Item 
                              onClick={() => handleStockUpdate(part.id, Math.max(0, part.currentStock - 10))}
                            >
                              Remove 10 units
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown>
                        <Button
                          variant="outline-primary"
                          size="sm"
                          onClick={() => handleShowModal(part)}
                          title="Edit Part"
                        >
                          <i className="bx bx-edit"></i>
                        </Button>
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDelete(part.id)}
                          title="Delete Part"
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
                      <i className="bx bx-package display-1 text-muted"></i>
                      <h5 className="mt-3 text-muted">No parts found</h5>
                      <p className="text-muted">Click "Add New Part" to add your first part to inventory.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* Add/Edit Part Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <i className="bx bx-plus me-2"></i>
            {editingPart ? 'Edit Part' : 'Add New Part'}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Part Number *</Form.Label>
                  <Form.Control
                    type="text"
                    name="partNumber"
                    value={formData.partNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., EO-15W40-7L"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Part Name *</Form.Label>
                  <Form.Control
                    type="text"
                    name="partName"
                    value={formData.partName}
                    onChange={handleInputChange}
                    placeholder="e.g., Engine Oil 15W-40"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Category *</Form.Label>
                  <Form.Select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Brand *</Form.Label>
                  <Form.Control
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g., Castrol"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Description</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Part description and specifications..."
              />
            </Form.Group>

            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Current Stock *</Form.Label>
                  <Form.Control
                    type="number"
                    name="currentStock"
                    value={formData.currentStock}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Minimum Stock *</Form.Label>
                  <Form.Control
                    type="number"
                    name="minimumStock"
                    value={formData.minimumStock}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Maximum Stock *</Form.Label>
                  <Form.Control
                    type="number"
                    name="maximumStock"
                    value={formData.maximumStock}
                    onChange={handleInputChange}
                    min="0"
                    required
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit Price (₹) *</Form.Label>
                  <Form.Control
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Unit *</Form.Label>
                  <Form.Select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="Pieces">Pieces</option>
                    <option value="Liters">Liters</option>
                    <option value="Kilograms">Kilograms</option>
                    <option value="Meters">Meters</option>
                    <option value="Set">Set</option>
                    <option value="Pair">Pair</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Supplier</Form.Label>
                  <Form.Control
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    placeholder="e.g., Castrol India Ltd"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Supplier Contact</Form.Label>
                  <Form.Control
                    type="text"
                    name="supplierContact"
                    value={formData.supplierContact}
                    onChange={handleInputChange}
                    placeholder="e.g., +91 9876543210"
                  />
                </Form.Group>
              </Col>
            </Row>

            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Storage Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Warehouse A - Rack 1"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Expiry Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Vehicle Compatibility</Form.Label>
              <Form.Control
                type="text"
                name="vehicleCompatibility"
                value={formData.vehicleCompatibility}
                onChange={handleInputChange}
                placeholder="e.g., Tata LPT 1613, Ashok Leyland 1616 (comma separated)"
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button variant="success" type="submit">
              <i className="bx bx-save me-2"></i>
              {editingPart ? 'Update Part' : 'Add Part'}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default PartsInventory;
