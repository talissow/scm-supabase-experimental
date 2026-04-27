'use client';

import { useState } from 'react';
import { Product } from '@/types/database';
import { Button, Input, Card, Modal } from '@/components/common';
import { supabase } from '@/lib/supabase';

interface ProductModalProps {
  isOpen: boolean;
  product?: Product;
  onClose: () => void;
  onSuccess: () => void;
}

export function ProductModal({ isOpen, product, onClose, onSuccess }: ProductModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    quantity: product?.quantity || 0,
    min_quantity: product?.min_quantity || 0,
    type: product?.type || '',
    unit: product?.unit || '',
    location: product?.location || '',
    supplier: product?.supplier || '',
    cost: product?.cost || 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (product?.id) {
        // Update
        const { error: err } = await supabase
          .from('products')
          .update(formData)
          .eq('id', product.id);

        if (err) throw err;
      } else {
        // Create
        const { error: err } = await supabase
          .from('products')
          .insert(formData);

        if (err) throw err;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={product ? 'Editar Produto' : 'Novo Produto'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={loading}>
            {product ? 'Atualizar' : 'Criar'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Nome"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Tipo"
            value={formData.type}
            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          />
        </div>

        <Input
          label="Descrição"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        />

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Quantidade"
            type="number"
            min="0"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
          />
          <Input
            label="Quantidade Mínima"
            type="number"
            min="0"
            value={formData.min_quantity}
            onChange={(e) => setFormData({ ...formData, min_quantity: parseInt(e.target.value) })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Unidade"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="Un, Kg, L..."
          />
          <Input
            label="Custo"
            type="number"
            min="0"
            step="0.01"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: parseFloat(e.target.value) })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Localização"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          />
          <Input
            label="Fornecedor"
            value={formData.supplier}
            onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
          />
        </div>
      </form>
    </Modal>
  );
}
