export type ModalEvent = "close" | "cancel" | "confirm";
export type EventTrigger = (event: ModalEvent, data?: any) => void;
export type ModalContentProps<TProps = Record<any, any>> = TProps & {
    trigger?: EventTrigger;
};
