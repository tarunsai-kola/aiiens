/**
 * EmptyState — Shown when a list has no items.
 */
function EmptyState({ icon = '📭', title = 'Nothing here', description = '', action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <span className="text-5xl mb-4">{icon}</span>
      <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-sm">{description}</p>
      )}
      {action && action}
    </div>
  );
}

export default EmptyState;
