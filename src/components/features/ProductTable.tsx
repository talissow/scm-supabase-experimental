'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types/database';
import { supabase } from '@/lib/supabase';
import { Button, Card, Input } from '@/components/common';

interface ProductTableProps {
  onEdit?: (product: Product) => void;
  onDelete?: (productId: string) => void;
}

export function ProductTable({ onEdit, onDelete }: ProductTableProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'quantity'>('name');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order(sortBy);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card header={<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Lista de Produtos</h2>}>
      <div className="space-y-4">
        {/* Search and Filter */}
        <div className="flex gap-4 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome ou descrição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'name' | 'quantity')}
            className="px-4 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            <option value="name">Por Nome</option>
            <option value="quantity">Por Quantidade</option>
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="py-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando produtos...</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <p className="text-gray-600 dark:text-gray-400 py-8 text-center">
            {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto registrado'}
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-gray-200 dark:border-slate-700">
                <tr>
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Nome</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Quantidade</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Mínimo</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Localização</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Custo</th>
                  <th className="text-left py-2 px-2 font-medium text-gray-700 dark:text-gray-300">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                {filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                    <td className="py-3 px-2">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{product.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{product.description}</p>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        product.quantity < product.min_quantity
                          ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
                          : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                      }`}>
                        {product.quantity}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-gray-600 dark:text-gray-400">{product.min_quantity}</td>
                    <td className="py-3 px-2 text-gray-600 dark:text-gray-400">{product.location}</td>
                    <td className="py-3 px-2 text-gray-600 dark:text-gray-400">R$ {product.cost?.toFixed(2)}</td>
                    <td className="py-3 px-2">
                      <div className="flex gap-2">
                        <button
                          onClick={() => onEdit?.(product)}
                          className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 text-xs font-medium"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => onDelete?.(product.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 text-xs font-medium"
                        >
                          Deletar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Footer Stats */}
        {filteredProducts.length > 0 && (
          <div className="border-t border-gray-200 dark:border-slate-700 pt-4 mt-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total de produtos: <span className="font-semibold text-gray-900 dark:text-white">{filteredProducts.length}</span>
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Baixo estoque: <span className="font-semibold text-red-600 dark:text-red-400">
                {filteredProducts.filter(p => p.quantity < p.min_quantity).length}
              </span>
            </p>
          </div>
        )}
      </div>
    </Card>
  );
}
