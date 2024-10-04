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
  tableName: string,
  build: (
    builder: PostgrestQueryBuilder<any, any, unknown>,
  ) => PostgrestFilterBuilder<any, any, any, unknown> | PostgrestBuilder<any>,
) {
  const { data, error } = await build(supabase.from(tableName));
  if (error) throw error;
  return safeResult<T>(data);
}

export async function safeInsert<T>(
  tableName: string,
  data: T,
): Promise<void> {
  const { error } = await supabase.from(tableName).insert(data);
  if (error) throw error;
}
