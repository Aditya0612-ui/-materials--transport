// src/components/maintenance/ServiceHistory.jsx
import React, { useState } from 'react';
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
      'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
      'Cancelled': 'bg-red-100 text-red-700 border-red-200'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {status}
      </span>
    );
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
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <i className="bx bx-file text-emerald-600"></i>
            {t('serviceHistory.title')}
          </h2>
          <p className="text-slate-500 mt-1">{t('serviceHistory.subtitle')}</p>
        </div>
        <button
          onClick={() => handleShowModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <i className="bx bx-plus text-xl"></i>
          {t('serviceHistory.addRecord')}
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

      {/* Filters and Search */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="lg:col-span-1">
            <div className="relative">
              <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl"></i>
              <input
                type="text"
                placeholder={t('serviceHistory.searchPlaceholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                style={{ color: '#1e293b' }}
              />
            </div>
          </div>
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              style={{ color: '#1e293b' }}
            >
              <option value="all">{t('serviceHistory.allStatus')}</option>
              <option value="Completed">{t('serviceHistory.completed')}</option>
              <option value="In Progress">{t('serviceHistory.inProgress')}</option>
              <option value="Cancelled">{t('serviceHistory.cancelled')}</option>
            </select>
          </div>
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              style={{ color: '#1e293b' }}
            >
              <option value="serviceDate">{t('serviceHistory.sortByDate')}</option>
              <option value="cost">{t('serviceHistory.sortByCost')}</option>
              <option value="rating">{t('serviceHistory.sortByRating')}</option>
              <option value="vehicleName">{t('serviceHistory.sortByVehicle')}</option>
            </select>
          </div>
          <div>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="w-full px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-200 flex items-center justify-center gap-2"
            >
              <i className={`bx bx-sort-${sortOrder === 'asc' ? 'up' : 'down'} text-xl`}></i>
              {sortOrder === 'asc' ? t('common.ascending') : t('common.descending')}
            </button>
          </div>
        </div>
      </div>

      {/* Service History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h5 className="font-semibold text-slate-800 flex items-center gap-2">
            <i className="bx bx-history text-emerald-600"></i>
            {t('serviceHistory.serviceRecords')}
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
              {filteredHistory.length}
            </span>
          </h5>
        </div>
        <div className="overflow-x-auto scrollbar-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase text-slate-700 font-semibold tracking-wider">
                <th className="px-6 py-4">{t('serviceHistory.vehicle')}</th>
                <th className="px-6 py-4">{t('serviceHistory.serviceDetails')}</th>
                <th className="px-6 py-4">{t('serviceHistory.dateDuration')}</th>
                <th className="px-6 py-4">{t('serviceHistory.cost')}</th>
                <th className="px-6 py-4">{t('serviceHistory.rating')}</th>
                <th className="px-6 py-4">{t('serviceHistory.status')}</th>
                <th className="px-6 py-4 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredHistory.length > 0 ? (
                filteredHistory.map((service, index) => (
                  <tr key={`${service.id}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-800 text-base">{service.vehicleId}</div>
                        <div className="text-base text-slate-500">{service.vehicleName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="font-medium text-slate-800 text-base">{service.serviceType}</div>
                        <div className="text-sm text-slate-500">{service.serviceCenter}</div>
                        <div className="text-sm text-blue-600">{service.technician}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-800 text-base">{new Date(service.serviceDate).toLocaleDateString()}</div>
                        <div className="text-base text-slate-500">{service.kmReading?.toLocaleString()} km</div>
                        <div className="text-sm text-blue-600 mt-1">{service.duration}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-emerald-600 text-base">{formatCurrency(service.cost)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {getRatingStars(service.rating)}
                        <span className="ml-2 text-sm text-slate-500">({service.rating})</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(service.status)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleShowDetails(service)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="View Details"
                        >
                          <i className="bx bx-show text-lg"></i>
                        </button>
                        <button
                          onClick={() => handleShowModal(service)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 transition-all"
                          title="Edit Service"
                        >
                          <i className="bx bx-edit text-lg"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Delete Service"
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
                      <i className="bx bx-file-blank text-3xl text-slate-300"></i>
                    </div>
                    <h5 className="text-slate-600 font-medium mb-1">No service records found</h5>
                    <p className="text-slate-400 text-sm">Click "Add Service Record" to add your first service record.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="bx bx-file-blank text-emerald-600"></i>
                {t('serviceHistory.serviceDetailsTitle')} - {selectedService?.invoiceNumber}
              </h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <div className="p-6">
              {selectedService && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h6 className="font-semibold text-emerald-600 mb-3 border-b border-slate-200 pb-2">
                      {t('serviceHistory.vehicleInformation')}
                    </h6>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm">{t('serviceHistory.vehicleId')}:</span>
                        <span className="font-medium text-slate-800">{selectedService.vehicleId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm">{t('serviceHistory.vehicleName')}:</span>
                        <span className="font-medium text-slate-800">{selectedService.vehicleName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm">{t('serviceHistory.kmReading')}:</span>
                        <span className="font-medium text-slate-800">{selectedService.kmReading?.toLocaleString()} km</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h6 className="font-semibold text-emerald-600 mb-3 border-b border-slate-200 pb-2">
                      {t('serviceHistory.serviceInformation')}
                    </h6>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm">{t('serviceHistory.serviceType')}:</span>
                        <span className="font-medium text-slate-800">{selectedService.serviceType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm">{t('serviceHistory.serviceDate')}:</span>
                        <span className="font-medium text-slate-800">{new Date(selectedService.serviceDate).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm">{t('serviceHistory.duration')}:</span>
                        <span className="font-medium text-slate-800">{selectedService.duration}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 text-sm">{t('serviceHistory.cost')}:</span>
                        <span className="font-bold text-emerald-600">{formatCurrency(selectedService.cost)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <h6 className="font-semibold text-emerald-600 mb-3 border-b border-slate-200 pb-2">
                      {t('serviceHistory.serviceFeedback')}
                    </h6>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-sm">{t('serviceHistory.rating')}:</span>
                        <div className="flex items-center">
                          {getRatingStars(selectedService.rating)}
                          <span className="ml-2 text-sm font-medium text-slate-700">({selectedService.rating}/5)</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500 text-sm block mb-1">Feedback:</span>
                        <p className="text-slate-800 bg-white p-3 rounded-lg border border-slate-200 text-sm">
                          {selectedService.feedback || 'No feedback provided.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end rounded-b-2xl">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                {t('common.close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Service Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="bx bx-plus text-emerald-600"></i>
                {editingService ? t('serviceHistory.editRecord') : t('serviceHistory.addNewRecord')}
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
                  <label className="text-sm font-medium text-slate-700">
                    {t('serviceHistory.vehicleId')} *
                  </label>
                  <input
                    type="text"
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('serviceHistory.vehicleName')} *
                  </label>
                  <input
                    type="text"
                    name="vehicleName"
                    value={formData.vehicleName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('serviceHistory.serviceDate')} *
                  </label>
                  <input
                    type="date"
                    name="serviceDate"
                    value={formData.serviceDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('serviceHistory.serviceType')} *
                  </label>
                  <input
                    type="text"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('serviceHistory.cost')} (₹) *
                  </label>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('serviceHistory.kmReading')}
                  </label>
                  <input
                    type="number"
                    name="kmReading"
                    value={formData.kmReading}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('serviceHistory.serviceCenter')}
                  </label>
                  <input
                    type="text"
                    name="serviceCenter"
                    value={formData.serviceCenter}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('serviceHistory.technician')}
                  </label>
                  <input
                    type="text"
                    name="technician"
                    value={formData.technician}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('serviceHistory.duration')}
                  </label>
                  <input
                    type="text"
                    name="duration"
                    value={formData.duration}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 hours"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('serviceHistory.ratingLabel')}
                  </label>
                  <select
                    name="rating"
                    value={formData.rating}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="1">1 Star</option>
                    <option value="2">2 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="5">5 Stars</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {t('serviceHistory.feedback')}
                </label>
                <textarea
                  rows={2}
                  name="feedback"
                  value={formData.feedback}
                  onChange={handleInputChange}
                  placeholder={t('serviceHistory.feedbackPlaceholder')}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm shadow-emerald-200 transition-all flex items-center gap-2"
                >
                  <i className="bx bx-save"></i>
                  {editingService ? t('serviceHistory.updateRecord') : t('serviceHistory.addRecordButton')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceHistory;
