import { Card, CardContent } from '@components/shared/Card';
import { CLASS_TYPE_LABELS, CLASS_TYPES } from '@utils/constants';
import clsx from 'clsx';
import { CheckCircle2 } from 'lucide-react';

const ClassTypeSelector = ({ selectedClassType, onSelect, disabled = false }) => {
  const classTypeOptions = Object.entries(CLASS_TYPE_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-foreground">Select Training Type</h2>
      <p className="text-sm text-muted-foreground">
        Choose the training you want to register for
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {classTypeOptions.map((option) => {
          const isSelected = selectedClassType === option.value;

          return (
            <button
              key={option.value}
              onClick={() => onSelect(option.value)}
              disabled={disabled}
              className={clsx(
                'relative rounded-lg border-2 p-4 text-left transition-all',
                'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                'disabled:cursor-not-allowed disabled:opacity-50',
                'touch-manipulation tap-highlight-transparent',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-background hover:border-primary/50 hover:bg-accent'
              )}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="font-medium text-foreground">{option.label}</p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="ml-2 h-5 w-5 flex-shrink-0 text-primary" />
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ClassTypeSelector;
