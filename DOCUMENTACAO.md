# ProfitGuard – Documentação Frontend

## Visão Geral

O ProfitGuard é uma plataforma SaaS de análise financeira desenvolvida em React. O frontend é 100% funcional e usa `localStorage` para persistência de dados (simulando um backend), pronto para ser conectado a uma API REST real.

---

## Estrutura de Pastas

```
profitguard/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx              # Ponto de entrada
    ├── App.jsx               # Roteamento principal
    ├── index.css             # Design tokens + estilos globais
    │
    ├── context/
    │   ├── AuthContext.jsx   # Autenticação (login, cadastro, logout)
    │   └── DataContext.jsx   # CRUD de produtos + cálculos reativos
    │
    ├── utils/
    │   └── calculations.js   # Motor de cálculo financeiro
    │
    ├── components/
    │   ├── AppLayout.jsx     # Layout com sidebar
    │   ├── Sidebar.jsx       # Navegação lateral
    │   ├── ProtectedRoute.jsx# Guard de rota autenticada
    │   ├── MetricCard.jsx    # Card de KPI
    │   └── ProductForm.jsx   # Modal de criação/edição de produto
    │
    └── pages/
        ├── Login.jsx         # Tela de login
        ├── Register.jsx      # Tela de cadastro
        ├── Dashboard.jsx     # Painel principal
        ├── Produtos.jsx      # Lista de produtos com CRUD
        └── Simulador.jsx     # Simulador de cenários
```

---

## Como rodar localmente

### Pré-requisitos
- Node.js 18+
- npm 9+

### Instalação e execução

```bash
# 1. Entrar na pasta do projeto
cd profitguard

# 2. Instalar dependências
npm install

# 3. Rodar em modo desenvolvimento
npm run dev

# 4. Acessar no navegador
# http://localhost:5173
```

### Build para produção

```bash
npm run build
# Saída em: dist/
```

### Deploy na Vercel

```bash
# Com Vercel CLI
npm i -g vercel
vercel

# Ou conecte o repositório Git diretamente em vercel.com
```

---

## Dependências

| Pacote | Versão | Uso |
|--------|--------|-----|
| react | 18.x | Framework principal |
| react-dom | 18.x | Renderização DOM |
| react-router-dom | 6.x | Roteamento SPA |
| recharts | 2.x | Gráfico de margem por produto |
| lucide-react | 0.363 | Ícones SVG |
| vite | 5.x | Build tool + dev server |

---

## Motor de Cálculo (`src/utils/calculations.js`)

Todas as fórmulas financeiras estão centralizadas neste arquivo.

### Fórmulas implementadas

```
comissão_valor = preço × (% comissão / 100)
custo_total    = custo_direto + comissão_valor + outros_custos
lucro          = preço − custo_total
margem (%)     = lucro / preço × 100
```

### Funções exportadas

| Função | Descrição |
|--------|-----------|
| `calcComissao(preco, pct)` | Valor monetário da comissão |
| `calcLucro(preco, custo, comissao, outros)` | Lucro do produto |
| `calcMargem(preco, lucro)` | Margem percentual |
| `calcProduto(produto)` | Retorna todos os campos calculados |
| `statusMargem(margem)` | Classifica: Prejuízo / Baixa / Saudável / Alta |
| `calcMetricasGlobais(produtos)` | Agrega KPIs do dashboard |
| `gerarAlertas(produto)` | Alertas automáticos por produto |
| `formatBRL(value)` | Formata como R$ (BRL) |
| `formatPct(value)` | Formata como percentual |

---

## Contextos React

### `AuthContext`
Gerencia a sessão do usuário. Os dados são persistidos no `localStorage` com a chave `pg_user` (sessão) e `pg_users` (lista de usuários).

**Métodos disponíveis:**
- `login(email, password)` — Autentica o usuário
- `register({ nome, email, password, empresa })` — Cria nova conta
- `logout()` — Encerra a sessão
- `updateEmpresa(dados)` — Atualiza dados da empresa

### `DataContext`
Gerencia produtos/serviços e expõe os dados calculados. Os dados são isolados por usuário via chave `pg_produtos_{userId}`.

