'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card } from '@/components/common';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function DashboardCharts() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      setLoading(true);

      // Get movements for last 7 days
      const { data: movements } = await supabase
        .from('movements')
        .select('*')
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at');

      // Group by date
      const groupedData = movements?.reduce((acc: any, mov: any) => {
        const date = new Date(mov.created_at).toLocaleDateString('pt-BR', { 
          month: '2-digit', 
          day: '2-digit' 
        });
        const existing = acc.find((d: any) => d.date === date);

        if (existing) {
          if (mov.type === 'entrada') existing.entrada += mov.quantity;
          else existing.saida += mov.quantity;
        } else {
          acc.push({
            date,
            entrada: mov.type === 'entrada' ? mov.quantity : 0,
            saida: mov.type === 'saida' ? mov.quantity : 0,
          });
        }
        return acc;
      }, []);

      setChartData(groupedData || []);
    } catch (error) {
      console.error('Error loading chart data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
        <p className="text-gray-600 dark:text-gray-400 mt-2">Carregando gráficos...</p>
      </div>
    );
  }

  if (!chartData || chartData.length === 0) {
    return (
      <Card header={<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Movimentos (últimos 7 dias)</h2>}>
        <p className="text-gray-600 dark:text-gray-400 py-8 text-center">
          Nenhum movimento nos últimos 7 dias
        </p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Line Chart */}
      <Card header={<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Movimentos (Linha)</h2>}>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }} />
            <Legend />
            <Line
              type="monotone"
              dataKey="entrada"
              stroke="#10b981"
              strokeWidth={2}
              name="Entrada"
              dot={{ r: 4 }}
            />
            <Line
              type="monotone"
              dataKey="saida"
              stroke="#ef4444"
              strokeWidth={2}
              name="Saída"
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Bar Chart */}
      <Card header={<h2 className="text-lg font-semibold text-gray-900 dark:text-white">Movimentos (Colunas)</h2>}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="date" stroke="#9ca3af" />
            <YAxis stroke="#9ca3af" />
            <Tooltip contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }} />
            <Legend />
            <Bar dataKey="entrada" fill="#10b981" name="Entrada" />
            <Bar dataKey="saida" fill="#ef4444" name="Saída" />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
