import { createContext, useContext, useState, useEffect, useMemo } from 'react'
import { calcProduto, calcFluxoCaixa, totalCustosMensal } from '../utils/calculations'

const KEY_RECEITAS = 'fc_receitas'
const KEY_CUSTOS   = 'fc_custos'

const SimuladorContext = createContext(null)

function load(key, fallback = []) {
  try { return JSON.parse(localStorage.getItem(key)) || fallback } catch { return fallback }
}
function save(key, val) { localStorage.setItem(key, JSON.stringify(val)) }

export function SimuladorProvider({ children }) {
  const [receitas, setReceitas] = useState(() => load(KEY_RECEITAS))
  const [custos,   setCustos]   = useState(() => load(KEY_CUSTOS))

  useEffect(() => { save(KEY_RECEITAS, receitas) }, [receitas])
  useEffect(() => { save(KEY_CUSTOS,   custos)   }, [custos])

  /* ── Receitas (equivalente a produtos) ──────────────── */
  function addReceita(dados) {
    const novo = { id: Date.now().toString(), ...dados }
    setReceitas(r => [...r, novo])
    return novo
  }
  function updateReceita(id, dados) {
    setReceitas(r => r.map(x => x.id === id ? { ...x, ...dados } : x))
  }
  function removeReceita(id) {
    setReceitas(r => r.filter(x => x.id !== id))
  }

  /* ── Custos operacionais ─────────────────────────────── */
  function addCusto(dados) {
    const novo = { id: Date.now().toString(), ...dados }
    setCustos(c => [...c, novo])
    return novo
  }
  function updateCusto(id, dados) {
    setCustos(c => c.map(x => x.id === id ? { ...x, ...dados } : x))
  }
  function removeCusto(id) {
    setCustos(c => c.filter(x => x.id !== id))
  }

  function resetTudo() {
    setReceitas([]); setCustos([])
  }

  /* ── Dados calculados ────────────────────────────────── */
  const receitasCalc = useMemo(() => receitas.map(calcProduto), [receitas])
  const fluxo        = useMemo(() => calcFluxoCaixa(receitasCalc, custos), [receitasCalc, custos])

  return (
    <SimuladorContext.Provider value={{
      receitas, receitasCalc, custos, fluxo,
      addReceita, updateReceita, removeReceita,
      addCusto,   updateCusto,   removeCusto,
      resetTudo,
    }}>
      {children}
    </SimuladorContext.Provider>
  )
}

export function useSimulador() {
  const ctx = useContext(SimuladorContext)
  if (!ctx) throw new Error('useSimulador fora do SimuladorProvider')
  return ctx
}
