/**
 * FluxoCaixa – Motor de Cálculo
 */

/* ─── Produto ─────────────────────────────────────────── */
export function calcProduto(p) {
  const preco     = parseFloat(p.preco)        || 0
  const custo     = parseFloat(p.custoDireto)  || 0
  const comPct    = parseFloat(p.comissao)     || 0
  const outros    = parseFloat(p.outrosCustos) || 0
  const comissao  = preco * (comPct / 100)
  const custoTotal= custo + comissao + outros
  const lucro     = preco - custoTotal
  const margem    = preco > 0 ? (lucro / preco) * 100 : 0
  return { ...p, comissao: comPct, valorComissao: comissao, custoTotal, lucro, margem }
}

export function statusMargem(m) {
  if (m < 0)  return { label:'Prejuízo',     color:'var(--red)'   }
  if (m < 20) return { label:'Margem baixa', color:'var(--amber)' }
  if (m < 40) return { label:'Saudável',     color:'var(--blue)'  }
  return           { label:'Alta margem',  color:'var(--green)' }
}

/* ─── Custos operacionais ────────────────────────────── */
export function custoMensalEquivalente(c) {
  const v = parseFloat(c.valor) || 0
  if (c.recorrencia === 'anual') return v / 12
  return v
}

export function totalCustosMensal(custos) {
  return (custos || []).reduce((s, c) => s + custoMensalEquivalente(c), 0)
}

/* ─── Fluxo de Caixa ─────────────────────────────────── */
export function calcFluxoCaixa(produtos, custos) {
  const prods           = (produtos || []).map(p => typeof p.lucro !== 'undefined' ? p : calcProduto(p))
  const faturamentoBruto= prods.reduce((s,p) => s + (parseFloat(p.preco)||0), 0)
  const custoProdutos   = prods.reduce((s,p) => s + (p.custoTotal||0), 0)
  const lucroProdutos   = prods.reduce((s,p) => s + (p.lucro||0), 0)
  const totalOperacional= totalCustosMensal(custos)
  const resultadoLiquido= lucroProdutos - totalOperacional
  const margemLiquida   = faturamentoBruto > 0 ? (resultadoLiquido / faturamentoBruto) * 100 : 0
  return { faturamentoBruto, custoProdutos, lucroProdutos, totalOperacional, resultadoLiquido, margemLiquida }
}

/* ─── Formatação ─────────────────────────────────────── */
export function formatBRL(v) {
  return new Intl.NumberFormat('pt-BR', { style:'currency', currency:'BRL', minimumFractionDigits:2 }).format(v)
}
export function formatPct(v) { return `${(+v).toFixed(1)}%` }
