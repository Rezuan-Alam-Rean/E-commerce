import type { ReactNode } from "react";

type TableProps = {
  headers: string[];
  children: ReactNode;
};

export function Table({ headers, children }: TableProps) {
  return (
    <div className="overflow-auto">
      <table className="w-full min-w-[680px] border-separate border-spacing-y-3">
        <thead>
          <tr className="text-left text-xs uppercase tracking-[0.2em] text-muted">
            {headers.map((header) => (
              <th key={header} className="px-4">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

type TableRowProps = {
  children: ReactNode;
  className?: string;
};

export function TableRow({ children, className = "" }: TableRowProps) {
  return (
    <tr className={`rounded-[var(--radius-md)] bg-surface-strong text-sm text-foreground ${className}`}>
      {children}
    </tr>
  );
}

type TableCellProps = {
  children: ReactNode;
  className?: string;
};

export function TableCell({ children, className = "" }: TableCellProps) {
  return <td className={`px-4 py-3 ${className}`}>{children}</td>;
}
