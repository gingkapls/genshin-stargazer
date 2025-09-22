import type { RefObject } from "react";
import type React from "react";

interface ModalProps extends React.DialogHTMLAttributes<HTMLDialogElement> {
  ref?: RefObject<HTMLDialogElement | null>;
  title: string;
}

function Modal({ title, className, children, ...props }: ModalProps) {
  return (
    <>
      <dialog {...props}>
        <div className="dialog-modal-container">
          <div className={className + " " + "dialog-modal-card"}>
            <h4>{title}</h4>
            {children}
          </div>
        </div>
      </dialog>
    </>
  );
}

export { Modal };
