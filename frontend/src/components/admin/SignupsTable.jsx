import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@components/shared/Table';
import Badge from '@components/shared/Badge';
import Button from '@components/shared/Button';
import { formatDate, formatEmail, formatPhone, getClassTypeLabel } from '@utils/formatters';
import { getStatusColor } from '@utils/formatters';
import { ArrowUpDown, Mail, Phone } from 'lucide-react';
import clsx from 'clsx';

const SignupsTable = ({ signups, sortConfig, onSort, onSelectSignup, selectedSignupIds }) => {
  const handleSort = (field) => {
    onSort(field);
  };

  const SortButton = ({ field, children }) => {
    const isActive = sortConfig.field === field;
    return (
      <button
        onClick={() => handleSort(field)}
        className="flex items-center gap-1 hover:text-foreground"
      >
        {children}
        <ArrowUpDown
          className={clsx('h-4 w-4', isActive ? 'text-primary' : 'text-muted-foreground')}
        />
      </button>
    );
  };

  if (signups.length === 0) {
    return (
      <div className="rounded-lg border bg-card p-12 text-center">
        <p className="text-muted-foreground">No signups found</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300"
                onChange={(e) => {
                  // TODO: Implement select all
                }}
              />
            </TableHead>
            <TableHead>
              <SortButton field="student.email">Contact</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="classType">Training Type</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="status">Status</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="reminderScheduledDate">Reminder Date</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="reminderSentAt">Sent At</SortButton>
            </TableHead>
            <TableHead>
              <SortButton field="createdAt">Signup Date</SortButton>
            </TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {signups.map((signup) => (
            <TableRow key={signup.id}>
              <TableCell>
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300"
                  checked={selectedSignupIds?.includes(signup.id)}
                  onChange={() => onSelectSignup?.(signup.id)}
                />
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {signup.student?.email && (
                    <div className="flex items-center gap-1.5 text-sm">
                      <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="font-medium">{formatEmail(signup.student.email)}</span>
                    </div>
                  )}
                  {signup.student?.phone && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{formatPhone(signup.student.phone)}</span>
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium">{getClassTypeLabel(signup.classType)}</span>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(signup.status)}>{signup.status}</Badge>
              </TableCell>
              <TableCell className="text-sm">
                {formatDate(signup.reminderScheduledDate, 'MMM dd, yyyy')}
              </TableCell>
              <TableCell className="text-sm">
                {signup.reminderSentAt ? (
                  <span className="text-green-600">
                    {formatDate(signup.reminderSentAt, 'MMM dd, yyyy')}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Not sent</span>
                )}
              </TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(signup.createdAt, 'MMM dd, yyyy')}
              </TableCell>
              <TableCell className="text-right">
                <Button variant="ghost" size="sm">
                  View
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default SignupsTable;
