import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Table Component with Tailwind CSS
 * Fully responsive with horizontal scroll on mobile
 */
const Table = ({
  columns = [],
  data = [],
  onRowClick = null,
  striped = true,
  hover = true,
  bordered = false,
  compact = false,
  loading = false,
  emptyMessage = 'No data available',
  className = '',
}) => {
  // Base table classes
  const tableClasses = `
    min-w-full divide-y divide-dark-700
    ${className}
  `.trim().replace(/\s+/g, ' ');

  // Row classes
  const getRowClasses = (index) => {
    const baseRowClasses = 'transition-colors duration-150';
    const stripedClasses = striped && index % 2 === 1 ? 'bg-dark-800/50' : '';
    const hoverClasses = hover ? 'hover:bg-dark-700/70' : '';
    const clickableClasses = onRowClick ? 'cursor-pointer' : '';

    return `${baseRowClasses} ${stripedClasses} ${hoverClasses} ${clickableClasses}`.trim();
  };

  // Cell padding
  const cellPadding = compact ? 'px-3 py-2' : 'px-4 py-3 md:px-6 md:py-4';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <svg
            className="animate-spin h-8 w-8 text-primary-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="text-dark-400 text-sm">Loading data...</p>
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <i className="bx bx-data text-5xl text-dark-600 mb-3"></i>
          <p className="text-dark-400 text-base">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-dark-700 bg-dark-900">
      {/* Horizontal scroll container for mobile with white scrollbar */}
      <div className="min-w-full overflow-x-auto scrollbar-white"
      >
        <table className={tableClasses}>
          {/* Table Header */}
          <thead className="bg-dark-800">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={column.key || index}
                  className={`
                    ${cellPadding}
                    text-left text-sm font-semibold text-dark-300 uppercase tracking-wider
                    ${column.headerClassName || ''}
                    ${column.hidden ? 'hidden md:table-cell' : ''}
                  `}
                  style={{ minWidth: column.minWidth || 'auto' }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="bg-dark-900 divide-y divide-dark-700">
            {data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                className={getRowClasses(rowIndex)}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => {
                  const cellValue = column.render
                    ? column.render(row, rowIndex)
                    : row[column.key];

                  return (
                    <td
                      key={`${rowIndex}-${column.key || colIndex}`}
                      className={`
                        ${cellPadding}
                        text-base text-dark-200
                        ${column.cellClassName || ''}
                        ${column.hidden ? 'hidden md:table-cell' : ''}
                      `}
                    >
                      {cellValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile scroll indicator */}
      <div className="md:hidden bg-dark-800 px-4 py-2 text-center">
        <p className="text-xs text-dark-400 flex items-center justify-center gap-2">
          <i className="bx bx-chevrons-right animate-pulse"></i>
          Scroll horizontally to view more
        </p>
      </div>
    </div>
  );
};

Table.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      key: PropTypes.string,
      label: PropTypes.string.isRequired,
      render: PropTypes.func,
      minWidth: PropTypes.string,
      headerClassName: PropTypes.string,
      cellClassName: PropTypes.string,
      hidden: PropTypes.bool, // Hide on mobile, show on md+
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  onRowClick: PropTypes.func,
  striped: PropTypes.bool,
  hover: PropTypes.bool,
  bordered: PropTypes.bool,
  compact: PropTypes.bool,
  loading: PropTypes.bool,
  emptyMessage: PropTypes.string,
  className: PropTypes.string,
};

export default Table;
