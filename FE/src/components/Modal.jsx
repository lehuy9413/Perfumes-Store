import React from 'react';

const Modal = ({ isOpen, title, onClose, children, isLoading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div
        className="rounded-lg shadow-lg w-full max-w-md"
        style={{ backgroundColor: '#FFFFFF' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="px-6 py-4 border-b flex justify-between items-center"
          style={{ borderColor: '#E8E4DE' }}
        >
          <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-2xl font-bold transition-opacity hover:opacity-70"
            style={{ color: '#2D2D2D' }}
          >
            ×
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-4 max-h-96 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
