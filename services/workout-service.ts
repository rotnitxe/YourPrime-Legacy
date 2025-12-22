
import { db } from "@/lib/db";
import { AppError } from "@/lib/api/errors";
import { queueJob } from "@/lib/queue";
import { CompletedExercise, CompletedSet, WorkoutLog } from "@/types";
import { Prisma } from "@prisma/client";

// Input Types (Validation Layer handled by Zod in Action, but types enforced here)
interface CreateWorkoutLogInput {
  userId: string;
  programId: string;
  sessionId: string;
  date: Date;
  durationSeconds: number;
  fatigueLevel: number;
  mentalClarity: number;
  notes?: string;
  completedExercises: {
    exerciseDefId?: string; // ID from our ExerciseDefinition table
    exerciseName: string; // Fallback name
    sets: {
        weight: number;
        reps: number;
        rpe?: number;
        rir?: number;
    }[];
  }[];
}

interface GetHistoryInput {
    userId: string;
    limit?: number;
    cursor?: string; // ID del último log para paginación eficiente
}

export class WorkoutService {
    
    /**
     * Procesa y guarda un log de entrenamiento.
     * Maneja transacciones, cálculo de volumen y triggers asíncronos.
     */
    async logSession(input: CreateWorkoutLogInput) {
        // 1. Validaciones de Negocio
        const program = await db.program.findUnique({
            where: { id: input.programId },
            select: { name: true } // Solo necesitamos el nombre para snapshot
        });
        
        // Permitimos logs huérfanos (programId='custom') o validamos existencia
        const programName = program?.name || "Entrenamiento Personalizado";

        // 2. Transacción de Base de Datos
        const result = await db.$transaction(async (tx) => {
            // A. Crear el Log Principal
            const workoutLog = await tx.workoutLog.create({
                data: {
                    userId: input.userId,
                    programId: input.programId,
                    sessionId: input.sessionId, // Si es 'custom', asegurar que el esquema lo permita o manejarlo
                    sessionName: "Sesión Completada", // Deberíamos buscar el nombre real de la sesión si existe
                    date: input.date,
                    durationSeconds: input.durationSeconds,
                    fatigueLevel: input.fatigueLevel,
                    mentalClarity: input.mentalClarity,
                    notes: input.notes
                }
            });

            // B. Crear Ejercicios y Series
            // Nota: Hacemos esto en bucle o createMany anidado. Prisma soporta createMany anidado limitado.
            // Para integridad total y relaciones complejas, iteramos.
            
            for (const [index, exercise] of input.completedExercises.entries()) {
                const completedEx = await tx.completedExercise.create({
                    data: {
                        workoutLogId: workoutLog.id,
                        exerciseDefId: exercise.exerciseDefId, // Puede ser null si es custom
                        exerciseName: exercise.exerciseName, // Snapshot del nombre
                        orderIndex: index,
                    }
                });

                if (exercise.sets.length > 0) {
                    await tx.completedSet.createMany({
                        data: exercise.sets.map((set, setIndex) => ({
                            completedExerciseId: completedEx.id,
                            orderIndex: setIndex,
                            weight: set.weight,
                            reps: set.reps,
                            rpe: set.rpe,
                            rir: set.rir
                        }))
                    });
                }
            }

            // C. Lógica de Negocio: Racha (Streak)
            // Verificar si entrenó ayer para mantener racha, etc. (Simplificado)
            
            return workoutLog;
        });

        // 3. Tareas en Segundo Plano (Fuera de la transacción para no bloquear)
        // Enviar a la cola para análisis de IA (Coach Suggestions)
        await queueJob('ANALYZE_WORKOUT', { workoutLogId: result.id, userId: input.userId });

        return result;
    }

    /**
     * Obtiene el historial con paginación basada en cursor (Cursor-based Pagination).
     * Mucho más rápido que offset para grandes volúmenes de datos.
     */
    async getHistory({ userId, limit = 10, cursor }: GetHistoryInput) {
        const logs = await db.workoutLog.findMany({
            where: { 
                userId,
                deletedAt: null 
            },
            take: limit + 1, // Pedimos uno extra para saber si hay siguiente página
            cursor: cursor ? { id: cursor } : undefined,
            orderBy: { date: 'desc' },
            include: {
                completedExercises: {
                    include: {
                        sets: true
                    }
                }
            }
        });

        let nextCursor: string | undefined = undefined;
        if (logs.length > limit) {
            const nextItem = logs.pop(); // Removemos el extra
            nextCursor = nextItem?.id;
        }

        return {
            items: logs,
            nextCursor
        };
    }
}

export const workoutService = new WorkoutService();
