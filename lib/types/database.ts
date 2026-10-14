export type UserRole = 'leader' | 'officer';

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  position: string;
  created_at: string;
  updated_at: string;
}

export type ProjectKind = 'active_project' | 'business_unit' | 'upcoming';
export type UnitLabel = 'unit' | 'kamar';

export interface Project {
  id: string;
  slug: string;
  name: string;
  location: string;
  kind: ProjectKind;
  unit_label: UnitLabel;
  total_units: number;
  breakdown?: Record<string, number> | null;
  instagram_handle?: string | null;
  created_at: string;
  updated_at: string;
}

export interface UnitSnapshot {
  id: string;
  project_id: string;
  snapshot_date: string;
  belum_terjual: number;
  booking: number;
  sp3k: number;
  akad_kredit: number;
  cash_keras: number;
  hold_manajemen: number;
  created_at: string;
  updated_at: string;
}

export interface KosSnapshot {
  id: string;
  project_id: string;
  snapshot_date: string;
  terisi: number;
  belum_terisi: number;
  booking_hold: number;
  created_at: string;
  updated_at: string;
}

export type ChannelPlatform = 'instagram' | 'website' | 'google_maps' | 'youtube' | 'tiktok';
export type ChannelKind = 'corporate' | 'project' | 'business_unit' | 'office' | 'gallery';

