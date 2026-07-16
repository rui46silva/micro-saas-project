# ObraFácil (nome provisório)

> Micro-SaaS mobile-first para carpinteiros, canalizadores e pequenos empreiteiros
> gerirem **pedidos, orçamentos e clientes** a partir do telemóvel — sem saber nada
> de informática.

## O conceito numa frase

Uma app simples que permite a um profissional da construção civil gerir o seu
trabalho pelo telemóvel em 2-3 toques. **A simplicidade não é uma feature — é o
produto.**

O utilizador-alvo tem 45-60 anos, trabalha com as mãos, odeia burocracia e faz
tudo pelo WhatsApp. Se uma ação exigir mais de 2-3 toques, ele desiste.

## Nicho inicial

Começar por **um ofício** (ex.: carpintaria) e afinar o produto com esses
profissionais antes de alargar. Os itens de orçamento pré-carregados para
carpintaria são diferentes dos de canalização — essa especificidade é o que faz
o profissional sentir que a app "foi feita para ele".

## Roadmap

### Fase 1 — MVP (o mínimo pelo qual alguém paga)
Resolver a dor nº 1: **orçamentos e pedidos perdidos.**

1. **Gestão de pedidos/leads** — lista de pedidos com estados (novo, orçamentado,
   aceite, em curso, concluído). Entrada rápida: nome, contacto, descrição, fotos.
2. **Criação de orçamentos em minutos** — escolher itens (mão de obra, materiais),
   quantidades e preços → PDF profissional com o logótipo. IA sugere a estrutura a
   partir de texto ditado ("substituir 3 janelas de alumínio, colocar rodapé em 2 quartos").
3. **Envio direto por WhatsApp/email** — sem sistema de mensagens interno.
4. **Base de clientes** — o "caderninho" digital: histórico de trabalhos, orçamentos, contactos.
5. **Follow-up automático** — orçamento sem resposta há 5 dias? A app lembra ou
   envia mensagem ao cliente. **Este é o argumento de venda.**

### Fase 2 — Retenção (com 10-20 clientes pagantes)
6. Agenda de trabalhos (calendário visual + notificação ao cliente)
7. Faturação — **integrar** (InvoiceXpress, Moloni, Vendus), não construir (exige certificação AT)
8. Galeria de trabalhos (fotos antes/depois → portfólio)
9. Mini-página pública (cartão de visita digital que alimenta a lista de pedidos)

### Fase 3 — Expansão (ponte para o marketplace)
10. Sinalização de disponibilidade (a informação que falta no mercado)
11. Rede entre profissionais (reencaminhar trabalho recusado a um colega)
12. Relatórios simples (faturação do mês, taxa de aceitação, melhores clientes)

## Decisões-chave

| Tema | Decisão |
|------|---------|
| **Preço** | 19-29 €/mês, 14-30 dias grátis. Um único plano no início. |
| **Nicho** | Um ofício primeiro (carpintaria), depois alargar. |
| **Stack** | Next.js (PWA instalável no telemóvel) + Supabase/Firebase. Sem app stores no início. |
| **Onboarding** | Assistido: sentar 30 min com os primeiros 20 clientes. |

## Stack técnica (proposta)

- **Frontend:** Next.js (App Router) como PWA mobile-first
- **Backend / DB / Auth:** Supabase (Postgres + Auth + Storage)
- **PDFs:** geração server-side de orçamentos
- **IA:** Claude para estruturar orçamentos a partir de texto/voz
- **Integrações:** WhatsApp (deep links), email, e faturação (Fase 2)

## Como correr localmente

1. **Criar o projeto Supabase** (grátis) em [supabase.com](https://supabase.com)
   — escolher a região `eu-west` (Irlanda) ou `eu-central` (Frankfurt).
2. **Aplicar o schema:** copiar o conteúdo de
   `supabase/migrations/20260716000000_initial_schema.sql` para o SQL Editor
   do dashboard e executar (ou usar a CLI: `supabase db push`).
3. **Configurar variáveis:** copiar `.env.example` para `.env.local` e
   preencher com o URL e a anon key do projeto (Project Settings → API).
4. **Instalar e arrancar:**

   ```bash
   npm install
   npm run dev
   ```

5. Abrir `http://localhost:3000` — o login é por link mágico enviado por
   email (sem palavras-passe, de propósito: menos fricção para o utilizador).

## Estrutura

```
src/
  app/
    login/            # Entrada por link mágico (email)
    auth/confirm/     # Callback de verificação do link
    (app)/            # Área autenticada, com navegação inferior
      pedidos/        # Feature 1 — gestão de pedidos/leads
      orcamentos/     # Feature 2 — orçamentos em minutos
      clientes/       # Feature 4 — o "caderninho" digital
  components/         # Componentes partilhados (ex.: BottomNav)
  lib/supabase/       # Clientes Supabase (browser + server)
  proxy.ts            # Refresh de sessão + proteção de rotas
supabase/
  migrations/         # Schema SQL (tabelas, RLS, itens pré-carregados)
```

## Deploy (Vercel)

1. Em [vercel.com](https://vercel.com), **Add New → Project** e importar este
   repositório do GitHub.
2. Em **Settings → Environment Variables**, definir:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Se a app ainda vive na branch de desenvolvimento, definir a **Production
   Branch** em Settings → Git (ou fazer merge para `main`).
4. Deploy. Depois, no Supabase (**Authentication → URL Configuration**):
   - **Site URL:** `https://<projeto>.vercel.app`
   - **Redirect URLs:** adicionar `https://<projeto>.vercel.app/auth/confirm`
     (manter também a de `localhost` para desenvolvimento).

Cada `git push` passa a fazer deploy automático: a branch de produção vai
para o domínio principal e as outras branches geram previews.

## Estado

🚧 Esqueleto do MVP montado: PWA Next.js + Supabase (auth, schema com RLS,
itens de carpintaria pré-carregados). Próximo passo: feature 1 — entrada
rápida de pedidos.
