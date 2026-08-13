# 📋 Análise de Funcionalidades - Migração Firebase → Banco Local

**Projeto**: SaquaInfo Nativo  
**Data**: 2026-08-13  
**Objetivo**: Migração do banco de dados da nuvem (Firebase) para um banco local  

---

## 📊 Resumo Executivo

| Status | Quantidade | % |
|--------|-----------|---|
| ✅ MANTER | 31 funcionalidades | 62% |
| 🔄 REFAZER | 14 funcionalidades | 28% |
| ✨ CRIAR | 5 funcionalidades | 10% |
| **TOTAL** | **50+ funcionalidades** | **100%** |

---

## ✅ MANTER (Sem Alterações - Banco Local Transparente)

Funcionalidades que funcionarão normalmente com banco local, pois a lógica de negócio não muda:

### 🔐 Autenticação & Conta
- [x] Login com email/senha (será local, sem Firebase Auth)
- [x] Registro de novos usuários com validação de senha
- [x] Logout com confirmação
- [x] Persistência de autenticação com AsyncStorage
- [x] Sistema de perfis (Admin vs Usuário Regular)

### 🎨 Interface & Experiência
- [x] Dark Mode & Light Mode com toggle
- [x] Persistência de tema
- [x] Design responsivo (web/mobile)
- [x] Status bar ajustável por plataforma
- [x] Paleta de cores dinâmica

### 🧭 Navegação & Estrutura
- [x] Bottom tabs (Home, Explore, Perfil)
- [x] Expo Router com file-based routing
- [x] Stack navigation aninhada
- [x] Modais para detalhes de eventos

### 📸 Gerenciamento de Imagens
- [x] Captura de câmera com permissões
- [x] Seleção da galeria
- [x] Edição/crop de imagens
- [x] Compressão e redimensionamento (expo-image-manipulator)
- [x] Validação de tamanho

### 📤 Compartilhamento & Social
- [x] Compartilhamento WhatsApp
- [x] Geração de QR code
- [x] Cópia de links para clipboard
- [x] Suporte multi-plataforma (web/iOS/Android)

### 🔊 Acessibilidade
- [x] Síntese de fala (TTS) em português
- [x] Função para parar áudio
- [x] Velocidade de fala ajustada

### 🛠️ Infraestrutura & DevOps
- [x] Lint (ESLint)
- [x] TypeScript com configuração
- [x] Reset de projeto
- [x] Build para web

---

## 🔄 REFAZER (Requer Adaptação para Banco Local)

Funcionalidades que precisam ser modificadas porque dependem do Firebase:

### 📅 Gerenciamento de Eventos
1. **Criar eventos** 
   - ❌ Remover: `firebase.firestore().collection('eventos').add()`
   - ✅ Adicionar: Salvar em banco local
   
2. **Editar eventos**
   - ❌ Remover: `firebase.firestore().collection('eventos').doc().update()`
   - ✅ Adicionar: Atualizar no banco local
   
3. **Deletar eventos**
   - ❌ Remover: `firebase.firestore().collection('eventos').doc().delete()`
   - ✅ Adicionar: Remover do banco local
   
4. **Listar eventos**
   - ❌ Remover: Real-time listeners de Firestore
   - ✅ Adicionar: Queries ao banco local
   
5. **Filtro de eventos ativos**
   - Manter a lógica, mas buscar dados locais

### 🗺️ Mapas & Localização
6. **Sincronização de eventos no mapa**
   - ❌ Remover: Real-time listeners do Firestore
   - ✅ Adicionar: Sincronização com banco local
   
7. **Marcadores atualizados**
   - Atualizar dados dos marcadores a partir do banco local

### 🔐 Contexto de Autenticação
8. **AuthContext.tsx**
   - ❌ Remover: `firebase.auth()`
   - ✅ Adicionar: Autenticação local com AsyncStorage
   - ✅ Verificar senhas com hash (bcrypt/argon2)
   
9. **Verificação de admin**
   - Buscar status admin no banco local ao invés do Firebase

### 💾 Armazenamento de Imagens
10. **Storage de imagens**
    - ❌ Remover: Firebase Storage (se usado)
    - ✅ Adicionar: Salvar Base64 no banco local ou arquivo local

### ⚙️ Configuração
11. **firebaseConfig.js / firebaseConfig.web.js**
    - ❌ Remover: Configurações do Firebase
    - ✅ Adicionar: Configurações do banco local

12. **firebase.json**
    - ❌ Remover: Configuração de deploy do Firebase

13. **Hooks de autenticação**
    - ✅ Refatorar: `useAdmin()` - buscar do banco local
    - ✅ Refatorar: `AuthContext` - implementar autenticação local

14. **Utils de autenticação**
    - ✅ Refatorar: `utils/authActions.ts` - ajustar para banco local

---

## ✨ CRIAR (Novas Funcionalidades para Banco Local)

