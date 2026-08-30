import { NextResponse } from 'next/server';

export const SECURITY_CACHE_HEADERS = {
  'Cache-Control': 'private, no-store, max-age=0, must-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
  'X-Content-Type-Options': 'nosniff',
};

export interface ValidationErrorIssue {
  field: string;
  message: string;
}

export const sendSuccess = <T>(data: T, message = 'Success', status = 200) => {
  return NextResponse.json(
    {
      success: true,
      message,
      data,
    },
    {
      status,
      headers: SECURITY_CACHE_HEADERS,
    }
  );
};

export const sendError = (
  message = 'An unexpected error occurred.',
  code = 'UNKNOWN_ERROR',
  status = 500,
  validationErrors?: ValidationErrorIssue[]
) => {
  const payload: Record<string, any> = {
    success: false,
    message,
    code,
  };

  if (validationErrors && Array.isArray(validationErrors) && validationErrors.length > 0) {
    payload.validationErrors = validationErrors;
  }

  return NextResponse.json(payload, {
    status,
    headers: SECURITY_CACHE_HEADERS,
  });
};
