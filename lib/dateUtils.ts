// lib/dateUtils.ts

/**
 * Formata uma data no padrão brasileiro (DD/MM/YYYY)
 */
export function formatDateBR(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return dateString;
    }
  }
  
  /**
   * Converte uma data do formato brasileiro para o formato ISO
   */
  export function parseDateBR(dateString: string): string {
    try {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    } catch (error) {
      console.error('Erro ao converter data:', error);
      return '';
    }
  }