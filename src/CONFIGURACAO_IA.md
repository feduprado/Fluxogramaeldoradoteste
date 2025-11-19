# 🤖 Configuração de IA - Fluxogram Builder

## 🎯 Visão Geral

O Fluxogram Builder suporta múltiplos provedores de IA para gerar fluxogramas automaticamente:

- **🟢 Mock Provider** - Sempre disponível (modo demo offline)
- **🔵 Google Gemini** - Recomendado (gratuito com limites generosos)
- **🟠 OpenAI ChatGPT** - Opcional (pago)
- **🟣 DeepSeek** - Opcional (pago)

## ⚡ Início Rápido (Modo Demo)

**O sistema funciona IMEDIATAMENTE sem configuração!**

Sem nenhuma chave API, o Mock Provider oferece templates prontos:
- ✅ Login/Autenticação
- ✅ Processo de Compra
- ✅ Cadastro de Usuário
- ✅ Fluxo de Aprovação
- ✅ Template Genérico

**Experimente agora:**
1. Abra o modal de IA no aplicativo
2. Selecione "Demo (Offline)"
3. Digite: "processo de login" ou "fluxo de compra"

## 🚀 Configurar Google Gemini (Recomendado)

### Por que Gemini?
- ✅ **Gratuito** - Até 1500 requisições/dia
- ✅ **Sem cartão** - Não precisa cadastrar cartão de crédito
- ✅ **Rápido** - Configuração em 2 minutos
- ✅ **Poderoso** - Modelo Gemini 2.0 Flash

### Passo a Passo:

**1. Obter chave API (2 minutos):**
```
1. Acesse: https://aistudio.google.com/app/apikey
2. Faça login com sua conta Google
3. Clique em "Get API Key"
4. Clique em "Create API Key"
5. Copie a chave gerada
```

**2. Configurar no projeto:**
```bash
# Na raiz do projeto, crie o arquivo .env
cp .env.example .env

# Edite o arquivo .env e adicione sua chave:
# VITE_GEMINI_API_KEY=SUA_CHAVE_AQUI
```

**3. Reiniciar o servidor:**
```bash
# Pare o servidor (Ctrl+C) e reinicie
npm run dev
```

**4. Pronto! 🎉**
- Abra o modal de IA
- Selecione "Google Gemini"
- Gere fluxogramas ilimitados!

## 📊 Comparação de Provedores

| Provedor | Custo | Qualidade | Velocidade | Configuração |
|----------|-------|-----------|------------|--------------|
| **Mock** | Grátis | ⭐⭐⭐ | ⚡⚡⚡ | Nenhuma |
| **Gemini** | Grátis* | ⭐⭐⭐⭐⭐ | ⚡⚡⚡ | 2 minutos |
| **ChatGPT** | Pago | ⭐⭐⭐⭐⭐ | ⚡⚡ | 5 minutos |
| **DeepSeek** | Pago | ⭐⭐⭐⭐ | ⚡⚡ | 5 minutos |

*Gemini: Grátis até 1500 requisições/dia

## 🔧 Configuração Avançada

### OpenAI ChatGPT

```bash
# 1. Obtenha chave em: https://platform.openai.com/api-keys
# 2. Adicione no .env:
VITE_OPENAI_API_KEY=sk-...

# Custo estimado: ~$0.002 por fluxograma (modelo GPT-4)
```

### DeepSeek

```bash
# 1. Obtenha chave em: https://platform.deepseek.com/api-keys
# 2. Adicione no .env:
VITE_DEEPSEEK_API_KEY=...

# Custo estimado: ~$0.001 por fluxograma
```

## 🐛 Solução de Problemas

### "API key not valid"
```bash
# Verifique se:
1. A chave foi copiada corretamente (sem espaços)
2. O arquivo se chama .env (não .env.example)
3. A variável tem o prefixo VITE_
4. Você reiniciou o servidor após adicionar a chave
```

### "Nenhum provedor disponível"
```bash
# Solução:
1. Verifique o console do navegador (F12)
2. Procure por logs: "✅ Provider carregado"
3. Se nenhum aparecer, use o Mock Provider (sempre funciona)
```

### Mock Provider não aparece
```bash
# O Mock Provider SEMPRE deve estar disponível
# Se não aparecer, verifique:
1. Console do navegador por erros
2. Reinicie o servidor
3. Limpe o cache do navegador (Ctrl+Shift+R)
```

## 📝 Exemplos de Uso

### Modo Demo (Mock Provider)

**Prompts otimizados:**
```
✅ "processo de login"
✅ "fluxo de compra"
✅ "cadastro de usuário"
✅ "aprovação de solicitação"
```

### Com IA Real (Gemini/ChatGPT/DeepSeek)

**Prompts detalhados:**
```
✅ "Sistema de autenticação com 2FA e recuperação de senha"
✅ "E-commerce: adicionar ao carrinho, checkout e pagamento"
✅ "Onboarding de usuário com verificação de email"
✅ "Fluxo de aprovação hierárquica com 3 níveis"
```

## 🎨 Recursos da IA

Todos os provedores geram fluxogramas com:

- ✅ **Layout Horizontal** - Otimizado para leitura
- ✅ **Containers** - Agrupamento visual de processos
- ✅ **Decisões** - Com ramos Sim/Não
- ✅ **Hooks Descritivos** - Textos nas conexões
- ✅ **Cores Automáticas** - Containers coloridos

## 💡 Dicas

1. **Use o Mock primeiro** - Teste sem configurar nada
2. **Gemini é suficiente** - Para 99% dos casos
3. **Prompts claros** - Descreva o processo em português
4. **Seja específico** - Quanto mais detalhes, melhor o resultado
5. **Experimente exemplos** - Use os prompts sugeridos no modal

## 🆘 Suporte

Problemas? Verifique:
1. Console do navegador (F12) para logs detalhados
2. Arquivo `.env` está configurado corretamente
3. Servidor foi reiniciado após mudanças
4. Firewall não está bloqueando APIs externas

---

**Pronto para começar! 🚀**

Abra o modal de IA e experimente o Mock Provider agora mesmo, ou configure o Gemini em 2 minutos para resultados ainda melhores!
