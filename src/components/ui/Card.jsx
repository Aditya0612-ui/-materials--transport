import React from 'react';
import PropTypes from 'prop-types';

/**
 * Reusable Card Component with Tailwind CSS
 * Minimal modern design with gradient support
 */
const Card = ({
  children,
  title,
  subtitle,
  icon,
  headerAction,
  footer,
  variant = 'default',
  padding = 'normal',
  hover = false,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  onClick,
}) => {
  // Base card classes
  const baseClasses = 'rounded-xl border transition-all duration-200';

  // Variant styles
  const variants = {
    default: 'bg-dark-900 border-dark-700 shadow-lg',
    gradient: 'bg-gradient-to-br from-primary-900/20 to-primary-800/10 border-primary-700/50 shadow-lg shadow-primary-900/20',
    glass: 'bg-dark-900/60 backdrop-blur-lg border-dark-700/50 shadow-xl',
    outlined: 'bg-transparent border-dark-600',
    elevated: 'bg-dark-900 border-dark-700 shadow-2xl',
  };

  // Padding styles
  const paddings = {
    none: '',
    sm: 'p-3',
    normal: 'p-4 md:p-6',
    lg: 'p-6 md:p-8',
  };

  // Hover effect
  const hoverClasses = hover ? 'hover:shadow-xl hover:scale-[1.02] hover:border-primary-600/50' : '';
  const clickableClasses = onClick ? 'cursor-pointer' : '';

  const cardClasses = `
    ${baseClasses}
    ${variants[variant] || variants.default}
    ${hoverClasses}
    ${clickableClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      {/* Card Header */}
      {(title || subtitle || icon || headerAction) && (
        <div className={`flex items-start justify-between gap-4 pb-4 border-b border-dark-700/50 ${paddings[padding]} ${headerClassName}`}>
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Icon */}
            {icon && (
              <div className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white shadow-lg">
                {typeof icon === 'string' ? (
                  <i className={`${icon} text-xl md:text-2xl`}></i>
                ) : (
                  icon
                )}
              </div>
            )}

            {/* Title & Subtitle */}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-base md:text-lg font-semibold text-white truncate">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-dark-400 mt-1 line-clamp-2">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {/* Header Action */}
          {headerAction && (
            <div className="flex-shrink-0">
              {headerAction}
            </div>
          )}
        </div>
      )}

      {/* Card Body */}
      <div className={`${!title && !subtitle && !icon && !headerAction ? paddings[padding] : 'pt-4 ' + paddings[padding]} ${bodyClassName}`}>
        {children}
      </div>

      {/* Card Footer */}
      {footer && (
        <div className={`pt-4 border-t border-dark-700/50 ${paddings[padding]} ${footerClassName}`}>
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  children: PropTypes.node.isRequired,
  title: PropTypes.string,
  subtitle: PropTypes.string,
  icon: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  headerAction: PropTypes.node,
  footer: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'gradient', 'glass', 'outlined', 'elevated']),
  padding: PropTypes.oneOf(['none', 'sm', 'normal', 'lg']),
  hover: PropTypes.bool,
  className: PropTypes.string,
  headerClassName: PropTypes.string,
  bodyClassName: PropTypes.string,
  footerClassName: PropTypes.string,
  onClick: PropTypes.func,
};

// Stats Card Component
export const StatsCard = ({ title, value, icon, trend, trendValue, color = 'primary', className = '' }) => {
  const colorClasses = {
    primary: 'from-primary-600 to-primary-700',
    success: 'from-green-600 to-green-700',
    warning: 'from-yellow-500 to-yellow-600',
    danger: 'from-red-600 to-red-700',
    info: 'from-blue-600 to-blue-700',
  };

  return (
    <Card variant="gradient" hover className={className}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm text-dark-300 mb-1">{title}</p>
          <h3 className="text-2xl md:text-3xl font-bold text-white">{value}</h3>
          {trend && (
            <div className={`flex items-center gap-1 mt-2 text-sm ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
              <i className={`bx ${trend === 'up' ? 'bx-trending-up' : 'bx-trending-down'}`}></i>
              <span>{trendValue}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`w-12 h-12 md:w-14 md:h-14 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white shadow-lg`}>
            <i className={`${icon} text-2xl md:text-3xl`}></i>
          </div>
        )}
      </div>
    </Card>
  );
};

StatsCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  icon: PropTypes.string,
  trend: PropTypes.oneOf(['up', 'down']),
  trendValue: PropTypes.string,
  color: PropTypes.oneOf(['primary', 'success', 'warning', 'danger', 'info']),
  className: PropTypes.string,
};

export default Card;
