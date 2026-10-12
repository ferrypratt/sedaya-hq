import {
  MarketingPlan,
  PlanItem,
  Evaluation,
  EvaluationItem,
  ContentItem,
} from '@/lib/types/database';

export const INITIAL_MARKETING_PLANS: (MarketingPlan & { items: PlanItem[] })[] = [];

export const INITIAL_EVALUATIONS: (Evaluation & { items: EvaluationItem[] })[] = [];

export const INITIAL_CONTENT_ITEMS: ContentItem[] = [];
