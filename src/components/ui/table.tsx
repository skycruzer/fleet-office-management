"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface AccessibleTableProps extends React.ComponentProps<"table"> {
  caption?: string;
  summary?: string;
  sortable?: boolean;
  onSortChange?: (column: string, direction: 'asc' | 'desc') => void;
  totalRows?: number;
  currentPage?: number;
  totalPages?: number;
}

function Table({
  className,
  caption,
  summary,
  sortable = false,
  totalRows,
  currentPage,
  totalPages,
  ...props
}: AccessibleTableProps) {
  const tableId = React.useId();
  const summaryId = React.useId();

  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
      role="region"
      aria-live="polite"
      aria-labelledby={caption ? `${tableId}-caption` : undefined}
      aria-describedby={summary ? summaryId : undefined}
      tabIndex={0}
    >
      {summary && (
        <div
          id={summaryId}
          className="sr-only"
        >
          {summary}
          {sortable && " Use arrow keys to navigate and Space or Enter to sort columns."}
          {totalRows && ` Table contains ${totalRows} total rows.`}
          {currentPage && totalPages && ` Showing page ${currentPage} of ${totalPages}.`}
        </div>
      )}
      <table
        id={tableId}
        data-slot="table"
        className={cn("w-full caption-bottom text-sm data-table", className)}
        role="table"
        {...props}
      >
        {caption && (
          <caption
            id={`${tableId}-caption`}
            className="text-left font-semibold text-foreground mb-2 text-base"
          >
            {caption}
          </caption>
        )}
        {props.children}
      </table>
    </div>
  )
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn("[&_tr]:border-b", className)}
      {...props}
    />
  )
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  )
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  )
}

interface AccessibleTableRowProps extends React.ComponentProps<"tr"> {
  selected?: boolean;
  index?: number;
  total?: number;
}

function TableRow({
  className,
  selected = false,
  index,
  total,
  ...props
}: AccessibleTableRowProps) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors focus-within:bg-muted/30",
        selected && "bg-muted/50 ring-1 ring-primary",
        className
      )}
      role="row"
      aria-selected={selected}
      aria-rowindex={index}
      aria-setsize={total}
      {...props}
    />
  );
}

interface SortableTableHeadProps extends React.ComponentProps<"th"> {
  sortable?: boolean;
  sorted?: 'asc' | 'desc' | null;
  onSort?: () => void;
  columnKey?: string;
}

function TableHead({
  className,
  sortable = false,
  sorted = null,
  onSort,
  columnKey,
  children,
  ...props
}: SortableTableHeadProps) {
  const headerId = React.useId();

  if (sortable && onSort) {
    return (
      <th
        data-slot="table-head"
        className={cn(
          "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
          "hover:bg-muted/50 cursor-pointer focus:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-inset",
          className
        )}
        scope="col"
        role="columnheader"
        tabIndex={0}
        aria-sort={sorted === 'asc' ? 'ascending' : sorted === 'desc' ? 'descending' : 'none'}
        onClick={onSort}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSort();
          }
        }}
        aria-describedby={`${headerId}-desc`}
        {...props}
      >
        <div className="flex items-center gap-1">
          {children}
          {sortable && (
            <span
              aria-hidden="true"
              className="ml-1 text-xs text-muted-foreground"
            >
              {sorted === 'asc' ? '↑' : sorted === 'desc' ? '↓' : '↕'}
            </span>
          )}
        </div>
        <div id={`${headerId}-desc`} className="sr-only">
          {sortable && `Sortable column. Currently ${sorted ? `sorted ${sorted === 'asc' ? 'ascending' : 'descending'}` : 'not sorted'}. Click to ${sorted === 'asc' ? 'sort descending' : 'sort ascending'}.`}
        </div>
      </th>
    );
  }

  return (
    <th
      data-slot="table-head"
      className={cn(
        "text-foreground h-10 px-2 text-left align-middle font-medium whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        className
      )}
      scope="col"
      role="columnheader"
      {...props}
    >
      {children}
    </th>
  );
}

interface AccessibleTableCellProps extends React.ComponentProps<"td"> {
  headers?: string;
  columnIndex?: number;
  rowIndex?: number;
  numeric?: boolean;
  sortValue?: string | number;
}

function TableCell({
  className,
  headers,
  columnIndex,
  rowIndex,
  numeric = false,
  sortValue,
  ...props
}: AccessibleTableCellProps) {
  const cellId = React.useId();

  return (
    <td
      id={cellId}
      data-slot="table-cell"
      className={cn(
        "p-2 align-middle whitespace-nowrap [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
        numeric && "text-right tabular-nums",
        className
      )}
      role="cell"
      headers={headers}
      aria-colindex={columnIndex}
      aria-rowindex={rowIndex}
      data-sort-value={sortValue}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  )
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
}