export interface Channel {
  id: string;
  platform: ChannelPlatform;
  kind: ChannelKind;
  name: string;
  handle?: string | null;
  url?: string | null;
  project_id?: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChannelInsight {
  id: string;
  channel_id: string;
  period_type: '7d' | '30d';
  period_start: string;
  period_end: string;
  metric_key: string;
  value: number;
  source: 'import' | 'manual';
  created_at: string;
  updated_at: string;
}

export type ActivityCategory =
  | 'content_production'
  | 'design'
  | 'social_posting'
  | 'community_management'
  | 'seo_website'
  | 'google_maps'
  | 'reporting_monitoring'
  | 'event'
  | 'offline_production'
  | 'sales_support'
  | 'sosialisasi'
  | 'meeting'
  | 'research'
  | 'other';

export type ActivityStatus = 'planned' | 'in_progress' | 'done' | 'blocked' | 'carried_over';

export interface DailyActivity {
  id: string;
  activity_date: string;
  pic_id: string;
  title: string;
  description?: string | null;
  category: ActivityCategory;
  project_id?: string | null;
  channel_id?: string | null;
  status: ActivityStatus;
  duration_minutes?: number | null;
  output_url?: string | null;
  notes?: string | null;
  leader_note?: string | null;
  created_at: string;
  updated_at: string;
  // Joins
  pic?: Profile;
  project?: Project;
  channel?: Channel;
}

export type PlanPeriodType = 'weekly' | 'monthly';
export type PlanStatus = 'draft' | 'active' | 'completed';

export interface MarketingPlan {
  id: string;
  period_type: PlanPeriodType;
  period_start: string;
  period_end: string;
  title: string;
  objective?: string | null;
  status: PlanStatus;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  items?: PlanItem[];
}

export interface PlanItem {
  id: string;
  plan_id: string;
  project_id?: string | null;
  title: string;
  description?: string | null;
  pic_id: string;
  scope: 'online' | 'offline';
  target_metric?: string | null;
  target_value?: string | null;
  due_date?: string | null;
  status: ActivityStatus;
  created_at: string;
  updated_at: string;
  pic?: Profile;
  project?: Project;
}

export interface Evaluation {
  id: string;
  period_type: PlanPeriodType;
  period_start: string;
  period_end: string;
  plan_id?: string | null;
  summary?: string | null;
  wins?: string | null;
  issues?: string | null;
  learnings?: string | null;
  next_actions?: string | null;
  created_by: string;
  created_at: string;
  updated_at: string;
  creator?: Profile;
  plan?: MarketingPlan;
  items?: EvaluationItem[];
}

export interface EvaluationItem {
  id: string;
  evaluation_id: string;
  plan_item_id?: string | null;
  target_value?: string | null;
  actual_value?: string | null;
  status: string;
  note?: string | null;
  created_at: string;
  updated_at: string;
  plan_item?: PlanItem;
}

export type ContentPillar =
  | 'product_info'
  | 'promo'
  | 'testimonial'
  | 'progress_update'
  | 'edu_kpr'
  | 'lifestyle_lokasi'
  | 'event'
  | 'brand'
  | 'other';

export type ContentFormat = 'reel' | 'carousel' | 'single_post' | 'story' | 'video' | 'short' | 'article';
export type ContentStatus = 'idea' | 'in_production' | 'review' | 'scheduled' | 'published' | 'cancelled';

export interface ContentItem {
  id: string;
  publish_date: string;
  publish_time?: string | null;
  channel_id: string;
  project_id?: string | null;
  pillar: ContentPillar;
  format: ContentFormat;
  title: string;
  brief?: string | null;
  caption?: string | null;
  status: ContentStatus;
  pic_id: string;
  post_url?: string | null;
  assets_url?: string | null;
  created_at: string;
  updated_at: string;
  pic?: Profile;
  channel?: Channel;
  project?: Project;
}

export type EventType = 'weekly' | 'monthly' | 'special';
export type EventStatus = 'planned' | 'prepared' | 'done' | 'cancelled';

export interface OfflineEvent {
  id: string;
  title: string;
  event_type: EventType;
  event_date: string;
  start_time?: string | null;
  end_time?: string | null;
  location: string;
  project_id?: string | null;
  objective?: string | null;
  budget_planned: number;
  budget_actual: number;
  target_visitors: number;
  actual_visitors: number;
  leads: number;
  bookings: number;
  status: EventStatus;
  pic_id: string;
  documentation_url?: string | null;
  evaluation_notes?: string | null;
  created_at: string;
  updated_at: string;
  pic?: Profile;
  project?: Project;
}

export type SalesSupportType =
  | 'konten_promo'
  | 'brosur'
  | 'price_list'
  | 'video'
  | 'foto_unit'
  | 'template_wa'
  | 'other';

export type SalesSupportStatus = 'requested' | 'in_progress' | 'delivered' | 'revision';

export interface SalesSupportRequest {
  id: string;
  request_date: string;
  requested_by: string;
  project_id?: string | null;
  request_type: SalesSupportType;
  description?: string | null;
  due_date?: string | null;
  status: SalesSupportStatus;
  pic_id?: string | null;
  output_url?: string | null;
  created_at: string;
  updated_at: string;
  pic?: Profile;
  project?: Project;
}

export interface SosialisasiAssist {
  id: string;
  activity_date: string;
  location: string;
  institution: string;
  project_id?: string | null;
  expected_attendees: number;
  actual_attendees: number;
  support_provided?: string | null;
  outcome?: string | null;
  status: string;
  pic_id: string;
  documentation_url?: string | null;
  created_at: string;
  updated_at: string;
  pic?: Profile;
  project?: Project;
}

export type PropItemType =
  | 'baliho'
  | 'banner'
  | 'spanduk'
  | 'umbul_umbul'
  | 'flyer'
  | 'brosur'
  | 'x_banner'
  | 'signage'
  | 'other';

export type PropStatus =
  | 'needed'
  | 'design'
  | 'proofing'
  | 'printing'
  | 'ready'
  | 'installed'
  | 'needs_replacement';

export interface MarketingProp {
  id: string;
  item_type: PropItemType;
  project_id?: string | null;
  is_revitalization: boolean;
  location_description?: string | null;
  quantity: number;
  size?: string | null;
  vendor?: string | null;
  cost: number;
  status: PropStatus;
  design_url?: string | null;
  install_date?: string | null;
  condition_note?: string | null;
  pic_id?: string | null;
  created_at: string;
  updated_at: string;
  pic?: Profile;
  project?: Project;
}

export interface ReportRun {
  id: string;
  report_type: 'weekly' | 'monthly';
  period_start: string;
  period_end: string;
  generated_by: string;
  created_at: string;
  generator?: Profile;
}

export interface CampaignCreativeAsset {
  id: string;
  name: string;
  asset_type: 'reel_video' | 'carousel' | 'digital_ad' | 'story' | 'spanduk' | 'brosur' | 'wa_broadcast';
  status: 'pending' | 'in_progress' | 'ready';
  notes?: string;
}

export interface Campaign {
  id: string;
  title: string;
  tagline: string;
  period_start: string;
  period_end: string;
  project_id?: string | null;
  status: 'draft' | 'active' | 'completed' | 'paused';
  budget_idr: number;
  target_leads: number;
  target_bookings: number;
  actual_leads: number;
  actual_bookings: number;
  channels: ChannelPlatform[];
  key_message: string;
  creative_assets: CampaignCreativeAsset[];
  created_at: string;
  updated_at: string;
  project?: Project;
}
