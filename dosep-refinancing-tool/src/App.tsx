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
  const [totalOrder, setTotalOrder] = useState('');
  const [totalInstallments, setTotalInstallments] = useState('');
  const [paidInstallments, setPaidInstallments] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('financiado');
  const [isSpecialPlan, setIsSpecialPlan] = useState('no');
  const [dppLotNumber, setDppLotNumber] = useState('');
  const [dppLotTotal, setDppLotTotal] = useState('');
  const [startAffiliateId, setStartAffiliateId] = useState('181225864');
  const [isFullyPaidLot, setIsFullyPaidLot] = useState(false);
  const [targetCreditLotNumber, setTargetCreditLotNumber] = useState('');
  const [targetLotTotal, setTargetLotTotal] = useState('');
  const [targetLotInstallments, setTargetLotInstallments] = useState('');
  const [targetLotPaidInstallments, setTargetLotPaidInstallments] = useState('');
  const [targetCreditStartAffiliateId, setTargetCreditStartAffiliateId] = useState('');
  const [newTotalInstallments, setNewTotalInstallments] = useState('');

  const [pendingOrders, setPendingOrders] = useState([]);
  const [result, setResult] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [generatedMails, setGeneratedMails] = useState<{lot: string, content: string}[]>([]);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [expandedLot, setExpandedLot] = useState(null);
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
  const [pmHistorial, setPmHistorial] = useState([]);
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
  const saveToHistory = (record: Omit) => {
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
    setTargetLotInstallments(''); setTargetLotPaidInstallments(''); setTargetCreditStartAffiliateId('');
    setNewTotalInstallments('');
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
    if (paymentMethod === 'financiado' && isFullyPaidLot && !targetCreditStartAffiliateId) {
      alert('Debe ingresar el ID de Afiliado Inicial para el lote destino.');
      return;
    }

    const newOrder: any = {
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
      targetCreditStartAffiliateId: (paymentMethod === 'financiado' && isFullyPaidLot) ? targetCreditStartAffiliateId : undefined,
      newTotalInstallments: newTotalInstallments !== '' ? Number(newTotalInstallments) : undefined,
    };

    setPendingOrders([...pendingOrders, newOrder as OrderEntry]);
    setOrderNumber(''); setTotalOrder(''); setIsFullyPaidLot(false);
    setTargetCreditLotNumber(''); setTargetLotTotal(''); setTargetCreditStartAffiliateId('');
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
              startId: o.isFullyPaidLot ? ((o as any).targetCreditStartAffiliateId || '0') : (o.startAffiliateId || '181225864'),
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

        group.incomingCredits.forEach((o: any) => {
          const valorCuotaOrigen = o.totalInstallments > 0 ? o.totalOrder / o.totalInstallments : 0;
          const montoPagadoAFavor = valorCuotaOrigen * o.paidInstallments;
          incomingCredit += montoPagadoAFavor;
        });

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
          const valorCuotaOrigen = o.totalInstallments > 0 ? o.totalOrder / o.totalInstallments : 0;
          const montoPagadoAFavor = valorCuotaOrigen * o.paidInstallments;
          dniInLot[o.dni].credits.push({ sourceLot: o.dppLotNumber!, amount: montoPagadoAFavor });
        });

        Object.entries(dniInLot).forEach(([dni, data]: [string, any]) => {
          const firstPendingInst = installments.find(inst => inst.status === 'PENDIENTE');
          const formattedTotal = nuevoTotalLote.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
          const formattedCuota = nuevoValorCuota.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' });
          
          let line = `DNI: \({dni}: modificar lote dpp\){lotNum} al valor de ${formattedTotal}`;
          if (firstPendingInst) line += ` y modificar nro cta afiliado \({firstPendingInst.affiliateId} al valor de\){formattedCuota}`;
          
          const reasons: string[] = [];
          if (data.orders.length > 0) reasons.push(`anulacion de orden ${data.orders.join(' y ')}`);
          if (data.credits.length > 0) {
            data.credits.forEach((c: any) => reasons.push(`credito por orden anulada en lote \({c.sourceLot} (ya cobrado) por valor de\){c.amount.toLocaleString('es-AR', { style: 'currency', currency: 'ARS' })}`));
          }
          line += ` por ${reasons.join(' y ')}.`;
          mailLines.push(line);
        });

        group.ordersToCancel.forEach((o: any) => saveToHistory({ dni: o.dni, orderNumber: o.orderNumber, paymentMethod: 'Financiado (DPP)', action: 'Recalculación de cuotas', cancelledAmount: o.totalOrder, lotNumber: lotNum }));
        group.incomingCredits.forEach((o: any) => {
          const valorCuotaOrigen = o.totalInstallments > 0 ? o.totalOrder / o.totalInstallments : 0;
          const montoPagadoAFavor = valorCuotaOrigen * o.paidInstallments;
          saveToHistory({ dni: o.dni, orderNumber: o.orderNumber, paymentMethod: 'Financiado (DPP)', action: `Crédito aplicado al lote ${lotNum}`, cancelledAmount: montoPagadoAFavor, lotNumber: o.dppLotNumber });
        });
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
      worksheet.mergeCells(`A\({titleRow.number}:D\){titleRow.number}`);

      const refRow = worksheet.addRow(["Referencia: CNT_historicodescuentosporplanilla"]);
      refRow.font = { italic: true, size: 11, color: { argb: 'FF666666' } };
      worksheet.mergeCells(`A\({refRow.number}:D\){refRow.number}`);
      worksheet.addRow([]);

      data.lots.forEach(lot => {
        const lotHeader = worksheet.addRow(["LOTE DPP Nº: " + lot.lotNumber]);
        lotHeader.font = { bold: true, size: 12 };
        worksheet.mergeCells(`A\({lotHeader.number}:D\){lotHeader.number}`);

        const orderHeader = worksheet.addRow(["Órdenes del afiliado en este lote:"]);
        orderHeader.font = { italic: true };
        worksheet.mergeCells(`A\({orderHeader.number}:D\){orderHeader.number}`);

        lot.orders.filter(o => o.dni === dni && !o.isFullyPaidLot).forEach(o => {
          const row = worksheet.addRow(["- Orden: " + o.orderNumber + " | Total Orden:", "", "", o.totalOrder]);
          row.getCell(4).numFmt = '"$"#,##0.00'; row.getCell(4).font = { bold: true };
        });

        const incomingCredits = result.lots.flatMap(l => l.orders).filter(o => o.dni === dni && o.isFullyPaidLot && o.targetCreditLotNumber === lot.lotNumber);
        if (incomingCredits.length > 0) {
          const creditHeader = worksheet.addRow(["Créditos aplicados desde otros lotes (ya cobrados):"]);
          creditHeader.font = { italic: true, color: { argb: 'FF008000' } };
          worksheet.mergeCells(`A\({creditHeader.number}:D\){creditHeader.number}`);
          incomingCredits.forEach(c => {
            const valorCuotaOrigen = c.totalInstallments > 0 ? c.totalOrder / c.totalInstallments : 0;
            const montoPagadoAFavor = valorCuotaOrigen * c.paidInstallments;
            const row = worksheet.addRow([`- Desde Lote \({c.dppLotNumber} (Orden\){c.orderNumber}):`, "", "", montoPagadoAFavor]);
            row.getCell(4).numFmt = '"$"#,##0.00'; row.getCell(4).font = { bold: true };
          });
        }

        worksheet.addRow([]);
        const breakdownTitle = worksheet.addRow(["DESGLOSE DE CUOTAS DEL LOTE (Recalculado)"]);
        breakdownTitle.font = { bold: true };
        worksheet.mergeCells(`A\({breakdownTitle.number}:D\){breakdownTitle.number}`);

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
        worksheet.mergeCells(`A\({otherTitle.number}:D\){otherTitle.number}`);
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
    const fechaNacFormateada = `\({dayStr}/\){monthStr}/${yearStr}`;

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
    const fechaLegible = `\({dia}/\){mes}/\({anio}\){hora}:${min}`;

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
    filtrados.forEach(row => { csvContent += `\({row.fechaLegible};\){row.dni};${row.fechaNac}\n`; });

    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Reporte_PlanMujer_\({pmDesde}_al_\){pmHasta}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderTarjetaPlan = (titulo: string, min: number, max: number) => {
    if (!pmResultado) return null;
    const { edad, dia, mes, anio } = pmResultado;
    const anioActivacion = anio + min;
    const anioVencimiento = anio + max;
    const fechaActivacion = `\({dia}/\){mes}/${anioActivacion}`;
    const fechaVencimiento = `\({dia}/\){mes}/${anioVencimiento}`;

    let estadoHtml = null;
    if (edad >= max) {
        estadoHtml =
