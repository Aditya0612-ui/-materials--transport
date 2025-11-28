// src/components/maintenance/MaintenanceSchedule.jsx
import React, { useState } from 'react';
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
      'Scheduled': 'bg-blue-100 text-blue-700 border-blue-200',
      'In Progress': 'bg-amber-100 text-amber-700 border-amber-200',
      'Completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Pending': 'bg-slate-100 text-slate-700 border-slate-200',
      'Cancelled': 'bg-red-100 text-red-700 border-red-200'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {status}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      'Critical': 'bg-red-100 text-red-700 border-red-200',
      'High': 'bg-orange-100 text-orange-700 border-orange-200',
      'Medium': 'bg-blue-100 text-blue-700 border-blue-200',
      'Low': 'bg-emerald-100 text-emerald-700 border-emerald-200'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priorityColors[priority] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {priority}
      </span>
    );
  };

  const getMaintenanceTypeBadge = (type) => {
    const typeColors = {
      'Preventive': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'Corrective': 'bg-amber-100 text-amber-700 border-amber-200',
      'Emergency': 'bg-red-100 text-red-700 border-red-200'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${typeColors[type] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {type}
      </span>
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <i className="bx bx-calendar text-emerald-600"></i>
            {t('maintenanceSchedule.title')}
          </h2>
          <p className="text-slate-500 mt-1">{t('maintenanceSchedule.subtitle')}</p>
        </div>
        <button
          onClick={() => handleShowModal()}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <i className="bx bx-plus text-xl"></i>
          {t('maintenanceSchedule.scheduleButton')}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="lg:col-span-2">
            <div className="relative">
              <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl"></i>
              <input
                type="text"
                placeholder={t('maintenanceSchedule.searchPlaceholder')}
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
              <option value="all">{t('maintenanceSchedule.allStatus')}</option>
              <option value="Scheduled">{t('maintenanceSchedule.scheduled')}</option>
              <option value="In Progress">{t('serviceHistory.inProgress')}</option>
              <option value="Pending">{t('maintenanceSchedule.pending')}</option>
              <option value="Completed">{t('serviceHistory.completed')}</option>
            </select>
          </div>
          <div>
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              style={{ color: '#1e293b' }}
            >
              <option value="all">{t('maintenanceSchedule.allPriority')}</option>
              <option value="Critical">{t('maintenanceSchedule.critical')}</option>
              <option value="High">{t('maintenanceSchedule.high')}</option>
              <option value="Medium">{t('maintenanceSchedule.medium')}</option>
              <option value="Low">{t('maintenanceSchedule.low')}</option>
            </select>
          </div>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              style={{ color: '#1e293b' }}
            >
              <option value="scheduledDate">{t('maintenanceSchedule.sortByDate')}</option>
              <option value="priority">{t('maintenanceSchedule.sortByPriority')}</option>
              <option value="estimatedCost">{t('maintenanceSchedule.sortByCost')}</option>
              <option value="vehicleName">{t('maintenanceSchedule.sortByVehicle')}</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors border border-slate-200"
              title={sortOrder === 'asc' ? t('common.ascending') : t('common.descending')}
            >
              <i className={`bx bx-sort-${sortOrder === 'asc' ? 'up' : 'down'} text-xl`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Maintenance Schedule Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h5 className="font-semibold text-slate-800 flex items-center gap-2">
            <i className="bx bx-list-ul text-emerald-600"></i>
            {t('maintenanceSchedule.scheduledMaintenance')}
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
              {filteredSchedule.length}
            </span>
          </h5>
        </div>
        <div className="overflow-x-auto scrollbar-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase text-slate-700 font-semibold tracking-wider">
                <th className="px-6 py-4">{t('maintenanceSchedule.vehicleDetails')}</th>
                <th className="px-6 py-4">{t('maintenanceSchedule.serviceInfo')}</th>
                <th className="px-6 py-4">{t('maintenanceSchedule.schedule')}</th>
                <th className="px-6 py-4">{t('maintenanceSchedule.priority')}</th>
                <th className="px-6 py-4">{t('maintenanceSchedule.status')}</th>
                <th className="px-6 py-4">{t('maintenanceSchedule.cost')}</th>
                <th className="px-6 py-4">{t('maintenanceSchedule.technician')}</th>
                <th className="px-6 py-4 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSchedule.length > 0 ? (
                filteredSchedule.map((schedule, index) => (
                  <tr key={`${schedule.id}-${index}`} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-bold text-slate-800 text-base">{schedule.vehicleId}</div>
                        <div className="text-base text-slate-500">{schedule.vehicleName}</div>
                        <div className="text-sm text-blue-600 mt-1">
                          {schedule.currentKm?.toLocaleString()} km
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {getMaintenanceTypeBadge(schedule.maintenanceType)}
                        <div className="font-medium text-slate-800 text-base">{schedule.serviceType}</div>
                        <div className="text-sm text-slate-500">{schedule.serviceCenter}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-800 text-base">{new Date(schedule.scheduledDate).toLocaleDateString()}</div>
                        <div className="text-base text-slate-500">{schedule.scheduledTime}</div>
                        <div className="text-sm text-blue-600 mt-1">{schedule.estimatedDuration}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(schedule.priority)}
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(schedule.status)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-emerald-600 text-base">{formatCurrency(schedule.estimatedCost)}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-slate-800 text-base">{schedule.assignedTechnician}</div>
                        <div className="text-sm text-slate-500">{schedule.serviceContact}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleShowModal(schedule)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="Edit Schedule"
                        >
                          <i className="bx bx-edit text-lg"></i>
                        </button>
                        <button
                          onClick={() => handleDelete(schedule.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Delete Schedule"
                        >
                          <i className="bx bx-trash text-lg"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="text-center py-12">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                      <i className="bx bx-calendar-x text-3xl text-slate-300"></i>
                    </div>
                    <h5 className="text-slate-600 font-medium mb-1">No maintenance schedules found</h5>
                    <p className="text-slate-400 text-sm">Click "Schedule New Maintenance" to add your first maintenance schedule.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="bx bx-calendar-plus text-emerald-600"></i>
                {editingSchedule ? t('maintenanceSchedule.editMaintenanceSchedule') : t('maintenanceSchedule.scheduleNewMaintenance')}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {loading && (
                <div className="text-center py-4 bg-blue-50 rounded-lg border border-blue-100 text-blue-700">
                  <div className="flex items-center justify-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-700"></span>
                    <span>{t('maintenanceSchedule.savingSchedule')}</span>
                  </div>
                </div>
              )}

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
                    placeholder="e.g., TN34AB1234"
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
                    placeholder="e.g., Tata LPT 1613"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('maintenanceSchedule.maintenanceType')} *
                  </label>
                  <select
                    name="maintenanceType"
                    value={formData.maintenanceType}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  >
                    <option value="Preventive">{t('maintenanceSchedule.preventive')}</option>
                    <option value="Corrective">{t('maintenanceSchedule.corrective')}</option>
                    <option value="Emergency">{t('maintenanceSchedule.emergency')}</option>
                  </select>
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
                    placeholder="e.g., Engine Oil Change"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('maintenanceSchedule.scheduledDate')} *
                  </label>
                  <input
                    type="date"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('maintenanceSchedule.scheduledTime')} *
                  </label>
                  <input
                    type="time"
                    name="scheduledTime"
                    value={formData.scheduledTime}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('maintenanceSchedule.priority')} *
                  </label>
                  <select
                    name="priority"
                    value={formData.priority}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  >
                    <option value="Low">{t('maintenanceSchedule.low')}</option>
                    <option value="Medium">{t('maintenanceSchedule.medium')}</option>
                    <option value="High">{t('maintenanceSchedule.high')}</option>
                    <option value="Critical">{t('maintenanceSchedule.critical')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('maintenanceSchedule.status')} *
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  >
                    <option value="Scheduled">{t('maintenanceSchedule.scheduled')}</option>
                    <option value="In Progress">{t('serviceHistory.inProgress')}</option>
                    <option value="Completed">{t('serviceHistory.completed')}</option>
                    <option value="Pending">{t('maintenanceSchedule.pending')}</option>
                    <option value="Cancelled">{t('serviceHistory.cancelled')}</option>
                  </select>
                  <p className="text-xs text-slate-400 mt-1">
                    {t('maintenanceSchedule.currentStatus')}
                  </p>
                </div>
              </div>

              {formData.status === 'Completed' && (
                <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <i className="bx bx-check-circle text-xl"></i>
                  {t('maintenanceSchedule.completedAlert')}
                </div>
              )}
              {formData.status === 'In Progress' && (
                <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <i className="bx bx-time-five text-xl"></i>
                  {t('maintenanceSchedule.inProgressAlert')}
                </div>
              )}
              {formData.status === 'Cancelled' && (
                <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg flex items-center gap-2">
                  <i className="bx bx-error-circle text-xl"></i>
                  {t('maintenanceSchedule.cancelledAlert')}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('maintenanceSchedule.estimatedCost')} (₹) *
                  </label>
                  <input
                    type="number"
                    name="estimatedCost"
                    value={formData.estimatedCost}
                    onChange={handleInputChange}
                    placeholder="0"
                    min="0"
                    step="100"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('maintenanceSchedule.estimatedDuration')}
                  </label>
                  <input
                    type="text"
                    name="estimatedDuration"
                    value={formData.estimatedDuration}
                    onChange={handleInputChange}
                    placeholder="e.g., 2 hours"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('maintenanceSchedule.assignedTechnician')}
                  </label>
                  <input
                    type="text"
                    name="assignedTechnician"
                    value={formData.assignedTechnician}
                    onChange={handleInputChange}
                    placeholder="e.g., Rajesh Kumar"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">
                    {t('serviceHistory.serviceCenter')}
                  </label>
                  <input
                    type="text"
                    name="serviceCenter"
                    value={formData.serviceCenter}
                    onChange={handleInputChange}
                    placeholder="e.g., Tata Motors Service Center"
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {t('maintenanceSchedule.serviceContact')}
                </label>
                <input
                  type="text"
                  name="serviceContact"
                  value={formData.serviceContact}
                  onChange={handleInputChange}
                  placeholder="e.g., +91 9876543210"
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {t('maintenanceSchedule.description')}
                </label>
                <textarea
                  rows={3}
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder={t('maintenanceSchedule.descriptionPlaceholder')}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  {t('maintenanceSchedule.additionalNotes')}
                </label>
                <textarea
                  rows={2}
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  placeholder={t('maintenanceSchedule.notesPlaceholder')}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium hover:bg-slate-100 rounded-lg transition-colors"
                >
                  {t('common.cancel')}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm shadow-emerald-200 transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                      {t('maintenanceSchedule.saving')}
                    </>
                  ) : (
                    <>
                      <i className="bx bx-save"></i>
                      {editingSchedule ? t('maintenanceSchedule.updateSchedule') : t('maintenanceSchedule.scheduleMaintenance')}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceSchedule;
