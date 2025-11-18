# Fluxograma - Eldorado [TESTE]

This is a code bundle for Fluxograma - Eldorado [TESTE]. The original project is available at https://www.figma.com/design/anNhhbvYS9HEQL118YA4Qh/Fluxograma---Eldorado--TESTE-.

## Getting the project locally
1. **Baixe o código**  
   - Clique em **Code → Download ZIP** neste repositório ou execute `git clone <URL-do-repositório>` no terminal.  
   - Após o download, extraia o ZIP (se for o caso) e navegue até a pasta do projeto com `cd Fluxogramaeldoradoteste`.
2. **Instale o Node.js**  
   - Caso ainda não tenha, instale o Node.js (que já inclui o npm) em <https://nodejs.org>. Recomenda-se a versão LTS.

## Running the code
Run `npm i` to install the dependencies.
Run `npm run dev` to start the development server.

## Configurando a IA Gemini

Os recursos inteligentes (análise do fluxo, validações com IA, templates e exportação com documentação) utilizam a API do Google Gemini 2.5 Pro. Para habilitá-los localmente:

1. Crie um arquivo `.env` na raiz do projeto.
2. Adicione a variável `VITE_GEMINI_API_KEY=SEU_TOKEN_AQUI` com a chave gerada no [Google AI Studio](https://aistudio.google.com/).
3. Reinicie o servidor (`npm run dev`).

Sem a variável configurada, o aplicativo continua funcionando com respostas de fallback offline.
