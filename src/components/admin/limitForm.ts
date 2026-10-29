// Pure checks for the admin limit form. Kept out of the component so the same numbers
// the dashboard sends are the ones the tests pin down.

export type LimitRow = {
  endpoint: string;
  scope: string;
  max_count: number;
  window_seconds: number;
  saved: boolean;
  updated_at: string | null;
};

export const MAX_COUNT = 100000;
export const MAX_WINDOW_SECONDS = 86400;

const ENDPOINT_NAMES: Record<string, string> = {
  chat: "Website chat",
  lead: "Enquiries & quotes",
  email_preview: "Email previews",
};

const SCOPE_NAMES: Record<string, string> = {
  global: "Everyone, in total",
  session: "One visitor session",
  account: "One signed-in account",
  network: "One network address",
  contact: "One contact number",
};

export const endpointName = (endpoint: string) => ENDPOINT_NAMES[endpoint] ?? endpoint;
export const scopeName = (scope: string) => SCOPE_NAMES[scope] ?? scope;

// Mirrors the server's own acceptance rules: whole numbers, at least 1, never above the
// ceiling the database allows. Returns the message to show, or null when the row is valid.
export function limitRowError(row: { max_count: unknown; window_seconds: unknown }): string | null {
  const count = typeof row.max_count === "number" ? row.max_count : Number(row.max_count);
  const window = typeof row.window_seconds === "number" ? row.window_seconds : Number(row.window_seconds);
  if (!Number.isSafeInteger(count) || count < 1) return "Enter a whole number of requests of at least 1.";
  if (count > MAX_COUNT) return `Requests must be ${MAX_COUNT} or fewer.`;
  if (!Number.isSafeInteger(window) || window < 1) return "Enter a window in whole seconds of at least 1.";
  if (window > MAX_WINDOW_SECONDS) return `The window must be ${MAX_WINDOW_SECONDS} seconds (24 hours) or shorter.`;
  return null;
}

export function rowsHaveErrors(rows: { max_count: unknown; window_seconds: unknown }[]): boolean {
  return rows.some((row) => limitRowError(row) !== null);
}

// Only edited rows are sent, so an untouched row can never be written back by accident.
export function changedRows(before: LimitRow[], after: LimitRow[]): LimitRow[] {
  const original = new Map(before.map((row) => [`${row.endpoint}:${row.scope}`, row]));
  return after.filter((row) => {
    const was = original.get(`${row.endpoint}:${row.scope}`);
    return !was || was.max_count !== row.max_count || was.window_seconds !== row.window_seconds;
  });
}

export function windowLabel(seconds: number): string {
  if (seconds < 60) return `${seconds} sec`;
  if (seconds < 3600) return `${Math.round(seconds / 60)} min`;
  return `${Math.round(seconds / 3600)} hr`;
}
