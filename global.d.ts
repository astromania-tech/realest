declare const Deno: {
  env: {
    get(key: string): string | undefined;
  };
  serve(handler: (request: Request) => Promise<Response>): void;
};

declare module "npm:@supabase/supabase-js@2" {
  export function createClient(...args: unknown[]): {
    rpc<T = unknown>(...rpcArgs: unknown[]): Promise<{ data: T | null; error: Error | null }>;
  };
}

/** Next/webpack/turbopack side-effect CSS imports (e.g. app/layout.tsx). */
declare module "*.css";
