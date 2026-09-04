'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import toast from 'react-hot-toast';
import { Loader2, LogIn, Eye, EyeOff } from 'lucide-react';

import { useAuthStore } from '../../stores/auth-store';
import AuthWrapper from '../components/auth-wrapper';

const loginSchema = z.object({
  username: z.string().min(1, 'El nombre de usuario es requerido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

type LoginFormData = z.infer<typeof loginSchema>;

function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.username, data.password);
      toast.success('Inicio de sesión exitoso');
      router.push('/');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al iniciar sesión',
      );
    }
  };

  return (
    <div className="text-center">
      <div className="mx-auto h-16 w-16 rounded-full bg-primary-600 flex items-center justify-center">
        <LogIn className="h-8 w-8 text-white" />
      </div>

      <h2 className="mt-6 text-3xl font-bold tracking-tight text-gray-900">
        Censo de Motos
      </h2>
      <p className="mt-2 text-sm text-gray-600">
        Inicia sesión para acceder al sistema
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-6">
        <div className="space-y-4 rounded-md shadow-sm">
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 text-left"
            >
              Usuario
            </label>
            <input
              {...register('username')}
              id="username"
              type="text"
              autoComplete="username"
              className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:text-sm"
              placeholder="Ingresa tu usuario"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600 text-left">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 text-left"
            >
              Contraseña
            </label>
            <div className="relative mt-1">
              <input
                {...register('password')}
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                className="block w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 text-gray-900 placeholder-gray-500 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 sm:text-sm"
                placeholder="Ingresa tu contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 text-left">
                {errors.password.message}
              </p>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group relative flex w-full justify-center rounded-lg bg-primary-600 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              <LogIn className="mr-2 h-5 w-5" />
              Iniciar Sesión
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function LoginWrapper() {
  return (
    <AuthWrapper>
      <LoginPage />
    </AuthWrapper>
  );
}
