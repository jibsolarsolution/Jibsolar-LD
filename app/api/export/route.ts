export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import connectToDatabase from '@/lib/db';
import { LeadService } from '@/server/services/lead.service';
import { ExportQuerySchema } from '@/server/validators/lead-query.validator';
import { generateLeadsCsv } from '@/lib/export';
import { sendError, SECURITY_CACHE_HEADERS } from '@/server/utils/response';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    const validationResult = ExportQuerySchema.safeParse(rawParams);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return sendError('Invalid export query parameters.', 'VALIDATION_ERROR', 400, issues);
    }

    await connectToDatabase();

    const service = new LeadService();
    const leads = await service.getLeadsForExport(validationResult.data);
    const csvContent = generateLeadsCsv(leads);

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        ...SECURITY_CACHE_HEADERS,
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="jibsolar_leads_export.csv"',
      },
    });
  } catch {
    return sendError('Failed to generate CSV export.', 'DATABASE_ERROR', 500);
  }
}
