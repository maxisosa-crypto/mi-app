import React, { useState, useMemo, ChangeEvent } from 'react';

export interface ItemArancel {
  id: string;
  valor: number;
  coseguro: number;
}

export interface Convenio {
  id: string;
  nombre: string;
  count: number;
  active: boolean;
  pct: number;
  items: ItemArancel[];
}

const CONVENIOS_INICIALES: Convenio[] = [
  {
    id: 'BIOQUIMICOS',
    nombre: 'Bioquímicos',
    count: 185,
    active: true,
    pct: 5.77,
    items: [
      { id: '301001', valor: 12400.00, coseguro: 2480.00 },
      { id: '301002', valor: 15000.00, coseguro: 3000.00 },
      { id: '301005', valor: 8900.00, coseguro: 1780.00 },
    ],
  },
  {
    id: 'CMSL',
    nombre: 'Círculo Médico San Luis (CMSL)',
    count: 1420,
    active: false,
    pct: 0.0,
    items: [
      { id: '101001', valor: 18500.00, coseguro: 3700.00 },
      { id: '101002', valor: 22000.00, coseguro: 4400.00 },
    ],
  },
  {
    id: 'UQ',
    nombre: 'Unidad Quirúrgica (UQ)',
    count: 210,
    active: false,
    pct: 0.0,
    items: [{ id: '201001', valor: 38000.00, coseguro: 7600.00 }],
  },
  {
    id: 'UGS',
    nombre: 'Gastos Sanatoriales (UGS)',
    count: 320,
    active: false,
    pct: 0.0,
    items: [{ id: '401001', valor: 45000.00, coseguro: 9000.00 }],
  },
  {
    id: 'ANESTESIA',
    nombre: 'Anestesia',
    count: 95,
    active: false,
    pct: 0.0,
    items: [{ id: '501001', valor: 52000.00, coseguro: 10400.00 }],
  },
  {
    id: 'IMAGENES',
    nombre: 'Diagnóstico por Imagen',
    count: 140,
    active: false,
    pct: 0.0,
    items: [{ id: '601001', valor: 28000.00, coseguro: 5600.00 }],
  },
  {
    id: 'DIALISIS',
    nombre: 'Diálisis',
    count: 18,
    active: false,
    pct: 0.0,
    items: [{ id: '701001', valor: 115000.00, coseguro: 23000.00 }],
  },
];

