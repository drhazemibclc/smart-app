import { Database, Inbox, SearchX, Table as TableIcon } from 'lucide-react';
import type React from 'react';
import { isValidElement, useId } from 'react';

interface Column {
  header: string;
  key: string;
  className?: string;
  width?: string;
}

interface TableProps<T> {
  columns: readonly Column[];
  renderRow: (item: T & { index: number }) => React.ReactNode;
  data: T[];
  emptyState?:
    | React.ReactNode
    | {
        title?: string;
        description?: string;
        icon?: React.ReactNode;
        action?: React.ReactNode;
      };
  className?: string;
  striped?: boolean;
  hoverable?: boolean;
  compact?: boolean;
  loading?: boolean;
  showFooter?: boolean;
}

const defaultEmptyState = {
  title: 'No data found',
  description: 'There are no records to display.',
  icon: <Inbox className='h-12 w-12 text-gray-300' />
};

// Helper function to render empty state
const renderEmptyState = (emptyState: TableProps<string>['emptyState']) => {
  if (!emptyState) {
    return (
      <div className='flex flex-col items-center justify-center py-16'>
        {defaultEmptyState.icon}
        <h3 className='mt-4 font-medium text-gray-900 text-lg'>{defaultEmptyState.title}</h3>
        <p className='mt-2 text-gray-500 text-sm'>{defaultEmptyState.description}</p>
      </div>
    );
  }

  // If emptyState is a React node, render it directly
  if (isValidElement(emptyState)) {
    return emptyState;
  }

  // If emptyState is an object with title/description/icon/action
  if (typeof emptyState === 'object' && !isValidElement(emptyState)) {
    const { title, description, icon, action } = emptyState as {
      title?: string;
      description?: string;
      icon?: React.ReactNode;
      action?: React.ReactNode;
    };
    return (
      <div className='flex flex-col items-center justify-center py-16'>
        {icon || defaultEmptyState.icon}
        <h3 className='mt-4 font-medium text-gray-900 text-lg'>{title || defaultEmptyState.title}</h3>
        <p className='mt-2 text-gray-500 text-sm'>{description || defaultEmptyState.description}</p>
        {action && <div className='mt-6'>{action}</div>}
      </div>
    );
  }

  return null;
};

