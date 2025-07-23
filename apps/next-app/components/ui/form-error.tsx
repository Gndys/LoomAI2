import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { ExclamationTriangleIcon } from "@radix-ui/react-icons"
import { useTranslation } from "@/hooks/use-translation"

interface FormErrorProps {
  message?: string;
  code?: string;
  onResendClick?: () => void;
  userEmail?: string;
}

export function FormError({ message, code, onResendClick, userEmail }: FormErrorProps) {
  const { t } = useTranslation();
  
  if (!message) return null;

  const showResendButton = code === 'EMAIL_NOT_VERIFIED' && userEmail && onResendClick;

  return (
    <Alert variant="destructive" className="mb-6">
      <ExclamationTriangleIcon className="h-4 w-4" />
      <AlertDescription>
        <span>{message} {code ? `- ${code}` : ''}</span>
        {showResendButton && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResendClick}
            className="mx-auto mt-2"
          >
            {t.actions.resendVerificationEmail}
          </Button>
        )}
      </AlertDescription>
    </Alert>
  );
} 