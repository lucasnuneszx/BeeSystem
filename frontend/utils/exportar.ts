import * as XLSX from 'xlsx';

export const exportarExcel = (dados: any[], nomeArquivo: string) => {
  const wb = XLSX.utils.book_new();
  
  const ws = XLSX.utils.json_to_sheet(dados);

  XLSX.utils.book_append_sheet(wb, ws, "Relatório Geral");

  XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
};

/** Exporta o dashboard em abas: resumo, vendas e alertas de validade. */
export const exportarRelatorioDashboard = (resumo: any, vendas: any[], alertas: any[]) => {
    const wb = XLSX.utils.book_new();
    
    const wsResumo = XLSX.utils.json_to_sheet([resumo]);
    XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo Executivo");
    
    const wsVendas = XLSX.utils.json_to_sheet(vendas);
    XLSX.utils.book_append_sheet(wb, wsVendas, "Vendas Setoriais");
    
    const wsAlertas = XLSX.utils.json_to_sheet(alertas);
    XLSX.utils.book_append_sheet(wb, wsAlertas, "Alertas Críticos");
    
    XLSX.writeFile(wb, `RELATORIO_BEESYSTEM_${new Date().toISOString().split('T')[0]}.xlsx`);
};
