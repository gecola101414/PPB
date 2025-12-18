
export enum WorkStatus {
  PLANNING = 'Pianificazione',
  BIDDING = 'Gara d\'Appalto',
  IN_PROGRESS = 'In Corso',
  COMPLETED = 'Completato',
  CANCELLED = 'Annullato'
}

export interface BidResult {
  winner: string;
  bidValue: number;
  date: string;
}

export interface WorkOrder {
  id: string;
  orderNumber: string;
  description: string;
  originalValue: number;
  chapter: string;
  financingSource: string;
  status: WorkStatus;
  bidResult?: BidResult;
  createdAt: string;
}

export interface FinancialStats {
  totalBudget: number;
  totalSpent: number;
  totalEconomies: number;
  countByChapter: Record<string, number>;
  countByStatus: Record<WorkStatus, number>;
}
