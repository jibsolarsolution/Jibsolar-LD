export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import connectToDatabase from '@/lib/db';
import { LeadService } from '@/server/services/lead.service';
import { LeadQuerySchema } from '@/server/validators/lead-query.validator';
import { sendSuccess, sendError } from '@/server/utils/response';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    const validationResult = LeadQuerySchema.safeParse(rawParams);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return sendError('Invalid query parameters.', 'VALIDATION_ERROR', 400, issues);
    }

    await connectToDatabase();

    const service = new LeadService();
    const result = await service.getLeads(validationResult.data);

    return sendSuccess(result, 'Leads fetched successfully');
  } catch (error) {
    return sendError('Failed to fetch leads list.', 'DATABASE_ERROR', 500);
  }
}
