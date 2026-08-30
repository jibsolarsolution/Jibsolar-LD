export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

import connectToDatabase from '@/lib/db';
import { StatsService } from '@/server/services/stats.service';
import { StatsQuerySchema } from '@/server/validators/lead-query.validator';
import { sendSuccess, sendError } from '@/server/utils/response';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const rawParams = Object.fromEntries(searchParams.entries());

    const validationResult = StatsQuerySchema.safeParse(rawParams);
    if (!validationResult.success) {
      const issues = validationResult.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return sendError('Invalid query parameters.', 'VALIDATION_ERROR', 400, issues);
    }

    await connectToDatabase();

    const service = new StatsService();
    const stats = await service.getDashboardStats(validationResult.data);

    return sendSuccess(stats, 'Stats fetched successfully');
  } catch {
    return sendError('Failed to load dashboard statistics.', 'DATABASE_ERROR', 500);
  }
}
