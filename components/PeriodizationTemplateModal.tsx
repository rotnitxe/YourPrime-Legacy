
import React from 'react';
import { Macrocycle, Mesocycle } from '../types';
import Modal from './ui/Modal';
import Card from './ui/Card';
import Button from './ui/Button';

// Example templates
const templates: { name: string; description: string; data: Macrocycle[] }[] = [
    {
        name: 'Periodización Lineal Clásica (16 Semanas)',
        description: 'Un enfoque tradicional donde el volumen disminuye mientras la intensidad aumenta con el tiempo. Ideal para principiantes o para un enfoque de fuerza pura.',
        data: [
            {
                id: crypto.randomUUID(),
                name: 'Macrociclo de Fuerza',
                mesocycles: [
                    { id: crypto.randomUUID(), name: 'Mesociclo 1 (Acumulación)', goal: 'Acumulación', weeks: Array.from({ length: 4 }, (_, i) => ({ id: crypto.randomUUID(), name: `Semana ${i + 1}`, sessions: [] })) },
                    { id: crypto.randomUUID(), name: 'Mesociclo 2 (Intensificación)', goal: 'Intensificación', weeks: Array.from({ length: 4 }, (_, i) => ({ id: crypto.randomUUID(), name: `Semana ${i + 5}`, sessions: [] })) },
                    { id: crypto.randomUUID(), name: 'Mesociclo 3 (Realización)', goal: 'Realización', weeks: Array.from({ length: 3 }, (_, i) => ({ id: crypto.randomUUID(), name: `Semana ${i + 9}`, sessions: [] })) },
                    { id: crypto.randomUUID(), name: 'Mesociclo 4 (Descarga)', goal: 'Descarga', weeks: [{ id: crypto.randomUUID(), name: `Semana 12`, sessions: [] }] },
                ]
            }
        ]
    },
    {
        name: 'Periodización Ondulante (9 Semanas)',
        description: 'Varía el volumen y la intensidad dentro de cada semana (microciclo). Bueno para atletas intermedios para evitar el estancamiento y manejar la fatiga.',
        data: [
             {
                id: crypto.randomUUID(),
                name: 'Macrociclo Ondulante',
                mesocycles: [
                    { id: crypto.randomUUID(), name: 'Bloque Ondulante 1', goal: 'Acumulación', weeks: Array.from({ length: 4 }, (_, i) => ({ id: crypto.randomUUID(), name: `Semana ${i + 1}`, sessions: [] })) },
                    { id: crypto.randomUUID(), name: 'Bloque Ondulante 2', goal: 'Intensificación', weeks: Array.from({ length: 4 }, (_, i) => ({ id: crypto.randomUUID(), name: `Semana ${i + 5}`, sessions: [] })) },
                    { id: crypto.randomUUID(), name: 'Descarga', goal: 'Descarga', weeks: [{ id: crypto.randomUUID(), name: `Semana 9`, sessions: [] }] },
                ]
            }
        ]
    },
     {
        name: 'Bloques de Hipertrofia (12 Semanas)',
        description: 'Estructura enfocada en la ganancia de masa muscular, alternando fases de alto volumen (acumulación) con fases de mayor intensidad.',
        data: [
             {
                id: crypto.randomUUID(),
                name: 'Macrociclo de Hipertrofia',
                mesocycles: [
                    { id: crypto.randomUUID(), name: 'Acumulación 1', goal: 'Acumulación', weeks: Array.from({ length: 4 }, (_, i) => ({ id: crypto.randomUUID(), name: `Semana ${i + 1}`, sessions: [] })) },
                    { id: crypto.randomUUID(), name: 'Intensificación 1', goal: 'Intensificación', weeks: Array.from({ length: 3 }, (_, i) => ({ id: crypto.randomUUID(), name: `Semana ${i + 5}`, sessions: [] })) },
                    { id: crypto.randomUUID(), name: 'Descarga Activa', goal: 'Descarga', weeks: [{ id: crypto.randomUUID(), name: `Semana 8`, sessions: [] }] },
                    { id: crypto.randomUUID(), name: 'Acumulación 2', goal: 'Acumulación', weeks: Array.from({ length: 4 }, (_, i) => ({ id: crypto.randomUUID(), name: `Semana ${i + 9}`, sessions: [] })) },
                ]
            }
        ]
    },
];

interface PeriodizationTemplateModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (template: Macrocycle[]) => void;
}

const PeriodizationTemplateModal: React.FC<PeriodizationTemplateModalProps> = ({ isOpen, onClose, onSelect }) => {
    const handleSelectTemplate = (templateData: Macrocycle[]) => {
        // Deep copy and assign new IDs to avoid reference issues
        const newTemplate = JSON.parse(JSON.stringify(templateData));
        newTemplate.forEach((macro: Macrocycle) => {
            macro.id = crypto.randomUUID();
            macro.mesocycles.forEach((meso: Mesocycle) => {
                meso.id = crypto.randomUUID();
                meso.weeks.forEach(week => {
                    week.id = crypto.randomUUID();
                });
            });
        });
        onSelect(newTemplate);
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Seleccionar Plantilla de Periodización">
            <div className="p-2 space-y-4 max-h-[70vh] overflow-y-auto">
                {templates.map(template => (
                    <Card key={template.name} className="!p-4 hover:border-white/20 transition">
                        <h3 className="text-lg font-bold text-white">{template.name}</h3>
                        <p className="text-sm text-slate-400 mt-1 mb-3">{template.description}</p>
                        <Button onClick={() => handleSelectTemplate(template.data)} className="w-full">
                            Seleccionar esta Plantilla
                        </Button>
                    </Card>
                ))}
            </div>
        </Modal>
    );
};

export default PeriodizationTemplateModal;