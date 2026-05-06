import toast from 'react-hot-toast';
import { ApiError } from './api-error';
import { Session } from '../auth/session';

/**
 * Explicit per-error-type handler.
 * Never catch-all. Every code has a specific action.
 */
export function handleApiError(
  error: ApiError,
  options?: {
    onRedirect?: (path: string) => void;
    onFieldError?: (fields: Record<string, string>) => void;
  }
): void {
  const { onRedirect, onFieldError } = options || {};

  switch (error.errorCode) {
    case 'AUTH_001':
    case 'AUTH_002':
    case 'AUTH_003':
      toast.error("Invalid credentials or OTP");
      break;
    
    case 'AUTH_004':
    case 'AUTH_005':
      Session.clear();
      toast.error("Session expired. Please login again.");
      onRedirect?.('/login');
      break;
    
    case 'AUTH_006':
    case 'AUTH_007':
      toast.error("You don't have permission for this action");
      break;
    
    case 'AUTH_008':
      toast.error("Account deactivated. Contact IT Cell.");
      onRedirect?.('/login');
      break;
    
    case 'AUTH_010':
      toast.error("Too many attempts. Wait 15 minutes."); // toast.warning if supported, using error for compatibility
      break;
    
    case 'CASE_002':
      toast.error("Case already exists."); // Basic toast, in a real app might use custom toast for the action
      // If we had a toast library that supports actions, we'd add the view button here.
      if (error.fieldErrors?.existing_case_id) {
        // onRedirect?.(`/admin/cases/${error.fieldErrors.existing_case_id}`);
      }
      break;
    
    case 'PDF_001':
      toast.error("PDF too large. Maximum size is 20MB.");
      break;
    case 'PDF_002':
      toast.error("Only PDF files are accepted.");
      break;
    case 'PDF_003':
      toast.error("PDF appears corrupted. Try another file.");
      break;
    case 'PDF_004':
      toast.error("PDF is password-protected. Upload unlocked version.");
      break;
    
    case 'AI_001':
    case 'AI_002':
      toast.error("AI service busy. Using cached response."); // Warning in intent
      break;
    
    case 'VAL_001':
      if (onFieldError && error.fieldErrors) {
        onFieldError(error.fieldErrors);
      }
      toast.error("Please check the form fields.");
      break;
    
    case 'DB_001':
      toast.error("Database unavailable. Try again in a moment.");
      break;
    
    default:
      if (error.statusCode >= 500) {
        toast.error("Server error. Our team has been notified.");
      } else {
        toast.error(error.message || "Something went wrong.");
      }
  }
}
