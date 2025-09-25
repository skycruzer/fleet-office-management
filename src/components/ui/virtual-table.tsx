/**
 * Virtual Scrolling Table Component for Large Datasets
 * Optimized for handling thousands of rows in the Fleet Management System
 */

import React, { memo, useMemo, useCallback } from 'react';
import { useVirtualScroll } from '@/hooks/use-performance-optimization';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

interface VirtualTableColumn<T = any> {
  key: string;
  title: string;
  width?: number;
  minWidth?: number;
  maxWidth?: number;
  sortable?: boolean;
  render?: (value: any, record: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  align?: 'left' | 'center' | 'right';
}

interface VirtualTableProps<T = any> {
  data: T[];
  columns: VirtualTableColumn<T>[];
  rowHeight?: number;
  containerHeight: number;
  className?: string;
  headerClassName?: string;
  rowClassName?: string | ((record: T, index: number) => string);
  onRowClick?: (record: T, index: number) => void;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (field: string, order: 'asc' | 'desc') => void;
  loading?: boolean;
  emptyText?: string;
  stickyHeader?: boolean;
  zebra?: boolean;
  hoverable?: boolean;
  compact?: boolean;
}

interface SortState {
  field: string;
  order: 'asc' | 'desc';
}

const VirtualTable = memo(<T extends Record<string, any>>({
  data,
  columns,
  rowHeight = 48,
  containerHeight,
  className,
  headerClassName,
  rowClassName,
  onRowClick,
  sortField,
  sortOrder,
  onSort,
  loading = false,
  emptyText = 'No data available',
  stickyHeader = true,
  zebra = true,
  hoverable = true,
  compact = false
}: VirtualTableProps<T>) => {
  // Virtual scrolling setup
  const {
    visibleItems,
    totalHeight,
    offsetY,
    handleScroll,
    visibleRange
  } = useVirtualScroll(data, {
    itemHeight: rowHeight,
    containerHeight: containerHeight - (stickyHeader ? 48 : 0), // Account for header height
    overscan: 5
  });

  // Sort handling
  const handleSort = useCallback((field: string) => {
    if (!onSort) return;

    const currentOrder = sortField === field ? sortOrder : undefined;
    const newOrder: 'asc' | 'desc' = currentOrder === 'asc' ? 'desc' : 'asc';
    onSort(field, newOrder);
  }, [sortField, sortOrder, onSort]);

  // Render sort icon
  const renderSortIcon = useCallback((field: string) => {
    if (sortField !== field) {
      return <ChevronsUpDown className="w-4 h-4 text-slate-400" />;
    }

    return sortOrder === 'asc' ? (
      <ChevronUp className="w-4 h-4 text-slate-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-slate-600" />
    );
  }, [sortField, sortOrder]);

  // Calculate column widths
  const columnWidths = useMemo(() => {
    const totalFixedWidth = columns.reduce((sum, col) => sum + (col.width || 0), 0);
    const flexColumns = columns.filter(col => !col.width);
    const remainingWidth = Math.max(0, 100 - (totalFixedWidth / window.innerWidth) * 100);
    const flexWidth = flexColumns.length > 0 ? remainingWidth / flexColumns.length : 0;

    return columns.map(col => ({
      width: col.width ? `${(col.width / window.innerWidth) * 100}%` : `${flexWidth}%`,
      minWidth: col.minWidth,
      maxWidth: col.maxWidth
    }));
  }, [columns]);

  // Render table header
  const renderHeader = () => (
    <div
      className={cn(
        "flex items-center border-b bg-slate-50 dark:bg-slate-800/50",
        compact ? "h-10" : "h-12",
        stickyHeader && "sticky top-0 z-10",
        headerClassName
      )}
    >
      {columns.map((column, index) => (
        <div
          key={column.key}
          className={cn(
            "flex items-center px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300",
            column.sortable && "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50",
            column.align === 'center' && "justify-center",
            column.align === 'right' && "justify-end",
            column.headerClassName
          )}
          style={{
            width: columnWidths[index].width,
            minWidth: columnWidths[index].minWidth,
            maxWidth: columnWidths[index].maxWidth
          }}
          onClick={() => column.sortable && handleSort(column.key)}
        >
          <span className="truncate">{column.title}</span>
          {column.sortable && (
            <span className="ml-2 flex-shrink-0">
              {renderSortIcon(column.key)}
            </span>
          )}
        </div>
      ))}
    </div>
  );

  // Render table row
  const renderRow = useCallback((item: T, itemIndex: number, virtualIndex: number) => {
    const isEven = virtualIndex % 2 === 0;
    const rowClassNameValue = typeof rowClassName === 'function'
      ? rowClassName(item, itemIndex)
      : rowClassName;

    return (
      <div
        key={`row-${itemIndex}`}
        className={cn(
          "flex items-center border-b border-slate-100 dark:border-slate-700",
          zebra && isEven && "bg-slate-50/50 dark:bg-slate-800/25",
          hoverable && "hover:bg-slate-100 dark:hover:bg-slate-700/50",
          onRowClick && "cursor-pointer",
          rowClassNameValue
        )}
        style={{ height: rowHeight }}
        onClick={() => onRowClick?.(item, itemIndex)}
      >
        {columns.map((column, colIndex) => {
          const value = item[column.key];
          const content = column.render ? column.render(value, item, itemIndex) : value;

          return (
            <div
              key={`cell-${itemIndex}-${column.key}`}
              className={cn(
                "flex items-center px-4 py-2 text-sm text-slate-900 dark:text-slate-100",
                column.align === 'center' && "justify-center",
                column.align === 'right' && "justify-end",
                column.className
              )}
              style={{
                width: columnWidths[colIndex].width,
                minWidth: columnWidths[colIndex].minWidth,
                maxWidth: columnWidths[colIndex].maxWidth
              }}
            >
              <div className="truncate w-full" title={typeof content === 'string' ? content : undefined}>
                {content}
              </div>
            </div>
          );
        })}
      </div>
    );
  }, [columns, columnWidths, rowHeight, rowClassName, zebra, hoverable, onRowClick]);

  // Loading state
  if (loading) {
    return (
      <div className={cn("border rounded-lg overflow-hidden", className)}>
        {renderHeader()}
        <div
          className="flex items-center justify-center text-slate-500"
          style={{ height: containerHeight - 48 }}
        >
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (data.length === 0) {
    return (
      <div className={cn("border rounded-lg overflow-hidden", className)}>
        {renderHeader()}
        <div
          className="flex items-center justify-center text-slate-500"
          style={{ height: containerHeight - 48 }}
        >
          {emptyText}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("border rounded-lg overflow-hidden", className)}>
      {renderHeader()}

      <div
        className="overflow-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600"
        style={{ height: containerHeight - (stickyHeader ? 48 : 0) }}
        onScroll={handleScroll}
      >
        <div style={{ height: totalHeight, position: 'relative' }}>
          <div style={{ transform: `translateY(${offsetY}px)` }}>
            {visibleItems.map(({ item, index }) =>
              renderRow(item, index, index - visibleRange.start)
            )}
          </div>
        </div>
      </div>

      {/* Row count indicator */}
      <div className="px-4 py-2 text-xs text-slate-500 border-t bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
        <span>
          Showing {visibleRange.start + 1}-{Math.min(visibleRange.end, data.length)} of {data.length} rows
        </span>
        <span>
          Rendered: {visibleItems.length} rows
        </span>
      </div>
    </div>
  );
});

VirtualTable.displayName = 'VirtualTable';

/**
 * Enhanced Virtual Table with built-in sorting and filtering
 */
interface EnhancedVirtualTableProps<T = any> extends Omit<VirtualTableProps<T>, 'sortField' | 'sortOrder' | 'onSort'> {
  enableSort?: boolean;
  initialSort?: { field: string; order: 'asc' | 'desc' };
}

export const EnhancedVirtualTable = memo(<T extends Record<string, any>>({
  data: originalData,
  enableSort = true,
  initialSort,
  ...props
}: EnhancedVirtualTableProps<T>) => {
  const [sortState, setSortState] = React.useState<SortState | undefined>(initialSort);

  // Sorted data
  const sortedData = useMemo(() => {
    if (!sortState || !enableSort) return originalData;

    return [...originalData].sort((a, b) => {
      const aValue = a[sortState.field];
      const bValue = b[sortState.field];

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else if (aValue instanceof Date && bValue instanceof Date) {
        comparison = aValue.getTime() - bValue.getTime();
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return sortState.order === 'asc' ? comparison : -comparison;
    });
  }, [originalData, sortState, enableSort]);

  const handleSort = useCallback((field: string, order: 'asc' | 'desc') => {
    setSortState({ field, order });
  }, []);

  return (
    <VirtualTable
      {...props}
      data={sortedData}
      sortField={sortState?.field}
      sortOrder={sortState?.order}
      onSort={enableSort ? handleSort : undefined}
    />
  );
});

EnhancedVirtualTable.displayName = 'EnhancedVirtualTable';

export default VirtualTable;