
import React from 'react';
import { WorkOrder, WorkStatus } from './types';

export const CHAPTERS = ['Infrastrutture', 'Tecnologia', 'Marketing', 'Operazioni', 'Manutenzione'];
export const FINANCING_SOURCES = ['Fondo Pubblico A', 'Sovvenzione Privata B', 'Budget Operativo', 'Riserva Strategica'];

export const SAMPLE_DATA: WorkOrder[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-001',
    description: 'Aggiornamento Infrastruttura Rete Ufficio',
    originalValue: 15000,
    chapter: 'Tecnologia',
    financingSource: 'Budget Operativo',
    status: WorkStatus.COMPLETED,
    createdAt: '2024-01-15',
    bidResult: {
      winner: 'NetSolutions S.r.l.',
      bidValue: 13200,
      date: '2024-02-01'
    }
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-002',
    description: 'Ristrutturazione e Tinteggiatura Hall',
    originalValue: 8500,
    chapter: 'Infrastrutture',
    financingSource: 'Fondo Pubblico A',
    status: WorkStatus.IN_PROGRESS,
    createdAt: '2024-02-10',
    bidResult: {
      winner: 'Edilizia Creativa Co.',
      bidValue: 8000,
      date: '2024-03-05'
    }
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-003',
    description: 'Campagna Marketing Q2 - Digitale',
    originalValue: 25000,
    chapter: 'Marketing',
    financingSource: 'Sovvenzione Privata B',
    status: WorkStatus.BIDDING,
    createdAt: '2024-03-20'
  }
];

export const ICONS = {
  Dashboard: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  Catalog: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  Trends: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Plus: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H12" />
    </svg>
  ),
  ChevronRight: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  ),
  Sparkles: (props: React.SVGProps<SVGSVGElement>) => (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
    </svg>
  )
};