Funcionalidades necessárias para gerenciar um banco de dados local:

### 🗄️ Gerenciamento de Banco de Dados
1. **Inicialização do Banco**
   - Criar estrutura do banco na primeira execução
   - Versioning/migrations do schema
   - Seeding de dados iniciais (se necessário)

2. **Backup & Sincronização**
   - Exportar dados do banco local
   - Importar dados de backup
   - Sincronização manual com nuvem (opcional)

3. **Validação de Integridade**
   - Verificar consistência dos dados
   - Recuperação de dados corrompidos
   - Limpeza de dados antigos/expirados

### 📊 Gerenciamento de Dados
4. **Interface de Admin para Dados**
   - Dashboard para visualizar/gerenciar banco local
   - Edição direta de registros (se necessário)
   - Estatísticas de uso

5. **Sincronização Offline**
   - Cache de dados críticos
   - Fila de operações quando offline
   - Sync automático quando retornar online

---

## 🔧 Detalhamento Técnico

### Banco de Dados Recomendado

**Opção 1: SQLite (Recomendado para Mobile)**
```
Dependência: expo-sqlite
Prós: Leve, nativo, sem servidor
Contras: Sem funcionalidades avançadas
```

**Opção 2: Realm (Alternativa)**
```
Dependência: realm
Prós: Performance, relacionamentos
Contras: Mais pesado
```

**Opção 3: AsyncStorage + JSON (Simples)**
```
Prós: Não requer dependência nova
Contras: Performance limitada, sem queries complexas
```

---

## 📝 Plano de Ação

### Fase 1: Preparação (Semana 1)
- [ ] Escolher banco de dados local (SQLite recomendado)
- [ ] Criar schema do banco
- [ ] Criar migrations/setup

### Fase 2: Autenticação (Semana 2)
- [ ] Remover Firebase Auth
- [ ] Implementar autenticação local com hash de senha
- [ ] Refatorar AuthContext

### Fase 3: CRUD de Eventos (Semana 2-3)
- [ ] Refatorar criação de eventos (banco local)
- [ ] Refatorar edição de eventos
- [ ] Refatorar deleção de eventos
- [ ] Implementar queries para listagem

### Fase 4: Mapas & Real-time (Semana 3)
- [ ] Remover listeners em tempo real do Firestore
- [ ] Implementar sincronização com banco local
- [ ] Atualizar componentes de mapa

### Fase 5: Testes & Ajustes (Semana 4)
- [ ] Testar todas as funcionalidades
- [ ] Performance testing
- [ ] Testes com dados grandes

### Fase 6: Deploy (Semana 4+)
- [ ] Build web sem Firebase
- [ ] Build mobile sem Firebase
- [ ] Documentação de deploy local

---

## 📌 Considerações Importantes

### Segurança
⚠️ **Sem banco na nuvem**, todos os dados estarão locais:
- Implementar hash de senhas (bcrypt/argon2)
- Não armazenar dados sensíveis em plain text
- Validar entrada de dados
- Considerar encriptação de dados sensíveis

### Performance
⚠️ **Com banco local**, performance melhorará:
- Sem latência de rede
- Queries mais rápidas
- Ideal para apps offline-first

### Escalabilidade
⚠️ **Limitações do banco local**:
- Sem sincronização automática com múltiplos devices
- Sem backup automático na nuvem
- Gerenciamento manual de dados

### Dados Existentes
⚠️ **Migração de dados**:
- Se houver dados no Firebase, exportar e importar
- Script de migração necessário
- Mapeamento de estrutura de dados

---

## 📚 Referências Técnicas

### Dependências a Remover
```json
{
  "firebase": "^12.12.0"
}
```

### Dependências a Adicionar (Sugestão)
```json
{
  "expo-sqlite": "latest",
  "argon2-browser": "latest",
  "uuid": "latest"
}
```

### Arquivos a Modificar
- `context/AuthContext.tsx` - Principal
- `app/login.tsx` - Autenticação
- `app/registrar.tsx` - Registro
- `app/cadastrar.tsx` - Criar eventos
- `app/(tabs)/index.tsx` - Listar eventos
- `app/(tabs)/explore.tsx` - Mapa eventos
- `firebaseConfig.js` - Remover
- `firebaseConfig.web.js` - Remover
- `firebase.json` - Remover
- Todos os `utils/` que usam Firebase

---

## ✅ Checklist de Verificação

- [ ] Banco de dados escolhido e instalado
- [ ] Schema do banco criado
- [ ] AuthContext refatorado
- [ ] Autenticação local funcionando
- [ ] CRUD de eventos funcionando
- [ ] Mapas sincronizados
- [ ] Testes passando
- [ ] Build web testado
- [ ] Build mobile testado
- [ ] Documentação atualizada
- [ ] Firebase completamente removido

---

**Próximo Passo**: Definir qual banco de dados local usar (recomendação: SQLite)
