# Subscrip — Resumo e Features

## 1. Resumo do Projeto

O **Subscrip** e uma plataforma SaaS de gestao inteligente de financas pessoais e empresariais, focada em resolver o problema do "vazamento invisivel de dinheiro": usuarios que perdem o controle sobre multiplas assinaturas ativas e acabam pagando por servicos que nao utilizam.

Com a evolucao do produto, alem de assinaturas, a plataforma oferece **planejamento financeiro mensal completo** com entradas, saidas e saldo previsto.

### Valor Entregue

- Centralizacao de assinaturas em um unico painel
- Planejamento mensal com entradas, saidas e saldo previsto
- Previsao de gasto mensal e anual
- Alertas de proximas cobrancas
- Conversao de moedas para consolidacao financeira

---

## 2. Funcionalidades do Produto

### 2.1 Perfil do Usuario

- Avatar e dados pessoais (nome, email)
- Preferencias: moeda padrao, tema, idioma
- Configuracoes de notificacao: email e/ou push
- Gerenciamento de conta

### 2.2 Dashboard (Pagina Inicial)

- Cards financeiros:
  - Receitas planejadas do mes
  - Outras saidas planejadas
  - Assinaturas (estimativa mensal)
  - Total de saidas
  - Saldo previsto
- Cards de assinaturas:
  - Assinaturas ativas
  - Proxima fatura
- Grafico de gastos por categoria
- Lista de proximas faturas
- Acoes rapidas para criar assinatura e item mensal

### 2.3 Base de Assinaturas Populares

Estrutura de template:

| Campo | Descricao |
|---|---|
| `name` | Nome do servico |
| `logo` | URL do logo |
| `category` | Categoria padrao |
| `pricingUrl` | URL de precos |
| `cancelUrl` | URL de cancelamento |
| `defaultCurrency` | Moeda padrao |
| `billingCycles` | Ciclos disponiveis |

Categorias de templates no MVP:

- Entretenimento
- Infraestrutura/Dev
- Ferramentas/Produtividade
- Educacao
- Saude/Fitness

### 2.4 Pagina de Assinaturas

- Agrupamento por categoria
- Exibicao por item: nome, preco, moeda, ciclo, vencimento, status
- Acoes: editar, pausar/reativar, cancelar, configurar lembrete
- Filtros e ordenacao: categoria, status, preco, vencimento e busca

### 2.5 Sistema de Lembretes

- Canais: Email e Push Browser
- Configuracao por assinatura:
  - Ativo/inativo
  - Antecedencia
  - Canal
  - Horario preferido
- Configuracao global:
  - Padrao para novas assinaturas
  - Modo silencioso
  - Resumo semanal

### 2.6 Planejamento Financeiro Mensal

- Escopo mensal por `ano + mes + usuario`
- Entradas planejadas (a receber)
- Saidas planejadas com bucket
- Consolidacao mensal com origem manual e origem assinatura
- Regra de produto: assinatura permanece fonte oficial de cobranca; planejamento armazena linhas de orcamento e consolidacao mensal