export const Table = <T,>({
  columns,
  renderRow,
  data,
  emptyState = defaultEmptyState,
  className = '',
  striped = true,
  hoverable = true,
  compact = false,
  loading = false,
  showFooter = false
}: TableProps<T>) => {
  const isEmpty = !data || data.length === 0;
  const rowCount = data?.length || 0;
  const ID = useId();
  if (loading) {
    return (
      <div className='w-full overflow-x-auto rounded-lg border border-gray-200'>
        <div className='min-w-full animate-pulse'>
          {/* Header skeleton */}
          <div className='border-b bg-gray-50'>
            <div className='flex'>
              {columns.map((_, idx) => (
                <div
                  className={`px-4 py-3 ${idx === 0 ? 'flex-1' : 'w-32'}`}
                  key={ID}
                >
                  <div className='h-4 rounded bg-gray-200' />
                </div>
              ))}
            </div>
          </div>
          {/* Row skeletons */}
          {[1, 2, 3].map(row => (
            <div
              className='border-b'
              key={row}
            >
              <div className='flex'>
                {columns.map((_, idx) => (
                  <div
                    className={`px-4 py-3 ${idx === 0 ? 'flex-1' : 'w-32'}`}
                    key={ID}
                  >
                    <div className='h-4 rounded bg-gray-100' />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto rounded-lg border border-gray-200 ${className}`}>
      <table className='min-w-full divide-y divide-gray-200'>
        <thead className='bg-gray-50'>
          <tr>
            {columns.map(({ header, key, className, width }) => (
              <th
                className={`px-4 py-3 text-left font-medium text-gray-500 text-xs uppercase tracking-wider ${
                  className || ''
                }`}
                key={String(key)}
                style={width ? { width } : undefined}
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className='divide-y divide-gray-200 bg-white'>
          {isEmpty ? (
            <tr>
              <td colSpan={columns.length}>{renderEmptyState(emptyState)}</td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                className={`transition-colors duration-150 ${striped && index % 2 === 0 ? 'bg-gray-50' : ''}
                                    ${hoverable ? 'hover:bg-gray-100' : ''}
                                    ${compact ? 'h-10' : 'h-12'}
                                `}
                key={ID}
              >
                {renderRow({ ...item, index })}
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Optional footer with row count */}
      {!isEmpty && showFooter && (
        <div className='border-t bg-gray-50 px-4 py-2'>
          <div className='flex items-center justify-between'>
            <div className='text-gray-500 text-sm'>
              Showing <span className='font-medium'>{rowCount}</span> record{rowCount !== 1 ? 's' : ''}
            </div>
            {rowCount > 0 && (
              <div className='flex items-center text-gray-500 text-sm'>
                <TableIcon className='mr-2 h-4 w-4' />
                <span>{rowCount} total</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

// Pre-configured empty state components for common scenarios
export const EmptySearchState = ({ searchTerm, action }: { searchTerm?: string; action?: React.ReactNode }) => (
  <div className='py-12 text-center'>
    <SearchX className='mx-auto h-12 w-12 text-gray-400' />
    <h3 className='mt-2 font-semibold text-gray-900 text-sm'>No results found</h3>
    <p className='mt-1 text-gray-500 text-sm'>
      {searchTerm ? (
        <>
          No results found for <span className='font-medium'>"{searchTerm}"</span>. Try a different search.
        </>
      ) : (
        'No items match your search criteria.'
      )}
    </p>
    {action && <div className='mt-6'>{action}</div>}
  </div>
);

export const EmptyDataState = ({
  title = 'No data available',
  description = 'Get started by adding your first record.',
  icon = <Database className='mx-auto h-12 w-12 text-gray-400' />,
  action
}: {
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}) => (
  <div className='py-12 text-center'>
    {icon}
    <h3 className='mt-2 font-semibold text-gray-900 text-sm'>{title}</h3>
    <p className='mt-1 text-gray-500 text-sm'>{description}</p>
    {action && <div className='mt-6'>{action}</div>}
  </div>
);

// Higher-order component for tables with filtering
export const TableWithFilters = <T,>({
  tableProps,
  filters,
  searchTerm
}: {
  tableProps: TableProps<T>;
  filters?: React.ReactNode;
  searchTerm?: string;
}) => {
  const hasSearchTerm = !!searchTerm;

  // Determine which empty state to use
  const emptyState = hasSearchTerm ? (
    <EmptySearchState
      action={
        tableProps.emptyState && typeof tableProps.emptyState === 'object' && !isValidElement(tableProps.emptyState)
          ? (tableProps.emptyState as { action?: React.ReactNode }).action
          : undefined
      }
      searchTerm={searchTerm}
    />
  ) : (
    tableProps.emptyState
  );

  return (
    <div className='space-y-4'>
      {/* Filter section */}
      {filters && <div className='rounded-lg border border-gray-200 bg-white p-4'>{filters}</div>}

      {/* Table */}
      <Table
        columns={[]}
        data={[]}
        emptyState={emptyState}
        renderRow={function (): React.ReactNode {
          throw new Error('Function not implemented.');
        }}
      />
    </div>
  );
};

// Usage example for your specific case:
/*
import { Baby } from 'lucide-react';

// Your component would look like this:
const ServicesTable = ({ services, clinics, isClinicAdmin }) => {
    const renderRow = (item) => {
        // Your row rendering logic
    };

    return (
        <Table
            columns={columns}
            data={services || []}
            emptyState={
                <div className='py-12 text-center'>
                    <Baby className='mx-auto h-12 w-12 text-gray-400' />
                    <h3 className='mt-2 font-semibold text-gray-900 text-sm'>No pediatric services</h3>
                    <p className='mt-1 text-gray-500 text-sm'>
                        Get started by adding pediatric-specific services like vaccinations and child
                        consultations.
                    </p>
                    {isClinicAdmin && (
                        <div className='mt-6'>
                            <AddService
                                clinics={clinics || []}
                                variant='button'
                            />
                        </div>
                    )}
                </div>
            }
            renderRow={renderRow}
        />
    );
};
*/
