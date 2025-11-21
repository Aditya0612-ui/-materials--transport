import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

/**
 * Reusable Modal Component with Tailwind CSS
 * Fully responsive with mobile optimizations
 */
const Modal = ({
  isOpen = false,
  onClose,
  title,
  children,
  footer = null,
  size = 'md',
  closeOnOverlayClick = true,
  closeOnEscape = true,
  showCloseButton = true,
  className = '',
}) => {
  // Handle escape key
  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeOnEscape, onClose]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    full: 'max-w-full mx-4',
  };

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn"
      onClick={handleOverlayClick}
    >
      {/* Modal Container */}
      <div
        className={`
          relative w-full ${sizeClasses[size] || sizeClasses.md}
          bg-dark-900 rounded-xl shadow-2xl
          border border-dark-700
          flex flex-col
          max-h-[90vh] md:max-h-[85vh]
          animate-slideUp
          ${className}
        `}
      >
        {/* Modal Header */}
        {(title || showCloseButton) && (
          <div className="flex items-center justify-between px-4 py-3 md:px-6 md:py-4 border-b border-dark-700 bg-gradient-to-r from-primary-900/20 to-primary-800/20">
            {title && (
              <h3 className="text-lg md:text-xl font-semibold text-white">
                {title}
              </h3>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="ml-auto flex-shrink-0 p-2 rounded-lg text-dark-400 hover:text-white hover:bg-dark-800 transition-colors duration-200 min-h-touch min-w-touch"
                aria-label="Close modal"
              >
                <i className="bx bx-x text-2xl"></i>
              </button>
            )}
          </div>
        )}

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
          {children}
        </div>

        {/* Modal Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 px-4 py-3 md:px-6 md:py-4 border-t border-dark-700 bg-dark-800/50">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

Modal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string,
  children: PropTypes.node.isRequired,
  footer: PropTypes.node,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', 'full']),
  closeOnOverlayClick: PropTypes.bool,
  closeOnEscape: PropTypes.bool,
  showCloseButton: PropTypes.bool,
  className: PropTypes.string,
};

// Preset footer configurations
export const ModalFooter = ({ onCancel, onConfirm, cancelText = 'Cancel', confirmText = 'Confirm', confirmVariant = 'primary', loading = false }) => (
  <>
    <Button variant="ghost" onClick={onCancel} disabled={loading}>
      {cancelText}
    </Button>
    <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>
      {confirmText}
    </Button>
  </>
);

ModalFooter.propTypes = {
  onCancel: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  cancelText: PropTypes.string,
  confirmText: PropTypes.string,
  confirmVariant: PropTypes.string,
  loading: PropTypes.bool,
};

export default Modal;
