export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import connectToDatabase from '@/lib/db';
import { LeadService } from '@/server/services/lead.service';
import { ObjectIdSchema } from '@/server/validators/lead-query.validator';
import { sendSuccess, sendError } from '@/server/utils/response';
import { NextRequest } from 'next/server';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const { id } = resolvedParams;

    const validationResult = ObjectIdSchema.safeParse(id);
    if (!validationResult.success) {
      return sendError('Invalid lead ID format.', 'VALIDATION_ERROR', 400, [
        { field: 'id', message: 'Invalid lead ID format.' },
      ]);
    }

    await connectToDatabase();

    const service = new LeadService();
    const leadDetails = await service.getLeadById(id);

    if (!leadDetails) {
      return sendError('Lead record not found.', 'NOT_FOUND', 404);
    }

    return sendSuccess(leadDetails, 'Lead details fetched successfully');
  } catch (error) {
    return sendError('Failed to fetch lead details.', 'DATABASE_ERROR', 500);
  }
}
