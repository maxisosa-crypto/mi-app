import React, { useState } from 'react';
import ChatAssistant from './components/ChatAssistant';

// -----------------------------------------------------------------------------
// INTERFACES Y TIPOS
// -----------------------------------------------------------------------------
interface Servicio {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  categoria: string;
  valor: number;
  coseguro: number;
}

interface CuotaSimulada {
  numero: number;
  vencimiento: string;
  montoCuota: number;
  interes: number;
  capital: number;
  saldoRestante: number;
}

export default function App() {
  // Pestaña activa: 'coseguro' | 'refinanciacion' | 'asistente'
  const [activeTab, setActiveTab] = useState<'coseguro' | 'refinanciacion' | 'asistente'>('coseguro');

  // ---------------------------------------------------------------------------
  // MÓDULO 1: CALCULADORA DE AJUSTE
  // ---------------------------------------------------------------------------
  const [calcValorOriginal, setCalcValorOriginal] = useState<string>('82300');
  const [calcValorFinal, setCalcValorFinal] = useState<string>('75000');
  const [resultadoAjuste, setResultadoAjuste] = useState<{
    tipo: 'DISMINUCIÓN' | 'AUMENTO' | 'SIN CAMBIO';
    porcentaje: number;
    porcentajeStr: string;
  } | null>({
    tipo: 'DISMINUCIÓN',
    porcentaje: 8.8699878,
    porcentajeStr: '8.86999',
  });

  const handleCalcularDiferencia = () => {
    const orig = parseFloat(calcValorOriginal.replace(',', '.'));
    const fin = parseFloat(calcValorFinal.replace(',', '.'));

    if (isNaN(orig) || isNaN(fin) || orig <= 0) {
      alert('Por favor ingrese valores numéricos válidos mayores a cero.');
      return;
    }

    const diferencia = fin - orig;
    const pct = (Math.abs(diferencia) / orig) * 100;
    
    // Conserva 5 decimales de precisión
    const pctFormateado = pct.toFixed(5);

    let tipo: 'DISMINUCIÓN' | 'AUMENTO' | 'SIN CAMBIO' = 'SIN CAMBIO';
    if (diferencia < 0) tipo = 'DISMINUCIÓN';
    if (diferencia > 0) tipo = 'AUMENTO';

    setResultadoAjuste({
      tipo,
      porcentaje: pct,
      porcentajeStr: pctFormateado,
    });
  };

  const handleTransferirPorcentaje = () => {
    if (!resultadoAjuste) return;
    setPorcentajeActualizacion(resultadoAjuste.porcentajeStr);
    setTipoActualizacion(resultadoAjuste.tipo === 'DISMINUCIÓN' ? 'Negativo' : 'Positivo');
  };

  // ---------------------------------------------------------------------------
  // MÓDULO 2: GESTIÓN DE COSEGURO Y PRESTACIONES
  // ---------------------------------------------------------------------------
  const [tipoActualizacion, setTipoActualizacion] = useState<'Negativo' | 'Positivo'>('Negativo');
  const [porcentajeActualizacion, setPorcentajeActualizacion] = useState<string>('8.86999');

  const [servicios, setServicios] = useState<Servicio[]>([
    {
      id: '1',
      codigo: '32.01-SC',
      nombre: '(N1 1ayu) REDUCCION MANUAL DE PARAFIMOSIS.',
      tipo: 'Prestaciones',
      categoria: 'Cirugía General',
      valor: 273936.6,
      coseguro: 75000,
    },
  ]);

  const [nuevoServicio, setNuevoServicio] = useState({
    codigo: '',
    nombre: '',
    tipo: 'Prestaciones',
    categoria: 'Cirugía General',
    valor: '',
    coseguro: '',
  });
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);

  const handleAplicarCambios = () => {
    const pct = parseFloat(porcentajeActualizacion.replace(',', '.'));
    if (isNaN(pct)) {
      alert('Ingrese un porcentaje válido.');
      return;
    }

    const serviciosActualizados = servicios.map((item) => {
      let nuevoCoseguro = item.coseguro;
      if (tipoActualizacion === 'Negativo') {
        nuevoCoseguro = item.valor * (1 - pct / 100);
      } else {
        nuevoCoseguro = item.valor * (1 + pct / 100);
      }

      // Redondeo monetario exacto a 2 decimales para evitar micro-diferencias de centavos
      const coseguroRedondeado = Math.round((nuevoCoseguro + Number.EPSILON) * 100) / 100;

      return {
        ...item,
        coseguro: coseguroRedondeado,
      };
    });

    setServicios(serviciosActualizados);
  };

  const handleEliminarServicio = (id: string) => {
    setServicios(servicios.filter((s) => s.id !== id));
  };

  const handleAgregarServicio = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nuevoServicio.codigo || !nuevoServicio.nombre || !nuevoServicio.valor) {
      alert('Complete los campos obligatorios.');
      return;
    }

    const val = parseFloat(nuevoServicio.valor);
    const cos = nuevoServicio.coseguro ? parseFloat(nuevoServicio.coseguro) : val;

    const itemNuevo: Servicio = {
      id: Date.now().toString(),
      codigo: nuevoServicio.codigo,
      nombre: nuevoServicio.nombre,
      tipo: nuevoServicio.tipo,
      categoria: nuevoServicio.categoria,
      valor: val,
      coseguro: cos,
    };

    setServicios([...servicios, itemNuevo]);
    setNuevoServicio({
      codigo: '',
      nombre: '',
      tipo: 'Prestaciones',
      categoria: 'Cirugía General',
      valor: '',
      coseguro: '',
    });
    setMostrarFormNuevo(false);
  };

  // ---------------------------------------------------------------------------
  // MÓDULO 3: CALCULADORA DE REFINANCIACIÓN Y CUOTAS
  // ---------------------------------------------------------------------------
  const [montoRefinanciar, setMontoRefinanciar] = useState<string>('150000');
  const [anticipo, setAnticipo] = useState<string>('30000');
  const [cantidadCuotas, setCantidadCuotas] = useState<number>(6);
  const [tasaInteresMensual, setTasaInteresMensual] = useState<string>('2.5');
  const [planSimulado, setPlanSimulado] = useState<CuotaSimulada[]>([]);

  const handleSimularRefinanciacion = () => {
    const total = parseFloat(montoRefinanciar);
    const ant = parseFloat(anticipo) || 0;
    const tasa = parseFloat(tasaInteresMensual) / 100 || 0;

    if (isNaN(total) || total <= 0) {
      alert('Ingrese un monto válido a refinanciar.');
      return;
    }

    const saldoAFinanciar = Math.max(0, total - ant);
    if (saldoAFinanciar === 0) {
      setPlanSimulado([]);
      return;
    }

    // Cálculo de cuotas constantes (Sistema Francés)
    let cuotaMensual = 0;
    if (tasa > 0) {
      cuotaMensual =
        (saldoAFinanciar * (tasa * Math.pow(1 + tasa, cantidadCuotas))) /
        (Math.pow(1 + tasa, cantidadCuotas) - 1);
    } else {
      cuotaMensual = saldoAFinanciar / cantidadCuotas;
    }

    let saldo = saldoAFinanciar;
    const cuotasGeneradas: CuotaSimulada[] = [];

    const fechaBase = new Date();

    for (let i = 1; i <= cantidadCuotas; i++) {
      const interesCuota = saldo * tasa;
      const capitalCuota = cuotaMensual - interesCuota;
      saldo = Math.max(0, saldo - capitalCuota);

      const fechaVenc = new Date(fechaBase);
      fechaVenc.setMonth(fechaVenc.getMonth() + i);

      cuotasGeneradas.push({
        numero: i,
        vencimiento: fechaVenc.toLocaleDateString('es-AR'),
        montoCuota: Math.round((cuotaMensual + Number.EPSILON) * 100) / 100,
        interes: Math.round((interesCuota + Number.EPSILON) * 100) / 100,
        capital: Math.round((capitalCuota + Number.EPSILON) * 100) / 100,
        saldoRestante: Math.round((saldo + Number.EPSILON) * 100) / 100,
      });
    }

    setPlanSimulado(cuotasGeneradas);
  };

  // ---------------------------------------------------------------------------
  // RENDERIZADO
  // ---------------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 flex flex-col font-sans">
      
      {/* NAVEGACIÓN Y CABECERA INSTITUCIONAL */}
      <header className="bg-indigo-950 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-white text-indigo-950 px-3 py-1.5 rounded-lg font-black text-2xl tracking-widest shadow">
              DOSEP
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Plataforma de Liquidación y Refinanciación</h1>
              <p className="text-xs text-indigo-200">Obra Social de Empleados Públicos de San Luis</p>
            </div>
          </div>

          {/* PESTAÑAS PRINCIPALES */}
          <nav className="flex bg-indigo-900/60 p-1 rounded-xl border border-indigo-800">
            <button
              onClick={() => setActiveTab('coseguro')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'coseguro'
                  ? 'bg-white text-indigo-950 shadow-md'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              📊 Coseguros & Calculadora
            </button>
            <button
              onClick={() => setActiveTab('refinanciacion')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'refinanciacion'
                  ? 'bg-white text-indigo-950 shadow-md'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              💳 Plan de Refinanciación
            </button>
            <button
              onClick={() => setActiveTab('asistente')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'asistente'
                  ? 'bg-white text-indigo-950 shadow-md'
                  : 'text-indigo-200 hover:text-white'
              }`}
            >
              🤖 Asistente Virtual IA
            </button>
          </nav>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL SEGÚN PESTAÑA SELECCIONADA */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 space-y-6">

        {/* ----------------------------------------------------------------- */}
        {/* PESTAÑA 1: COSEGUROS Y CALCULADORA DE AJUSTE */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'coseguro' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* MÓDULO CALCULADORA DE AJUSTE */}
            <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="p-2 bg-indigo-50 text-indigo-800 rounded-lg font-bold">%</div>
                <h2 className="text-lg font-bold text-slate-800">Calculadora de Ajuste</h2>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Valor Original ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 text-sm"
                    value={calcValorOriginal}
                    onChange={(e) => setCalcValorOriginal(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Valor Final / Nuevo ($)
                  </label>
                  <input
                    type="number"
                    step="any"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 text-sm"
                    value={calcValorFinal}
                    onChange={(e) => setCalcValorFinal(e.target.value)}
                  />
                </div>

                <button
                  type="button"
                  onClick={handleCalcularDiferencia}
                  className="w-full bg-indigo-900 hover:bg-indigo-950 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-xs tracking-wider uppercase shadow"
                >
                  CALCULAR DIFERENCIA
                </button>

                {/* RESULTADO DEL CÁLCULO DE AJUSTE */}
                {resultadoAjuste && (
                  <div
                    className={`p-4 rounded-lg text-center space-y-1 border ${
                      resultadoAjuste.tipo === 'DISMINUCIÓN'
                        ? 'bg-red-50 border-red-200 text-red-700'
                        : resultadoAjuste.tipo === 'AUMENTO'
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                        : 'bg-slate-100 border-slate-200 text-slate-700'
                    }`}
                  >
                    <p className="text-[10px] font-bold tracking-widest uppercase">
                      {resultadoAjuste.tipo}
                    </p>
                    <p className="text-3xl font-black tracking-tight">
                      {resultadoAjuste.porcentajeStr}%
                    </p>
                    <p className="text-[11px] text-slate-500">
                      (Precisión ajustada a 5 decimales)
                    </p>

                    <button
                      type="button"
                      onClick={handleTransferirPorcentaje}
                      className="mt-2 text-xs text-indigo-700 hover:text-indigo-900 font-semibold underline block mx-auto"
                    >
                      Copiar este porcentaje a Coseguro →
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* MÓDULO TABLA DE COSEGURO Y SERVICIOS */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* CONFIGURACIÓN DEL COSEGURO */}
              <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
                <h2 className="text-base font-bold text-slate-900 uppercase tracking-wide">COSEGURO</h2>

                <div className="p-4 border border-slate-200 rounded-lg max-w-md bg-slate-50/60">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">
                        Tipo de Actualización:
                      </label>
                      <select
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        value={tipoActualizacion}
                        onChange={(e) => setTipoActualizacion(e.target.value as 'Negativo' | 'Positivo')}
                      >
                        <option value="Negativo">Negativo</option>
                        <option value="Positivo">Positivo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-blue-700 mb-1">
                        Porcentaje:
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="any"
                          className="w-full px-3 py-2 border-2 border-blue-600 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold text-slate-900"
                          value={porcentajeActualizacion}
                          onChange={(e) => setPorcentajeActualizacion(e.target.value)}
                        />
                        <span className="absolute right-3 top-2 text-sm text-slate-500 font-bold">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* TABLA DE PRESTACIONES */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-white font-semibold uppercase tracking-wider">
                        <th className="py-3 px-4 border-r border-slate-700">Codigo</th>
                        <th className="py-3 px-4 border-r border-slate-700">Nombre del Servicio</th>
                        <th className="py-3 px-4 border-r border-slate-700">Tipo</th>
                        <th className="py-3 px-4 border-r border-slate-700">Categoria</th>
                        <th className="py-3 px-4 border-r border-slate-700 text-right">Valor</th>
                        <th className="py-3 px-4 border-r border-slate-700 text-right">Coseguro</th>
                        <th className="py-3 px-4 text-center">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-slate-700">
                      {servicios.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="py-6 text-center text-slate-400 italic">
                            No hay servicios cargados.
                          </td>
                        </tr>
                      ) : (
                        servicios.map((item) => (
                          <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-3 px-4 font-medium text-slate-900 border-r border-slate-200">
                              {item.codigo}
                            </td>
                            <td className="py-3 px-4 border-r border-slate-200 font-semibold">
                              {item.nombre}
                            </td>
                            <td className="py-3 px-4 border-r border-slate-200">
                              {item.tipo}
                            </td>
                            <td className="py-3 px-4 border-r border-slate-200">
                              {item.categoria}
                            </td>
                            <td className="py-3 px-4 border-r border-slate-200 text-right font-medium">
                              ${item.valor.toFixed(1)}
                            </td>
                            <td className="py-3 px-4 border-r border-slate-200 text-right font-bold text-slate-900 bg-blue-50/40">
                              ${item.coseguro.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <button
                                type="button"
                                onClick={() => handleEliminarServicio(item.id)}
                                className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                title="Eliminar servicio"
                              >
                                ✕
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setMostrarFormNuevo(!mostrarFormNuevo)}
                    className="bg-white border border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors text-xs"
                  >
                    {mostrarFormNuevo ? 'Cancelar' : 'Agregar Servicio'}
                  </button>

                  <button
                    type="button"
                    onClick={handleAplicarCambios}
                    className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-semibold py-2 px-5 rounded-lg transition-colors text-xs"
                  >
                    Aplicar Cambios
                  </button>
                </div>

                {mostrarFormNuevo && (
                  <form onSubmit={handleAgregarServicio} className="p-4 border-t border-slate-200 bg-indigo-50/30 space-y-3">
                    <h3 className="text-xs font-bold text-slate-700 uppercase">Nuevo Servicio</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                      <input
                        type="text"
                        placeholder="Código (ej: 32.01-SC)"
                        className="px-3 py-2 border rounded-lg"
                        value={nuevoServicio.codigo}
                        onChange={(e) => setNuevoServicio({ ...nuevoServicio, codigo: e.target.value })}
                      />
                      <input
                        type="text"
                        placeholder="Nombre del servicio"
                        className="px-3 py-2 border rounded-lg md:col-span-2"
                        value={nuevoServicio.nombre}
                        onChange={(e) => setNuevoServicio({ ...nuevoServicio, nombre: e.target.value })}
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Valor ($)"
                        className="px-3 py-2 border rounded-lg"
                        value={nuevoServicio.valor}
                        onChange={(e) => setNuevoServicio({ ...nuevoServicio, valor: e.target.value })}
                      />
                      <input
                        type="number"
                        step="any"
                        placeholder="Coseguro ($ - opcional)"
                        className="px-3 py-2 border rounded-lg"
                        value={nuevoServicio.coseguro}
                        onChange={(e) => setNuevoServicio({ ...nuevoServicio, coseguro: e.target.value })}
                      />
                      <button
                        type="submit"
                        className="bg-indigo-900 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-950 transition-colors"
                      >
                        Guardar Servicio
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* PESTAÑA 2: SIMULADOR DE PLANES DE REFINANCIACIÓN */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'refinanciacion' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* FORMULARIO DE SIMULACIÓN */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 pb-2 border-b">Parámetros del Plan</h2>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Monto Total a Refinanciar ($)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={montoRefinanciar}
                  onChange={(e) => setMontoRefinanciar(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Anticipo / Entrega Inicial ($)</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={anticipo}
                  onChange={(e) => setAnticipo(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Cantidad de Cuotas</label>
                <select
                  className="w-full px-3 py-2 border rounded-lg text-sm bg-white"
                  value={cantidadCuotas}
                  onChange={(e) => setCantidadCuotas(parseInt(e.target.value))}
                >
                  <option value={3}>3 Cuotas</option>
                  <option value={6}>6 Cuotas</option>
                  <option value={12}>12 Cuotas</option>
                  <option value={18}>18 Cuotas</option>
                  <option value={24}>24 Cuotas</option>
                  <option value={36}>36 Cuotas</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Tasa de Interés Mensual (%)</label>
                <input
                  type="number"
                  step="0.01"
                  className="w-full px-3 py-2 border rounded-lg text-sm"
                  value={tasaInteresMensual}
                  onChange={(e) => setTasaInteresMensual(e.target.value)}
                />
              </div>

              <button
                type="button"
                onClick={handleSimularRefinanciacion}
                className="w-full bg-indigo-900 hover:bg-indigo-950 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider shadow"
              >
                Generar Plan de Pagos
              </button>
            </div>

            {/* TABLA DE RESULTADOS DE SIMULACIÓN */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-slate-800 mb-4">Cuadro de Amortización</h2>

              {planSimulado.length === 0 ? (
                <div className="p-8 text-center text-slate-400 italic bg-slate-50 rounded-lg">
                  Presione "Generar Plan de Pagos" para ver el desglose de cuotas.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 font-bold uppercase">
                        <th className="p-2.5">N° Cuota</th>
                        <th className="p-2.5">Vencimiento</th>
                        <th className="p-2.5 text-right">Monto Cuota</th>
                        <th className="p-2.5 text-right">Interés</th>
                        <th className="p-2.5 text-right">Capital</th>
                        <th className="p-2.5 text-right">Saldo Restante</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {planSimulado.map((c) => (
                        <tr key={c.numero} className="hover:bg-slate-50">
                          <td className="p-2.5 font-bold text-indigo-900">Cuota {c.numero}</td>
                          <td className="p-2.5">{c.vencimiento}</td>
                          <td className="p-2.5 text-right font-bold text-slate-900">${c.montoCuota.toFixed(2)}</td>
                          <td className="p-2.5 text-right text-slate-500">${c.interes.toFixed(2)}</td>
                          <td className="p-2.5 text-right text-slate-600">${c.capital.toFixed(2)}</td>
                          <td className="p-2.5 text-right font-semibold">${c.saldoRestante.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ----------------------------------------------------------------- */}
        {/* PESTAÑA 3: ASISTENTE VIRTUAL IA */}
        {/* ----------------------------------------------------------------- */}
        {activeTab === 'asistente' && (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden h-[700px] flex flex-col">
            <ChatAssistant />
          </div>
        )}

      </main>

      {/* PIE DE PÁGINA */}
      <footer className="bg-slate-800 text-slate-400 text-xs py-4 text-center border-t border-slate-700">
        DOSEP - Sistema Integrado de Liquidaciones y Refinanciación • San Luis, Argentina
      </footer>

    </div>
  );
}
