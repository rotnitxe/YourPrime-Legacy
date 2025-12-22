
/**
 * Abstracción para una cola de tareas.
 * En producción, esto conectaría con Redis/BullMQ, Inngest o QStash.
 * Para este MVP, simulamos el desacoplamiento.
 */

type JobType = 'ANALYZE_WORKOUT' | 'SEND_EMAIL' | 'GENERATE_PDF';

interface JobPayload {
    [key: string]: any;
}

export const queueJob = async (type: JobType, payload: JobPayload) => {
    // Simulación de "Fire and Forget"
    // En Next.js (Vercel), usaríamos `waitUntil` o una llamada a una API Route asíncrona.
    
    const processJob = async () => {
        try {
            console.log(`[Queue] Processing job: ${type}`, payload);
            
            // Simular latencia de procesamiento pesado (ej: llamada a Gemini AI)
            if (type === 'ANALYZE_WORKOUT') {
                 // Aquí llamaríamos a aiService.generateSessionScore(payload.logId...)
                 await new Promise(resolve => setTimeout(resolve, 1000));
                 console.log(`[Queue] Job ${type} completed for log ${payload.workoutLogId}`);
            }
        } catch (error) {
            console.error(`[Queue] Job failed: ${type}`, error);
        }
    };

    // No hacemos await para no bloquear la respuesta HTTP al cliente
    // Nota: En entornos Serverless puros, se necesita una cola real externa.
    processJob();
};
