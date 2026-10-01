import React, { useState } from 'react';

// Interfaz para definir la estructura de cada servicio/prestación
interface Servicio {
  id: string;
  codigo: string;
  nombre: string;
  tipo: string;
  categoria: string;
  valor: number;
  coseguro: number;
}

export default function App() {
  // ---------------------------------------------------------------------------
  // ESTADOS - CALCULADORA DE AJUSTE
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

  // ---------------------------------------------------------------------------
  // ESTADOS - MÓDULO COSEGURO
  // ---------------------------------------------------------------------------
  const [tipoActualizacion, setTipoActualizacion] = useState<'Negativo' | 'Positivo'>('Negativo');
  // Se inicializa con 5 decimales de precisión
  const [porcentajeActualizacion, setPorcentajeActualizacion] = useState<string>('8.86999');

  // Lista de servicios inicial (incluye el ejemplo de la imagen)
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

  // Estado para el formulario de nuevo servicio
  const [nuevoServicio, setNuevoServicio] = useState({
    codigo: '',
    nombre: '',
    tipo: 'Prestaciones',
    categoria: 'Cirugía General',
    valor: '',
    coseguro: '',
  });
  const [mostrarFormNuevo, setMostrarFormNuevo] = useState(false);

  // ---------------------------------------------------------------------------
  // FUNCIONES DE CÁLCULO
  // ---------------------------------------------------------------------------

  /**
   * Calcula la diferencia porcentual con 5 decimales de precisión.
   */
  const handleCalcularDiferencia = () => {
    const orig = parseFloat(calcValorOriginal.replace(',', '.'));
    const fin = parseFloat(calcValorFinal.replace(',', '.'));

    if (isNaN(orig) || isNaN(fin) || orig <= 0) {
      alert('Por favor ingrese valores numéricos válidos mayores a cero.');
      return;
    }

    const diferencia = fin - orig;
    const pct = (Math.abs(diferencia) / orig) * 100;
    
    // Guardamos con 5 decimales exactos para evitar pérdida de precisión
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

  /**
   * Copia el porcentaje calculado (con 5 decimales) directamente a la casilla de Coseguro.
   */
  const handleTransferirPorcentaje = () => {
    if (!resultadoAjuste) return;
    setPorcentajeActualizacion(resultadoAjuste.porcentajeStr);
    setTipoActualizacion(resultadoAjuste.tipo === 'DISMINUCIÓN' ? 'Negativo' : 'Positivo');
  };

  /**
   * Aplica el porcentaje de actualización a todos los coseguros de la tabla.
   */
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

      // Redondeo matemático exacto a 2 decimales para eliminar residuos de coma flotante (.9999 o .0001)
      const coseguroRedondeado = Math.round((nuevoCoseguro + Number.EPSILON) * 100) / 100;

      return {
        ...item,
        coseguro: coseguroRedondeado,
      };
    });

    setServicios(serviciosActualizados);
  };

  // ---------------------------------------------------------------------------
  // GESTIÓN DE SERVICIOS
  // ---------------------------------------------------------------------------
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* ENCABEZADO */}
        <header className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-900 text-white p-2.5 rounded-lg font-bold text-xl tracking-wider">
              DOSEP
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">Módulo de Liquidación y Coseguros</h1>
              <p className="text-xs text-slate-500">Herramienta de Refinanciación y Ajuste de Valores</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* ----------------------------------------------------------------- */}
          {/* SECCIÓN 1: CALCULADORA DE AJUSTE */}
          {/* ----------------------------------------------------------------- */}
          <div className="lg:col-span-1 bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
            <div className="flex items-center gap-3 pb-2 border-b border-slate-100">
              <div className="p-2 bg-indigo-50 text-indigo-700 rounded-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <h2 className="text-lg font-bold text-slate-800">Calculadora de Ajuste</h2>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Valor Original
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 text-sm"
                  value={calcValorOriginal}
                  onChange={(e) => setCalcValorOriginal(e.target.value)}
                  placeholder="Ej: 82300"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Valor Final (Nuevo)
                </label>
                <input
                  type="number"
                  step="any"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none text-slate-800 text-sm"
                  value={calcValorFinal}
                  onChange={(e) => setCalcValorFinal(e.target.value)}
                  placeholder="Ej: 75000"
                />
              </div>

              <button
                type="button"
                onClick={handleCalcularDiferencia}
                className="w-full bg-indigo-900 hover:bg-indigo-950 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors text-sm shadow-sm"
              >
                CALCULAR DIFERENCIA
              </button>

              {/* RESULTADO CON 5 DECIMALES */}
              {resultadoAjuste && (
                <div
                  className={`p-4 rounded-lg text-center space-y-2 border ${
                    resultadoAjuste.tipo === 'DISMINUCIÓN'
                      ? 'bg-red-50 border-red-200 text-red-700'
                      : resultadoAjuste.tipo === 'AUMENTO'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <p className="text-xs font-bold tracking-wider uppercase">
                    {resultadoAjuste.tipo}
                  </p>
                  <p className="text-3xl font-extrabold tracking-tight">
                    {resultadoAjuste.porcentajeStr}%
                  </p>
                  <p className="text-[11px] text-slate-500 italic">
                    (Precisión extendida a 5 decimales)
                  </p>

                  <button
                    type="button"
                    onClick={handleTransferirPorcentaje}
                    className="mt-2 text-xs text-indigo-700 hover:text-indigo-900 underline font-medium block mx-auto"
                  >
                    Usar este porcentaje en Coseguro →
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* ----------------------------------------------------------------- */}
          {/* SECCIÓN 2: MÓDULO COSEGURO */}
          {/* ----------------------------------------------------------------- */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* PANEL DE CONFIGURACIÓN DEL COSEGURO */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <h2 className="text-lg font-bold text-slate-800 tracking-wide uppercase">COSEGURO</h2>

              <div className="p-4 border border-slate-200 rounded-lg max-w-md bg-slate-50/50">
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
                    <label className="block text-xs font-medium text-blue-700 font-semibold mb-1">
                      Porcentaje:
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="any"
                        className="w-full px-3 py-2 border-2 border-blue-600 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 font-bold text-slate-900"
                        value={porcentajeActualizacion}
                        onChange={(e) => setPorcentajeActualizacion(e.target.value)}
                        placeholder="8.86999"
                      />
                      <span className="absolute right-3 top-2 text-sm text-slate-500 font-bold">%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* TABLA DE SERVICIOS */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="bg-slate-800 text-white text-xs font-semibold uppercase tracking-wider">
                      <th className="py-3 px-4 border-r border-slate-700">Codigo</th>
                      <th className="py-3 px-4 border-r border-slate-700">Nombre del Servicio</th>
                      <th className="py-3 px-4 border-r border-slate-700">Tipo</th>
                      <th className="py-3 px-4 border-r border-slate-700">Categoria</th>
                      <th className="py-3 px-4 border-r border-slate-700 text-right">Valor</th>
                      <th className="py-3 px-4 border-r border-slate-700 text-right">Coseguro</th>
                      <th className="py-3 px-4 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 text-slate-700 text-xs">
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
                          <td className="py-3 px-4 border-r border-slate-200 text-right font-bold text-slate-900 bg-blue-50/30">
                            ${item.coseguro.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <button
                              type="button"
                              onClick={() => handleEliminarServicio(item.id)}
                              className="text-slate-400 hover:text-red-600 transition-colors p-1"
                              title="Eliminar servicio"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* BOTONES DE ACCIÓN */}
              <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setMostrarFormNuevo(!mostrarFormNuevo)}
                  className="bg-white border border-blue-600 text-blue-700 hover:bg-blue-50 font-semibold py-2 px-4 rounded-lg transition-colors text-sm shadow-sm"
                >
                  {mostrarFormNuevo ? 'Cancelar' : 'Agregar Servicio'}
                </button>

                <button
                  type="button"
                  onClick={handleAplicarCambios}
                  className="bg-slate-300 hover:bg-slate-400 text-slate-800 font-semibold py-2 px-5 rounded-lg transition-colors text-sm shadow-sm"
                >
                  Aplicar Cambios
                </button>
              </div>

              {/* FORMULARIO AGREGAR SERVICIO */}
              {mostrarFormNuevo && (
                <form onSubmit={handleAgregarServicio} className="p-4 border-t border-slate-200 bg-indigo-50/40 space-y-3">
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
                      Guardar
                    </button>
                  </div>
                </form>
              )}
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
