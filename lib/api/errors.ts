
export class AppError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string = 'INTERNAL_ERROR', statusCode: number = 500) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = 'AppError';
    
    // Necesario para que instanceof funcione en TypeScript al extender Error nativo
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export type ActionResponse<T = void> = 
  | { success: true; data: T }
  | { success: false; error: { code: string; message: string; validationErrors?: Record<string, string[]> } };

export const handleActionError = (error: unknown): ActionResponse<never> => {
  console.error("Action Error:", error);

  if (error instanceof AppError) {
    return {
      success: false,
      error: { code: error.code, message: error.message }
    };
  }

  // Manejo genérico para no exponer stack traces
  return {
    success: false,
    error: { code: 'INTERNAL_SERVER_ERROR', message: 'Ha ocurrido un error inesperado. Por favor inténtalo más tarde.' }
  };
};
