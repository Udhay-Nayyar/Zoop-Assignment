"use client";

import { Button } from "../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "../../components/ui/dialog";

export default function ConfirmDialog({ open, title, children, onCancel, onConfirm, busy, error }) {
  return (
    <Dialog open={open} onOpenChange={(nextOpen) => {
      if (!nextOpen && !busy) onCancel();
    }}>
      <DialogContent aria-describedby="confirm-dialog-description" className="confirm-dialog" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription id="confirm-dialog-description">{children}</DialogDescription>
        </DialogHeader>
        {error && <p className="form-error-banner" role="alert">{error}</p>}
        <DialogFooter className="dialog-actions">
          <Button disabled={busy} onClick={onCancel} type="button" variant="outline">Cancel</Button>
          <Button disabled={busy} onClick={onConfirm} type="button" variant="destructive">
            {busy ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
