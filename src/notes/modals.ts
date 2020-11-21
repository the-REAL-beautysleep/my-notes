import state from "./state/index";
import { modalTemplate } from "./view/elements";
import { isReserved } from "./reserved";
import range from "./range";

const removeModal = (onRemove?: () => void) => {
  const modal = document.getElementById("modal");
  if (!modal) {
    return false;
  }
  modal.remove();
  onRemove && onRemove();
  document.body.classList.remove("with-modal", "with-overlay", "to-rename", "to-create", "to-delete");
  range.restore();
  return true;
};

interface CreateModalOptions {
  clazz?: string
  overlay?: string
  captionValue: string
  inputValue: string
  cancelValue?: string
  confirmValue: string
  descriptionId?: string
  validate?: (inputValue: string) => boolean
  onConfirm?: (something: string) => void
  onRemove?: () => void
}

const createModal = ({
  clazz,
  overlay,
  captionValue,
  inputValue,
  cancelValue,
  confirmValue,
  descriptionId,
  validate,
  onConfirm,
  onRemove,
}: CreateModalOptions) => {
  removeModal();
  range.save();

  const node = modalTemplate.content.cloneNode(true) as DocumentFragment;

  const modal = node.getElementById("modal");
  const caption = node.getElementById("caption");
  const input = node.getElementById("input") as HTMLInputElement;
  const cancel = node.getElementById("cancel") as HTMLButtonElement;
  const confirm = node.getElementById("confirm") as HTMLButtonElement;

  if (!modal || !caption || !input || !cancel || !confirm) {
    return;
  }

  if (clazz) {
    modal.className = clazz;
  }

  if (descriptionId) {
    const modalDescription = node.getElementById(descriptionId);
    if (modalDescription) {
      modal.append(modalDescription);
    }
  }

  if (captionValue) { caption.innerHTML = captionValue; } else { caption.className = "hide"; }
  if (inputValue) { input.value = inputValue; } else { input.className = "hide"; }
  if (cancelValue) { cancel.value = cancelValue; }
  if (confirmValue) { confirm.value = confirmValue; }

  const action = () => {
    const valid = validate ? validate(input.value) : true;
    if (!valid) {
      return;
    }

    removeModal(onRemove);
    if (input.value && onConfirm) {
      setTimeout(() => {
        onConfirm(input.value);
      }, 0);
    }
  };

  confirm.onclick = (event) => {
    event.preventDefault();
    action();
  };

  input.onkeyup = (event) => {
    if (event.keyCode === 13) {
      event.preventDefault();
      action();
    }
  };

  cancel.onclick = () => {
    removeModal(onRemove);
  };

  document.body.classList.add("with-modal");
  if (overlay) { document.body.classList.add("with-overlay", overlay); }
  document.body.prepend(modal);

  input.focus();
  input.onblur = () => {
    input.focus();
  };
};

export const insertImageModal = (onConfirm: (src: string) => void): void => {
  createModal({
    clazz: "with-border",
    captionValue: "Image URL",
    inputValue: "",
    confirmValue: "Insert",
    validate: (inputValue) => inputValue.length > 0,
    onConfirm,
  });
};

export const insertLinkModal = (onConfirm: (href: string) => void): void => {
  createModal({
    clazz: "with-border",
    captionValue: "Link URL",
    inputValue: "",
    confirmValue: "Insert",
    descriptionId: "insert-link-modal-description",
    validate: (inputValue) => inputValue.length > 0,
    onConfirm,
  });
};

export const newNoteModal = (onConfirm: (newNoteName: string) => void): void => {
  createModal({
    overlay: "to-create",
    captionValue: "New note",
    inputValue: "",
    confirmValue: "Create",
    validate: (inputValue) => inputValue.length > 0 && !isReserved(inputValue) && !(inputValue in state.notes),
    onConfirm,
  });
};

export const renameNoteModal = (currentName: string, onConfirm: (newName: string) => void): void => {
  createModal({
    overlay: "to-rename",
    captionValue: "",
    confirmValue: "Rename",
    inputValue: currentName,
    validate: (inputValue) => inputValue.length > 0 && inputValue !== currentName && !isReserved(inputValue) && !(inputValue in state.notes),
    onConfirm,
  });
};

export const deleteNoteModal = (noteName: string, onRemove: () => void): void => {
  createModal({
    overlay: "to-delete",
    captionValue: `Delete ${noteName}?`,
    inputValue: "",
    cancelValue: "No",
    confirmValue: "Yes",
    onRemove,
  });
};
