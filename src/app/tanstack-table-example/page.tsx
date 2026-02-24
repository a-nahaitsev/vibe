"use client";

import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

// --------------- 1. Data type and API ---------------
type Post = {
  id: number;
  userId: number;
  title: string;
  body: string;
};

async function fetchPosts(): Promise<Post[]> {
  const res = await fetch("https://jsonplaceholder.typicode.com/posts");
  if (!res.ok) throw new Error("Failed to fetch posts");
  return res.json();
}

// --------------- 2. Column definitions (columnHelper gives typed accessors) ---------------
const columnHelper = createColumnHelper<Post>();

const columns = [
  columnHelper.accessor("id", {
    header: "ID",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("title", {
    header: "Title",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("body", {
    header: "Body",
    enableSorting: false,
    cell: (info) => {
      const body = info.getValue();
      return body.length > 60 ? `${body.slice(0, 60)}…` : body;
    },
  }),
];

export default function TanStackTableExamplePage() {
  const [sorting, setSorting] = useState<SortingState>([]);

  const { data: posts = [], isLoading, isError, error } = useQuery({
    queryKey: ["posts-list"],
    queryFn: fetchPosts,
  });

  // TanStack Table returns non-memoizable functions; skip React Compiler for this hook
  // eslint-disable-next-line react-hooks/incompatible-library -- documented limitation
  const table = useReactTable({
    data: posts,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const headerGroups = table.getHeaderGroups();
  const rows = table.getRowModel().rows;

  return (
    <main className="min-h-screen p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Link
          href="/"
          className="inline-block text-sm text-zinc-600 hover:text-zinc-900"
        >
          ← Back to Welcome
        </Link>
        <h1 className="text-2xl font-semibold">TanStack Table example</h1>

        <p className="text-sm text-zinc-600">
          Posts from JSONPlaceholder. Columns use <strong>createColumnHelper</strong>.
          Click a header to sort (ID and Title). Table uses{" "}
          <strong>getCoreRowModel</strong> and <strong>getSortedRowModel</strong>.
        </p>

        {isLoading && <p className="text-sm text-amber-600">Loading posts…</p>}
        {isError && (
          <p className="text-sm text-red-600">
            Error: {error instanceof Error ? error.message : "Unknown error"}
          </p>
        )}

        {!isLoading && !isError && (
          <div className="overflow-x-auto rounded-lg border border-zinc-200">
            <table className="w-full min-w-[500px] border-collapse text-left text-sm">
              <thead>
                {headerGroups.map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b border-zinc-200 bg-zinc-100">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="px-4 py-3 font-medium text-zinc-800"
                      >
                        <div
                          className={
                            header.column.getCanSort()
                              ? "cursor-pointer select-none"
                              : ""
                          }
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                          {{
                            asc: " ↑",
                            desc: " ↓",
                          }[header.column.getIsSorted() as string] ?? null}
                        </div>
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-zinc-100 hover:bg-zinc-50"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="px-4 py-2 text-zinc-700">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-4">
          <h2 className="mb-2 text-sm font-medium text-zinc-800">Takeaways</h2>
          <ul className="list-inside list-disc space-y-1 text-sm text-zinc-600">
            <li>
              <strong>createColumnHelper</strong> — typed column defs with
              accessor(), display(), group().
            </li>
            <li>
              <strong>useReactTable</strong> — pass data, columns,
              getCoreRowModel(), and optional state (sorting, filtering, etc.).
            </li>
            <li>
              <strong>getSortedRowModel()</strong> — enable sorting; control with
              state.sorting and onSortingChange.
            </li>
            <li>
              <strong>flexRender</strong> — use for header and cell so custom
              components render correctly.
            </li>
          </ul>
        </section>
      </div>
    </main>
  );
}
