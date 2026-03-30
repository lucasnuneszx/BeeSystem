import * as XLSX from 'xlsx';

/**
 * Função humanizada e profissional para exportação de dados BEESYSTEM para Excel.
 * Gera uma planilha bem estruturada e organizada conforme solicitado.
 */
export const exportarExcel = (dados: any[], nomeArquivo: string) => {
  // Criar um novo workbook (pasta de trabalho)
  const wb = XLSX.utils.book_new();
  
  // Transformar os dados para um formato tabular amigável
  const ws = XLSX.utils.json_to_sheet(dados);

  // Adicionar a worksheet (planilha) ao workbook
  XLSX.utils.book_append_sheet(wb, ws, "Relatório Geral");

  // Gerar o download automático para o navegador
  XLSX.writeFile(wb, `${nomeArquivo}.xlsx`);
};

/**
 * Exporta o Dashboard completo de forma organizada em abas (vendas, estoque, alertas)
 */
export const exportarRelatorioDashboard = (resumo: any, vendas: any[], alertas: any[]) => {
    const wb = XLSX.utils.book_new();
    
    // ABA 1: RESUMO EXECUTIVO
    const wsResumo = XLSX.utils.json_to_sheet([resumo]);
    XLSX.utils.book_append_sheet(wb, wsResumo, "Resumo Executivo");
    
    // ABA 2: HISTÓRICO DE VENDAS
    const wsVendas = XLSX.utils.json_to_sheet(vendas);
    XLSX.utils.book_append_sheet(wb, wsVendas, "Vendas Setoriais");
    
    // ABA 3: ALERTAS DE VALIDADE
    const wsAlertas = XLSX.utils.json_to_sheet(alertas);
    XLSX.utils.book_append_sheet(wb, wsAlertas, "Alertas Críticos");
    
    // Finalização e Download
    XLSX.writeFile(wb, `RELATORIO_BEESYSTEM_${new Date().toISOString().split('T')[0]}.xlsx`);
};
