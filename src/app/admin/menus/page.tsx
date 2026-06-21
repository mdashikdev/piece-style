'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/adminApi';
import toast from 'react-hot-toast';
import { Plus, Edit2, Trash2, GripVertical, ChevronRight, ChevronDown, Tags } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MenuItem {
  id: string;
  name: string;
  href: string | null;
  parentId: string | null;
  sortOrder: number;
  active: boolean;
  children?: MenuItem[];
}

function SortableItem({ item, depth, onEdit, onDelete, onAddChild }: { item: MenuItem; depth: number; onEdit: (item: MenuItem) => void; onDelete: (id: string) => void; onAddChild: (parentId: string) => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id });
  const [expanded, setExpanded] = useState(true);
  const hasChildren = item.children && item.children.length > 0;

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    marginLeft: depth * 24,
  };

  return (
    <div ref={setNodeRef} style={style} className="bg-white border border-gray-200 rounded-lg mb-1">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button {...attributes} {...listeners} className="cursor-grab text-gray-400 hover:text-gray-600 flex-shrink-0">
          <GripVertical size={16} />
        </button>
        {hasChildren ? (
          <button onClick={() => setExpanded(!expanded)} className="text-gray-400 hover:text-gray-600 flex-shrink-0">
            {expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
          </button>
        ) : (
          <span className="w-3.5 flex-shrink-0" />
        )}
        <span className={`flex-1 text-sm ${!item.active ? 'text-gray-400 line-through' : ''}`}>{item.name}</span>
        {item.href && <span className="text-xs text-gray-400 hidden sm:block max-w-[200px] truncate">{item.href}</span>}
        <div className="flex items-center gap-1 flex-shrink-0">
          <button onClick={() => onAddChild(item.id)} className="p-1 text-gray-400 hover:text-blue-600 rounded" title="Add sub-menu">
            <Plus size={14} />
          </button>
          <button onClick={() => onEdit(item)} className="p-1 text-gray-400 hover:text-green-600 rounded" title="Edit">
            <Edit2 size={14} />
          </button>
          <button onClick={() => onDelete(item.id)} className="p-1 text-gray-400 hover:text-red-600 rounded" title="Delete">
            <Trash2 size={14} />
          </button>
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="border-t border-gray-100">
          <SortableContext items={item.children!.map(c => c.id)} strategy={verticalListSortingStrategy}>
            {item.children!.map((child) => (
              <SortableItem key={child.id} item={child} depth={depth + 1} onEdit={onEdit} onDelete={onDelete} onAddChild={onAddChild} />
            ))}
          </SortableContext>
        </div>
      )}
    </div>
  );
}

