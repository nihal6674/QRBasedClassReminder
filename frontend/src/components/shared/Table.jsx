import clsx from 'clsx';

export const Table = ({ className, ...props }) => (
  <div className="relative w-full overflow-auto">
    <table className={clsx('w-full caption-bottom text-sm', className)} {...props} />
  </div>
);

export const TableHeader = ({ className, ...props }) => (
  <thead className={clsx('[&_tr]:border-b', className)} {...props} />
);

export const TableBody = ({ className, ...props }) => (
  <tbody className={clsx('[&_tr:last-child]:border-0', className)} {...props} />
);

export const TableFooter = ({ className, ...props }) => (
  <tfoot className={clsx('bg-primary font-medium text-primary-foreground', className)} {...props} />
);

export const TableRow = ({ className, ...props }) => (
  <tr
    className={clsx(
      'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
      className
    )}
    {...props}
  />
);

export const TableHead = ({ className, ...props }) => (
  <th
    className={clsx(
      'h-12 px-4 text-left align-middle font-medium text-muted-foreground',
      '[&:has([role=checkbox])]:pr-0',
      className
    )}
    {...props}
  />
);

export const TableCell = ({ className, ...props }) => (
  <td className={clsx('p-4 align-middle [&:has([role=checkbox])]:pr-0', className)} {...props} />
);
