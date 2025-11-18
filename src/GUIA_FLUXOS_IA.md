# 📚 Guia Completo: Como Escrever Fluxos para a IA

## 🎯 Índice
1. [Conceitos Básicos](#conceitos-básicos)
2. [Os 4 Tipos de Nós](#os-4-tipos-de-nós)
3. [Sintaxe dos Marcadores](#sintaxe-dos-marcadores)
4. [Estrutura de Decisões](#estrutura-de-decisões)
5. [Indentação e Hierarquia](#indentação-e-hierarquia)
6. [Exemplos Práticos](#exemplos-práticos)
7. [Casos Especiais](#casos-especiais)
8. [Erros Comuns](#erros-comuns)
9. [Dicas Avançadas](#dicas-avançadas)
10. [Checklist Final](#checklist-final)

---

## 📖 Conceitos Básicos

### O que a IA faz?

A IA lê seu texto linha por linha e:
1. **Identifica** o tipo de cada nó através de marcadores `[Tipo]`
2. **Extrai** o texto descritivo de cada ação
3. **Detecta** ramificações de decisões (Sim/Não)
4. **Cria** conexões automáticas entre os nós
5. **Posiciona** os nós de forma organizada no canvas

### Princípios Fundamentais

✅ **Uma linha = Uma ação** (geralmente)
✅ **Marcadores claros** `[Tipo]` no início da linha
✅ **Decisões sempre têm ramos** Sim → e Não →
✅ **Ordem importa** - leia de cima para baixo
✅ **Simplicidade** - seja claro e direto

---

## 🧩 Os 4 Tipos de Nós

### 1️⃣ **[Início]** - Nó de Início
🟢 Marca o começo do fluxo

**Quando usar:**
- Primeira linha do seu fluxo
- Ponto de entrada do processo
- Estado inicial da aplicação

**Sintaxe:**
```
[Início]
[Início] Descrição do estado inicial
```

**Exemplos:**
```
✅ CORRETO:
[Início]
[Início] App aberto na tela principal
[Início] Usuário deslogado na Home

❌ ERRADO:
Início (sem colchetes)
[INICIO] (sem acento)
inicio do app (sem marcador)
```

---

### 2️⃣ **[Processo]** - Nó de Processo/Ação
🔵 Representa uma ação, tela ou etapa do fluxo

**Quando usar:**
- Ações do usuário
- Mudanças de tela
- Processamento de dados
- Chamadas de API
- Qualquer etapa que não seja decisão

**Sintaxe:**
```
[Processo] Descrição da ação
```

**Exemplos:**
```
✅ CORRETO:
[Processo] Usuário clica no botão "Entrar"
[Processo] Tela de login é exibida
[Processo] Sistema valida credenciais
[Processo] API retorna dados do usuário
[Processo] Dashboard é carregado

❌ ERRADO:
Processo: usuário clica (sem marcador)
[Process] Clica no botão (em inglês)
```

---

### 3️⃣ **[Decisão]** - Nó de Decisão/Condição
🟡 Representa uma pergunta ou verificação que tem 2+ resultados

**Quando usar:**
- Validações (sucesso/erro)
- Perguntas ao usuário
- Condições do sistema
- Verificações de estado
- Qualquer ponto que divide o fluxo

**Sintaxe:**
```
[Decisão] "Pergunta ou condição?"
Sim → O que acontece se verdadeiro
Não → O que acontece se falso
```

**Exemplos:**
```
✅ CORRETO:
[Decisão] "Login foi bem-sucedido?"
Sim → Avança para dashboard
Não → Mostra mensagem de erro

[Decisão] "Usuário confirmou a compra?"
Sim → Processa pagamento
Não → Retorna ao carrinho

❌ ERRADO:
[Decisão] Login validado (sem ser pergunta)
Sim (sem o símbolo →)
Se sim → avança (sem marcador [Decisão] antes)
```

---

### 4️⃣ **[Fim]** - Nó de Fim
🔴 Marca o término do fluxo

**Quando usar:**
- Última linha do fluxo
- Final de um processo completo
- Saída da aplicação

**Sintaxe:**
```
[Fim]
[Fim] Descrição do estado final
```

**Exemplos:**
```
✅ CORRETO:
[Fim]
[Fim] Processo concluído
[Fim] Usuário sai do app

❌ ERRADO:
Fim do processo (sem marcador)
[FIM] (maiúsculas não funcionam)
[End] (em inglês)
```

---

## 📝 Sintaxe dos Marcadores

### Formato Básico

```
[TipoDoNó] Texto descritivo da ação ou pergunta
```

### Regras Importantes

1. **Colchetes são obrigatórios**: `[Início]` ✅  `Início` ❌
2. **Acentuação correta**: `[Decisão]` ✅  `[Decisao]` ❌
3. **Primeira letra maiúscula**: `[Processo]` ✅  `[processo]` ❌
4. **Sem espaços dentro dos colchetes**: `[Processo]` ✅  `[ Processo ]` ❌

### Variações Aceitas

A IA é tolerante com algumas variações:

**Para [Decisão]:**
```
[Decisão] "Texto?"          ← Preferido (com aspas)
[Decisão] Texto?            ← Aceito (sem aspas)
[Decisão] Verificar se...   ← Aceito (sem ponto de interrogação)
```

**Texto adicional:**
```
[Processo] Ação principal
Detalhes adicionais na linha seguinte
Mais detalhes
```
⚠️ Apenas a primeira linha vira o nó. As seguintes são ignoradas.

---

## 🔀 Estrutura de Decisões

### Anatomia de uma Decisão

```
[Decisão] "Pergunta clara e objetiva?"
Sim → O que acontece se a resposta for SIM
Não → O que acontece se a resposta for NÃO

[Processo] Próxima ação (continua o fluxo)
```

### Componentes Obrigatórios

1. **Marcador [Decisão]**
2. **Pergunta ou condição** (de preferência com "?")
3. **Ramo Sim →** (logo após a decisão)
4. **Ramo Não →** (logo após o ramo Sim)

### Variações do Símbolo →

A IA aceita várias formas de seta:
```
Sim → Texto          ✅ Seta Unicode
Sim -> Texto         ✅ Hífen + maior que
Sim: Texto           ✅ Dois pontos
Sim - Texto          ✅ Hífen simples
```

### Exemplo Completo

```
[Decisão] "Usuário tem mais de 18 anos?"
Sim → Permite acesso completo ao sistema
Não → Exibe aviso de idade mínima

[Processo] Sistema registra tentativa de acesso
```

**Como a IA interpreta:**
```
        [Decisão?]
         /      \
      Sim       Não
       |         |
   [Permite]  [Aviso]
       |         |
       └────┬────┘
            |
      [Registra]
```

---

## 📐 Indentação e Hierarquia

### Por que usar indentação?

A indentação (espaços no início da linha) ajuda a organizar visualmente fluxos complexos, especialmente com decisões aninhadas.

### Como funciona

```
[Processo] Nível 0 (sem indentação)
  [Processo] Nível 1 (2 espaços)
    [Processo] Nível 2 (4 espaços)
```

### Exemplo Prático: Fluxo de Login

**Sem indentação (básico):**
```
[Início] App aberto
[Processo] Usuário insere email e senha
[Processo] Sistema valida credenciais
[Decisão] "Credenciais corretas?"
Sim → Carrega dados do usuário
Não → Mostra erro
[Fim]
```

**Com indentação (avançado):**
```
[Início] App aberto

[Processo] Usuário insere email e senha

[Decisão] "Campos preenchidos?"
Não → Mostra mensagem de campos obrigatórios
Sim → Continua

  [Processo] Sistema envia requisição ao servidor
  
  [Decisão] "Servidor respondeu?"
  Não → Mostra erro de conexão
  Sim → Valida resposta
  
    [Decisão] "Credenciais corretas?"
    Não → Mostra erro de login
    Sim → Autentica usuário
    
      [Processo] Carrega dados do perfil
      [Processo] Redireciona para dashboard

[Fim]
```

### Regras de Indentação

1. **Use 2 espaços** por nível (não tabs)
2. **Seja consistente** - mantenha o mesmo padrão
3. **Opcional mas recomendado** - ajuda na legibilidade
4. **A IA usa para ajustar posicionamento** - nós mais indentados ficam mais à direita

---

## 💡 Exemplos Práticos

### Exemplo 1: Fluxo Simples de Login

```
[Início] Tela de login exibida

[Processo] Usuário insere email e senha

[Processo] Usuário clica em "Entrar"

[Processo] Sistema valida credenciais

[Decisão] "Login bem-sucedido?"
Sim → Redireciona para dashboard
Não → Exibe mensagem de erro

[Processo] Dashboard é carregado

[Fim] Usuário autenticado
```

---

### Exemplo 2: Fluxo de Compra E-commerce

```
[Início] Usuário navega pela loja

[Processo] Usuário adiciona produto ao carrinho

[Decisão] "Quer continuar comprando?"
Sim → Retorna à lista de produtos
Não → Vai para carrinho

[Processo] Exibe resumo do carrinho

[Decisão] "Usuário confirma a compra?"
Não → Volta para a loja
Sim → Avança para pagamento

[Processo] Tela de pagamento é exibida

[Processo] Usuário preenche dados de pagamento

[Processo] Sistema processa pagamento

[Decisão] "Pagamento aprovado?"
Não → Exibe erro de pagamento
Sim → Confirma pedido

[Processo] Email de confirmação é enviado

[Processo] Tela de sucesso é exibida

[Fim] Compra finalizada
```

---

### Exemplo 3: Fluxo Complexo com Múltiplas Decisões

```
[Início] App LATAM aberto

[Decisão] "Usuário está logado?"
Não → Exibe opção de login
Sim → Mostra menu completo

[Processo] Usuário acessa aba "Comprar voos"

[Processo] Formulário de busca é exibido

[Processo] Usuário preenche origem e destino

[Processo] Usuário seleciona datas

[Decisão] "Formulário válido?"
Não → Mostra campos com erro
Sim → Busca voos disponíveis

[Processo] Sistema busca voos

[Decisão] "Encontrou voos?"
Não → Exibe mensagem "Nenhum voo encontrado"
Sim → Exibe lista de voos

[Processo] Usuário seleciona voo de ida

[Decisão] "É ida e volta?"
Sim → Mostra voos de volta
Não → Avança para pagamento

[Processo] Usuário seleciona voo de volta

[Processo] Tela de checkout é exibida

[Decisão] "Dados do passageiro preenchidos?"
Não → Solicita preenchimento
Sim → Processa pagamento

[Processo] Pagamento é processado

[Decisão] "Pagamento aprovado?"
Não → Mostra erro
Sim → Confirma reserva

[Processo] Email de confirmação enviado

[Fim] Compra concluída
```

---

### Exemplo 4: Fluxo de Cadastro com Validações

```
[Início] Tela de cadastro

[Processo] Usuário preenche nome completo

[Decisão] "Nome tem pelo menos 3 caracteres?"
Não → Mostra erro no campo
Sim → Continua

[Processo] Usuário preenche email

[Decisão] "Email é válido?"
Não → Mostra erro de formato
Sim → Continua

[Processo] Sistema verifica se email já existe

[Decisão] "Email já cadastrado?"
Sim → Sugere fazer login
Não → Continua cadastro

[Processo] Usuário cria senha

[Decisão] "Senha tem no mínimo 8 caracteres?"
Não → Mostra requisitos de senha
Sim → Continua

[Processo] Usuário confirma senha

[Decisão] "Senhas coincidem?"
Não → Mostra erro de confirmação
Sim → Finaliza cadastro

[Processo] Conta é criada

[Processo] Email de boas-vindas é enviado

[Processo] Usuário é automaticamente logado

[Fim] Cadastro concluído
```

---

## 🎲 Casos Especiais

### Caso 1: Múltiplos Fins

Se seu fluxo tem vários pontos de saída:

```
[Início] Processo inicia

[Decisão] "Continuar?"
Não → [Fim] Processo cancelado pelo usuário
Sim → Continua

[Processo] Ação A

[Decisão] "Sucesso?"
Não → [Fim] Processo encerrado com erro
Sim → Continua

[Processo] Ação final

[Fim] Processo concluído com sucesso
```

---

### Caso 2: Loops e Repetições

Para indicar que o fluxo retorna a um ponto anterior:

```
[Início] Sistema monitora sensores

[Processo] Lê temperatura do sensor

[Decisão] "Temperatura normal?"
Sim → Aguarda 5 segundos e volta a ler (LOOP)
Não → Dispara alerta

[Processo] Notifica administrador

[Processo] Ativa sistema de resfriamento

[Fim] Alerta processado
```

**Nota:** A IA criará conexões lineares. Para loops visuais, você precisará ajustar manualmente no canvas.

---

### Caso 3: Processos Paralelos

Para indicar ações simultâneas:

```
[Início] Pedido recebido

[Processo] Sistema processa pedido

[Processo] PARALELO A: Email de confirmação é enviado

[Processo] PARALELO B: Notificação push é disparada

[Processo] PARALELO C: Registro é salvo no banco de dados

[Processo] Todos os processos paralelos concluídos

[Fim] Pedido processado
```

---

### Caso 4: Texto Longo em Nós

Se a descrição for muito longa, a IA quebrará automaticamente:

```
[Processo] Sistema exibe formulário completo contendo campos de nome, email, telefone, endereço completo, CEP, cidade, estado e país

↓ A IA transforma em:

┌─────────────────────────────┐
│ Sistema exibe formulário    │
│ completo contendo campos    │
│ de nome, email, telefone... │
└─────────────────────────────┘
```

**Dica:** Para melhor controle, seja mais conciso:
```
[Processo] Exibe formulário de cadastro completo
```

---

### Caso 5: Comentários e Notas

Para adicionar notas que a IA deve ignorar:

```
[Início] App inicia

// Este é um comentário - será ignorado
// TODO: Adicionar autenticação biométrica

[Processo] Tela principal é carregada

[Fim]
```

**Nota:** Linhas iniciadas com `//`, `#`, ou que contenham "comentário", "nota", "TODO" são ignoradas.

---

## ❌ Erros Comuns

### ❌ Erro 1: Esquecer os colchetes

```
❌ ERRADO:
Início
Processo: Usuário faz login
Decisão: Login válido?

✅ CORRETO:
[Início]
[Processo] Usuário faz login
[Decisão] "Login válido?"
```

---

### ❌ Erro 2: Decisão sem ramos

```
❌ ERRADO:
[Decisão] "Email é válido?"
[Processo] Continua cadastro

✅ CORRETO:
[Decisão] "Email é válido?"
Sim → Continua cadastro
Não → Mostra erro de validação

[Processo] Continua cadastro
```

---

### ❌ Erro 3: Ordem invertida dos ramos

```
❌ ERRADO:
[Decisão] "Tem saldo?"
Não → Cancela compra
Sim → Processa pagamento

🤔 ACEITO (mas não ideal):
A IA processa, mas pode gerar layout confuso

✅ CORRETO:
[Decisão] "Tem saldo?"
Sim → Processa pagamento
Não → Cancela compra
```

**Dica:** Sempre coloque **Sim** antes de **Não** para melhor organização visual.

---

### ❌ Erro 4: Usar marcadores em inglês

```
❌ ERRADO:
[Start] App opens
[Process] User logs in
[Decision] "Valid?"
[End]

✅ CORRETO:
[Início] App abre
[Processo] Usuário faz login
[Decisão] "Válido?"
[Fim]
```

---

### ❌ Erro 5: Múltiplos processos em uma linha

```
❌ ERRADO:
[Processo] Usuário clica, sistema valida e mostra resultado

✅ CORRETO:
[Processo] Usuário clica no botão
[Processo] Sistema valida os dados
[Processo] Resultado é exibido
```

---

### ❌ Erro 6: Decisões sem pergunta clara

```
❌ ERRADO:
[Decisão] Validação de senha
Sim → OK
Não → Erro

✅ CORRETO:
[Decisão] "Senha atende aos requisitos?"
Sim → Continua cadastro
Não → Mostra requisitos obrigatórios
```

---

### ❌ Erro 7: Falta de [Início] ou [Fim]

```
❌ ERRADO:
[Processo] Ação 1
[Processo] Ação 2

✅ CORRETO:
[Início] App inicia
[Processo] Ação 1
[Processo] Ação 2
[Fim] Processo concluído
```

---

## 🚀 Dicas Avançadas

### Dica 1: Use Perguntas Diretas nas Decisões

```
🤔 OK:
[Decisão] Verificar se usuário está autenticado

✅ MELHOR:
[Decisão] "Usuário está autenticado?"
```

**Por quê?** Perguntas deixam claro o que está sendo verificado.

---

### Dica 2: Seja Específico nos Processos

```
🤔 VAGO:
[Processo] Carrega dados

✅ ESPECÍFICO:
[Processo] API retorna lista de produtos disponíveis
```

---

### Dica 3: Nomeie Estados Claramente

```
🤔 GENÉRICO:
[Início] App
[Fim]

✅ DESCRITIVO:
[Início] App aberto na tela de login (usuário deslogado)
[Fim] Usuário autenticado no dashboard
```

---

### Dica 4: Agrupe Processos Relacionados

```
🤔 FRAGMENTADO:
[Processo] Valida nome
[Processo] Valida email
[Processo] Valida telefone
[Processo] Valida CPF

✅ AGRUPADO:
[Processo] Sistema valida todos os campos do formulário

[Decisão] "Todos os campos são válidos?"
Sim → Continua
Não → Mostra erros específicos
```

---

### Dica 5: Use Contexto nas Descrições

```
🤔 SEM CONTEXTO:
[Processo] Usuário clica

✅ COM CONTEXTO:
[Processo] Usuário clica no botão "Finalizar Compra"
```

---

### Dica 6: Indique Ações Críticas

```
✅ BOM:
[Processo] ⚠️ CRÍTICO: Sistema debita valor do cartão

[Processo] 🔒 SEGURANÇA: Token de autenticação é gerado
```

---

### Dica 7: Numere Etapas Longas (Opcional)

```
[Início] Processo de onboarding

[Processo] ETAPA 1: Apresenta termos de uso

[Decisão] "Usuário aceita termos?"
Não → Cancela cadastro
Sim → Continua

[Processo] ETAPA 2: Coleta dados pessoais

[Processo] ETAPA 3: Verifica email

[Processo] ETAPA 4: Configura preferências

[Fim] Onboarding concluído
```

---

### Dica 8: Documente Timing

```
[Processo] Sistema aguarda 30 segundos para timeout

[Decisão] "Resposta recebida dentro do prazo?"
Sim → Processa resposta
Não → Cancela requisição por timeout
```

---

### Dica 9: Indique Responsáveis

```
[Processo] USUÁRIO: Preenche formulário

[Processo] SISTEMA: Valida dados

[Processo] API: Processa pagamento

[Processo] BACKEND: Salva no banco de dados
```

---

### Dica 10: Use Emojis para Clareza Visual (Opcional)

```
[Início] 🚀 App iniciado

[Processo] 👤 Usuário faz login

[Decisão] "✅ Credenciais válidas?"
Sim → 🎉 Acesso liberado
Não → ❌ Mostra erro

[Fim] 🏁 Processo concluído
```

---

## ✅ Checklist Final

Antes de enviar seu fluxo para a IA, verifique:

### Estrutura Básica
- [ ] Tem um `[Início]` no começo?
- [ ] Tem pelo menos um `[Fim]` no final?
- [ ] Todos os marcadores estão entre colchetes `[...]`?
- [ ] Todas as palavras-chave estão acentuadas corretamente?

### Decisões
- [ ] Cada `[Decisão]` tem uma pergunta clara?
- [ ] Cada `[Decisão]` tem um ramo `Sim →`?
- [ ] Cada `[Decisão]` tem um ramo `Não →`?
- [ ] Os ramos estão logo após a decisão?

### Processos
- [ ] Cada `[Processo]` descreve uma ação específica?
- [ ] As descrições são claras e objetivas?
- [ ] Não há múltiplas ações em um único processo?

### Formatação
- [ ] Não há linhas vazias desnecessárias entre nós conectados?
- [ ] A indentação está consistente (se usar)?
- [ ] Não há erros de digitação nos marcadores?

### Clareza
- [ ] O fluxo segue uma ordem lógica?
- [ ] Alguém que não conhece o processo conseguiria entender?
- [ ] Todos os caminhos possíveis estão cobertos?

---

## 📊 Exemplos de Validação

### ✅ Fluxo PERFEITO

```
[Início] Usuário abre app de delivery

[Processo] Tela inicial é carregada

[Decisão] "Usuário já fez login anteriormente?"
Sim → Carrega dados salvos
Não → Mostra opção de login/cadastro

[Processo] Lista de restaurantes é exibida

[Processo] Usuário seleciona um restaurante

[Processo] Menu do restaurante é carregado

[Processo] Usuário adiciona itens ao carrinho

[Decisão] "Usuário quer adicionar mais itens?"
Sim → Volta ao menu
Não → Vai para carrinho

[Processo] Resumo do pedido é exibido

[Decisão] "Usuário confirma o pedido?"
Não → Volta para o menu
Sim → Continua para pagamento

[Processo] Tela de pagamento é exibida

[Processo] Usuário seleciona forma de pagamento

[Processo] Sistema processa pagamento

[Decisão] "Pagamento aprovado?"
Não → Exibe erro e oferece tentar novamente
Sim → Confirma pedido

[Processo] Pedido é enviado ao restaurante

[Processo] Tela de acompanhamento é exibida

[Processo] Notificação: "Pedido confirmado pelo restaurante"

[Processo] Notificação: "Entregador a caminho"

[Processo] Notificação: "Pedido entregue"

[Fim] Pedido concluído com sucesso
```

**Por que é perfeito?**
✅ Início e Fim claros
✅ Decisões com perguntas objetivas
✅ Todos os ramos definidos (Sim/Não)
✅ Fluxo lógico e sequencial
✅ Processos específicos
✅ Contempla casos de sucesso e erro

---

### ⚠️ Fluxo COM PROBLEMAS (e como corrigir)

```
❌ PROBLEMÁTICO:

Usuário abre app                                    ← Falta [Início]

[Processo] Login                                    ← Muito vago

Decisão: válido?                                    ← Falta marcador e clareza
sim vai dashboard                                   ← Falta seta e marcador
nao mostra erro                                     ← Falta seta e acento

[Processo] mostra dashboard                         ← Sem estrutura clara

fim                                                 ← Falta marcador
```

**✅ VERSÃO CORRIGIDA:**

```
[Início] Usuário abre app

[Processo] Tela de login é exibida

[Processo] Usuário insere credenciais

[Processo] Sistema valida credenciais

[Decisão] "Credenciais são válidas?"
Sim → Carrega dados do usuário
Não → Exibe mensagem de erro

[Processo] Dashboard é exibido

[Fim] Usuário autenticado
```

---

## 🎓 Exercícios Práticos

### Exercício 1: Fluxo de Recuperação de Senha

**Sua tarefa:** Escreva um fluxo completo para recuperação de senha.

**Requisitos:**
- Usuário clica em "Esqueci minha senha"
- Sistema solicita email
- Verifica se email existe
- Envia email de recuperação
- Usuário clica no link do email
- Define nova senha
- Valida nova senha

<details>
<summary>💡 Ver Solução</summary>

```
[Início] Usuário na tela de login

[Processo] Usuário clica em "Esqueci minha senha"

[Processo] Tela de recuperação é exibida

[Processo] Usuário insere email cadastrado

[Processo] Sistema busca email no banco de dados

[Decisão] "Email existe no sistema?"
Não → Exibe mensagem "Email não encontrado"
Sim → Continua processo

[Processo] Sistema gera token de recuperação

[Processo] Email com link de recuperação é enviado

[Processo] Mensagem de sucesso é exibida

[Processo] Usuário abre email e clica no link

[Processo] Tela de nova senha é carregada

[Decisão] "Token ainda é válido?"
Não → Exibe "Link expirado. Solicite novo link"
Sim → Permite definir nova senha

[Processo] Usuário insere nova senha

[Processo] Usuário confirma nova senha

[Decisão] "Senhas coincidem?"
Não → Mostra erro de confirmação
Sim → Continua

[Decisão] "Senha atende requisitos mínimos?"
Não → Mostra requisitos obrigatórios
Sim → Salva nova senha

[Processo] Nova senha é salva no banco de dados

[Processo] Mensagem de sucesso é exibida

[Processo] Usuário é redirecionado para login

[Fim] Senha recuperada com sucesso
```
</details>

---

## 🎯 Conclusão

### Regras de Ouro

1. **Sempre use marcadores `[Tipo]`**
2. **Decisões sempre têm Sim → e Não →**
3. **Seja específico e claro**
4. **Siga a ordem lógica do processo**
5. **Comece com `[Início]` e termine com `[Fim]`**

### Fluxo de Trabalho Recomendado

1. **Rascunhe** o fluxo em texto simples
2. **Adicione** os marcadores `[Tipo]`
3. **Identifique** os pontos de decisão
4. **Adicione** os ramos Sim/Não
5. **Revise** usando o checklist
6. **Cole** na IA e veja o preview
7. **Ajuste** se necessário
8. **Aplique** ao canvas

---

## 📞 Suporte

**Dúvidas?**
- Use o botão 🤖 IA na toolbar
- Clique na aba "Exemplo LATAM" para ver um fluxo real
- Pressione F1 para ver todos os atalhos
- Consulte este guia sempre que precisar

**Lembre-se:**
> "Um bom fluxo é aquele que qualquer pessoa consegue entender, mesmo sem conhecer o sistema."

---

## 🎉 Agora você está pronto!

Comece com fluxos simples e vá aumentando a complexidade conforme ganha confiança.

**Boa sorte criando seus fluxogramas! 🚀✨**
