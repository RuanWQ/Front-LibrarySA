# Biblioteca App - Frontend

Um aplicativo de leitura e compartilhamento de livros construído com Next.js 15 e TypeScript.

## 🚀 Características

- ✅ Autenticação com JWT tokens
- ✅ Navegação entre livros
- ✅ Leitor de livros com paginação
- ✅ Perfis de usuário customizáveis
- ✅ Sistema de favoritos
- ✅ Acompanhamento de progresso de leitura
- ✅ Avaliações e comentários de livros

## 📋 Pré-requisitos

- Node.js 18.17 ou superior
- npm ou yarn
- Backend Django rodando em `http://localhost:8000`

## 🔧 Instalação

1. **Clone ou navegue até o diretório do projeto:**
   ```bash
   cd frontLibrary
   ```

2. **Instale as dependências:**
   ```bash
   npm install
   # ou
   yarn install
   ```

3. **Configure as variáveis de ambiente:**
   
   O arquivo `.env.local` já está configurado, mas você pode ajustá-lo conforme necessário:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000/api
   NEXT_PUBLIC_APP_NAME=Biblioteca App
   ```

4. **Inicie o servidor de desenvolvimento:**
   ```bash
   npm run dev
   # ou
   yarn dev
   ```

   O aplicativo estará disponível em `http://localhost:3000`

## 📁 Estrutura do Projeto

```
frontLibrary/
├── public/              # Arquivos públicos estáticos
├── src/
│   ├── app/            # Páginas e layouts (App Router)
│   │   ├── layout.tsx  # Layout raiz
│   │   ├── page.tsx    # Home page
│   │   ├── globals.css # Estilos globais
│   │   ├── login/      # Página de login
│   │   ├── register/   # Página de cadastro
│   │   ├── profile/    # Perfil do usuário
│   │   ├── books/      # Listagem de livros
│   │   ├── reader/     # Leitor de livros
│   │   ├── dashboard/  # Dashboard do usuário
│   │   └── favorites/  # Livros favoritos
│   ├── components/     # Componentes React reutilizáveis
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── BookCard.tsx
│   │   ├── ProfileCard.tsx
│   │   ├── DashboardCard.tsx
│   │   └── Reader.tsx
│   ├── services/       # Camada de serviços para API
│   │   ├── api.ts      # Cliente Axios configurado
│   │   ├── auth.ts     # Serviço de autenticação
│   │   ├── books.ts    # Serviço de livros
│   │   └── users.ts    # Serviço de usuários
│   ├── hooks/          # Custom React hooks
│   │   ├── useAuth.ts  # Hook para autenticação
│   │   └── useBooks.ts # Hook para livros
│   ├── types/          # Definições de tipos TypeScript
│   │   ├── book.ts     # Tipos de livro
│   │   ├── user.ts     # Tipos de usuário
│   │   └── review.ts   # Tipos de resenha
│   └── utils/          # Funções utilitárias
│       ├── formatDate.ts  # Formatação de datas
│       └── storage.ts     # Gerencimento de localStorage
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── next.config.js
├── postcss.config.js
└── .env.local
```

## 🛠️ Scripts Disponíveis

```bash
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start

# Verificar linting
npm run lint
```

## 🔐 Autenticação

O aplicativo usa JWT (JSON Web Tokens) para autenticação. Os tokens são armazenados em `localStorage` e inclusos automaticamente em todas as requisições.

### Endpoints de Autenticação:
- **Cadastro:** `POST /api/auth/register/`
- **Login:** `POST /api/token/`
- **Renovar Token:** `POST /api/token/refresh/`

## 📡 Integração com API

Todos os serviços utilizam a classe `APIClient` que:
- Gerencia automaticamente tokens JWT
- Intercepta respostas 401 (não autorizado)
- Configura headers padrão
- Trata erros consistentemente

### Exemplo de uso:
```typescript
import { booksService } from '@/services/books'

const books = await booksService.getBooks()
const book = await booksService.getBook(1)
await booksService.addToFavorites(1)
```

## 🎨 Styling

O projeto usa Tailwind CSS para estilização. Configurações customizadas:

```typescript
// tailwind.config.ts
{
  colors: {
    primary: '#3B82F6',    // Azul
    secondary: '#10B981',  // Verde
    accent: '#F59E0B',     // Âmbar
  }
}
```

## 🧪 Testing

Para testes (configuração futura):
```bash
npm run test
```

## 📝 Funcionalidades Implementadas

### ✅ Autenticação
- [x] Login / Cadastro
- [x] Logout
- [x] Verificação de sessão
- [x] Armazenamento de tokens

### ✅ Livros
- [x] Listagem de livros
- [x] Detalhes de livro
- [x] Adicionar/remover favoritos
- [x] Leitor de livros

### ✅ Usuários
- [x] Perfil do usuário
- [x] Dashboard
- [x] Histórico de leitura

### ⏳ Em Desenvolvimento
- [ ] Busca e filtros avançados
- [ ] Resenhas detalhadas
- [ ] Sistema de badges/achievements
- [ ] Recomendações personalizadas
- [ ] Compartilhamento social

## 🚀 Deploy

### Vercel (Recomendado)
```bash
npm install -g vercel
vercel
```

### Build Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY . .
RUN npm install
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🐛 Troubleshooting

### Problema: Erro 404 na API
**Solução:** Verifique se o backend Django está rodando em `http://localhost:8000`

### Problema: Tokens expirados
**Solução:** O aplicativo tenta renovar automaticamente. Se falhar, faça login novamente.

### Problema: Estilos não aparecem
**Solução:** Limpe cache: `npm run build` e `npm run dev`

## 📚 Documentação Adicional

- [Next.js Docs](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)
- [TypeScript](https://www.typescriptlang.org)
- [Axios](https://axios-http.com)

## 📄 Licença

MIT

## 👥 Contribuidores

- Ruan Almeida

---

**Nota:** Este é um projeto em desenvolvimento. Funcionalidades podem mudar.
