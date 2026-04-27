'use client';

import React from 'react';
import { MainLayout, ProtectedRoute, Breadcrumb } from '@/components/layouts';
import { Card } from '@/components/common';
import { useAuth } from '@/lib/context/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Produtos', value: '0', color: 'blue', icon: '📦' },
    { label: 'Movimentos Hoje', value: '0', color: 'green', icon: '📤' },
    { label: 'Baixo Estoque', value: '0', color: 'yellow', icon: '⚠️' },
    { label: 'Valor Total', value: 'R$ 0', color: 'purple', icon: '💰' },
  ];

  return (
    <ProtectedRoute>
      <MainLayout>
        {/* Breadcrumb */}
        <Breadcrumb />

        {/* Content */}
        <div className="p-6 sm:p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Bem-vindo de volta, {user?.full_name || user?.email}
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {stats.map((stat) => (
              <Card key={stat.label}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm font-medium">
                      {stat.label}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                      {stat.value}
                    </p>
                  </div>
                  <div className="text-3xl">{stat.icon}</div>
                </div>
              </Card>
            ))}
          </div>

          {/* Main Content Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Larger */}
            <div className="lg:col-span-2">
              <Card header={<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Movimentos Recentes</h2>}>
                <div className="space-y-3">
                  <p className="text-gray-600 dark:text-gray-400 py-8 text-center">
                    Nenhum movimento registrado
                  </p>
                </div>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <Card header={<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Atividades</h2>}>
                <div className="space-y-3">
                  <p className="text-gray-600 dark:text-gray-400 py-4 text-center">
                    Sem atividades
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
