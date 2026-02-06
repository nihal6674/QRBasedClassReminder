import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/shared/Card';
import Alert, { AlertDescription } from '@components/shared/Alert';

const TemplateManager = () => {
  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Message Templates
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage email and SMS templates for training reminders
          </p>
        </div>

        {/* Coming Soon */}
        <Card>
          <CardHeader>
            <CardTitle>Template Manager</CardTitle>
            <CardDescription>Email and SMS template configuration</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert variant="info">
              <AlertDescription>
                Template management functionality is coming soon. You'll be able to customize email
                and SMS templates for each training type.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TemplateManager;
