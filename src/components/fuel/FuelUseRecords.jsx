import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { exportToExcel } from '../../utils/excelExport';
import firebaseService from '../../services/firebaseService';
import 'boxicons/css/boxicons.min.css';

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
      fuel_fill: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      fuel_consumption: 'bg-blue-100 text-blue-700 border-blue-200',
      maintenance: 'bg-amber-100 text-amber-700 border-amber-200',
      inspection: 'bg-indigo-100 text-indigo-700 border-indigo-200'
    };
    const labels = {
      fuel_fill: 'FUEL FILL',
      fuel_consumption: 'CONSUMPTION',
      maintenance: 'MAINTENANCE',
      inspection: 'INSPECTION'
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[type] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {labels[type] || type.toUpperCase()}
      </span>
    );
  };

  const getFuelTypeBadge = (type) => {
    const variants = {
      Diesel: 'bg-amber-50 text-amber-700 border-amber-100',
      Petrol: 'bg-red-50 text-red-700 border-red-100',
      CNG: 'bg-blue-50 text-blue-700 border-blue-100'
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${variants[type] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {type}
      </span>
    );
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
    if (percentage > 70) return 'bg-emerald-500';
    if (percentage > 30) return 'bg-amber-500';
    return 'bg-red-500';
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
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <i className="bx bx-gas-pump text-emerald-600"></i>
            {t('fuelUse.title')}
          </h2>
          <p className="text-slate-500 mt-1">{t('fuelUse.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <i className="bx bx-plus text-xl"></i>
          {t('fuelUse.addRecord')}
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold border-b border-slate-100 pb-3">
          <i className="bx bx-filter text-xl text-emerald-600"></i>
          {t('fuelUse.filtersVehicle')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <i className="bx bx-car text-emerald-500"></i>
              {t('fuelUse.selectVehicle')}
            </label>
            <select
              value={selectedVehicle}
              onChange={(e) => setSelectedVehicle(e.target.value)}
              className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              style={{ color: '#1e293b' }}
            >
              <option value="all">{t('fuelUse.allVehicles')}</option>
              {vehicles.map(vehicle => (
                <option key={vehicle.id} value={vehicle.number}>
                  {vehicle.number} - {vehicle.type}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <i className="bx bx-calendar text-emerald-500"></i>
              {t('fuelUse.fromDate')}
            </label>
            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
              className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              style={{ color: '#1e293b', colorScheme: 'light' }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <i className="bx bx-calendar text-emerald-500"></i>
              {t('fuelUse.toDate')}
            </label>
            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
              className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              style={{ color: '#1e293b', colorScheme: 'light' }}
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <i className="bx bx-list-ul text-emerald-500"></i>
              {t('fuelUse.recordType')}
            </label>
            <select
              value={filters.recordType}
              onChange={(e) => setFilters(prev => ({ ...prev, recordType: e.target.value }))}
              className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              style={{ color: '#1e293b' }}
            >
              <option value="all">{t('fuelUse.allRecordTypes')}</option>
              <option value="fuel_fill">{t('fuelUse.fuelFill')}</option>
              <option value="fuel_consumption">{t('fuelUse.fuelConsumption')}</option>
              <option value="maintenance">{t('fuelUse.maintenance')}</option>
              <option value="inspection">{t('fuelUse.inspection')}</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => {
              setSelectedVehicle('all');
              setFilters({ dateFrom: '', dateTo: '', recordType: 'all' });
            }}
            className="text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <i className="bx bx-refresh text-lg"></i>
            {t('common.clear')}
          </button>
        </div>
      </div>

      {/* Vehicle Status Cards */}
      {selectedVehicle !== 'all' && (
        <div className="grid grid-cols-1 gap-6">
          {vehicles.filter(v => v.number === selectedVehicle).map(vehicle => {
            const stats = calculateVehicleStats(vehicle.number);
            const fuelPercentage = getFuelLevelPercentage(vehicle.currentFuel, vehicle.tankCapacity);

            return (
              <div key={vehicle.id} className="bg-white rounded-2xl shadow-sm border border-emerald-100 overflow-hidden">
                <div className="bg-emerald-50/50 px-6 py-4 border-b border-emerald-100 flex justify-between items-center">
                  <h6 className="font-bold text-slate-800 flex items-center gap-2">
                    <i className="bx bx-car text-emerald-600 text-xl"></i>
                    {vehicle.number} - {vehicle.type}
                  </h6>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between items-end mb-2">
                          <span className="text-sm font-medium text-slate-600">Current Fuel Level</span>
                          <span className="text-sm font-bold text-slate-800">{vehicle.currentFuel}L / {vehicle.tankCapacity}L</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${getFuelLevelColor(fuelPercentage)}`}
                            style={{ width: `${Math.min(fuelPercentage, 100)}%` }}
                          ></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Fuel Type</span>
                        {getFuelTypeBadge(vehicle.fuelType)}
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <span className="text-sm text-slate-600">Total Distance</span>
                        <span className="font-bold text-slate-800">{vehicle.totalDistance.toLocaleString()} KM</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                          <div className="text-xs text-blue-600 uppercase font-semibold mb-1">Avg Efficiency</div>
                          <div className="text-lg font-bold text-blue-800">{vehicle.avgEfficiency} <span className="text-xs font-normal">KM/L</span></div>
                        </div>
                        <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100">
                          <div className="text-xs text-emerald-600 uppercase font-semibold mb-1">Total Fuel Used</div>
                          <div className="text-lg font-bold text-emerald-800">{stats.totalFuelUsed} <span className="text-xs font-normal">L</span></div>
                        </div>
                        <div className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                          <div className="text-xs text-amber-600 uppercase font-semibold mb-1">Total Cost</div>
                          <div className="text-lg font-bold text-amber-800">₹{stats.totalCost.toLocaleString()}</div>
                        </div>
                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                          <div className="text-xs text-purple-600 uppercase font-semibold mb-1">Records</div>
                          <div className="text-lg font-bold text-purple-800">{stats.recordCount}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Records Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h6 className="font-semibold text-slate-800 flex items-center gap-2">
            <i className="bx bx-table text-emerald-600"></i>
            {t('fuelUse.fuelRecords')}
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
              {filteredRecords.length}
            </span>
          </h6>
          <button
            onClick={handleExport}
            className="text-emerald-600 hover:bg-emerald-50 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-emerald-200 hover:border-emerald-300"
          >
            <i className="bx bx-export"></i>
            {t('common.export')}
          </button>
        </div>

        <div className="overflow-x-auto scrollbar-white">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase text-slate-700 font-semibold tracking-wider">
                <th className="px-6 py-4"><i className="bx bx-calendar me-1"></i>{t('fuelUse.date')}</th>
                <th className="px-6 py-4"><i className="bx bx-car me-1"></i>{t('fuelUse.vehicle')}</th>
                <th className="px-6 py-4"><i className="bx bx-list-ul me-1"></i>{t('fuelUse.type')}</th>
                <th className="px-6 py-4"><i className="bx bx-droplet me-1"></i>{t('fuelUse.qty')}</th>
                <th className="px-6 py-4"><i className="bx bx-tachometer me-1"></i>{t('fuelUse.odometer')}</th>
                <th className="px-6 py-4"><i className="bx bx-gas-pump me-1"></i>{t('fuelUse.fuel')}</th>
                <th className="px-6 py-4"><i className="bx bx-trending-up me-1"></i>{t('fuelUse.efficiency')}</th>
                <th className="px-6 py-4"><i className="bx bx-rupee me-1"></i>{t('fuelUse.cost')}</th>
                <th className="px-6 py-4"><i className="bx bx-note me-1"></i>{t('fuelUse.notes')}</th>
                <th className="px-6 py-4 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredRecords.map(record => (
                <tr key={record.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-base text-slate-700">
                    {new Date(record.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-800 bg-slate-100 px-2 py-1 rounded text-base">
                      {record.vehicleNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {getRecordTypeBadge(record.recordType)}
                  </td>
                  <td className="px-6 py-4 text-base text-slate-700">
                    <span className="font-semibold">{record.quantity}</span> L
                  </td>
                  <td className="px-6 py-4 text-base text-slate-700">
                    {(record.odometer / 1000).toFixed(0)}k
                  </td>
                  <td className="px-6 py-4">
                    {getFuelTypeBadge(record.fuelType)}
                  </td>
                  <td className="px-6 py-4 text-base text-slate-700">
                    {record.efficiency > 0 ? `${record.efficiency}` : '-'}
                  </td>
                  <td className="px-6 py-4 text-base font-semibold text-emerald-600">
                    {record.cost ? `₹${(record.cost / 1000).toFixed(1)}k` : '-'}
                  </td>
                  <td className="px-6 py-4 text-base text-slate-700 max-w-[150px] truncate">
                    {record.notes || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewRecord(record)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="View Details"
                      >
                        <i className="bx bx-show text-lg"></i>
                      </button>
                      <button
                        onClick={() => handleEditRecord(record)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                        title="Edit"
                      >
                        <i className="bx bx-edit-alt text-lg"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteRecord(record.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                        title="Delete"
                      >
                        <i className="bx bx-trash text-lg"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredRecords.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="bx bx-gas-pump text-3xl text-slate-300"></i>
            </div>
            <h5 className="text-slate-600 font-medium mb-1">No Fuel Records Found</h5>
            <p className="text-slate-400 text-sm mb-4">No records match your current filter criteria.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 mx-auto transition-colors"
            >
              <i className="bx bx-plus"></i>
              Add First Record
            </button>
          </div>
        )}
      </div>

      {/* Add Record Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="bx bx-gas-pump text-emerald-600"></i>
                {t('fuelUse.addFuelUseRecord')}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <i className="bx bx-car text-emerald-500"></i>
                    {t('fuelUse.vehicleNumber')} *
                  </label>
                  <select
                    value={newRecord.vehicleNumber}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="">{t('fuelUse.selectVehicle')}</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.number}>
                        {vehicle.number} - {vehicle.type}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <i className="bx bx-calendar text-emerald-500"></i>
                    {t('fuelUse.date')} *
                  </label>
                  <input
                    type="date"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <i className="bx bx-list-ul text-emerald-500"></i>
                    {t('fuelUse.recordType')} *
                  </label>
                  <select
                    value={newRecord.recordType}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, recordType: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="fuel_fill">{t('fuelUse.fuelFill')}</option>
                    <option value="fuel_consumption">{t('fuelUse.fuelConsumption')}</option>
                    <option value="maintenance">{t('fuelUse.maintenance')}</option>
                    <option value="inspection">{t('fuelUse.inspection')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <i className="bx bx-gas-pump text-emerald-500"></i>
                    {t('fuelUse.fuelType')}
                  </label>
                  <select
                    value={newRecord.fuelType}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, fuelType: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="diesel">{t('fuelUse.diesel')}</option>
                    <option value="petrol">{t('fuelUse.petrol')}</option>
                    <option value="cng">{t('fuelUse.cng')}</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <i className="bx bx-droplet text-emerald-500"></i>
                    {t('fuelUse.quantityLiters')} *
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newRecord.quantity}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <i className="bx bx-tachometer text-emerald-500"></i>
                    {t('fuelUse.odometerReading')} *
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={newRecord.odometer}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, odometer: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <i className="bx bx-trending-up text-emerald-500"></i>
                    {t('fuelUse.efficiencyKML')}
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="0.0"
                    value={newRecord.efficiency}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, efficiency: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <i className="bx bx-note text-emerald-500"></i>
                  {t('fuelUse.notes')}
                </label>
                <textarea
                  rows={2}
                  placeholder={t('fuelUse.notesPlaceholder')}
                  value={newRecord.notes}
                  onChange={(e) => setNewRecord(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddRecord}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm shadow-emerald-200 transition-all flex items-center gap-2"
              >
                <i className="bx bx-plus"></i>
                {t('fuelUse.addRecordButton')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Record Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="bx bx-show text-emerald-600"></i>
                Fuel Record Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <div className="p-6">
              {selectedRecord && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle Number</label>
                      <p className="text-slate-800 font-medium mt-1">{selectedRecord.vehicleNumber}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</label>
                      <p className="text-slate-800 font-medium mt-1">{selectedRecord.date}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Record Type</label>
                      <div className="mt-1">{getRecordTypeBadge(selectedRecord.recordType)}</div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quantity</label>
                      <p className="text-slate-800 font-medium mt-1">{selectedRecord.quantity} L</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Odometer</label>
                      <p className="text-slate-800 font-medium mt-1">{selectedRecord.odometer} km</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fuel Type</label>
                      <div className="mt-1">{getFuelTypeBadge(selectedRecord.fuelType)}</div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Efficiency</label>
                      <p className="text-slate-800 font-medium mt-1">{selectedRecord.efficiency} km/L</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Notes</label>
                      <p className="text-slate-800 font-medium mt-1">{selectedRecord.notes || 'No notes'}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end rounded-b-2xl">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Record Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="bx bx-edit-alt text-emerald-600"></i>
                Edit Fuel Record
              </h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {editingRecord && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="bx bx-car text-emerald-500"></i>
                        Vehicle Number *
                      </label>
                      <input
                        type="text"
                        value={editingRecord.vehicleNumber}
                        onChange={(e) => setEditingRecord({ ...editingRecord, vehicleNumber: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="bx bx-calendar text-emerald-500"></i>
                        Date *
                      </label>
                      <input
                        type="date"
                        value={editingRecord.date}
                        onChange={(e) => setEditingRecord({ ...editingRecord, date: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="bx bx-list-ul text-emerald-500"></i>
                        Record Type
                      </label>
                      <select
                        value={editingRecord.recordType}
                        onChange={(e) => setEditingRecord({ ...editingRecord, recordType: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      >
                        <option value="fuel_fill">Fuel Fill</option>
                        <option value="fuel_consumption">Fuel Consumption</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inspection">Inspection</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="bx bx-droplet text-emerald-500"></i>
                        Quantity (Liters) *
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingRecord.quantity}
                        onChange={(e) => setEditingRecord({ ...editingRecord, quantity: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="bx bx-tachometer text-emerald-500"></i>
                        Odometer (km) *
                      </label>
                      <input
                        type="number"
                        value={editingRecord.odometer}
                        onChange={(e) => setEditingRecord({ ...editingRecord, odometer: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="bx bx-gas-pump text-emerald-500"></i>
                        Fuel Type
                      </label>
                      <select
                        value={editingRecord.fuelType}
                        onChange={(e) => setEditingRecord({ ...editingRecord, fuelType: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      >
                        <option value="diesel">Diesel</option>
                        <option value="petrol">Petrol</option>
                        <option value="cng">CNG</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="bx bx-trending-up text-emerald-500"></i>
                        Efficiency (km/L)
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        value={editingRecord.efficiency}
                        onChange={(e) => setEditingRecord({ ...editingRecord, efficiency: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="bx bx-note text-emerald-500"></i>
                        Notes
                      </label>
                      <textarea
                        rows={2}
                        value={editingRecord.notes}
                        onChange={(e) => setEditingRecord({ ...editingRecord, notes: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => setShowEditModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleSaveEdit}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm shadow-emerald-200 transition-all flex items-center gap-2"
              >
                <i className="bx bx-save"></i>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default FuelUseRecords;
