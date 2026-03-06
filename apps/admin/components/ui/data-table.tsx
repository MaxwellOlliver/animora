"use client";

import { type ReactNode, useState } from "react";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  type Row,
  type RowData,
  type SortingState,
  useReactTable,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

/* eslint-disable @typescript-eslint/no-unused-vars */
declare module "@tanstack/react-table" {
  interface ColumnMeta<TData extends RowData, TValue> {
    headClassName?: string;
    cellClassName?: string;
  }
}
/* eslint-enable @typescript-eslint/no-unused-vars */

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  isLoading?: boolean;
  isError?: boolean;
  errorMessage?: string;
  emptyState?: ReactNode;
  noResultsState?: ReactNode;
  loadingRows?: ReactNode;
  filterColumnId?: string;
  filterPlaceholder?: string;
  toolbar?: ReactNode;
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
  className?: string;
}

function DefaultLoadingRows({ columnCount }: { columnCount: number }) {
  return Array.from({ length: 8 }, (_, rowIndex) => (
    <TableRow key={rowIndex}>
      {Array.from({ length: columnCount }, (_, colIndex) => (
        <TableCell key={`${rowIndex}-${colIndex}`}>
          <Skeleton className="h-4 w-24" />
        </TableCell>
      ))}
    </TableRow>
  ));
}

export function DataTable<TData, TValue>({
  columns,
  data,
  isLoading = false,
  isError = false,
  errorMessage,
  emptyState,
  noResultsState,
  loadingRows,
  filterColumnId,
  filterPlaceholder = "Filter...",
  toolbar,
  getRowId,
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getRowId,
  });

  const filterColumn = filterColumnId ? table.getColumn(filterColumnId) : undefined;
  const columnCount = table.getVisibleLeafColumns().length || 1;

  return (
    <div className={cn("space-y-4", className)}>
      {(filterColumn || toolbar) && (
        <div className="flex items-center justify-between gap-2">
          {filterColumn ? (
            <Input
              placeholder={filterPlaceholder}
              value={(filterColumn.getFilterValue() as string) ?? ""}
              onChange={(event) => filterColumn.setFilterValue(event.target.value)}
              className="h-9 w-full max-w-sm"
            />
          ) : (
            <div />
          )}
          {toolbar}
        </div>
      )}

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={header.column.columnDef.meta?.headClassName}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              loadingRows ?? <DefaultLoadingRows columnCount={columnCount} />
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={columnCount}>
                  <div
                    role="alert"
                    aria-live="polite"
                    className="py-8 text-center text-sm text-destructive"
                  >
                    {errorMessage ?? "Something went wrong."}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columnCount}>
                  {data.length === 0 ? (
                    emptyState ?? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No data.
                      </div>
                    )
                  ) : (
                    noResultsState ?? (
                      <div className="py-8 text-center text-sm text-muted-foreground">
                        No results.
                      </div>
                    )
                  )}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.cellClassName}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
