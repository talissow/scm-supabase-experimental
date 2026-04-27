'use client';

import { MainLayout, ProtectedRoute, Breadcrumb } from '@/components/layouts';
import { Card, Button } from '@/components/common';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      <MainLayout>
        <Breadcrumb />
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Administração
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Configurações e gerenciamento do sistema
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card header={<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Usuários</h2>}>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Gerenciar usuários do sistema
              </p>
              <Button variant="secondary" size="sm">Gerenciar Usuários</Button>
            </Card>

            <Card header={<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tipos Customizados</h2>}>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Configurar tipos de produtos e movimentos
              </p>
              <Button variant="secondary" size="sm">Configurar</Button>
            </Card>

            <Card header={<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Auditoria</h2>}>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Ver log de ações do sistema
              </p>
              <Button variant="secondary" size="sm">Ver Auditoria</Button>
            </Card>

            <Card header={<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Backup</h2>}>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Backup e restore dos dados
              </p>
              <Button variant="secondary" size="sm">Fazer Backup</Button>
            </Card>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
