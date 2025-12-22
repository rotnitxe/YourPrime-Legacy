import { MuscleHierarchy } from '../types';
export const INITIAL_MUSCLE_HIERARCHY: MuscleHierarchy = {
  bodyPartHierarchy: {
    'Pecho': ['Pectoral'],
    'Espalda': ['Dorsal Ancho', 'Trapecio', 'Erectores Espinales'],
    'Piernas': ['Cuádriceps', 'Isquiosurales', 'Glúteos', 'Pantorrillas']
  },
  specialCategories: { 'Tren Superior': ['Pecho', 'Espalda'], 'Tren Inferior': ['Piernas'] },
  muscleToBodyPart: { 'Pectoral': 'Pecho', 'Dorsal Ancho': 'Espalda', 'Cuádriceps': 'Piernas' }
};