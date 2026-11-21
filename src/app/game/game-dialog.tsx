"use client";

import { useLayoutEffect, useRef, type ComponentProps, type KeyboardEvent } from "react";

const controls = 'button:enabled, a[href], input:enabled, select:enabled, textarea:enabled, summary, [tabindex="0"]';
const editable = 'input, select, textarea, [contenteditable="true"]';

function focusable(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>(controls)).filter(
    element => element.tabIndex >= 0 && element.getClientRects().length > 0,
  );
}

type GameDialogProps = Omit<ComponentProps<"dialog">, "onCancel"> & {
  onBack: () => void;
  focusKey?: string;
};

export default function GameDialog({ onBack, focusKey, children, ...props }: GameDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const previousKey = useRef<string | undefined>(undefined);

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const opener = document.activeElement;
    const field = dialog.closest("main")?.querySelector<HTMLElement>("[data-game-focus]");
    dialog.showModal();
    return () => {
      dialog.close();
      // Restore focus after the modal leaves the DOM and the field is interactive.
      requestAnimationFrame(() => {
        if (document.querySelector("dialog[open]")) return;
        if (opener instanceof HTMLElement && opener !== document.body && opener.isConnected) {
          opener.focus({ preventScroll: true });
        } else {
          field?.focus({ preventScroll: true });
        }
      });
    };
  }, []);

  useLayoutEffect(() => {
    const dialog = ref.current;
    if (!dialog?.open) return;
    const changed = previousKey.current !== focusKey;
    previousKey.current = focusKey;
    const active = document.activeElement;
    const lostFocus = !dialog.contains(active) || active === dialog || active?.matches(":disabled");
    if (changed || lostFocus) {
      const target = dialog.querySelector<HTMLElement>("[data-dialog-start]:not(:disabled)") ?? focusable(dialog)[0];
      target?.focus({ preventScroll: true });
    }
  });

  function navigate(event: KeyboardEvent<HTMLDialogElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;
    const target = event.target as HTMLElement;
    if (target.closest(editable)) return;
    const dialog = event.currentTarget;
    const scroll = dialog.querySelector<HTMLElement>("[data-dialog-scroll]") ?? dialog;
    if (event.key === "PageDown" || event.key === "PageUp") {
      event.preventDefault();
      scroll.scrollBy(0, (event.key === "PageDown" ? 1 : -1) * scroll.clientHeight * 0.8);
      return;
    }
    if (!["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;

    const items = focusable(dialog);
    const index = items.indexOf(target);
    const grid = target.closest(".yzg-app-grid");
    if (grid && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      const tiles = focusable(grid as HTMLElement);
      const next = tiles[tiles.indexOf(target) + (event.key === "ArrowDown" ? 2 : -2)];
      if (next) {
        event.preventDefault();
        next.focus();
        return;
      }
    }
    const offset = event.key === "ArrowUp" || event.key === "ArrowLeft" ? -1 : 1;
    const next = event.key === "Home" ? items[0] : event.key === "End" ? items.at(-1) : items[index + offset];
    if (next) {
      event.preventDefault();
      next.focus();
    }
  }

  return <dialog {...props} ref={ref} onKeyDown={navigate} onCancel={event => {
    event.preventDefault();
    onBack();
  }}>{children}</dialog>;
}
