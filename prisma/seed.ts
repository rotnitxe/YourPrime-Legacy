
import { PrismaClient, ExerciseCategory, MuscleGroup } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Seed...");

  // 1. Crear Usuario Admin
  const hashedPassword = await bcrypt.hash("password123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@yourprime.com" },
    update: {},
    create: {
      email: "admin@yourprime.com",
      name: "Admin User",
      password: hashedPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  });

  console.log("👤 Admin user created/found");

  // 2. Poblar Biblioteca de Ejercicios (Maestros)
  const exercises = [
    { name: "Squat (Barbell)", category: ExerciseCategory.STRENGTH, muscle: MuscleGroup.LEGS, equipment: "Barbell" },
    { name: "Bench Press (Barbell)", category: ExerciseCategory.STRENGTH, muscle: MuscleGroup.CHEST, equipment: "Barbell" },
    { name: "Deadlift (Conventional)", category: ExerciseCategory.STRENGTH, muscle: MuscleGroup.BACK, equipment: "Barbell" },
    { name: "Overhead Press", category: ExerciseCategory.STRENGTH, muscle: MuscleGroup.SHOULDERS, equipment: "Barbell" },
    { name: "Pull Up", category: ExerciseCategory.HYPERTROPHY, muscle: MuscleGroup.BACK, equipment: "Bodyweight" },
    { name: "Dumbbell Curl", category: ExerciseCategory.HYPERTROPHY, muscle: MuscleGroup.ARMS, equipment: "Dumbbell" },
    { name: "Leg Extension", category: ExerciseCategory.HYPERTROPHY, muscle: MuscleGroup.LEGS, equipment: "Machine" },
  ];

  for (const ex of exercises) {
    await prisma.exerciseDefinition.upsert({
        where: { id: `ex-${ex.name.replace(/\s/g, '').toLowerCase()}` }, // ID determinista para evitar duplicados en seed
        update: {},
        create: {
            id: `ex-${ex.name.replace(/\s/g, '').toLowerCase()}`,
            name: ex.name,
            primaryMuscle: ex.muscle,
            category: ex.category,
            equipment: ex.equipment,
            isSystem: true,
            description: `Standard ${ex.name} movement.`
        }
    });
  }
  
  console.log("📚 Exercise Library populated");

  // 3. Crear un Programa de Ejemplo para el Admin
  const program = await prisma.program.create({
      data: {
          name: "Powerbuilding 1.0",
          description: "Mix of strength and hypertrophy",
          userId: admin.id,
          macrocycles: {
              create: {
                  name: "Phase 1",
                  orderIndex: 0,
                  mesocycles: {
                      create: {
                          name: "Accumulation",
                          orderIndex: 0,
                          weeks: {
                              create: {
                                  name: "Week 1",
                                  orderIndex: 0,
                                  sessions: {
                                      create: {
                                          name: "Leg Day",
                                          orderIndex: 0,
                                          exercises: {
                                              create: [
                                                  {
                                                      orderIndex: 0,
                                                      exerciseDefId: "ex-squat(barbell)",
                                                      setsStructure: [{ sets: 3, reps: "5", rpe: 7 }]
                                                  },
                                                  {
                                                      orderIndex: 1,
                                                      exerciseDefId: "ex-legextension",
                                                      setsStructure: [{ sets: 4, reps: "12", rpe: 8 }]
                                                  }
                                              ]
                                          }
                                      }
                                  }
                              }
                          }
                      }
                  }
              }
          }
      }
  });

  console.log("🏋️‍♂️ Sample Program created");
}

main()
  .catch((e) => {
    console.error(e);
    (process as any).exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
