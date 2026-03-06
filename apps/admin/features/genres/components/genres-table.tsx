"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  MoreHorizontal,
  Plus,
  Tags,
} from "lucide-react";
import { useMemo } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { TableCell, TableRow } from "@/components/ui/table";
import { useGenresList } from "../hooks";
import type { Genre } from "../types";

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`inline-block size-1.5 rounded-full ${active ? "bg-emerald-500" : "bg-muted-foreground/40"}`}
        aria-hidden="true"
      />
      <span className="text-sm">{active ? "Active" : "Inactive"}</span>
    </span>
  );
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

function SkeletonRows() {
  return Array.from({ length: 8 }, (_, i) => (
    <TableRow key={i}>
      <TableCell>
        <Skeleton className="h-4 w-40" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-14" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="ml-auto h-8 w-8 rounded-md" />
      </TableCell>
    </TableRow>
  ));
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
      <div className="flex size-12 items-center justify-center rounded-xl bg-muted">
        <Tags className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium">No genres found</p>
      <p className="text-sm text-muted-foreground">
        Create your first genre to get started.
      </p>
    </div>
  );
}

function SortableHeader({
  title,
  column,
}: {
  title: string;
  column: {
    getIsSorted: () => false | "asc" | "desc";
    toggleSorting: (desc?: boolean) => void;
  };
}) {
  return (
    <Button
      variant="ghost"
      className="-ml-3 h-8 px-3"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      {title}
      {column.getIsSorted() === "asc" ? (
        <ArrowUp className="size-4" aria-hidden="true" />
      ) : column.getIsSorted() === "desc" ? (
        <ArrowDown className="size-4" aria-hidden="true" />
      ) : (
        <ArrowUpDown className="size-4" aria-hidden="true" />
      )}
    </Button>
  );
}

export function GenresTable() {
  const { data, isLoading, isError, error } = useGenresList();

  const genres = data ?? [];

  const columns = useMemo<ColumnDef<Genre>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <SortableHeader title="Name" column={column} />,
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        id: "active",
        accessorFn: (row) => (row.active ? "Active" : "Inactive"),
        header: ({ column }) => <SortableHeader title="Status" column={column} />,
        cell: ({ row }) => <StatusDot active={row.original.active} />,
      },
      {
        id: "createdAt",
        accessorFn: (row) => new Date(row.createdAt).getTime(),
        header: ({ column }) => <SortableHeader title="Created" column={column} />,
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        meta: {
          headClassName: "w-12 text-right",
        },
        enableSorting: false,
        enableColumnFilter: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const genre = row.original;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    aria-label={`Open actions for ${genre.name}`}
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/genres/${genre.id}/edit`}>Edit</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive">Delete</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [],
  );

  return (
    <DataTable
      columns={columns}
      data={genres}
      isLoading={isLoading}
      isError={isError}
      errorMessage={error instanceof Error ? error.message : "Failed to load genres."}
      emptyState={<EmptyState />}
      loadingRows={<SkeletonRows />}
      filterColumnId="name"
      filterPlaceholder="Filter by name..."
      toolbar={
        <Button asChild>
          <Link href="/genres/create">
            <Plus aria-hidden="true" />
            Create genre
          </Link>
        </Button>
      }
      getRowId={(row) => row.id}
    />
  );
}
