import User from '@/models/User';
import UtmCampaign, { IUtmCampaign } from '@/models/UtmCampaign';
import BusinessInfo from '@/models/BusinessInfo';
import { getDateRangeBounds } from '@/lib/date';
import { escapeRegex, normalizePhone, ParsedLeadQuery, ParsedExportQuery } from '@/server/validators/lead-query.validator';
import { IUserLead, ILeadDetails, IPaginationMeta, ITouchpoint } from '@/lib/types';
import mongoose, { PipelineStage } from 'mongoose';

interface AggregatedLeadResult {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  city?: string;
  profession?: string;
  countryCode?: string;
  timezone?: string;
  status: 'ACTIVE' | 'DELETED' | 'ONHOLD';
  createdAt: Date;
  monthlyPowerBill?: string;
  touchpointCount: number;
  latestCampaignDoc?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    route: string;
    createdAt: Date;
  };
}

interface FacetResult {
  metadata: Array<{ total: number }>;
  data: AggregatedLeadResult[];
}

export class LeadService {
  async getLeads(query: ParsedLeadQuery): Promise<{ leads: IUserLead[]; pagination: IPaginationMeta }> {
    const {
      search,
      status,
      city,
      utm_source,
      utm_medium,
      utm_campaign,
      range,
      startDate,
      endDate,
      sort = 'newest',
      page = 1,
      limit = 10,
    } = query;

    const skip = (page - 1) * limit;
    const { start, end } = getDateRangeBounds(range, startDate, endDate, 'Asia/Kolkata');

    const userFilter: Record<string, unknown> = {
      createdAt: { $gte: start, $lte: end },
    };

    if (status) {
      userFilter.status = status;
    }

    if (city) {
      userFilter.city = { $regex: new RegExp(`^${escapeRegex(city)}$`, 'i') };
    }

    if (search) {
      const escaped = escapeRegex(search);
      const phoneDigits = normalizePhone(search);

      const searchConditions: Record<string, unknown>[] = [
        { name: { $regex: escaped, $options: 'i' } },
        { email: { $regex: escaped, $options: 'i' } },
      ];

      if (phoneDigits.length >= 3) {
        searchConditions.push({ phone: { $regex: phoneDigits } });
      }

      userFilter.$or = searchConditions;
    }

    const hasUtmFilter = !!(utm_source || utm_medium || utm_campaign);

    // Build matching conditions for $filter inside aggregation
    const utmMatchConditions: Record<string, unknown>[] = [];
    if (utm_source) {
      utmMatchConditions.push({
        $regexMatch: {
          input: { $ifNull: ['$$tp.utm_source', ''] },
          regex: `^${escapeRegex(utm_source)}$`,
          options: 'i',
        },
      });
    }
    if (utm_medium) {
      utmMatchConditions.push({
        $regexMatch: {
          input: { $ifNull: ['$$tp.utm_medium', ''] },
          regex: `^${escapeRegex(utm_medium)}$`,
          options: 'i',
        },
      });
    }
    if (utm_campaign) {
      utmMatchConditions.push({
        $regexMatch: {
          input: { $ifNull: ['$$tp.utm_campaign', ''] },
          regex: `^${escapeRegex(utm_campaign)}$`,
          options: 'i',
        },
      });
    }

    const pipeline: PipelineStage[] = [
      { $match: userFilter },
      {
        $lookup: {
          from: 'business_info',
          localField: '_id',
          foreignField: 'userId',
          as: 'bizInfo',
        },
      },
      {
        $lookup: {
          from: 'utm_campaigns',
          localField: '_id',
          foreignField: 'userId',
          as: 'allTouchpoints',
        },
      },
    ];

    if (hasUtmFilter) {
      pipeline.push({
        $addFields: {
          matchingTouchpoints: {
            $filter: {
              input: '$allTouchpoints',
              as: 'tp',
              cond: utmMatchConditions.length === 1 ? utmMatchConditions[0] : { $and: utmMatchConditions },
            },
          },
        },
      });

      // Exclude users with 0 matching touchpoints
      pipeline.push({
        $match: {
          'matchingTouchpoints.0': { $exists: true },
        },
      });
    }

    pipeline.push({
      $addFields: {
        touchpointCount: { $size: '$allTouchpoints' },
        targetTouchpoints: hasUtmFilter ? '$matchingTouchpoints' : '$allTouchpoints',
      },
    });

    pipeline.push({
      $addFields: {
        sortedTouchpoints: {
          $sortArray: {
            input: '$targetTouchpoints',
            sortBy: { createdAt: -1 },
          },
        },
      },
    });

    pipeline.push({
      $addFields: {
        latestCampaignDoc: { $arrayElemAt: ['$sortedTouchpoints', 0] },
        bizInfoDoc: { $arrayElemAt: ['$bizInfo', 0] },
      },
    });

    const sortDirection = sort === 'oldest' ? 1 : -1;

    pipeline.push({
      $facet: {
        metadata: [{ $count: 'total' }],
        data: [
          { $sort: { createdAt: sortDirection } },
          { $skip: skip },
          { $limit: limit },
          {
            $project: {
              _id: 1,
              name: 1,
              email: 1,
              phone: 1,
              city: 1,
              profession: 1,
              countryCode: 1,
              timezone: 1,
              status: 1,
              createdAt: 1,
              monthlyPowerBill: '$bizInfoDoc.monthlyPowerBill',
              touchpointCount: 1,
              latestCampaignDoc: {
                utm_source: 1,
                utm_medium: 1,
                utm_campaign: 1,
                utm_content: 1,
                utm_term: 1,
                route: 1,
                createdAt: 1,
              },
            },
          },
        ],
      },
    });

    const [aggregateOutput] = (await User.aggregate(pipeline)) as [FacetResult];

    const total = aggregateOutput?.metadata?.[0]?.total || 0;
    const rawData = aggregateOutput?.data || [];

    const leads: IUserLead[] = rawData.map((u) => ({
      id: u._id.toString(),
      name: u.name,
      email: u.email,
      phone: u.phone,
      city: u.city,
      profession: u.profession,
      countryCode: u.countryCode || '+91',
      timezone: u.timezone || 'Asia/Kolkata',
      status: u.status,
      monthlyPowerBill: u.monthlyPowerBill,
      touchpointCount: u.touchpointCount,
      latestCampaign: u.latestCampaignDoc
        ? {
            utm_source: u.latestCampaignDoc.utm_source,
            utm_medium: u.latestCampaignDoc.utm_medium,
            utm_campaign: u.latestCampaignDoc.utm_campaign,
            utm_content: u.latestCampaignDoc.utm_content,
            utm_term: u.latestCampaignDoc.utm_term,
            route: u.latestCampaignDoc.route,
            createdAt: new Date(u.latestCampaignDoc.createdAt).toISOString(),
          }
        : undefined,
      createdAt: new Date(u.createdAt).toISOString(),
    }));

    return {
      leads,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getLeadById(id: string): Promise<ILeadDetails | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const user = await User.findById(id).lean();
    if (!user) {
      return null;
    }

    const userId = user._id;
    const bizInfo = await BusinessInfo.findOne({ userId }).lean();
    const campaigns = await UtmCampaign.find({ userId })
      .sort({ createdAt: -1 })
      .select('-clientIp -userAgent -__v')
      .lean();

    const touchpoints: ITouchpoint[] = campaigns.map((c: IUtmCampaign) => ({
      id: c._id.toString(),
      route: c.route,
      utm_source: c.utm_source,
      utm_medium: c.utm_medium,
      utm_campaign: c.utm_campaign,
      utm_content: c.utm_content,
      utm_term: c.utm_term,
      platform: c.platform,
      gclid: c.gclid,
      fbclid: c.fbclid,
      fbp: c.fbp,
      fbc: c.fbc,
      matchtype: c.matchtype,
      network: c.network,
      device: c.device,
      keyword: c.keyword,
      placement: c.placement,
      campaignid: c.campaignid,
      adgroupid: c.adgroupid,
      createdAt: new Date(c.createdAt).toISOString(),
    }));

    return {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      phone: user.phone,
      city: user.city,
      profession: user.profession,
      countryCode: user.countryCode || '+91',
      timezone: user.timezone || 'Asia/Kolkata',
      status: user.status,
      monthlyPowerBill: bizInfo?.monthlyPowerBill,
      touchpointCount: touchpoints.length,
      latestCampaign: touchpoints.length > 0 ? touchpoints[0] : undefined,
      createdAt: new Date(user.createdAt).toISOString(),
      touchpoints,
    };
  }

  async getLeadsForExport(query: ParsedExportQuery): Promise<IUserLead[]> {
    const fullQuery: ParsedLeadQuery = {
      ...query,
      page: 1,
      limit: 1000,
    };
    const result = await this.getLeads(fullQuery);
    return result.leads;
  }
}
