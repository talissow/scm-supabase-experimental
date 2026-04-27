'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/context/AuthContext';
import { useTheme } from '@/lib/context/ThemeContext';
import { Button, Input, Card } from '@/components/common';

export default function LoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { toggleTheme, theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-slate-950 dark:to-slate-900 transition-colors">
      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-lg bg-white dark:bg-slate-800 shadow-lg hover:shadow-xl transition-shadow"
        title={`Mudar para ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? '🌙' : '☀️'}
      </button>

      {/* Login Card */}
      <Card className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            SCM
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Sistema de Controle de Materiais
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
            required
          />

          <Input
            label="Senha"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            className="w-full"
          >
            Entrar
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-slate-700 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>Email demo: <code className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">admin@scm.local</code></p>
          <p className="mt-1">Senha demo: <code className="bg-gray-100 dark:bg-slate-700 px-2 py-1 rounded">password</code></p>
        </div>
      </Card>
    </div>
  );
}
