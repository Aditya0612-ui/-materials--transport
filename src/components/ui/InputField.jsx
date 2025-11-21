import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable InputField Component with Tailwind CSS
 * Supports various input types, validation states, and icons
 */
const InputField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  disabled = false,
  required = false,
  error = null,
  helperText = null,
  icon = null,
  iconPosition = 'left',
  fullWidth = true,
  className = '',
  inputClassName = '',
  rows = 3,
  ...props
}) => {
  // Base input classes
  const baseInputClasses = 'block w-full rounded-lg border transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed min-h-touch';

  // State-based classes
  const stateClasses = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500 bg-red-50 dark:bg-red-900/10'
    : 'border-dark-600 focus:border-primary-500 focus:ring-primary-500 bg-dark-800 text-white';

  // Size classes
  const sizeClasses = type === 'textarea' ? 'px-4 py-3 text-base' : 'px-4 py-2.5 text-base';

  // Icon padding
  const iconPaddingClasses = icon
    ? iconPosition === 'left'
      ? 'pl-11'
      : 'pr-11'
    : '';

  const inputClasses = `
    ${baseInputClasses}
    ${stateClasses}
    ${sizeClasses}
    ${iconPaddingClasses}
    ${inputClassName}
  `.trim().replace(/\s+/g, ' ');

  const containerClasses = `${fullWidth ? 'w-full' : ''} ${className}`;

  return (
    <div className={containerClasses}>
      {/* Label */}
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-dark-200 mb-2"
        >
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon */}
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className={`text-lg ${error ? 'text-red-500' : 'text-dark-400'}`}>
              {icon}
            </span>
          </div>
        )}

        {/* Input or Textarea */}
        {type === 'textarea' ? (
          <textarea
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            rows={rows}
            className={inputClasses}
            {...props}
          />
        ) : type === 'select' ? (
          <select
            id={name}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            disabled={disabled}
            required={required}
            className={inputClasses}
            {...props}
          >
            {props.children}
          </select>
        ) : (
          <input
            id={name}
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            onBlur={onBlur}
            placeholder={placeholder}
            disabled={disabled}
            required={required}
            className={inputClasses}
            {...props}
          />
        )}

        {/* Right Icon */}
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className={`text-lg ${error ? 'text-red-500' : 'text-dark-400'}`}>
              {icon}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className="mt-2 text-sm text-red-500 flex items-center gap-1">
          <i className="bx bx-error-circle"></i>
          {error}
        </p>
      )}

      {/* Helper Text */}
      {!error && helperText && (
        <p className="mt-2 text-sm text-dark-400">{helperText}</p>
      )}
    </div>
  );
};

InputField.propTypes = {
  label: PropTypes.string,
  type: PropTypes.oneOf(['text', 'email', 'password', 'number', 'tel', 'url', 'date', 'time', 'datetime-local', 'textarea', 'select']),
  name: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onChange: PropTypes.func.isRequired,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  error: PropTypes.string,
  helperText: PropTypes.string,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  fullWidth: PropTypes.bool,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
  rows: PropTypes.number,
  children: PropTypes.node,
};

export default InputField;
