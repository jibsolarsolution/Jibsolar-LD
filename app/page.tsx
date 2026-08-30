export const dynamic = 'force-dynamic';
export const revalidate = 0;

import connectToDatabase from '@/lib/db';
import { StatsService } from '@/server/services/stats.service';
import { FilterOptionsService } from '@/server/services/filter-options.service';
import { LeadService } from '@/server/services/lead.service';
import { DashboardClient } from '@/components/dashboard/DashboardClient';
import { IDashboardStats, IFilterOptions, IUserLead, IPaginationMeta } from '@/lib/types';

export default async function DashboardPage() {
  let initialStats: IDashboardStats | undefined = undefined;
  let initialFilterOptions: IFilterOptions | undefined = undefined;
  let initialLeads: IUserLead[] = [];
  let initialPagination: IPaginationMeta = { total: 0, page: 1, limit: 10, totalPages: 1 };
  let initialLastUpdated: string | null = null;

  try {
    if (process.env.MONGODB_URI) {
      await connectToDatabase();

      const statsService = new StatsService();
      const optionsService = new FilterOptionsService();
      const leadService = new LeadService();

      const [statsData, optionsData, leadsData] = await Promise.all([
        statsService.getDashboardStats({ range: 'today' }),
        optionsService.getFilterOptions(),
        leadService.getLeads({ range: 'today', page: 1, limit: 10, sort: 'newest' }),
      ]);

      initialStats = statsData;
      initialFilterOptions = optionsData;
      initialLeads = leadsData.leads;
      initialPagination = leadsData.pagination;
      initialLastUpdated = new Date().toISOString();
    }
  } catch {
    // If DB is unavailable during server render, DashboardClient gracefully handles client fetching
  }

  return (
    <DashboardClient
      initialStats={initialStats}
      initialFilterOptions={initialFilterOptions}
      initialLeads={initialLeads}
      initialPagination={initialPagination}
      initialLastUpdated={initialLastUpdated}
    />
  );
}
