import { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-100 p-0 sm:p-4">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl h-[90vh] flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-200">
        <div className="p-5 border-b border-stone-100 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-black text-[#292524]">{title}</h2>
          <button
            onClick={onClose}
            type="button"
            className="p-1 hover:bg-stone-100 rounded-full transition"
          >
            <X className="w-5 h-5 text-stone-600" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-5 pb-16">
          {children}
        </div>
      </div>
    </div>
  );
}