**Valores expostos:**
- `produtos` — Lista bruta do localStorage
- `produtosCalculados` — Lista com `lucro`, `margem`, `custoTotal`, `valorComissao`
- `metricas` — Objeto com `faturamentoTotal`, `lucroTotal`, `margemMedia`, `totalProdutos`

**Métodos disponíveis:**
- `addProduto(dados)` — Adiciona produto
- `updateProduto(id, dados)` — Atualiza produto
- `removeProduto(id)` — Remove produto

---

## Páginas

### `/login` — Login
- Formulário de e-mail + senha com toggle de visibilidade
- Redireciona para `/dashboard` após autenticação
- Link para cadastro

### `/cadastro` — Cadastro
- Campos: nome, e-mail, senha, empresa (opcional)
- Validação: e-mail único, senha mínimo 6 caracteres

### `/dashboard` — Dashboard Principal
- KPIs: Faturamento, Lucro total, Margem média, Total de produtos
- Alertas automáticos para itens com margem baixa ou prejuízo
- Gráfico de barras: margem por produto (cores por faixa)
- Ranking: maiores e menores margens

### `/produtos` — Produtos & Serviços
- Tabela com todos os itens cadastrados
- Colunas: Nome, Preço, Custo total, Lucro, Margem, Status
- Ordenação clicável por coluna
- Busca por nome
- Ações: Editar (modal) e Excluir (confirmação)
- Modal de criação/edição com **preview em tempo real** do cálculo

### `/simulador` — Simulador de Cenários
- Seleção de produto existente
- Sliders + inputs numéricos para: Preço, Custo direto, Comissão %, Outros custos
- Comparativo Original vs Simulado em tempo real
- Impacto calculado: variação de lucro e margem

---

## Design System

O design usa variáveis CSS globais definidas em `src/index.css`:

### Cores principais
```css
--green:   #00e676  /* Lucro positivo / alta margem */
--red:     #ff4757  /* Prejuízo / alerta crítico */
--amber:   #ffb020  /* Margem baixa / atenção */
--blue:    #4d9fff  /* Informação / faturamento */
```

### Tipografia
- **Display / Títulos:** Syne (Google Fonts)
- **Corpo / Interface:** DM Sans (Google Fonts)
- **Números / Código:** JetBrains Mono (Google Fonts)

### Tema
Dark mode como padrão, fundo `#080b12` com camadas de `#0d1117` e `#131920`.

---

## Integração com Backend (produção)

Para conectar a uma API REST, substitua as operações de `localStorage` nas seguintes localizações:

| Arquivo | O que substituir |
|---------|-----------------|
| `AuthContext.jsx` | `login()`, `register()` → chamadas POST para `/api/auth/login` e `/api/auth/register` |
| `DataContext.jsx` | `addProduto()`, `updateProduto()`, `removeProduto()` → chamadas GET/POST/PUT/DELETE para `/api/produtos` |

O padrão de autenticação sugerido na especificação é **JWT**. Armazene o token retornado pela API no `localStorage` e envie-o no header `Authorization: Bearer <token>` em todas as requisições autenticadas.

---

## Checklist MVP

- [x] Cadastro de usuário (nome, email, senha, empresa)
- [x] Login com email e senha
- [x] Sessão persistida (mock JWT via localStorage)
- [x] Cadastro de produtos/serviços com todos os campos
- [x] Cálculo automático em tempo real (lucro, margem, comissão)
- [x] Dashboard com KPIs, gráfico e rankings
- [x] Alertas automáticos (margem baixa, prejuízo)
- [x] Simulador de cenários com sliders
- [x] Sistema de rotas protegidas
- [x] Dados isolados por usuário
- [x] Design responsivo

---

## Próximos passos sugeridos

1. **Backend Node.js + PostgreSQL** — Substituir localStorage por API real
2. **Relatórios PDF/CSV** — Exportação via `jsPDF` ou endpoint de backend
3. **Pagamentos** — Integração com Stripe ou Mercado Pago para assinatura
4. **Segmento de empresa** — Campo adicional no perfil
5. **Histórico** — Registrar variações de preço/custo ao longo do tempo
