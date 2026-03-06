import React from 'react';

const DeleteConfirmModal = ({ isOpen, title, message, onConfirm, onCancel, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-lg shadow-lg w-full max-w-sm"
        style={{ backgroundColor: '#FFFFFF' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex items-center gap-3"
          style={{ borderColor: '#E8E4DE' }}
        >
          <span className="text-2xl">⚠️</span>
          <h2 className="text-lg font-bold" style={{ color: '#DC2626' }}>
            {title}
          </h2>
        </div>

        {/* Body */}
        <div className="px-6 py-4">
          <p style={{ color: '#2D2D2D' }}>{message}</p>
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 flex gap-3 justify-end border-t"
          style={{ borderColor: '#E8E4DE' }}
        >
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg font-semibold"
            style={{
              backgroundColor: '#E8E4DE',
              color: '#1A1A1A'
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="px-6 py-2 rounded-lg font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
            style={{ backgroundColor: '#DC2626' }}
          >
            {isLoading ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
