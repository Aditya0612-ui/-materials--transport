import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { exportToExcel } from '../../utils/excelExport';
import firebaseService from '../../services/firebaseService';
import 'boxicons/css/boxicons.min.css';

const FuelPurchaseHistory = () => {
  const { t } = useTranslation();
  const [fuelData, setFuelData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState(null);
  const [editingPurchase, setEditingPurchase] = useState(null);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    fuelType: 'all',
    vehicleNumber: ''
  });
  const [newPurchase, setNewPurchase] = useState({
    date: '',
    vehicleNumber: '',
    fuelType: 'petrol',
    quantity: '',
    pricePerLiter: '',
    totalAmount: '',
    pumpName: '',
    billNumber: ''
  });
  const [showCustomPumpInput, setShowCustomPumpInput] = useState(false);
  const [customPumpName, setCustomPumpName] = useState('');
  const [showEditCustomPumpInput, setShowEditCustomPumpInput] = useState(false);
  const [editCustomPumpName, setEditCustomPumpName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Subscribe to Firebase fuel purchases
  useEffect(() => {
    const unsubscribe = firebaseService.subscribeToFuelPurchases((purchases) => {
      setFuelData(purchases);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Filter data based on filters
  useEffect(() => {
    let filtered = fuelData;

    if (filters.dateFrom) {
      filtered = filtered.filter(item => item.date >= filters.dateFrom);
    }
    if (filters.dateTo) {
      filtered = filtered.filter(item => item.date <= filters.dateTo);
    }
    if (filters.fuelType !== 'all') {
      filtered = filtered.filter(item => item.fuelType.toLowerCase() === filters.fuelType);
    }
    if (filters.vehicleNumber) {
      filtered = filtered.filter(item =>
        item.vehicleNumber.toLowerCase().includes(filters.vehicleNumber.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [filters, fuelData]);

  const handleAddPurchase = async () => {
    if (!newPurchase.date || !newPurchase.vehicleNumber || !newPurchase.quantity || !newPurchase.pricePerLiter) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    const totalAmount = parseFloat(newPurchase.quantity) * parseFloat(newPurchase.pricePerLiter);

    const purchase = {
      ...newPurchase,
      quantity: parseFloat(newPurchase.quantity),
      pricePerLiter: parseFloat(newPurchase.pricePerLiter),
      totalAmount: totalAmount,
      status: 'completed'
    };

    try {
      const result = await firebaseService.addFuelPurchase(purchase);
      if (result.success) {
        setNewPurchase({
          date: '',
          vehicleNumber: '',
          fuelType: 'petrol',
          quantity: '',
          pricePerLiter: '',
          totalAmount: '',
          pumpName: '',
          billNumber: ''
        });
        setShowCustomPumpInput(false);
        setCustomPumpName('');
        setShowAddModal(false);
      } else {
        setError('Failed to add fuel purchase');
      }
    } catch (err) {
      console.error('Error adding fuel purchase:', err);
      setError('Error adding fuel purchase');
    } finally {
      setLoading(false);
    }
  };

  // Handle viewing purchase details
  const handleViewPurchase = (purchase) => {
    setSelectedPurchase(purchase);
    setShowViewModal(true);
  };

  // Handle editing purchase
  const handleEditPurchase = (purchase) => {
    setEditingPurchase({ ...purchase });
    setShowEditModal(true);
  };

  // Handle saving edited purchase
  const handleSaveEdit = async () => {
    if (!editingPurchase.date || !editingPurchase.vehicleNumber || !editingPurchase.quantity || !editingPurchase.pricePerLiter) {
      alert('Please fill all required fields');
      return;
    }

    setLoading(true);
    setError(null);

    const totalAmount = parseFloat(editingPurchase.quantity) * parseFloat(editingPurchase.pricePerLiter);
    const updatedPurchase = {
      ...editingPurchase,
      quantity: parseFloat(editingPurchase.quantity),
      pricePerLiter: parseFloat(editingPurchase.pricePerLiter),
      totalAmount: totalAmount
    };

    try {
      const result = await firebaseService.updateFuelPurchase(editingPurchase.id, updatedPurchase);
      if (result.success) {
        setShowEditModal(false);
        setEditingPurchase(null);
        setShowEditCustomPumpInput(false);
        setEditCustomPumpName('');
      } else {
        setError('Failed to update fuel purchase');
      }
    } catch (err) {
      console.error('Error updating fuel purchase:', err);
      setError('Error updating fuel purchase');
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting purchase
  const handleDeletePurchase = async (purchaseId) => {
    if (window.confirm('Are you sure you want to delete this fuel purchase record?')) {
      setLoading(true);
      setError(null);

      try {
        const result = await firebaseService.deleteFuelPurchase(purchaseId);
        if (!result.success) {
          setError('Failed to delete fuel purchase');
        }
      } catch (err) {
        console.error('Error deleting fuel purchase:', err);
        setError('Error deleting fuel purchase');
      } finally {
        setLoading(false);
      }
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      completed: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      pending: 'bg-amber-100 text-amber-700 border-amber-200',
      failed: 'bg-red-100 text-red-700 border-red-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${status === 'completed' ? 'bg-emerald-500' : status === 'pending' ? 'bg-amber-500' : 'bg-red-500'}`}></span>
        {status.toUpperCase()}
      </span>
    );
  };

  // Handle export to Excel
  const handleExport = () => {
    if (filteredData.length === 0) {
      alert('No data to export');
      return;
    }

    const columns = [
      { key: 'date', header: 'Date' },
      { key: 'vehicleNumber', header: 'Vehicle Number' },
      { key: 'fuelType', header: 'Fuel Type' },
      { key: 'quantity', header: 'Quantity (L)' },
      { key: 'pricePerLiter', header: 'Price per Liter (₹)' },
      { key: 'totalAmount', header: 'Total Amount (₹)', formatter: (val) => val.toFixed(2) },
      { key: 'pumpName', header: 'Pump Name' },
      { key: 'billNumber', header: 'Bill Number' },
      { key: 'status', header: 'Status' }
    ];

    exportToExcel(filteredData, 'Fuel_Purchase_History', 'Fuel Purchases', columns);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <i className="bx bx-gas-pump text-emerald-600"></i>
            {t('fuelPurchase.title')}
          </h2>
          <p className="text-slate-500 mt-1">{t('fuelPurchase.subtitle')}</p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-sm"
        >
          <i className="bx bx-plus text-xl"></i>
          {t('fuelPurchase.addButton')}
        </button>
      </div>

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center gap-2 mb-4 text-slate-800 font-semibold border-b border-slate-100 pb-3">
          <i className="bx bx-filter text-xl text-emerald-600"></i>
          {t('fuelPurchase.filtersSearch')}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <i className="bx bx-calendar text-emerald-500"></i>
              {t('fuelPurchase.fromDate')}
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
              {t('fuelPurchase.toDate')}
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
              <i className="bx bx-gas-pump text-emerald-500"></i>
              {t('fuelPurchase.fuelType')}
            </label>
            <select
              value={filters.fuelType}
              onChange={(e) => setFilters(prev => ({ ...prev, fuelType: e.target.value }))}
              className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
              style={{ color: '#1e293b' }}
            >
              <option value="all">{t('fuelPurchase.allTypes')}</option>
              <option value="petrol">{t('fuelUse.petrol')}</option>
              <option value="diesel">{t('fuelUse.diesel')}</option>
              <option value="cng">{t('fuelUse.cng')}</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-slate-600 flex items-center gap-2">
              <i className="bx bx-car text-emerald-500"></i>
              {t('fuelPurchase.vehicleNumber')}
            </label>
            <div className="relative">
              <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input
                type="text"
                placeholder={t('fuelPurchase.searchVehicle')}
                value={filters.vehicleNumber}
                onChange={(e) => setFilters(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                className="w-full pl-10 pr-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                style={{ color: '#1e293b' }}
              />
            </div>
          </div>
        </div>

        {/* Clear Filters Button */}
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => setFilters({ dateFrom: '', dateTo: '', fuelType: 'all', vehicleNumber: '' })}
            className="text-slate-500 hover:text-slate-700 text-sm font-medium flex items-center gap-1 transition-colors"
          >
            <i className="bx bx-refresh text-lg"></i>
            {t('fuelPurchase.clearFilters')}
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h6 className="font-semibold text-slate-800 flex items-center gap-2">
            <i className="bx bx-table text-emerald-600"></i>
            {t('fuelPurchase.purchaseRecords')}
            <span className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full text-xs">
              {filteredData.length}
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
                <th className="px-6 py-4"><i className="bx bx-calendar me-1"></i>{t('fuelPurchase.date')}</th>
                <th className="px-6 py-4"><i className="bx bx-car me-1"></i>{t('fuelPurchase.vehicle')}</th>
                <th className="px-6 py-4"><i className="bx bx-gas-pump me-1"></i>{t('fuelPurchase.fuel')}</th>
                <th className="px-6 py-4"><i className="bx bx-droplet me-1"></i>{t('fuelPurchase.qty')}</th>
                <th className="px-6 py-4"><i className="bx bx-rupee me-1"></i>{t('fuelPurchase.pricePerL')}</th>
                <th className="px-6 py-4"><i className="bx bx-calculator me-1"></i>{t('fuelPurchase.total')}</th>
                <th className="px-6 py-4"><i className="bx bx-store me-1"></i>{t('fuelPurchase.pump')}</th>
                <th className="px-6 py-4"><i className="bx bx-receipt me-1"></i>{t('fuelPurchase.billNo')}</th>
                <th className="px-6 py-4"><i className="bx bx-check-circle me-1"></i>{t('fuelPurchase.status')}</th>
                <th className="px-6 py-4 text-right">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 text-base text-slate-700">
                    {new Date(item.date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short'
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-800 bg-slate-100 px-2 py-1 rounded text-base">
                      {item.vehicleNumber}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${item.fuelType === 'Diesel' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                      item.fuelType === 'Petrol' ? 'bg-red-50 text-red-700 border-red-100' :
                        'bg-blue-50 text-blue-700 border-blue-100'
                      }`}>
                      {item.fuelType}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-base text-slate-700">
                    <span className="font-semibold">{item.quantity}</span> L
                  </td>
                  <td className="px-6 py-4 text-base text-slate-700">
                    ₹{item.pricePerLiter}
                  </td>
                  <td className="px-6 py-4 text-base font-semibold text-emerald-600">
                    ₹{(item.totalAmount / 1000).toFixed(1)}k
                  </td>
                  <td className="px-6 py-4 text-base text-slate-700 max-w-[150px] truncate">
                    {item.pumpName}
                  </td>
                  <td className="px-6 py-4">
                    <code className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200">
                      {item.billNumber}
                    </code>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(item.status)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewPurchase(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                        title="View Details"
                      >
                        <i className="bx bx-show text-lg"></i>
                      </button>
                      <button
                        onClick={() => handleEditPurchase(item)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all"
                        title="Edit"
                      >
                        <i className="bx bx-edit-alt text-lg"></i>
                      </button>
                      <button
                        onClick={() => handleDeletePurchase(item.id)}
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

        {filteredData.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <i className="bx bx-gas-pump text-3xl text-slate-300"></i>
            </div>
            <h5 className="text-slate-600 font-medium mb-1">No Fuel Purchase Records Found</h5>
            <p className="text-slate-400 text-sm mb-4">No records match your current filter criteria.</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-emerald-600 hover:text-emerald-700 font-medium text-sm flex items-center gap-1 mx-auto transition-colors"
            >
              <i className="bx bx-plus"></i>
              Add First Purchase Record
            </button>
          </div>
        )}
      </div>
      {/* Add Purchase Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="bx bx-gas-pump text-emerald-600"></i>
                {t('fuelPurchase.addNewFuelPurchase')}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowCustomPumpInput(false);
                  setCustomPumpName('');
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <i className="bx bx-calendar text-emerald-500"></i>
                    {t('fuelPurchase.date')} *
                  </label>
                  <input
                    type="date"
                    value={newPurchase.date}
                    onChange={(e) => setNewPurchase(prev => ({ ...prev, date: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <i className="bx bx-car text-emerald-500"></i>
                    {t('fuelPurchase.vehicleNumber')} *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., MH12AB1234"
                    value={newPurchase.vehicleNumber}
                    onChange={(e) => setNewPurchase(prev => ({ ...prev, vehicleNumber: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <i className="bx bx-gas-pump text-emerald-500"></i>
                    {t('fuelPurchase.fuelType')} *
                  </label>
                  <select
                    value={newPurchase.fuelType}
                    onChange={(e) => setNewPurchase(prev => ({ ...prev, fuelType: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="Petrol">{t('fuelUse.petrol')}</option>
                    <option value="Diesel">{t('fuelUse.diesel')}</option>
                    <option value="CNG">{t('fuelUse.cng')}</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <i className="bx bx-droplet text-emerald-500"></i>
                    {t('fuelUse.quantityLiters')} *
                  </label>
                  <input
                    type="number"
                    placeholder={t('fuelPurchase.enterQuantity')}
                    value={newPurchase.quantity}
                    onChange={(e) => setNewPurchase(prev => ({ ...prev, quantity: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <i className="bx bx-rupee text-emerald-500"></i>
                    {t('fuelPurchase.pricePerLiter')} *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={newPurchase.pricePerLiter}
                      onChange={(e) => setNewPurchase(prev => ({ ...prev, pricePerLiter: e.target.value }))}
                      className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <i className="bx bx-calculator text-emerald-500"></i>
                    {t('fuelPurchase.totalAmount')}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                    <input
                      type="text"
                      value={newPurchase.quantity && newPurchase.pricePerLiter ?
                        (parseFloat(newPurchase.quantity) * parseFloat(newPurchase.pricePerLiter)).toFixed(2) : '0.00'}
                      readOnly
                      className="w-full pl-8 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <i className="bx bx-store text-emerald-500"></i>
                    {t('fuelPurchase.pumpName')}
                  </label>
                  <select
                    value={showCustomPumpInput ? "Other" : newPurchase.pumpName}
                    onChange={(e) => {
                      if (e.target.value === "Other") {
                        setShowCustomPumpInput(true);
                        setCustomPumpName('');
                        setNewPurchase(prev => ({ ...prev, pumpName: '' }));
                      } else {
                        setShowCustomPumpInput(false);
                        setCustomPumpName('');
                        setNewPurchase(prev => ({ ...prev, pumpName: e.target.value }));
                      }
                    }}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  >
                    <option value="">{t('fuelPurchase.selectPump')}</option>
                    <option value="Indian Oil">Indian Oil (IOCL)</option>
                    <option value="Bharat Petroleum">Bharat Petroleum (BPCL)</option>
                    <option value="Hindustan Petroleum">Hindustan Petroleum (HPCL)</option>
                    <option value="Reliance Petroleum">Reliance Petroleum</option>
                    <option value="Essar Oil">Essar Oil</option>
                    <option value="Shell India">Shell India</option>
                    <option value="Nayara Energy">Nayara Energy</option>
                    <option value="Jio-bp">Jio-bp</option>
                    <option value="Other">{t('fuelPurchase.otherCustom')}</option>
                  </select>
                  {showCustomPumpInput && (
                    <input
                      type="text"
                      placeholder={t('fuelPurchase.enterCustomPumpName')}
                      value={customPumpName}
                      onChange={(e) => {
                        setCustomPumpName(e.target.value);
                        setNewPurchase(prev => ({ ...prev, pumpName: e.target.value }));
                      }}
                      className="w-full mt-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                    />
                  )}
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                    <i className="bx bx-receipt text-emerald-500"></i>
                    {t('fuelPurchase.billNumber')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('fuelPurchase.enterBillNumber')}
                    value={newPurchase.billNumber}
                    onChange={(e) => setNewPurchase(prev => ({ ...prev, billNumber: e.target.value }))}
                    className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setShowCustomPumpInput(false);
                  setCustomPumpName('');
                }}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                {t('common.cancel')}
              </button>
              <button
                onClick={handleAddPurchase}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm shadow-emerald-200 transition-all flex items-center gap-2"
              >
                <i className="bx bx-plus"></i>
                {t('fuelPurchase.addPurchase')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Purchase Modal */}
      {showViewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="bx bx-show text-emerald-600"></i>
                Purchase Details
              </h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <div className="p-6">
              {selectedPurchase && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date</label>
                      <p className="text-slate-800 font-medium mt-1">{selectedPurchase.date}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Vehicle Number</label>
                      <p className="text-slate-800 font-medium mt-1">{selectedPurchase.vehicleNumber}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Fuel Type</label>
                      <p className="text-slate-800 font-medium mt-1">{selectedPurchase.fuelType}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quantity</label>
                      <p className="text-slate-800 font-medium mt-1">{selectedPurchase.quantity} L</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Price per Liter</label>
                      <p className="text-slate-800 font-medium mt-1">₹{selectedPurchase.pricePerLiter}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Amount</label>
                      <p className="text-emerald-600 font-bold mt-1 text-lg">₹{selectedPurchase.totalAmount}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pump Name</label>
                      <p className="text-slate-800 font-medium mt-1">{selectedPurchase.pumpName}</p>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bill Number</label>
                      <p className="text-slate-800 font-medium mt-1">{selectedPurchase.billNumber}</p>
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

      {/* Edit Purchase Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="bx bx-edit-alt text-emerald-600"></i>
                Edit Fuel Purchase
              </h3>
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setShowEditCustomPumpInput(false);
                  setEditCustomPumpName('');
                }}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {editingPurchase && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="bx bx-calendar text-emerald-500"></i>
                        Date *
                      </label>
                      <input
                        type="date"
                        value={editingPurchase.date}
                        onChange={(e) => setEditingPurchase({ ...editingPurchase, date: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="bx bx-car text-emerald-500"></i>
                        Vehicle Number *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g., MH12AB1234"
                        value={editingPurchase.vehicleNumber}
                        onChange={(e) => setEditingPurchase({ ...editingPurchase, vehicleNumber: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="bx bx-gas-pump text-emerald-500"></i>
                        {t('fuelPurchase.fuelType')} *
                      </label>
                      <select
                        value={editingPurchase.fuelType}
                        onChange={(e) => setEditingPurchase({ ...editingPurchase, fuelType: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      >
                        <option value="Petrol">{t('fuelUse.petrol')}</option>
                        <option value="Diesel">{t('fuelUse.diesel')}</option>
                        <option value="CNG">{t('fuelUse.cng')}</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="bx bx-droplet text-emerald-500"></i>
                        {t('fuelUse.quantityLiters')} *
                      </label>
                      <input
                        type="number"
                        placeholder={t('fuelPurchase.enterQuantity')}
                        value={editingPurchase.quantity}
                        onChange={(e) => setEditingPurchase({ ...editingPurchase, quantity: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="bx bx-rupee text-emerald-500"></i>
                        {t('fuelPurchase.pricePerLiter')} *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={editingPurchase.pricePerLiter}
                          onChange={(e) => setEditingPurchase({ ...editingPurchase, pricePerLiter: e.target.value })}
                          className="w-full pl-8 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                          required
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="bx bx-calculator text-emerald-500"></i>
                        {t('fuelPurchase.totalAmount')}
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">₹</span>
                        <input
                          type="text"
                          value={editingPurchase.quantity && editingPurchase.pricePerLiter ?
                            (parseFloat(editingPurchase.quantity) * parseFloat(editingPurchase.pricePerLiter)).toFixed(2) : '0.00'}
                          readOnly
                          className="w-full pl-8 pr-4 py-2 bg-slate-100 border border-slate-200 rounded-lg font-semibold text-slate-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="bx bx-store text-emerald-500"></i>
                        {t('fuelPurchase.pumpName')}
                      </label>
                      <select
                        value={showEditCustomPumpInput ? "Other" : editingPurchase.pumpName}
                        onChange={(e) => {
                          if (e.target.value === "Other") {
                            setShowEditCustomPumpInput(true);
                            setEditCustomPumpName(editingPurchase.pumpName || '');
                            setEditingPurchase(prev => ({ ...prev, pumpName: '' }));
                          } else {
                            setShowEditCustomPumpInput(false);
                            setEditCustomPumpName('');
                            setEditingPurchase(prev => ({ ...prev, pumpName: e.target.value }));
                          }
                        }}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      >
                        <option value="">{t('fuelPurchase.selectPump')}</option>
                        <option value="Indian Oil">Indian Oil (IOCL)</option>
                        <option value="Bharat Petroleum">Bharat Petroleum (BPCL)</option>
                        <option value="Hindustan Petroleum">Hindustan Petroleum (HPCL)</option>
                        <option value="Reliance Petroleum">Reliance Petroleum</option>
                        <option value="Essar Oil">Essar Oil</option>
                        <option value="Shell India">Shell India</option>
                        <option value="Nayara Energy">Nayara Energy</option>
                        <option value="Jio-bp">Jio-bp</option>
                        <option value="Other">{t('fuelPurchase.otherCustom')}</option>
                      </select>
                      {showEditCustomPumpInput && (
                        <input
                          type="text"
                          placeholder={t('fuelPurchase.enterCustomPumpName')}
                          value={editCustomPumpName}
                          onChange={(e) => {
                            setEditCustomPumpName(e.target.value);
                            setEditingPurchase(prev => ({ ...prev, pumpName: e.target.value }));
                          }}
                          className="w-full mt-2 px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                        />
                      )}
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                        <i className="bx bx-receipt text-emerald-500"></i>
                        {t('fuelPurchase.billNumber')}
                      </label>
                      <input
                        type="text"
                        placeholder={t('fuelPurchase.enterBillNumber')}
                        value={editingPurchase.billNumber}
                        onChange={(e) => setEditingPurchase({ ...editingPurchase, billNumber: e.target.value })}
                        className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 rounded-b-2xl">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setShowEditCustomPumpInput(false);
                  setEditCustomPumpName('');
                }}
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

export default FuelPurchaseHistory;
