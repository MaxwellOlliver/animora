"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  ImageOff,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
  Video,
  Film,
} from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useTrailersList, useDeleteTrailer } from "../hooks";
import type { Trailer } from "../types";
import Image from "next/image";
import { getMediaImageUrl } from "@/lib/s3";
import { useMemo } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DataTable } from "@/components/ui/data-table";
import Link from "next/link";

function ThumbnailCell({ trailer }: { trailer: Trailer }) {
  if (!trailer.thumbnail) {
    return (
      <div className="flex size-10 items-center justify-center rounded-md bg-muted">
        <ImageOff className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={getMediaImageUrl(trailer.thumbnail.purpose, trailer.thumbnail.key)}
      alt=""
      width={40}
      height={40}
      className="size-10 rounded-md object-cover"
      loading="lazy"
    />
  );
}

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function SkeletonRows() {
  return Array.from({ length: 6 }, (_, i) => (
    <TableRow key={i}>
      <TableCell>
        <Skeleton className="size-10 rounded-md" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-8" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-36" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-12" />
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
        <Film className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium">No trailers found</p>
      <p className="text-sm text-muted-foreground">
        Create your first trailer to get started.
      </p>
    </div>
  );
}

export function TrailersTable() {
  const { data, isLoading, isError, error } = useTrailersList();
  const deleteMutation = useDeleteTrailer();

  const trailers = data ?? [];

  const columns = useMemo<ColumnDef<Trailer>[]>(
    () => [
      {
        id: "thumbnail",
        meta: { headClassName: "w-14" },
        header: () => <span className="sr-only">Thumbnail</span>,
        cell: ({ row }) => <ThumbnailCell trailer={row.original} />,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        id: "number",
        accessorKey: "number",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 px-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            #
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="size-4" aria-hidden="true" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="size-4" aria-hidden="true" />
            ) : (
              <ArrowUpDown className="size-4" aria-hidden="true" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.number}</span>
        ),
      },
      {
        id: "title",
        accessorKey: "title",
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 px-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Title
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="size-4" aria-hidden="true" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="size-4" aria-hidden="true" />
            ) : (
              <ArrowUpDown className="size-4" aria-hidden="true" />
            )}
          </Button>
        ),
        cell: ({ row }) => {
          const trailer = row.original;
          return (
            <div className="min-w-0">
              <p className="truncate font-medium">{trailer.title}</p>
              {trailer.seriesName && (
                <p className="max-w-64 truncate text-xs text-muted-foreground">
                  {trailer.seriesName}
                </p>
              )}
            </div>
          );
        },
      },
      {
        id: "duration",
        accessorFn: (row) => row.durationSeconds,
        header: "Duration",
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {formatDuration(row.original.durationSeconds)}
          </span>
        ),
      },
      {
        id: "createdAt",
        accessorFn: (row) => new Date(row.createdAt).getTime(),
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 px-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Created
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="size-4" aria-hidden="true" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="size-4" aria-hidden="true" />
            ) : (
              <ArrowUpDown className="size-4" aria-hidden="true" />
            )}
          </Button>
        ),
        cell: ({ row }) => (
          <span className="text-muted-foreground tabular-nums">
            {formatDate(row.original.createdAt)}
          </span>
        ),
      },
      {
        id: "actions",
        meta: { headClassName: "w-12 text-right" },
        enableSorting: false,
        enableColumnFilter: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const trailer = row.original;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    aria-label={`Open actions for ${trailer.title}`}
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/trailers/${trailer.id}/edit`}>
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={`/trailers/${trailer.id}/video`}>
                      <Video className="size-4" />
                      Manage video
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(trailer.id)}
                  >
                    <Trash />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          );
        },
      },
    ],
    [deleteMutation],
  );

  return (
    <DataTable
      columns={columns}
      data={trailers}
      isLoading={isLoading}
      isError={isError}
      errorMessage={
        error instanceof Error ? error.message : "Failed to load trailers."
      }
      emptyState={<EmptyState />}
      loadingRows={<SkeletonRows />}
      filterColumnId="title"
      filterPlaceholder="Filter by title..."
      getRowId={(row) => row.id}
      toolbar={
        <Button asChild>
          <Link href="/trailers/create">
            <Plus aria-hidden="true" />
            Create trailer
          </Link>
        </Button>
      }
    />
  );
}
