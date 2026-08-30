import User from '@/models/User';
import UtmCampaign from '@/models/UtmCampaign';
import { getDateRangeBounds } from '@/lib/date';
import { IDashboardStats } from '@/lib/types';
import { ParsedStatsQuery } from '@/server/validators/lead-query.validator';

export class StatsService {
  async getDashboardStats(query: ParsedStatsQuery): Promise<IDashboardStats> {
    const { range = 'today', startDate, endDate } = query;
    const { start, end } = getDateRangeBounds(range, startDate, endDate, 'Asia/Kolkata');

    const userFilter: Record<string, unknown> = {
      createdAt: { $gte: start, $lte: end },
    };

    // 1. Total Leads & Attributed Leads (bounded single aggregation pipeline)
    const [userAgg] = await User.aggregate<{
      totalLeads: number;
      attributedCount: number;
    }>([
      { $match: userFilter },
      {
        $lookup: {
          from: 'utm_campaigns',
          localField: '_id',
          foreignField: 'userId',
          as: 'touchpoints',
        },
      },
      {
        $addFields: {
          hasAttribution: {
            $gt: [
              {
                $size: {
                  $filter: {
                    input: '$touchpoints',
                    as: 'tp',
                    cond: {
                      $and: [
                        { $ne: ['$$tp.utm_source', null] },
                        { $regexMatch: { input: { $ifNull: ['$$tp.utm_source', ''] }, regex: '\\S' } },
                      ],
                    },
                  },
                },
              },
              0,
            ],
          },
        },
      },
      {
        $group: {
          _id: null,
          totalLeads: { $sum: 1 },
          attributedCount: { $sum: { $cond: ['$hasAttribution', 1, 0] } },
        },
      },
    ]);

    const totalLeads = userAgg?.totalLeads || 0;
    const attributedCount = userAgg?.attributedCount || 0;
    const directCount = Math.max(0, totalLeads - attributedCount);

    // 2. Cities (Unique non-empty cities count and Top City in active period)
    const cityAgg = await User.aggregate<{ _id: string; count: number }>([
      {
        $match: {
          ...userFilter,
          city: { $exists: true, $ne: null, $regex: /\S/ },
        },
      },
      {
        $project: {
          cleanedCity: { $trim: { input: '$city' } },
        },
      },
      {
        $match: { cleanedCity: { $ne: '' } },
      },
      {
        $group: {
          _id: '$cleanedCity',
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);

    const distinctCitiesCount = cityAgg.length;
    const topCity = cityAgg.length > 0 ? cityAgg[0]._id : 'N/A';

    // 3. Top Campaign (bounded aggregation joining utm_campaigns with users in date period)
    const topCampaignAgg = await UtmCampaign.aggregate<{
      _id: { utm_source: string; utm_campaign: string };
      count: number;
    }>([
      {
        $match: {
          utm_source: { $exists: true, $ne: null, $regex: /\S/ },
          utm_campaign: { $exists: true, $ne: null, $regex: /\S/ },
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDoc',
        },
      },
      { $unwind: '$userDoc' },
      {
        $match: {
          'userDoc.createdAt': { $gte: start, $lte: end },
        },
      },
      {
        $project: {
          source: { $trim: { input: '$utm_source' } },
          campaign: { $trim: { input: '$utm_campaign' } },
        },
      },
      {
        $match: {
          source: { $ne: '' },
          campaign: { $ne: '' },
        },
      },
      {
        $group: {
          _id: { utm_source: '$source', utm_campaign: '$campaign' },
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ]);

    let topCampaign: IDashboardStats['topCampaign'] = undefined;
    if (topCampaignAgg.length > 0) {
      topCampaign = {
        utm_source: topCampaignAgg[0]._id.utm_source,
        utm_campaign: topCampaignAgg[0]._id.utm_campaign,
        count: topCampaignAgg[0].count,
      };
    }

    return {
      totalLeads,
      withAttribution: {
        attributedCount,
        directCount,
      },
      cities: {
        distinctCount: distinctCitiesCount,
        topCity,
      },
      topCampaign,
    };
  }
}
