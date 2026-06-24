import React, { createContext, useContext, useState, useCallback } from 'react';
import Modal from './Modal';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState({ open: false, message: '', resolve: null, title: 'Confirm' });

  const showConfirm = useCallback(({ title = 'Confirm', message = '' } = {}) => {
    return new Promise((resolve) => {
      setConfirmState({ open: true, message, resolve, title });
    });
  }, []);

  const handleClose = (result) => {
    if (confirmState.resolve) confirmState.resolve(result);
    setConfirmState({ open: false, message: '', resolve: null, title: 'Confirm' });
  };

  return (
    <ConfirmContext.Provider value={{ showConfirm }}>
      {children}
      {confirmState.open && (
        <Modal title={confirmState.title} onClose={() => handleClose(false)} footer={(
          <>
            <button className="btn btn-secondary" onClick={() => handleClose(false)}>Cancel</button>
            <button className="btn btn-destructive" onClick={() => handleClose(true)}>Confirm</button>
          </>
        )}>
          <div style={{ minWidth: 320 }}>{confirmState.message}</div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used within ConfirmProvider');
  return ctx;
}

export default ConfirmProvider;
