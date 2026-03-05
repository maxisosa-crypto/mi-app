export interface Installment {
  number: number;
  status: 'COBRADA' | 'PENDIENTE';
  amount: number;
  affiliateId: string;
}

export interface OrderEntry {
  id: string;
  dni: string;
  orderNumber: string;
  totalOrder: number;
  totalInstallments: number;
  paidInstallments: number;
  paymentMethod: string;
  isSpecialPlan: boolean;
  dppLotNumber?: string;
  dppLotTotal?: number;
  startAffiliateId?: string;
  isFullyPaidLot?: boolean;
  targetCreditLotNumber?: string;
  targetLotTotal?: number;
  targetLotInstallments?: number;
  targetLotPaidInstallments?: number;
  newTotalInstallments?: number;
}

export interface LotSummary {
  lotNumber: string;
  originalTotal: number;
  adjustedTotal: number;
  cancelledAmount: number;
  installmentAmount: number;
  installments: Installment[];
  orders: OrderEntry[];
  details?: {
    cuotasCobradas: number;
    cuotasRestantes: number;
    totalCancelado: number;
    nuevoValorCuota: number;
    saldoRemanente: number;
    porcentajeCancelado: number;
    montoYaPagadoAnuladas: number;
    porcentajePagoOrden: number;
  };
}

export interface RefinanceResult {
  lots: LotSummary[];
  otherOrders: OrderEntry[];
}

export interface HistoryRecord {
  id: string;
  timestamp: string;
  dni: string;
  orderNumber: string;
  paymentMethod: string;
  action: string;
  cancelledAmount: number;
  lotNumber?: string;
}
