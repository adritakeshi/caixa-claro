import { useState, useMemo } from 'react'
import { useSimulador } from '../context/SimuladorContext'
import { formatBRL, formatPct, statusMargem, calcProduto } from '../utils/calculations'
import {
  Plus, Trash2, Pencil, Shield, TrendingUp, TrendingDown,
  DollarSign, Wallet, BarChart2, RotateCcw, ChevronDown,
  ChevronUp, Check, X, AlertTriangle,
} from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  Cell, ReferenceLine, PieChart, Pie, Legend,
} from 'recharts'
import styles from './Simulador.module.css'

/* ─── Constantes ─────────────────────────────────────── */
const CATEGORIAS_CUSTO = [
  { value: 'fixo',      label: 'Custo fixo',  color: 'var(--amber)' },
  { value: 'variavel',  label: 'Variável',    color: 'var(--blue)'  },
  { value: 'estoque',   label: 'Estoque',     color: '#a78bfa'      },
  { value: 'pessoal',   label: 'Pessoal',     color: '#f472b6'      },
  { value: 'marketing', label: 'Marketing',   color: 'var(--green)' },
  { value: 'outro',     label: 'Outro',       color: 'var(--text-muted)' },
]
const RECORRENCIAS = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'anual',  label: 'Anual'  },
  { value: 'unico',  label: 'Único'  },
]
const catLabel = v => CATEGORIAS_CUSTO.find(c => c.value === v)?.label || v
const catColor = v => CATEGORIAS_CUSTO.find(c => c.value === v)?.color || 'var(--text-muted)'
const recLabel = v => RECORRENCIAS.find(r => r.value === v)?.label || v

/* ─── KPI Card ───────────────────────────────────────── */
function KpiCard({ label, value, sub, color, icon: Icon, delay = 0 }) {
  return (
    <div className={styles.kpiCard} style={{ '--kc': color, animationDelay: `${delay}ms` }}>
      <div className={styles.kpiHeader}>
        <span className={styles.kpiLabel}>{label}</span>
        {Icon && <Icon size={14} color={color} strokeWidth={2}/>}
      </div>
      <div className={styles.kpiValue} style={{ color }}>{value}</div>
      {sub && <div className={styles.kpiSub}>{sub}</div>}
    </div>
  )
}

/* ─── Receita Form ───────────────────────────────────── */
const REC_EMPTY = { nome: '', preco: '', custoDireto: '', comissao: '', outrosCustos: '' }

function ReceitaForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(
    initial
      ? { nome: initial.nome, preco: String(initial.preco), custoDireto: String(initial.custoDireto), comissao: String(initial.comissao), outrosCustos: String(initial.outrosCustos) }
      : REC_EMPTY
  )
  const [err, setErr] = useState('')

  const preview = calcProduto({ nome: f.nome || 'Produto', preco: f.preco, custoDireto: f.custoDireto, comissao: f.comissao, outrosCustos: f.outrosCustos })
  const st = statusMargem(preview.margem)

  function set(k, v) { setF(p => ({ ...p, [k]: v })); setErr('') }

  function submit(e) {
    e.preventDefault()
    if (!f.nome.trim())               return setErr('Nome é obrigatório.')
    if (!f.preco || +f.preco <= 0)   return setErr('Preço deve ser maior que zero.')
    onSave({ nome: f.nome.trim(), preco: +f.preco || 0, custoDireto: +f.custoDireto || 0, comissao: +f.comissao || 0, outrosCustos: +f.outrosCustos || 0 })
  }

  return (
    <div className={styles.formBox}>
      <form onSubmit={submit}>
        <div className={styles.formRow}>
          <div style={{ flex: 2 }}>
            <label>Nome do produto / serviço</label>
            <input value={f.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Consultoria mensal" autoFocus/>
          </div>
          <div>
            <label>Preço (R$)</label>
            <input type="number" step="0.01" min="0" value={f.preco} onChange={e => set('preco', e.target.value)} placeholder="0,00"/>
          </div>
        </div>
        <div className={styles.formRow}>
          <div>
            <label>Custo direto (R$)</label>
            <input type="number" step="0.01" min="0" value={f.custoDireto} onChange={e => set('custoDireto', e.target.value)} placeholder="0,00"/>
          </div>
          <div>
            <label>Comissão (%)</label>
            <input type="number" step="0.1" min="0" max="100" value={f.comissao} onChange={e => set('comissao', e.target.value)} placeholder="0"/>
          </div>
          <div>
            <label>Outros custos (R$)</label>
            <input type="number" step="0.01" min="0" value={f.outrosCustos} onChange={e => set('outrosCustos', e.target.value)} placeholder="0,00"/>
          </div>
        </div>

        {/* Preview */}
        <div className={styles.previewStrip}>
          <span>Lucro: <strong style={{ fontFamily: 'var(--font-mono)', color: preview.lucro >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatBRL(preview.lucro)}</strong></span>
          <span>Margem: <strong style={{ fontFamily: 'var(--font-mono)', color: st.color }}>{formatPct(preview.margem)}</strong></span>
          <span className="badge" style={{ background: `${st.color}15`, color: st.color, border: `1px solid ${st.color}35` }}>{st.label}</span>
        </div>

        {err && <p className={styles.formErr}>{err}</p>}
        <div className={styles.formActions}>
          <button type="button" className="btn btn-ghost" onClick={onCancel}><X size={13}/> Cancelar</button>
          <button type="submit"  className="btn btn-primary"><Check size={13}/> {initial ? 'Salvar' : 'Adicionar'}</button>
        </div>
      </form>
    </div>
  )
}

/* ─── Custo Form ─────────────────────────────────────── */
const CUSTO_EMPTY = { nome: '', valor: '', categoria: 'fixo', recorrencia: 'mensal' }

function CustoForm({ initial, onSave, onCancel }) {
  const [f, setF] = useState(initial
    ? { nome: initial.nome, valor: String(initial.valor), categoria: initial.categoria, recorrencia: initial.recorrencia }
    : CUSTO_EMPTY)
  const [err, setErr] = useState('')

  function set(k, v) { setF(p => ({ ...p, [k]: v })); setErr('') }

  function submit(e) {
    e.preventDefault()
    if (!f.nome.trim())         return setErr('Nome é obrigatório.')
    if (!f.valor || +f.valor <= 0) return setErr('Valor deve ser maior que zero.')
    onSave({ nome: f.nome.trim(), valor: +f.valor, categoria: f.categoria, recorrencia: f.recorrencia })
  }

  return (
    <div className={styles.formBox}>
      <form onSubmit={submit}>
        <div className={styles.formRow}>
          <div style={{ flex: 2 }}>
            <label>Nome do custo</label>
            <input value={f.nome} onChange={e => set('nome', e.target.value)} placeholder="Ex: Aluguel" autoFocus/>
          </div>
          <div>
            <label>Valor (R$)</label>
            <input type="number" step="0.01" min="0" value={f.valor} onChange={e => set('valor', e.target.value)} placeholder="0,00"/>
          </div>
        </div>
        <div className={styles.formRow}>
          <div>
            <label>Categoria</label>
            <select value={f.categoria} onChange={e => set('categoria', e.target.value)}>
              {CATEGORIAS_CUSTO.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </div>
          <div>
            <label>Recorrência</label>
            <select value={f.recorrencia} onChange={e => set('recorrencia', e.target.value)}>
              {RECORRENCIAS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
        </div>
        {err && <p className={styles.formErr}>{err}</p>}
        <div className={styles.formActions}>
          <button type="button" className="btn btn-ghost" onClick={onCancel}><X size={13}/> Cancelar</button>
          <button type="submit"  className="btn btn-primary"><Check size={13}/> {initial ? 'Salvar' : 'Adicionar'}</button>
        </div>
      </form>
    </div>
  )
}

/* ─── Tooltip Recharts ───────────────────────────────── */
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-light)', borderRadius: 6, padding: '8px 12px', fontSize: 12, color: 'var(--text-primary)' }}>
      {label && <p style={{ color: 'var(--text-muted)', marginBottom: 4 }}>{label}</p>}
      {payload.map(p => (
        <p key={p.name} style={{ color: p.color || 'var(--green)' }}>
          {p.name !== 'valor' ? `${p.name}: ` : ''}{formatBRL(Math.abs(p.value))}
        </p>
      ))}
    </div>
  )
}

