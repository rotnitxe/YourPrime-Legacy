
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { WorkoutLogSchema, WorkoutLogFormValues } from '@/lib/schemas';
import Button from '@/components/ui/Button';
import { PlusIcon, TrashIcon, SaveIcon } from '@/components/icons';

interface WorkoutFormProps {
  defaultValues?: Partial<WorkoutLogFormValues>;
  onSubmit: (data: WorkoutLogFormValues) => void;
  isSubmitting: boolean;
  programs: { id: string; name: string }[]; // Props tipadas, nada de any
}

export const WorkoutForm: React.FC<WorkoutFormProps> = ({ 
  defaultValues, 
  onSubmit, 
  isSubmitting,
  programs
}) => {
  const { 
    register, 
    control, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<WorkoutLogFormValues>({
    resolver: zodResolver(WorkoutLogSchema),
    defaultValues: defaultValues || {
      fatigueLevel: 5,
      mentalClarity: 5,
      duration: 60,
      completedExercises: []
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "completedExercises"
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 animate-fade-in">
      {/* Sección General */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Programa</label>
            <select {...register("programId")} className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white">
                <option value="">Seleccionar...</option>
                {programs.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            {errors.programId && <p className="text-red-400 text-xs mt-1">{errors.programId.message}</p>}
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Duración (min)</label>
            <input type="number" {...register("duration")} className="w-full bg-slate-900 border border-slate-700 rounded-md p-2 text-white" />
            {errors.duration && <p className="text-red-400 text-xs mt-1">{errors.duration.message}</p>}
        </div>
      </div>

      {/* Ejercicios Dinámicos */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold text-white">Ejercicios Realizados</h3>
            <Button type="button" onClick={() => append({ exerciseName: "", sets: [] })} variant="secondary" className="!py-1 !px-3 !text-xs">
                <PlusIcon size={14} /> Añadir Ejercicio
            </Button>
        </div>
        
        {fields.map((field, index) => (
            <div key={field.id} className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 relative group">
                <div className="flex gap-4 mb-3">
                    <div className="flex-1">
                        <input 
                            {...register(`completedExercises.${index}.exerciseName`)} 
                            placeholder="Nombre del ejercicio"
                            className="w-full bg-transparent border-b border-slate-600 focus:border-primary-color outline-none text-white font-semibold"
                        />
                        {errors.completedExercises?.[index]?.exerciseName && (
                            <p className="text-red-400 text-xs">{errors.completedExercises[index]?.exerciseName?.message}</p>
                        )}
                    </div>
                    <button type="button" onClick={() => remove(index)} className="text-slate-500 hover:text-red-400">
                        <TrashIcon size={18} />
                    </button>
                </div>
                
                {/* Aquí iría el FieldArray anidado para Sets, simplificado para el ejemplo */}
                <p className="text-xs text-slate-500 italic">Sets configuration placeholder...</p>
            </div>
        ))}
        {errors.completedExercises && <p className="text-red-400 text-sm text-center">{errors.completedExercises.message}</p>}
      </div>

      {/* Métricas Subjetivas */}
      <div className="grid grid-cols-2 gap-4 p-4 bg-slate-900/30 rounded-xl">
        <div>
            <label className="text-xs text-slate-400">Fatiga (1-10)</label>
            <input type="range" min="1" max="10" {...register("fatigueLevel")} className="w-full accent-primary-color" />
        </div>
        <div>
            <label className="text-xs text-slate-400">Claridad Mental (1-10)</label>
            <input type="range" min="1" max="10" {...register("mentalClarity")} className="w-full accent-primary-color" />
        </div>
      </div>

      <Button type="submit" isLoading={isSubmitting} className="w-full !py-3 !text-lg shadow-lg shadow-primary-color/20">
        <SaveIcon className="mr-2" /> Guardar Entrenamiento
      </Button>
    </form>
  );
};
