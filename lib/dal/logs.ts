
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// --- DTO Types ---
export type WorkoutLogWithDetails = Prisma.WorkoutLogGetPayload<{
    include: {
        completedExercises: {
            include: {
                sets: true,
                exerciseDef: true
            }
        }
    }
}>;

/**
 * Guarda un log de entrenamiento completo.
 * Usa una transacción para asegurar que se guarden ejercicios y series o nada.
 */
export const createWorkoutLog = async (userId: string, data: any) => {
    return await db.$transaction(async (tx) => {
        const log = await tx.workoutLog.create({
            data: {
                userId,
                date: data.date ? new Date(data.date) : new Date(),
                durationSeconds: data.duration,
                sessionName: data.sessionName,
                sessionTemplateId: data.sessionTemplateId, // Optional link
                fatigueLevel: data.fatigue,
                mentalClarity: data.clarity,
                notes: data.notes,
            }
        });

        // Crear ejercicios completados
        if (data.exercises && Array.isArray(data.exercises)) {
            for (const [index, ex] of data.exercises.entries()) {
                const completedEx = await tx.completedExercise.create({
                    data: {
                        workoutLogId: log.id,
                        exerciseDefId: ex.exerciseDefId,
                        orderIndex: index,
                        notes: ex.notes
                    }
                });

                // Crear series para este ejercicio
                if (ex.sets && Array.isArray(ex.sets)) {
                    await tx.completedSet.createMany({
                        data: ex.sets.map((set: any, setIdx: number) => ({
                            completedExerciseId: completedEx.id,
                            orderIndex: setIdx,
                            weight: parseFloat(set.weight),
                            reps: parseInt(set.reps),
                            rpe: set.rpe ? parseFloat(set.rpe) : null,
                            rir: set.rir ? parseInt(set.rir) : null,
                            performanceData: set.performanceData || {}
                        }))
                    });
                }
            }
        }

        return log;
    });
};

/**
 * Obtiene el historial de un ejercicio específico para análisis de progreso.
 */
export const getExerciseHistory = async (userId: string, exerciseDefId: string) => {
    return await db.completedExercise.findMany({
        where: {
            exerciseDefId,
            workoutLog: {
                userId,
                deletedAt: null
            }
        },
        include: {
            sets: true,
            workoutLog: {
                select: {
                    date: true
                }
            }
        },
        orderBy: {
            workoutLog: {
                date: 'desc'
            }
        }
    });
};
