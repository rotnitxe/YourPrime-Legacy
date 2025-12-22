
"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { workoutService } from "@/services/workout-service";
import { handleActionError, ActionResponse, AppError } from "@/lib/api/errors";
import { WorkoutLogSchema } from "@/types"; // Asumiendo que existe, o definimos uno específico de entrada abajo

// Schema específico para la entrada de la acción (input validation)
const CreateLogSchema = z.object({
  programId: z.string(),
  sessionId: z.string(),
  date: z.string().or(z.date()), // Aceptamos string ISO desde el cliente
  duration: z.number().min(1, "La duración debe ser mayor a 0"),
  fatigueLevel: z.number().min(1).max(10),
  mentalClarity: z.number().min(1).max(10),
  notes: z.string().optional(),
  completedExercises: z.array(z.object({
    exerciseId: z.string().optional(), // ID de la definición (puede venir como exerciseDbId)
    exerciseName: z.string(),
    sets: z.array(z.object({
        weight: z.number(),
        reps: z.number(),
        rpe: z.number().optional(),
        rir: z.number().optional(),
    }))
  })).min(1, "Debes registrar al menos un ejercicio")
});

export async function logWorkoutAction(data: z.infer<typeof CreateLogSchema>): Promise<ActionResponse<any>> {
    try {
        const session = await auth();
        
        if (!session || !session.user || !session.user.id) {
            throw new AppError("No autorizado", "UNAUTHORIZED", 401);
        }

        // 1. Validación de Entrada
        const validatedData = CreateLogSchema.safeParse(data);
        if (!validatedData.success) {
            return {
                success: false,
                error: {
                    code: 'VALIDATION_ERROR',
                    message: 'Datos de entrada inválidos',
                    // En una impl real, mapearíamos validatedData.error.flatten()
                }
            };
        }

        const input = validatedData.data;

        // 2. Llamada al Servicio
        const result = await workoutService.logSession({
            userId: session.user.id,
            programId: input.programId,
            sessionId: input.sessionId,
            date: new Date(input.date),
            durationSeconds: input.duration, // Mapeo de campos si difieren
            fatigueLevel: input.fatigueLevel,
            mentalClarity: input.mentalClarity,
            notes: input.notes,
            completedExercises: input.completedExercises.map(ex => ({
                exerciseDefId: ex.exerciseId,
                exerciseName: ex.exerciseName,
                sets: ex.sets
            }))
        });

        // 3. Revalidación de Caché (Next.js specific)
        // revalidatePath('/dashboard'); 
        // revalidateTag('workout-history');

        return { success: true, data: result };

    } catch (error) {
        return handleActionError(error);
    }
}

export async function getWorkoutHistoryAction(cursor?: string): Promise<ActionResponse<any>> {
    try {
        const session = await auth();
        if (!session?.user?.id) throw new AppError("No autorizado", "UNAUTHORIZED", 401);

        const result = await workoutService.getHistory({
            userId: session.user.id,
            limit: 10,
            cursor
        });

        return { success: true, data: result };
    } catch (error) {
        return handleActionError(error);
    }
}
