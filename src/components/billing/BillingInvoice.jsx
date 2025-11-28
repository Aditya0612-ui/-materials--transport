import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import 'boxicons/css/boxicons.min.css';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
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
    if (!selectedTrip) {
      alert('No trip selected');
      return;
    }

    try {
      // Create new PDF document
      const doc = new jsPDF('p', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      let yPos = 0;

      // Colors
      const primaryColor = [16, 185, 129]; // Emerald-600
      const darkColor = [30, 41, 59]; // Slate-800
      const lightGray = [241, 245, 249]; // Slate-100
      const borderColor = [226, 232, 240]; // Slate-200

      // ===== HEADER SECTION =====
      // Green Background
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, pageWidth, 45, 'F');

      // Company Name (Large & Bold)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(26);
      doc.setFont('helvetica', 'bold');
      doc.text('TRANSPORT SYSTEM', pageWidth / 2, 18, { align: 'center' });

      // Subtitle
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text('Premium Logistics & Transport Solutions', pageWidth / 2, 26, { align: 'center' });

      // Contact Info Pill
      doc.setFillColor(255, 255, 255, 0.2); // Semi-transparent white
      doc.roundedRect(pageWidth / 2 - 60, 32, 120, 8, 4, 4, 'F');
      doc.setFontSize(9);
      doc.text('📞 +91 1234567890   |   ✉ info@transport.com', pageWidth / 2, 37, { align: 'center' });

      yPos = 60;

      // ===== INVOICE TITLE & ID =====
      doc.setTextColor(...darkColor);
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('TAX INVOICE', 15, yPos);

      // Invoice Number Box (Right aligned)
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // Slate-500
      doc.text(`Invoice #: ${selectedTrip.tripId || 'N/A'}`, pageWidth - 15, yPos, { align: 'right' });

      yPos += 15;

      // ===== BILLING DETAILS (Grid Layout) =====
      const col1X = 15;
      const col2X = pageWidth / 2 + 10;

      // Left Column: BILL TO
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('BILL TO', col1X, yPos);

      yPos += 6;
      doc.setTextColor(...darkColor);
      doc.setFontSize(12);
      doc.text(selectedTrip.customerName || 'N/A', col1X, yPos);

      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(71, 85, 105); // Slate-600
      doc.text(`Phone: ${selectedTrip.customerPhone || 'N/A'}`, col1X, yPos);

      if (selectedTrip.customerAddress) {
        yPos += 5;
        const addressLines = doc.splitTextToSize(selectedTrip.customerAddress, 80);
        doc.text(addressLines, col1X, yPos);
        yPos += (addressLines.length - 1) * 5;
      }

      if (selectedTrip.gstNumber) {
        yPos += 6;
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text(`GSTIN: ${selectedTrip.gstNumber}`, col1X, yPos);
      }

      // Right Column: TRIP DETAILS
      let yPosRight = 75;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('TRIP DETAILS', col2X, yPosRight);

      yPosRight += 8;
      doc.setTextColor(...darkColor);
      doc.setFontSize(9);

      const invoiceDetails = [
        ['Order ID:', selectedTrip.orderId || 'N/A'],
        ['Date:', new Date(selectedTrip.startDate).toLocaleDateString()],
        ['Vehicle:', selectedTrip.vehicleNumber || 'N/A'],
        ['Driver:', selectedTrip.driverName || 'N/A']
      ];

      invoiceDetails.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(label, col2X, yPosRight);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(71, 85, 105);
        doc.text(value, col2X + 25, yPosRight);
        doc.setTextColor(...darkColor);
        yPosRight += 6;
      });

      yPos = Math.max(yPos, yPosRight) + 10;

      // ===== ROUTE VISUALIZATION =====
      // Background Box
      doc.setFillColor(...lightGray);
      doc.setDrawColor(...borderColor);
      doc.roundedRect(15, yPos, pageWidth - 30, 22, 3, 3, 'FD');

      const routeCenterY = yPos + 11;

      // From Location
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.setFont('helvetica', 'bold');
      doc.text('FROM', 25, routeCenterY - 4);
      doc.setFontSize(10);
      doc.setTextColor(...darkColor);
      doc.text(selectedTrip.fromLocation || 'N/A', 25, routeCenterY + 4);

      // To Location (Right aligned relative to box)
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text('TO', pageWidth - 25, routeCenterY - 4, { align: 'right' });
      doc.setFontSize(10);
      doc.setTextColor(...darkColor);
      doc.text(selectedTrip.toLocation || 'N/A', pageWidth - 25, routeCenterY + 4, { align: 'right' });

      // Arrow and Distance (Center)
      const centerX = pageWidth / 2;

      // Draw Line
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(centerX - 20, routeCenterY, centerX + 20, routeCenterY);

      // Draw Arrowhead
      doc.setFillColor(...primaryColor);
      doc.triangle(
        centerX + 20, routeCenterY,
        centerX + 17, routeCenterY - 1.5,
        centerX + 17, routeCenterY + 1.5,
        'F'
      );

      // Distance Badge
      if (selectedTrip.distance) {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(...primaryColor);
        doc.roundedRect(centerX - 12, routeCenterY - 8, 24, 5, 2, 2, 'FD');
        doc.setFontSize(7);
        doc.setTextColor(...primaryColor);
        doc.text(`${selectedTrip.distance} km`, centerX, routeCenterY - 4.5, { align: 'center' });
      }

      yPos += 35;

      // ===== MATERIALS TABLE =====
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkColor);
      doc.text('MATERIAL CHARGES', 15, yPos);

      yPos += 5;

      // Table Header
      const tableX = 15;
      const tableWidth = pageWidth - 30;
      const colWidths = [15, 75, 25, 20, 30, 30]; // S.No, Material, Qty, Unit, Rate, Amount
      const rowHeight = 10;

      doc.setFillColor(...primaryColor);
      doc.rect(tableX, yPos, tableWidth, rowHeight, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);

      let xPos = tableX;
      const headers = ['S.No', 'Material', 'Qty', 'Unit', 'Rate', 'Amount'];

      // Draw Headers
      doc.text(headers[0], xPos + colWidths[0] / 2, yPos + 6.5, { align: 'center' }); // S.No
      doc.text(headers[1], xPos + colWidths[0] + 4, yPos + 6.5); // Material (Left)
      doc.text(headers[2], xPos + colWidths[0] + colWidths[1] + colWidths[2] / 2, yPos + 6.5, { align: 'center' }); // Qty
      doc.text(headers[3], xPos + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] / 2, yPos + 6.5, { align: 'center' }); // Unit
      doc.text(headers[4], xPos + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] - 4, yPos + 6.5, { align: 'right' }); // Rate
      doc.text(headers[5], xPos + tableWidth - 4, yPos + 6.5, { align: 'right' }); // Amount

      yPos += rowHeight;

      // Table Body
      doc.setTextColor(...darkColor);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);

      const materials = selectedTrip.materials || [];
      materials.forEach((material, index) => {
        // Zebra Striping
        if (index % 2 === 0) {
          doc.setFillColor(248, 250, 252); // Very light slate
          doc.rect(tableX, yPos, tableWidth, rowHeight, 'F');
        }

        // Bottom Border
        doc.setDrawColor(...borderColor);
        doc.line(tableX, yPos + rowHeight, tableX + tableWidth, yPos + rowHeight);

        // Data
        xPos = tableX;
        doc.text(String(index + 1), xPos + colWidths[0] / 2, yPos + 6.5, { align: 'center' });
        doc.text(material.material || 'N/A', xPos + colWidths[0] + 4, yPos + 6.5);
        doc.text(String(material.quantity || '0'), xPos + colWidths[0] + colWidths[1] + colWidths[2] / 2, yPos + 6.5, { align: 'center' });
        doc.text(material.unit || 'N/A', xPos + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] / 2, yPos + 6.5, { align: 'center' });
        doc.text(`Rs. ${parseFloat(material.rate || 0).toFixed(2)}`, xPos + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] - 4, yPos + 6.5, { align: 'right' });
        doc.text(`Rs. ${parseFloat(material.amount || 0).toFixed(2)}`, xPos + tableWidth - 4, yPos + 6.5, { align: 'right' });

        yPos += rowHeight;
      });

      yPos += 10;

      // ===== TOTALS SECTION =====
      let subtotal = parseFloat(selectedTrip.subtotal || 0);
      let gst = parseFloat(selectedTrip.gst || 0);
      let total = parseFloat(selectedTrip.totalAmount || 0);

      // Recalculate if total is 0 but subtotal exists (Fix for bug)
      if (total === 0 && subtotal > 0) {
        total = subtotal + gst;
      }

      const totalsWidth = 80;
      const totalsX = pageWidth - 15 - totalsWidth;

      // Subtotal
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139);
      doc.text('Subtotal:', totalsX, yPos);
      doc.setTextColor(...darkColor);
      doc.text(`Rs. ${subtotal.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });

      yPos += 7;

      // GST
      doc.setTextColor(100, 116, 139);
      doc.text('GST (18%):', totalsX, yPos);
      doc.setTextColor(...darkColor);
      doc.text(`Rs. ${gst.toFixed(2)}`, pageWidth - 15, yPos, { align: 'right' });

      yPos += 5;

      // Divider
      doc.setDrawColor(...borderColor);
      doc.line(totalsX, yPos, pageWidth - 15, yPos);

      yPos += 8;

      // Grand Total (Highlighted)
      doc.setFillColor(...primaryColor);
      doc.roundedRect(totalsX - 5, yPos - 6, totalsWidth + 5, 12, 2, 2, 'F');

      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(255, 255, 255);
      doc.text('GRAND TOTAL:', totalsX, yPos + 2);
      doc.text(`Rs. ${total.toFixed(2)}`, pageWidth - 15, yPos + 2, { align: 'right' });

      yPos += 25;

      // ===== FOOTER =====
      // Push to bottom if needed
      if (yPos < pageHeight - 30) {
        yPos = pageHeight - 30;
      } else if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = pageHeight - 30;
      }

      // Terms
      doc.setDrawColor(...borderColor);
      doc.line(15, yPos, pageWidth - 15, yPos);

      yPos += 8;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184); // Slate-400
      doc.setFont('helvetica', 'italic');
      doc.text('Terms & Conditions:', 15, yPos);
      doc.setFont('helvetica', 'normal');
      doc.text('1. Payment is due within 30 days of invoice date.', 15, yPos + 5);
      doc.text('2. Please make checks payable to "Transport System".', 15, yPos + 9);

      // Signature Area
      doc.text('Authorized Signature', pageWidth - 15, yPos + 15, { align: 'right' });
      doc.setDrawColor(148, 163, 184);
      doc.line(pageWidth - 60, yPos + 10, pageWidth - 15, yPos + 10);

      // Save PDF
      doc.save(`Invoice_${selectedTrip.tripId || 'document'}.pdf`);

      console.log('✅ PDF generated successfully');

    } catch (error) {
      console.error('❌ PDF generation error:', error);
      alert(`Failed to generate PDF: ${error.message}`);
    }
  };

  const getStatusBadge = (status) => {
    const variants = {
      'planned': 'bg-blue-100 text-blue-700 border-blue-200',
      'in-progress': 'bg-amber-100 text-amber-700 border-amber-200',
      'completed': 'bg-emerald-100 text-emerald-700 border-emerald-200',
      'cancelled': 'bg-red-100 text-red-700 border-red-200'
    };
    const statusLabels = {
      'planned': t('billing.planned'),
      'in-progress': t('billing.inProgress'),
      'completed': t('billing.completed'),
      'cancelled': t('billing.cancelled')
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${variants[status] || 'bg-slate-100 text-slate-700 border-slate-200'}`}>
        {statusLabels[status] || status?.toUpperCase()}
      </span>
    );
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
    <div className="p-6 space-y-6 billing-invoice no-print">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <i className="bx bx-receipt text-emerald-600"></i>
            {t('billing.title')}
          </h2>
          <p className="text-slate-500 mt-1">{t('billing.subtitle')}</p>
        </div>
      </div>

      {/* Alert */}
      {showAlert.show && (
        <div className={`px-4 py-3 rounded-lg flex items-center justify-between ${showAlert.variant === 'danger' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
          <div className="flex items-center gap-2">
            <i className={`bx ${showAlert.variant === 'danger' ? 'bx-error-circle' : 'bx-check-circle'} text-xl`}></i>
            <span>{showAlert.message}</span>
          </div>
          <button
            onClick={() => setShowAlert({ show: false, message: '', variant: 'success' })}
            className={`hover:opacity-75 transition-opacity ${showAlert.variant === 'danger' ? 'text-red-500' : 'text-emerald-500'
              }`}
          >
            <i className="bx bx-x text-xl"></i>
          </button>
        </div>
      )}

      {/* Filters Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h6 className="font-semibold text-slate-800 flex items-center gap-2">
            <i className="bx bx-filter text-emerald-600"></i>
            {t('billing.filtersSearch')}
          </h6>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <i className="bx bx-search text-emerald-600"></i>
                {t('billing.searchInvoices')}
              </label>
              <div className="relative">
                <i className="bx bx-search absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl"></i>
                <input
                  type="text"
                  placeholder={t('billing.searchPlaceholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                  style={{ color: '#1e293b' }}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                <i className="bx bx-check-circle text-emerald-600"></i>
                {t('billing.status')}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 h-12 bg-slate-50 border border-slate-200 rounded-lg text-base text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                style={{ color: '#1e293b' }}
              >
                <option value="">{t('billing.allStatus')}</option>
                <option value="planned">{t('billing.planned')}</option>
                <option value="in-progress">{t('billing.inProgress')}</option>
                <option value="completed">{t('billing.completed')}</option>
                <option value="cancelled">{t('billing.cancelled')}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50">
          <h6 className="font-semibold text-slate-800 flex items-center gap-2">
            <i className="bx bx-list-ul text-emerald-600"></i>
            {t('billing.tripInvoices')}
          </h6>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-slate-500">{t('billing.loading')}</p>
          </div>
        ) : (
          <div className="overflow-x-auto scrollbar-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-sm uppercase text-slate-700 font-semibold tracking-wider">
                  <th className="px-6 py-4">{t('billing.tripId')}</th>
                  <th className="px-6 py-4">{t('billing.orderId')}</th>
                  <th className="px-6 py-4">{t('billing.customer')}</th>
                  <th className="px-6 py-4">{t('billing.vehicle')}</th>
                  <th className="px-6 py-4">{t('billing.date')}</th>
                  <th className="px-6 py-4">{t('billing.amount')}</th>
                  <th className="px-6 py-4">{t('billing.status')}</th>
                  <th className="px-6 py-4 text-center">{t('billing.actions')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredTrips.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-12">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <i className="bx bx-receipt text-3xl text-slate-300"></i>
                      </div>
                      <h5 className="text-slate-600 font-medium mb-1">{t('billing.noInvoicesFound')}</h5>
                      <p className="text-slate-400 text-sm">{t('billing.createTripsMessage')}</p>
                    </td>
                  </tr>
                ) : (
                  filteredTrips.map(trip => (
                    <tr key={trip.firebaseId || trip.tripId} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-slate-800 text-base">{trip.tripId}</td>
                      <td className="px-6 py-4 text-slate-600 text-base">{trip.orderId}</td>
                      <td className="px-6 py-4">
                        <div>
                          <div className="font-medium text-slate-800 text-base">{trip.customerName}</div>
                          <div className="text-sm text-slate-500 flex items-center gap-1 mt-0.5">
                            <i className="bx bx-phone"></i>
                            {trip.customerPhone}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-base">{trip.vehicleNumber}</td>
                      <td className="px-6 py-4 text-slate-600 text-base">{new Date(trip.startDate).toLocaleDateString()}</td>
                      <td className="px-6 py-4 font-bold text-emerald-600 text-base">
                        ₹{parseFloat(trip.total || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(trip.status)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => handleViewInvoice(trip)}
                          className="inline-flex items-center px-3 py-1.5 border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg text-sm font-medium transition-colors"
                          title={t('billing.viewInvoice')}
                        >
                          <i className="bx bx-show mr-1.5"></i> {t('billing.view')}
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && selectedTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm invoice-modal">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] overflow-y-auto flex flex-col">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 no-print">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <i className="bx bx-receipt text-emerald-600"></i>
                {t('billing.invoice')} - {selectedTrip?.tripId}
              </h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-grow" id="invoice-content">
              {/* Invoice Header */}
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-emerald-700 mb-2">{t('billing.companyName')}</h2>
                <p className="text-slate-500 mb-1">{t('billing.companySubtitle')}</p>
                <p className="text-slate-500 text-sm flex items-center justify-center gap-4">
                  <span className="flex items-center gap-1"><i className="bx bx-phone"></i> +91 1234567890</span>
                  <span className="flex items-center gap-1"><i className="bx bx-envelope"></i> info@transport.com</span>
                </p>
                <div className="w-full h-px bg-slate-200 my-6"></div>
                <h4 className="text-xl font-bold text-slate-800 uppercase tracking-wide">{t('billing.taxInvoice')}</h4>
              </div>

              {/* Invoice Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                <div className="border border-slate-300 rounded-xl p-6 bg-white">
                  <h6 className="text-emerald-700 font-bold mb-4 uppercase text-sm tracking-wider">{t('billing.billTo')}</h6>
                  <p className="font-bold text-lg text-slate-800 mb-1">{selectedTrip.customerName}</p>
                  <p className="text-slate-600 mb-1 flex items-center gap-2">
                    <i className="bx bx-phone text-slate-400"></i>
                    {selectedTrip.customerPhone}
                  </p>
                  {selectedTrip.customerAddress && (
                    <p className="text-slate-600 mb-1 flex items-start gap-2">
                      <i className="bx bx-map text-slate-400 mt-1"></i>
                      {selectedTrip.customerAddress}
                    </p>
                  )}
                  {selectedTrip.gstNumber && (
                    <p className="text-slate-600 mt-3 pt-3 border-t border-slate-300">
                      <span className="font-semibold text-slate-700">{t('billing.gstNo')}</span> {selectedTrip.gstNumber}
                    </p>
                  )}
                </div>

                <div className="border border-slate-300 rounded-xl p-6 bg-white">
                  <h6 className="text-emerald-700 font-bold mb-4 uppercase text-sm tracking-wider">{t('billing.invoiceDetails')}</h6>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">{t('billing.invoiceNo')}</span>
                      <span className="text-slate-600">{selectedTrip.tripId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">{t('billing.orderId')}</span>
                      <span className="text-slate-600">{selectedTrip.orderId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">{t('billing.date')}</span>
                      <span className="text-slate-600">{new Date(selectedTrip.startDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">{t('billing.vehicle')}</span>
                      <span className="text-slate-600">{selectedTrip.vehicleNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-semibold text-slate-700">{t('transport.driverName')}</span>
                      <span className="text-slate-600">{selectedTrip.driverName}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Details */}
              <div className="mb-8">
                <div className="border border-slate-300 rounded-xl p-6 bg-white">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex-1 text-center md:text-left">
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{t('billing.from')}</div>
                      <div className="font-bold text-slate-800">{selectedTrip.fromLocation}</div>
                    </div>
                    <div className="flex items-center justify-center px-4">
                      <div className="w-full h-px bg-emerald-200 w-16 hidden md:block"></div>
                      <i className="bx bx-right-arrow-alt text-2xl text-emerald-500 mx-2"></i>
                      <div className="w-full h-px bg-emerald-200 w-16 hidden md:block"></div>
                    </div>
                    <div className="flex-1 text-center md:text-right">
                      <div className="text-xs text-slate-500 uppercase tracking-wider font-semibold mb-1">{t('billing.to')}</div>
                      <div className="font-bold text-slate-800">{selectedTrip.toLocation}</div>
                    </div>
                  </div>
                  {selectedTrip.distance && (
                    <div className="mt-4 pt-4 border-t border-slate-300 text-center">
                      <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-slate-200 text-sm font-medium text-slate-600">
                        <i className="bx bx-map-alt text-emerald-500"></i>
                        {t('billing.distance')}: {selectedTrip.distance} km
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Materials Table */}
              <div className="mb-8">
                <h6 className="text-emerald-700 font-bold mb-4 uppercase text-sm tracking-wider">{t('billing.materialDetails')}</h6>
                <div className="border border-slate-300 rounded-xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-emerald-50 border-b border-emerald-100 text-xs uppercase text-emerald-800 font-bold tracking-wider">
                        <th className="px-6 py-4">{t('billing.sNo')}</th>
                        <th className="px-6 py-4">{t('billing.material')}</th>
                        <th className="px-6 py-4">{t('billing.quantity')}</th>
                        <th className="px-6 py-4">{t('billing.unit')}</th>
                        <th className="px-6 py-4">{t('billing.rate')}</th>
                        <th className="px-6 py-4 text-right">{t('billing.amount')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedTrip.materials?.map((material, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 text-slate-600">{index + 1}</td>
                          <td className="px-6 py-4 font-medium text-slate-800">{material.material}</td>
                          <td className="px-6 py-4 text-slate-600">{material.quantity}</td>
                          <td className="px-6 py-4 text-slate-600">{material.unit}</td>
                          <td className="px-6 py-4 text-slate-600">₹{parseFloat(material.rate).toFixed(2)}</td>
                          <td className="px-6 py-4 text-right font-medium text-slate-800">₹{parseFloat(material.amount).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals Section */}
              <div className="flex flex-col md:flex-row justify-end mb-12">
                <div className="w-full md:w-1/2 lg:w-1/3">
                  <div className="bg-white rounded-xl p-6 border border-slate-300 space-y-3">
                    <div className="flex justify-between text-slate-600">
                      <span>{t('billing.materialsTotal')}</span>
                      <span className="font-medium">₹{parseFloat(selectedTrip.materialsTotal || 0).toFixed(2)}</span>
                    </div>
                    {selectedTrip.transportCharges > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>{t('billing.transportCharges')}</span>
                        <span className="font-medium">₹{parseFloat(selectedTrip.transportCharges || 0).toFixed(2)}</span>
                      </div>
                    )}
                    {selectedTrip.otherCharges > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>{t('billing.otherCharges')}</span>
                        <span className="font-medium">₹{parseFloat(selectedTrip.otherCharges || 0).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="w-full h-px bg-slate-300 my-2"></div>
                    <div className="flex justify-between text-slate-800 font-semibold">
                      <span>{t('billing.subtotal')}</span>
                      <span>₹{parseFloat(selectedTrip.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>{t('billing.gst')}</span>
                      <span>₹{parseFloat(selectedTrip.gst || 0).toFixed(2)}</span>
                    </div>
                    <div className="w-full h-px bg-slate-300 my-2"></div>
                    <div className="flex justify-between text-emerald-700 font-bold text-lg">
                      <span>{t('billing.grandTotal')}</span>
                      <span>₹{parseFloat(selectedTrip.total || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-auto pt-8 border-t border-slate-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <p className="font-bold text-slate-800 mb-2">{t('billing.termsConditions')}</p>
                    <ul className="text-xs text-slate-500 space-y-1 list-disc pl-4">
                      <li>{t('billing.paymentDue')}</li>
                      <li>{t('billing.disputes')}</li>
                      <li>{t('billing.goodsReturn')}</li>
                    </ul>
                  </div>
                  <div className="text-right flex flex-col items-end justify-end">
                    <div className="mb-2 w-48 border-b border-slate-400"></div>
                    <p className="font-bold text-slate-800 text-sm">{t('billing.authorizedSignature')}</p>
                  </div>
                </div>
                <div className="text-center mt-8 pt-4 border-t border-slate-300">
                  <p className="text-slate-400 text-sm font-medium">
                    {t('billing.thankYou')}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 no-print rounded-b-2xl">
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 font-medium hover:bg-slate-100 rounded-lg transition-colors"
              >
                {t('billing.close')}
              </button>
              <button
                onClick={handlePrintInvoice}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm shadow-emerald-200 transition-all flex items-center gap-2"
              >
                <i className="bx bx-printer"></i>
                {t('billing.printDownload')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BillingInvoice;
