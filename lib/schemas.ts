
import { z } from "zod";

// Reutilizamos la lógica definida en el backend para consistencia total
export const WorkoutLogSchema = z.object({
  programId: z.string().min(1, "Selecciona un programa"),
  sessionId: z.string().min(1, "Selecciona una sesión"),
  date: z.string().or(z.date()), 
  duration: z.coerce.number().min(1, "La duración debe ser mayor a 0"),
  fatigueLevel: z.coerce.number().min(1).max(10),
  mentalClarity: z.coerce.number().min(1).max(10),
  notes: z.string().optional(),
  completedExercises: z.array(z.object({
    exerciseId: z.string().optional(),
    exerciseName: z.string().min(1, "Nombre requerido"),
    sets: z.array(z.object({
        weight: z.coerce.number(),
        reps: z.coerce.number(),
        rpe: z.coerce.number().optional(),
        rir: z.coerce.number().optional(),
    }))
  })).min(1, "Debes registrar al menos un ejercicio")
});

export type WorkoutLogFormValues = z.infer<typeof WorkoutLogSchema>;
