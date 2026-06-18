export class ErrorHandler {
  static handle(error, context = "Application") {
    console.error(`[${context}]`, error);
    return {
      success: false,
      error: error.message || "Произошла ошибка",
      context,
    };
  }

  static async handleAsync(promise, context = "Application") {
    try {
      const result = await promise;
      return { success: true, data: result };
    } catch (error) {
      return this.handle(error, context);
    }
  }
}
