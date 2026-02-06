import clsx from 'clsx';
import { AlertCircle, CheckCircle2, Info, XCircle } from 'lucide-react';

const alertVariants = {
  default: 'bg-background text-foreground border-border',
  destructive: 'bg-destructive/10 text-destructive border-destructive/50',
  success: 'bg-green-50 text-green-900 border-green-200',
  warning: 'bg-yellow-50 text-yellow-900 border-yellow-200',
  info: 'bg-blue-50 text-blue-900 border-blue-200',
};

const alertIcons = {
  default: Info,
  destructive: XCircle,
  success: CheckCircle2,
  warning: AlertCircle,
  info: Info,
};

const Alert = ({ className, variant = 'default', children, ...props }) => {
  const Icon = alertIcons[variant];

  return (
    <div
      role="alert"
      className={clsx(
        'relative w-full rounded-lg border p-4',
        'flex items-start gap-3',
        alertVariants[variant],
        className
      )}
      {...props}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <div className="flex-1">{children}</div>
    </div>
  );
};

export const AlertTitle = ({ className, ...props }) => (
  <h5 className={clsx('mb-1 font-medium leading-none tracking-tight', className)} {...props} />
);

export const AlertDescription = ({ className, ...props }) => (
  <div className={clsx('text-sm [&_p]:leading-relaxed', className)} {...props} />
);

export default Alert;
