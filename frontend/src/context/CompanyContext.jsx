import React, { createContext, useContext, useState, useEffect } from 'react';

const CompanyContext = createContext();

export function CompanyProvider({ children }) {
  const [company, setCompany] = useState({
    razon_social: 'Corporación Industrial & Minera EcoSafe S.A.C.',
    ruc: '20601234567',
    nombre_comercial: 'EcoSafe SSOMA Solutions',
    rubro: 'Minería y Metalmecánica Pesada',
    direccion: 'Av. Las Begonias 441, Piso 12, San Isidro, Lima - Perú',
    telefono: '+51 (01) 456-7890',
    email: 'contacto@ecosafe.com.pe',
    sitio_web: 'https://www.ecosafe-ssoma.com',
    logo_url: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?w=150&auto=format&fit=crop&q=80',
    representante_legal: 'Ing. Roberto Carrión Morales',
    responsable_ssoma: 'Ing. Carlos Mendoza (Jefe SSOMA)',
    moneda_simbolo: 'S/.',
    moneda_codigo: 'PEN',
    separador_decimales: '.',
    separador_miles: ',',
    dias_meta_sin_accidentes: 180,
    limite_frecuencia_if: 2.00
  });

  const [loading, setLoading] = useState(true);

  const loadCompany = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/configuracion/empresa');
      const data = await res.json();
      if (data.success && data.data) {
        setCompany(data.data);
      }
    } catch (err) {
      console.warn('Error cargando configuración de la empresa:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCompany();
  }, []);

  const updateCompany = async (updatedFields) => {
    try {
      const res = await fetch('http://localhost:5000/api/configuracion/empresa', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields)
      });
      const data = await res.json();
      if (data.success && data.data) {
        setCompany(data.data);
        return { success: true, message: data.message };
      }
      return { success: false, message: data.message || 'Error al guardar.' };
    } catch (err) {
      return { success: false, message: 'Error de red al contactar servidor.' };
    }
  };

  // Formateador numérico genérico con separadores configurados
  const formatNumber = (value, decimals = 2) => {
    if (value === null || value === undefined || isNaN(value)) return '0';
    const num = parseFloat(value);
    const parts = num.toFixed(decimals).split('.');
    
    const sepMiles = company.separador_miles || ',';
    const sepDec = company.separador_decimales || '.';

    // Aplicar separador de miles
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, sepMiles);

    if (decimals > 0 && parts[1]) {
      return parts.join(sepDec);
    }
    return parts[0];
  };

  // Formateador de moneda con símbolo
  const formatMoney = (amount, decimals = 2) => {
    const symbol = company.moneda_simbolo || 'S/.';
    return `${symbol} ${formatNumber(amount, decimals)}`;
  };

  return (
    <CompanyContext.Provider value={{
      company,
      setCompany,
      loading,
      loadCompany,
      updateCompany,
      formatMoney,
      formatNumber
    }}>
      {children}
    </CompanyContext.Provider>
  );
}

export function useCompany() {
  const context = useContext(CompanyContext);
  if (!context) {
    throw new Error('useCompany debe usarse dentro de un CompanyProvider');
  }
  return context;
}
