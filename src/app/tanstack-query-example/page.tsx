"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// --------------- 1. Define types and API helpers ---------------
type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

async function fetchPost(id: number): Promise<Post> {
  const res = await fetch(`https://jsonplaceholder.typicode.com/posts/${id}`);
  if (!res.ok) throw new Error("Failed to fetch post");
  return res.json();
}

async function createPost(post: Omit<Post, "id">): Promise<Post> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts", {
    method: "POST",
    headers: { "Content-type": "application/json; charset=UTF-8" },
    body: JSON.stringify(post),
  });
  if (!res.ok) throw new Error("Failed to create post");
  return res.json();
}

// --------------- 2. Query keys (centralize for cache + invalidation) ---------------
const postKeys = {
  all: ["posts"] as const,
  detail: (id: number) => ["posts", id] as const,
};

export default function TanStackQueryExamplePage() {
  const queryClient = useQueryClient();

  // --------------- 3. useQuery: fetch and cache data ---------------
  const {
    data: post,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: postKeys.detail(1),
    queryFn: () => fetchPost(1),
    // staleTime: how long data is "fresh" (default 0 = always refetch when component mounts)
    staleTime: 10 * 1000,
  });

  // --------------- 4. useMutation: change server state (POST, PUT, DELETE) ---------------
  const mutation = useMutation({
    mutationFn: createPost,
    onSuccess: () => {
      // Invalidate so useQuery refetches if it depends on the list
      queryClient.invalidateQueries({ queryKey: postKeys.all });
    },
  });

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-2xl space-y-10">
        <Link
          href="/"
          className="mb-6 inline-block text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← Back to Welcome
        </Link>
        <h1 className="text-2xl font-semibold">TanStack Query example</h1>

        {/* --------------- useQuery demo --------------- */}
        <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-6">
          <h2 className="mb-2 text-lg font-medium text-zinc-800">
            useQuery — fetch &amp; cache
          </h2>
          <p className="mb-4 text-sm text-zinc-600">
            Fetches post #1 from JSONPlaceholder. Shows loading, error, and
            success. Refetch button triggers a new request.
          </p>
          {isLoading && (
            <p className="text-sm text-amber-600">Loading post…</p>
          )}
          {isError && (
            <p className="text-sm text-red-600">
              Error: {error instanceof Error ? error.message : "Unknown error"}
            </p>
          )}
          {post && (
            <div className="space-y-2">
              <p className="font-medium text-zinc-900">{post.title}</p>
              <p className="text-sm text-zinc-600">{post.body}</p>
              {isFetching && (
                <p className="text-xs text-zinc-500">Refetching…</p>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded bg-zinc-800 px-3 py-1.5 text-sm text-white hover:bg-zinc-700"
          >
            Refetch
          </button>
        </section>

        {/* --------------- useMutation demo --------------- */}
        <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-6">
          <h2 className="mb-2 text-lg font-medium text-zinc-800">
            useMutation — change data
          </h2>
          <p className="mb-4 text-sm text-zinc-600">
            Simulates creating a post (JSONPlaceholder echoes it back). Then we
            invalidate the &quot;posts&quot; query so any list would refetch.
          </p>
          <button
            type="button"
            onClick={() =>
              mutation.mutate({
                userId: 1,
                title: "New post",
                body: "Created with useMutation",
              })
            }
            disabled={mutation.isPending}
            className="rounded bg-zinc-800 px-3 py-1.5 text-sm text-white hover:bg-zinc-700 disabled:opacity-50"
          >
            {mutation.isPending ? "Creating…" : "Create post"}
          </button>
          {mutation.isError && (
            <p className="mt-2 text-sm text-red-600">
              {mutation.error instanceof Error
                ? mutation.error.message
                : "Mutation failed"}
            </p>
          )}
          {mutation.isSuccess && (
            <p className="mt-2 text-sm text-green-700">
              Success! (ID: {mutation.data?.id})
            </p>
          )}
          {mutation.isSuccess && (
            <button
              type="button"
              onClick={() => mutation.reset()}
              className="ml-2 text-sm text-zinc-500 underline"
            >
              Reset
            </button>
          )}
        </section>

        {/* --------------- Takeaways --------------- */}
        <section className="rounded-lg border border-zinc-200 p-6">
          <h2 className="mb-2 text-lg font-medium text-zinc-800">
            Takeaways
          </h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600">
            <li>
              <strong>Query key</strong> — uniquely identifies the query; same
              key = shared cache.
            </li>
            <li>
              <strong>queryFn</strong> — async function that returns the data.
            </li>
            <li>
              <strong>staleTime</strong> — how long data is considered fresh
              before background refetch.
            </li>
            <li>
              <strong>refetch()</strong> — manually refetch. <strong>invalidateQueries</strong> —
              mark queries stale so they refetch when next used.
            </li>
            <li>
              <strong>useMutation</strong> — for POST/PUT/DELETE; use
              onSuccess/onError and invalidateQueries to sync cache.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
