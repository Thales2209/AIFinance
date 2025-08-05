
import type { Tables } from './services/database.types';

export type Transaction = Tables<'transactions'>['Row'];
export type Task = Tables<'tasks'>['Row'];


export interface MonthlySummary {
  name: string;
  Receita: number;
  Despesa: number;
}
