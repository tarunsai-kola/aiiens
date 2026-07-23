import Spinner from './Spinner';

const variantMap = {
  primary:   'btn-primary',
  secondary: 'btn-secondary',
  danger:    'btn-danger',
  ghost:     'btn-ghost',
};

/**
 * Reusable Button component.
 *
 * @param {'primary'|'secondary'|'danger'|'ghost'} variant
 * @param {'sm'|'md'|'lg'} size
 * @param {boolean} loading - Shows spinner and disables button
 * @param {string} type - HTML button type
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  type = 'button',
  className = '',
  ...props
}) {
  const sizeClass = { sm: 'text-xs px-3 py-1.5', md: 'text-sm px-4 py-2', lg: 'text-base px-6 py-3' }[size];

  return (
    <button
      type={type}
      disabled={loading || props.disabled}
      className={`btn ${variantMap[variant]} ${sizeClass} ${className}`}
      {...props}
    >
      {loading && <Spinner size="sm" className="border-t-white" />}
      {children}
    </button>
  );
}

export default Button;
