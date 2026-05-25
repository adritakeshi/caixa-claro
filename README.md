# CaixaClaro – Frontend React

> Plataforma SaaS para análise de lucro e margem por produto/serviço.

---

## 📁 Estrutura do projeto

```
profitguard/
├── index.html
├── package.json
├── vite.config.js
└── src/
    ├── main.jsx                    # Entry point
    ├── App.jsx                     # Rotas principais
    ├── index.css                   # Design tokens e estilos globais
    │
    ├── utils/
    │   └── calculations.js         # Motor de cálculo (lucro, margem, alertas)
    │
    ├── context/
    │   ├── AuthContext.jsx         # Autenticação (cadastro, login, sessão)
    │   └── DataContext.jsx         # Gerenciamento de produtos/serviços
    │
    ├── components/
    │   ├── AppLayout.jsx           # Layout com Sidebar + Outlet
    │   ├── Sidebar.jsx             # Navegação lateral
    │   ├── MetricCard.jsx          # Card de KPI reutilizável
    │   └── ProductForm.jsx         # Modal de cadastro/edição de produto
    │
    └── pages/
        ├── Login.jsx               # Página de login
        ├── Register.jsx            # Página de cadastro
        ├── Dashboard.jsx           # Painel principal com KPIs e gráficos
        ├── Produtos.jsx            # CRUD de produtos/serviços
        └── Simulador.jsx           # Simulador de cenários em tempo real
```

---

## 🚀 Como rodar localmente

### Pré-requisitos
- Node.js 18+ instalado
- npm ou pnpm

### Passos

```bash
# 1. Entre na pasta do projeto
cd profitguard

# 2. Instale as dependências
npm install

# 3. Rode em modo desenvolvimento
npm run dev

# 4. Acesse no navegador
# http://localhost:5173
```

### Build para produção

```bash
npm run build
# Os arquivos ficam em /dist — pronto para deploy na Vercel
```

---

## 🌐 Deploy na Vercel

1. Faça push para um repositório GitHub
2. Acesse [vercel.com](https://vercel.com) → **Add New Project**
3. Selecione o repositório
4. Framework: **Vite** (detectado automaticamente)
5. Clique em **Deploy**

---

## 🧮 Motor de Cálculo (`utils/calculations.js`)

Todas as fórmulas financeiras ficam centralizadas aqui:

| Função | Descrição |
|---|---|
| `calcComissao(preco, %)` | `preco × (% / 100)` |
| `calcLucro(preco, custo, %, outros)` | `preco − (custo + comissão + outros)` |
| `calcMargem(preco, lucro)` | `(lucro / preco) × 100` |
| `calcProduto(produto)` | Retorna todos os campos calculados |
| `calcMetricasGlobais(produtos)` | Agrega KPIs de todos os produtos |
| `statusMargem(margem)` | Classifica: Prejuízo / Baixa / Saudável / Alta |
| `gerarAlertas(produto)` | Gera alertas automáticos por produto |
| `formatBRL(valor)` | Formata como R$ 1.234,56 |
| `formatPct(valor)` | Formata como 23,5% |

---

## 🔐 Autenticação (`context/AuthContext.jsx`)

O sistema usa **localStorage** para simular autenticação com JWT.

> ⚠️ **Atenção:** Em produção, substitua por uma API real com JWT. Nunca armazene senhas em texto puro no localStorage.

| Função | Descrição |
|---|---|
| `register({ nome, email, password, empresa })` | Cadastra novo usuário |
| `login(email, password)` | Autentica e salva sessão |
| `logout()` | Remove sessão |
| `updateEmpresa(dados)` | Atualiza dados da empresa |

---

## 📦 Dependências

| Pacote | Versão | Uso |
|---|---|---|
| `react` | 18 | Framework principal |
| `react-dom` | 18 | Renderização DOM |
| `react-router-dom` | 6 | Roteamento SPA |
| `recharts` | 2 | Gráfico de barras no Dashboard |
| `lucide-react` | 0.363 | Ícones |
| `vite` | 5 | Bundler/dev server |

---

## 🎨 Design System

O projeto usa **CSS Modules** + variáveis globais CSS definidas em `src/index.css`.

### Cores principais

| Variável | Valor | Uso |
|---|---|---|
| `--green` | `#00e676` | Lucro positivo, alta margem, accent |
| `--red` | `#ff4757` | Prejuízo, alertas críticos |
| `--amber` | `#ffb020` | Margem baixa, avisos |
| `--blue` | `#4d9fff` | Faturamento, informações neutras |
| `--bg-deep` | `#080b12` | Fundo base da aplicação |

### Tipografia

| Variável | Fonte | Uso |
|---|---|---|
| `--font-display` | Syne | Títulos, logo, headers |
| `--font-body` | DM Sans | Corpo de texto, UI |
| `--font-mono` | JetBrains Mono | Valores numéricos |

---

## 📄 Páginas

### `/login` e `/cadastro`
- Formulários com validação inline
- Senha com toggle visível/oculto
- Redirecionamento automático se logado

### `/dashboard`
- KPIs: Faturamento, Lucro, Margem média, Total de produtos
- Alertas automáticos para itens com prejuízo ou margem baixa
- Gráfico de barras de margem por produto (Recharts)
- Ranking: maior margem vs menor margem

### `/produtos`
- Listagem com busca e ordenação por coluna
- Indicadores visuais de status (verde/amarelo/vermelho)
- Modal de cadastro e edição com preview em tempo real
- Confirmação antes de excluir

### `/simulador`
- Seleciona um produto base
- Controles deslizantes (sliders) para preço, custo e comissão
- Exibe impacto em tempo real: lucro, margem, variação em R$ e %
- Destaque visual para melhora/piora

---

## 🔄 Integração com Backend (próximos passos)

Para integrar com uma API Node.js + PostgreSQL, substitua as funções do `AuthContext.jsx` e `DataContext.jsx` por chamadas `fetch`:

```js
// Exemplo: login com API real
async function login(email, password) {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) throw new Error('Credenciais inválidas')
  const { token, user } = await res.json()
  localStorage.setItem('pg_token', token)
  setUser(user)
}
```

---

## 📋 MVP – Checklist

| Funcionalidade | Status |
|---|---|
| ✅ Cadastro de usuário | Completo |
| ✅ Login com sessão | Completo |
| ✅ Cadastro de produtos/serviços | Completo |
| ✅ Cálculo automático (lucro, margem, comissão) | Completo |
| ✅ Dashboard com KPIs | Completo |
| ✅ Alertas automáticos | Completo |
| ✅ Simulador de cenários | Completo |
| ⏳ Backend Node.js + PostgreSQL | Próxima fase |
| ⏳ Exportação PDF/CSV | Próxima fase |
| ⏳ Integração Stripe/Mercado Pago | Próxima fase |

---

*ProfitGuard – Proteja seu lucro com dados.*
