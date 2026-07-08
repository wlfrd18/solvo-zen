export interface IncomeSource {
  id: number;
  label: string;
  amount: string;
  day_of_month: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface FixedExpense {
  id: number;
  label: string;
  amount: string;
  day_of_month: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OneTimeExpense {
  id: number;
  label: string;
  amount: string;
  date: string;
  created_at: string;
}

export interface StartingBalance {
  id: number;
  amount: string;
  updated_at: string;
}

export type DayEventKind = "income" | "fixed_expense" | "one_time_expense";

export interface DayEvent {
  label: string;
  amount: string;
  kind: DayEventKind;
}

export interface ProjectionDay {
  date: string;
  balance: string;
  events: DayEvent[];
}

export interface OverdraftAlert {
  date: string;
  balance: string;
  triggered_by: string[];
}

export interface ProjectionResponse {
  days: ProjectionDay[];
  lowest_balance: string;
  lowest_balance_date: string;
  has_overdraft_risk: boolean;
  overdraft_alerts: OverdraftAlert[];
}

export interface SafeToSpendResponse {
  daily_budget: string;
  next_income_date: string | null;
  days_remaining: number;
  balance_before_next_income: string;
  has_upcoming_income: boolean;
}
