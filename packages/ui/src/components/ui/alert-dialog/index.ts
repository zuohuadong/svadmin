import { AlertDialog as AlertDialogPrimitive } from "bits-ui";

const Root = AlertDialogPrimitive.Root;
const Trigger = AlertDialogPrimitive.Trigger;
const Action = AlertDialogPrimitive.Action;
const Cancel = AlertDialogPrimitive.Cancel;

export {
	Root,
	Trigger,
	Action,
	Cancel,
};
export { default as Content } from "./alert-dialog-content.svelte";
export { default as Description } from "./alert-dialog-description.svelte";
export { default as Footer } from "./alert-dialog-footer.svelte";
export { default as Header } from "./alert-dialog-header.svelte";
export { default as Overlay } from "./alert-dialog-overlay.svelte";
export { default as Portal } from "./alert-dialog-portal.svelte";
export { default as Title } from "./alert-dialog-title.svelte";
