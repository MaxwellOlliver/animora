"use client";

import { type ColumnDef } from "@tanstack/react-table";
import {
  Loader2,
  ImageOff,
  ChevronDown,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash,
} from "lucide-react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useSeriesList } from "../hooks";
import type { Series } from "../types";
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

function BannerCell({ series }: { series: Series }) {
  if (!series.banner) {
    return (
      <div className="flex size-10 items-center justify-center rounded-md bg-muted">
        <ImageOff className="size-4 text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  return (
    <Image
      src={getMediaImageUrl(series.banner.purpose, series.banner.key)}
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

function GenreBadges({ genres }: { genres: Series["genres"] }) {
  if (genres.length === 0) {
    return <span className="text-muted-foreground">--</span>;
  }

  const visible = genres.slice(0, 3);
  const remaining = genres.length - visible.length;

  return (
    <span className="flex flex-wrap gap-1">
      {visible.map((g) => (
        <Badge key={g.id} variant="secondary" className="font-normal">
          {g.name}
        </Badge>
      ))}
      {remaining > 0 && (
        <Badge variant="outline" className="font-normal">
          +{remaining}
        </Badge>
      )}
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
        <Skeleton className="h-4 w-36" />
      </TableCell>
      <TableCell>
        <div className="flex gap-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
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
        <ImageOff className="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
      <p className="text-sm font-medium">No series found</p>
      <p className="text-sm text-muted-foreground">
        Create your first series to get started.
      </p>
    </div>
  );
}

export function SeriesTable() {
  const {
    data,
    isLoading,
    isError,
    error,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSeriesList();

  const allSeries = data?.pages.flatMap((page) => page.items) ?? [];

  const columns = useMemo<ColumnDef<Series>[]>(
    () => [
      {
        id: "banner",
        meta: {
          headClassName: "w-14",
        },
        header: () => <span className="sr-only">Banner</span>,
        cell: ({ row }) => <BannerCell series={row.original} />,
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        accessorKey: "name",
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
        cell: ({ row }) => {
          const s = row.original;
          return (
            <div className="min-w-0">
              <p className="truncate font-medium">{s.name}</p>
              <p
                className="max-w-94 truncate text-xs text-muted-foreground"
                title={s.synopsis}
              >
                {s.synopsis}
              </p>
            </div>
          );
        },
      },
      {
        id: "genres",
        accessorFn: (row) => row.genres.map((genre) => genre.name).join(", "),
        header: "Genres",
        cell: ({ row }) => <GenreBadges genres={row.original.genres} />,
      },
      {
        id: "active",
        accessorFn: (row) => (row.active ? "Active" : "Inactive"),
        header: ({ column }) => (
          <Button
            variant="ghost"
            className="-ml-3 h-8 px-3"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Status
            {column.getIsSorted() === "asc" ? (
              <ArrowUp className="size-4" aria-hidden="true" />
            ) : column.getIsSorted() === "desc" ? (
              <ArrowDown className="size-4" aria-hidden="true" />
            ) : (
              <ArrowUpDown className="size-4" aria-hidden="true" />
            )}
          </Button>
        ),
        cell: ({ row }) => <StatusDot active={row.original.active} />,
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
        meta: {
          headClassName: "w-12 text-right",
        },
        enableSorting: false,
        enableColumnFilter: false,
        header: () => <span className="sr-only">Actions</span>,
        cell: ({ row }) => {
          const series = row.original;

          return (
            <div className="flex justify-end">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-8 w-8 p-0"
                    aria-label={`Open actions for ${series.name}`}
                  >
                    <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={`/series/${series.id}/edit`}>
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem variant="destructive">
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
    [],
  );

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={allSeries}
        isLoading={isLoading}
        isError={isError}
        errorMessage={
          error instanceof Error ? error.message : "Failed to load series."
        }
        emptyState={<EmptyState />}
        loadingRows={<SkeletonRows />}
        filterColumnId="name"
        filterPlaceholder="Filter by name..."
        getRowId={(row) => row.id}
        toolbar={
          <Button asChild>
            <Link href="/series/create">
              <Plus aria-hidden="true" />
              Create series
            </Link>
          </Button>
        }
      />

      {hasNextPage && (
        <div className="flex justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchNextPage()}
            disabled={isFetchingNextPage}
          >
            {isFetchingNextPage ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Loading…
              </>
            ) : (
              <>
                <ChevronDown aria-hidden="true" />
                Load more
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
