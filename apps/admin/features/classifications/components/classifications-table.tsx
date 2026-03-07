"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ImageOff,
  MoreHorizontal,
  Plus,
  ShieldAlert,
} from "lucide-react";
import Image from "next/image";
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
import { getMediaImageUrl } from "@/lib/s3";
import { useContentClassificationsList } from "../hooks";
import type { ContentClassification } from "../types";

function IconCell({ item }: { item: ContentClassification }) {
  if (!item.icon) {
    return (
      <div className="flex size-10 items-center justify-center rounded-md bg-muted">
        <ImageOff className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={getMediaImageUrl(item.icon.purpose, item.icon.key)}
      alt=""
      width={40}
      height={40}
      className="size-10 rounded-md object-cover"
      loading="lazy"
    />
  );
}

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
        <Skeleton className="size-10 rounded-md" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-64" />
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
        <ShieldAlert className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium">No classifications found</p>
      <p className="text-sm text-muted-foreground">
        Create your first classification to get started.
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

export function ClassificationsTable() {
  const { data, isLoading, isError, error } = useContentClassificationsList();

  const classifications = data ?? [];

  const columns = useMemo<ColumnDef<ContentClassification>[]>(
    () => [
      {
        id: "icon",
        meta: {
          headClassName: "w-14",
        },
        header: () => <span className="sr-only">Icon</span>,
        cell: ({ row }) => <IconCell item={row.original} />,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "name",
        header: ({ column }) => <SortableHeader title="Name" column={column} />,
        cell: ({ row }) => <span className="font-medium">{row.original.name}</span>,
      },
      {
        id: "description",
        accessorFn: (row) => row.description ?? "",
        header: "Description",
        cell: ({ row }) => (
          <p
            className="max-w-120 truncate text-muted-foreground"
            title={row.original.description ?? undefined}
          >
            {row.original.description || "--"}
          </p>
        ),
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
          const classification = row.original;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    aria-label={`Open actions for ${classification.name}`}
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/classifications/${classification.id}/edit`}>
                      Edit
                    </Link>
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
      data={classifications}
      isLoading={isLoading}
      isError={isError}
      errorMessage={
        error instanceof Error
          ? error.message
          : "Failed to load content classifications."
      }
      emptyState={<EmptyState />}
      loadingRows={<SkeletonRows />}
      filterColumnId="name"
      filterPlaceholder="Filter by name..."
      toolbar={
        <Button asChild>
          <Link href="/classifications/create">
            <Plus aria-hidden="true" />
            Create classification
          </Link>
        </Button>
      }
      getRowId={(row) => row.id}
    />
  );
}
