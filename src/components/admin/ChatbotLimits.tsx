import { useEffect, useMemo, useState } from "react";
import { RefreshCw, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  changedRows,
  endpointName,
  limitRowError,
  rowsHaveErrors,
  scopeName,
  windowLabel,
  type LimitRow,
} from "./limitForm";

type Block = { endpoint: string; scope: string; day: string; blocks: number };
type Payload = { limits: LimitRow[]; blocks: Block[] };

// The settings table is service-role only, so every read and write goes through the
// manage-limits function; the browser never touches the ceiling rows itself.
async function callLimits(body?: unknown): Promise<{ data: Payload | null; message: string }> {
  // invoke() defaults to POST, so the read has to ask for GET explicitly.
  const { data, error } = await supabase.functions.invoke(
    "manage-limits",
    body ? { method: "POST", body } : { method: "GET" },
  );
  if (error) {
    let message = "Unable to reach the settings service. Please try again.";
    try {
      const context = (error as { context?: Response }).context;
      if (context) message = (await context.json()).error ?? message;
    } catch {
      // Keep the generic message when the failure body is unreadable.
    }
    return { data: null, message };
  }
  return { data: data as Payload, message: "" };
}

export default function ChatbotLimits() {
  const [rows, setRows] = useState<LimitRow[]>([]);
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    setLoading(true); setError(""); setNotice("");
    const { data, message } = await callLimits();
    if (data) {
      setRows(data.limits ?? []);
      setBlocks(data.blocks ?? []);
      setDrafts({});
    } else setError(message);
    setLoading(false);
  };
  useEffect(() => { void load(); }, []);

  const draft = (row: LimitRow, field: "max_count" | "window_seconds") =>
    drafts[`${row.endpoint}:${row.scope}:${field}`] ?? String(row[field]);
  const setDraft = (row: LimitRow, field: "max_count" | "window_seconds", value: string) =>
    setDrafts((d) => ({ ...d, [`${row.endpoint}:${row.scope}:${field}`]: value }));

  // Numbers as typed, used only for validation and for deciding what to send.
  const typed = useMemo(() => rows.map((row) => ({
    ...row,
    max_count: Number(draft(row, "max_count")),
    window_seconds: Number(draft(row, "window_seconds")),
  })), [rows, drafts]); // eslint-disable-line react-hooks/exhaustive-deps

  const blocked = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const b of blocks) totals[`${b.endpoint}:${b.scope}`] = (totals[`${b.endpoint}:${b.scope}`] ?? 0) + b.blocks;
    return totals;
  }, [blocks]);

  const endpoints = useMemo(() => [...new Set(rows.map((row) => row.endpoint))], [rows]);
  const edited = changedRows(rows, typed);
  const invalid = rowsHaveErrors(typed);

  const save = async () => {
    if (invalid || edited.length === 0) return;
    setSaving(true); setError(""); setNotice("");
    const { data, message } = await callLimits({ limits: edited.map(({ endpoint, scope, max_count, window_seconds }) => ({ endpoint, scope, max_count, window_seconds })) });
    setSaving(false);
    if (data) {
      setRows(data.limits ?? []);
      setDrafts({});
      setNotice(`Saved. The new ceilings apply within about 15 seconds.`);
    } else setError(message);
  };

  return (
    <section className="py-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">Chatbot &amp; enquiry limits</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            These ceilings decide how much traffic the website chatbot, enquiry forms and email previews accept before
            visitors are asked to wait. Raise them to admit more people, lower them to hold spend down. Only saved rows
            override the built-in values, and every change is recorded with your team account.
          </p>
        </div>
        <Button variant="outline" size="icon" aria-label="Refresh limits" title="Refresh limits" disabled={loading} onClick={load}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {loading && <p className="py-8 text-muted-foreground">Loading limits…</p>}
      {error && <p role="alert" className="mb-4 text-sm text-destructive">{error}</p>}
      {notice && <p className="mb-4 text-sm text-primary">{notice}</p>}

      {!loading && endpoints.map((endpoint) => (
        <div key={endpoint} className="mb-8 overflow-x-auto rounded-xl border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border p-4">
            <h3 className="font-semibold">{endpointName(endpoint)}</h3>
            <span className="text-xs text-muted-foreground">Requests per window before a visitor is asked to wait</span>
          </div>
          <table className="w-full text-sm">
            <thead className="text-left text-muted-foreground border-b border-border">
              <tr>
                {["Applies to", "Max requests", "Window (seconds)", "Window", "Source", "Last changed", "Throttled (7 days)"].map((h) => <th key={h} className="p-3 font-medium">{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.filter((row) => row.endpoint === endpoint).map((row) => {
                const key = `${row.endpoint}:${row.scope}`;
                const rowError = limitRowError(typed.find((t) => `${t.endpoint}:${t.scope}` === key) ?? row);
                return (
                  <tr key={key} className="border-b border-border/50 align-top">
                    <td className="p-3">{scopeName(row.scope)}</td>
                    <td className="p-3">
                      <Input
                        type="number" min={1} max={100000} step={1} inputMode="numeric"
                        className="h-8 w-28"
                        aria-label={`Maximum requests per window for ${endpointName(row.endpoint)} ${scopeName(row.scope)}`}
                        value={draft(row, "max_count")}
                        onChange={(e) => setDraft(row, "max_count", e.target.value)}
                      />
                    </td>
                    <td className="p-3">
                      <Input
                        type="number" min={1} max={86400} step={1} inputMode="numeric"
                        className="h-8 w-28"
                        aria-label={`Window in seconds for ${endpointName(row.endpoint)} ${scopeName(row.scope)}`}
                        value={draft(row, "window_seconds")}
                        onChange={(e) => setDraft(row, "window_seconds", e.target.value)}
                      />
                    </td>
                    <td className="p-3 text-muted-foreground">{windowLabel(row.window_seconds)}</td>
                    <td className="p-3">
                      <Badge variant={row.saved ? "default" : "secondary"}>{row.saved ? "Saved" : "Built-in"}</Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground">{row.updated_at ? new Date(row.updated_at).toLocaleString() : "—"}</td>
                    <td className="p-3">{blocked[key] ? <span className="font-semibold">{blocked[key]}</span> : <span className="text-muted-foreground">0</span>}</td>
                    {rowError && <td className="hidden" aria-hidden />}
                  </tr>
                );
              })}
            </tbody>
          </table>
          {rows.filter((row) => row.endpoint === endpoint).some((row) => limitRowError(typed.find((t) => `${t.endpoint}:${t.scope}` === `${row.endpoint}:${row.scope}`) ?? row)) && (
            <p role="alert" className="border-t border-border p-3 text-sm text-destructive">
              {limitRowError(typed.find((t) => limitRowError(t) !== null) ?? rows[0])}
            </p>
          )}
        </div>
      ))}

      {!loading && (
        <div className="flex flex-wrap items-center gap-3">
          <Button onClick={save} disabled={saving || invalid || edited.length === 0}>
            <Save className="mr-2 h-4 w-4" />{saving ? "Saving…" : `Save ${edited.length || ""} change${edited.length === 1 ? "" : "s"}`}
          </Button>
          {edited.length === 0 && !invalid && <span className="text-sm text-muted-foreground">No changes to save.</span>}
          {invalid && <span role="alert" className="text-sm text-destructive">Fix the highlighted rows before saving.</span>}
        </div>
      )}
    </section>
  );
}
