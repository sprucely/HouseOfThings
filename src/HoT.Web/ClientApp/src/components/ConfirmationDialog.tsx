import { createState, useState } from '@hookstate/core';
import React, { useCallback } from 'react'
import { Confirm } from 'semantic-ui-react'

type Dialog = {
  open: boolean;
  title: string;
  message: string;
  onClose: (confirmed: boolean) => void;
}

const defaultOptions = { 
  open: false, 
  title:"", 
  message:"",
  onClose: (_) => { } 
} as Dialog;

const dialogGlobal = createState<Dialog>(defaultOptions);

const openDialog = (title: string, message: string, onClose: (confirmed: boolean) => void) => {
  dialogGlobal.merge({ open: true, title, message, onClose });
}

export const useConfirmationDialog = () => {
  const getConfirmation = (title: string, message: string) => {
    return new Promise<boolean>((res) => {
      openDialog(title, message, res);
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

  return (
    <Confirm
      open={dialog.open.get()}
      header={dialog.title.get()}
      content={dialog.message.get()}
      onCancel={handleConfirmCancel}
      onConfirm={handleConfirmOk}
    />
  );
}