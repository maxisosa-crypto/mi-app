import React, { useState } from 'react';

export const AjusteValores: React.FC = () => {
  const [montoBase, setMontoBase] = useState<string>('');
  const [porcentaje, setPorcentaje] = useState<string>('5.77');
  const [resultado, setResultado] = useState<number | null>(null);

  const calcularAjuste = (e: React.FormEvent) => {
    e.preventDefault();
    const base = parseFloat(montoBase) || 0;
    const porc = parseFloat(porcentaje) || 0;
    
    // Cálculo: Base + Porcentaje
    const montoFinal = base * (1 + porc / 100);
    setResultado(montoFinal);
  };

  return (
    <div style={{
      backgroundColor: '#f8f9fa',
      border: '1px solid #e9ecef',
      borderRadius: '8px',
      padding: '20px',
      marginTop: '20px',
      fontFamily: 'sans-serif'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Ajuste de Valores (%)</h3>
      
      <form onSubmit={calcularAjuste}>
        <div style={{ marginBottom: '12px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Monto Base ($):
          </label>
          <input
            type="number"
            step="any"
            placeholder="Ej: 100000"
            value={montoBase}
            onChange={(e) => setMontoBase(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
            Porcentaje de Ajuste (%):
          </label>
          <input
            type="number"
            step="any"
            placeholder="Ej: 5.77"
            value={porcentaje}
            onChange={(e) => setPorcentaje(e.target.value)}
            style={{
              width: '100%',
              maxWidth: '300px',
              padding: '8px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxSizing: 'border-box'
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            padding: '10px 16px',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Calcular Ajuste
        </button>
      </form>

      {resultado !== null && (
        <div style={{ marginTop: '15px', fontSize: '1.1em', fontWeight: 'bold', color: '#28a745' }}>
          Monto Final Ajustado: ${resultado.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      )}
    </div>
  );
};
