'use client';

import { MainLayout, ProtectedRoute, Breadcrumb } from '@/components/layouts';
import { Card } from '@/components/common';
import { MovementForm, MovementHistory } from '@/components/features';
import { PageTransition } from '@/components/animations';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function MovementsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('name');
    setProducts(data || []);
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <PageTransition>
          <Breadcrumb />
          <div className="p-6 sm:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Movimentos
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Registrar entrada/saída de produtos e ver histórico
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Form */}
              <div className="lg:col-span-1">
                <Card header={<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Selecionar Produto</h2>}>
                  <select
                    value={selectedProduct}
                    onChange={(e) => setSelectedProduct(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Escolha um produto...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (Qty: {p.quantity})
                      </option>
                    ))}
                  </select>
                </Card>

                {selectedProduct && (
                  <div className="mt-6">
                    <MovementForm
                      key={refreshKey}
                      productId={selectedProduct}
                      onSuccess={() => {
                        loadProducts();
                        setRefreshKey(k => k + 1);
                      }}
                    />
                  </div>
                )}
              </div>

              {/* History */}
              <div className="lg:col-span-2">
                <MovementHistory />
              </div>
            </div>
          </div>
        </PageTransition>
      </MainLayout>
    </ProtectedRoute>
  );
}
