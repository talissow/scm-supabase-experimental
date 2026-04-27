'use client';

import { MainLayout, ProtectedRoute, Breadcrumb } from '@/components/layouts';
import { Button, Card } from '@/components/common';
import { ProductTable, ProductModal } from '@/components/features';
import { PageTransition } from '@/components/animations';
import { useState } from 'react';

export default function ProductsPage() {
  const [refreshKey, setRefreshKey] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <ProtectedRoute>
      <MainLayout>
        <PageTransition>
          <Breadcrumb />
          <div className="p-6 sm:p-8">
            <div className="mb-8 flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Produtos
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Gerenciar produtos do estoque
                </p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setRefreshKey(k => k + 1)}>
                  Atualizar
                </Button>
                <Button variant="primary" onClick={() => setIsModalOpen(true)}>
                  Novo Produto
                </Button>
              </div>
            </div>

            <ProductTable 
              key={refreshKey}
              onEdit={(product) => console.log('Edit:', product)}
              onDelete={(productId) => console.log('Delete:', productId)}
            />

            <Card className="mt-6 p-4">
              <div className="text-sm text-gray-600 dark:text-gray-400">
                <p className="font-medium mb-2">Dicas:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Use a busca para encontrar produtos rapidamente</li>
                  <li>A quantidade mínima previne falta de estoque</li>
                  <li>Registre movimentos em "Movimentos" para atualizar quantidades</li>
                </ul>
              </div>
            </Card>

            <ProductModal
              isOpen={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              onSuccess={() => {
                setRefreshKey(k => k + 1);
                setIsModalOpen(false);
              }}
            />
          </div>
        </PageTransition>
      </MainLayout>
    </ProtectedRoute>
  );
}
