
import React from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { WorkoutForm } from '../components/WorkoutForm';
import { logWorkoutAction } from '@/actions/workout'; // Importamos la Server Action del Módulo 3
import { WorkoutLogFormValues } from '@/lib/schemas';
import { useAppContext } from '@/contexts/AppContext'; // Para los toasts globales

export const CreateWorkoutContainer: React.FC = () => {
  const { addToast } = useAppContext();
  const queryClient = useQueryClient();
  
  // Mock data for programs (would normally come from a useQuery hook)
  const programs = [{ id: "p1", name: "Hipertrofia A" }, { id: "p2", name: "Fuerza B" }];

  const mutation = useMutation({
    mutationFn: async (data: WorkoutLogFormValues) => {
        // Llamada a la Server Action
        const result = await logWorkoutAction(data);
        
        if (result.success) {
            return result.data;
        }

        throw new Error(result.error.message || "Error al guardar");
    },
    // --- OPTIMISTIC UI PATTERN ---
    onMutate: async (newWorkout) => {
      // 1. Cancelar refetches salientes
      await queryClient.cancelQueries({ queryKey: ['workout-history'] });

      // 2. Guardar snapshot del estado anterior
      const previousHistory = queryClient.getQueryData(['workout-history']);

      // 3. Actualizar optimísticamente la UI
      queryClient.setQueryData(['workout-history'], (old: any[] = []) => [
        { ...newWorkout, id: 'temp-id', date: new Date().toISOString(), status: 'pending' }, 
        ...old
      ]);

      return { previousHistory };
    },
    onError: (err, newWorkout, context) => {
      // 4. Rollback si falla
      if (context?.previousHistory) {
        queryClient.setQueryData(['workout-history'], context.previousHistory);
      }
      addToast(err.message, 'danger');
    },
    onSettled: () => {
      // 5. Revalidar para asegurar consistencia
      queryClient.invalidateQueries({ queryKey: ['workout-history'] });
    },
    onSuccess: () => {
        addToast("Entrenamiento registrado correctamente", "success");
    }
  });

  return (
    <div className="max-w-2xl mx-auto py-6">
      <h1 className="text-3xl font-display font-bold text-white mb-6">Registrar Sesión</h1>
      <WorkoutForm 
        onSubmit={(data) => mutation.mutate(data)} 
        isSubmitting={mutation.isPending}
        programs={programs}
      />
    </div>
  );
};
