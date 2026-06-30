/** Full-screen loading indicator shown while the session is being resolved. */
export function FullPageSpinner() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div
        role="status"
        aria-label="Loading"
        className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-indigo-600"
      />
    </div>
  );
}
