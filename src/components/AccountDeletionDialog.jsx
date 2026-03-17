import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { AlertTriangle } from "lucide-react";
import { base44 } from "@/api/base44Client";

export default function AccountDeletionDialog({ open, onClose, userEmail }) {
  const [confirm, setConfirm] = useState("");
  const [step, setStep] = useState("confirm"); // confirm | requested

  const handleRequest = () => {
    setStep("requested");
  };

  const handleClose = () => {
    setConfirm("");
    setStep("confirm");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Delete Account
          </DialogTitle>
        </DialogHeader>

        {step === "confirm" ? (
          <>
            <DialogDescription className="text-slate-600 text-sm">
              This will permanently delete your account and all associated data. This action cannot be undone.
            </DialogDescription>
            <div className="space-y-3 py-2">
              <p className="text-xs text-slate-500">
                Type your email <span className="font-mono font-semibold text-slate-700">{userEmail}</span> to confirm:
              </p>
              <Input
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder={userEmail}
                className="text-sm"
              />
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={handleClose} className="min-h-[44px]">Cancel</Button>
              <Button
                variant="destructive"
                disabled={confirm !== userEmail}
                onClick={handleRequest}
                className="min-h-[44px]"
              >
                Request Deletion
              </Button>
            </DialogFooter>
          </>
        ) : (
          <>
            <DialogDescription className="text-slate-600 text-sm">
              Your account deletion request has been submitted. You will be contacted at <span className="font-semibold">{userEmail}</span> within 30 days to confirm deletion of all your data.
            </DialogDescription>
            <p className="text-xs text-slate-400 pt-1">
              You may continue using your account until the deletion is processed.
            </p>
            <DialogFooter>
              <Button onClick={handleClose} className="min-h-[44px] w-full">Close</Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}