"use client";

// Camada de dados unificada: os ecrãs usam useAppData() e as mesmas
// mutações funcionam em modo demonstração (localStorage) e em modo real
// (Supabase). Em modo real, os dados são carregados uma vez por sessão
// e recarregados após cada escrita.

import { useCallback, useEffect, useSyncExternalStore } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  type DemoData,
  type DemoQuoteItem,
  type ItemKind,
  type Profile,
  type QuoteStatus,
  type RequestStatus,
} from "@/lib/demo/data";
import { newId, useDemo } from "@/lib/demo/store";

// ---------- Estado partilhado do modo real ----------

interface RealState {
  ready: boolean;
  data: DemoData | null;
}

const SERVER_STATE: RealState = { ready: false, data: null };
let realState: RealState = SERVER_STATE;
let loading = false;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((l) => l());
}

// ---------- Linhas da base de dados ----------

interface ProfileRow {
  id: string;
  email: string | null;
  full_name: string | null;
  business_name: string | null;
  phone: string | null;
  trade: string;
  address: string | null;
  nif: string | null;
  is_admin: boolean;
  account_status: string;
  paused_reason: string | null;
}

interface ClientRow {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  created_at: string;
}

interface RequestRow {
  id: string;
  client_id: string | null;
  client_name: string;
  client_phone: string | null;
  description: string;
  status: RequestStatus;
  photo_paths: string[] | null;
  rating: number | null;
  created_at: string;
}

interface QuoteItemRow {
  id: string;
  kind: ItemKind;
  description: string;
  quantity: number | string;
  unit: string;
  unit_price: number | string;
  position: number;
}

interface QuoteRow {
  id: string;
  request_id: string | null;
  client_id: string | null;
  reference: string;
  status: QuoteStatus;
  sent_at: string | null;
  paid_at: string | null;
  created_at: string;
  quote_items: QuoteItemRow[];
}

export function mapProfile(row: ProfileRow): Profile {
  return {
    id: row.id,
    email: row.email ?? undefined,
    fullName: row.full_name ?? undefined,
    businessName: row.business_name ?? undefined,
    phone: row.phone ?? undefined,
    trade: row.trade,
    address: row.address ?? undefined,
    nif: row.nif ?? undefined,
    isAdmin: row.is_admin,
    accountStatus: row.account_status === "pausada" ? "pausada" : "ativa",
    pausedReason: row.paused_reason ?? undefined,
  };
}

async function loadAll(): Promise<void> {
  const sb = createClient();
  const {
    data: { user },
  } = await sb.auth.getUser();

  if (!user) {
    realState = { ready: true, data: null };
    emit();
    return;
  }

  const [prof, clients, requests, quotes] = await Promise.all([
    sb.from("profiles").select("*").eq("id", user.id).single(),
    sb.from("clients").select("*").order("name"),
    sb.from("requests").select("*").order("created_at", { ascending: false }),
    sb
      .from("quotes")
      .select("*, quote_items(*)")
      .order("created_at", { ascending: false }),
  ]);

  const clientRows = (clients.data ?? []) as ClientRow[];
  const requestRows = (requests.data ?? []) as RequestRow[];
  const quoteRows = (quotes.data ?? []) as QuoteRow[];
  const clientName = new Map(clientRows.map((c) => [c.id, c.name]));
  const requestName = new Map(
    requestRows.map((r) => [r.id, r.client_name])
  );

  const data: DemoData = {
    profile: prof.data
      ? mapProfile(prof.data as ProfileRow)
      : { trade: "carpintaria", isAdmin: false, accountStatus: "ativa" },
    clients: clientRows.map((c) => ({
      id: c.id,
      name: c.name,
      phone: c.phone ?? "",
      address: c.address ?? undefined,
      notes: c.notes ?? undefined,
      createdAt: c.created_at,
    })),
    requests: requestRows.map((r) => ({
      id: r.id,
      clientId: r.client_id ?? undefined,
      clientName: r.client_name,
      clientPhone: r.client_phone ?? undefined,
      description: r.description,
      status: r.status,
      photoCount: r.photo_paths?.length ?? 0,
      rating: r.rating ?? undefined,
      createdAt: r.created_at,
    })),
    quotes: quoteRows.map((q) => ({
      id: q.id,
      requestId: q.request_id ?? undefined,
      clientId: q.client_id ?? undefined,
      clientName:
        (q.client_id && clientName.get(q.client_id)) ||
        (q.request_id && requestName.get(q.request_id)) ||
        "Cliente",
      reference: q.reference,
      status: q.status,
      sentAt: q.sent_at ?? undefined,
      paidAt: q.paid_at ?? undefined,
      createdAt: q.created_at,
      items: [...q.quote_items]
        .sort((a, b) => a.position - b.position)
        .map((i) => ({
          id: i.id,
          kind: i.kind,
          description: i.description,
          quantity: Number(i.quantity),
          unit: i.unit,
          unitPrice: Number(i.unit_price),
        })),
    })),
  };

  realState = { ready: true, data };
  emit();
}

