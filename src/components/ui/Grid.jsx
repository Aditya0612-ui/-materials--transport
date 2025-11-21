import React from 'react';
import PropTypes from 'prop-types';

/**
 * Responsive Grid Component with Tailwind CSS
 * Auto-adjusts columns based on screen size
 */
const Grid = ({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4, xl: 4 },
  gap = 4,
  className = '',
}) => {
  // Generate responsive grid classes
  const gridClasses = `
    grid
    grid-cols-${cols.xs || 1}
    sm:grid-cols-${cols.sm || 2}
    md:grid-cols-${cols.md || 3}
    lg:grid-cols-${cols.lg || 4}
    xl:grid-cols-${cols.xl || 4}
    gap-${gap}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return <div className={gridClasses}>{children}</div>;
};

Grid.propTypes = {
  children: PropTypes.node.isRequired,
  cols: PropTypes.shape({
    xs: PropTypes.number,
    sm: PropTypes.number,
    md: PropTypes.number,
    lg: PropTypes.number,
    xl: PropTypes.number,
  }),
  gap: PropTypes.number,
  className: PropTypes.string,
};

// Container Component
export const Container = ({ children, maxWidth = '7xl', className = '' }) => {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    '7xl': 'max-w-7xl',
    full: 'max-w-full',
  };

  return (
    <div className={`mx-auto px-4 sm:px-6 lg:px-8 ${maxWidthClasses[maxWidth] || maxWidthClasses['7xl']} ${className}`}>
      {children}
    </div>
  );
};

Container.propTypes = {
  children: PropTypes.node.isRequired,
  maxWidth: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', '2xl', '7xl', 'full']),
  className: PropTypes.string,
};

// Flex Component
export const Flex = ({
  children,
  direction = 'row',
  align = 'start',
  justify = 'start',
  wrap = false,
  gap = 4,
  className = '',
}) => {
  const directionClasses = {
    row: 'flex-row',
    'row-reverse': 'flex-row-reverse',
    col: 'flex-col',
    'col-reverse': 'flex-col-reverse',
  };

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  };

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
    evenly: 'justify-evenly',
  };

  const flexClasses = `
    flex
    ${directionClasses[direction]}
    ${alignClasses[align]}
    ${justifyClasses[justify]}
    ${wrap ? 'flex-wrap' : ''}
    gap-${gap}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return <div className={flexClasses}>{children}</div>;
};

Flex.propTypes = {
  children: PropTypes.node.isRequired,
  direction: PropTypes.oneOf(['row', 'row-reverse', 'col', 'col-reverse']),
  align: PropTypes.oneOf(['start', 'center', 'end', 'stretch', 'baseline']),
  justify: PropTypes.oneOf(['start', 'center', 'end', 'between', 'around', 'evenly']),
  wrap: PropTypes.bool,
  gap: PropTypes.number,
  className: PropTypes.string,
};

export default Grid;
