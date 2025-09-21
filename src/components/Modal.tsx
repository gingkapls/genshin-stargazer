import type { RefObject } from "react";
import type React from "react";

interface ModalProps extends React.DialogHTMLAttributes<HTMLDialogElement> {
  ref?: RefObject<HTMLDialogElement | null>;
}

function Modal({ children, ...props }: ModalProps) {
  return (
    <>
      <dialog {...props}>{children}</dialog>
    </>
  );
}

export { Modal };