export const ActualizacionAranceles: React.FC = () => {
  const [convenios, setConvenios] = useState<Convenio[]>(CONVENIOS_INICIALES);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const toggleConvenio = (id: string, active: boolean) => {
    setConvenios((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active } : c))
    );
  };

  const updatePct = (id: string, pct: number) => {
    setConvenios((prev) =>
      prev.map((c) => (c.id === id ? { ...c, pct: isNaN(pct) ? 0 : pct } : c))
    );
  };

  const toggleSelectAll = (checked: boolean) => {
    setConvenios((prev) => prev.map((c) => ({ ...c, active: checked })));
  };

  const csvRows = useMemo(() => {
    const rows = ['ID;Valor;coseguro'];
    convenios
      .filter((c) => c.active)
      .forEach((c) => {
        const factor = 1 + c.pct / 100;
        c.items.forEach((item) => {
          const nuevoValor = (item.valor * factor).toFixed(2);
          const nuevoCoseguro = (item.coseguro * factor).toFixed(2);
          rows.push(`${item.id};${nuevoValor};${nuevoCoseguro}`);
        });
      });
    return rows;
  }, [convenios]);

  const activeConvenios = useMemo(
    () => convenios.filter((c) => c.active),
    [convenios]
  );

  const totalImpacted = useMemo(
    () => activeConvenios.reduce((acc, c) => acc + c.count, 0),
    [activeConvenios]
  );

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const descargarCSV = () => {
    if (csvRows.length <= 1) {
      alert('Por favor, seleccione al menos un convenio para actualizar.');
      return;
    }

    const csvContent = '\uFEFF' + csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'MODELODEACTUALIZACIONVALORES.CSV');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h2 style={styles.title}>Módulo: Actualización Masiva de Aranceles</h2>
        <span style={styles.subtitle}>DOSEP Gestión | Operación Aislada</span>
      </header>

      {/* Paso 1: Subida de archivo Nomenclador */}
      <section style={styles.card}>
        <h3 style={styles.cardTitle}>1. Archivo Base (Nomenclador)</h3>
        <label style={styles.fileLabel}>
          <input
            type="file"
            accept=".xlsx, .csv"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
          <span>
            {selectedFile
              ? `📄 Archivo cargado: ${selectedFile.name}`
              : '📂 Cargar Nomenclador Base (.xlsx) — Opcional'}
          </span>
        </label>
        <small style={styles.helpText}>
          Si no carga ningún archivo, el sistema usará la base de aranceles vigentes[cite: 1].
        </small>
      </section>

      {/* Paso 2: Selección por Convenio */}
      <section style={styles.card}>
        <h3 style={styles.cardTitle}>
          2. Selección de Convenios e Incremento Porcentual (%)
        </h3>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                <input
                  type="checkbox"
                  onChange={(e) => toggleSelectAll(e.target.checked)}
                />
              </th>
              <th style={styles.th}>Convenio</th>
              <th style={styles.th}>IDs Asociados</th>
              <th style={styles.th}>Aumento (%)</th>
              <th style={styles.th}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {convenios.map((c) => (
              <tr key={c.id} style={styles.tr}>
                <td style={styles.td}>
                  <input
                    type="checkbox"
                    checked={c.active}
                    onChange={(e) => toggleConvenio(c.id, e.target.checked)}
                  />
                </td>
                <td style={styles.td}>
                  <strong>{c.nombre}</strong>
                </td>
                <td style={styles.td}>
                  <span style={styles.badge}>{c.count} IDs</span>
                </td>
                <td style={styles.td}>
                  <input
                    type="number"
                    step="0.01"
                    disabled={!c.active}
                    value={c.pct}
                    onChange={(e) =>
                      updatePct(c.id, parseFloat(e.target.value))
                    }
                    style={styles.inputPct}
                  />{' '}
                  %
                </td>
                <td style={styles.td}>
                  {c.active ? (
                    <span style={styles.badgeSuccess}>+{c.pct}%</span>
                  ) : (
                    <span style={styles.badge}>Sin Cambios</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Paso 3: Exportación CSV */}
      <section style={styles.card}>
        <h3 style={styles.cardTitle}>3. Previsualización y Generación de CSV</h3>

        <div style={styles.summaryGrid}>
          <div style={styles.summaryBox}>
            <small style={styles.summaryLabel}>Total Prestaciones</small>
            <strong style={styles.summaryValue}>{totalImpacted}</strong>
          </div>
          <div style={styles.summaryBox}>
            <small style={styles.summaryLabel}>Convenios Seleccionados</small>
            <strong style={styles.summaryValue}>
              {activeConvenios.length}
            </strong>
          </div>
          <div style={styles.summaryBox}>
            <small style={styles.summaryLabel}>Nombre de Salida</small>
            <strong style={{ ...styles.summaryValue, fontSize: '0.95rem' }}>
              MODELODEACTUALIZACIONVALORES.CSV
            </strong>
          </div>
        </div>

        <pre style={styles.previewCode}>{csvRows.join('\n')}</pre>

        <div style={{ textAlign: 'right', marginTop: '1.25rem' }}>
          <button style={styles.btnSuccess} onClick={descargarCSV}>
            ⬇ DESCARGAR MODELODEACTUALIZACIONVALORES.CSV
          </button>
        </div>
      </section>
    </div>
  );
};

// Estilos integrados para garantizar independencia visual sin requerir CSS externo
const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '1.5rem',
    maxWidth: '1100px',
    margin: '0 auto',
    fontFamily: 'system-ui, -apple-system, sans-serif',
  },
  header: {
    marginBottom: '1.5rem',
    borderBottom: '2px solid #0f4c81',
    paddingBottom: '0.5rem',
  },
  title: {
    margin: 0,
    color: '#0f4c81',
    fontSize: '1.4rem',
  },
  subtitle: {
    color: '#64748b',
    fontSize: '0.85rem',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    border: '1px solid #cbd5e1',
    padding: '1.25rem',
    marginBottom: '1.25rem',
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  cardTitle: {
    margin: '0 0 1rem 0',
    fontSize: '1.05rem',
    color: '#0f4c81',
  },
  fileLabel: {
    display: 'block',
    padding: '1rem',
    border: '2px dashed #94a3b8',
    borderRadius: '6px',
    textAlign: 'center',
    cursor: 'pointer',
    backgroundColor: '#f8fafc',
    color: '#334155',
    fontWeight: 500,
  },
  helpText: {
    display: 'block',
    marginTop: '0.5rem',
    color: '#64748b',
    fontSize: '0.8rem',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    textAlign: 'left',
    padding: '0.6rem 0.8rem',
    borderBottom: '2px solid #e2e8f0',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    color: '#64748b',
    backgroundColor: '#f8fafc',
  },
  td: {
    padding: '0.6rem 0.8rem',
    borderBottom: '1px solid #e2e8f0',
    fontSize: '0.9rem',
  },
  tr: {
    transition: 'background-color 0.15s',
  },
  inputPct: {
    width: '80px',
    padding: '0.3rem 0.5rem',
    borderRadius: '4px',
    border: '1px solid #cbd5e1',
    textAlign: 'right',
  },
  badge: {
    display: 'inline-block',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: '#f1f5f9',
    color: '#475569',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  badgeSuccess: {
    display: 'inline-block',
    padding: '0.2rem 0.5rem',
    borderRadius: '4px',
    backgroundColor: '#dcfce7',
    color: '#15803d',
    fontSize: '0.75rem',
    fontWeight: 600,
  },
  summaryGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '1rem',
    marginBottom: '1rem',
  },
  summaryBox: {
    backgroundColor: '#f8fafc',
    border: '1px solid #e2e8f0',
    padding: '0.8rem',
    borderRadius: '6px',
  },
  summaryLabel: {
    display: 'block',
    color: '#64748b',
    fontSize: '0.75rem',
  },
  summaryValue: {
    fontSize: '1.3rem',
    color: '#0f4c81',
  },
  previewCode: {
    backgroundColor: '#0f172a',
    color: '#f8fafc',
    padding: '0.8rem',
    borderRadius: '6px',
    fontFamily: 'monospace',
    fontSize: '0.8rem',
    maxHeight: '160px',
    overflowY: 'auto',
    margin: 0,
  },
  btnSuccess: {
    backgroundColor: '#22c55e',
    color: '#ffffff',
    border: 'none',
    padding: '0.7rem 1.4rem',
    borderRadius: '6px',
    fontWeight: 600,
    fontSize: '0.95rem',
    cursor: 'pointer',
  },
};

export default ActualizacionAranceles;
