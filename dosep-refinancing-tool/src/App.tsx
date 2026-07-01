import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  History, 
  Mail, 
  Trash2, 
  Download, 
  ClipboardCheck, 
  AlertCircle,
  ChevronRight,
  FileText,
  CreditCard,
  Banknote,
  RefreshCw,
  Plus,
  ListChecks,
  X,
  LayoutDashboard,
  Users,
  FileSpreadsheet,
  ShieldCheck,
  Stethoscope,
  Wallet,
  Pill,
  MapPin,
  Calendar,
  UserRound,
  ChevronDown,
  Search,
  User,
  Percent,
  Heart
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import * as XLSX from 'xlsx';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { Installment, RefinanceResult, HistoryRecord, OrderEntry, LotSummary } from './types';
import { ChatAssistant } from './components/ChatAssistant';

export default function App() {
  // ==========================================
  // NAVEGACIÓN Y VISTAS
  // ==========================================
  const [vistaActiva, setVistaActiva] = useState('refinanciacion');

  // ==========================================
  // ESTADOS: REFINANCIACIÓN (DOSEP)
  // ==========================================
  const [dni, setDni] = useState('');
  const [orderNumber, setOrderNumber] = useState('');
  const [totalOrder, setTotalOrder] = useState<number | ''>('');
  const [totalInstallments, setTotalInstallments] = useState<number | ''>('');
  const [paidInstallments, setPaidInstallments] = useState<number | ''>('');
  const [paymentMethod, setPaymentMethod] = useState('financiado');
  const [isSpecialPlan, setIsSpecialPlan] = useState('no');
  const [dppLotNumber, setDppLotNumber] = useState('');
  const [dppLotTotal, setDppLotTotal] = useState<number | ''>('');
  const [startAffiliateId, setStartAffiliateId] = useState('181225864');
  const [isFullyPaidLot, setIsFullyPaidLot] = useState(false);
  const [targetCreditLotNumber, setTargetCreditLotNumber] = useState('');
  const [targetLotTotal, setTargetLotTotal] = useState<number | ''>('');
  const [targetLotInstallments, setTargetLotInstallments] = useState<number | ''>('');
  const [targetLotPaidInstallments, setTargetLotPaidInstallments] = useState<number | ''>('');
  const [newTotalInstallments, setNewTotalInstallments] = useState<number | ''>('');

  const [pendingOrders, setPendingOrders] = useState<OrderEntry[]>([]);
  const [result, setResult] = useState<RefinanceResult | null>(null);
  const [processing, setProcessing] = useState(false);
  const [generatedMails, setGeneratedMails] = useState<{lot: string, content: string}[]>([]);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedLot, setExpandedLot] = useState<string | null>(null);
  const [cancellingOrder, setCancellingOrder] = useState<{order: OrderEntry, lotNumber?: string} | null>(null);
  const [cancelDni, setCancelDni] = useState('');

  // ==========================================
  // ESTADOS: CALCULADORA DE AJUSTE
  // ==========================================
  const [calcOrigen, setCalcOrigen] = useState('');
  const [calcDestino, setCalcDestino] = useState('');
  const [calcResultado, setCalcResultado] = useState<{porcentaje: number, tipo: string} | null>(null);

  // ==========================================
  // ESTADOS: PLAN MUJER
  // ==========================================
  const [pmDni, setPmDni] = useState('');
  const [pmFechaNac, setPmFechaNac] = useState('');
  const [pmResultado, setPmResultado] = useState<{dni: string, edad: number, dia: string, mes: string, anio: number} | null>(null);
  const [pmHistorial, setPmHistorial] = useState<any[]>([]);
  const [pmShowHistory, setPmShowHistory] = useState(false);
  const [pmSearch, setPmSearch] = useState('');
  const [pmDesde, setPmDesde] = useState('');
  const [pmHasta, setPmHasta] = useState('');

  // Cargar historiales al iniciar
  useEffect(() => {
    const savedHistory = localStorage.getItem('dosep_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const savedPmHistory = localStorage.getItem('historialPlanMujer');
    if (savedPmHistory) setPmHistorial(JSON.parse(savedPmHistory));
  }, []);

  // ==========================================
  // FUNCIONES: REFINANCIACIÓN
  // ==========================================
  const saveToHistory = (record: Omit<HistoryRecord, 'id' | 'timestamp'>) => {
    const newRecord: HistoryRecord = {
      ...record,
      id: crypto.randomUUID(),
      timestamp: new Date().toLocaleString('es-AR'),
    };
    const updatedHistory = [newRecord, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('dosep_history', JSON.stringify(updatedHistory));
  };

  const clearHistory = () => {
    if (window.confirm('¿Está seguro de que desea borrar todo el historial?')) {
      setHistory([]);
      localStorage.removeItem('dosep_history');
    }
  };

  const deleteHistoryRecord = (id: string) => {
    const updatedHistory = history.filter(r => r.id !== id);
    setHistory(updatedHistory);
    localStorage.setItem('dosep_history', JSON.stringify(updatedHistory));
  };

  const exportHistory = () => {
    if (history.length === 0) return;
    const csvContent = [
      ['Fecha', 'DNI', 'Orden', 'Medio', 'Acción', 'Monto Anulado', 'Lote'],
      ...history.map(r => [r.timestamp, r.dni, r.orderNumber, r.paymentMethod, r.action, r.cancelledAmount, r.lotNumber || ''])
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `historial_dosep_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const resetForm = () => {
    setDni(''); setOrderNumber(''); setTotalOrder(''); setTotalInstallments('');
    setPaidInstallments(''); setPaymentMethod('financiado'); setIsSpecialPlan('no');
    setDppLotNumber(''); setDppLotTotal(''); setStartAffiliateId('181225864');
    setIsFullyPaidLot(false); setTargetCreditLotNumber(''); setTargetLotTotal('');
    setTargetLotInstallments(''); setTargetLotPaidInstallments(''); setNewTotalInstallments('');
  };

  const addOrderToBatch = () => {
    if (!dni || !orderNumber || totalOrder === '' || totalInstallments === '') {
      alert('Por favor complete los campos obligatorios (DNI, Orden, Total, Cuotas).');
      return;
    }
    if (Number(totalOrder) <= 0 || Number(totalInstallments) <= 0) {
      alert('El total de la orden y las cuotas deben ser mayores a cero.');
      return;
    }
    if (Number(paidInstallments) > Number(totalInstallments)) {
      alert('Las cuotas cobradas no pueden ser mayores a las cuotas totales.');
      return;
    }
    if (paymentMethod === 'financiado' && (!dppLotNumber || dppLotTotal === '')) {
      alert('Debe ingresar el número de lote DPP y su total.');
      return;
    }

    const newOrder: OrderEntry = {
      id: crypto.randomUUID(), dni, orderNumber,
      totalOrder: Number(totalOrder), totalInstallments: Number(totalInstallments),
      paidInstallments: Number(paidInstallments || 0), paymentMethod,
      isSpecialPlan: isSpecialPlan === 'si',
      dppLotNumber: paymentMethod === 'financiado' ? dppLotNumber : undefined,
      dppLotTotal: paymentMethod === 'financiado' ? Number(dppLotTotal) : undefined,
      startAffiliateId: paymentMethod === 'financiado' ? startAffiliateId : undefined,
      isFullyPaidLot: paymentMethod === 'financiado' ? isFullyPaidLot : false,
      targetCreditLotNumber: (paymentMethod === 'financiado' && isFullyPaidLot) ? targetCreditLotNumber : undefined,
      targetLotTotal: (paymentMethod === 'financiado' && isFullyPaidLot) ? Number(targetLotTotal) : undefined,
      targetLotInstallments: (paymentMethod === 'financiado' && isFullyPaidLot) ? Number(targetLotInstallments) : undefined,
      targetLotPaidInstallments: (paymentMethod === 'financiado' && isFullyPaidLot) ? Number(targetLotPaidInstallments) : undefined,
      newTotalInstallments: newTotalInstallments !== '' ? Number(newTotalInstallments) : undefined,
    };

    setPendingOrders([...pendingOrders, newOrder]);
    setOrderNumber(''); setTotalOrder(''); setIsFullyPaidLot(false);
    setTargetCreditLotNumber(''); setTargetLotTotal('');
    setTargetLotInstallments(''); setTargetLotPaidInstallments(''); setNewTotalInstallments('');
  };

  const removeOrderFromBatch = (id: string) => setPendingOrders(pendingOrders.filter(o => o.id !== id));

  const handleProcessBatch = () => {
    if (pendingOrders.length === 0) { alert('No hay órdenes en la lista para procesar.'); return; }
    setProcessing(true);

    setTimeout(() => {
      const dppOrders = pendingOrders.filter(o => o.paymentMethod === 'financiado' && !o.isSpecialPlan);
      const otherOrders = pendingOrders.filter(o => o.paymentMethod !== 'financiado' || o.isSpecialPlan);
      const adjustedLotGroups: any = {};

      dppOrders.forEach(o => {
        const targetLotNum = o.isFullyPaidLot ? o.targetCreditLotNumber! : o.dppLotNumber!;
        if (!adjustedLotGroups[targetLotNum]) {
          adjustedLotGroups[targetLotNum] = { 
            ordersToCancel: [], incomingCredits: [],
            lotInfo: { 
              total: o.isFullyPaidLot ? (o.targetLotTotal || 0) : (o.dppLotTotal || 0),
              installments: o.isFullyPaidLot ? (o.targetLotInstallments || 0) : o.totalInstallments,
              paid: o.isFullyPaidLot ? (o.targetLotPaidInstallments || 0) : o.paidInstallments,
              startId: o.startAffiliateId || '181225864',
              newTotalInstallments: o.newTotalInstallments
            }
          };
        } else if (o.newTotalInstallments) {
          adjustedLotGroups[targetLotNum].lotInfo.newTotalInstallments = Math.max(
            adjustedLotGroups[targetLotNum].lotInfo.newTotalInstallments || 0,
            o.newTotalInstallments
          );
        }

        if (o.isFullyPaidLot) adjustedLotGroups[targetLotNum].incomingCredits.push(o);
        else adjustedLotGroups[targetLotNum].ordersToCancel.push(o);
      });

      const lotSummaries: LotSummary[] = [];
      const mailLines: string[] = [];

      Object.entries(adjustedLotGroups).forEach(([lotNum, group]: [string, any]) => {
        const lotTotal = group.lotInfo.total;
        const originalTotalCuotas = group.lotInfo.installments || 1;
        const totalCuotas = group.lotInfo.newTotalInstallments || originalTotalCuotas;
        const cuotasCobradas = group.lotInfo.paid;
        const startId = group.lotInfo.startId || '0';

        let totalCancelledInLot = 0; let incomingCredit = 0; let montoYaPagadoAnuladas = 0;

        group.ordersToCancel.forEach((o: any) => {
          totalCancelledInLot += o.totalOrder;
          const valorCuotaOrdenOriginal = originalTotalCuotas > 0 ? o.totalOrder / originalTotalCuotas : 0;
          montoYaPagadoAnuladas += valorCuotaOrdenOriginal * cuotasCobradas;
        });

        group.incomingCredits.forEach((o: any) => incomingCredit += o.totalOrder);

        const totalReduccion = totalCancelledInLot + incomingCredit;
        const nuevoTotalLote = Math.max(0, lotTotal - totalReduccion);
        const valorCuotaOriginal = originalTotalCuotas > 0 ? lotTotal / originalTotalCuotas : 0;
        const totalYaCobrado = cuotasCobradas * valorCuotaOriginal;
        const saldoRemanente = Math.max(0, nuevoTotalLote - totalYaCobrado);
        const cuotasRestantes = Math.max(0, totalCuotas - cuotasCobradas);
        
        let nuevoValorCuota = 0;
        if (cuotasRestantes > 0) nuevoValorCuota = Math.round((saldoRemanente / cuotasRestantes) * 100) / 100;

        const installments: Installment[] = [];
        let currentId = parseInt(startId) || 0;
        let currentPendingSum = 0;
        let pendingCount = 0;

        for (let i = 1; i <= totalCuotas; i++) {
          let amount = i <= cuotasCobradas ? valorCuotaOriginal : nuevoValorCuota;
          if (i > cuotasCobradas) {
            pendingCount++;
            if (pendingCount === cuotasRestantes) amount = Math.max(0, saldoRemanente - currentPendingSum);
            currentPendingSum += amount;
          }
          installments.push({
            number: i, status: i <= cuotasCobradas ? 'COBRADA' : 'PENDIENTE',
            amount, affiliateId: (currentId + (i - 1)).toString()
          });
        }

        lotSummaries.push({
          lotNumber: lotNum, originalTotal: lotTotal, adjustedTotal: nuevoTotalLote,
          cancelledAmount: totalReduccion, installmentAmount: nuevoValorCuota,
          installments, orders: [...group.ordersToCancel, ...group.incomingCredits],
          details: {
            cuotasCobradas, cuotasRestantes, totalCancelado: totalReduccion,
            nuevoValorCuota, saldoRemanente, porcentajeCancelado: (totalReduccion / lotTotal) * 100,
            montoYaPagadoAnuladas, porcentajePagoOrden: totalCancelledInLot > 0 ? (montoYaPagadoAnuladas / totalCancelledInLot) * 100 : 0
          }
        });

        const dniInLot: any = {};
        group.ordersToCancel.forEach((o: any) => {
          if (!dniInLot[o.dni]) dniInLot[o.dni] = { orders: [], credits: [] };
          dniInLot[o.dni].orders.push(o.orderNumber);
        });
        group.incomingCredits.forEach((o: any) => {
          if (!dniInLot[o.dni]) dniInLot[o.dni] = { orders: [], credits: [] };
          dniInLot[o.dni].credits.push({ sourceLot: o.dppLotNumber!, amount: o.totalOrder });
        });

        Object.entries(dniInLot).forEach(([dni, data]: [string, any]) => {
          const firstPendingInst = installments.find(inst => inst.status === 'PENDIENTE');
          const formattedTotal = nuevoTotalLote.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
          const formattedCuota = nuevoValorCuota.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
          
          let line = `DNI: ${dni}: modificar lote dpp ${lotNum} al valor de ${formattedTotal}`;
          if (firstPendingInst) line += ` y modificar nro cta afiliado ${firstPendingInst.affiliateId} al valor de ${formattedCuota}`;
          
          const reasons: string[] = [];
          if (data.orders.length > 0) reasons.push(`anulacion de orden ${data.orders.join(' y ')}`);
          if (data.credits.length > 0) {
            data.credits.forEach((c: any) => reasons.push(`credito por orden anulada en lote ${c.sourceLot} (ya cobrado) por valor de ${c.amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`));
          }
          line += ` por ${reasons.join(' y ')}.`;
          mailLines.push(line);
        });

        group.ordersToCancel.forEach((o: any) => saveToHistory({ dni: o.dni, orderNumber: o.orderNumber, paymentMethod: 'Financiado (DPP)', action: 'Recalculación de cuotas', cancelledAmount: o.totalOrder, lotNumber: lotNum }));
        group.incomingCredits.forEach((o: any) => saveToHistory({ dni: o.dni, orderNumber: o.orderNumber, paymentMethod: 'Financiado (DPP)', action: `Crédito aplicado al lote ${lotNum}`, cancelledAmount: o.totalOrder, lotNumber: o.dppLotNumber }));
      });

      otherOrders.forEach(o => {
        let action = ''; let cancelledAmount = o.totalOrder; let method = o.paymentMethod;
        if (o.isSpecialPlan) { action = 'Anulación sin impacto económico'; cancelledAmount = 0; method = 'Planes Especiales'; }
        else if (o.paymentMethod === 'caja') { action = 'Generación de crédito'; }
        else { action = 'Devolución de crédito'; }
        saveToHistory({ dni: o.dni, orderNumber: o.orderNumber, paymentMethod: method, action, cancelledAmount });
      });

      const consolidatedMail = `Estimados:\n\nSe solicita modificación de los siguientes nro de cuenta afiliado y que los cambios se apliquen en la tabla CNT_historicodescuentosporplanilla en el caso de que ya se hayan generado:\n\n${mailLines.join('\n')}\n\nSe adjunta el excel con el desglose por afiliado.`;

      setResult({ lots: lotSummaries, otherOrders });
      if (lotSummaries.length > 0) setExpandedLot(lotSummaries[0].lotNumber);
      setGeneratedMails([{ lot: 'Consolidado', content: consolidatedMail }]);
      setPendingOrders([]); setProcessing(false);
      alert('Lote de órdenes procesado correctamente.');
    }, 1500);
  };

  const handleCancelOrder = () => {
    if (!cancellingOrder) return;
    if (cancelDni !== cancellingOrder.order.dni) { alert('El DNI ingresado no coincide con el de la orden.'); return; }
    if (!window.confirm(`¿Está seguro de que desea ANULAR la orden ${cancellingOrder.order.orderNumber}? Esta acción se registrará en el historial.`)) return;

    saveToHistory({
      dni: cancellingOrder.order.dni, orderNumber: cancellingOrder.order.orderNumber,
      paymentMethod: cancellingOrder.order.paymentMethod, action: 'ANULACIÓN MANUAL POST-PROCESO',
      cancelledAmount: cancellingOrder.order.totalOrder, lotNumber: cancellingOrder.lotNumber
    });

    if (result) {
      const newResult = { ...result };
      if (cancellingOrder.lotNumber) {
        newResult.lots = newResult.lots.map(lot => {
          if (lot.lotNumber === cancellingOrder.lotNumber) {
            const updatedOrders = lot.orders.filter(o => o.id !== cancellingOrder.order.id);
            const removedAmount = cancellingOrder.order.totalOrder;
            const newCancelledAmount = Math.max(0, lot.cancelledAmount - removedAmount);
            const newAdjustedTotal = lot.originalTotal - newCancelledAmount;
            
            let newDetails = lot.details;
            let updatedInstallments = [...lot.installments];

            if (newDetails) {
              const cuotasCobradas = newDetails.cuotasCobradas;
              const cuotasRestantes = newDetails.cuotasRestantes;
              const totalCuotas = cuotasCobradas + cuotasRestantes;
              const valorCuotaOriginal = lot.originalTotal / totalCuotas;
              const totalYaCobrado = cuotasCobradas * valorCuotaOriginal;
              const saldoRemanente = Math.max(0, newAdjustedTotal - totalYaCobrado);
              const nuevoValorCuota = cuotasRestantes > 0 ? Math.round((saldoRemanente / cuotasRestantes) * 100) / 100 : 0;

              newDetails = { ...newDetails, totalCancelado: newCancelledAmount, nuevoValorCuota, saldoRemanente, porcentajeCancelado: (newCancelledAmount / lot.originalTotal) * 100 };
              
              let currentPendingSum = 0;
              updatedInstallments = updatedInstallments.map(inst => {
                if (inst.status === 'PENDIENTE') {
                  let amount = nuevoValorCuota;
                  if (inst.number === totalCuotas) amount = Math.max(0, saldoRemanente - currentPendingSum);
                  currentPendingSum += amount;
                  return { ...inst, amount };
                }
                return inst;
              });
            }
            return { ...lot, orders: updatedOrders, cancelledAmount: newCancelledAmount, adjustedTotal: newAdjustedTotal, details: newDetails, installments: updatedInstallments };
          }
          return lot;
        });
      } else {
        newResult.otherOrders = newResult.otherOrders.filter(o => o.id !== cancellingOrder.order.id);
      }
      setResult(newResult);
    }
    setCancellingOrder(null); setCancelDni('');
    alert('Orden anulada exitosamente. El historial ha sido actualizado.');
  };

  const copyToClipboard = (text: string) => { navigator.clipboard.writeText(text); alert('Copiado al portapapeles'); };

  const exportRefinanceExcel = async () => {
    if (!result) return;
    const workbook = new ExcelJS.Workbook();
    const dniGroups: { [dni: string]: { lots: LotSummary[], others: OrderEntry[] } } = {};

    result.lots.forEach(lot => {
      lot.orders.forEach(order => {
        if (!dniGroups[order.dni]) dniGroups[order.dni] = { lots: [], others: [] };
        if (!dniGroups[order.dni].lots.find(l => l.lotNumber === lot.lotNumber)) dniGroups[order.dni].lots.push(lot);
      });
    });

    result.otherOrders.forEach(order => {
      if (!dniGroups[order.dni]) dniGroups[order.dni] = { lots: [], others: [] };
      dniGroups[order.dni].others.push(order);
    });

    for (const [dni, data] of Object.entries(dniGroups)) {
      const sheetName = dni.substring(0, 31);
      const worksheet = workbook.addWorksheet(sheetName);

      worksheet.columns = [{ width: 15 }, { width: 30 }, { width: 20 }, { width: 20 }];
      const titleRow = worksheet.addRow(["REFINANCIACIÓN DOSEP - AFILIADO: " + dni]);
      titleRow.font = { bold: true, size: 14, color: { argb: 'FF000000' } };
      worksheet.mergeCells(`A${titleRow.number}:D${titleRow.number}`);

      const refRow = worksheet.addRow(["Referencia: CNT_historicodescuentosporplanilla"]);
      refRow.font = { italic: true, size: 11, color: { argb: 'FF666666' } };
      worksheet.mergeCells(`A${refRow.number}:D${refRow.number}`);
      worksheet.addRow([]);

      data.lots.forEach(lot => {
        const lotHeader = worksheet.addRow(["LOTE DPP Nº: " + lot.lotNumber]);
        lotHeader.font = { bold: true, size: 12 };
        worksheet.mergeCells(`A${lotHeader.number}:D${lotHeader.number}`);

        const orderHeader = worksheet.addRow(["Órdenes del afiliado en este lote:"]);
        orderHeader.font = { italic: true };
        worksheet.mergeCells(`A${orderHeader.number}:D${orderHeader.number}`);

        lot.orders.filter(o => o.dni === dni && !o.isFullyPaidLot).forEach(o => {
          const row = worksheet.addRow(["- Orden: " + o.orderNumber + " | Total Orden:", "", "", o.totalOrder]);
          row.getCell(4).numFmt = '"$"#,##0.00'; row.getCell(4).font = { bold: true };
        });

        const incomingCredits = result.lots.flatMap(l => l.orders).filter(o => o.dni === dni && o.isFullyPaidLot && o.targetCreditLotNumber === lot.lotNumber);
        if (incomingCredits.length > 0) {
          const creditHeader = worksheet.addRow(["Créditos aplicados desde otros lotes (ya cobrados):"]);
          creditHeader.font = { italic: true, color: { argb: 'FF008000' } };
          worksheet.mergeCells(`A${creditHeader.number}:D${creditHeader.number}`);
          incomingCredits.forEach(c => {
            const row = worksheet.addRow([`- Desde Lote ${c.dppLotNumber} (Orden ${c.orderNumber}):`, "", "", c.totalOrder]);
            row.getCell(4).numFmt = '"$"#,##0.00'; row.getCell(4).font = { bold: true };
          });
        }

        worksheet.addRow([]);
        const breakdownTitle = worksheet.addRow(["DESGLOSE DE CUOTAS DEL LOTE (Recalculado)"]);
        breakdownTitle.font = { bold: true };
        worksheet.mergeCells(`A${breakdownTitle.number}:D${breakdownTitle.number}`);

        const headerRow = worksheet.addRow(["Cuota", "ID Afiliado (Nro Cta)", "Estado", "Monto"]);
        headerRow.eachCell((cell) => {
          cell.font = { bold: true, color: { argb: 'FF000000' } };
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } };
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
          cell.alignment = { horizontal: 'center' };
        });

        lot.installments.forEach(inst => {
          const row = worksheet.addRow([inst.number, inst.affiliateId, inst.status, inst.amount]);
          row.getCell(4).numFmt = '"$"#,##0.00';
          row.eachCell((cell, colNumber) => {
            cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
            if (colNumber === 1 || colNumber === 3) cell.alignment = { horizontal: 'center' };
            if (colNumber === 4) cell.alignment = { horizontal: 'right' };
            if (inst.status === 'COBRADA') cell.font = { color: { argb: 'FF666666' } };
          });
        });

        const totalRow = worksheet.addRow(["--------------------------------------------------", "", "", lot.adjustedTotal]);
        totalRow.getCell(4).numFmt = '"$"#,##0.00'; totalRow.getCell(4).font = { bold: true };
        totalRow.getCell(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
        totalRow.getCell(4).border = { top: { style: 'medium' }, left: { style: 'medium' }, bottom: { style: 'medium' }, right: { style: 'medium' } };
        worksheet.addRow([]); worksheet.addRow([]);
      });

      if (data.others.length > 0) {
        const otherTitle = worksheet.addRow(["OTRAS ÓRDENES (Caja / Crédito / Planes Especiales)"]);
        otherTitle.font = { bold: true };
        worksheet.mergeCells(`A${otherTitle.number}:D${otherTitle.number}`);
        const otherHeader = worksheet.addRow(["Orden", "Medio", "Acción", "Monto"]);
        otherHeader.eachCell((cell) => {
          cell.font = { bold: true }; cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE2EFDA' } };
          cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });
        data.others.forEach(o => {
          const row = worksheet.addRow([o.orderNumber, o.paymentMethod, o.isSpecialPlan ? 'Planes Especiales' : 'Anulación', o.totalOrder]);
          row.getCell(4).numFmt = '"$"#,##0.00';
          row.eachCell((cell) => { cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } }; });
        });
      }
    }

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `Refinanciacion_DOSEP_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // ==========================================
  // FUNCIONES: CALCULADORA DE AJUSTE
  // ==========================================
  const handleCalcularAjuste = () => {
    const o = parseFloat(calcOrigen);
    const d = parseFloat(calcDestino);
    if(isNaN(o) || isNaN(d) || o === 0) {
        alert("Ingrese valores válidos y distintos de cero en el origen.");
        return;
    }
    const porcentaje = ((d - o) / o) * 100;
    let tipo = "nada";
    if (porcentaje > 0) tipo = "aumento";
    if (porcentaje < 0) tipo = "disminucion";
    
    setCalcResultado({ porcentaje: Math.abs(porcentaje), tipo });
  };

  // ==========================================
  // FUNCIONES: PLAN MUJER
  // ==========================================
  const generarInformePlanMujer = () => {
    const d = pmDni.trim();
    const f = pmFechaNac.trim();
    
    if (!d) { alert("Por favor, ingresá el DNI de la paciente."); return; }
    if (!f) { alert("Por favor, ingresá una fecha de nacimiento."); return; }

    let dayStr, monthStr, yearStr;
    let fechaLimpia = f.replace(/\s/g, '');

    if (fechaLimpia.includes('/')) {
        [dayStr, monthStr, yearStr] = fechaLimpia.split('/');
    } else if (fechaLimpia.includes('-')) {
        let partes = fechaLimpia.split('-');
        if (partes[0].length === 4) { [yearStr, monthStr, dayStr] = partes; } 
        else { [dayStr, monthStr, yearStr] = partes; }
    } else if (fechaLimpia.length === 8) {
        dayStr = fechaLimpia.substring(0, 2);
        monthStr = fechaLimpia.substring(2, 4);
        yearStr = fechaLimpia.substring(4, 8);
    } else {
        alert("No pudimos leer la fecha. Asegurate de que tenga el formato DD/MM/AAAA.");
        return;
    }

    if (!yearStr || yearStr.length < 4 || !monthStr || !dayStr) {
        alert("Revisá que la fecha esté completa, incluyendo el año de 4 dígitos (ej: 1988).");
        return;
    }

    dayStr = dayStr.padStart(2, '0');
    monthStr = monthStr.padStart(2, '0');
    const fechaNacFormateada = `${dayStr}/${monthStr}/${yearStr}`;

    const anioNacimiento = parseInt(yearStr);
    const mesNacimiento = parseInt(monthStr) - 1;
    const diaNacimiento = parseInt(dayStr);
    const hoy = new Date();
    
    let edad = hoy.getFullYear() - anioNacimiento;
    const m = hoy.getMonth() - mesNacimiento;
    if (m < 0 || (m === 0 && hoy.getDate() < diaNacimiento)) { edad--; }

    setPmResultado({ dni: d, edad, dia: dayStr, mes: monthStr, anio: anioNacimiento });
    guardarEnHistorialPM(d, fechaNacFormateada);
    setPmDni('');
    setPmFechaNac('');
  };

  const guardarEnHistorialPM = (d: string, fNac: string) => {
    const ahora = new Date();
    const fechaISO = ahora.toISOString().split('T')[0];
    const dia = String(ahora.getDate()).padStart(2, '0');
    const mes = String(ahora.getMonth() + 1).padStart(2, '0');
    const anio = ahora.getFullYear();
    const hora = String(ahora.getHours()).padStart(2, '0');
    const min = String(ahora.getMinutes()).padStart(2, '0');
    const fechaLegible = `${dia}/${mes}/${anio} ${hora}:${min}`;

    const newRecord = { fechaISO, fechaLegible, dni: d, fechaNac: fNac, id: crypto.randomUUID() };
    const updated = [newRecord, ...pmHistorial];
    setPmHistorial(updated);
    localStorage.setItem('historialPlanMujer', JSON.stringify(updated));
  };

  const descargarReportePM = () => {
    if (!pmDesde || !pmHasta) {
        alert("Por favor, seleccioná la fecha de inicio y fin para armar el reporte.");
        return;
    }
    const filtrados = pmHistorial.filter(item => item.fechaISO >= pmDesde && item.fechaISO <= pmHasta);
    if (filtrados.length === 0) {
        alert("No se encontraron consultas en ese rango de fechas.");
        return;
    }

    let csvContent = "Fecha de Consulta;DNI;Fecha de Nacimiento\n";
    filtrados.forEach(row => { csvContent += `${row.fechaLegible};${row.dni};${row.fechaNac}\n`; });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_PlanMujer_${pmDesde}_al_${pmHasta}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTarjetaPlan = (titulo: string, min: number, max: number) => {
    if (!pmResultado) return null;
    const { edad, dia, mes, anio } = pmResultado;
    const anioActivacion = anio + min;
    const anioVencimiento = anio + max;
    const fechaActivacion = `${dia}/${mes}/${anioActivacion}`;
    const fechaVencimiento = `${dia}/${mes}/${anioVencimiento}`;

    let estadoHtml = null;
    if (edad >= max) {
        estadoHtml = <div className="mt-2 w-full bg-red-100 text-red-800 border border-red-200 p-2 rounded text-sm font-bold">NO CORRESPONDE</div>;
    } else if (edad < min) {
        estadoHtml = <div className="mt-2 w-full bg-red-100 text-red-800 border border-red-200 p-2 rounded text-sm"><span className="font-bold">Activa el:</span> {fechaActivacion} <br/> <span className="font-bold">Vence el:</span> {fechaVencimiento}</div>;
    } else {
        estadoHtml = <div className="mt-2 w-full bg-green-100 text-green-800 border border-green-200 p-2 rounded text-sm font-bold">Vigente hasta el {fechaVencimiento}</div>;
    }

    return (
      <div className="bg-slate-50 border border-dosep-border rounded-lg p-4">
        <div className="font-bold text-slate-700 text-sm">{titulo}</div>
        {estadoHtml}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex bg-dosep-bg font-sans">
      {/* ==========================================
          SIDEBAR
          ========================================== */}
      <aside className="w-64 bg-dosep-blue text-white flex-shrink-0 flex flex-col hidden lg:flex shadow-2xl z-10">
        <div className="p-6 flex flex-col gap-1 border-b border-white/10 bg-dosep-dark/30">
          <div className="font-black tracking-tighter text-2xl flex items-center gap-2">
            <ShieldCheck className="text-dosep-teal" size={24} />
            DOSEP
          </div>
          <div className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">Sistema de Gestión</div>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-6 custom-scrollbar space-y-1">
          <SidebarItem 
            icon={<LayoutDashboard size={18} />} 
            label="Dashboard" 
            active={vistaActiva === 'dashboard'} 
            onClick={() => setVistaActiva('dashboard')} 
          />
          
          <div className="pt-4">
            <p className="px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Operaciones</p>
            <SidebarItem icon={<FileSpreadsheet size={18} />} label="Descuento Planilla" active={vistaActiva === 'refinanciacion'} hasChevron />
            <div className="bg-dosep-dark/20 py-1">
              <SidebarSubItem 
                label="Refinanciación" 
                active={vistaActiva === 'refinanciacion'} 
                onClick={() => setVistaActiva('refinanciacion')}
              />
            </div>
          </div>

          <div className="pt-4">
            <p className="px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Herramientas</p>
            <SidebarItem 
                icon={<Percent size={18} />} 
                label="Cálculo de Ajuste" 
                active={vistaActiva === 'calculadora'}
                onClick={() => setVistaActiva('calculadora')}
            />
          </div>

          <div className="pt-4">
            <p className="px-6 text-[10px] font-bold text-white/40 uppercase tracking-widest mb-2">Afiliados</p>
            <SidebarItem 
                icon={<Heart size={18} />} 
                label="Plan Mujer" 
                active={vistaActiva === 'plan_mujer'}
                onClick={() => setVistaActiva('plan_mujer')}
            />
            <SidebarItem icon={<Users size={18} />} label="Padrón" onClick={() => alert("Módulo en construcción")} />
            <SidebarItem icon={<Stethoscope size={18} />} label="Prestaciones" onClick={() => alert("Módulo en construcción")} />
          </div>
        </nav>

        <div className="p-6 border-t border-white/10 bg-dosep-dark/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-dosep-teal flex items-center justify-center font-bold text-xs">
              MS
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold truncate">Maxi Sosa</p>
              <p className="text-[10px] text-white/50 truncate">Operador Nivel 3</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ==========================================
          CONTENIDO PRINCIPAL
          ========================================== */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER DINÁMICO */}
        <header className="h-16 bg-white border-b border-dosep-border flex items-center justify-between px-8 flex-shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="lg:hidden text-dosep-blue"><ShieldCheck size={24} /></div>
            <h1 className="text-lg font-bold text-slate-800 tracking-tight">
              {vistaActiva === 'refinanciacion' && <>Descuento por Planilla <span className="text-dosep-blue">/</span> <span className="text-slate-400 font-medium">Refinanciación</span></>}
              {vistaActiva === 'calculadora' && <>Herramientas <span className="text-dosep-blue">/</span> <span className="text-slate-400 font-medium">Calculadora de Ajuste</span></>}
              {vistaActiva === 'plan_mujer' && <>Afiliados <span className="text-dosep-blue">/</span> <span className="text-slate-400 font-medium">Plan Mujer</span></>}
              {vistaActiva === 'dashboard' && <>Panel General</>}
            </h1>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-2 text-slate-400">
              <Calendar size={16} />
              <span className="text-xs font-medium">{new Date().toLocaleDateString('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
            </div>
            
            {vistaActiva === 'refinanciacion' && (
              <>
                <div className="h-8 w-px bg-slate-100"></div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setShowHistory(!showHistory)}
                    className={`p-2 rounded-full transition-all ${showHistory ? 'bg-dosep-blue text-white shadow-md' : 'text-slate-400 hover:bg-slate-100 hover:text-dosep-blue'}`}
                    title="Historial de Operaciones"
                  >
                    <History size={20} />
                  </button>
                  <button className="p-2 text-slate-400 hover:bg-slate-100 hover:text-dosep-blue rounded-full transition-all">
                    <Mail size={20} />
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          
          {/* VISTA: DASHBOARD */}
          {vistaActiva === 'dashboard' && (
             <div className="max-w-6xl mx-auto flex flex-col items-center justify-center py-20 opacity-50">
                <ShieldCheck size={64} className="text-dosep-blue mb-4" />
                <h2 className="text-2xl font-bold text-slate-600">Sistema Integral DOSEP</h2>
                <p className="text-slate-500">Seleccioná un módulo del menú lateral para comenzar.</p>
             </div>
          )}

          {/* VISTA: CALCULADORA DE AJUSTE */}
          {vistaActiva === 'calculadora' && (
            <div className="max-w-md mx-auto space-y-6">
              <div className="bg-white rounded shadow-sm border border-dosep-border p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-3 bg-dosep-blue/10 rounded-lg text-dosep-blue"><Percent size={24} /></div>
                  <h2 className="text-xl font-bold text-slate-700">Calculadora de Ajuste</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-500">Valor Original</label>
                    <input 
                      type="number" 
                      value={calcOrigen}
                      onChange={(e) => setCalcOrigen(e.target.value)}
                      className="w-full border border-dosep-border rounded px-4 py-3 text-lg focus:border-dosep-teal outline-none transition-all"
                      placeholder="Ej: 1500"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm font-bold text-slate-500">Valor Final (Nuevo)</label>
                    <input 
                      type="number" 
                      value={calcDestino}
                      onChange={(e) => setCalcDestino(e.target.value)}
                      className="w-full border border-dosep-border rounded px-4 py-3 text-lg focus:border-dosep-teal outline-none transition-all"
                      placeholder="Ej: 1800"
                    />
                  </div>
                  
                  <button 
                    onClick={handleCalcularAjuste}
                    className="w-full bg-dosep-blue text-white py-3 rounded font-bold hover:bg-dosep-dark transition-colors mt-2 shadow-sm"
                  >
                    CALCULAR DIFERENCIA
                  </button>

                  {calcResultado && (
                    <div className={`mt-6 p-4 rounded border text-center ${
                      calcResultado.tipo === 'aumento' ? 'bg-green-50 border-green-200 text-green-700' : 
                      calcResultado.tipo === 'disminucion' ? 'bg-red-50 border-red-200 text-red-700' : 
                      'bg-slate-100 border-slate-200 text-slate-700'
                    }`}>
                      <p className="text-sm font-bold uppercase tracking-wide opacity-80 mb-1">
                        {calcResultado.tipo === 'aumento' ? 'Aumento' : calcResultado.tipo === 'disminucion' ? 'Disminución' : 'Sin cambios'}
                      </p>
                      <p className="text-3xl font-black">
                        {calcResultado.porcentaje > 0 ? `${calcResultado.porcentaje.toFixed(2)}%` : '-'}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* VISTA: PLAN MUJER */}
          {vistaActiva === 'plan_mujer' && (
            <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6">
              
              <div className="md:col-span-5 space-y-6">
                <div className="bg-white rounded shadow-sm border border-dosep-border p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-pink-100 text-pink-600 rounded-lg"><Heart size={20} /></div>
                    <h2 className="text-lg font-bold text-slate-700">Consulta Plan Mujer</h2>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">DNI de la Paciente</label>
                      <input 
                        type="text" 
                        value={pmDni}
                        onChange={(e) => setPmDni(e.target.value)}
                        className="w-full border border-dosep-border rounded px-3 py-2 text-sm focus:border-dosep-teal outline-none transition-all bg-slate-50"
                        placeholder="Ej: 35123456"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500">Fecha de Nacimiento</label>
                      <input 
                        type="text" 
                        value={pmFechaNac}
                        onChange={(e) => setPmFechaNac(e.target.value)}
                        className="w-full border border-dosep-border rounded px-3 py-2 text-sm focus:border-dosep-teal outline-none transition-all bg-slate-50"
                        placeholder="DD/MM/AAAA"
                      />
                    </div>
                    <button 
                      onClick={generarInformePlanMujer}
                      className="w-full bg-dosep-teal text-white py-2.5 rounded text-sm font-bold hover:bg-opacity-90 transition-colors shadow-sm"
                    >
                      CONSULTAR COBERTURA
                    </button>
                    
                    <button 
                      onClick={() => setPmShowHistory(!pmShowHistory)}
                      className="w-full bg-transparent border border-dosep-border text-slate-500 py-2 rounded text-xs font-bold hover:bg-slate-50 transition-colors"
                    >
                      {pmShowHistory ? 'Ocultar Historial' : 'Mostrar Historial Local'}
                    </button>
                  </div>
                </div>

                <AnimatePresence>
                  {pmShowHistory && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="bg-white rounded shadow-sm border border-dosep-border p-6 mt-4">
                        <h3 className="font-bold text-slate-700 text-sm mb-4">Historial y Reportes</h3>
                        
                        <div className="space-y-3 mb-4 p-3 bg-slate-50 border border-dosep-border rounded">
                          <p className="text-[10px] font-bold uppercase text-slate-400">Descargar CSV</p>
                          <div className="flex gap-2">
                            <input type="date" value={pmDesde} onChange={e=>setPmDesde(e.target.value)} className="w-full text-xs border rounded p-1.5" />
                            <input type="date" value={pmHasta} onChange={e=>setPmHasta(e.target.value)} className="w-full text-xs border rounded p-1.5" />
                          </div>
                          <button onClick={descargarReportePM} className="w-full bg-green-600 text-white text-xs py-1.5 rounded font-bold hover:bg-green-700">
                            Bajar Reporte
                          </button>
                        </div>

                        <input 
                          type="text" 
                          placeholder="Buscar por DNI en historial..."
                          value={pmSearch}
                          onChange={(e) => setPmSearch(e.target.value)}
                          className="w-full border border-dosep-border rounded px-3 py-1.5 text-xs mb-3"
                        />
                        <div className="max-h-60 overflow-y-auto custom-scrollbar border border-dosep-border rounded">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-slate-50 sticky top-0">
                              <tr>
                                <th className="p-2 border-b">DNI</th>
                                <th className="p-2 border-b">F. Nac</th>
                              </tr>
                            </thead>
                            <tbody>
                              {pmHistorial.filter(item => item.dni.includes(pmSearch)).length === 0 ? (
                                <tr><td colSpan={2} className="p-4 text-center text-slate-400 italic">Sin registros</td></tr>
                              ) : (
                                pmHistorial.filter(item => item.dni.includes(pmSearch)).map(item => (
                                  <tr key={item.id} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="p-2 font-medium">{item.dni}</td>
                                    <td className="p-2 text-slate-500">{item.fechaNac}</td>
                                  </tr>
                                ))
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="md:col-span-7">
                {pmResultado ? (
                  <div className="bg-white rounded shadow-sm border border-dosep-border p-6 animate-fade-in">
                    <div className="text-center pb-4 border-b border-dosep-border mb-4">
                      <p className="text-sm text-slate-500">Paciente DNI: <span className="font-bold text-dosep-blue">{pmResultado.dni}</span></p>
                      <p className="text-sm text-slate-500">Edad Actual: <span className="font-bold text-dosep-blue">{pmResultado.edad} años</span></p>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                      {renderTarjetaPlan('PMS (Implante) - 14 a 24 años', 14, 24)}
                      {renderTarjetaPlan('PSR (Anticonceptivo) - 14 a 50 años', 14, 50)}
                      {renderTarjetaPlan('PCU (POP, Citología) - 20 a 64 años', 20, 64)}
                      {renderTarjetaPlan('PCM (Mamografía) - 40 a 70 años', 40, 70)}
                      {renderTarjetaPlan('PMC (2 Consultas) - 20 a 70 años', 20, 70)}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded shadow-sm border border-dashed border-dosep-border h-full min-h-[300px] flex flex-col items-center justify-center p-8 text-center">
                    <Heart size={48} className="text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium">Ingresá los datos de la paciente para evaluar la cobertura del Plan Mujer.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* VISTA: REFINANCIACIÓN (TU CÓDIGO GIGANTE ORIGINAL) */}
          {vistaActiva === 'refinanciacion' && (
            <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Search/Form Card */}
            <section className="bg-white rounded shadow-sm border border-dosep-border overflow-hidden">
              <div className="p-6 flex flex-wrap lg:flex-nowrap items-end gap-4">
                <div className="flex-1 min-w-[200px] space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">DNI Afiliado</label>
                  <input 
                    type="text" 
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    className="w-full border border-dosep-border rounded px-3 py-2 text-sm focus:border-dosep-teal outline-none transition-all"
                    placeholder="Número de documento"
                  />
                </div>
                <div className="flex-1 min-w-[200px] space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Nº de Orden</label>
                  <input 
                    type="text" 
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value)}
                    className="w-full border border-dosep-border rounded px-3 py-2 text-sm focus:border-dosep-teal outline-none transition-all"
                    placeholder="Número de orden"
                  />
                </div>
                <div className="flex-1 min-w-[150px] space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Total Orden ($)</label>
                  <input 
                    type="number" 
                    value={totalOrder}
                    onChange={(e) => setTotalOrder(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-dosep-border rounded px-3 py-2 text-sm focus:border-dosep-teal outline-none transition-all"
                  />
                </div>
                <div className="flex-shrink-0 flex gap-2">
                  <button 
                    onClick={addOrderToBatch}
                    className="bg-dosep-teal text-white px-8 py-2 rounded font-medium text-sm hover:bg-opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
                  >
                    <Plus size={16} />
                    Añadir
                  </button>
                  <button 
                    onClick={resetForm}
                    className="bg-slate-100 text-slate-500 px-4 py-2 rounded font-medium text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-2"
                    title="Limpiar Formulario"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-4 gap-6 border-t border-dosep-border/50 pt-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Cuotas Totales</label>
                  <input 
                    type="number" 
                    value={totalInstallments}
                    onChange={(e) => setTotalInstallments(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-dosep-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-dosep-teal outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Cuotas Cobradas</label>
                  <input 
                    type="number" 
                    value={paidInstallments}
                    onChange={(e) => setPaidInstallments(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full border border-dosep-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-dosep-teal outline-none transition-all"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">Medio de Pago</label>
                  <select 
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full border border-dosep-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-dosep-teal outline-none transition-all bg-white"
                  >
                    <option value="financiado">Financiado (DPP)</option>
                    <option value="caja">Caja</option>
                    <option value="credito">Crédito Disponible</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-500">¿Planes Especiales?</label>
                  <select 
                    value={isSpecialPlan}
                    onChange={(e) => setIsSpecialPlan(e.target.value)}
                    className="w-full border border-dosep-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-dosep-teal outline-none transition-all bg-white"
                  >
                    <option value="no">No</option>
                    <option value="si">Sí</option>
                  </select>
                </div>
              </div>

              {paymentMethod === 'financiado' && (
                <div className="px-6 pb-6 border-t border-dosep-border pt-6 bg-slate-50/50">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">Nº Lote DPP</label>
                      <input 
                        type="text" 
                        value={dppLotNumber}
                        onChange={(e) => setDppLotNumber(e.target.value)}
                        className="w-full border border-dosep-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-dosep-teal outline-none transition-all"
                        placeholder="276520"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">Total Lote ($)</label>
                      <input 
                        type="number" 
                        value={dppLotTotal}
                        onChange={(e) => setDppLotTotal(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full border border-dosep-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-dosep-teal outline-none transition-all"
                        placeholder="51600"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">ID Afiliado Inicial (Cuota 1)</label>
                      <input 
                        type="text" 
                        value={startAffiliateId}
                        onChange={(e) => setStartAffiliateId(e.target.value)}
                        className="w-full border border-dosep-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-dosep-teal outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-500">Extender a (Nº Cuotas)</label>
                      <input 
                        type="number" 
                        value={newTotalInstallments}
                        onChange={(e) => setNewTotalInstallments(e.target.value === '' ? '' : Number(e.target.value))}
                        className="w-full border border-dosep-border rounded px-3 py-2 text-sm focus:ring-1 focus:ring-dosep-teal outline-none transition-all"
                        placeholder="Ej: 12"
                      />
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-4">
                    <label className="flex items-center gap-3 cursor-pointer group w-fit">
                      <input 
                        type="checkbox" 
                        checked={isFullyPaidLot}
                        onChange={(e) => setIsFullyPaidLot(e.target.checked)}
                        className="w-4 h-4 rounded border-dosep-border text-dosep-blue focus:ring-dosep-blue"
                      />
                      <span className="text-sm text-slate-600 font-medium">Lote de origen ya cobrado (Compensar en otro lote)</span>
                    </label>

                    <AnimatePresence>
                      {isFullyPaidLot && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 p-4 bg-white border border-dosep-border rounded mt-2">
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-500">Lote Destino</label>
                              <input 
                                type="text" 
                                value={targetCreditLotNumber}
                                onChange={(e) => setTargetCreditLotNumber(e.target.value)}
                                className="w-full border border-dosep-border rounded px-3 py-2 text-sm outline-none"
                                placeholder="268172"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-500">Total Destino ($)</label>
                              <input 
                                type="number" 
                                value={targetLotTotal}
                                onChange={(e) => setTargetLotTotal(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full border border-dosep-border rounded px-3 py-2 text-sm outline-none"
                                placeholder="507200"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-500">Cuotas Destino</label>
                              <input 
                                type="number" 
                                value={targetLotInstallments}
                                onChange={(e) => setTargetLotInstallments(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full border border-dosep-border rounded px-3 py-2 text-sm outline-none"
                              />
                            </div>
                            <div className="space-y-1.5">
                              <label className="text-xs font-medium text-slate-500">Cobradas Destino</label>
                              <input 
                                type="number" 
                                value={targetLotPaidInstallments}
                                onChange={(e) => setTargetLotPaidInstallments(e.target.value === '' ? '' : Number(e.target.value))}
                                className="w-full border border-dosep-border rounded px-3 py-2 text-sm outline-none"
                              />
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </section>

            {/* Pending List & Results */}
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
              {/* Left: Pending */}
              <div className="xl:col-span-4 space-y-6">
                <section className="bg-white rounded shadow-sm border border-dosep-border overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-dosep-border flex items-center justify-between">
                    <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                      <ListChecks size={18} className="text-dosep-blue" />
                      Órdenes Pendientes
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="bg-dosep-blue text-white text-[10px] px-2 py-0.5 rounded-full">{pendingOrders.length}</span>
                      {pendingOrders.length > 0 && (
                        <button 
                          onClick={() => setPendingOrders([])}
                          className="text-red-400 hover:text-red-600 p-1 rounded hover:bg-red-50 transition-colors"
                          title="Limpiar lista"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="p-4 space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                    {pendingOrders.length === 0 ? (
                      <div className="text-center py-8 text-slate-400 text-sm italic">No hay órdenes en espera</div>
                    ) : (
                      pendingOrders.map((order) => (
                        <div key={order.id} className="p-3 border border-dosep-border rounded bg-slate-50/50 flex justify-between items-center group">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-slate-700 truncate">Orden: {order.orderNumber}</p>
                            <p className="text-[10px] text-slate-400 uppercase font-mono">
                              {order.paymentMethod === 'financiado' 
                                ? (order.isFullyPaidLot 
                                    ? `Crédito: ${order.dppLotNumber} ➔ ${order.targetCreditLotNumber}` 
                                    : `Lote: ${order.dppLotNumber}`) 
                                : order.paymentMethod}
                            </p>
                          </div>
                          <div className="flex items-center gap-3 flex-shrink-0">
                            <span className="text-sm font-bold text-slate-600">${order.totalOrder.toLocaleString('es-AR')}</span>
                            <button 
                              onClick={() => removeOrderFromBatch(order.id)}
                              className="text-slate-300 hover:text-red-500 transition-colors"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {pendingOrders.length > 0 && (
                    <div className="p-4 bg-slate-50 border-t border-dosep-border">
                      <button 
                        onClick={handleProcessBatch}
                        className="w-full bg-dosep-blue text-white py-2.5 rounded font-semibold text-sm hover:bg-dosep-dark transition-all flex items-center justify-center gap-2"
                      >
                        <RefreshCw size={16} />
                        PROCESAR LISTA
                      </button>
                    </div>
                  )}
                </section>
              </div>

              {/* Right: Results or History */}
              <div className="xl:col-span-8 space-y-6">
                <AnimatePresence mode="wait">
                  {showHistory ? (
                    <motion.section 
                      key="history"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="bg-white rounded shadow-sm border border-dosep-border overflow-hidden"
                    >
                      <div className="p-4 bg-slate-50 border-b border-dosep-border flex items-center justify-between">
                        <h3 className="font-semibold text-slate-700 flex items-center gap-2">
                          <History size={18} className="text-dosep-blue" />
                          Historial de Operaciones
                        </h3>
                        <div className="flex gap-2">
                          <button onClick={exportHistory} className="p-1.5 text-slate-500 hover:bg-slate-200 rounded transition-colors">
                            <Download size={18} />
                          </button>
                          <button onClick={clearHistory} className="p-1.5 text-red-400 hover:bg-red-50 rounded transition-colors">
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <div className="p-4 space-y-4 max-h-[600px] overflow-y-auto custom-scrollbar">
                        {history.length === 0 ? (
                          <div className="text-center py-12 text-slate-300 italic">No hay registros históricos</div>
                        ) : (
                          history.map((record) => (
                            <div key={record.id} className="p-4 border border-dosep-border rounded hover:bg-slate-50 transition-colors group relative">
                              <button 
                                onClick={() => deleteHistoryRecord(record.id)}
                                className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                                title="Eliminar registro"
                              >
                                <Trash2 size={14} />
                              </button>
                              <div className="flex justify-between items-start mb-2 pr-6">
                                <span className="text-[10px] font-medium text-slate-400">{record.timestamp}</span>
                                <span className="text-[10px] font-bold text-dosep-blue bg-dosep-blue/10 px-2 py-0.5 rounded uppercase">
                                  {record.paymentMethod}
                                </span>
                              </div>
                              <div className="flex justify-between items-end">
                                <div>
                                  <p className="text-sm font-semibold text-slate-700">Orden: {record.orderNumber}</p>
                                  <p className="text-xs text-slate-500">DNI: {record.dni} {record.lotNumber && `| Lote: ${record.lotNumber}`}</p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-bold text-red-600">-${record.cancelledAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                                  <p className="text-[10px] text-slate-400 uppercase font-medium">{record.action}</p>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.section>
                  ) : (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="space-y-6"
                    >
                      {processing ? (
                        <div className="space-y-6">
                          <div className="flex justify-between items-center">
                            <Skeleton className="h-8 w-64" />
                            <div className="flex gap-2">
                              <Skeleton className="h-10 w-48" />
                              <Skeleton className="h-10 w-40" />
                            </div>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[1, 2, 3].map(i => <Skeleton key={i} className="h-24 w-full rounded-xl" />)}
                          </div>
                          <div className="space-y-4">
                            {[1, 2].map(i => (
                              <div key={i} className="bg-white rounded shadow-sm border border-dosep-border p-6 space-y-4">
                                <div className="flex justify-between">
                                  <Skeleton className="h-6 w-48" />
                                  <Skeleton className="h-6 w-32" />
                                </div>
                                <Skeleton className="h-32 w-full" />
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : result ? (
                        <>
                          <div className="flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 text-lg">Lote de financiaciones actuales</h3>
                            <div className="flex gap-2">
                              <button 
                                onClick={() => copyToClipboard(generatedMails[0]?.content || '')}
                                className="bg-dosep-blue text-white px-4 py-2 rounded text-sm font-semibold hover:bg-dosep-dark transition-all flex items-center gap-2 shadow-sm"
                              >
                                <Mail size={16} />
                                COPIAR MAIL CONSOLIDADO
                              </button>
                              <button 
                                onClick={exportRefinanceExcel}
                                className="bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold hover:bg-green-700 transition-all flex items-center gap-2 shadow-sm"
                              >
                                <Download size={16} />
                                EXPORTAR EXCEL
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="bg-dosep-blue/5 border border-dosep-blue/20 rounded-xl p-4 flex items-center gap-4">
                              <div className="bg-dosep-blue text-white p-3 rounded-lg shadow-sm">
                                <Calculator size={24} />
                              </div>
                              <div>
                                <p className="text-[10px] text-dosep-blue font-bold uppercase tracking-wider">Total Reducción</p>
                                <p className="text-2xl font-black text-slate-800">
                                  ${result.lots.reduce((acc, lot) => acc + lot.cancelledAmount, 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                            <div className="bg-green-50 border border-green-100 rounded-xl p-4 flex items-center gap-4">
                              <div className="bg-green-600 text-white p-3 rounded-lg shadow-sm">
                                <ListChecks size={24} />
                              </div>
                              <div>
                                <p className="text-[10px] text-green-600 font-bold uppercase tracking-wider">Lotes Afectados</p>
                                <p className="text-2xl font-black text-slate-800">{result.lots.length}</p>
                              </div>
                            </div>
                            <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-4">
                              <div className="bg-orange-500 text-white p-3 rounded-lg shadow-sm">
                                <RefreshCw size={24} />
                              </div>
                              <div>
                                <p className="text-[10px] text-orange-600 font-bold uppercase tracking-wider">Órdenes Procesadas</p>
                                <p className="text-2xl font-black text-slate-800">
                                  {result.lots.reduce((acc, lot) => acc + lot.orders.length, 0) + result.otherOrders.length}
                                </p>
                              </div>
                            </div>
                          </div>

                          {result.lots.map((lot) => (
                            <section key={lot.lotNumber} className="bg-white rounded shadow-sm border border-dosep-border overflow-hidden">
                              <div 
                                className="p-4 bg-slate-50 border-b border-dosep-border flex items-center justify-between cursor-pointer hover:bg-slate-100 transition-colors group"
                                onClick={() => setExpandedLot(expandedLot === lot.lotNumber ? null : lot.lotNumber)}
                              >
                                <div className="flex items-center gap-3">
                                  <div className={`p-1 rounded-full transition-colors ${expandedLot === lot.lotNumber ? 'bg-dosep-blue text-white' : 'bg-slate-200 text-slate-500 group-hover:bg-slate-300'}`}>
                                    <ChevronDown 
                                      size={16} 
                                      className={`transition-transform duration-300 ${expandedLot === lot.lotNumber ? 'rotate-180' : ''}`} 
                                    />
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-slate-700">Lote DPP Nº {lot.lotNumber}</h4>
                                    <p className="text-[10px] text-slate-400 font-medium uppercase">
                                      {expandedLot === lot.lotNumber ? 'Ocultar desglose' : 'Ver desglose de cuotas'}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-4">
                                  <div className="text-right">
                                    <p className="text-[10px] text-slate-400 uppercase font-medium">Reducción</p>
                                    <p className="text-sm font-bold text-red-600">-${lot.cancelledAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[10px] text-slate-400 uppercase font-medium">Nuevo Total</p>
                                    <p className="text-sm font-bold text-slate-700">${lot.adjustedTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                                  </div>
                                </div>
                              </div>
                              
                              <AnimatePresence>
                                {expandedLot === lot.lotNumber && (
                                  <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                    className="overflow-hidden"
                                  >
                                    <div className="p-4 bg-slate-50/50 border-t border-dosep-border grid grid-cols-1 md:grid-cols-5 gap-4">
                                      <div className="bg-white p-3 rounded border border-dosep-border shadow-sm">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Estado de Cuotas</p>
                                        <div className="flex justify-between items-end">
                                          <div>
                                            <p className="text-xs text-slate-600"><span className="font-bold text-green-600">{lot.details?.cuotasCobradas}</span> Cobradas</p>
                                            <p className="text-xs text-slate-600"><span className="font-bold text-orange-600">{lot.details?.cuotasRestantes}</span> Pendientes</p>
                                          </div>
                                          <div className="text-right">
                                            <p className="text-[10px] text-slate-400">Total: {lot.installments.length}</p>
                                          </div>
                                        </div>
                                      </div>
                                      <div className="bg-white p-3 rounded border border-dosep-border shadow-sm">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Cálculo de Reducción</p>
                                        <p className="text-xs text-slate-600">Total Original: <span className="font-medium">${lot.originalTotal.toLocaleString('es-AR')}</span></p>
                                        <p className="text-xs text-red-600 font-bold">Reducción: -${lot.cancelledAmount.toLocaleString('es-AR')}</p>
                                        <p className="text-[9px] text-slate-400 font-medium">({lot.details?.porcentajeCancelado.toFixed(1)}% del lote)</p>
                                      </div>
                                      <div className="bg-white p-3 rounded border border-dosep-border shadow-sm">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Crédito por Pagos</p>
                                        <p className="text-xs text-slate-600">Monto Cobrado: <span className="font-bold text-dosep-teal">${lot.details?.montoYaPagadoAnuladas.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></p>
                                        <p className="text-[9px] text-slate-400 font-medium italic">({lot.details?.porcentajePagoOrden.toFixed(1)}% de la orden anulada)</p>
                                        <p className="text-[9px] text-slate-500 mt-1 leading-tight">Este monto se aplicó como crédito al saldo restante.</p>
                                      </div>
                                      <div className="bg-white p-3 rounded border border-dosep-border shadow-sm">
                                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-1">Nueva Cuota Promedio</p>
                                        <p className="text-lg font-black text-dosep-blue">${lot.details?.nuevoValorCuota.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
                                        <p className="text-[9px] text-slate-400 italic">* Ajustada para cierre exacto</p>
                                      </div>
                                      <div className="bg-white p-3 rounded border border-dosep-border shadow-sm flex flex-col justify-center gap-2">
                                        <button 
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            copyToClipboard(lot.details?.nuevoValorCuota.toFixed(2) || '');
                                          }}
                                          className="text-[10px] bg-slate-100 hover:bg-slate-200 text-slate-600 py-1.5 px-2 rounded font-bold transition-colors flex items-center justify-center gap-1"
                                        >
                                          Copiar Cuota
                                        </button>
                                      </div>
                                    </div>

                                    <div className="p-4 bg-slate-50/50 border-t border-dosep-border">
                                      <div className="mb-4">
                                        <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                                          <FileText size={14} />
                                          Órdenes de Afiliados en este Lote
                                        </h5>
                                        <div className="bg-white border border-dosep-border rounded overflow-hidden">
                                          <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-dosep-border">
                                              <tr>
                                                <th className="px-4 py-2">Nro Orden</th>
                                                <th className="px-4 py-2">DNI Afiliado</th>
                                                <th className="px-4 py-2">ID Inicio</th>
                                                <th className="px-4 py-2 text-right">Monto Total</th>
                                                <th className="px-4 py-2 text-center">Acciones</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-dosep-border">
                                              {lot.orders.map((order) => (
                                                <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                                                  <td className="px-4 py-2.5 font-bold text-slate-700">{order.orderNumber}</td>
                                                  <td className="px-4 py-2.5 text-slate-600">{order.dni}</td>
                                                  <td className="px-4 py-2.5 text-slate-400 font-mono">{order.startAffiliateId || '-'}</td>
                                                  <td className="px-4 py-2.5 text-right font-bold text-dosep-blue">${order.totalOrder.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                                  <td className="px-4 py-2.5 text-center">
                                                    <button 
                                                      onClick={() => setCancellingOrder({ order, lotNumber: lot.lotNumber })}
                                                      className="bg-red-50 text-red-500 p-1.5 rounded hover:bg-red-500 hover:text-white transition-colors"
                                                      title="Anular Orden"
                                                    >
                                                      <Trash2 size={12} />
                                                    </button>
                                                  </td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>

                                      <div className="mb-2">
                                        <h5 className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 mb-3">
                                          <ListChecks size={14} />
                                          Desglose Detallado de Cuotas
                                        </h5>
                                        <div className="bg-white border border-dosep-border rounded overflow-hidden">
                                          <table className="w-full text-left text-xs">
                                            <thead className="bg-slate-50 text-slate-500 text-[10px] uppercase font-bold border-b border-dosep-border">
                                              <tr>
                                                <th className="px-4 py-2">Nro Cuota</th>
                                                <th className="px-4 py-2">ID Afiliado</th>
                                                <th className="px-4 py-2">Estado</th>
                                                <th className="px-4 py-2 text-right">Monto</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-dosep-border">
                                              {lot.installments.map((inst) => (
                                                <tr key={inst.number} className="hover:bg-slate-50 transition-colors">
                                                  <td className="px-4 py-2.5 text-slate-400 font-medium">Cuota #{inst.number}</td>
                                                  <td className="px-4 py-2.5 font-bold text-slate-700">{inst.affiliateId}</td>
                                                  <td className="px-4 py-2.5">
                                                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${inst.status === 'COBRADA' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                                      {inst.status}
                                                    </span>
                                                  </td>
                                                  <td className="px-4 py-2.5 text-right font-mono font-bold text-dosep-blue">${inst.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</td>
                                                </tr>
                                              ))}
                                            </tbody>
                                          </table>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </section>
                          ))}

                          {result.otherOrders.length > 0 && (
                            <section className="bg-white rounded shadow-sm border border-dosep-border overflow-hidden">
                              <div className="p-4 bg-slate-50 border-b border-dosep-border">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                  <Wallet size={18} className="text-dosep-blue" />
                                  Otras Órdenes Procesadas (Caja / Crédito)
                                </h3>
                              </div>
                              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {result.otherOrders.map((order) => (
                                  <div key={order.id} className="p-4 border border-dosep-border rounded bg-slate-50/50 flex justify-between items-center group">
                                    <div>
                                      <p className="text-sm font-bold text-slate-700">Orden: {order.orderNumber}</p>
                                      <p className="text-xs text-slate-500">DNI: {order.dni}</p>
                                      <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[10px] font-bold text-dosep-blue bg-dosep-blue/10 px-2 py-0.5 rounded uppercase">
                                          {order.paymentMethod}
                                        </span>
                                        <span className="text-sm font-bold text-slate-600">${order.totalOrder.toLocaleString('es-AR')}</span>
                                      </div>
                                    </div>
                                    <button 
                                      onClick={() => setCancellingOrder({ order })}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-red-50 text-red-500 p-2 rounded hover:bg-red-500 hover:text-white"
                                      title="Anular Orden"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            </section>
                          )}

                          {generatedMails.map((mail, idx) => (
                            <section key={idx} className="bg-white rounded shadow-sm border border-dosep-border overflow-hidden">
                              <div className="p-4 bg-dosep-blue text-white flex items-center justify-between">
                                <h4 className="font-bold flex items-center gap-2">
                                  <Mail size={18} />
                                  Solicitud Formal de Modificación
                                </h4>
                                <button 
                                  onClick={() => copyToClipboard(mail.content)}
                                  className="bg-white/20 hover:bg-white/30 text-white px-3 py-1 rounded text-xs font-bold transition-colors flex items-center gap-2"
                                >
                                  <ClipboardCheck size={14} />
                                  COPIAR TEXTO
                                </button>
                              </div>
                              <div className="p-6 bg-slate-50">
                                <pre className="text-xs font-sans whitespace-pre-wrap text-slate-600 leading-relaxed italic">
                                  {mail.content}
                                </pre>
                              </div>
                            </section>
                          ))}
                        </>
                      ) : (
                        <div className="bg-white rounded shadow-sm border border-dashed border-dosep-border p-20 flex flex-col items-center justify-center text-center">
                          <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Search className="text-slate-200" size={32} />
                          </div>
                          <p className="text-slate-400 font-medium">Cargue órdenes y procese para ver resultados</p>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            </div>
          )}
        </main>
      </div>

      {/* MODALES Y OVERLAYS (Solo para refinanciacion) */}
      <AnimatePresence>
        {processing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center max-w-xs w-full border border-dosep-border"
            >
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-dosep-blue/10 rounded-full"></div>
                <div className="absolute inset-0 border-4 border-dosep-blue border-t-transparent rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <RefreshCw className="text-dosep-blue animate-pulse" size={32} />
                </div>
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">Procesando Lote</h3>
              <p className="text-sm text-slate-500 text-center leading-relaxed">
                Estamos recalculando los lotes, cuotas y generando los reportes correspondientes...
              </p>
              <div className="mt-6 w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: "0%" }} animate={{ width: "100%" }} transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="h-full bg-dosep-blue"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cancellingOrder && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl border border-dosep-border w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-dosep-border bg-red-50">
                <h3 className="text-lg font-bold text-red-700 flex items-center gap-2">
                  <AlertCircle size={20} /> Anular Orden
                </h3>
                <p className="text-xs text-red-600 mt-1">Esta acción es irreversible y se registrará en el historial.</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="bg-slate-50 p-4 rounded border border-dosep-border">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Detalles de la Orden</span>
                    <span className="text-[10px] font-bold text-dosep-blue bg-dosep-blue/10 px-2 py-0.5 rounded uppercase">
                      {cancellingOrder.order.paymentMethod}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-700">Nº Orden: {cancellingOrder.order.orderNumber}</p>
                  <p className="text-sm text-slate-600">Monto: ${cancellingOrder.order.totalOrder.toLocaleString('es-AR')}</p>
                  {cancellingOrder.lotNumber && (
                    <p className="text-xs text-slate-500 mt-1">Lote Asociado: {cancellingOrder.lotNumber}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500">Confirmar DNI del Afiliado</label>
                  <input 
                    type="text" value={cancelDni} onChange={(e) => setCancelDni(e.target.value)}
                    className="w-full border border-dosep-border rounded px-3 py-2 text-sm focus:border-red-500 outline-none transition-all"
                    placeholder="Ingrese el DNI para confirmar"
                  />
                </div>
              </div>
              <div className="p-6 bg-slate-50 border-t border-dosep-border flex gap-3">
                <button 
                  onClick={() => { setCancellingOrder(null); setCancelDni(''); }}
                  className="flex-1 px-4 py-2 rounded border border-slate-200 text-slate-600 font-bold text-sm hover:bg-white transition-all"
                >
                  CANCELAR
                </button>
                <button 
                  onClick={handleCancelOrder} disabled={!cancelDni}
                  className="flex-1 px-4 py-2 rounded bg-red-600 text-white font-bold text-sm hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ANULAR ORDEN
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}} />
      
      {/* CHAT ASSISTANT - (Puede recibir la vista activa también si lo adaptas) */}
      <ChatAssistant currentContext={{
        vistaActiva, dni, orderNumber, totalOrder, totalInstallments, paidInstallments,
        paymentMethod, isSpecialPlan, result, pendingOrdersCount: pendingOrders.length
      }} />
    </div>
  );
}

// ==========================================
// COMPONENTES AUXILIARES
// ==========================================
function Skeleton({ className }: { className?: string; key?: React.Key }) {
  return <div className={`animate-pulse bg-slate-200 rounded ${className}`} />;
}

function SidebarItem({ icon, label, active = false, hasChevron = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, hasChevron?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between px-6 py-3 cursor-pointer transition-colors ${active ? 'bg-dosep-dark border-l-4 border-dosep-teal' : 'hover:bg-dosep-dark/50'}`}>
      <div className="flex items-center gap-3">
        <span className={active ? 'text-dosep-teal' : 'text-white/70'}>{icon}</span>
        <span className={`text-sm ${active ? 'font-bold' : 'font-medium opacity-80'}`}>{label}</span>
      </div>
      {hasChevron && <ChevronRight size={14} className="opacity-40" />}
    </div>
  );
}

function SidebarSubItem({ label, active = false, hasChevron = false, onClick }: { label: string, active?: boolean, hasChevron?: boolean, onClick?: () => void }) {
  return (
    <div onClick={onClick} className={`flex items-center justify-between pl-14 pr-6 py-2.5 cursor-pointer transition-colors ${active ? 'bg-dosep-dark/40 font-bold' : 'hover:bg-dosep-dark/30'}`}>
      <span className={`text-[13px] ${active ? 'text-dosep-teal' : 'text-white/60'}`}>{label}</span>
      {hasChevron && <ChevronRight size={12} className="opacity-40" />}
    </div>
  );
}

```
