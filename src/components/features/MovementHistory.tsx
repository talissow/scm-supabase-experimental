'use client';

import { useEffect, useState } from 'react';
import { Movement, Product } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/common';

export function MovementHistory() {
  const [movements, setMovements] = useState<any[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const { data: movementData } = await supabase
        .from('movements')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      const { data: productData } = await supabase
        .from('products')
        .select('*');

      setMovements(movementData || []);
      setProducts(productData || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProductName = (productId: string) => {
    return products.find(p => p.id === productId)?.name || 'Produto Desconhecido';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'entrada': 'Entrada',
      'saida': 'Saída',
      'ajuste': 'Ajuste',
    };
    return labels[type] || type;
  };

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      'entrada': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'saida': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
      'ajuste': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
    };
    return colors[type] || '';
  };

  return (
    <Card header={<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Histórico de Movimentos</h2>}>
      {loading ? (
        <div className="py-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando histórico...</p>
        </div>
      ) : movements.length === 0 ? (
        <p className="text-gray-600 dark:text-gray-400 py-8 text-center">
          Nenhum movimento registrado
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 dark:border-slate-700">
              <tr>
                <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Produto</th>
                <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Tipo</th>
                <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Quantidade</th>
                <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Motivo</th>
                <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Data</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
              {movements.map((movement) => (
                <tr key={movement.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                  <td className="py-3 px-2 font-medium text-gray-900 dark:text-white">
                    {getProductName(movement.product_id)}
                  </td>
                  <td className="py-3 px-2">
                    <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${getTypeColor(movement.type)}`}>
                      {getTypeLabel(movement.type)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                    {movement.quantity} {products.find(p => p.id === movement.product_id)?.unit}
                  </td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">{movement.reason}</td>
                  <td className="py-3 px-2 text-gray-600 dark:text-gray-400">
                    {new Date(movement.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
