import { createState, useState } from '@hookstate/core';
import React, { useCallback } from 'react'
import { Confirm, ModalContentProps, SemanticShorthandItem } from 'semantic-ui-react'

type Content = SemanticShorthandItem<ModalContentProps>;

type DialogOptions = {
  title: string;
  content?: Content;
  renderContent?: () => Content;
}

type Dialog = DialogOptions & {
  open: boolean;
  onClose: (confirmed: boolean) => void;
}

const defaultOptions = {
  open: false,
  title: "",
  content: "",
  onClose: (_) => { }
} as Dialog;

const dialogGlobal = createState<Dialog>(defaultOptions);

const openDialog = (props: Dialog) => {
  dialogGlobal.merge(props);
}

export const useConfirmationDialog = () => {
  const getConfirmation = (options: DialogOptions) => {
    return new Promise<boolean>((res) => {
      openDialog({ ...options, onClose: res, open: true });
    });
  }

  return { getConfirmation };
};


export const ConfirmationDialog = () => {
  const dialog = useState(dialogGlobal);

  const handleConfirmCancel = useCallback(() => {
    const onClose = dialog.onClose.get();
    dialog.open.set(false);
    dialog.merge(defaultOptions);
    onClose(false);
  }, [dialog]);

  const handleConfirmOk = useCallback(() => {
    const onClose = dialog.onClose.get();
    dialog.open.set(false);
    dialog.merge(defaultOptions);
    onClose(true);
  }, [dialog]);

  const renderContent = dialog.renderContent.get();
  const content: Content = dialog.content.get() || (renderContent && renderContent()) || "";

return (
  <Confirm
    open={dialog.open.get()}
    header={dialog.title.get()}
    content={content}
    onCancel={handleConfirmCancel}
    onConfirm={handleConfirmOk}
  />
);
}