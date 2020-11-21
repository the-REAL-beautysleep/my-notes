import state from "./state/index";
import { saveNotesDebounce } from "./saving";

export type NotesToSave = {
  [key: string]: {
    content: string
    modifiedTime: string
  }
}

export default (content: HTMLElement, tabId: string): void => {
  if (!state.active) {
    return;
  }

  // Stop if the key didn't change the content
  // Example: Ctrl, Alt, Shift, Arrow keys
  if (state.notes[state.active].content === content.innerHTML) {
    return;
  }

  // Different notes can be edited in different tabs/windows
  // 1. Collect the changes to "notesToSave"
  // 2. Use "saveNotesDebouce()" to save all the changes at once
  const notesToSaveItem = localStorage.getItem("notesToSave");
  if (!notesToSaveItem) {
    return;
  }
  const notesToSave = JSON.parse(notesToSaveItem) as NotesToSave;
  notesToSave[state.active] = {
    content: content.innerHTML,
    modifiedTime: new Date().toISOString(),
  };
  localStorage.setItem("notesToSave", JSON.stringify(notesToSave));
  localStorage.setItem("notesChangedBy", tabId);

  saveNotesDebounce(state.notes);
};
