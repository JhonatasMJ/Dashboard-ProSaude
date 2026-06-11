import { useCallback, useState } from "react";

export function useCrudSheetState<T>() {
  const [formOpen, setFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<T | null>(null);
  const [deletingItem, setDeletingItem] = useState<T | null>(null);

  const openCreate = useCallback(() => {
    setEditingItem(null);
    setFormOpen(true);
  }, []);

  const openEdit = useCallback((item: T) => {
    setEditingItem(item);
    setFormOpen(true);
  }, []);

  const handleFormOpenChange = useCallback((open: boolean) => {
    setFormOpen(open);
    if (!open) {
      setEditingItem(null);
    }
  }, []);

  return {
    formOpen,
    editingItem,
    deletingItem,
    setDeletingItem,
    openCreate,
    openEdit,
    handleFormOpenChange,
  };
}
