# 🤖 Configuração de IA - Fluxogram Builder

Este guia mostra como configurar as APIs de IA para gerar fluxogramas automaticamente.

## 🎯 Provedores Disponíveis

O Fluxogram Builder suporta múltiplos provedores de IA:

### ⚡ Google Gemini 2.5 Pro (RECOMENDADO)
- ✅ **GRATUITO** (com limites generosos)
- ✅ Modelo mais recente e poderoso
- ✅ Ótimo para fluxogramas complexos
- ✅ Configuração super fácil

### 🤖 ChatGPT 4 (OpenAI)
- ⚠️ **PAGO** (requer créditos)
- ✅ Excelente qualidade
- ✅ Muito confiável

### 🔍 DeepSeek
- ✅ **GRATUITO/PAGO** (depende do plano)
- ✅ Alternativa interessante

### ⚙️ Demo (Offline)
- ✅ Sempre disponível
- ℹ️ Não requer chaves de API
- ℹ️ 5 templates prontos

---

## 📋 Passo a Passo - Gemini 2.5 Pro (Recomendado)

### 1️⃣ Obter a Chave da API

1. Acesse: **https://aistudio.google.com/app/apikey**
2. Faça login com sua conta Google
3. Clique em **"Create API Key"**
4. Selecione ou crie um projeto
5. Copie a chave gerada (começa com `AIza...`)

### 2️⃣ Configurar no Projeto

1. **Copie o arquivo de exemplo:**
   ```bash
   cp .env.example .env
   ```

2. **Edite o arquivo `.env` e cole sua chave:**
   ```env
   VITE_GEMINI_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

3. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

### 3️⃣ Testar

1. Abra o Fluxogram Builder
2. Clique no botão **✨ AI** na toolbar
3. Selecione **"⚡ Gemini 2.5 Pro"** como provedor
4. Digite uma descrição e clique em **"Gerar Fluxograma"**

**Pronto!** 🎉 A IA está funcionando!

---

## 📋 Passo a Passo - ChatGPT 4

### 1️⃣ Obter a Chave da API

1. Acesse: **https://platform.openai.com/api-keys**
2. Faça login ou crie uma conta
3. Clique em **"Create new secret key"**
4. Dê um nome (ex: "Fluxogram Builder")
5. Copie a chave (começa com `sk-...`)
6. ⚠️ **ATENÇÃO:** OpenAI é pago, adicione créditos em https://platform.openai.com/account/billing

### 2️⃣ Configurar no Projeto

1. **Edite o arquivo `.env`:**
   ```env
   VITE_OPENAI_API_KEY=sk-XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
   ```

2. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

### 3️⃣ Testar

1. Abra o Fluxogram Builder
2. Selecione **"🤖 ChatGPT 4"** como provedor
3. Gere um fluxograma

---

## 🔍 Limites das APIs

### Google Gemini (Gratuito)
- **60 requisições por minuto**
- **1.500 requisições por dia**
- Ideal para uso pessoal e protótipos

### ChatGPT 4 (Pago)
- Depende dos créditos adicionados
- Aproximadamente **$0.03** por 1K tokens (entrada)
- Aproximadamente **$0.06** por 1K tokens (saída)

---

## ❓ Solução de Problemas

### Problema: "Nenhum provedor disponível"
**Solução:**
1. Verifique se o arquivo `.env` existe na raiz do projeto
2. Verifique se as chaves estão corretas
3. Reinicie o servidor com `npm run dev`

### Problema: "Erro na API Gemini: 400"
**Solução:**
- Chave inválida ou expirada
- Gere uma nova chave em https://aistudio.google.com/app/apikey

### Problema: "Erro na API OpenAI: 401"
**Solução:**
- Chave inválida ou sem créditos
- Verifique em https://platform.openai.com/account/api-keys

### Problema: Não consigo selecionar o provedor
**Solução:**
1. Abra o console do navegador (F12)
2. Veja se há logs de erro
3. Verifique se os provedores foram carregados com `🔍 Provedores disponíveis:`

---

## 🎯 Qual provedor usar?

| Caso de Uso | Provedor Recomendado |
|------------|---------------------|
| **Uso pessoal/teste** | ⚡ Gemini 2.5 Pro (grátis) |
| **Produção com budget** | 🤖 ChatGPT 4 (pago) |
| **Sem chaves de API** | ⚙️ Demo (offline) |
| **Experimentação** | 🔍 DeepSeek |

---

## 💡 Dicas para Melhores Resultados

1. **Seja específico:** "Sistema de login com 2FA" em vez de "login"
2. **Mencione containers:** "Agrupe o pagamento em um container"
3. **Use exemplos prontos:** Clique na aba "📋 Exemplos Prontos"
4. **Teste diferentes provedores:** Cada IA tem seu estilo

---

## 🔒 Segurança

- ⚠️ **NUNCA** compartilhe suas chaves de API
- ⚠️ **NUNCA** commit o arquivo `.env` no Git
- ✅ O arquivo `.env` já está no `.gitignore`
- ✅ As chaves são usadas apenas no navegador (client-side)

---

## 📚 Documentação das APIs

- **Gemini:** https://ai.google.dev/gemini-api/docs
- **OpenAI:** https://platform.openai.com/docs/api-reference
- **DeepSeek:** https://platform.deepseek.com/docs

---

**Precisa de ajuda?** Abra uma issue no GitHub! 🚀
