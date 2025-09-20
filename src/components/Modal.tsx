import type { RefObject } from "react";
import type React from "react";

interface ModalProps extends React.DialogHTMLAttributes<HTMLDialogElement> {
  title: string;
  ref: RefObject<HTMLDialogElement | null>;
}

function Modal({ title, ref, onClose, children }: ModalProps) {
  return (
    <>
      <h3>{title}</h3>
      <dialog ref={ref} onClose={onClose}>
        {children}
      </dialog>
    </>
  );
}

export { Modal };
