export interface IUserLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  city?: string;
  profession?: string;
  countryCode: string;
  timezone: string;
  status: 'ACTIVE' | 'DELETED' | 'ONHOLD';
  monthlyPowerBill?: string;
  touchpointCount: number;
  latestCampaign?: {
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_content?: string;
    utm_term?: string;
    route: string;
    createdAt: string;
  };
  createdAt: string;
}

export interface ITouchpoint {
  id: string;
  route: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  platform?: string;
  gclid?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  matchtype?: string;
  network?: string;
  device?: string;
  keyword?: string;
  placement?: string;
  campaignid?: string;
  adgroupid?: string;
  createdAt: string;
}

export interface ILeadDetails extends IUserLead {
  touchpoints: ITouchpoint[];
}

export interface IDashboardStats {
  totalLeads: number;
  withAttribution: {
    attributedCount: number;
    directCount: number;
  };
  cities: {
    distinctCount: number;
    topCity: string;
  };
  topCampaign?: {
    utm_source: string;
    utm_campaign: string;
    count: number;
  };
}

export interface IFilterOptions {
  cities: string[];
  utmSources: string[];
  utmMediums: string[];
  utmCampaigns: string[];
}

export interface IPaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
