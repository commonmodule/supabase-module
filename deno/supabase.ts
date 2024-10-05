import { createClient } from "https://esm.sh/@supabase/supabase-js@2.31.0";
import {
  PostgrestBuilder,
  PostgrestFilterBuilder,
  PostgrestQueryBuilder,
} from "https://esm.sh/v135/@supabase/postgrest-js@1.9.0/dist/module/index.js";

const supabase = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
);

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
  ) => PostgrestFilterBuilder<any, any, any, unknown>,
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
