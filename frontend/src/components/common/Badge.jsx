/**
 * Badge component for status indicators.
 * @param {'success'|'danger'|'warning'|'info'|'neutral'} variant
 */
function Badge({ children, variant = 'neutral', className = '' }) {
  return (
    <span className={`badge-${variant} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
