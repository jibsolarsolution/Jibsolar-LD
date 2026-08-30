export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import connectToDatabase from '@/lib/db';
import { FilterOptionsService } from '@/server/services/filter-options.service';
import { sendSuccess, sendError } from '@/server/utils/response';

export async function GET() {
  try {
    await connectToDatabase();
    const service = new FilterOptionsService();
    const options = await service.getFilterOptions();
    return sendSuccess(options, 'Filter options fetched successfully');
  } catch {
    return sendError('Failed to load filter options.', 'DATABASE_ERROR', 500);
  }
}