/* ═════════════════════════════════════════════════════
   MAIN PAGE
═════════════════════════════════════════════════════ */
export default function Simulador() {
  const {
    receitas, receitasCalc, custos, fluxo,
    addReceita, updateReceita, removeReceita,
    addCusto,   updateCusto,   removeCusto,
    resetTudo,
  } = useSimulador()

  const [tabAtiva,    setTabAtiva]    = useState('receitas')  // receitas | custos
  const [showRecForm, setShowRecForm] = useState(false)
  const [editRec,     setEditRec]     = useState(null)
  const [showCusForm, setShowCusForm] = useState(false)
  const [editCus,     setEditCus]     = useState(null)
  const [confirmReset, setConfirmReset] = useState(false)

  /* ── Dados para gráficos ───────────────────────────── */
  const barData = useMemo(() => [
    { nome: 'Faturamento', valor: fluxo.faturamentoBruto,  fill: 'var(--blue)'  },
    { nome: 'Custo prod.', valor: fluxo.custoProdutos,     fill: 'var(--red)'   },
    { nome: 'Custo oper.', valor: fluxo.totalOperacional,  fill: 'var(--amber)' },
    { nome: 'Resultado',   valor: Math.abs(fluxo.resultadoLiquido),
      fill: fluxo.resultadoLiquido >= 0 ? 'var(--green)' : 'var(--red)' },
  ].filter(d => d.valor > 0), [fluxo])

  const pieData = useMemo(() => {
    const grupos = {}
    custos.forEach(c => {
      const v = c.recorrencia === 'anual' ? (parseFloat(c.valor)||0)/12 : (parseFloat(c.valor)||0)
      grupos[c.categoria] = (grupos[c.categoria] || 0) + v
    })
    return Object.entries(grupos).map(([cat, total]) => ({
      name: catLabel(cat), value: parseFloat(total.toFixed(2)), fill: catColor(cat),
    })).filter(d => d.value > 0)
  }, [custos])

  const recResultado = fluxo.resultadoLiquido >= 0

  /* ── Handlers ─────────────────────────────────────── */
  function saveRec(dados) {
    if (editRec) { updateReceita(editRec.id, dados); setEditRec(null) }
    else addReceita(dados)
    setShowRecForm(false)
  }
  function saveCus(dados) {
    if (editCus) { updateCusto(editCus.id, dados); setEditCus(null) }
    else addCusto(dados)
    setShowCusForm(false)
  }
  function openEditRec(r) { setEditRec(r); setShowRecForm(true) }
  function openEditCus(c) { setEditCus(c); setShowCusForm(true) }

  return (
    <div className={styles.app}>

      {/* ── Topbar ─────────────────────────────────── */}
      <header className={styles.topbar}>
        <div className={styles.topbarLogo}>
          <Shield size={16} color="var(--green)" strokeWidth={2.5}/>
          <span>Simulador de Fluxo de Caixa</span>
        </div>
        <div className={styles.topbarRight}>
          <span className="badge badge-green">Gratuito</span>
          <button
            className={`btn btn-ghost ${styles.resetBtn}`}
            onClick={() => setConfirmReset(true)}
            title="Limpar tudo"
          >
            <RotateCcw size={13}/> Limpar
          </button>
        </div>
      </header>

      <div className={styles.layout}>

        {/* ══════════════════════════════════════════
            PAINEL ESQUERDO — Inputs
        ══════════════════════════════════════════ */}
        <aside className={styles.inputPanel}>

          {/* Abas */}
          <div className={styles.tabs}>
            <button
              className={`${styles.tab} ${tabAtiva === 'receitas' ? styles.tabActive : ''}`}
              onClick={() => setTabAtiva('receitas')}
            >
              <TrendingUp size={14}/> Receitas
              {receitas.length > 0 && <span className={styles.tabCount}>{receitas.length}</span>}
            </button>
            <button
              className={`${styles.tab} ${tabAtiva === 'custos' ? styles.tabActive : ''}`}
              onClick={() => setTabAtiva('custos')}
            >
              <Wallet size={14}/> Custos
              {custos.length > 0 && <span className={styles.tabCount}>{custos.length}</span>}
            </button>
          </div>

          {/* ── Aba Receitas ─────────────────────── */}
          {tabAtiva === 'receitas' && (
            <div className={styles.tabContent}>
              <div className={styles.panelHeader}>
                <p className={styles.panelTitle}>Produtos / Serviços</p>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: 12, padding: '6px 12px' }}
                  onClick={() => { setEditRec(null); setShowRecForm(true) }}
                >
                  <Plus size={13}/> Adicionar
                </button>
              </div>

              {showRecForm && (
                <ReceitaForm
                  initial={editRec}
                  onSave={saveRec}
                  onCancel={() => { setShowRecForm(false); setEditRec(null) }}
                />
              )}

              {receitas.length === 0 && !showRecForm ? (
                <div className={styles.emptyPanel}>
                  <TrendingUp size={28}/>
                  <p>Nenhuma receita adicionada.<br/>Clique em "Adicionar" para começar.</p>
                </div>
              ) : (
                <div className={styles.itemList}>
                  {receitasCalc.map(r => {
                    const st = statusMargem(r.margem)
                    return (
                      <div key={r.id} className={styles.item}>
                        <div className={styles.itemBar} style={{ background: st.color }}/>
                        <div className={styles.itemBody}>
                          <div className={styles.itemTop}>
                            <span className={styles.itemNome}>{r.nome}</span>
                            <span
                              className="badge"
                              style={{ background: `${st.color}15`, color: st.color, border: `1px solid ${st.color}30` }}
                            >
                              {st.label}
                            </span>
                          </div>
                          <div className={styles.itemNums}>
                            <span>Preço <strong className="number-display" style={{ color: 'var(--blue)' }}>{formatBRL(r.preco)}</strong></span>
                            <span>Custo <strong className="number-display" style={{ color: 'var(--red)' }}>{formatBRL(r.custoTotal)}</strong></span>
                            <span>Lucro <strong className="number-display" style={{ color: r.lucro >= 0 ? 'var(--green)' : 'var(--red)' }}>{formatBRL(r.lucro)}</strong></span>
                            <span>Margem <strong className="number-display" style={{ color: st.color }}>{formatPct(r.margem)}</strong></span>
                          </div>
                        </div>
                        <div className={styles.itemActions}>
                          <button className={styles.iconBtn} onClick={() => openEditRec(r)} title="Editar"><Pencil size={12}/></button>
                          <button className={`${styles.iconBtn} ${styles.delBtn}`} onClick={() => removeReceita(r.id)} title="Remover"><Trash2 size={12}/></button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── Aba Custos ───────────────────────── */}
          {tabAtiva === 'custos' && (
            <div className={styles.tabContent}>
              <div className={styles.panelHeader}>
                <p className={styles.panelTitle}>Custos operacionais</p>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: 12, padding: '6px 12px' }}
                  onClick={() => { setEditCus(null); setShowCusForm(true) }}
                >
                  <Plus size={13}/> Adicionar
                </button>
              </div>

              {showCusForm && (
                <CustoForm
                  initial={editCus}
                  onSave={saveCus}
                  onCancel={() => { setShowCusForm(false); setEditCus(null) }}
                />
              )}

              {custos.length === 0 && !showCusForm ? (
                <div className={styles.emptyPanel}>
                  <Wallet size={28}/>
                  <p>Nenhum custo adicionado.<br/>Aluguel, salários, marketing...</p>
                </div>
              ) : (
                <div className={styles.itemList}>
                  {custos.map(c => (
                    <div key={c.id} className={styles.item}>
                      <div className={styles.itemBar} style={{ background: catColor(c.categoria) }}/>
                      <div className={styles.itemBody}>
                        <div className={styles.itemTop}>
                          <span className={styles.itemNome}>{c.nome}</span>
                          <span
                            className="badge"
                            style={{ background: `${catColor(c.categoria)}15`, color: catColor(c.categoria), border: `1px solid ${catColor(c.categoria)}30` }}
                          >
                            {catLabel(c.categoria)}
                          </span>
                        </div>
                        <div className={styles.itemNums}>
                          <span><strong className="number-display" style={{ color: 'var(--amber)' }}>{formatBRL(parseFloat(c.valor)||0)}</strong></span>
                          <span style={{ color: 'var(--text-muted)' }}>{recLabel(c.recorrencia)}</span>
                          {c.recorrencia === 'anual' && (
                            <span style={{ color: 'var(--text-muted)' }}>= {formatBRL((parseFloat(c.valor)||0)/12)}/mês</span>
                          )}
                        </div>
                      </div>
                      <div className={styles.itemActions}>
                        <button className={styles.iconBtn} onClick={() => openEditCus(c)} title="Editar"><Pencil size={12}/></button>
                        <button className={`${styles.iconBtn} ${styles.delBtn}`} onClick={() => removeCusto(c.id)} title="Remover"><Trash2 size={12}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </aside>

        {/* ══════════════════════════════════════════
            PAINEL DIREITO — Resultado
        ══════════════════════════════════════════ */}
        <main className={styles.resultPanel}>

          {/* KPIs */}
          <div className={styles.kpiGrid}>
            <KpiCard label="Faturamento bruto" value={formatBRL(fluxo.faturamentoBruto)}
              sub="soma de todas as receitas" color="var(--blue)" icon={DollarSign} delay={0}/>
            <KpiCard label="Custo dos produtos" value={formatBRL(fluxo.custoProdutos)}
              sub="direto + comissão + outros" color="var(--red)" icon={TrendingDown} delay={50}/>
            <KpiCard label="Custo operacional" value={formatBRL(fluxo.totalOperacional)}
              sub="fixo + variável + pessoal..." color="var(--amber)" icon={Wallet} delay={100}/>
            <KpiCard
              label="Resultado líquido"
              value={formatBRL(fluxo.resultadoLiquido)}
              sub={`margem líquida ${formatPct(fluxo.margemLiquida)}`}
              color={recResultado ? 'var(--green)' : 'var(--red)'}
              icon={recResultado ? TrendingUp : TrendingDown}
              delay={150}
            />
          </div>

          {/* Alerta de resultado negativo */}
          {!recResultado && (fluxo.faturamentoBruto > 0 || fluxo.totalOperacional > 0) && (
            <div className="alert-strip danger" style={{ marginBottom: 16 }}>
              <AlertTriangle size={14} style={{ flexShrink: 0 }}/>
              <span>
                Fluxo de caixa <strong>negativo em {formatBRL(Math.abs(fluxo.resultadoLiquido))}</strong>.
                Os custos superam as receitas. Revise os valores.
              </span>
            </div>
          )}

          {/* Equação do fluxo */}
          <div className={styles.equation}>
            <div className={styles.eqItem}>
              <span className={styles.eqLabel}>Faturamento</span>
              <span className={styles.eqVal} style={{ color: 'var(--blue)' }}>{formatBRL(fluxo.faturamentoBruto)}</span>
            </div>
            <span className={styles.eqOp}>−</span>
            <div className={styles.eqItem}>
              <span className={styles.eqLabel}>Custo prod.</span>
              <span className={styles.eqVal} style={{ color: 'var(--red)' }}>{formatBRL(fluxo.custoProdutos)}</span>
            </div>
            <span className={styles.eqOp}>−</span>
            <div className={styles.eqItem}>
              <span className={styles.eqLabel}>Custo oper.</span>
              <span className={styles.eqVal} style={{ color: 'var(--amber)' }}>{formatBRL(fluxo.totalOperacional)}</span>
            </div>
            <span className={styles.eqOp}>=</span>
            <div className={styles.eqItem}>
              <span className={styles.eqLabel}>Resultado</span>
              <span
                className={styles.eqVal}
                style={{ color: recResultado ? 'var(--green)' : 'var(--red)', fontSize: 18 }}
              >
                {formatBRL(fluxo.resultadoLiquido)}
              </span>
            </div>
          </div>

          {/* Gráficos */}
          {barData.length > 0 && (
            <div className={styles.chartsGrid}>

              {/* Barras — componentes do fluxo */}
              <div className="card">
                <p className="section-title">Composição do fluxo de caixa</p>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={barData} barSize={40}>
                    <XAxis dataKey="nome" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false}/>
                    <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false}
                      tickFormatter={v => `R$${(v/1000).toFixed(0)}k`}/>
                    <Tooltip content={<ChartTooltip/>}/>
                    <Bar dataKey="valor" radius={[4,4,0,0]}>
                      {barData.map((d, i) => <Cell key={i} fill={d.fill}/>)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Margem por produto */}
              {receitasCalc.length > 0 && (
                <div className="card">
                  <p className="section-title">Margem por receita (%)</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart
                      data={receitasCalc.slice(0,8).map(r => ({ nome: r.nome.length>13?r.nome.slice(0,13)+'…':r.nome, margem: parseFloat(r.margem.toFixed(1)) }))}
                      barSize={22} layout="vertical"
                    >
                      <XAxis type="number" tick={{ fill: 'var(--text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={v=>`${v}%`}/>
                      <YAxis type="category" dataKey="nome" tick={{ fill: 'var(--text-muted)', fontSize: 11 }} axisLine={false} tickLine={false} width={85}/>
                      <Tooltip formatter={v=>[`${v}%`,'Margem']} contentStyle={{ background:'var(--bg-elevated)', border:'1px solid var(--border-light)', borderRadius:6, fontSize:12, color:'var(--text-primary)' }}/>
                      <ReferenceLine x={20} stroke="var(--amber)" strokeDasharray="4 3" label={{ value:'20%', fill:'var(--amber)', fontSize:9 }}/>
                      <Bar dataKey="margem" radius={[0,4,4,0]}>
                        {receitasCalc.slice(0,8).map((r,i) => (
                          <Cell key={i} fill={r.margem<0?'var(--red)':r.margem<20?'var(--amber)':'var(--green)'}/>
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Pizza — distribuição de custos */}
              {pieData.length > 0 && (
                <div className="card">
                  <p className="section-title">Custos operacionais por categoria</p>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80}
                        paddingAngle={3} dataKey="value">
                        {pieData.map((d, i) => <Cell key={i} fill={d.fill} stroke="transparent"/>)}
                      </Pie>
                      <Tooltip formatter={v=>[formatBRL(v),'']} contentStyle={{ background:'var(--bg-elevated)', border:'1px solid var(--border-light)', borderRadius:6, fontSize:12, color:'var(--text-primary)' }}/>
                      <Legend iconType="circle" iconSize={8} formatter={v=><span style={{ color:'var(--text-secondary)', fontSize:11 }}>{v}</span>}/>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}

              {/* Tabela de receitas */}
              {receitasCalc.length > 0 && (
                <div className="card">
                  <p className="section-title">Detalhamento de receitas</p>
                  <div className={styles.tableWrap}>
                    <table className={styles.table}>
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Preço</th>
                          <th>Custo total</th>
                          <th>Lucro</th>
                          <th>Margem</th>
                        </tr>
                      </thead>
                      <tbody>
                        {receitasCalc.map(r => {
                          const st = statusMargem(r.margem)
                          return (
                            <tr key={r.id}>
                              <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{r.nome}</td>
                              <td className="number-display" style={{ color: 'var(--blue)' }}>{formatBRL(r.preco)}</td>
                              <td className="number-display" style={{ color: 'var(--red)' }}>{formatBRL(r.custoTotal)}</td>
                              <td className="number-display" style={{ color: r.lucro>=0?'var(--green)':'var(--red)' }}>{formatBRL(r.lucro)}</td>
                              <td>
                                <span style={{ fontFamily:'var(--font-mono)', fontSize:12, color:st.color }}>{formatPct(r.margem)}</span>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty state geral */}
          {receitas.length === 0 && custos.length === 0 && (
            <div className="card" style={{ textAlign: 'center', padding: '60px 20px' }}>
              <div className="empty-state">
                <BarChart2 size={44}/>
                <h3>Comece adicionando dados</h3>
                <p>
                  Cadastre seus produtos e serviços na aba <strong style={{ color: 'var(--text-secondary)' }}>Receitas</strong>,
                  depois adicione seus custos operacionais na aba <strong style={{ color: 'var(--text-secondary)' }}>Custos</strong>.
                  O resultado aparece aqui em tempo real.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modal de confirmação de reset */}
      {confirmReset && (
        <div className={styles.overlay} onClick={() => setConfirmReset(false)}>
          <div className={styles.confirmBox} onClick={e => e.stopPropagation()}>
            <h3>Limpar tudo?</h3>
            <p>Todas as receitas e custos serão removidos. Esta ação não pode ser desfeita.</p>
            <div className={styles.confirmActions}>
              <button className="btn btn-ghost" onClick={() => setConfirmReset(false)}>Cancelar</button>
              <button className="btn btn-danger" onClick={() => { resetTudo(); setConfirmReset(false) }}>
                <RotateCcw size={13}/> Limpar tudo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
