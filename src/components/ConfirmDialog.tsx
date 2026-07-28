interface ConfirmDialogProps {
  confirmState: { message: string; resolve: (value: boolean) => void } | null;
  setConfirmState: (state: null) => void;
}

function ConfirmDialog({ confirmState, setConfirmState }: ConfirmDialogProps) {
  if (!confirmState) return null;

  const respond = (value: boolean) => {
    confirmState.resolve(value);
    setConfirmState(null);
  };

  return (
    <div className="modal-overlay" onClick={() => respond(false)}>
      <div className="modal-content confirm-dialog" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-dialog-message">{confirmState.message}</p>
        <div className="confirm-dialog-actions">
          <button type="button" className="btn btn-secondary" onClick={() => respond(false)}>
            Cancel
          </button>
          <button type="button" className="btn btn-primary" onClick={() => respond(true)}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
