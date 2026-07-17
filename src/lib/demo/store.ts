"use client";

// Estado do modo demonstração: guardado em localStorage para que as
// alterações (mudar estados, criar pedidos/orçamentos) persistam entre
// ecrãs. O cookie `apontado_demo` marca a sessão como demo e é lido
// também pelo proxy para dispensar o login.

import { useCallback, useSyncExternalStore } from "react";
import { type DemoData, seedData } from "./data";

const STORAGE_KEY = "apontado-demo-v2";
const COOKIE = "apontado_demo";

interface Snapshot {
  ready: boolean;
  demo: boolean;
  data: DemoData | null;
}

// Durante a renderização no servidor (e hidratação) não há cookie nem
// localStorage; o cliente re-renderiza logo a seguir com o estado real.
const SERVER_SNAPSHOT: Snapshot = { ready: false, demo: false, data: null };

let snapshot: Snapshot | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function emit() {
  listeners.forEach((l) => l());
}

function invalidate() {
  snapshot = null;
  emit();
}

export function isDemo(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").includes(`${COOKIE}=1`);
}

export function enterDemo(): void {
  document.cookie = `${COOKIE}=1; path=/; max-age=${60 * 60 * 24 * 30}`;
  localStorage.removeItem(STORAGE_KEY);
  invalidate();
}

export function exitDemo(): void {
  document.cookie = `${COOKIE}=; path=/; max-age=0`;
  localStorage.removeItem(STORAGE_KEY);
  invalidate();
}

export function resetDemo(): void {
  localStorage.removeItem(STORAGE_KEY);
  invalidate();
}

function load(): DemoData {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as DemoData;
    } catch {
      // dados corrompidos: recomeça do zero
    }
  }
  const seeded = seedData();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
  return seeded;
}

function getSnapshot(): Snapshot {
  if (!snapshot) {
    const active = isDemo();
    snapshot = { ready: true, demo: active, data: active ? load() : null };
  }
  return snapshot;
}

export function useDemo() {
  const snap = useSyncExternalStore(
    subscribe,
    getSnapshot,
    () => SERVER_SNAPSHOT
  );

  const update = useCallback((fn: (d: DemoData) => DemoData) => {
    const current = getSnapshot();
    if (!current.data) return;
    const next = fn(structuredClone(current.data));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    snapshot = { ...current, data: next };
    emit();
  }, []);

  return { ...snap, update };
}

export function newId(): string {
  return `d${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}
