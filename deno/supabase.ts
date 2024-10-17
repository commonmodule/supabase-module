import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import {
  PostgrestBuilder,
  PostgrestFilterBuilder,
  PostgrestQueryBuilder,
  PostgrestTransformBuilder,
} from "https://esm.sh/v135/@supabase/postgrest-js@1.9.0/dist/module/index.js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

export async function getSignedUser(req: Request) {
  const userSupabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: req.headers.get("Authorization")! } },
    },
  );
  const { data: { user } } = await userSupabase.auth.getUser();
  return user ?? undefined;
}

export async function callDatabaseFunction<T>(
  functionName: string,
  params?: Record<string, any>,
): Promise<T> {
  const { data, error } = await supabase.rpc(functionName, params);
  if (error) throw error;

  // Only apply safeResult if data is an array or object
  if (Array.isArray(data) || (typeof data === "object" && data !== null)) {
    return safeResult<T>(data);
  }

  return data as T;
}

function convertNullToUndefined(obj: any) {
  Object.keys(obj).forEach((key) => {
    if (obj[key] === null) obj[key] = undefined;
    else if (typeof obj[key] === "object" && obj[key] !== null) {
      convertNullToUndefined(obj[key]);
    }
  });
}

function safeResult<T>(data: T): T {
  if (Array.isArray(data)) data.forEach((obj) => convertNullToUndefined(obj));
  else convertNullToUndefined(data);
  return data;
}

export async function safeFetch<T>(
  table: string,
  build: (
    builder: PostgrestQueryBuilder<any, any, unknown>,
  ) => PostgrestFilterBuilder<any, any, any, unknown> | PostgrestBuilder<any>,
) {
  const { data, error } = await build(supabase.from(table));
  if (error) throw error;
  return safeResult<T>(data);
}

export async function safeFetchSingle<T>(
  table: string,
  build: (
    builder: PostgrestQueryBuilder<any, any, unknown>,
  ) => PostgrestTransformBuilder<any, any, any, unknown>,
) {
  const { data, error } = await build(supabase.from(table)).limit(1);
  if (error) throw error;
  return data?.[0] ? safeResult<T>(data[0]) : undefined;
}

export async function safeStore(
  table: string,
  build: (
    builder: PostgrestQueryBuilder<any, any, unknown>,
  ) => PostgrestFilterBuilder<any, any, any, unknown> | PostgrestBuilder<any>,
) {
  const { error } = await build(supabase.from(table));
  if (error) throw error;
}
