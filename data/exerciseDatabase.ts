// data/exerciseDatabase.ts
import { ExerciseMuscleInfo } from '../types';

export const DETAILED_EXERCISE_LIST: ExerciseMuscleInfo[] = [
  // --- PECTORAL ---
  {
    id: 'db_bench_press_tng', name: 'Press de Banca (Táctil / Touch and Go)', alias: 'bench press, tng bench', description: 'Ejercicio fundamental para el desarrollo del pectoral, hombros y tríceps, realizado de forma continua sin pausa en el pecho.',
    involvedMuscles: [
      { muscle: 'Pectoral Medio', activation: 1.0, role: 'primary' },
      { muscle: 'Pectoral Superior', activation: 0.3, role: 'secondary' },
      { muscle: 'Deltoides Anterior', activation: 0.6, role: 'secondary' },
      { muscle: 'Cabeza Lateral (Tríceps)', activation: 0.5, role: 'secondary' },
      { muscle: 'Cabeza Medial (Tríceps)', activation: 0.5, role: 'secondary' },
    ],
    subMuscleGroup: 'Pectoral Medio', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 4, technicalDifficulty: 6, transferability: 8,
    injuryRisk: { level: 7, details: 'Hombros (impingement), codos, muñecas. Mala técnica puede ser muy lesiva.' },
    recommendedMobility: ['Shoulder Pass-Throughs', 'Cat-Cow Stretch', 'Rotaciones Torácicas'],
    isHallOfFame: true, sportsRelevance: ['Powerlifting', 'Fútbol Americano', 'Strongman', 'Halterofilia', 'Culturismo']
  },
  {
    id: 'db_bench_press_paused', name: 'Press de Banca (Pausado)', alias: 'paused bench press', description: 'Variante del press de banca con una pausa en el pecho. Elimina el reflejo de estiramiento, aumentando la dificultad y la fuerza desde el punto más bajo.',
    involvedMuscles: [
      { muscle: 'Pectoral Medio', activation: 1.0, role: 'primary' },
      { muscle: 'Deltoides Anterior', activation: 0.7, role: 'secondary' },
      { muscle: 'Cabeza Lateral (Tríceps)', activation: 0.6, role: 'secondary' },
      { muscle: 'Cabeza Medial (Tríceps)', activation: 0.6, role: 'secondary' },
    ],
    subMuscleGroup: 'Pectoral Medio', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Empuje', bodyPart: 'upper', chain: 'anterior', variantOf: 'db_bench_press_tng',
    setupTime: 4, technicalDifficulty: 7, transferability: 8,
    injuryRisk: { level: 6, details: 'Más seguro que T&G si se controla. Ayuda a mejorar la técnica y la estabilidad.' },
    sportsRelevance: ['Powerlifting']
  },
  {
    id: 'db_incline_bench_press', name: 'Press de Banca Inclinado', description: 'Variante que enfatiza la porción superior (clavicular) del pectoral.',
    involvedMuscles: [ { muscle: 'Pectoral Superior', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Anterior', activation: 0.8, role: 'secondary' }, { muscle: 'Pectoral Medio', activation: 0.4, role: 'secondary' }, { muscle: 'Tríceps', activation: 0.5, role: 'secondary' }, ],
    subMuscleGroup: 'Pectoral Superior', category: 'Hipertrofia', type: 'Básico', equipment: 'Barra', force: 'Empuje', variantOf: 'db_bench_press_tng', bodyPart: 'upper', chain: 'anterior',
    setupTime: 5, technicalDifficulty: 7, transferability: 7,
    injuryRisk: { level: 8, details: 'Mayor estrés en la articulación del hombro si no se tiene buena movilidad.' },
    recommendedMobility: ['Shoulder Pass-Throughs', 'Wall Slides'], sportsRelevance: ['Culturismo', 'Fútbol Americano']
  },
  {
    id: 'db_decline_bench_press', name: 'Press de Banca Declinado', description: 'Variante que pone más énfasis en la porción inferior del pectoral.',
    involvedMuscles: [ { muscle: 'Pectoral Inferior', activation: 1.0, role: 'primary' }, { muscle: 'Pectoral Medio', activation: 0.5, role: 'secondary' }, { muscle: 'Tríceps', activation: 0.5, role: 'secondary' }, ],
    subMuscleGroup: 'Pectoral Inferior', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Barra', force: 'Empuje', variantOf: 'db_bench_press_tng', bodyPart: 'upper', chain: 'anterior',
    setupTime: 6, technicalDifficulty: 5, transferability: 5,
    injuryRisk: { level: 5, details: 'Menor riesgo para los hombros, pero requiere un banco específico y seguro.' },
  },
  {
    id: 'db_dumbbell_bench_press', name: 'Press de Banca con Mancuernas', description: 'Permite un mayor rango de movimiento y estabilización que la versión con barra.',
    involvedMuscles: [ { muscle: 'Pectoral Medio', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Anterior', activation: 0.6, role: 'secondary' }, { muscle: 'Tríceps', activation: 0.5, role: 'secondary' }, { muscle: 'Serrato Anterior', activation: 0.3, role: 'stabilizer'} ],
    subMuscleGroup: 'Pectoral Medio', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Mancuerna', force: 'Empuje', variantOf: 'db_bench_press_tng', bodyPart: 'upper', chain: 'anterior',
    setupTime: 3, technicalDifficulty: 7, transferability: 8,
    injuryRisk: { level: 6, details: 'Requiere más estabilidad, riesgo en hombros si se usa demasiado peso sin control.' },
    recommendedMobility: ['Arm Circles (Forward)', 'Rotación Externa con Banda'], sportsRelevance: ['Culturismo', 'Acondicionamiento General']
  },
  {
    id: 'db_incline_dumbbell_press', name: 'Press Inclinado con Mancuernas', description: 'Enfatiza el pectoral superior con mayor libertad de movimiento para los hombros.',
    involvedMuscles: [ { muscle: 'Pectoral Superior', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Anterior', activation: 0.8, role: 'secondary' }, { muscle: 'Pectoral Medio', activation: 0.4, role: 'secondary' }, { muscle: 'Tríceps', activation: 0.5, role: 'secondary' }, ],
    subMuscleGroup: 'Pectoral Superior', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Mancuerna', force: 'Empuje', variantOf: 'db_incline_bench_press', bodyPart: 'upper', chain: 'anterior',
    setupTime: 4, technicalDifficulty: 8, transferability: 7,
    injuryRisk: { level: 7, details: 'Similar al press inclinado con barra, requiere mucho control.' },
    recommendedMobility: ['Shoulder Pass-Throughs', 'Wall Slides']
  },
  {
    id: 'db_machine_chest_press', name: 'Press de Pecho en Máquina', description: 'Ofrece una gran estabilidad, permitiendo enfocar el esfuerzo puramente en el pectoral.',
    involvedMuscles: [ { muscle: 'Pectoral Medio', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Anterior', activation: 0.4, role: 'secondary' }, { muscle: 'Tríceps', activation: 0.5, role: 'secondary' }, ],
    subMuscleGroup: 'Pectoral Medio', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Máquina', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 2, technicalDifficulty: 2, transferability: 4,
    injuryRisk: { level: 2, details: 'Muy seguro. El principal riesgo es usar demasiado peso y forzar la articulación.' },
  },
  {
    id: 'db_incline_machine_press', name: 'Press Inclinado en Máquina', description: 'Aísla el pectoral superior con la estabilidad y seguridad de una máquina.',
    involvedMuscles: [ { muscle: 'Pectoral Superior', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Anterior', activation: 0.6, role: 'secondary' }, { muscle: 'Tríceps', activation: 0.4, role: 'secondary' }, ],
    subMuscleGroup: 'Pectoral Superior', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Máquina', force: 'Empuje', variantOf: 'db_machine_chest_press', bodyPart: 'upper', chain: 'anterior',
    setupTime: 2, technicalDifficulty: 3, transferability: 4,
    injuryRisk: { level: 3, details: 'Seguro, pero un mal ajuste de la máquina puede estresar el hombro.' },
  },
  {
    id: 'db_push_up', name: 'Flexiones de Brazos', description: 'Ejercicio de peso corporal fundamental para el empuje y la fuerza del torso.',
    involvedMuscles: [ { muscle: 'Pectoral Medio', activation: 1.0, role: 'primary' }, { muscle: 'Tríceps', activation: 0.5, role: 'secondary' }, { muscle: 'Deltoides Anterior', activation: 0.4, role: 'secondary' }, { muscle: 'Serrato Anterior', activation: 0.5, role: 'stabilizer' }, { muscle: 'Recto Abdominal', activation: 0.3, role: 'stabilizer' }, ],
    subMuscleGroup: 'Pectoral Medio', category: 'Resistencia', type: 'Básico', equipment: 'Peso Corporal', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 1, technicalDifficulty: 4, transferability: 9,
    injuryRisk: { level: 3, details: 'Bajo riesgo. Codos y muñecas si la forma es muy deficiente.' },
    isHallOfFame: true, sportsRelevance: ['Calistenia', 'Gimnasia', 'Artes Marciales', 'Militares']
  },
  {
    id: 'db_decline_push_up', name: 'Flexiones Declinadas', description: 'Variante de flexión con los pies elevados para aumentar la carga en el pectoral superior y los hombros.',
    involvedMuscles: [ { muscle: 'Pectoral Superior', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Anterior', activation: 0.7, role: 'secondary' }, { muscle: 'Tríceps', activation: 0.6, role: 'secondary' }, ],
    subMuscleGroup: 'Pectoral Superior', category: 'Resistencia', type: 'Accesorio', equipment: 'Peso Corporal', force: 'Empuje', variantOf: 'db_push_up', bodyPart: 'upper', chain: 'anterior',
    setupTime: 2, technicalDifficulty: 5, transferability: 8,
    injuryRisk: { level: 4, details: 'Mayor estrés en hombros que la flexión normal.' },
  },
  {
    id: 'db_dips', name: 'Fondos en Paralelas', description: 'Ejercicio compuesto que trabaja intensamente el pectoral inferior, hombros y tríceps.',
    involvedMuscles: [ { muscle: 'Pectoral Inferior', activation: 1.0, role: 'primary' }, { muscle: 'Tríceps', activation: 0.8, role: 'secondary' }, { muscle: 'Deltoides Anterior', activation: 0.6, role: 'secondary' }, ],
    subMuscleGroup: 'Pectoral Inferior', category: 'Fuerza', type: 'Básico', equipment: 'Peso Corporal', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 1, technicalDifficulty: 8, transferability: 9,
    injuryRisk: { level: 8, details: 'Alto riesgo para la articulación del hombro si se baja demasiado o con mala forma.' },
    recommendedMobility: ['Shoulder Pass-Throughs', 'Rotación Externa con Banda'],
    isHallOfFame: true, sportsRelevance: ['Gimnasia', 'Calistenia', 'Street Workout']
  },
  {
    id: 'db_dumbbell_flyes', name: 'Aperturas con Mancuernas', description: 'Ejercicio de aislamiento para estirar y trabajar el pectoral a lo ancho.',
    involvedMuscles: [ { muscle: 'Pectoral Medio', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Anterior', activation: 0.3, role: 'secondary' }, ],
    subMuscleGroup: 'Pectoral Medio', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 2, technicalDifficulty: 6, transferability: 2,
    injuryRisk: { level: 6, details: 'Riesgo de lesión en el hombro si se usa demasiado peso y se hiperextiende.' },
  },
  {
    id: 'db_incline_dumbbell_flyes', name: 'Aperturas Inclinadas con Mancuernas', description: 'Aislamiento enfocado en la parte superior del pectoral, permitiendo un gran estiramiento.',
    involvedMuscles: [ { muscle: 'Pectoral Superior', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Anterior', activation: 0.4, role: 'secondary' }, ],
    subMuscleGroup: 'Pectoral Superior', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Empuje', variantOf: 'db_dumbbell_flyes', bodyPart: 'upper', chain: 'anterior',
    setupTime: 3, technicalDifficulty: 7, transferability: 2,
    injuryRisk: { level: 7, details: 'Similar a las aperturas planas, pero con más estrés potencial en el hombro.' },
  },
  {
    id: 'db_cable_crossover', name: 'Cruces de Poleas (Altura Media)', description: 'Permite una tensión constante en el pectoral, ideal para el bombeo y la conexión mente-músculo.',
    involvedMuscles: [ { muscle: 'Pectoral Medio', activation: 1.0, role: 'primary' }, { muscle: 'Pectoral Inferior', activation: 0.4, role: 'secondary' } ],
    subMuscleGroup: 'Pectoral Medio', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 3, technicalDifficulty: 4, transferability: 2,
    injuryRisk: { level: 3, details: 'Bajo riesgo, pero una mala técnica puede afectar los hombros.' },
  },
  {
    id: 'db_low_to_high_cable_fly', name: 'Aperturas en Polea (Baja a Alta)', description: 'Cruces de poleas desde una posición baja para enfocar el trabajo en la parte superior del pectoral.',
    involvedMuscles: [ { muscle: 'Pectoral Superior', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Anterior', activation: 0.4, role: 'secondary' }, ],
    subMuscleGroup: 'Pectoral Superior', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Empuje', variantOf: 'db_cable_crossover', bodyPart: 'upper', chain: 'anterior',
    setupTime: 3, technicalDifficulty: 5, transferability: 2,
    injuryRisk: { level: 4, details: 'Relativamente seguro. Evitar encoger los hombros.' },
  },
  {
    id: 'db_high_to_low_cable_fly', name: 'Aperturas en Polea (Alta a Baja)', description: 'Cruces de poleas desde una posición alta para enfocar el trabajo en la parte inferior del pectoral.',
    involvedMuscles: [ { muscle: 'Pectoral Inferior', activation: 1.0, role: 'primary' }, { muscle: 'Pectoral Medio', activation: 0.5, role: 'secondary' }, ],
    subMuscleGroup: 'Pectoral Inferior', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Empuje', variantOf: 'db_cable_crossover', bodyPart: 'upper', chain: 'anterior',
    setupTime: 3, technicalDifficulty: 5, transferability: 2, injuryRisk: { level: 4, details: 'Relativamente seguro. Controlar el movimiento para no involucrar demasiado los hombros.' },
  },
  {
    id: 'db_pec_deck', name: 'Pec Deck', description: 'Máquina de aislamiento para el pectoral que simula el movimiento de las aperturas.',
    involvedMuscles: [ { muscle: 'Pectoral Medio', activation: 1.0, role: 'primary' }, ],
    subMuscleGroup: 'Pectoral Medio', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Máquina', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 2, technicalDifficulty: 2, transferability: 1,
    injuryRisk: { level: 2, details: 'Muy seguro. El principal riesgo es la hiperextensión del hombro al inicio.' },
  },
  {
    id: 'db_dumbbell_pullover', name: 'Pullover con Mancuerna', description: 'Ejercicio único que trabaja el pecho y la espalda, expandiendo la caja torácica.',
    involvedMuscles: [ { muscle: 'Dorsal Ancho', activation: 0.8, role: 'primary' }, { muscle: 'Pectoral', activation: 0.7, role: 'secondary' }, { muscle: 'Tríceps', activation: 0.4, role: 'stabilizer' }, { muscle: 'Serrato Anterior', activation: 0.6, role: 'stabilizer' }],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'anterior',
    setupTime: 2, technicalDifficulty: 8, transferability: 3,
    injuryRisk: { level: 7, details: 'Riesgo para los hombros si hay falta de movilidad o se usa demasiado peso.' },
    recommendedMobility: ['Shoulder Pass-Throughs'], sportsRelevance: ['Culturismo (clásico)', 'Natación']
  },
  {
    id: 'db_floor_press', name: 'Press de Suelo', description: 'Variante del press de banca con rango de movimiento reducido. Excelente para la fuerza de bloqueo y para reducir el estrés en los hombros.',
    involvedMuscles: [ { muscle: 'Cabeza Lateral (Tríceps)', activation: 1.0, role: 'primary' }, { muscle: 'Cabeza Medial (Tríceps)', activation: 1.0, role: 'primary' }, { muscle: 'Pectoral Medio', activation: 0.8, role: 'secondary' }, { muscle: 'Deltoides Anterior', activation: 0.4, role: 'secondary' }, ],
    subMuscleGroup: 'Pectoral Medio', category: 'Fuerza', type: 'Accesorio', equipment: 'Barra', force: 'Empuje', variantOf: 'db_bench_press_tng', bodyPart: 'upper', chain: 'anterior',
    setupTime: 4, technicalDifficulty: 5, transferability: 6,
    injuryRisk: { level: 4, details: 'Generalmente más seguro para los hombros que el press de banca completo.' },
    sportsRelevance: ['Powerlifting', 'Artes Marciales Mixtas']
  },
  {
    id: 'db_squeeze_press', name: 'Squeeze Press (Press Svend)', description: 'Press con mancuernas manteniéndolas juntas para crear una tensión isométrica constante en el pectoral.',
    involvedMuscles: [ { muscle: 'Pectoral Medio', activation: 1.0, role: 'primary' }, { muscle: 'Pectoral Superior', activation: 0.5, role: 'secondary' }, { muscle: 'Deltoides Anterior', activation: 0.4, role: 'secondary' }, { muscle: 'Tríceps', activation: 0.4, role: 'secondary' }, ],
    subMuscleGroup: 'Pectoral Medio', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 2, technicalDifficulty: 3, transferability: 2,
    injuryRisk: { level: 2, details: 'Muy bajo riesgo. Se utilizan pesos ligeros.' },
  },
  {
    id: 'db_new_001', name: 'Guillotine Press', description: 'Variante del press de banca donde la barra baja hasta el cuello. Aumenta el estiramiento del pectoral superior pero conlleva un alto riesgo.',
    involvedMuscles: [
      { muscle: 'Pectoral Superior', activation: 1.0, role: 'primary' },
      { muscle: 'Deltoides Anterior', activation: 0.7, role: 'secondary' },
      { muscle: 'Pectoral Medio', activation: 0.5, role: 'secondary' },
    ],
    subMuscleGroup: 'Pectoral Superior', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Barra', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 4, technicalDifficulty: 9, transferability: 4,
    injuryRisk: { level: 10, details: 'Extremadamente peligroso para los hombros y el cuello. Usar pesos ligeros y con un spotter.' },
  },
  {
    id: 'db_new_002', name: 'Plate Press', description: 'Press realizado apretando dos discos juntos. Crea una fuerte contracción isométrica en el pectoral.',
    involvedMuscles: [
      { muscle: 'Pectoral Medio', activation: 1.0, role: 'primary' },
      { muscle: 'Deltoides Anterior', activation: 0.4, role: 'secondary' },
    ],
    subMuscleGroup: 'Pectoral Medio', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Otro', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 1, technicalDifficulty: 2, transferability: 1,
    injuryRisk: { level: 1, details: 'Muy bajo riesgo. Se enfoca en la contracción, no en el peso.' },
  },
  {
    id: 'db_new_003', name: 'Single-Arm Dumbbell Bench Press', description: 'Press de banca con una sola mancuerna, desafiando enormemente la estabilidad del core y los músculos estabilizadores del hombro.',
    involvedMuscles: [
      { muscle: 'Pectoral Medio', activation: 1.0, role: 'primary' },
      { muscle: 'Oblicuos', activation: 0.8, role: 'stabilizer' },
      { muscle: 'Deltoides Anterior', activation: 0.6, role: 'secondary' },
      { muscle: 'Tríceps', activation: 0.5, role: 'secondary' },
    ],
    subMuscleGroup: 'Pectoral Medio', category: 'Fuerza', type: 'Accesorio', equipment: 'Mancuerna', force: 'Empuje', bodyPart: 'full', chain: 'anterior',
    setupTime: 3, technicalDifficulty: 8, transferability: 8,
    injuryRisk: { level: 7, details: 'Requiere un core muy fuerte para evitar la rotación del torso. Riesgo de desequilibrio.' },
  },
  {
    id: 'db_new_004', name: 'Archer Push-up', description: 'Variante de flexión asimétrica donde un brazo se extiende hacia el lado, aumentando la carga sobre el brazo que empuja.',
    involvedMuscles: [
      { muscle: 'Pectoral Medio', activation: 1.0, role: 'primary' },
      { muscle: 'Tríceps', activation: 0.7, role: 'secondary' },
      { muscle: 'Deltoides Anterior', activation: 0.6, role: 'secondary' },
      { muscle: 'Oblicuos', activation: 0.5, role: 'stabilizer' },
    ],
    subMuscleGroup: 'Pectoral Medio', category: 'Fuerza', type: 'Básico', equipment: 'Peso Corporal', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 1, technicalDifficulty: 8, transferability: 8,
    injuryRisk: { level: 6, details: 'Puede estresar el codo y el hombro del brazo extendido si no se tiene suficiente fuerza.' },
  },
  {
    id: 'db_spoto_press', name: 'Spoto Press', description: 'Variante del press de banca donde la barra se pausa a una pulgada del pecho, eliminando el reflejo de estiramiento y construyendo fuerza en la parte inferior del movimiento.',
    involvedMuscles: [
        { muscle: 'Pectoral Medio', activation: 1.0, role: 'primary' },
        { muscle: 'Deltoides Anterior', activation: 0.7, role: 'secondary' },
        { muscle: 'Cabeza Lateral (Tríceps)', activation: 0.6, role: 'secondary' },
        { muscle: 'Cabeza Medial (Tríceps)', activation: 0.6, role: 'secondary' },
    ],
    subMuscleGroup: 'Pectoral Medio', category: 'Fuerza', type: 'Accesorio', equipment: 'Barra', force: 'Empuje', bodyPart: 'upper', chain: 'anterior', variantOf: 'db_bench_press_paused',
    setupTime: 4, technicalDifficulty: 8, transferability: 7, injuryRisk: { level: 6, details: 'Similar a la pausa, pero la falta de contacto con el pecho requiere más control.' },
  },
  {
    id: 'db_larsen_press', name: 'Larsen Press', description: 'Press de banca realizado con los pies levantados del suelo, eliminando completamente el leg drive para aislar el tren superior.',
    involvedMuscles: [
        { muscle: 'Pectoral Medio', activation: 1.0, role: 'primary' },
        { muscle: 'Deltoides Anterior', activation: 0.7, role: 'secondary' },
        { muscle: 'Tríceps', activation: 0.8, role: 'secondary' },
    ],
    subMuscleGroup: 'Pectoral Medio', category: 'Fuerza', type: 'Accesorio', equipment: 'Barra', force: 'Empuje', bodyPart: 'upper', chain: 'anterior', variantOf: 'db_bench_press_tng',
    setupTime: 4, technicalDifficulty: 7, transferability: 6, injuryRisk: { level: 6, details: 'Requiere más estabilidad del core. El peso utilizado debe ser menor.' },
  },
  
  // --- ESPALDA ---
  {
    id: 'db_pull_up', name: 'Dominadas Pronas', description: 'Ejercicio de peso corporal para desarrollar la amplitud y densidad de la espalda, y la fuerza de los bíceps.',
    involvedMuscles: [ { muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Bíceps', activation: 0.7, role: 'secondary' }, { muscle: 'Braquiorradial', activation: 0.6, role: 'secondary' }, { muscle: 'Recto Abdominal', activation: 0.3, role: 'stabilizer' }, ],
    subMuscleGroup: 'Dorsales', category: 'Fuerza', type: 'Básico', equipment: 'Peso Corporal', force: 'Tirón', bodyPart: 'upper', chain: 'posterior',
    setupTime: 1, technicalDifficulty: 8, transferability: 10,
    injuryRisk: { level: 5, details: 'Hombros y codos si se realizan con mala forma o demasiado kipping.' },
    recommendedMobility: ['Cat-Cow Stretch', 'Torso Twists'],
    isHallOfFame: true, sportsRelevance: ['Calistenia', 'Gimnasia', 'Escalada', 'Natación', 'Artes Marciales']
  },
  {
    id: 'db_chin_up', name: 'Dominadas Supinas (Chin-up)', description: 'Variante de dominada con agarre supino que incrementa la participación del bíceps.',
    involvedMuscles: [ { muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Cabeza Larga (Bíceps)', activation: 0.9, role: 'primary' }, { muscle: 'Cabeza Corta (Bíceps)', activation: 0.9, role: 'primary' }, ],
    subMuscleGroup: 'Dorsales', category: 'Fuerza', type: 'Básico', equipment: 'Peso Corporal', force: 'Tirón', variantOf: 'db_pull_up', bodyPart: 'upper', chain: 'posterior',
    setupTime: 1, technicalDifficulty: 7, transferability: 9,
    injuryRisk: { level: 4, details: 'Menos estresante para los hombros que las pronas, pero puede afectar codos y muñecas.' },
  },
  {
    id: 'db_barbell_row', name: 'Remo con Barra', description: 'Ejercicio básico para construir una espalda densa y fuerte.',
    involvedMuscles: [ { muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Romboides', activation: 0.8, role: 'secondary' }, { muscle: 'Trapecio Medio', activation: 0.8, role: 'secondary' }, { muscle: 'Bíceps', activation: 0.7, role: 'secondary' }, { muscle: 'Erectores Espinales', activation: 0.5, role: 'stabilizer' }, ],
    subMuscleGroup: 'Dorsales', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Tirón', bodyPart: 'upper', chain: 'posterior',
    setupTime: 3, technicalDifficulty: 9, transferability: 8,
    injuryRisk: { level: 8, details: 'Alto riesgo para la espalda baja si se redondea o se usa demasiado impulso.' },
    recommendedMobility: ['Hip Hinge Practice', 'Cat-Cow Stretch'],
    isHallOfFame: true, sportsRelevance: ['Powerlifting', 'Culturismo', 'Remo', 'Strongman']
  },
  {
    id: 'db_pendlay_row', name: 'Remo Pendlay', description: 'Variante estricta del remo con barra donde cada repetición empieza desde el suelo. Construye potencia.',
    involvedMuscles: [ { muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Romboides', activation: 0.9, role: 'primary' }, { muscle: 'Trapecio Medio', activation: 0.9, role: 'primary' }, { muscle: 'Erectores Espinales', activation: 0.6, role: 'stabilizer' }, { muscle: 'Bíceps', activation: 0.5, role: 'secondary' }, ],
    subMuscleGroup: 'Dorsales', category: 'Potencia', type: 'Básico', equipment: 'Barra', force: 'Tirón', variantOf: 'db_barbell_row', bodyPart: 'upper', chain: 'posterior',
    setupTime: 3, technicalDifficulty: 9, transferability: 9,
    injuryRisk: { level: 9, details: 'Técnicamente muy demandante. Requiere una espalda baja fuerte y móvil.' },
    recommendedMobility: ['Hip Hinge Practice', 'Rotaciones Torácicas'], sportsRelevance: ['Powerlifting', 'Halterofilia', 'Strongman']
  },
  {
    id: 'db_tbar_row', name: 'Remo en T', description: 'Una variante de remo que permite levantar cargas pesadas con un agarre neutro, enfocándose en la parte media de la espalda.',
    involvedMuscles: [ { muscle: 'Romboides', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Medio', activation: 1.0, role: 'primary' }, { muscle: 'Dorsal Ancho', activation: 0.7, role: 'secondary' }, { muscle: 'Bíceps', activation: 0.6, role: 'secondary' }, { muscle: 'Erectores Espinales', activation: 0.4, role: 'stabilizer' }, ],
    subMuscleGroup: 'Romboides', category: 'Fuerza', type: 'Accesorio', equipment: 'Máquina', force: 'Tirón', variantOf: 'db_barbell_row', bodyPart: 'upper', chain: 'posterior',
    setupTime: 3, technicalDifficulty: 5, transferability: 7,
    injuryRisk: { level: 4, details: 'Menor riesgo lumbar que el remo con barra libre. La versión con apoyo en el pecho es más segura.' },
  },
  {
    id: 'db_dumbbell_row', name: 'Remo con Mancuerna', description: 'Ejercicio unilateral que permite un gran estiramiento y contracción del dorsal.',
    involvedMuscles: [ { muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Romboides', activation: 0.6, role: 'secondary' }, { muscle: 'Bíceps', activation: 0.6, role: 'secondary' }, ],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'posterior',
    setupTime: 2, technicalDifficulty: 6, transferability: 8,
    injuryRisk: { level: 4, details: 'Riesgo bajo si se mantiene la espalda recta. Evitar la torsión excesiva.' },
  },
  {
    id: 'db_lat_pulldown', name: 'Jalón al Pecho', description: 'Alternativa a las dominadas para trabajar los dorsales, usando una polea alta.',
    involvedMuscles: [ { muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Bíceps', activation: 0.6, role: 'secondary' }, ],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Polea', force: 'Tirón', variantOf: 'db_pull_up', bodyPart: 'upper', chain: 'posterior',
    setupTime: 2, technicalDifficulty: 3, transferability: 6,
    injuryRisk: { level: 2, details: 'Muy seguro. Evitar balancearse y tirar con la espalda baja.' },
  },
  {
    id: 'db_straight_arm_pulldown', name: 'Pulldown con Brazos Rectos', description: 'Ejercicio de aislamiento para los dorsales que minimiza la participación de los bíceps.',
    involvedMuscles: [ { muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Cabeza Larga (Tríceps)', activation: 0.3, role: 'stabilizer' }, { muscle: 'Serrato Anterior', activation: 0.4, role: 'stabilizer' } ],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Tirón', bodyPart: 'upper', chain: 'posterior',
    setupTime: 2, technicalDifficulty: 6, transferability: 3,
    injuryRisk: { level: 3, details: 'Riesgo bajo. Es crucial mantener los brazos rectos y no usar impulso.' },
  },
  {
    id: 'db_seated_cable_row', name: 'Remo Sentado en Polea', description: 'Ejercicio de tirón horizontal para enfocar el trabajo en la parte media de la espalda.',
    involvedMuscles: [ { muscle: 'Romboides', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Medio', activation: 0.9, role: 'primary' }, { muscle: 'Dorsal Ancho', activation: 0.7, role: 'secondary' }, { muscle: 'Bíceps', activation: 0.6, role: 'secondary' }, ],
    subMuscleGroup: 'Romboides', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Polea', force: 'Tirón', variantOf: 'db_barbell_row', bodyPart: 'upper', chain: 'posterior',
    setupTime: 2, technicalDifficulty: 4, transferability: 6,
    injuryRisk: { level: 3, details: 'Seguro. El riesgo principal es redondear la espalda baja al inicio del movimiento.' },
  },
  {
    id: 'db_face_pulls', name: 'Face Pulls', description: 'Excelente para la salud del hombro y el desarrollo de la parte alta de la espalda y deltoides posterior.',
    involvedMuscles: [ { muscle: 'Deltoides Posterior', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Medio', activation: 0.7, role: 'secondary' }, { muscle: 'Romboides', activation: 0.6, role: 'secondary' }, ],
    subMuscleGroup: 'Deltoides Posterior', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Tirón', bodyPart: 'upper', chain: 'posterior',
    setupTime: 2, technicalDifficulty: 5, transferability: 5,
    injuryRisk: { level: 2, details: 'Muy seguro y beneficioso para la salud del hombro si se hace con buena técnica.' },
    sportsRelevance: ['Powerlifting', 'Halterofilia', 'Acondicionamiento General']
  },
  {
    id: 'db_deadlift', name: 'Peso Muerto Convencional', alias: 'conventional deadlift', description: 'Levantamiento que trabaja toda la cadena posterior, desde isquiotibiales hasta la espalda alta.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' }, { muscle: 'Erectores Espinales', activation: 1.0, role: 'primary' }, { muscle: 'Isquiosurales', activation: 0.8, role: 'secondary' }, { muscle: 'Dorsal Ancho', activation: 0.7, role: 'stabilizer' }, { muscle: 'Trapecio', activation: 0.7, role: 'stabilizer' } ],
    subMuscleGroup: 'Erectores Espinales', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Bisagra', bodyPart: 'full', chain: 'posterior',
    setupTime: 3, technicalDifficulty: 10, transferability: 10,
    injuryRisk: { level: 9, details: 'Espalda baja (hernias), isquiotibiales. Requiere una técnica perfecta.' },
    recommendedMobility: ['Hip Hinge Practice', 'Movilización de Tobillo en Pared', 'Sentadilla Profunda Sostenida'],
    isHallOfFame: true, sportsRelevance: ['Powerlifting', 'Strongman', 'Halterofilia', 'CrossFit']
  },
  {
    id: 'db_romanian_deadlift', name: 'Peso Muerto Rumano', alias: 'RDL', description: 'Variante de peso muerto con las rodillas ligeramente flexionadas para enfocar el trabajo en los isquiotibiales y glúteos.',
    involvedMuscles: [ { muscle: 'Isquiosurales', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.9, role: 'primary' }, { muscle: 'Erectores Espinales', activation: 0.7, role: 'stabilizer' } ],
    subMuscleGroup: 'Isquiosurales', category: 'Hipertrofia', type: 'Básico', equipment: 'Barra', force: 'Bisagra', variantOf: 'db_deadlift', bodyPart: 'lower', chain: 'posterior',
    setupTime: 3, technicalDifficulty: 8, transferability: 8,
    injuryRisk: { level: 7, details: 'Alto riesgo para la espalda baja si se redondea. Es crucial mantener la columna neutra.' },
  },
  {
    id: 'db_sumo_deadlift', name: 'Peso Muerto Sumo', description: 'Variante del peso muerto con un agarre más ancho y una posición más vertical, que enfatiza más los cuádriceps y glúteos.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' }, { muscle: 'Cuádriceps', activation: 0.9, role: 'secondary' }, { muscle: 'Aductores', activation: 0.8, role: 'secondary' }, { muscle: 'Isquiosurales', activation: 0.7, role: 'secondary' }, { muscle: 'Erectores Espinales', activation: 0.6, role: 'stabilizer' }, ],
    subMuscleGroup: 'Glúteos', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Bisagra', variantOf: 'db_deadlift', bodyPart: 'full', chain: 'posterior',
    setupTime: 3, technicalDifficulty: 10, transferability: 9,
    injuryRisk: { level: 8, details: 'Menor riesgo para la espalda baja que el convencional, pero mayor estrés en caderas y aductores.' },
    recommendedMobility: ['Hip Circles', 'Sentadilla Cosaca'], sportsRelevance: ['Powerlifting']
  },
  {
    id: 'db_hyperextensions', name: 'Hiperextensiones', description: 'Fortalece la espalda baja, glúteos e isquiotibiales.',
    involvedMuscles: [ { muscle: 'Erectores Espinales', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.7, role: 'secondary' }, { muscle: 'Isquiosurales', activation: 0.5, role: 'secondary' }, ],
    subMuscleGroup: 'Erectores Espinales', category: 'Resistencia', type: 'Accesorio', equipment: 'Máquina', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior',
    setupTime: 2, technicalDifficulty: 4, transferability: 6,
    injuryRisk: { level: 3, details: 'Riesgo bajo. Evitar hiperextender la columna excesivamente.' },
  },
  {
    id: 'db_rack_pull', name: 'Rack Pull', description: 'Una variante del peso muerto con rango de movimiento acortado para sobrecargar la espalda alta y los trapecios.',
    involvedMuscles: [ { muscle: 'Trapecio Superior', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Medio', activation: 1.0, role: 'primary' }, { muscle: 'Erectores Espinales', activation: 0.9, role: 'secondary' }, { muscle: 'Glúteos', activation: 0.5, role: 'secondary' }, ],
    subMuscleGroup: 'Trapecio', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Bisagra', variantOf: 'db_deadlift', bodyPart: 'upper', chain: 'posterior',
    setupTime: 5, technicalDifficulty: 7, transferability: 7,
    injuryRisk: { level: 7, details: 'Permite usar más peso, lo que aumenta el riesgo si la técnica falla. Riesgo para la espalda baja.' },
  },
  {
    id: 'db_shrugs', name: 'Encogimientos de Hombros', description: 'Aísla y desarrolla la parte superior de los trapecios.',
    involvedMuscles: [ { muscle: 'Trapecio Superior', activation: 1.0, role: 'primary' }, ],
    subMuscleGroup: 'Trapecio', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'posterior',
    setupTime: 2, technicalDifficulty: 2, transferability: 2,
    injuryRisk: { level: 2, details: 'Bajo riesgo. Evitar rotar los hombros.' },
  },
  {
    id: 'db_good_mornings', name: 'Buenos Días', description: 'Ejercicio de bisagra de cadera que fortalece toda la cadena posterior, especialmente los erectores espinales e isquiotibiales.',
    involvedMuscles: [ { muscle: 'Erectores Espinales', activation: 1.0, role: 'primary' }, { muscle: 'Isquiosurales', activation: 0.9, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.8, role: 'secondary' } ],
    subMuscleGroup: 'Erectores Espinales', category: 'Fuerza', type: 'Accesorio', equipment: 'Barra', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior',
    setupTime: 3, technicalDifficulty: 9, transferability: 7,
    injuryRisk: { level: 8, details: 'Alto riesgo para la espalda baja si se redondea. Se debe usar un peso ligero y una técnica perfecta.' }
  },
  {
    id: 'db_inverted_row', name: 'Remo Invertido', description: 'Ejercicio de peso corporal para la espalda, similar a un remo con barra pero usando el propio peso.',
    involvedMuscles: [ { muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Romboides', activation: 0.8, role: 'secondary' }, { muscle: 'Bíceps', activation: 0.7, role: 'secondary' } ],
    subMuscleGroup: 'Dorsales', category: 'Resistencia', type: 'Básico', equipment: 'Peso Corporal', force: 'Tirón', bodyPart: 'upper', chain: 'posterior',
    setupTime: 3, technicalDifficulty: 5, transferability: 7,
    injuryRisk: { level: 2, details: 'Muy seguro. La dificultad se ajusta cambiando la inclinación del cuerpo.' }
  },
  {
    id: 'db_seal_row', name: 'Remo Seal (Seal Row)', description: 'Remo con barra realizado tumbado boca abajo en un banco elevado. Aísla completamente la espalda al eliminar cualquier impulso de piernas o cadera.',
    involvedMuscles: [
        { muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' },
        { muscle: 'Romboides', activation: 0.9, role: 'primary' },
        { muscle: 'Trapecio Medio', activation: 0.9, role: 'primary' },
        { muscle: 'Deltoides Posterior', activation: 0.5, role: 'secondary' },
    ],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Básico', equipment: 'Barra', force: 'Tirón', bodyPart: 'upper', chain: 'posterior',
    setupTime: 6, technicalDifficulty: 6, transferability: 7, injuryRisk: { level: 3, details: 'Muy seguro para la espalda baja. El principal desafío es la configuración del banco.' },
  },
  {
    id: 'db_chest_supported_db_row', name: 'Remo con Mancuernas (Apoyo en Pecho)', description: 'Remo con mancuernas realizado con el pecho apoyado en un banco inclinado, aislando la espalda y reduciendo el estrés lumbar.',
    involvedMuscles: [
        { muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' },
        { muscle: 'Romboides', activation: 0.8, role: 'secondary' },
        { muscle: 'Trapecio Medio', activation: 0.8, role: 'secondary' },
    ],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'posterior',
    setupTime: 3, technicalDifficulty: 4, transferability: 6, injuryRisk: { level: 2, details: 'Muy seguro para la espalda baja.' },
  },
  {
    id: 'db_new_005', name: 'Meadows Row', description: 'Remo unilateral con un extremo de la barra anclado (landmine). Permite un gran estiramiento y un agarre único.',
    involvedMuscles: [
      { muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' },
      { muscle: 'Romboides', activation: 0.8, role: 'secondary' },
      { muscle: 'Deltoides Posterior', activation: 0.6, role: 'secondary' },
      { muscle: 'Antebrazo', activation: 0.7, role: 'stabilizer' },
    ],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Barra', force: 'Tirón', bodyPart: 'upper', chain: 'posterior',
    setupTime: 3, technicalDifficulty: 7, transferability: 7,
    injuryRisk: { level: 5, details: 'Requiere buena estabilidad del core para evitar la rotación. Menor riesgo lumbar que otros remos.' },
  },
  {
    id: 'db_new_006', name: 'Kroc Row', description: 'Remo con mancuerna de muy altas repeticiones y con algo de impulso controlado. Diseñado para construir agarre y masa en la espalda.',
    involvedMuscles: [
      { muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' },
      { muscle: 'Trapecio', activation: 0.8, role: 'secondary' },
      { muscle: 'Antebrazo', activation: 0.9, role: 'secondary' },
    ],
    subMuscleGroup: 'Dorsales', category: 'Resistencia', type: 'Accesorio', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'posterior',
    setupTime: 2, technicalDifficulty: 6, transferability: 7,
    injuryRisk: { level: 6, details: 'El uso de impulso aumenta el riesgo si no se controla adecuadamente. Riesgo de desgarro de bíceps con pesos extremos.' },
  },
  {
    id: 'db_new_007', name: 'Jefferson Curl', description: 'Estiramiento y fortalecimiento de la cadena posterior con un peso ligero, articulando la columna vértebra por vértebra.',
    involvedMuscles: [
      { muscle: 'Erectores Espinales', activation: 1.0, role: 'primary' },
      { muscle: 'Isquiosurales', activation: 0.8, role: 'secondary' },
    ],
    subMuscleGroup: 'Erectores Espinales', category: 'Movilidad', type: 'Aislamiento', equipment: 'Kettlebell', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior',
    setupTime: 1, technicalDifficulty: 8, transferability: 5,
    injuryRisk: { level: 7, details: 'Debe hacerse con un peso muy ligero y control extremo. No apto para personas con problemas de disco.' },
  },
  {
    id: 'db_new_008', name: 'Muscle-up (Barra)', description: 'Movimiento avanzado de calistenia que combina una dominada explosiva con un fondo en barra.',
    involvedMuscles: [
      { muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' },
      { muscle: 'Pectoral', activation: 0.8, role: 'secondary' },
      { muscle: 'Tríceps', activation: 0.8, role: 'secondary' },
      { muscle: 'Deltoides', activation: 0.7, role: 'secondary' },
    ],
    subMuscleGroup: 'Dorsales', category: 'Potencia', type: 'Básico', equipment: 'Peso Corporal', force: 'Tirón', bodyPart: 'upper', chain: 'full',
    setupTime: 1, technicalDifficulty: 10, transferability: 9,
    injuryRisk: { level: 9, details: 'Alto riesgo en hombros, codos y muñecas, especialmente con la falsa empuñadura (false grip).' },
    isHallOfFame: true, sportsRelevance: ['Calistenia', 'CrossFit', 'Gimnasia']
  },
  
  // --- HOMBROS ---
  {
    id: 'db_overhead_press', name: 'Press Militar (Barra)', alias: 'OHP, Military Press', description: 'Ejercicio fundamental para la fuerza y desarrollo de los hombros, especialmente el deltoides anterior.',
    involvedMuscles: [ { muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Lateral', activation: 0.6, role: 'secondary' }, { muscle: 'Tríceps', activation: 0.7, role: 'secondary' }, { muscle: 'Recto Abdominal', activation: 0.6, role: 'stabilizer' } ],
    subMuscleGroup: 'Deltoides Anterior', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 4, technicalDifficulty: 9, transferability: 9, injuryRisk: { level: 8, details: 'Alto riesgo para la espalda baja si se arquea en exceso. Requiere buena movilidad torácica.' }, isHallOfFame: true
  },
  {
    id: 'db_dumbbell_shoulder_press', name: 'Press de Hombros (Mancuernas)', description: 'Similar al press militar, pero con mancuernas, lo que permite un movimiento más natural para la articulación del hombro.',
    involvedMuscles: [ { muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Lateral', activation: 0.7, role: 'secondary' }, { muscle: 'Tríceps', activation: 0.6, role: 'secondary' } ],
    subMuscleGroup: 'Deltoides Anterior', category: 'Fuerza', type: 'Básico', equipment: 'Mancuerna', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 2, technicalDifficulty: 6, transferability: 8, injuryRisk: { level: 5, details: 'Menor riesgo que con barra al permitir un rango de movimiento más libre.' }
  },
  {
    id: 'db_arnold_press', name: 'Press Arnold', description: 'Variante de press de hombros que incorpora una rotación para trabajar las tres cabezas del deltoides.',
    involvedMuscles: [ { muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Lateral', activation: 0.8, role: 'secondary' }, { muscle: 'Tríceps', activation: 0.5, role: 'secondary' } ],
    subMuscleGroup: 'Deltoides Anterior', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Mancuerna', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 2, technicalDifficulty: 7, transferability: 6, injuryRisk: { level: 6, details: 'La rotación puede ser estresante para el manguito rotador si se hace con mucho peso o sin control.' }
  },
  {
    id: 'db_lateral_raise', name: 'Elevaciones Laterales (Mancuernas)', description: 'Ejercicio de aislamiento clave para desarrollar la cabeza lateral del hombro, dando amplitud.',
    involvedMuscles: [ { muscle: 'Deltoides Lateral', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Superior', activation: 0.3, role: 'secondary' } ],
    subMuscleGroup: 'Deltoides Lateral', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'full',
    setupTime: 1, technicalDifficulty: 6, transferability: 2, injuryRisk: { level: 4, details: 'Riesgo de pinzamiento (impingement) si se eleva el brazo por encima de los 90 grados o con rotación interna.' }
  },
  {
    id: 'db_cable_lateral_raise', name: 'Elevaciones Laterales (Polea)', description: 'Versión con polea que proporciona una tensión más constante en todo el rango de movimiento.',
    involvedMuscles: [ { muscle: 'Deltoides Lateral', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Deltoides Lateral', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Tirón', bodyPart: 'upper', chain: 'full',
    setupTime: 2, technicalDifficulty: 5, transferability: 2, injuryRisk: { level: 3, details: 'Más seguro que con mancuernas al tener una curva de resistencia más suave.' }
  },
  {
    id: 'db_rear_delt_fly', name: 'Pájaros (Rear Delt Fly)', description: 'Aísla el deltoides posterior, crucial para una buena postura y hombros redondeados.',
    involvedMuscles: [ { muscle: 'Deltoides Posterior', activation: 1.0, role: 'primary' }, { muscle: 'Romboides', activation: 0.4, role: 'secondary' } ],
    subMuscleGroup: 'Deltoides Posterior', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'posterior',
    setupTime: 2, technicalDifficulty: 6, transferability: 3, injuryRisk: { level: 4, details: 'Riesgo para la espalda baja si se pierde la postura. La versión en máquina (reverse pec-deck) es más segura.' }
  },
  {
    id: 'db_upright_row', name: 'Remo al Mentón', description: 'Ejercicio para hombros y trapecios. Debe realizarse con precaución para evitar lesiones en el hombro.',
    involvedMuscles: [ { muscle: 'Deltoides Lateral', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Superior', activation: 0.8, role: 'secondary' }, { muscle: 'Bíceps', activation: 0.4, role: 'secondary' } ],
    subMuscleGroup: 'Deltoides Lateral', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Barra', force: 'Tirón', bodyPart: 'upper', chain: 'full',
    setupTime: 2, technicalDifficulty: 8, transferability: 4, injuryRisk: { level: 9, details: 'Alto riesgo de pinzamiento de hombro (impingement). Se recomienda un agarre ancho y no subir por encima de la línea del pecho.' }
  },
  {
    id: 'db_seated_dumbbell_press', name: 'Press de Hombros Sentado (Mancuernas)', description: 'Variante del press de hombros con mancuernas realizada sentado, lo que proporciona mayor estabilidad y permite enfocar el esfuerzo en los deltoides.',
    involvedMuscles: [
        { muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' },
        { muscle: 'Deltoides Lateral', activation: 0.7, role: 'secondary' },
        { muscle: 'Tríceps', activation: 0.6, role: 'secondary' },
    ],
    subMuscleGroup: 'Deltoides Anterior', category: 'Hipertrofia', type: 'Básico', equipment: 'Mancuerna', force: 'Empuje', bodyPart: 'upper', chain: 'anterior', variantOf: 'db_dumbbell_shoulder_press',
    setupTime: 2, technicalDifficulty: 5, transferability: 7, injuryRisk: { level: 4, details: 'Más seguro para la espalda baja que la versión de pie.' },
  },
  {
    id: 'db_landmine_press', name: 'Press Landmine', description: 'Ejercicio de empuje unilateral utilizando una barra anclada. Es una alternativa más amigable para los hombros que el press militar.',
    involvedMuscles: [
        { muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' },
        { muscle: 'Pectoral Superior', activation: 0.7, role: 'secondary' },
        { muscle: 'Tríceps', activation: 0.5, role: 'secondary' },
        { muscle: 'Oblicuos', activation: 0.6, role: 'stabilizer' },
    ],
    subMuscleGroup: 'Deltoides Anterior', category: 'Fuerza', type: 'Accesorio', equipment: 'Barra', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 3, technicalDifficulty: 6, transferability: 8, injuryRisk: { level: 3, details: 'El arco de movimiento natural reduce el riesgo de pinzamiento de hombro.' },
  },
  {
    id: 'db_new_015', name: 'Z Press', description: 'Press militar realizado sentado en el suelo con las piernas extendidas. Elimina cualquier ayuda de las piernas y desafía la estabilidad del core.',
    involvedMuscles: [
      { muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' },
      { muscle: 'Deltoides Lateral', activation: 0.7, role: 'secondary' },
      { muscle: 'Tríceps', activation: 0.6, role: 'secondary' },
      { muscle: 'Erectores Espinales', activation: 0.8, role: 'stabilizer' },
    ],
    subMuscleGroup: 'Deltoides Anterior', category: 'Fuerza', type: 'Accesorio', equipment: 'Barra', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 3, technicalDifficulty: 8, transferability: 7,
    injuryRisk: { level: 6, details: 'Requiere buena movilidad de isquiotibiales y cadera para mantener una postura erguida.' },
  },
  {
    id: 'db_new_016', name: 'Bradford Press', description: 'Press por delante y por detrás del cuello sin bloquear los codos. Bueno para la movilidad y la hipertrofia del hombro.',
    involvedMuscles: [
      { muscle: 'Deltoides Anterior', activation: 0.8, role: 'primary' },
      { muscle: 'Deltoides Lateral', activation: 1.0, role: 'primary' },
      { muscle: 'Deltoides Posterior', activation: 0.6, role: 'secondary' },
    ],
    subMuscleGroup: 'Deltoides Lateral', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Barra', force: 'Empuje', bodyPart: 'upper', chain: 'full',
    setupTime: 2, technicalDifficulty: 7, transferability: 5,
    injuryRisk: { level: 7, details: 'La porción trasera puede ser peligrosa para personas con poca movilidad de hombro. Usar pesos ligeros.' },
  },
  {
    id: 'db_new_017', name: 'Lu Raises', description: 'Elevaciones laterales realizadas con un movimiento de rotación parcial, manteniendo la tensión constante.',
    involvedMuscles: [
      { muscle: 'Deltoides Lateral', activation: 1.0, role: 'primary' },
    ],
    subMuscleGroup: 'Deltoides Lateral', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'full',
    setupTime: 1, technicalDifficulty: 6, transferability: 2,
    injuryRisk: { level: 3, details: 'Bajo riesgo si se controla el peso y el movimiento.' },
  },
  {
    id: 'db_new_036', name: 'Band Pull-Apart', description: 'Ejercicio simple con banda para fortalecer la parte alta de la espalda, el deltoides posterior y mejorar la postura.',
    involvedMuscles: [
      { muscle: 'Deltoides Posterior', activation: 1.0, role: 'primary' },
      { muscle: 'Romboides', activation: 0.8, role: 'secondary' },
      { muscle: 'Trapecio Medio', activation: 0.8, role: 'secondary' },
    ],
    subMuscleGroup: 'Deltoides Posterior', category: 'Resistencia', type: 'Aislamiento', equipment: 'Banda', force: 'Tirón', bodyPart: 'upper', chain: 'posterior',
    setupTime: 1, technicalDifficulty: 2, transferability: 6,
    injuryRisk: { level: 1, details: 'Extremadamente seguro. Excelente para calentamientos y salud del hombro.' },
  },
  
  // --- BÍCEPS ---
  {
    id: 'db_barbell_curl', name: 'Curl con Barra Recta', description: 'Ejercicio básico para construir masa en los bíceps, con mayor énfasis en la cabeza corta.',
    involvedMuscles: [ { muscle: 'Cabeza Corta (Bíceps)', activation: 1.0, role: 'primary' }, { muscle: 'Cabeza Larga (Bíceps)', activation: 0.8, role: 'primary' }, { muscle: 'Braquial', activation: 0.5, role: 'secondary' } ],
    subMuscleGroup: 'Bíceps', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Tirón', bodyPart: 'upper', chain: 'anterior',
    setupTime: 2, technicalDifficulty: 4, transferability: 2, injuryRisk: { level: 5, details: 'Puede estresar las muñecas y los codos. Evitar el balanceo excesivo.' }
  },
  {
    id: 'db_dumbbell_curl', name: 'Curl con Mancuernas (Alterno)', description: 'Ejercicio fundamental para el bíceps que permite la supinación de la muñeca para una máxima contracción.',
    involvedMuscles: [ { muscle: 'Bíceps', activation: 1.0, role: 'primary' }, { muscle: 'Braquial', activation: 0.4, role: 'secondary' } ],
    subMuscleGroup: 'Bíceps', category: 'Hipertrofia', type: 'Básico', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'anterior',
    setupTime: 1, technicalDifficulty: 3, transferability: 3, injuryRisk: { level: 2, details: 'Bajo riesgo. Permite un movimiento más natural que la barra.' }
  },
  {
    id: 'db_incline_dumbbell_curl', name: 'Curl Inclinado con Mancuernas', description: 'Maximiza el estiramiento y la activación de la cabeza larga del bíceps.',
    involvedMuscles: [ { muscle: 'Cabeza Larga (Bíceps)', activation: 1.0, role: 'primary' }, { muscle: 'Cabeza Corta (Bíceps)', activation: 0.7, role: 'secondary' } ],
    subMuscleGroup: 'Bíceps', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'anterior',
    setupTime: 3, technicalDifficulty: 6, transferability: 2, injuryRisk: { level: 4, details: 'Riesgo de estrés en el hombro si el banco está demasiado inclinado.' }
  },
  {
    id: 'db_preacher_curl', name: 'Curl Predicador', description: 'Aísla el bíceps al inmovilizar el brazo, enfatizando la cabeza corta.',
    involvedMuscles: [ { muscle: 'Cabeza Corta (Bíceps)', activation: 1.0, role: 'primary' }, { muscle: 'Braquial', activation: 0.7, role: 'secondary' } ],
    subMuscleGroup: 'Bíceps', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Barra', force: 'Tirón', bodyPart: 'upper', chain: 'anterior',
    setupTime: 3, technicalDifficulty: 5, transferability: 1, injuryRisk: { level: 6, details: 'Riesgo de hiperextensión del codo en la parte inferior. Controlar el negativo.' }
  },
  {
    id: 'db_hammer_curl', name: 'Curl Martillo', description: 'Trabaja el músculo braquial y el braquiorradial, además del bíceps.',
    involvedMuscles: [ { muscle: 'Braquial', activation: 1.0, role: 'primary' }, { muscle: 'Braquiorradial', activation: 0.9, role: 'primary' }, { muscle: 'Bíceps', activation: 0.6, role: 'secondary' } ],
    subMuscleGroup: 'Bíceps', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'anterior',
    setupTime: 1, technicalDifficulty: 2, transferability: 3, injuryRisk: { level: 2, details: 'Muy seguro y beneficioso para la salud del codo.' }
  },
  {
    id: 'db_concentration_curl', name: 'Curl de Concentración', description: 'Ejercicio de aislamiento estricto que permite una contracción máxima del bíceps.',
    involvedMuscles: [ { muscle: 'Bíceps', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Bíceps', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'anterior',
    setupTime: 1, technicalDifficulty: 4, transferability: 1, injuryRisk: { level: 2, details: 'Bajo riesgo. Se enfoca en la contracción, no en el peso.' }
  },
  {
    id: 'db_new_018', name: 'Reverse Barbell Curl', description: 'Curl con barra usando un agarre prono (palmas hacia abajo). Fortalece los extensores de la muñeca y el braquiorradial.',
    involvedMuscles: [
      { muscle: 'Braquiorradial', activation: 1.0, role: 'primary' },
      { muscle: 'Braquial', activation: 0.8, role: 'secondary' },
      { muscle: 'Extensores de Antebrazo', activation: 0.9, role: 'secondary' },
    ],
    subMuscleGroup: 'Antebrazo', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Barra', force: 'Tirón', bodyPart: 'upper', chain: 'anterior',
    setupTime: 2, technicalDifficulty: 4, transferability: 3,
    injuryRisk: { level: 4, details: 'Puede estresar las muñecas. Es importante usar un peso moderado.' },
  },
  {
    id: 'db_new_019', name: 'Zottman Curl', description: 'Curl que combina una fase concéntrica supina (palmas arriba) con una fase excéntrica prona (palmas abajo).',
    involvedMuscles: [
      { muscle: 'Bíceps', activation: 1.0, role: 'primary' },
      { muscle: 'Braquiorradial', activation: 0.9, role: 'secondary' },
      { muscle: 'Extensores de Antebrazo', activation: 0.8, role: 'secondary' },
    ],
    subMuscleGroup: 'Bíceps', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'anterior',
    setupTime: 1, technicalDifficulty: 6, transferability: 3,
    injuryRisk: { level: 3, details: 'Bajo riesgo. Requiere concentración y control.' },
  },
  {
    id: 'db_spider_curls', name: 'Curl Araña (Spider Curl)', description: 'Curl de bíceps realizado con el pecho apoyado en un banco inclinado, con los brazos colgando perpendicular al suelo. Aísla el bíceps y enfatiza la contracción máxima.',
    involvedMuscles: [
        { muscle: 'Cabeza Corta (Bíceps)', activation: 1.0, role: 'primary' },
        { muscle: 'Braquial', activation: 0.6, role: 'secondary' },
    ],
    subMuscleGroup: 'Bíceps', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'anterior',
    setupTime: 3, technicalDifficulty: 6, transferability: 1, injuryRisk: { level: 2, details: 'Bajo riesgo. Se enfoca en la contracción y no permite usar mucho peso.' },
  },
  
  // --- TRÍCEPS ---
  {
    id: 'db_close_grip_bench_press', name: 'Press de Banca Agarre Cerrado', description: 'Ejercicio compuesto que pone un gran énfasis en las cabezas lateral y medial del tríceps.',
    involvedMuscles: [ { muscle: 'Cabeza Lateral (Tríceps)', activation: 1.0, role: 'primary' }, { muscle: 'Cabeza Medial (Tríceps)', activation: 0.9, role: 'primary' }, { muscle: 'Pectoral Medio', activation: 0.6, role: 'secondary' }, { muscle: 'Deltoides Anterior', activation: 0.5, role: 'secondary' } ],
    subMuscleGroup: 'Tríceps', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 4, technicalDifficulty: 7, transferability: 7, injuryRisk: { level: 6, details: 'Puede estresar las muñecas y hombros si el agarre es demasiado estrecho.' }
  },
  {
    id: 'db_skull_crusher', name: 'Press Francés (Skull Crusher)', description: 'Ejercicio de aislamiento que trabaja las tres cabezas del tríceps, con un buen estiramiento para la cabeza larga.',
    involvedMuscles: [ { muscle: 'Cabeza Larga (Tríceps)', activation: 1.0, role: 'primary' }, { muscle: 'Cabeza Lateral (Tríceps)', activation: 0.8, role: 'secondary' }, { muscle: 'Cabeza Medial (Tríceps)', activation: 0.8, role: 'secondary' } ],
    subMuscleGroup: 'Tríceps', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Barra', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 3, technicalDifficulty: 8, transferability: 2, injuryRisk: { level: 7, details: 'Alto estrés en los codos. Es crucial calentar bien y usar una técnica estricta.' }
  },
  {
    id: 'db_triceps_pushdown', name: 'Extensiones de Tríceps en Polea', description: 'Ejercicio de aislamiento que enfatiza la cabeza lateral y medial del tríceps.',
    involvedMuscles: [ { muscle: 'Cabeza Lateral (Tríceps)', activation: 1.0, role: 'primary' }, { muscle: 'Cabeza Medial (Tríceps)', activation: 0.8, role: 'secondary' } ],
    subMuscleGroup: 'Tríceps', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 2, technicalDifficulty: 3, transferability: 2, injuryRisk: { level: 2, details: 'Muy seguro. El principal error es usar el cuerpo para empujar el peso.' }
  },
  {
    id: 'db_overhead_triceps_extension', name: 'Extensiones de Tríceps sobre la Cabeza', description: 'Enfatiza la cabeza larga del tríceps debido a la posición del brazo en estiramiento.',
    involvedMuscles: [ { muscle: 'Cabeza Larga (Tríceps)', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Tríceps', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 2, technicalDifficulty: 5, transferability: 2, injuryRisk: { level: 4, details: 'Requiere buena movilidad de hombro. Puede estresar los codos.' }
  },
  {
    id: 'db_triceps_dips', name: 'Fondos para Tríceps (en banco)', description: 'Ejercicio de peso corporal que aísla el tríceps.',
    involvedMuscles: [ { muscle: 'Tríceps', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Anterior', activation: 0.4, role: 'secondary' } ],
    subMuscleGroup: 'Tríceps', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Peso Corporal', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 1, technicalDifficulty: 5, transferability: 4, injuryRisk: { level: 7, details: 'Alto riesgo de pinzamiento de hombro si se baja demasiado o se posicionan las manos muy atrás.' }
  },
  {
    id: 'db_triceps_kickback', name: 'Patada de Tríceps', description: 'Ejercicio de aislamiento para la contracción máxima del tríceps.',
    involvedMuscles: [ { muscle: 'Cabeza Lateral (Tríceps)', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Tríceps', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 1, technicalDifficulty: 4, transferability: 1, injuryRisk: { level: 2, details: 'Bajo riesgo. Se usan pesos ligeros para enfocarse en la contracción.' }
  },
  {
    id: 'db_jm_press', name: 'JM Press', description: 'Híbrido entre un press de banca de agarre cerrado y un press francés. Un movimiento avanzado para sobrecargar el tríceps.',
    involvedMuscles: [
        { muscle: 'Cabeza Medial (Tríceps)', activation: 1.0, role: 'primary' },
        { muscle: 'Cabeza Lateral (Tríceps)', activation: 1.0, role: 'primary' },
        { muscle: 'Deltoides Anterior', activation: 0.4, role: 'secondary' },
    ],
    subMuscleGroup: 'Tríceps', category: 'Fuerza', type: 'Accesorio', equipment: 'Barra', force: 'Empuje', bodyPart: 'upper', chain: 'anterior', variantOf: 'db_close_grip_bench_press',
    setupTime: 4, technicalDifficulty: 9, transferability: 5, injuryRisk: { level: 8, details: 'Técnicamente difícil. Alto estrés en los codos y muñecas.' },
  },
  {
    id: 'db_new_020', name: 'Tate Press', description: 'Ejercicio de tríceps que se realiza acostado, bajando las mancuernas hacia el pecho. Excelente para la cabeza medial.',
    involvedMuscles: [
      { muscle: 'Cabeza Medial (Tríceps)', activation: 1.0, role: 'primary' },
      { muscle: 'Cabeza Lateral (Tríceps)', activation: 0.7, role: 'secondary' },
    ],
    subMuscleGroup: 'Tríceps', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Empuje', bodyPart: 'upper', chain: 'anterior',
    setupTime: 2, technicalDifficulty: 7, transferability: 2,
    injuryRisk: { level: 6, details: 'Alto estrés en los codos. Requiere técnica cuidadosa y pesos moderados.' },
  },
  
  // --- CORE ---
  {
    id: 'db_plank', name: 'Plancha Abdominal', description: 'Ejercicio isométrico fundamental para la fuerza y estabilidad del core.',
    involvedMuscles: [ { muscle: 'Transverso Abdominal', activation: 1.0, role: 'primary' }, { muscle: 'Recto Abdominal', activation: 0.8, role: 'secondary' }, { muscle: 'Oblicuos', activation: 0.6, role: 'secondary' } ],
    subMuscleGroup: 'Abdomen', category: 'Resistencia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Anti-Rotación', bodyPart: 'full', chain: 'anterior',
    setupTime: 1, technicalDifficulty: 2, transferability: 9, injuryRisk: { level: 1, details: 'Muy seguro. Evitar que la cadera caiga.' }
  },
  {
    id: 'db_hanging_leg_raises', name: 'Elevaciones de Piernas Colgado', description: 'Trabaja intensamente la parte inferior del recto abdominal y los flexores de cadera.',
    involvedMuscles: [ { muscle: 'Recto Abdominal', activation: 1.0, role: 'primary' }, { muscle: 'Oblicuos', activation: 0.4, role: 'secondary' } ],
    subMuscleGroup: 'Abdomen', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Otro', bodyPart: 'lower', chain: 'anterior',
    setupTime: 1, technicalDifficulty: 7, transferability: 7, injuryRisk: { level: 5, details: 'Requiere fuerza de agarre y puede estresar la espalda baja si no se controla el balanceo.' }
  },
  {
    id: 'db_cable_crunch', name: 'Crunch en Polea', description: 'Permite sobrecargar el recto abdominal con peso, ideal para hipertrofia.',
    involvedMuscles: [ { muscle: 'Recto Abdominal', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Abdomen', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Otro', bodyPart: 'upper', chain: 'anterior',
    setupTime: 2, technicalDifficulty: 5, transferability: 3, injuryRisk: { level: 2, details: 'Seguro. Evitar tirar con los brazos y enfocar la contracción en el abdomen.' }
  },
  {
    id: 'db_ab_wheel', name: 'Rueda Abdominal', description: 'Ejercicio avanzado de anti-extensión que desafía todo el core.',
    involvedMuscles: [ { muscle: 'Recto Abdominal', activation: 1.0, role: 'primary' }, { muscle: 'Transverso Abdominal', activation: 0.9, role: 'primary' }, { muscle: 'Dorsal Ancho', activation: 0.5, role: 'stabilizer' } ],
    subMuscleGroup: 'Abdomen', category: 'Fuerza', type: 'Accesorio', equipment: 'Otro', force: 'Anti-Rotación', bodyPart: 'full', chain: 'anterior',
    setupTime: 1, technicalDifficulty: 9, transferability: 8, injuryRisk: { level: 7, details: 'Alto riesgo para la espalda baja si se hiperextiende. No para principiantes.' }
  },
  {
    id: 'db_pallof_press', name: 'Press Pallof', description: 'Ejercicio de anti-rotación que fortalece los oblicuos y la estabilidad del core.',
    involvedMuscles: [ { muscle: 'Oblicuos', activation: 1.0, role: 'primary' }, { muscle: 'Transverso Abdominal', activation: 0.8, role: 'primary' } ],
    subMuscleGroup: 'Oblicuos', category: 'Fuerza', type: 'Aislamiento', equipment: 'Polea', force: 'Anti-Rotación', bodyPart: 'full', chain: 'full',
    setupTime: 2, technicalDifficulty: 4, transferability: 9, injuryRisk: { level: 2, details: 'Muy seguro y efectivo para la salud del core y la espalda.' }
  },
  {
    id: 'db_russian_twist', name: 'Giros Rusos', description: 'Ejercicio para los oblicuos que implica rotación del tronco.',
    involvedMuscles: [ { muscle: 'Oblicuos', activation: 1.0, role: 'primary' }, { muscle: 'Recto Abdominal', activation: 0.5, role: 'secondary' } ],
    subMuscleGroup: 'Oblicuos', category: 'Resistencia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Rotación', bodyPart: 'full', chain: 'full',
    setupTime: 1, technicalDifficulty: 5, transferability: 6, injuryRisk: { level: 6, details: 'Puede ser lesivo para la columna lumbar si se realiza con mucho peso y mala técnica.' }
  },
  {
    id: 'db_side_plank', name: 'Plancha Lateral', description: 'Ejercicio isométrico para fortalecer los oblicuos y el glúteo medio.',
    involvedMuscles: [ { muscle: 'Oblicuos', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Medio', activation: 0.6, role: 'stabilizer' } ],
    subMuscleGroup: 'Oblicuos', category: 'Resistencia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Anti-Rotación', bodyPart: 'full', chain: 'full',
    setupTime: 1, technicalDifficulty: 4, transferability: 8, injuryRisk: { level: 2, details: 'Bajo riesgo. Importante mantener la cadera elevada.' }
  },
  {
    id: 'db_cable_wood_chops', name: 'Leñador en Polea (Wood Chop)', description: 'Ejercicio de rotación del core que imita el movimiento de cortar leña. Excelente para la fuerza rotacional y los oblicuos.',
    involvedMuscles: [
        { muscle: 'Oblicuos', activation: 1.0, role: 'primary' },
        { muscle: 'Transverso Abdominal', activation: 0.7, role: 'stabilizer' },
        { muscle: 'Serrato Anterior', activation: 0.5, role: 'secondary' },
    ],
    subMuscleGroup: 'Oblicuos', category: 'Fuerza', type: 'Aislamiento', equipment: 'Polea', force: 'Rotación', bodyPart: 'full', chain: 'full',
    setupTime: 2, technicalDifficulty: 6, transferability: 8, injuryRisk: { level: 4, details: 'Requiere control para evitar lesiones lumbares. Empezar con poco peso.' },
  },
  {
    id: 'db_new_021', name: 'Dragon Flag', description: 'Ejercicio de core avanzado popularizado por Bruce Lee, que implica bajar todo el cuerpo de forma controlada mientras se apoya en la parte superior de la espalda.',
    involvedMuscles: [
      { muscle: 'Recto Abdominal', activation: 1.0, role: 'primary' },
      { muscle: 'Transverso Abdominal', activation: 0.9, role: 'stabilizer' },
      { muscle: 'Dorsal Ancho', activation: 0.6, role: 'stabilizer' },
    ],
    subMuscleGroup: 'Abdomen', category: 'Fuerza', type: 'Básico', equipment: 'Peso Corporal', force: 'Anti-Rotación', bodyPart: 'full', chain: 'anterior',
    setupTime: 2, technicalDifficulty: 10, transferability: 8,
    injuryRisk: { level: 8, details: 'Extremadamente demandante para el core. Alto riesgo de lesión lumbar si no se tiene la fuerza necesaria.' },
  },
  {
    id: 'db_new_022', name: 'Dead Bug', description: 'Ejercicio fundamental de estabilidad del core que enseña a mover las extremidades mientras se mantiene la columna neutra.',
    involvedMuscles: [
      { muscle: 'Transverso Abdominal', activation: 1.0, role: 'primary' },
      { muscle: 'Oblicuos', activation: 0.7, role: 'stabilizer' },
    ],
    subMuscleGroup: 'Abdomen', category: 'Movilidad', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Anti-Rotación', bodyPart: 'full', chain: 'anterior',
    setupTime: 1, technicalDifficulty: 3, transferability: 9,
    injuryRisk: { level: 1, details: 'Muy seguro. Clave para la rehabilitación y prevención de dolor de espalda.' },
  },
  {
    id: 'db_new_023', name: 'Hollow Body Hold', description: 'Posición isométrica fundamental en gimnasia que crea una tensión inmensa en toda la cadena anterior.',
    involvedMuscles: [
      { muscle: 'Recto Abdominal', activation: 1.0, role: 'primary' },
      { muscle: 'Transverso Abdominal', activation: 0.9, role: 'stabilizer' },
      { muscle: 'Cuádriceps', activation: 0.5, role: 'stabilizer' },
    ],
    subMuscleGroup: 'Abdomen', category: 'Resistencia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Anti-Rotación', bodyPart: 'full', chain: 'anterior',
    setupTime: 1, technicalDifficulty: 5, transferability: 9,
    injuryRisk: { level: 3, details: 'Riesgo de tensión en la espalda baja si no se mantiene la zona lumbar pegada al suelo.' },
  },
  
  // --- HALTEROFILIA Y POTENCIA ---
  {
    id: 'db_snatch', name: 'Arrancada (Snatch)', description: 'Movimiento olímpico que consiste en levantar la barra desde el suelo hasta por encima de la cabeza en un solo movimiento explosivo.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' }, { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides', activation: 0.9, role: 'secondary' }, { muscle: 'Trapecio', activation: 0.9, role: 'secondary' }, { muscle: 'Erectores Espinales', activation: 0.8, role: 'stabilizer' } ],
    subMuscleGroup: 'Cuerpo Completo', category: 'Potencia', type: 'Básico', equipment: 'Barra', force: 'Tirón', bodyPart: 'full', chain: 'full',
    setupTime: 5, technicalDifficulty: 10, transferability: 10,
    injuryRisk: { level: 10, details: 'Extremadamente técnico. Alto riesgo en hombros, espalda baja, rodillas y muñecas si la técnica no es perfecta.' }, isHallOfFame: true
  },
  {
    id: 'db_clean_jerk', name: 'Dos Tiempos (Clean & Jerk)', description: 'Movimiento olímpico en dos fases: primero se levanta la barra del suelo a los hombros (cargada), y luego de los hombros a por encima de la cabeza (envión).',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' }, { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides', activation: 0.8, role: 'secondary' }, { muscle: 'Tríceps', activation: 0.8, role: 'secondary' }, { muscle: 'Erectores Espinales', activation: 0.8, role: 'stabilizer' } ],
    subMuscleGroup: 'Cuerpo Completo', category: 'Potencia', type: 'Básico', equipment: 'Barra', force: 'Empuje', bodyPart: 'full', chain: 'full',
    setupTime: 5, technicalDifficulty: 10, transferability: 10,
    injuryRisk: { level: 10, details: 'Extremadamente técnico. Alto riesgo en hombros, espalda baja, rodillas y muñecas si la técnica no es perfecta.' }, isHallOfFame: true
  },
  {
    id: 'db_push_press', name: 'Push Press', description: 'Variante del press militar que utiliza el impulso de las piernas para mover cargas más pesadas.',
    involvedMuscles: [ { muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' }, { muscle: 'Tríceps', activation: 0.9, role: 'secondary' }, { muscle: 'Cuádriceps', activation: 0.6, role: 'secondary' }, { muscle: 'Glúteos', activation: 0.6, role: 'secondary' } ],
    subMuscleGroup: 'Deltoides Anterior', category: 'Potencia', type: 'Básico', equipment: 'Barra', force: 'Empuje', bodyPart: 'full', chain: 'full',
    setupTime: 4, technicalDifficulty: 8, transferability: 9,
    injuryRisk: { level: 7, details: 'Riesgo para la espalda baja si se hiperextiende en el empuje. Requiere coordinación.' }
  },
  {
    id: 'db_box_jump', name: 'Salto al Cajón', description: 'Ejercicio pliométrico para desarrollar la potencia de las piernas y la capacidad de salto vertical.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' }, { muscle: 'Cuádriceps', activation: 0.9, role: 'secondary' }, { muscle: 'Pantorrillas', activation: 0.8, role: 'secondary' } ],
    subMuscleGroup: 'Glúteos', category: 'Pliometría', type: 'Básico', equipment: 'Otro', force: 'Sentadilla', bodyPart: 'lower', chain: 'posterior',
    setupTime: 2, technicalDifficulty: 6, transferability: 10,
    injuryRisk: { level: 6, details: 'Riesgo de caídas y lesiones en las espinillas. El mayor riesgo está al bajar del cajón, se recomienda bajar un pie a la vez.' }
  },
  {
    id: 'db_kettlebell_swing', name: 'Kettlebell Swing', description: 'Movimiento balístico que desarrolla potencia en la cadena posterior, resistencia y fuerza de agarre.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' }, { muscle: 'Isquiosurales', activation: 0.8, role: 'secondary' }, { muscle: 'Erectores Espinales', activation: 0.7, role: 'stabilizer' } ],
    subMuscleGroup: 'Glúteos', category: 'Potencia', type: 'Básico', equipment: 'Kettlebell', force: 'Bisagra', bodyPart: 'full', chain: 'posterior',
    setupTime: 1, technicalDifficulty: 8, transferability: 10,
    injuryRisk: { level: 7, details: 'Alto riesgo para la espalda baja si no se realiza como una bisagra de cadera y se convierte en una sentadilla.' }
  },
  
  // --- STRONGMAN ---
  {
    id: 'db_farmers_walk', name: "Paseo del Granjero", description: "Caminar una distancia determinada sosteniendo un peso pesado en cada mano. Desarrolla el agarre, trapecios, core y la estabilidad general.",
    involvedMuscles: [ { muscle: 'Antebrazo', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio', activation: 0.9, role: 'primary' }, { muscle: 'Oblicuos', activation: 0.8, role: 'stabilizer' } ],
    subMuscleGroup: 'Antebrazo', category: 'Fuerza', type: 'Básico', equipment: 'Otro', force: 'Otro', bodyPart: 'full', chain: 'full',
    setupTime: 4, technicalDifficulty: 4, transferability: 10,
    injuryRisk: { level: 5, details: 'Riesgo de desgarros en bíceps o espalda si se pierde la postura. El agarre es el factor limitante.' }, isHallOfFame: true
  },
  {
    id: 'db_log_press', name: 'Log Press', description: 'Levantamiento de un cilindro (log) desde el suelo hasta por encima de la cabeza. Un básico del Strongman.',
    involvedMuscles: [ { muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' }, { muscle: 'Tríceps', activation: 0.9, role: 'secondary' }, { muscle: 'Glúteos', activation: 0.7, role: 'secondary' } ],
    subMuscleGroup: 'Deltoides Anterior', category: 'Potencia', type: 'Básico', equipment: 'Otro', force: 'Empuje', bodyPart: 'full', chain: 'full',
    setupTime: 4, technicalDifficulty: 9, transferability: 9,
    injuryRisk: { level: 8, details: 'Técnicamente complejo. Riesgo en espalda baja, hombros y codos.' }
  },
  {
    id: 'db_sled_drag', name: 'Arrastre de Trineo', description: 'Tirar de un trineo pesado. Excelente para el acondicionamiento y el desarrollo de la cadena posterior con bajo impacto.',
    involvedMuscles: [ { muscle: 'Isquiosurales', activation: 1.0, role: 'primary' }, { muscle: 'Glúteos', activation: 0.9, role: 'primary' }, { muscle: 'Pantorrillas', activation: 0.7, role: 'secondary' } ],
    subMuscleGroup: 'Isquiosurales', category: 'Resistencia', type: 'Básico', equipment: 'Otro', force: 'Tirón', bodyPart: 'lower', chain: 'posterior',
    setupTime: 3, technicalDifficulty: 2, transferability: 10,
    injuryRisk: { level: 1, details: 'Extremadamente seguro. No tiene fase excéntrica, lo que minimiza el daño muscular y el riesgo.' }
  },
  {
    id: 'db_sled_push', name: 'Empuje de Trineo', description: 'Empujar un trineo pesado. Un finisher metabólico brutal que desarrolla la potencia de las piernas.',
    involvedMuscles: [ { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' }, { muscle: 'Glúteos', activation: 0.8, role: 'secondary' }, { muscle: 'Pantorrillas', activation: 0.7, role: 'secondary' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Potencia', type: 'Básico', equipment: 'Otro', force: 'Empuje', bodyPart: 'lower', chain: 'anterior',
    setupTime: 3, technicalDifficulty: 3, transferability: 10,
    injuryRisk: { level: 2, details: 'Muy seguro, con bajo impacto en las articulaciones.' }
  },
  {
    id: 'db_new_030', name: "World's Greatest Stretch", description: 'Estiramiento dinámico que combina una zancada profunda con una rotación torácica. Excelente para la movilidad de la cadera, la columna y los hombros.',
    involvedMuscles: [
      { muscle: 'Flexores de Cadera', activation: 1.0, role: 'primary' },
      { muscle: 'Glúteos', activation: 0.8, role: 'secondary' },
      { muscle: 'Aductores', activation: 0.7, role: 'secondary' },
    ],
    subMuscleGroup: 'Cuerpo Completo', category: 'Movilidad', type: 'Básico', equipment: 'Peso Corporal', force: 'Otro', bodyPart: 'full', chain: 'full',
    setupTime: 1, technicalDifficulty: 4, transferability: 10,
    injuryRisk: { level: 1, details: 'Muy bajo riesgo. Uno de los mejores movimientos de calentamiento.' },
  },
  {
    id: 'db_new_031', name: 'Couch Stretch', description: 'Estiramiento estático intenso para el cuádriceps y los flexores de la cadera.',
    involvedMuscles: [
      { muscle: 'Recto Femoral', activation: 1.0, role: 'primary' },
      { muscle: 'Cuádriceps', activation: 0.8, role: 'primary' },
    ],
    subMuscleGroup: 'Cuádriceps', category: 'Movilidad', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Otro', bodyPart: 'lower', chain: 'anterior',
    setupTime: 1, technicalDifficulty: 3, transferability: 7,
    injuryRisk: { level: 2, details: 'Puede ser muy intenso. Progresar lentamente.' },
  },
  {
    id: 'db_new_032', name: '90/90 Stretch', description: 'Estiramiento para la movilidad de la cadera que trabaja tanto la rotación interna como la externa simultáneamente.',
    involvedMuscles: [
      { muscle: 'Glúteo Medio', activation: 1.0, role: 'primary' },
      { muscle: 'Aductores', activation: 0.8, role: 'secondary' },
    ],
    subMuscleGroup: 'Glúteos', category: 'Movilidad', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Otro', bodyPart: 'lower', chain: 'posterior',
    setupTime: 1, technicalDifficulty: 4, transferability: 8,
    injuryRisk: { level: 1, details: 'Muy seguro y efectivo para la salud de la cadera.' },
  },
  {
    id: 'db_new_024', name: 'Kettlebell Turkish Get-Up', description: 'Movimiento complejo que involucra pasar de estar acostado a estar de pie mientras se sostiene una kettlebell sobre la cabeza. Desarrolla estabilidad, movilidad y fuerza total del cuerpo.',
    involvedMuscles: [
      { muscle: 'Deltoides', activation: 1.0, role: 'stabilizer' },
      { muscle: 'Oblicuos', activation: 0.9, role: 'primary' },
      { muscle: 'Glúteos', activation: 0.8, role: 'primary' },
    ],
    subMuscleGroup: 'Cuerpo Completo', category: 'Fuerza', type: 'Básico', equipment: 'Kettlebell', force: 'Otro', bodyPart: 'full', chain: 'full',
    setupTime: 2, technicalDifficulty: 10, transferability: 10,
    injuryRisk: { level: 8, details: 'Muy técnico. Requiere aprender los pasos con poco o ningún peso. Riesgo en hombro, muñeca y rodillas.' },
    isHallOfFame: true,
  },
  {
    id: 'db_new_025', name: 'Atlas Stone Load', description: 'Levantar una piedra pesada y redonda desde el suelo y cargarla sobre una plataforma. Un evento clásico de Strongman.',
    involvedMuscles: [
      { muscle: 'Erectores Espinales', activation: 1.0, role: 'primary' },
      { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' },
      { muscle: 'Bíceps', activation: 0.8, role: 'secondary' },
      { muscle: 'Antebrazo', activation: 0.9, role: 'secondary' },
    ],
    subMuscleGroup: 'Erectores Espinales', category: 'Fuerza', type: 'Básico', equipment: 'Otro', force: 'Bisagra', bodyPart: 'full', chain: 'posterior',
    setupTime: 3, technicalDifficulty: 9, transferability: 9,
    injuryRisk: { level: 10, details: 'Alto riesgo de lesión en la espalda baja y desgarro de bíceps. La técnica es primordial.' },
    sportsRelevance: ['Strongman']
  },
  {
    id: 'db_new_026', name: 'Yoke Walk', description: 'Caminar una distancia determinada cargando una estructura pesada (yugo) sobre la espalda y los hombros.',
    involvedMuscles: [
      { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' },
      { muscle: 'Erectores Espinales', activation: 0.9, role: 'stabilizer' },
      { muscle: 'Transverso Abdominal', activation: 1.0, role: 'stabilizer' },
    ],
    subMuscleGroup: 'Cuerpo Completo', category: 'Fuerza', type: 'Básico', equipment: 'Otro', force: 'Otro', bodyPart: 'full', chain: 'full',
    setupTime: 5, technicalDifficulty: 7, transferability: 9,
    injuryRisk: { level: 8, details: 'Alto riesgo de compresión espinal y caídas si se pierde el equilibrio.' },
    sportsRelevance: ['Strongman']
  },
  {
    id: 'db_new_038', name: 'Power Clean', description: 'Variante de la cargada olímpica sin la sentadilla profunda. Enseña a generar potencia explosiva desde la cadera.',
    involvedMuscles: [
      { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' },
      { muscle: 'Trapecio', activation: 0.9, role: 'secondary' },
      { muscle: 'Isquiosurales', activation: 0.7, role: 'secondary' },
    ],
    subMuscleGroup: 'Cuerpo Completo', category: 'Potencia', type: 'Básico', equipment: 'Barra', force: 'Tirón', bodyPart: 'full', chain: 'posterior',
    setupTime: 4, technicalDifficulty: 9, transferability: 10,
    injuryRisk: { level: 8, details: 'Técnicamente demandante. Riesgo en muñecas, codos y espalda baja.' },
  },
  {
    id: 'db_new_039', name: 'Barbell Hip Hinge', description: 'Ejercicio fundamental para aprender el patrón de bisagra de cadera con una barra ligera, precursor del peso muerto.',
    involvedMuscles: [
      { muscle: 'Isquiosurales', activation: 1.0, role: 'primary' },
      { muscle: 'Glúteo Mayor', activation: 0.8, role: 'secondary' },
    ],
    subMuscleGroup: 'Isquiosurales', category: 'Movilidad', type: 'Básico', equipment: 'Barra', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior',
    setupTime: 2, technicalDifficulty: 4, transferability: 10,
    injuryRisk: { level: 2, details: 'Bajo riesgo si se usa poco peso y se enfoca en la técnica.' },
  },
  {
    id: 'db_new_040', name: 'Cat-Cow Stretch', description: 'Movimiento de yoga para la movilidad de la columna, alternando entre flexión y extensión espinal.',
    involvedMuscles: [
      { muscle: 'Erectores Espinales', activation: 1.0, role: 'primary' },
      { muscle: 'Recto Abdominal', activation: 0.8, role: 'secondary' },
    ],
    subMuscleGroup: 'Erectores Espinales', category: 'Movilidad', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Otro', bodyPart: 'full', chain: 'full',
    setupTime: 1, technicalDifficulty: 1, transferability: 8,
    injuryRisk: { level: 1, details: 'Muy seguro y beneficioso para la salud de la espalda.' },
  },
  // --- END OF ORIGINAL LIST, START OF NEW MASSIVE ADDITION ---

  // --- NUEVOS EJERCICIOS DE PIERNAS Y GLÚTEOS (120+) ---
  // Cuádriceps
  {
    id: 'db_leg_001', name: 'Sentadilla Zercher', description: 'Sentadilla con la barra sostenida en los codos. Desafía el core y la espalda alta, manteniendo un torso muy vertical.',
    involvedMuscles: [ { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.7, role: 'secondary' }, { muscle: 'Erectores Espinales', activation: 0.8, role: 'stabilizer' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Sentadilla', bodyPart: 'lower', chain: 'anterior'
  },
  {
    id: 'db_leg_002', name: 'Sentadilla con Safety Bar', description: 'Utiliza una barra especial que cambia el centro de gravedad y es más amigable para los hombros, manteniendo el torso erguido.',
    involvedMuscles: [ { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.8, role: 'secondary' }, { muscle: 'Trapecio', activation: 0.7, role: 'stabilizer' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Sentadilla', bodyPart: 'lower', chain: 'full'
  },
  {
    id: 'db_leg_003', name: 'Sentadilla con talones elevados', description: 'Elevar los talones con discos o cuñas permite mayor profundidad y un mayor énfasis en los cuádriceps.',
    involvedMuscles: [ { muscle: 'Vasto Medial', activation: 1.0, role: 'primary' }, { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Barra', force: 'Sentadilla', bodyPart: 'lower', chain: 'anterior'
  },
  {
    id: 'db_leg_004', name: 'Sentadilla Ciclista (Cyclist Squat)', description: 'Una versión extrema de la sentadilla con talones elevados, con una postura estrecha para aislar al máximo los cuádriceps.',
    involvedMuscles: [ { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' }, { muscle: 'Vasto Medial', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Sentadilla', bodyPart: 'lower', chain: 'anterior'
  },
  {
    id: 'db_leg_005', name: 'Sentadilla Española (Spanish Squat)', description: 'Se usa una banda detrás de las rodillas como contrapeso, permitiendo sentarse hacia atrás y cargar los cuádriceps de forma segura.',
    involvedMuscles: [ { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Banda', force: 'Sentadilla', bodyPart: 'lower', chain: 'anterior'
  },
  {
    id: 'db_leg_006', name: 'Prensa a una Pierna', description: 'Versión unilateral de la prensa de piernas para corregir desbalances y aumentar el rango de movimiento.',
    involvedMuscles: [ { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.7, role: 'secondary' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Máquina', force: 'Empuje', bodyPart: 'lower', chain: 'anterior'
  },
  {
    id: 'db_leg_007', name: 'Prensa Vertical', description: 'Variante de prensa que se realiza verticalmente, con un gran enfoque en los cuádriceps.',
    involvedMuscles: [ { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Máquina', force: 'Empuje', bodyPart: 'lower', chain: 'anterior'
  },
  // Isquiotibiales
  {
    id: 'db_leg_008', name: 'Curl Nórdico Inverso (Reverse Nordic Curl)', description: 'Ejercicio excéntrico que se enfoca en el recto femoral y la salud de la rodilla.',
    involvedMuscles: [ { muscle: 'Recto Femoral', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Fuerza', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Otro', bodyPart: 'lower', chain: 'anterior'
  },
  {
    id: 'db_leg_009', name: 'Good Morning Sentado', description: 'Aísla los erectores espinales e isquiotibiales con un rango de movimiento controlado.',
    involvedMuscles: [ { muscle: 'Erectores Espinales', activation: 1.0, role: 'primary' }, { muscle: 'Isquiosurales', activation: 0.8, role: 'secondary' } ],
    subMuscleGroup: 'Erectores Espinales', category: 'Fuerza', type: 'Accesorio', equipment: 'Barra', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_010', name: 'Curl Femoral Tumbado', description: 'El clásico ejercicio de aislamiento para los isquiotibiales en máquina.',
    involvedMuscles: [ { muscle: 'Isquiosurales', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Isquiosurales', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Máquina', force: 'Tirón', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_011', name: 'Curl Femoral Tumbado a una Pierna', description: 'Versión unilateral para enfocarse en la conexión mente-músculo y corregir asimetrías.',
    involvedMuscles: [ { muscle: 'Isquiosurales', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Isquiosurales', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Máquina', force: 'Tirón', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_012', name: 'Curl Femoral de Pie', description: 'Variante de curl femoral que se realiza de pie, permitiendo una fuerte contracción en el pico del movimiento.',
    involvedMuscles: [ { muscle: 'Isquiosurales', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Isquiosurales', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Máquina', force: 'Tirón', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_013', name: 'Razor Curl', description: 'Una variante del Glute-Ham Raise que mantiene la cadera flexionada, aislando más los isquiotibiales.',
    involvedMuscles: [ { muscle: 'Isquiosurales', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Isquiosurales', category: 'Fuerza', type: 'Accesorio', equipment: 'Máquina', force: 'Tirón', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_014', name: 'Curl con Balón Suizo', description: 'Ejercicio que combina la flexión de rodilla con la extensión de cadera, trabajando isquios y glúteos.',
    involvedMuscles: [ { muscle: 'Isquiosurales', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.7, role: 'secondary' } ],
    subMuscleGroup: 'Isquiosurales', category: 'Resistencia', type: 'Accesorio', equipment: 'Otro', force: 'Tirón', bodyPart: 'lower', chain: 'posterior'
  },
  // Glúteos
  {
    id: 'db_leg_015', name: 'Puente de Glúteos KAS', description: 'Un puente de glúteos con rango de movimiento corto, enfocado en mantener la tensión constante sobre los glúteos.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Glúteos', category: 'Hipertrofia', type: 'Básico', equipment: 'Barra', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_016', name: 'Hip Thrust a una Pierna', description: 'Versión unilateral del Hip Thrust para un aislamiento máximo y corrección de desbalances.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Glúteos', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Peso Corporal', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_017', name: 'Patada de Glúteo en Polea (Cable Kickback)', description: 'Ejercicio de aislamiento popular para una fuerte contracción del glúteo.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Glúteos', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_018', name: 'Bombas de Rana (Frog Pumps)', description: 'Ejercicio de peso corporal con las plantas de los pies juntas para aislar el glúteo en su función de rotación externa.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Glúteos', category: 'Resistencia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_019', name: 'Zancada Reversa desde Déficit', description: 'Realizar una zancada reversa desde una plataforma elevada para aumentar el rango de movimiento y el estiramiento del glúteo.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' }, { muscle: 'Cuádriceps', activation: 0.7, role: 'secondary' } ],
    subMuscleGroup: 'Glúteos', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Mancuerna', force: 'Sentadilla', bodyPart: 'lower', chain: 'full'
  },
  {
    id: 'db_leg_020', name: 'Step-Up con Barra', description: 'Subir a un cajón con una barra en la espalda, un constructor de fuerza unilateral fenomenal.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' }, { muscle: 'Cuádriceps', activation: 0.9, role: 'secondary' } ],
    subMuscleGroup: 'Glúteos', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Sentadilla', bodyPart: 'lower', chain: 'full'
  },
  {
    id: 'db_leg_021', name: 'Abducción de Cadera en Máquina', description: 'Máquina para aislar el glúteo medio y menor.',
    involvedMuscles: [ { muscle: 'Glúteo Medio', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Glúteos', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Máquina', force: 'Otro', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_022', name: 'Patada Lateral en Polea', description: 'Aísla el glúteo medio y mejora la estabilidad de la cadera.',
    involvedMuscles: [ { muscle: 'Glúteo Medio', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Glúteos', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Otro', bodyPart: 'lower', chain: 'posterior'
  },
  // Pantorrillas y Tibiales
  {
    id: 'db_leg_023', name: 'Elevación de Talones en Prensa', description: 'Permite cargar un peso muy alto en las pantorrillas de forma segura.',
    involvedMuscles: [ { muscle: 'Gastrocnemio', activation: 1.0, role: 'primary' }, { muscle: 'Sóleo', activation: 0.8, role: 'secondary' } ],
    subMuscleGroup: 'Pantorrillas', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Máquina', force: 'Empuje', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_024', name: 'Elevación de Talones tipo Burro (Donkey Calf Raise)', description: 'Una variante que crea un gran estiramiento en las pantorrillas al estar inclinado hacia adelante.',
    involvedMuscles: [ { muscle: 'Gastrocnemio', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Pantorrillas', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Máquina', force: 'Empuje', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_025', name: 'Elevación de Tibial Anterior', description: 'Fortalece el músculo en la parte frontal de la espinilla, crucial para la salud de la rodilla y el equilibrio.',
    involvedMuscles: [ { muscle: 'Tibial Anterior', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Pantorrillas', category: 'Fuerza', type: 'Aislamiento', equipment: 'Otro', force: 'Tirón', bodyPart: 'lower', chain: 'anterior'
  },
  // Aductores
  {
    id: 'db_leg_026', name: 'Aducción en Máquina', description: 'Máquina específica para aislar los músculos de la parte interna del muslo.',
    involvedMuscles: [ { muscle: 'Aductores', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Aductores', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Máquina', force: 'Otro', bodyPart: 'lower', chain: 'anterior'
  },
  {
    id: 'db_leg_027', name: 'Sentadilla Cosaca', description: 'Zancada lateral profunda que desarrolla fuerza y movilidad en los aductores y la cadera.',
    involvedMuscles: [ { muscle: 'Aductores', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.7, role: 'secondary' } ],
    subMuscleGroup: 'Aductores', category: 'Movilidad', type: 'Accesorio', equipment: 'Peso Corporal', force: 'Sentadilla', bodyPart: 'lower', chain: 'full'
  },
  {
    id: 'db_leg_028', name: 'Aducción en Polea', description: 'Ejercicio de aislamiento para los aductores utilizando una polea baja.',
    involvedMuscles: [ { muscle: 'Aductores', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Aductores', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Otro', bodyPart: 'lower', chain: 'anterior'
  },
  // Más variantes de pierna
  {
    id: 'db_leg_029', name: 'Sentadilla con Pausa', description: 'Añadir una pausa en la parte más baja de la sentadilla elimina el rebote y aumenta la fuerza desde el fondo.',
    involvedMuscles: [ { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.9, role: 'secondary' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Sentadilla', bodyPart: 'lower', chain: 'full'
  },
  {
    id: 'db_leg_030', name: 'Zancada Lateral', description: 'Trabaja los glúteos y aductores desde un plano de movimiento diferente.',
    involvedMuscles: [ { muscle: 'Glúteo Medio', activation: 1.0, role: 'primary' }, { muscle: 'Aductores', activation: 0.8, role: 'secondary' } ],
    subMuscleGroup: 'Glúteos', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Mancuerna', force: 'Sentadilla', bodyPart: 'lower', chain: 'full'
  },
  {
    id: 'db_leg_031', name: 'Puente de Glúteos a una Pierna', description: 'Versión de peso corporal del hip thrust unilateral, excelente para la activación y la resistencia.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' }, { muscle: 'Isquiosurales', activation: 0.5, role: 'secondary' } ],
    subMuscleGroup: 'Glúteos', category: 'Resistencia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_032', name: 'Peso Muerto con Mancuernas', description: 'Variante del RDL que permite un movimiento más natural para las muñecas y hombros.',
    involvedMuscles: [ { muscle: 'Isquiosurales', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.9, role: 'secondary' } ],
    subMuscleGroup: 'Isquiosurales', category: 'Hipertrofia', type: 'Básico', equipment: 'Mancuerna', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_033', name: 'Pistol Squat Asistido', description: 'Sentadilla a una pierna con asistencia (banda, TRX, etc.) para progresar hacia la versión completa.',
    involvedMuscles: [ { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.8, role: 'secondary' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Fuerza', type: 'Básico', equipment: 'Otro', force: 'Sentadilla', bodyPart: 'lower', chain: 'full'
  },
  {
    id: 'db_leg_034', name: 'Salto con Sentadilla (Squat Jump)', description: 'Ejercicio pliométrico para desarrollar la potencia de las piernas.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' }, { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Pliometría', type: 'Básico', equipment: 'Peso Corporal', force: 'Sentadilla', bodyPart: 'lower', chain: 'full'
  },
  {
    id: 'db_leg_035', name: 'Zancada con Salto', description: 'Ejercicio pliométrico avanzado que combina zancadas con un salto explosivo.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' }, { muscle: 'Cuádriceps', activation: 0.9, role: 'secondary' } ],
    subMuscleGroup: 'Glúteos', category: 'Pliometría', type: 'Accesorio', equipment: 'Peso Corporal', force: 'Sentadilla', bodyPart: 'lower', chain: 'full'
  },
  {
    id: 'db_leg_036', name: 'Sentadilla Isométrica en Pared (Wall Sit)', description: 'Ejercicio isométrico para construir resistencia en los cuádriceps.',
    involvedMuscles: [ { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Resistencia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Sentadilla', bodyPart: 'lower', chain: 'anterior'
  },
  {
    id: 'db_leg_037', name: 'Zancada Curtsy', description: 'Zancada que cruza por detrás, poniendo más énfasis en el glúteo medio y los aductores.',
    involvedMuscles: [ { muscle: 'Glúteo Medio', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.8, role: 'secondary' }, { muscle: 'Aductores', activation: 0.6, role: 'secondary' } ],
    subMuscleGroup: 'Glúteos', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Mancuerna', force: 'Sentadilla', bodyPart: 'lower', chain: 'full'
  },
  {
    id: 'db_leg_038', name: 'Sentadilla Búlgara con Salto', description: 'Variante pliométrica de la sentadilla búlgara para una potencia unilateral explosiva.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' }, { muscle: 'Cuádriceps', activation: 0.9, role: 'secondary' } ],
    subMuscleGroup: 'Glúteos', category: 'Pliometría', type: 'Accesorio', equipment: 'Peso Corporal', force: 'Sentadilla', bodyPart: 'lower', chain: 'full'
  },
  {
    id: 'db_leg_039', name: 'Sentadilla Jefferson', description: 'Sentadilla no convencional con la barra entre las piernas, que trabaja las piernas de forma asimétrica y desafía la estabilidad.',
    involvedMuscles: [ { muscle: 'Aductores', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.9, role: 'secondary' }, { muscle: 'Cuádriceps', activation: 0.8, role: 'secondary' } ],
    subMuscleGroup: 'Aductores', category: 'Fuerza', type: 'Accesorio', equipment: 'Barra', force: 'Sentadilla', bodyPart: 'lower', chain: 'full'
  },
  {
    id: 'db_leg_040', name: 'Sentadilla con 1 y 1/4 (One and a Quarter Squat)', description: 'Se realiza una sentadilla completa, se sube un cuarto del recorrido, se vuelve a bajar y se sube completamente. Aumenta el tiempo bajo tensión.',
    involvedMuscles: [ { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.8, role: 'secondary' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Barra', force: 'Sentadilla', bodyPart: 'lower', chain: 'full'
  },
  {
    id: 'db_leg_041', name: 'Puente de Isquios (Hamstring Bridge)', description: 'Puente de glúteos con los pies más alejados del cuerpo para enfocar el trabajo en los isquiotibiales.',
    involvedMuscles: [ { muscle: 'Isquiosurales', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.6, role: 'secondary' } ],
    subMuscleGroup: 'Isquiosurales', category: 'Resistencia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_042', name: 'Prensa con Bandas (Resistencia Acomodada)', description: 'Añadir bandas a la prensa de piernas aumenta la resistencia al final del movimiento, donde somos más fuertes.',
    involvedMuscles: [ { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Fuerza', type: 'Accesorio', equipment: 'Máquina', force: 'Empuje', bodyPart: 'lower', chain: 'anterior'
  },
  {
    id: 'db_leg_043', name: 'Peso Muerto Rumano a una pierna (con apoyo)', description: 'Variante del RDL unilateral que permite usar más peso al tener un punto de apoyo, enfocando en la sobrecarga del isquio.',
    involvedMuscles: [ { muscle: 'Isquiosurales', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.8, role: 'secondary' } ],
    subMuscleGroup: 'Isquiosurales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Mancuerna', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_044', name: 'Salto de Patinador (Skater Jump)', description: 'Salto lateral de una pierna a otra, desarrollando potencia y estabilidad en el plano frontal.',
    involvedMuscles: [ { muscle: 'Glúteo Medio', activation: 1.0, role: 'primary' }, { muscle: 'Cuádriceps', activation: 0.7, role: 'secondary' } ],
    subMuscleGroup: 'Glúteos', category: 'Pliometría', type: 'Accesorio', equipment: 'Peso Corporal', force: 'Sentadilla', bodyPart: 'lower', chain: 'full'
  },
  {
    id: 'db_leg_045', name: 'Sentadilla Búlgara en Máquina Smith', description: 'Ofrece mayor estabilidad que la versión con peso libre, permitiendo enfocarse en la contracción muscular.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' }, { muscle: 'Cuádriceps', activation: 0.8, role: 'secondary' } ],
    subMuscleGroup: 'Glúteos', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Máquina', force: 'Sentadilla', bodyPart: 'lower', chain: 'full'
  },
  {
    id: 'db_leg_046', name: 'Hip Thrust en Máquina', description: 'Máquina específica para Hip Thrust que ofrece estabilidad y facilita la carga.',
    involvedMuscles: [ { muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Glúteos', category: 'Hipertrofia', type: 'Básico', equipment: 'Máquina', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_leg_047', name: 'Zancada con Barra sobre la Cabeza (Overhead Lunge)', description: 'Zancada sosteniendo una barra sobre la cabeza, desafiando la estabilidad del core y los hombros.',
    involvedMuscles: [ { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' }, { muscle: 'Transverso Abdominal', activation: 0.9, role: 'stabilizer' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Fuerza', type: 'Accesorio', equipment: 'Barra', force: 'Sentadilla', bodyPart: 'full', chain: 'full'
  },
  {
    id: 'db_leg_048', name: 'Sentadilla con Kettlebell Doble (Front Rack)', description: 'Sostener dos kettlebells en posición de front rack aumenta enormemente la demanda sobre el core y la espalda alta.',
    involvedMuscles: [ { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' }, { muscle: 'Recto Abdominal', activation: 0.8, role: 'stabilizer' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Fuerza', type: 'Básico', equipment: 'Kettlebell', force: 'Sentadilla', bodyPart: 'lower', chain: 'anterior'
  },
  {
    id: 'db_leg_049', name: 'Step-Down', description: 'Bajar de un cajón de forma controlada, enfocando el trabajo excéntrico en el cuádriceps y glúteo.',
    involvedMuscles: [ { muscle: 'Cuádriceps', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Medio', activation: 0.7, role: 'stabilizer' } ],
    subMuscleGroup: 'Cuádriceps', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Peso Corporal', force: 'Sentadilla', bodyPart: 'lower', chain: 'full'
  },
  {
    id: 'db_leg_050', name: 'Prensa para Gemelos', description: 'Utiliza la máquina de prensa de piernas para realizar elevaciones de talones, permitiendo un gran peso.',
    involvedMuscles: [ { muscle: 'Gastrocnemio', activation: 1.0, role: 'primary' } ],
    subMuscleGroup: 'Pantorrillas', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Máquina', force: 'Empuje', bodyPart: 'lower', chain: 'posterior'
  },

  // --- NUEVOS EJERCICIOS DE ESPALDA ---
  {
    id: 'db_back_001', name: 'Remo Gironda', description: 'Remo sentado en polea con una retracción escapular máxima, llevando la barra hacia el esternón inferior. Enfocado en la densidad de la espalda media.',
    involvedMuscles: [{ muscle: 'Romboides', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Medio', activation: 0.9, role: 'primary' }, { muscle: 'Dorsal Ancho', activation: 0.6, role: 'secondary' }],
    subMuscleGroup: 'Romboides', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Polea', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_002', name: 'Remo Unilateral en Polea Baja', description: 'Permite un gran estiramiento del dorsal y una fuerte contracción al poder rotar ligeramente el torso.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Romboides', activation: 0.5, role: 'secondary' }, { muscle: 'Bíceps', activation: 0.6, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Polea', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_003', name: 'Remo en Máquina Hammer (Agarre Prono)', description: 'Trabaja la parte alta de la espalda y los deltoides posteriores. El apoyo en el pecho ofrece gran estabilidad.',
    involvedMuscles: [{ muscle: 'Trapecio Medio', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Posterior', activation: 0.8, role: 'secondary' }, { muscle: 'Romboides', activation: 0.7, role: 'secondary' }],
    subMuscleGroup: 'Trapecio', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Máquina', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_004', name: 'Remo en Máquina Hammer (Agarre Neutro)', description: 'Enfatiza los dorsales y la parte media de la espalda con un agarre más amigable para las muñecas.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Romboides', activation: 0.8, role: 'secondary' }, { muscle: 'Bíceps', activation: 0.5, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Máquina', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_005', name: 'Jalón al Pecho (Agarre Neutro)', description: 'Variante del jalón al pecho que utiliza un agarre estrecho y neutro para enfatizar el estiramiento del dorsal.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Bíceps', activation: 0.7, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Polea', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_006', name: 'Jalón al Pecho (Agarre Invertido)', description: 'Similar a un chin-up, este agarre involucra más al bíceps y trabaja los dorsales desde un ángulo diferente.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Bíceps', activation: 0.9, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Polea', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_007', name: 'Jalón Unilateral en Polea', description: 'Aísla cada dorsal de forma independiente, mejorando la simetría y la conexión mente-músculo.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Oblicuos', activation: 0.4, role: 'stabilizer' }],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_008', name: 'Dominadas con Agarre Ancho', description: 'La variante clásica para maximizar la amplitud de la espalda, enfocándose en las fibras externas del dorsal.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Redondo Mayor', activation: 0.8, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Fuerza', type: 'Básico', equipment: 'Peso Corporal', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_009', name: 'Remo Yates', description: 'Una variante de remo con barra pero con un torso más erguido, popularizada por Dorian Yates, para sobrecargar la espalda alta.',
    involvedMuscles: [{ muscle: 'Trapecio Medio', activation: 1.0, role: 'primary' }, { muscle: 'Dorsal Ancho', activation: 0.8, role: 'secondary' }, { muscle: 'Erectores Espinales', activation: 0.6, role: 'stabilizer' }],
    subMuscleGroup: 'Trapecio', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_010', name: 'Pullover con Barra en Polea', description: 'Versión en polea del pullover que mantiene la tensión constante sobre los dorsales durante todo el movimiento.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Serrato Anterior', activation: 0.6, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_011', name: 'Remo Renegado (Renegade Row)', description: 'Combina una plancha con un remo con mancuerna, desafiando enormemente la estabilidad del core mientras se trabaja la espalda.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Oblicuos', activation: 0.9, role: 'stabilizer' }, { muscle: 'Transverso Abdominal', activation: 0.9, role: 'stabilizer' }],
    subMuscleGroup: 'Dorsales', category: 'Fuerza', type: 'Accesorio', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'full', chain: 'full'
  },
  {
    id: 'db_back_012', name: 'Peso Muerto con Agarre de Arrancada (Snatch Grip)', description: 'Peso muerto con un agarre muy ancho, lo que aumenta el rango de movimiento y la demanda sobre la espalda alta y los trapecios.',
    involvedMuscles: [{ muscle: 'Trapecio', activation: 1.0, role: 'primary' }, { muscle: 'Erectores Espinales', activation: 0.9, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.8, role: 'secondary' }],
    subMuscleGroup: 'Trapecio', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Bisagra', bodyPart: 'full', chain: 'posterior'
  },
  {
    id: 'db_back_013', name: 'Remo Invertido con Pies Elevados', description: 'Aumenta la dificultad del remo invertido al elevar los pies, incrementando el porcentaje de peso corporal que se levanta.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Romboides', activation: 0.8, role: 'secondary' }, { muscle: 'Bíceps', activation: 0.7, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Fuerza', type: 'Básico', equipment: 'Peso Corporal', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_014', name: 'Hiperextensiones Inversas', description: 'Ejercicio para la cadena posterior que se enfoca en la extensión de cadera, fortaleciendo glúteos, isquiotibiales y erectores espinales con menos compresión espinal.',
    involvedMuscles: [{ muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' }, { muscle: 'Erectores Espinales', activation: 0.8, role: 'secondary' }, { muscle: 'Isquiosurales', activation: 0.7, role: 'secondary' }],
    subMuscleGroup: 'Erectores Espinales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Máquina', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_back_015', name: 'Dominadas con Toalla', description: 'Variante de dominada que desafía enormemente la fuerza de agarre al sujetar toallas en lugar de la barra.',
    involvedMuscles: [{ muscle: 'Antebrazo', activation: 1.0, role: 'primary' }, { muscle: 'Dorsal Ancho', activation: 0.9, role: 'primary' }, { muscle: 'Bíceps', activation: 0.8, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Fuerza', type: 'Accesorio', equipment: 'Otro', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_016', name: 'Remo con Ketlebell a una mano', alias: 'Kettlebell Row', description: 'Similar al remo con mancuerna, pero el centro de gravedad de la kettlebell desafía la estabilidad de una manera única.',
    involvedMuscles: [ { muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Romboides', activation: 0.6, role: 'secondary' }, { muscle: 'Bíceps', activation: 0.6, role: 'secondary' }, ],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Kettlebell', force: 'Tirón', bodyPart: 'upper', chain: 'posterior',
  },
  {
    id: 'db_back_017', name: 'Superman', description: 'Ejercicio de peso corporal para fortalecer los erectores espinales y la parte baja de la espalda.',
    involvedMuscles: [ { muscle: 'Erectores Espinales', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.5, role: 'secondary' }],
    subMuscleGroup: 'Erectores Espinales', category: 'Resistencia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_back_018', name: 'Encogimientos con Barra por Detrás', description: 'Variante de encogimientos que puede permitir un mayor rango de movimiento y una fuerte contracción del trapecio.',
    involvedMuscles: [ { muscle: 'Trapecio Superior', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Medio', activation: 0.5, role: 'secondary' }],
    subMuscleGroup: 'Trapecio', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Barra', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_019', name: 'Remo en Punta (Landmine)', description: 'Remo a dos manos con un extremo de la barra anclado y un agarre en V. Enfatiza la densidad de la espalda media.',
    involvedMuscles: [ { muscle: 'Romboides', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Medio', activation: 1.0, role: 'primary' }, { muscle: 'Dorsal Ancho', activation: 0.7, role: 'secondary' }],
    subMuscleGroup: 'Romboides', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Barra', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_020', name: 'Peso Muerto con Déficit', description: 'Peso muerto realizado de pie sobre una plataforma elevada para aumentar el rango de movimiento y la dificultad desde el suelo.',
    involvedMuscles: [ { muscle: 'Erectores Espinales', activation: 1.0, role: 'primary' }, { muscle: 'Cuádriceps', activation: 0.8, role: 'secondary' }, { muscle: 'Glúteo Mayor', activation: 0.9, role: 'secondary' }],
    subMuscleGroup: 'Erectores Espinales', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Bisagra', bodyPart: 'full', chain: 'posterior'
  },
  {
    id: 'db_back_021', name: 'Paseo del Granjero a una Mano (Suitcase Carry)', description: 'Caminar con peso en una sola mano, desafiando brutalmente los oblicuos y estabilizadores laterales.',
    involvedMuscles: [{ muscle: 'Oblicuos', activation: 1.0, role: 'stabilizer' }, { muscle: 'Antebrazo', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio', activation: 0.8, role: 'stabilizer' }],
    subMuscleGroup: 'Oblicuos', category: 'Fuerza', type: 'Básico', equipment: 'Mancuerna', force: 'Otro', bodyPart: 'full', chain: 'full'
  },
  {
    id: 'db_back_022', name: 'Remo con Banda de Resistencia', description: 'Ejercicio de remo portátil y de bajo impacto, ideal para calentamientos, rehabilitación o viajes.',
    involvedMuscles: [{ muscle: 'Romboides', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Medio', activation: 0.8, role: 'secondary' }],
    subMuscleGroup: 'Romboides', category: 'Resistencia', type: 'Accesorio', equipment: 'Banda', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_023', name: 'Dominadas Asistidas (Máquina)', description: 'Permite realizar dominadas a quienes aún no pueden con su peso corporal, con una resistencia ajustable.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Bíceps', activation: 0.7, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Básico', equipment: 'Máquina', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_024', name: 'Dominadas Asistidas (Banda)', description: 'Usa una banda de resistencia para ayudar en la fase ascendente de la dominada, una gran herramienta de progresión.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Bíceps', activation: 0.7, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Fuerza', type: 'Básico', equipment: 'Banda', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_025', name: 'Dominadas Lastradas', description: 'Añade peso a las dominadas para continuar la sobrecarga progresiva una vez que el peso corporal es fácil.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Bíceps', activation: 0.8, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Fuerza', type: 'Básico', equipment: 'Otro', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_026', name: 'Dominadas con Agarre Neutro', description: 'Un agarre más amigable para los hombros que se encuentra entre el prono y el supino.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Braquial', activation: 0.8, role: 'secondary' }, { muscle: 'Bíceps', activation: 0.6, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Fuerza', type: 'Básico', equipment: 'Peso Corporal', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_027', name: 'Remo con Barra en Máquina Smith', description: 'Ofrece más estabilidad que el remo con barra libre, permitiendo concentrarse en la contracción de la espalda.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Romboides', activation: 0.8, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Máquina', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_028', name: 'Remo al Cuello con Polea Baja', description: 'Una variante del remo al mentón, a menudo más segura para los hombros, enfocada en trapecios y deltoides lateral.',
    involvedMuscles: [{ muscle: 'Deltoides Lateral', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Superior', activation: 0.8, role: 'secondary' }],
    subMuscleGroup: 'Deltoides Lateral', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Polea', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_029', name: 'Encogimientos de Trapecio en Máquina', description: 'Aísla los trapecios de forma segura y controlada.',
    involvedMuscles: [{ muscle: 'Trapecio Superior', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Trapecio', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Máquina', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_030', name: 'Retracción Escapular en Polea', description: 'Ejercicio de aislamiento para los romboides y trapecio medio, excelente para mejorar la postura y la activación de la espalda.',
    involvedMuscles: [{ muscle: 'Romboides', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Medio', activation: 0.9, role: 'secondary' }],
    subMuscleGroup: 'Romboides', category: 'Movilidad', type: 'Aislamiento', equipment: 'Polea', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_031', name: 'Remo Gironda Unilateral', description: 'Versión a una mano del remo Gironda para mejorar la simetría y permitir una mayor rotación y contracción.',
    involvedMuscles: [{ muscle: 'Romboides', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Medio', activation: 0.9, role: 'primary' }, { muscle: 'Dorsal Ancho', activation: 0.6, role: 'secondary' }],
    subMuscleGroup: 'Romboides', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Polea', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_032', name: 'Jalón Tras Nuca', description: 'Variante del jalón al pecho que requiere una gran movilidad de hombro. Controvertido y potencialmente lesivo si no se hace correctamente.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Romboides', activation: 0.7, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Polea', force: 'Tirón', bodyPart: 'upper', chain: 'posterior',
    injuryRisk: { level: 9, details: 'Alto riesgo de pinzamiento de hombro. Generalmente no se recomienda.' }
  },
  {
    id: 'db_back_033', name: 'Peso Muerto con Barra Hexagonal', description: 'Una variante de peso muerto que es un híbrido entre el convencional y la sentadilla. Permite mantener el torso más erguido, reduciendo el estrés lumbar.',
    involvedMuscles: [{ muscle: 'Cuádriceps', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.9, role: 'primary' }, { muscle: 'Erectores Espinales', activation: 0.6, role: 'stabilizer' }],
    subMuscleGroup: 'Erectores Espinales', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Bisagra', bodyPart: 'full', chain: 'posterior'
  },
  {
    id: 'db_back_034', name: 'Dominadas Archer', description: 'Dominada unilateral asistida, donde un brazo tira mientras el otro se extiende para dar apoyo. Un paso hacia la dominada a una mano.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Bíceps', activation: 0.8, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Fuerza', type: 'Accesorio', equipment: 'Peso Corporal', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_035', name: 'Jalón al Pecho en Máquina (Hammer)', description: 'Máquina que replica el movimiento del jalón al pecho, a menudo con agarres independientes que permiten un movimiento más convergente.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Bíceps', activation: 0.6, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Máquina', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_036', name: 'Remo Invertido con Agarre Supino', description: 'Variante del remo invertido que involucra más al bíceps y trabaja la espalda desde otro ángulo.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Bíceps', activation: 0.9, role: 'secondary' }],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Peso Corporal', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_037', name: 'Pájaros en Máquina (Reverse Pec Deck)', description: 'Alternativa segura a los pájaros con mancuerna para aislar el deltoides posterior y la espalda alta.',
    involvedMuscles: [{ muscle: 'Deltoides Posterior', activation: 1.0, role: 'primary' }, { muscle: 'Romboides', activation: 0.7, role: 'secondary' }],
    subMuscleGroup: 'Deltoides Posterior', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Máquina', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_038', name: 'Remo con Cuerda a la Cara (Rope Face Pull)', description: 'Variante del face pull con cuerda que permite una mayor rotación externa al final, beneficiando la salud del manguito rotador.',
    involvedMuscles: [{ muscle: 'Deltoides Posterior', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Medio', activation: 0.8, role: 'secondary' }],
    subMuscleGroup: 'Deltoides Posterior', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_039', name: 'Encogimiento de hombros con mancuernas inclinado', description: 'Realizado boca abajo en un banco inclinado, este ejercicio aísla el trapecio medio e inferior.',
    involvedMuscles: [{ muscle: 'Trapecio Medio', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Inferior', activation: 0.8, role: 'secondary' }],
    subMuscleGroup: 'Trapecio', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_040', name: 'Extensión de Espalda en Balón Suizo', description: 'Una versión de hiperextensión que desafía la estabilidad del core.',
    involvedMuscles: [{ muscle: 'Erectores Espinales', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.6, role: 'secondary' }],
    subMuscleGroup: 'Erectores Espinales', category: 'Resistencia', type: 'Accesorio', equipment: 'Otro', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_back_041', name: 'Elevaciones Y-T-W-L', description: 'Serie de movimientos con peso ligero o corporal para activar y fortalecer los músculos estabilizadores de la escápula.',
    involvedMuscles: [{ muscle: 'Trapecio Inferior', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Medio', activation: 0.8, role: 'secondary' }, { muscle: 'Deltoides Posterior', activation: 0.7, role: 'secondary' }],
    subMuscleGroup: 'Trapecio', category: 'Movilidad', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_042', name: 'Puente de Glúteos con Banda', description: 'Ejercicio de activación para los glúteos que también trabaja los abductores gracias a la banda.',
    involvedMuscles: [{ muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Medio', activation: 0.7, role: 'secondary' }],
    subMuscleGroup: 'Glúteos', category: 'Resistencia', type: 'Aislamiento', equipment: 'Banda', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_back_043', name: 'Remo con Banda a una Mano', description: 'Versión unilateral del remo con banda, ideal para trabajar la estabilidad del core.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }, { muscle: 'Oblicuos', activation: 0.5, role: 'stabilizer' }],
    subMuscleGroup: 'Dorsales', category: 'Resistencia', type: 'Accesorio', equipment: 'Banda', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_044', name: 'Caminata del Monstruo (Monster Walk)', description: 'Caminar lateralmente con una banda en las rodillas o tobillos para fortalecer el glúteo medio.',
    involvedMuscles: [{ muscle: 'Glúteo Medio', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Glúteos', category: 'Resistencia', type: 'Aislamiento', equipment: 'Banda', force: 'Otro', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_back_045', name: 'Bird Dog', description: 'Ejercicio de estabilidad del core que fortalece los erectores espinales y mejora la coordinación.',
    involvedMuscles: [{ muscle: 'Erectores Espinales', activation: 1.0, role: 'stabilizer' }, { muscle: 'Glúteo Mayor', activation: 0.7, role: 'primary' }, { muscle: 'Transverso Abdominal', activation: 0.8, role: 'stabilizer' }],
    subMuscleGroup: 'Erectores Espinales', category: 'Movilidad', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Otro', bodyPart: 'full', chain: 'posterior'
  },
  {
    id: 'db_back_046', name: 'Peso Muerto con Piernas Rígidas (Stiff-Leg)', description: 'Variante de peso muerto que se enfoca casi exclusivamente en los isquiotibiales y la espalda baja, con muy poca flexión de rodilla.',
    involvedMuscles: [{ muscle: 'Isquiosurales', activation: 1.0, role: 'primary' }, { muscle: 'Erectores Espinales', activation: 0.9, role: 'secondary' }],
    subMuscleGroup: 'Isquiosurales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Barra', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior'
  },
  {
    id: 'db_back_047', name: 'Remo en Máquina Sentado (Agarre Ancho)', description: 'Enfoca el trabajo en la parte alta de la espalda, romboides y deltoides posterior.',
    involvedMuscles: [{ muscle: 'Romboides', activation: 1.0, role: 'primary' }, { muscle: 'Trapecio Medio', activation: 0.9, role: 'secondary' }, { muscle: 'Deltoides Posterior', activation: 0.8, role: 'secondary' }],
    subMuscleGroup: 'Romboides', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Máquina', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_048', name: 'Jalón Dorsal en Máquina', description: 'Una máquina que simula el movimiento de las dominadas con la estabilidad de tener el pecho apoyado.',
    involvedMuscles: [{ muscle: 'Dorsal Ancho', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Dorsales', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Máquina', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_049', name: 'Dominada escapular', description: 'Movimiento de rango corto que aísla la retracción y depresión escapular, fundamental para una buena técnica de dominada.',
    involvedMuscles: [{ muscle: 'Trapecio Inferior', activation: 1.0, role: 'primary' }, { muscle: 'Romboides', activation: 0.8, role: 'secondary' }],
    subMuscleGroup: 'Trapecio', category: 'Movilidad', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_050', name: 'Kelso Shrug', description: 'Encogimiento de hombros realizado con el torso inclinado, enfocando el trabajo en el trapecio medio.',
    involvedMuscles: [{ muscle: 'Trapecio Medio', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Trapecio', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_back_051', name: 'Extensión de espalda en banco a 45 grados', description: 'Una variante de hiperextensiones que permite un gran enfoque en los glúteos si se redondea ligeramente la espalda alta.',
    involvedMuscles: [{ muscle: 'Glúteo Mayor', activation: 1.0, role: 'primary' }, { muscle: 'Isquiosurales', activation: 0.7, role: 'secondary' }, { muscle: 'Erectores Espinales', activation: 0.5, role: 'stabilizer' }],
    subMuscleGroup: 'Glúteos', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Máquina', force: 'Bisagra', bodyPart: 'lower', chain: 'posterior'
  },

  // --- NUEVOS EJERCICIOS DE HOMBROS ---
  {
    id: 'db_shoulder_001', name: 'Press Vikingo (Viking Press)', description: 'Press por encima de la cabeza usando una máquina específica con agarres neutros, lo que es más amigable para los hombros.',
    involvedMuscles: [{ muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Lateral', activation: 0.6, role: 'secondary' }, { muscle: 'Tríceps', activation: 0.8, role: 'secondary' }],
    subMuscleGroup: 'Deltoides Anterior', category: 'Fuerza', type: 'Básico', equipment: 'Máquina', force: 'Empuje', bodyPart: 'upper', chain: 'anterior'
  },
  {
    id: 'db_shoulder_002', name: 'Press de Hombros en Máquina (Agarre Neutro)', description: 'Versión en máquina del press de hombros que reduce el estrés en la articulación.',
    involvedMuscles: [{ muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Lateral', activation: 0.5, role: 'secondary' }, { muscle: 'Tríceps', activation: 0.7, role: 'secondary' }],
    subMuscleGroup: 'Deltoides Anterior', category: 'Hipertrofia', type: 'Accesorio', equipment: 'Máquina', force: 'Empuje', bodyPart: 'upper', chain: 'anterior'
  },
  {
    id: 'db_shoulder_003', name: 'Elevaciones Laterales Sentado', description: 'Elimina cualquier impulso de las piernas, aislando de forma más estricta el deltoides lateral.',
    involvedMuscles: [{ muscle: 'Deltoides Lateral', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Deltoides Lateral', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'full'
  },
  {
    id: 'db_shoulder_004', name: 'Elevaciones Laterales en Polea (desde atrás)', description: 'Una variante donde el cable pasa por detrás del cuerpo, cambiando la curva de resistencia y el estiramiento inicial.',
    involvedMuscles: [{ muscle: 'Deltoides Lateral', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Deltoides Lateral', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Tirón', bodyPart: 'upper', chain: 'full'
  },
  {
    id: 'db_shoulder_005', name: 'Elevaciones Frontales con Mancuerna', description: 'Aísla la cabeza anterior del deltoides. A menudo sobreentrenada, pero útil en ciertos contextos.',
    involvedMuscles: [{ muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Deltoides Anterior', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Empuje', bodyPart: 'upper', chain: 'anterior'
  },
  {
    id: 'db_shoulder_006', name: 'Elevaciones Frontales con Polea', description: 'Proporciona tensión constante al deltoides anterior, a diferencia de las mancuernas.',
    involvedMuscles: [{ muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Deltoides Anterior', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Empuje', bodyPart: 'upper', chain: 'anterior'
  },
  {
    id: 'db_shoulder_007', name: 'Elevaciones Frontales con Disco', description: 'Una variante de elevación frontal usando un disco, que también desafía el agarre.',
    involvedMuscles: [{ muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' }, { muscle: 'Antebrazo', activation: 0.3, role: 'stabilizer' }],
    subMuscleGroup: 'Deltoides Anterior', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Otro', force: 'Empuje', bodyPart: 'upper', chain: 'anterior'
  },
  {
    id: 'db_shoulder_008', name: 'Pájaros Inclinado con Apoyo en Pecho', description: 'Elimina la tensión en la espalda baja y permite un aislamiento más estricto del deltoides posterior.',
    involvedMuscles: [{ muscle: 'Deltoides Posterior', activation: 1.0, role: 'primary' }, { muscle: 'Romboides', activation: 0.4, role: 'secondary' }],
    subMuscleGroup: 'Deltoides Posterior', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_shoulder_009', name: 'Pike Push-up', description: 'Flexión con las caderas elevadas, simulando un press vertical para trabajar los hombros con el peso corporal.',
    involvedMuscles: [{ muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' }, { muscle: 'Tríceps', activation: 0.7, role: 'secondary' }],
    subMuscleGroup: 'Deltoides Anterior', category: 'Fuerza', type: 'Básico', equipment: 'Peso Corporal', force: 'Empuje', bodyPart: 'upper', chain: 'anterior'
  },
  {
    id: 'db_shoulder_010', name: 'Handstand Push-up (HSPU)', description: 'Ejercicio de calistenia avanzado que consiste en hacer una flexión mientras se está en posición de pino.',
    involvedMuscles: [{ muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' }, { muscle: 'Tríceps', activation: 0.8, role: 'secondary' }, { muscle: 'Trapecio', activation: 0.6, role: 'secondary' }],
    subMuscleGroup: 'Deltoides Anterior', category: 'Fuerza', type: 'Básico', equipment: 'Peso Corporal', force: 'Empuje', bodyPart: 'upper', chain: 'anterior'
  },
  {
    id: 'db_shoulder_011', name: 'Press Cubano (Cuban Press)', description: 'Combinación de remo al mentón, rotación externa y press. Excelente para la salud del manguito rotador y el deltoides.',
    involvedMuscles: [{ muscle: 'Deltoides Lateral', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Posterior', activation: 0.8, role: 'secondary' }],
    subMuscleGroup: 'Deltoides Lateral', category: 'Movilidad', type: 'Accesorio', equipment: 'Mancuerna', force: 'Otro', bodyPart: 'upper', chain: 'full'
  },
  {
    id: 'db_shoulder_012', name: 'Press Trasnuca (Behind the Neck Press)', description: 'Press militar realizado con la barra detrás del cuello. Requiere una excelente movilidad y conlleva un alto riesgo.',
    involvedMuscles: [{ muscle: 'Deltoides Lateral', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Posterior', activation: 0.7, role: 'secondary' }, { muscle: 'Tríceps', activation: 0.6, role: 'secondary' }],
    subMuscleGroup: 'Deltoides Lateral', category: 'Fuerza', type: 'Básico', equipment: 'Barra', force: 'Empuje', bodyPart: 'upper', chain: 'full',
    injuryRisk: { level: 9, details: 'Alto riesgo de pinzamiento de hombro y lesiones cervicales.' }
  },
  {
    id: 'db_shoulder_013', name: 'Elevaciones Laterales Egipcias (Egyptian Lateral Raise)', description: 'Elevación lateral unilateral con el torso inclinado hacia el lado opuesto, aumentando el rango y la tensión.',
    involvedMuscles: [{ muscle: 'Deltoides Lateral', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Deltoides Lateral', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Tirón', bodyPart: 'upper', chain: 'full'
  },
  {
    id: 'db_shoulder_014', name: 'Press Landmine a una Mano (Arrodillado)', description: 'Versión arrodillada del press landmine que aumenta la demanda de estabilidad del core.',
    involvedMuscles: [{ muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' }, { muscle: 'Oblicuos', activation: 0.8, role: 'stabilizer' }],
    subMuscleGroup: 'Deltoides Anterior', category: 'Fuerza', type: 'Accesorio', equipment: 'Barra', force: 'Empuje', bodyPart: 'upper', chain: 'anterior'
  },
  {
    id: 'db_shoulder_015', name: 'Rotación Externa con Banda', description: 'Ejercicio clave para fortalecer el manguito rotador, crucial para la salud del hombro.',
    involvedMuscles: [{ muscle: 'Deltoides Posterior', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Deltoides Posterior', category: 'Movilidad', type: 'Aislamiento', equipment: 'Banda', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_shoulder_016', name: 'Press de Hombros con Kettlebell (Bottoms-Up)', description: 'Sostener la kettlebell al revés desafía enormemente la estabilidad del hombro y el antebrazo.',
    involvedMuscles: [{ muscle: 'Deltoides', activation: 1.0, role: 'primary' }, { muscle: 'Antebrazo', activation: 0.9, role: 'stabilizer' }],
    subMuscleGroup: 'Deltoides', category: 'Fuerza', type: 'Accesorio', equipment: 'Kettlebell', force: 'Empuje', bodyPart: 'upper', chain: 'anterior'
  },
  {
    id: 'db_shoulder_017', name: 'Elevaciones en Y (Y-Raises)', description: 'Ejercicio para el trapecio inferior y los estabilizadores del hombro, realizado inclinado hacia adelante.',
    involvedMuscles: [{ muscle: 'Trapecio Inferior', activation: 1.0, role: 'primary' }, { muscle: 'Deltoides Lateral', activation: 0.7, role: 'secondary' }],
    subMuscleGroup: 'Trapecio', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Mancuerna', force: 'Tirón', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_shoulder_018', name: 'Encogimientos por encima de la cabeza (Overhead Shrugs)', description: 'Sostener la barra sobre la cabeza y encoger los hombros para fortalecer el trapecio y la estabilidad superior.',
    involvedMuscles: [{ muscle: 'Trapecio Superior', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Trapecio', category: 'Fuerza', type: 'Accesorio', equipment: 'Barra', force: 'Otro', bodyPart: 'upper', chain: 'posterior'
  },
  {
    id: 'db_shoulder_019', name: 'Press de Hombro Unilateral con Mancuerna', description: 'Trabaja un hombro a la vez, lo que exige una mayor estabilización del core, especialmente de los oblicuos.',
    involvedMuscles: [{ muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' }, { muscle: 'Oblicuos', activation: 0.8, role: 'stabilizer' }],
    subMuscleGroup: 'Deltoides Anterior', category: 'Fuerza', type: 'Accesorio', equipment: 'Mancuerna', force: 'Empuje', bodyPart: 'upper', chain: 'anterior'
  },
  {
    id: 'db_shoulder_020', name: 'Elevaciones Frontales con Cuerda', description: 'Variante de elevación frontal que permite un agarre neutro, pudiendo ser más cómodo para las muñecas.',
    involvedMuscles: [{ muscle: 'Deltoides Anterior', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Deltoides Anterior', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Polea', force: 'Empuje', bodyPart: 'upper', chain: 'anterior'
  },

  // --- NUEVOS EJERCICIOS DE ABDOMEN ---
  {
    id: 'db_abs_001', name: 'Crunch Inverso', description: 'Eleva las caderas en lugar del torso para enfocar el trabajo en la parte inferior del recto abdominal.',
    involvedMuscles: [{ muscle: 'Recto Abdominal', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Abdomen', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Otro', bodyPart: 'lower', chain: 'anterior'
  },
  {
    id: 'db_abs_002', name: 'Toques al Talón (Heel Taps)', description: 'Ejercicio para los oblicuos que implica inclinar el torso de lado a lado en posición de crunch.',
    involvedMuscles: [{ muscle: 'Oblicuos', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Oblicuos', category: 'Resistencia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Otro', bodyPart: 'full', chain: 'full'
  },
  {
    id: 'db_abs_003', name: 'Bicho Muerto con Banda (Banded Dead Bug)', description: 'Añade resistencia de una banda al dead bug para aumentar la activación del core.',
    involvedMuscles: [{ muscle: 'Transverso Abdominal', activation: 1.0, role: 'primary' }, { muscle: 'Oblicuos', activation: 0.8, role: 'stabilizer' }],
    subMuscleGroup: 'Abdomen', category: 'Fuerza', type: 'Aislamiento', equipment: 'Banda', force: 'Anti-Rotación', bodyPart: 'full', chain: 'anterior'
  },
  {
    id: 'db_abs_004', name: 'Plancha con Elevación de Pierna', description: 'Aumenta la dificultad de la plancha al reducir la base de apoyo, desafiando la estabilidad anti-rotación.',
    involvedMuscles: [{ muscle: 'Transverso Abdominal', activation: 1.0, role: 'primary' }, { muscle: 'Glúteo Mayor', activation: 0.6, role: 'secondary' }],
    subMuscleGroup: 'Abdomen', category: 'Resistencia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Anti-Rotación', bodyPart: 'full', chain: 'anterior'
  },
  {
    id: 'db_abs_005', name: 'Plancha Lateral con Rotación', description: 'Añade un componente de rotación torácica a la plancha lateral, trabajando los oblicuos de forma dinámica.',
    involvedMuscles: [{ muscle: 'Oblicuos', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Oblicuos', category: 'Resistencia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Rotación', bodyPart: 'full', chain: 'full'
  },
  {
    id: 'db_abs_006', name: 'V-Ups', description: 'Ejercicio avanzado que combina un crunch y una elevación de piernas para trabajar todo el recto abdominal.',
    involvedMuscles: [{ muscle: 'Recto Abdominal', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Abdomen', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Otro', bodyPart: 'full', chain: 'anterior'
  },
  {
    id: 'db_abs_007', name: 'Limpiaparabrisas (Windshield Wipers)', description: 'Ejercicio avanzado de rotación y anti-rotación, colgado de una barra.',
    involvedMuscles: [{ muscle: 'Oblicuos', activation: 1.0, role: 'primary' }, { muscle: 'Recto Abdominal', activation: 0.8, role: 'secondary' }],
    subMuscleGroup: 'Oblicuos', category: 'Fuerza', type: 'Accesorio', equipment: 'Peso Corporal', force: 'Rotación', bodyPart: 'full', chain: 'full'
  },
  {
    id: 'db_abs_008', name: 'Sit-up en GHD', description: 'Sit-up con un rango de movimiento extremo que proporciona un gran estiramiento y contracción abdominal.',
    involvedMuscles: [{ muscle: 'Recto Abdominal', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Abdomen', category: 'Fuerza', type: 'Accesorio', equipment: 'Máquina', force: 'Otro', bodyPart: 'full', chain: 'anterior',
    injuryRisk: { level: 7, details: 'Puede ser muy estresante para la columna lumbar si no se controla.' }
  },
  {
    id: 'db_abs_009', name: 'Leñador Inverso (Reverse Wood Chop)', description: 'Movimiento de rotación desde una posición baja a una alta, trabajando los oblicuos y la potencia rotacional.',
    involvedMuscles: [{ muscle: 'Oblicuos', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Oblicuos', category: 'Potencia', type: 'Aislamiento', equipment: 'Polea', force: 'Rotación', bodyPart: 'full', chain: 'full'
  },
  {
    id: 'db_abs_010', name: 'Stir the Pot', description: 'Plancha sobre un balón suizo mientras se realizan círculos con los antebrazos. Un ejercicio de anti-extensión extremadamente desafiante.',
    involvedMuscles: [{ muscle: 'Transverso Abdominal', activation: 1.0, role: 'primary' }, { muscle: 'Recto Abdominal', activation: 0.9, role: 'stabilizer' }, { muscle: 'Oblicuos', activation: 0.8, role: 'stabilizer' }],
    subMuscleGroup: 'Abdomen', category: 'Fuerza', type: 'Aislamiento', equipment: 'Otro', force: 'Anti-Rotación', bodyPart: 'full', chain: 'anterior'
  },
  {
    id: 'db_abs_011', name: 'Escaladores (Mountain Climbers)', description: 'Ejercicio dinámico en posición de plancha que eleva el ritmo cardíaco y trabaja el core.',
    involvedMuscles: [{ muscle: 'Recto Abdominal', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Abdomen', category: 'Resistencia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Otro', bodyPart: 'full', chain: 'anterior'
  },
  {
    id: 'db_abs_012', name: 'Crunch con Bicicleta', description: 'Ejercicio clásico que combina la flexión de columna con la rotación, trabajando recto abdominal y oblicuos.',
    involvedMuscles: [{ muscle: 'Oblicuos', activation: 1.0, role: 'primary' }, { muscle: 'Recto Abdominal', activation: 0.8, role: 'secondary' }],
    subMuscleGroup: 'Oblicuos', category: 'Resistencia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Rotación', bodyPart: 'full', chain: 'full'
  },
  {
    id: 'db_abs_013', name: 'Elevación de Rodillas al Pecho (en paralelas)', description: 'Una versión más sencilla de las elevaciones de piernas colgado, enfocada en la parte inferior del abdomen.',
    involvedMuscles: [{ muscle: 'Recto Abdominal', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Abdomen', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Otro', bodyPart: 'lower', chain: 'anterior'
  },
  {
    id: 'db_abs_014', name: 'Plancha Copenhague (Copenhagen Plank)', description: 'Plancha lateral avanzada que se enfoca intensamente en los aductores y los oblicuos.',
    involvedMuscles: [{ muscle: 'Aductores', activation: 1.0, role: 'primary' }, { muscle: 'Oblicuos', activation: 0.9, role: 'stabilizer' }],
    subMuscleGroup: 'Oblicuos', category: 'Fuerza', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Otro', bodyPart: 'full', chain: 'full'
  },
  {
    id: 'db_abs_015', name: 'Bodysaw', description: 'Plancha sobre los antebrazos que implica deslizarse hacia adelante y hacia atrás, desafiando la capacidad anti-extensión del core.',
    involvedMuscles: [{ muscle: 'Recto Abdominal', activation: 1.0, role: 'primary' }, { muscle: 'Transverso Abdominal', activation: 0.9, role: 'stabilizer' }],
    subMuscleGroup: 'Abdomen', category: 'Fuerza', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Anti-Rotación', bodyPart: 'full', chain: 'anterior'
  },
  {
    id: 'db_abs_016', name: 'Landmine 180s (Landmine Twists)', description: 'Ejercicio de rotación con la barra anclada que trabaja los oblicuos de forma dinámica y potente.',
    involvedMuscles: [{ muscle: 'Oblicuos', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Oblicuos', category: 'Potencia', type: 'Accesorio', equipment: 'Barra', force: 'Rotación', bodyPart: 'full', chain: 'full'
  },
  {
    id: 'db_abs_017', name: 'Crunch en Balón Suizo', description: 'Aumenta el rango de movimiento del crunch tradicional, permitiendo un mayor estiramiento abdominal.',
    involvedMuscles: [{ muscle: 'Recto Abdominal', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Abdomen', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Otro', force: 'Otro', bodyPart: 'upper', chain: 'anterior'
  },
  {
    id: 'db_abs_018', name: 'Elevaciones de Piernas en Banco Declinado', description: 'Aumenta la dificultad de las elevaciones de piernas al usar la gravedad en contra.',
    involvedMuscles: [{ muscle: 'Recto Abdominal', activation: 1.0, role: 'primary' }],
    subMuscleGroup: 'Abdomen', category: 'Hipertrofia', type: 'Aislamiento', equipment: 'Otro', force: 'Otro', bodyPart: 'lower', chain: 'anterior'
  },
  {
    id: 'db_abs_019', name: 'Toes to Bar (T2B)', description: 'Ejercicio avanzado de gimnasia que consiste en, colgado de una barra, llevar las puntas de los pies hasta tocarla.',
    involvedMuscles: [{ muscle: 'Recto Abdominal', activation: 1.0, role: 'primary' }, { muscle: 'Dorsal Ancho', activation: 0.6, role: 'secondary' }],
    subMuscleGroup: 'Abdomen', category: 'Fuerza', type: 'Básico', equipment: 'Peso Corporal', force: 'Otro', bodyPart: 'full', chain: 'anterior'
  },
  {
    id: 'db_abs_020', name: 'Plancha con Toque de Hombro', description: 'Plancha en la que se toca alternadamente el hombro opuesto, desafiando la estabilidad anti-rotación.',
    involvedMuscles: [{ muscle: 'Transverso Abdominal', activation: 1.0, role: 'primary' }, { muscle: 'Oblicuos', activation: 0.8, role: 'stabilizer' }],
    subMuscleGroup: 'Abdomen', category: 'Resistencia', type: 'Aislamiento', equipment: 'Peso Corporal', force: 'Anti-Rotación', bodyPart: 'full', chain: 'anterior'
  },
];
