"use client";

import { getBranches } from "@/lib/api/branches";
import { getCategories } from "@/lib/api/categories";
import { getPartners } from "@/lib/api/partners";
import { getRadiologies } from "@/lib/api/radiologies";
import type { Branch, Category, Partner, Radiology } from "@/lib/api/types";

interface CacheEntry<T> {
  data: T | null;
  promise: Promise<T> | null;
  updatedAt: number;
}

const TTL_MS = 30_000;

const cache = new Map<string, CacheEntry<unknown>>();

async function getCached<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  const entry = cache.get(key) as CacheEntry<T> | undefined;
  const now = Date.now();

  if (entry?.data && entry.updatedAt && now - entry.updatedAt < TTL_MS) {
    return entry.data;
  }
  if (entry?.promise) {
    return entry.promise;
  }

  const promise = fetcher()
    .then((data) => {
      cache.set(key, { data, promise: null, updatedAt: Date.now() });
      return data;
    })
    .catch((error) => {
      cache.delete(key);
      throw error;
    });

  cache.set(key, { data: entry?.data ?? null, promise, updatedAt: entry?.updatedAt ?? 0 });
  return promise;
}

export function invalidateReferenceCache(): void {
  cache.clear();
}

export function fetchCachedCategories(): Promise<Category[]> {
  return getCached("categories", getCategories);
}

export function fetchCachedRadiologies(): Promise<Radiology[]> {
  return getCached("radiologies", getRadiologies);
}

export function fetchCachedBranches(): Promise<Branch[]> {
  return getCached("branches", getBranches);
}

export function fetchCachedPartners(): Promise<Partner[]> {
  return getCached("partners", getPartners);
}
