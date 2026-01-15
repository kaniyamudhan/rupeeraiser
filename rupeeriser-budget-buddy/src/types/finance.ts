import { ReactNode } from "react";

export type AccountType = string; 

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dob?: string;
  gender?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  avatar?: string;
}

export interface Account {
  id: string;
  name: string;
  type: string; 
  balance: number;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  category: string;
  note: string;
  type: 'income' | 'expense';
  account: string; 
}

// ✅ Ensuring Goal is defined
export interface Goal {
  id: string;
  name: string;
  amount: number;
  totalMonthly?: ReactNode;
  frequency?: ReactNode;
  amountPerUnit?: ReactNode; 
}

export interface Budget {
  salary: number;
  fixedCosts: {
    rent: number;
    travel: number;
    phone: number;        
    subscriptions: number; 
  };
  // ✅ Ensuring config is optional string
  config?: string; 
  goals: Goal[];
  accounts: Account[];
}

export interface Habit {
  id: string;
  name: string;
  completed_dates: string[];
}
