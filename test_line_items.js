const fullText = "Original RECIBO DE REMUNERAÇÕES - JULHO DE 2026 (01/07/2026 a 31/07/2026) Data do Recibo: 24/07/2026 Entidade Engexpor - Consultores de Engenharia, S.A. NIF 501411968 NISS 20006296804 Nome Gonçalo António Martins Durão de Matos Nº 383 Morada Rua Francisco Rodrigues Lobo N12 RC Agualva, Agualva Departamentos NIF Vencimento Base Acumulado Incidência IRS Categorias Profissionais Produção-PT-Coord . PGO 224873105 1 350,00 7 091,82 Trabalhadores não cobertos por IRCT Função NISS Valor Hora Acumulado Incidências SS Seguradora: Zurich Engenheiro Civil 12051197887 8,31 13 967,28 009856799 Remunerações Dias/Horas Valor Unitário Valor Global Vencimento Base 1 350,00 1 350,00 Cartão/Vale Refeição 22 DIA(S) 14,00 308,00 Isenção de Horário de Trabalho 337,50 337,50 Seguro de Saude 14,25 14,25 Desconto Incidências Valor IRS 13,14% 882,69 116,00 Segurança Social 11,0% 1 765,38 194,19 Ausência Férias 1 DIA(S) De 06/07/2026 Até 06/07/2026 Férias 4 DIA(S) De 07/07/2026 Até 10/07/2026 Total Ilíquido Total Descontos Total a Receber 1 995,50 310,19 1 685,31";

function getRemuneracoes(text) {
    // Look for text between "Remunerações Dias/Horas Valor Unitário Valor Global" and "Desconto"
    const startMarker = "Remunerações Dias/Horas Valor Unitário Valor Global";
    const endMarker = "Desconto";
    const startIndex = text.indexOf(startMarker) + startMarker.length;
    const endIndex = text.indexOf(endMarker);
    const section = text.substring(startIndex, endIndex);
    
    console.log("Remunerações section:", section);
    // ... logic to parse individual lines ...
}

getRemuneracoes(fullText);
