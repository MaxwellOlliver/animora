"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ImageOff,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";

import { Badge } from "@/components/ui/badge";
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

import { useDeletePlaylist,usePlaylistsList } from "../hooks";
import type { Playlist } from "../types";

function CoverCell({ playlist }: { playlist: Playlist }) {
  if (!playlist.cover) {
    return (
      <div className="flex size-10 items-center justify-center rounded-md bg-muted">
        <ImageOff className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={getMediaImageUrl(playlist.cover.purpose, playlist.cover.key)}
      alt=""
      width={40}
      height={40}
      className="size-10 rounded-md object-cover"
      loading="lazy"
    />
  );
}

const TYPE_LABELS: Record<Playlist["type"], string> = {
  season: "Season",
  movie: "Movie",
  special: "Special",
};

function formatDate(dateStr: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(dateStr));
}

function SkeletonRows() {
  return Array.from({ length: 6 }, (_, i) => (
    <TableRow key={i}>
      <TableCell>
        <Skeleton className="size-10 rounded-md" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-36" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-14 rounded-full" />
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
        <ImageOff className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium">No playlists found</p>
      <p className="text-sm text-muted-foreground">
        Create your first playlist to get started.
      </p>
    </div>
  );
}

function playlistDisplayName(playlist: Playlist): string {
  if (playlist.title) return playlist.title;
  return `${TYPE_LABELS[playlist.type]} ${playlist.number}`;
}

export function PlaylistsTable() {
  const { data, isLoading, isError, error } = usePlaylistsList();
  const deleteMutation = useDeletePlaylist();

  const playlists = data ?? [];

  const columns = useMemo<ColumnDef<Playlist>[]>(
    () => [
      {
        id: "cover",
        meta: { headClassName: "w-14" },
        header: () => <span className="sr-only">Cover</span>,
        cell: ({ row }) => <CoverCell playlist={row.original} />,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        id: "name",
        accessorFn: (row) => playlistDisplayName(row),
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 px-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
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
          <span className="font-medium">
            {playlistDisplayName(row.original)}
          </span>
        ),
      },
      {
        id: "series",
        accessorFn: (row) => row.seriesName ?? "",
        header: "Series",
        cell: ({ row }) => (
          <Link
            href={`/series/${row.original.seriesId}/edit`}
            className="text-sm hover:underline"
          >
            {row.original.seriesName ?? "--"}
          </Link>
        ),
      },
      {
        id: "type",
        accessorFn: (row) => TYPE_LABELS[row.type],
        header: "Type",
        cell: ({ row }) => (
          <Badge variant="secondary" className="font-normal">
            {TYPE_LABELS[row.original.type]}
          </Badge>
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
          const playlist = row.original;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    aria-label={`Open actions for ${playlistDisplayName(playlist)}`}
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/playlists/${playlist.id}/edit`}>
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    onClick={() => deleteMutation.mutate(playlist.id)}
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
      data={playlists}
      isLoading={isLoading}
      isError={isError}
      errorMessage={
        error instanceof Error ? error.message : "Failed to load playlists."
      }
      emptyState={<EmptyState />}
      loadingRows={<SkeletonRows />}
      filterColumnId="name"
      filterPlaceholder="Filter by name..."
      getRowId={(row) => row.id}
      toolbar={
        <Button asChild>
          <Link href="/playlists/create">
            <Plus aria-hidden="true" />
            Create playlist
          </Link>
        </Button>
      }
    />
  );
}
