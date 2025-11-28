// src/components/maintenance/PartsInventory.jsx
import React, { useState } from 'react';
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
  const [activeDropdown, setActiveDropdown] = useState(null);

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
      setActiveDropdown(null);
    } catch (err) {
      console.error('Error updating stock:', err);
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Critical Stock': 'bg-red-100 text-red-700 border-red-200',
      'Low Stock': 'bg-amber-100 text-amber-700 border-amber-200',
      'In Stock': 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {status}
      </span>
    );
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
    const percentage = Math.min(100, Math.max(0, (current / maximum) * 100));
    const status = getStockStatus(current, minimum);

    let colorClass = 'bg-emerald-500';
    if (status.color === 'danger') colorClass = 'bg-red-500';
    else if (status.color === 'warning') colorClass = 'bg-amber-500';

    return (
      <div className="w-full">
        <div className="w-full bg-slate-100 rounded-full h-2 mb-1">
          <div
            className={`h-2 rounded-full ${colorClass}`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <small className="text-slate-500 text-xs">
          {current} / {maximum} ({percentage.toFixed(0)}%)
        </small>
      </div>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <i className="bx bx-cog text-emerald-600"></i>
            Parts Inventory
          </h2>
          <p className="text-slate-500 mt-1">Manage vehicle parts and spare parts inventory</p>
        </div>
        <button
          onClick={() => handleShowModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <i className="bx bx-plus text-xl"></i>
          Add New Part
        </button>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="bx bx-error-circle text-xl"></i>
            <span>{error}</span>
          </div>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <i className="bx bx-x text-xl"></i>
          </button>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <i className="bx bx-package text-2xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{stats.totalParts}</div>
              <div className="text-sm text-slate-500">Total Parts</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600">
              <i className="bx bx-rupee text-2xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800" title={formatCurrency(stats.totalValue)}>
                {formatCurrencyForCard(stats.totalValue)}
              </div>
              <div className="text-sm text-slate-500">Total Value</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center text-red-600">
              <i className="bx bx-error text-2xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{stats.criticalStock}</div>
              <div className="text-sm text-slate-500">Critical Stock</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
              <i className="bx bx-time text-2xl"></i>
            </div>
            <div>
              <div className="text-2xl font-bold text-slate-800">{stats.lowStock}</div>
              <div className="text-sm text-slate-500">Low Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Alerts */}
      {(stats.criticalStock > 0 || stats.lowStock > 0) && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 px-4 py-3 rounded-lg flex items-start gap-3">
          <i className="bx bx-error-circle text-xl mt-0.5"></i>
          <div>
            <strong className="font-semibold">Stock Alert:</strong> You have {stats.criticalStock} parts with critical stock levels
            and {stats.lowStock} parts with low stock levels that need attention.
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl"></i>
              <input
                type="text"
                placeholder="Search by part name, number, or brand..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              />
            </div>
          </div>
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="all">All Status</option>
              <option value="Critical Stock">Critical Stock</option>
              <option value="Low Stock">Low Stock</option>
              <option value="In Stock">In Stock</option>
            </select>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            >
              <option value="partName">Sort by Name</option>
              <option value="category">Sort by Category</option>
              <option value="currentStock">Sort by Stock</option>
              <option value="unitPrice">Sort by Price</option>
              <option value="totalValue">Sort by Value</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 h-12 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-200 flex items-center justify-center"
              title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
            >
              <i className={`bx bx-sort-${sortOrder === 'asc' ? 'up' : 'down'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Parts Inventory Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h5 className="font-semibold text-slate-800 flex items-center gap-2">
            <i className="bx bx-list-ul text-emerald-600"></i>
            Parts Inventory
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
              {filteredParts.length}
            </span>
          </h5>
        </div>
        <div className="overflow-x-auto scrollbar-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase text-slate-700 font-semibold tracking-wider">
                <th className="px-6 py-4">Part Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Stock Status</th>
                <th className="px-6 py-4">Pricing</th>
                <th className="px-6 py-4">Supplier</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredParts.length > 0 ? (
                filteredParts.map((part, index) => (
                  <tr key={`${part.id}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-800 text-base">{part.partName}</div>
                        <div className="text-base text-slate-500">{part.partNumber}</div>
                        <div className="text-xs text-blue-600 mt-1">{part.brand}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-slate-700 text-base">
                        <i className={`bx ${getCategoryIcon(part.category)} mr-2 text-xl text-slate-400`}></i>
                        <span>{part.category}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-2">
                        {getStatusBadge(part.status)}
                        {getStockProgressBar(part.currentStock, part.minimumStock, part.maximumStock)}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-800 text-base">
                          {formatCurrency(part.unitPrice)}
                          <span className="text-slate-400 text-sm font-normal ml-1">/{part.unit}</span>
                        </div>
                        <div className="text-sm text-emerald-600 mt-1">
                          Total: {formatCurrency(part.totalValue)}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-800 text-base">{part.supplier}</div>
                        <div className="text-sm text-slate-500">{part.supplierContact}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{part.location}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <div className="relative">
                          <button
                            onClick={() => setActiveDropdown(activeDropdown === part.id ? null : part.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                            title="Update Stock"
                          >
                            <i className="bx bx-package text-lg"></i>
                          </button>
                          {activeDropdown === part.id && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-100 z-10 py-1">
                              <div className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-50">
                                Update Stock
                              </div>
                              <button
                                onClick={() => handleStockUpdate(part.id, part.currentStock + 10)}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
                              >
                                Add 10 units
                              </button>
                              <button
                                onClick={() => handleStockUpdate(part.id, part.currentStock + 50)}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-emerald-600"
                              >
                                Add 50 units
                              </button>
                              <button
                                onClick={() => handleStockUpdate(part.id, Math.max(0, part.currentStock - 10))}
                                className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-red-600"
                              >
                                Remove 10 units
                              </button>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={() => handleShowModal(part)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                          title="Edit Part"
                        >
                          <i className="bx bx-edit text-lg"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(part.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Delete Part"
                        >
                          <i className="bx bx-trash text-lg"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="bx bx-package text-3xl text-slate-300"></i>
                    </div>
                    <h5 className="text-slate-600 font-medium mb-1">No parts found</h5>
                    <p className="text-slate-400 text-sm">Click "Add New Part" to add your first part to inventory.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Part Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="bx bx-plus text-emerald-600"></i>
                {editingPart ? 'Edit Part' : 'Add New Part'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Part Number *</label>
                  <input
                    type="text"
                    name="partNumber"
                    value={formData.partNumber}
                    onChange={handleInputChange}
                    placeholder="e.g., EO-15W40-7L"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Part Name *</label>
                  <input
                    type="text"
                    name="partName"
                    value={formData.partName}
                    onChange={handleInputChange}
                    placeholder="e.g., Engine Oil 15W-40"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  >
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Brand *</label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    placeholder="e.g., Castrol"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Description</label>
                <textarea
                  rows={2}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Part description and specifications..."
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Current Stock *</label>
                  <input
                    type="number"
                    name="currentStock"
                    value={formData.currentStock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Minimum Stock *</label>
                  <input
                    type="number"
                    name="minimumStock"
                    value={formData.minimumStock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Maximum Stock *</label>
                  <input
                    type="number"
                    name="maximumStock"
                    value={formData.maximumStock}
                    onChange={handleInputChange}
                    min="0"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Unit Price (₹) *</label>
                  <input
                    type="number"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Unit *</label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  >
                    <option value="Pieces">Pieces</option>
                    <option value="Liters">Liters</option>
                    <option value="Kilograms">Kilograms</option>
                    <option value="Meters">Meters</option>
                    <option value="Set">Set</option>
                    <option value="Pair">Pair</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Supplier</label>
                  <input
                    type="text"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleInputChange}
                    placeholder="e.g., Castrol India Ltd"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Supplier Contact</label>
                  <input
                    type="text"
                    name="supplierContact"
                    value={formData.supplierContact}
                    onChange={handleInputChange}
                    placeholder="e.g., +91 9876543210"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Storage Location</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    placeholder="e.g., Warehouse A - Rack 1"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Expiry Date</label>
                  <input
                    type="date"
                    name="expiryDate"
                    value={formData.expiryDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Vehicle Compatibility</label>
                <input
                  type="text"
                  name="vehicleCompatibility"
                  value={formData.vehicleCompatibility}
                  onChange={handleInputChange}
                  placeholder="e.g., Tata LPT 1613, Ashok Leyland 1616 (comma separated)"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm shadow-emerald-200 transition-all flex items-center gap-2"
                >
                  <i className="bx bx-save"></i>
                  {editingPart ? 'Update Part' : 'Add Part'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PartsInventory;