export default function AdminMenusPage() {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', href: '' });
  const [formParentId, setFormParentId] = useState<string | null>(null);
  const [activeItem, setActiveItem] = useState<MenuItem | null>(null);
  const [dragDelta, setDragDelta] = useState({ x: 0, y: 0 });

  const { data: menuData, isLoading } = useQuery({
    queryKey: ['admin-menus'],
    queryFn: () => adminApi.get('/menus').then(r => r.data.data),
  });

  const createMutation = useMutation({
    mutationFn: (body: any) => adminApi.post('/menus', body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-menus'] }); toast.success('Menu item created'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to create'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, ...body }: any) => adminApi.put(`/menus/${id}`, body),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-menus'] }); toast.success('Menu item updated'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to update'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.delete(`/menus/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-menus'] }); toast.success('Menu item deleted'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to delete'),
  });

  const reorderMutation = useMutation({
    mutationFn: (items: any[]) => adminApi.put('/menus/reorder', { items }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-menus'] }),
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to reorder'),
  });

  const seedMutation = useMutation({
    mutationFn: () => adminApi.post('/menus/seed'),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['admin-menus'] }); toast.success('Default menus imported!'); },
    onError: (err: any) => toast.error(err.response?.data?.error || 'Failed to import'),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const flattenItems = useCallback((items: MenuItem[], parentId: string | null = null): any[] => {
    const result: any[] = [];
    items.forEach((item, idx) => {
      result.push({ id: item.id, sortOrder: idx, parentId });
      if (item.children) {
        result.push(...flattenItems(item.children, item.id));
      }
    });
    return result;
  }, []);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over, delta } = event;
    if (!over || active.id === over.id) return;
    const items = menuData ? [...menuData] : [];
    const flat = flattenItems(items);
    const oldIdx = flat.findIndex((f: any) => f.id === active.id);
    const newIdx = flat.findIndex((f: any) => f.id === over.id);
    if (oldIdx === -1 || newIdx === -1) return;
    const [moved] = flat.splice(oldIdx, 1);
    const target = flat[newIdx > oldIdx ? newIdx - 1 : newIdx];
    if (target) {
      if (delta.x > 20) {
        moved.parentId = over.id;
      } else {
        moved.parentId = target.parentId;
      }
    }
    flat.splice(newIdx > oldIdx ? newIdx - 1 : newIdx, 0, moved);
    const updated = flat.map((f: any, idx: number) => ({ ...f, sortOrder: idx }));
    reorderMutation.mutate(updated);
    setActiveItem(null);
  };

  const findItem = (id: string, list: MenuItem[]): MenuItem | null => {
    for (const item of list) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItem(id, item.children);
        if (found) return found;
      }
    }
    return null;
  };

  const handleDragStart = (event: DragStartEvent) => {
    const found = findItem(event.active.id as string, items);
    setActiveItem(found);
    setDragDelta({ x: 0, y: 0 });
  };

  const handleDragMove = (event: any) => {
    setDragDelta({ x: event.delta.x, y: event.delta.y });
  };

  const handleAddRoot = () => {
    setFormParentId(null);
    setForm({ name: '', href: '' });
    setEditingItem(null);
    setShowForm(true);
  };

  const handleAddChild = (parentId: string) => {
    setFormParentId(parentId);
    setForm({ name: '', href: '' });
    setEditingItem(null);
    setShowForm(true);
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormParentId(item.parentId);
    setForm({ name: item.name, href: item.href || '' });
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this menu item and all its children?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) return toast.error('Name is required');
    if (editingItem) {
      updateMutation.mutate({ id: editingItem.id, name: form.name, href: form.href || null, parentId: formParentId });
    } else {
      createMutation.mutate({ name: form.name, href: form.href || null, parentId: formParentId });
    }
    setShowForm(false);
    setEditingItem(null);
    setForm({ name: '', href: '' });
    setFormParentId(null);
  };

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminApi.get('/categories').then(r => r.data.data),
  });

  const items = menuData || [];

  const menuHrefs = new Set(items.flatMap((i: MenuItem) => {
    const hrefs = [i.href];
    if (i.children) hrefs.push(...i.children.map((c: MenuItem) => c.href));
    return hrefs;
  }).filter(Boolean));

  return (
    <div className="flex gap-6">
      <div className="flex-1 min-w-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Menu Management</h1>
        <button onClick={handleAddRoot} className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors">
          <Plus size={16} /> Add Menu Item
        </button>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/20 z-50 flex items-center justify-center" onClick={() => setShowForm(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4 shadow-xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-semibold mb-4">{editingItem ? 'Edit Menu Item' : 'Add Menu Item'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="e.g. HOME" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Link (optional)</label>
                <input value={form.href} onChange={e => setForm({...form, href: e.target.value})} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20" placeholder="e.g. /about" />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Cancel</button>
                <button type="submit" className="px-4 py-2 text-sm bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors">{editingItem ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : items.length === 0 ? (
        <div className="text-center py-12 text-gray-500 border-2 border-dashed border-gray-200 rounded-xl">
          <p className="mb-2">No menu items yet</p>
          <p className="text-sm mb-4">Import the default menus (HOME, All Products, ABOUT US, Contact) or create your own.</p>
          <button onClick={() => seedMutation.mutate()} disabled={seedMutation.isPending} className="px-4 py-2 bg-primary text-white rounded-lg text-sm hover:bg-primary-hover transition-colors disabled:opacity-50">
            {seedMutation.isPending ? 'Importing...' : 'Import Default Menus'}
          </button>
        </div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragMove={handleDragMove} onDragEnd={handleDragEnd}>
          <SortableContext items={items.map((item: MenuItem) => item.id)} strategy={verticalListSortingStrategy}>
            <div>
              {items.map((item: MenuItem) => (
                <SortableItem key={item.id} item={item} depth={0} onEdit={handleEdit} onDelete={handleDelete} onAddChild={handleAddChild} />
              ))}
            </div>
          </SortableContext>
          <DragOverlay>
            {activeItem ? (
              <div
                className="bg-white border border-primary/30 rounded-lg shadow-lg px-3 py-2.5 flex items-center gap-2"
                style={{ marginLeft: dragDelta.x > 20 ? 24 : 0, transition: 'margin-left 0.1s' }}
              >
                <GripVertical size={16} className="text-gray-400" />
                <span className="text-sm font-medium">{activeItem.name}</span>
                {dragDelta.x > 20 && (
                  <span className="text-[10px] text-primary font-medium ml-2">→ submenu</span>
                )}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      )}
      </div>

      <div className="w-64 flex-shrink-0">
        <div className="bg-white border border-gray-200 rounded-xl p-4 sticky top-6">
          <div className="flex items-center gap-2 mb-3">
            <Tags size={16} className="text-gray-500" />
            <h2 className="font-semibold text-sm">Categories</h2>
          </div>
          <div className="space-y-1 max-h-[60vh] overflow-y-auto">
            {categories?.map((cat: any) => {
              const alreadyInMenu = cat.href ? menuHrefs.has(cat.href) : menuHrefs.has(`/collection/${cat.slug}`);
              return (
                <div key={cat.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-50 group">
                  <span className="flex-1 text-sm text-gray-700 truncate">{cat.name}</span>
                  {alreadyInMenu ? (
                    <span className="text-[10px] text-gray-400 font-medium uppercase">added</span>
                  ) : (
                    <button
                      onClick={() => createMutation.mutate({ name: cat.name.toUpperCase(), href: `/collection/${cat.slug}`, parentId: null })}
                      className="p-0.5 text-gray-400 hover:text-green-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Add to menu"
                    >
                      <Plus size={14} />
                    </button>
                  )}
                </div>
              );
            })}
            {(!categories || categories.length === 0) && (
              <p className="text-xs text-gray-400 text-center py-4">No categories found</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
