import User from '@/models/User';
import UtmCampaign from '@/models/UtmCampaign';
import { IFilterOptions } from '@/lib/types';
import { Model } from 'mongoose';

export class FilterOptionsService {
  private async getBoundedOptions(
    model: Model<any>,
    field: string
  ): Promise<string[]> {
    const results = await model.aggregate<{ value: string }>([
      {
        $match: {
          [field]: { $type: 'string', $ne: null },
        },
      },
      {
        $project: {
          cleanedValue: {
            $trim: {
              input: `$${field}`,
            },
          },
        },
      },
      {
        $match: {
          cleanedValue: { $ne: '' },
        },
      },
      {
        $group: {
          _id: '$cleanedValue',
        },
      },
      {
        $sort: { _id: 1 },
      },
      {
        $limit: 100,
      },
      {
        $project: {
          _id: 0,
          value: '$_id',
        },
      },
    ]);

    return results.map((r) => r.value);
  }

  async getFilterOptions(): Promise<IFilterOptions> {
    const [cities, utmSources, utmMediums, utmCampaigns] = await Promise.all([
      this.getBoundedOptions(User, 'city'),
      this.getBoundedOptions(UtmCampaign, 'utm_source'),
      this.getBoundedOptions(UtmCampaign, 'utm_medium'),
      this.getBoundedOptions(UtmCampaign, 'utm_campaign'),
    ]);

    return {
      cities,
      utmSources,
      utmMediums,
      utmCampaigns,
    };
  }
}
