const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-10 h-10 border-4',
  xl: 'w-16 h-16 border-4',
};

function Spinner({ size = 'md', className = '' }) {
  return (
    <div
      role="status"
      aria-label="Loading"
      className={`
        ${sizeMap[size]}
        rounded-full border-gray-200 border-t-primary-600
        animate-spin
        ${className}
      `}
    />
  );
}

export default Spinner;
