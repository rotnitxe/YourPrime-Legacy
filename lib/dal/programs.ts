
import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

// --- DTOs Types (Inferred) ---
export type ProgramWithStructure = Prisma.ProgramGetPayload<{
  include: {
    macrocycles: {
      include: {
        mesocycles: {
          include: {
            weeks: {
              include: {
                sessions: {
                  include: {
                    exercises: { include: { exerciseDef: true } }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
}>;

// --- REPOSITORIES ---

/**
 * Obtiene todos los programas activos (no eliminados) de un usuario.
 */
export const getUserPrograms = async (userId: string): Promise<ProgramWithStructure[]> => {
  return await db.program.findMany({
    where: {
      userId,
      deletedAt: null,
    },
    include: {
      macrocycles: {
        where: { deletedAt: null },
        orderBy: { orderIndex: 'asc' },
        include: {
          mesocycles: {
            where: { deletedAt: null },
            orderBy: { orderIndex: 'asc' },
            include: {
              weeks: {
                where: { deletedAt: null },
                orderBy: { orderIndex: 'asc' },
                include: {
                  sessions: {
                    where: { deletedAt: null },
                    orderBy: { orderIndex: 'asc' },
                    include: {
                      exercises: {
                         orderBy: { orderIndex: 'asc' },
                         include: { exerciseDef: true }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    orderBy: { updatedAt: 'desc' }
  });
};

/**
 * Crea un programa completo con su estructura inicial en una transacción atómica.
 */
export const createFullProgram = async (userId: string, data: any) => {
  // Nota: 'data' debería estar tipado con Zod en la capa de acción/controller
  
  return await db.$transaction(async (tx) => {
    // 1. Create Program
    const program = await tx.program.create({
      data: {
        name: data.name,
        description: data.description,
        userId: userId,
        settings: data.settings || {},
      }
    });

    // 2. Create Initial Macrocycle
    const macro = await tx.macrocycle.create({
      data: {
        name: "Macrociclo 1",
        orderIndex: 0,
        programId: program.id
      }
    });

    // 3. Create Initial Mesocycle
    const meso = await tx.mesocycle.create({
        data: {
            name: "Mesociclo 1 (Acumulación)",
            goal: "Acumulación",
            orderIndex: 0,
            macrocycleId: macro.id
        }
    });
    
    // 4. Create 4 Weeks
    for(let i = 0; i < 4; i++) {
        await tx.programWeek.create({
            data: {
                name: `Semana ${i + 1}`,
                orderIndex: i,
                mesocycleId: meso.id
            }
        });
    }

    return program;
  });
};

/**
 * Soft delete de un programa.
 */
export const archiveProgram = async (programId: string, userId: string) => {
    return await db.program.update({
        where: { id: programId, userId },
        data: { deletedAt: new Date() }
    });
};
