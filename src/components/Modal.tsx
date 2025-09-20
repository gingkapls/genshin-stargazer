import type { RefObject } from "react";
import type React from "react";

interface ModalProps extends React.DialogHTMLAttributes<HTMLDialogElement> {
  ref: RefObject<HTMLDialogElement | null>;
}

function Modal({ ref, onClose, children }: ModalProps) {
  return (
    <>
      <dialog ref={ref} onClose={onClose}>
        {children}
      </dialog>
    </>
  );
}

export { Modal };
