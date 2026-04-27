'use client';

import { useState } from 'react';
import { Button, Input, Card } from '@/components/common';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/context/AuthContext';

interface MovementFormProps {
  productId?: string;
  onSuccess?: () => void;
}

export function MovementForm({ productId, onSuccess }: MovementFormProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    type: 'entrada' as 'entrada' | 'saida' | 'ajuste',
    quantity: '',
    reason: '',
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!productId) {
        setError('Selecione um produto');
        return;
      }

      if (!formData.quantity || parseInt(formData.quantity) <= 0) {
        setError('Quantidade deve ser maior que 0');
        return;
      }

      // Insert movement
      const { error: movementError } = await supabase
        .from('movements')
        .insert({
          product_id: productId,
          type: formData.type,
          quantity: parseInt(formData.quantity),
          reason: formData.reason,
          notes: formData.notes,
        });

      if (movementError) throw movementError;

      // Update product quantity
      const { data: product } = await supabase
        .from('products')
        .select('quantity')
        .eq('id', productId)
        .single();

      if (product) {
        const quantityChange = formData.type === 'entrada'
          ? parseInt(formData.quantity)
          : -parseInt(formData.quantity);

        await supabase
          .from('products')
          .update({ quantity: product.quantity + quantityChange })
          .eq('id', productId);
      }

      // Reset form
      setFormData({
        type: 'entrada',
        quantity: '',
        reason: '',
        notes: '',
      });

      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar movimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card header={<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Novo Movimento</h2>}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tipo de Movimento
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="entrada">Entrada</option>
              <option value="saida">Saída</option>
              <option value="ajuste">Ajuste</option>
            </select>
          </div>

          <Input
            label="Quantidade"
            type="number"
            min="1"
            value={formData.quantity}
            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
            placeholder="0"
            required
          />
        </div>

        <Input
          label="Motivo"
          value={formData.reason}
          onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
          placeholder="Ex: Compra fornecedor, Devolução cliente..."
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Observações
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Adicione observações importantes..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            rows={3}
          />
        </div>

        <div className="flex gap-2">
          <Button
            type="submit"
            variant="primary"
            loading={loading}
            className="flex-1"
          >
            Registrar Movimento
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setFormData({
              type: 'entrada',
              quantity: '',
              reason: '',
              notes: '',
            })}
          >
            Limpar
          </Button>
        </div>
      </form>
    </Card>
  );
}
