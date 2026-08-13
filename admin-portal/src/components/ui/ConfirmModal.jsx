import React, { useEffect } from 'react';
import './ConfirmModal.css';

const ConfirmModal = ({
  isOpen,
  title,
  message,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isLoading = false,
}) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="confirm-modal-backdrop" role="presentation">
      <div className="confirm-modal-box" role="dialog" aria-modal="true" aria-label={title}>
        <h3>{title}</h3>
        <p>{message}</p>
        {children ? <div className="confirm-modal-body">{children}</div> : null}
        <div className="confirm-modal-actions">
          <button type="button" className="confirm-modal-btn confirm-modal-btn--outline" onClick={onCancel}>
            {cancelLabel}
          </button>
          <button type="button" className="confirm-modal-btn confirm-modal-btn--primary" onClick={onConfirm} disabled={isLoading}>
            {isLoading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
