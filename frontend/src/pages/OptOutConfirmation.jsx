import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@components/shared/Card';
import Button from '@components/shared/Button';
import Alert, { AlertDescription } from '@components/shared/Alert';
import { updateOptOutPreference, getStudentSignups } from '@services/studentService';
import Spinner from '@components/shared/Spinner';
import { BellOff, Mail, Phone } from 'lucide-react';

const OptOutConfirmation = () => {
  const { studentId } = useParams();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [student, setStudent] = useState(null);
  const [preferences, setPreferences] = useState({
    optedOutEmail: false,
    optedOutSms: false,
  });
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchStudentData();
  }, [studentId]);

  const fetchStudentData = async () => {
    try {
      setLoading(true);
      const response = await getStudentSignups(studentId);
      setStudent(response.data.student);
      setPreferences({
        optedOutEmail: response.data.student.optedOutEmail || false,
        optedOutSms: response.data.student.optedOutSms || false,
      });
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch student data:', err);
      setError(err.message || 'Failed to load your preferences');
      setLoading(false);
    }
  };

  const handleToggle = (field) => {
    setPreferences((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
    setSuccess(false);
  };

  const handleSave = async () => {
    try {
      setUpdating(true);
      setError(null);
      await updateOptOutPreference(studentId, preferences);
      setSuccess(true);
      setUpdating(false);
    } catch (err) {
      console.error('Failed to update preferences:', err);
      setError(err.message || 'Failed to update preferences');
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error && !student) {
    return (
      <div className="min-h-screen bg-background px-4 py-8">
        <div className="mx-auto max-w-2xl">
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-center">
              <div className="rounded-full bg-primary/10 p-3">
                <BellOff className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-center">Notification Preferences</CardTitle>
            <p className="text-center text-sm text-muted-foreground">
              Manage how you receive training reminders
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
            {/* Success Alert */}
            {success && (
              <Alert variant="success">
                <AlertDescription>
                  Your notification preferences have been updated successfully.
                </AlertDescription>
              </Alert>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Email Preference */}
            <div className="flex items-start justify-between rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-blue-100 p-2">
                  <Mail className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    {student?.email || 'No email provided'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Receive training reminders via email
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('optedOutEmail')}
                disabled={updating || !student?.email}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  preferences.optedOutEmail ? 'bg-gray-200' : 'bg-primary'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.optedOutEmail ? 'translate-x-1' : 'translate-x-6'
                  }`}
                />
              </button>
            </div>

            {/* SMS Preference */}
            <div className="flex items-start justify-between rounded-lg border p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-md bg-green-100 p-2">
                  <Phone className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-medium text-foreground">SMS Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    {student?.phone || 'No phone provided'}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Receive training reminders via text message
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleToggle('optedOutSms')}
                disabled={updating || !student?.phone}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                  preferences.optedOutSms ? 'bg-gray-200' : 'bg-primary'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.optedOutSms ? 'translate-x-1' : 'translate-x-6'
                  }`}
                />
              </button>
            </div>

            {/* Info Alert */}
            <Alert variant="info">
              <AlertDescription>
                You can change these preferences at any time. Opting out will stop all training
                reminders for the selected channel.
              </AlertDescription>
            </Alert>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              className="w-full"
              size="lg"
              loading={updating}
              disabled={updating}
            >
              Save Preferences
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default OptOutConfirmation;
