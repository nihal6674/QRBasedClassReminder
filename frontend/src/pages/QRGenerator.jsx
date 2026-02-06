import { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@components/shared/Card';
import Select from '@components/shared/Select';
import Button from '@components/shared/Button';
import { CLASS_TYPE_LABELS } from '@utils/constants';
import { Download, Link as LinkIcon } from 'lucide-react';
import Alert, { AlertDescription } from '@components/shared/Alert';

const QRGenerator = () => {
  const [selectedClassType, setSelectedClassType] = useState('');
  const [qrSize, setQrSize] = useState(256);

  const classTypeOptions = [
    { value: '', label: 'Select a training type' },
    ...Object.entries(CLASS_TYPE_LABELS).map(([value, label]) => ({ value, label })),
  ];

  const sizeOptions = [
    { value: '128', label: 'Small (128px)' },
    { value: '256', label: 'Medium (256px)' },
    { value: '512', label: 'Large (512px)' },
  ];

  const generateSignupURL = (classType) => {
    const baseURL = import.meta.env.VITE_APP_URL || window.location.origin;
    return `${baseURL}/signup/${classType}`;
  };

  const handleDownloadQR = () => {
    const svg = document.getElementById('qr-code');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = qrSize;
      canvas.height = qrSize;
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `qr-code-${selectedClassType}.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const handleCopyURL = async () => {
    if (!selectedClassType) return;

    const url = generateSignupURL(selectedClassType);
    try {
      await navigator.clipboard.writeText(url);
      alert('URL copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy URL:', err);
    }
  };

  const signupURL = selectedClassType ? generateSignupURL(selectedClassType) : '';

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            QR Code Generator
          </h1>
          <p className="mt-2 text-muted-foreground">
            Generate QR codes and signup links for training sessions
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Configuration Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Configure QR Code</CardTitle>
              <CardDescription>Select training type and customize QR code</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Class Type Selection */}
              <Select
                label="Training Type"
                value={selectedClassType}
                onChange={(e) => setSelectedClassType(e.target.value)}
                options={classTypeOptions}
                required
              />

              {/* QR Size Selection */}
              <Select
                label="QR Code Size"
                value={qrSize.toString()}
                onChange={(e) => setQrSize(Number(e.target.value))}
                options={sizeOptions}
              />

              {/* Info */}
              {selectedClassType && (
                <Alert variant="info">
                  <AlertDescription>
                    Students scanning this QR code will be taken directly to the signup form for{' '}
                    <strong>{CLASS_TYPE_LABELS[selectedClassType]}</strong>.
                  </AlertDescription>
                </Alert>
              )}

              {/* Actions */}
              {selectedClassType && (
                <div className="space-y-3">
                  <Button
                    onClick={handleDownloadQR}
                    className="w-full"
                    disabled={!selectedClassType}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                  </Button>

                  <Button
                    onClick={handleCopyURL}
                    variant="outline"
                    className="w-full"
                    disabled={!selectedClassType}
                  >
                    <LinkIcon className="mr-2 h-4 w-4" />
                    Copy Signup URL
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Preview Panel */}
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>QR code and signup link preview</CardDescription>
            </CardHeader>
            <CardContent>
              {selectedClassType ? (
                <div className="space-y-6">
                  {/* QR Code */}
                  <div className="flex justify-center rounded-lg border bg-white p-8">
                    <QRCodeSVG id="qr-code" value={signupURL} size={qrSize} level="H" />
                  </div>

                  {/* Training Type Label */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-muted-foreground">Training Type</p>
                    <p className="mt-1 text-lg font-semibold text-foreground">
                      {CLASS_TYPE_LABELS[selectedClassType]}
                    </p>
                  </div>

                  {/* URL Display */}
                  <div className="rounded-lg border bg-muted p-4">
                    <p className="text-xs font-medium text-muted-foreground">Signup URL</p>
                    <p className="mt-1 break-all text-sm font-mono text-foreground">{signupURL}</p>
                  </div>

                  {/* Instructions */}
                  <div className="rounded-lg bg-blue-50 p-4">
                    <p className="text-sm font-medium text-blue-900">How to Use</p>
                    <ol className="mt-2 space-y-1 text-sm text-blue-800">
                      <li>1. Download the QR code image</li>
                      <li>2. Print or display the QR code</li>
                      <li>3. Students scan to register directly for this training</li>
                    </ol>
                  </div>
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center rounded-lg border bg-muted">
                  <p className="text-muted-foreground">Select a training type to generate QR code</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* All QR Codes Grid */}
        <Card>
          <CardHeader>
            <CardTitle>All Training QR Codes</CardTitle>
            <CardDescription>Quick access to all training types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {Object.entries(CLASS_TYPE_LABELS).map(([classType, label]) => (
                <button
                  key={classType}
                  onClick={() => setSelectedClassType(classType)}
                  className="rounded-lg border bg-card p-4 text-center transition-all hover:border-primary hover:shadow-md"
                >
                  <div className="mb-2 flex justify-center">
                    <QRCodeSVG value={generateSignupURL(classType)} size={80} level="H" />
                  </div>
                  <p className="text-xs font-medium text-foreground">{label}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QRGenerator;
