// Type declaration for @neondatabase/serverless
declare module '@neondatabase/serverless' {
  export function neon<T = any>(connectionString: string): {
    (strings: TemplateStringsArray, ...values: any[]): Promise<T[]>;
    [key: string]: any;
  };
}