function ensureLoaded() {
  if (loading || realState.ready) return;
  loading = true;
  loadAll()
    .catch((err) => {
      console.error("Erro a carregar dados:", err);
      realState = { ready: true, data: null };
      emit();
    })
    .finally(() => {
      loading = false;
    });
}

// Invalida o estado (ex.: depois de login/logout ou edição de perfil no admin).
export function invalidateAppData() {
  realState = SERVER_STATE;
  emit();
}

function fail(err: unknown): null {
  console.error(err);
  if (typeof window !== "undefined") {
    window.alert("Não foi possível guardar. Verifique a ligação e tente novamente.");
  }
  return null;
}

// Próxima referência de orçamento: AAAA-NNN por ano.
function nextReference(data: DemoData | null): string {
  const year = new Date().getFullYear();
  let max = 0;
  for (const q of data?.quotes ?? []) {
    const m = q.reference.match(new RegExp(`^${year}-(\\d+)$`));
    if (m) max = Math.max(max, parseInt(m[1], 10));
  }
  return `${year}-${String(max + 1).padStart(3, "0")}`;
}

export interface NewQuoteInput {
  requestId?: string;
  clientId?: string;
  clientName: string;
  items: DemoQuoteItem[];
}

// ---------- Hook ----------

export function useAppData() {
  const demoStore = useDemo();
  const real = useSyncExternalStore(subscribe, () => realState, () => SERVER_STATE);

  const demo = demoStore.demo;

  useEffect(() => {
    if (demoStore.ready && !demoStore.demo) ensureLoaded();
  }, [demoStore.ready, demoStore.demo]);

  const ready = demo ? demoStore.ready : demoStore.ready && real.ready;
  const data = demo ? demoStore.data : real.data;
  const profile = data?.profile ?? null;
  const demoUpdate = demoStore.update;

  const createRequest = useCallback(
    async (input: {
      name: string;
      phone: string;
      description: string;
      photoCount: number;
    }): Promise<string | null> => {
      if (demo) {
        const id = newId();
        demoUpdate((d) => {
          d.requests.unshift({
            id,
            clientName: input.name,
            clientPhone: input.phone || undefined,
            description: input.description,
            status: "novo",
            photoCount: input.photoCount,
            createdAt: new Date().toISOString(),
          });
          return d;
        });
        return id;
      }
      try {
        const sb = createClient();
        const uid = (await sb.auth.getUser()).data.user!.id;
        const digits = input.phone.replace(/\D/g, "");
        let clientId = realState.data?.clients.find(
          (c) =>
            (digits && c.phone.replace(/\D/g, "") === digits) ||
            c.name.trim().toLowerCase() === input.name.trim().toLowerCase()
        )?.id;
        if (!clientId) {
          const { data: c } = await sb
            .from("clients")
            .insert({
              professional_id: uid,
              name: input.name,
              phone: input.phone || null,
            })
            .select("id")
            .single();
          clientId = c?.id;
        }
        const { data: r, error } = await sb
          .from("requests")
          .insert({
            professional_id: uid,
            client_id: clientId ?? null,
            client_name: input.name,
            client_phone: input.phone || null,
            description: input.description,
          })
          .select("id")
          .single();
        if (error) throw error;
        await loadAll();
        return r.id;
      } catch (err) {
        return fail(err);
      }
    },
    [demo, demoUpdate]
  );

  const setRequestStatus = useCallback(
    async (id: string, status: RequestStatus) => {
      if (demo) {
        demoUpdate((d) => {
          const r = d.requests.find((x) => x.id === id);
          if (r) r.status = status;
          return d;
        });
        return;
      }
      try {
        const sb = createClient();
        const { error } = await sb
          .from("requests")
          .update({ status })
          .eq("id", id);
        if (error) throw error;
        await loadAll();
      } catch (err) {
        fail(err);
      }
    },
    [demo, demoUpdate]
  );

  const setRequestRating = useCallback(
    async (id: string, rating: number) => {
      if (demo) {
        demoUpdate((d) => {
          const r = d.requests.find((x) => x.id === id);
          if (r) r.rating = rating;
          return d;
        });
        return;
      }
      try {
        const sb = createClient();
        const { error } = await sb
          .from("requests")
          .update({ rating })
          .eq("id", id);
        if (error) throw error;
        await loadAll();
      } catch (err) {
        fail(err);
      }
    },
    [demo, demoUpdate]
  );

  const createQuote = useCallback(
    async (input: NewQuoteInput): Promise<string | null> => {
      if (demo) {
        const id = newId();
        demoUpdate((d) => {
          d.quotes.unshift({
            id,
            requestId: input.requestId,
            clientId: input.clientId,
            clientName: input.clientName,
            reference: nextReference(d),
            status: "rascunho",
            createdAt: new Date().toISOString(),
            items: input.items,
          });
          return d;
        });
        return id;
      }
      try {
        const sb = createClient();
        const uid = (await sb.auth.getUser()).data.user!.id;
        const { data: q, error } = await sb
          .from("quotes")
          .insert({
            professional_id: uid,
            request_id: input.requestId ?? null,
            client_id: input.clientId ?? null,
            reference: nextReference(realState.data),
          })
          .select("id")
          .single();
        if (error) throw error;
        const { error: itemsError } = await sb.from("quote_items").insert(
          input.items.map((i, index) => ({
            quote_id: q.id,
            kind: i.kind,
            description: i.description,
            quantity: i.quantity,
            unit: i.unit,
            unit_price: i.unitPrice,
            position: index,
          }))
        );
        if (itemsError) throw itemsError;
        await loadAll();
        return q.id;
      } catch (err) {
        return fail(err);
      }
    },
    [demo, demoUpdate]
  );

  const setQuoteStatus = useCallback(
    async (id: string, status: "enviado" | "aceite" | "recusado") => {
      if (demo) {
        demoUpdate((d) => {
          const q = d.quotes.find((x) => x.id === id);
          if (!q) return d;
          q.status = status;
          if (status === "enviado") q.sentAt = new Date().toISOString();
          const r = d.requests.find((x) => x.id === q.requestId);
          if (r) {
            if (status === "enviado") r.status = "orcamentado";
            if (status === "aceite") r.status = "aceite";
          }
          return d;
        });
        return;
      }
      try {
        const sb = createClient();
        const quote = realState.data?.quotes.find((q) => q.id === id);
        const { error } = await sb
          .from("quotes")
          .update(
            status === "enviado"
              ? { status, sent_at: new Date().toISOString() }
              : { status }
          )
          .eq("id", id);
        if (error) throw error;
        if (quote?.requestId && (status === "enviado" || status === "aceite")) {
          await sb
            .from("requests")
            .update({ status: status === "enviado" ? "orcamentado" : "aceite" })
            .eq("id", quote.requestId);
        }
        await loadAll();
      } catch (err) {
        fail(err);
      }
    },
    [demo, demoUpdate]
  );

  const markQuotePaid = useCallback(
    async (id: string) => {
      if (demo) {
        demoUpdate((d) => {
          const q = d.quotes.find((x) => x.id === id);
          if (q) q.paidAt = new Date().toISOString();
          return d;
        });
        return;
      }
      try {
        const sb = createClient();
        const { error } = await sb
          .from("quotes")
          .update({ paid_at: new Date().toISOString() })
          .eq("id", id);
        if (error) throw error;
        await loadAll();
      } catch (err) {
        fail(err);
      }
    },
    [demo, demoUpdate]
  );

  const updateProfile = useCallback(
    async (fields: {
      businessName?: string;
      fullName?: string;
      phone?: string;
      trade?: string;
      address?: string;
      nif?: string;
    }) => {
      if (demo) {
        demoUpdate((d) => {
          d.profile = { ...d.profile, ...fields };
          return d;
        });
        return;
      }
      try {
        const sb = createClient();
        const uid = (await sb.auth.getUser()).data.user!.id;
        const { error } = await sb
          .from("profiles")
          .update({
            business_name: fields.businessName,
            full_name: fields.fullName,
            phone: fields.phone,
            trade: fields.trade,
            address: fields.address,
            nif: fields.nif,
          })
          .eq("id", uid);
        if (error) throw error;
        await loadAll();
      } catch (err) {
        fail(err);
      }
    },
    [demo, demoUpdate]
  );

  return {
    ready,
    demo,
    data,
    profile,
    createRequest,
    setRequestStatus,
    setRequestRating,
    createQuote,
    setQuoteStatus,
    markQuotePaid,
    updateProfile,
  };
}
