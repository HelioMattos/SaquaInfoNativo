# Alterações realizadas — SaquaInfo Nativo

**Projeto:** SaquaInfo Nativo  
**Repositório:** https://github.com/HelioMattos/SaquaInfoNativo  
**Período:** 20/08/2026  
**Objetivo:** Migrar o app híbrido (Firebase) para versão nativa Android com banco local

---

## Resumo

O projeto foi migrado de **Firebase (nuvem)** para **SQLite local**, com autenticação e CRUD de eventos funcionando offline no dispositivo. Em seguida, a configuração foi ajustada para **Android only** (sem web e sem iOS).

---

## Commits enviados ao GitHub

| Commit | Descrição |
|--------|-----------|
| `9be8225` | Migração Firebase → SQLite local |
| `d5efa0b` | Configuração apenas para Android |

---

## 1. Banco de dados local (SQLite)

### Criado

| Arquivo | Função |
|---------|--------|
| `lib/db/index.ts` | Inicialização do banco, schema e seed do admin |
| `lib/db/users.ts` | Cadastro, login e sessão de usuários |
| `lib/db/eventos.ts` | CRUD de eventos |
| `lib/auth/password.ts` | Hash e verificação de senha (bcrypt) |
| `lib/auth/session.ts` | Persistência de sessão no AsyncStorage |
| `types/usuario.ts` | Tipos de usuário e sessão |
| `types/expo-sqlite.d.ts` | Tipos TypeScript para expo-sqlite |

### Schema do banco

**Tabela `usuarios`**
- `email` (PK)
- `senha_hash`
- `tipo` (`admin` ou `usuario`)
- `criado_em`

**Tabela `eventos`**
- `id` (PK)
- `titulo`, `local`, `descricao`, `categoria`
- `latitude`, `longitude`
- `data_inicio`, `data_termino`
- `imagens` (JSON)
- `criado_em`, `atualizado_em`

### Conta admin inicial (seed)

| Campo | Valor |
|-------|-------|
| E-mail | `admin@saquainfo.com` |
| Senha | `admin123` |

---

## 2. Autenticação

### Alterado

| Arquivo | O que mudou |
|---------|-------------|
| `context/AuthContext.tsx` | Removido Firebase Auth; login/logout/registro local |
| `app/login.tsx` | Login com banco local |
| `app/registrar.tsx` | Registro com banco local |
| `app/_layout.tsx` | Removido `onAuthStateChanged` do Firebase |
| `app/(tabs)/perfil.tsx` | Logout via contexto local |
| `utils/authActions.ts` | Removido `signOut` do Firebase |

### Comportamento

- Senhas armazenadas com **bcrypt**
- Sessão salva em **AsyncStorage**
- “Esqueci minha senha” informa que, no modo local, não há recuperação por e-mail

---

## 3. Eventos e mapas

### Alterado

| Arquivo | O que mudou |
|---------|-------------|
| `app/cadastrar.tsx` | Criar/editar eventos no SQLite |
| `app/(tabs)/index.tsx` | Listagem local com `useFocusEffect` |
| `app/(tabs)/modal.tsx` | Detalhes e exclusão no SQLite |
| `components/MapaExplore.tsx` | Marcadores a partir do banco local |

### Removido

- Listeners em tempo real do Firestore (`onSnapshot`)
- Queries do Firestore (`addDoc`, `updateDoc`, `deleteDoc`, etc.)

### Mantido

- Filtro de eventos ativos (`eventoEstaAtivo`)
- Mapas com `react-native-maps`
- Compartilhamento WhatsApp, fotos, dark mode, etc.

---

## 4. Remoção do Firebase

### Arquivos removidos

- `firebaseConfig.js`
- `firebaseConfig.web.js`
- `firebase.json`
- `.firebaserc`

### Dependência removida

- `firebase` (package.json)

---

## 5. Configuração Android only

### Alterado

| Arquivo | O que mudou |
|---------|-------------|
| `app.json` | Removido iOS e web; adicionado `android.package` e plugin `expo-sqlite` |
| `package.json` | Scripts só Android; removidas deps web (`leaflet`, `react-dom`, `react-native-web`) |
| `README.md` | Instruções para Android e Expo Go |

### Removido

- `vercel.json` (deploy web)
- `types/leaflet-css.d.ts`

### Criado

| Arquivo | Função |
|---------|------|
| `conectar.html` | Página com QR code para conectar no Expo Go |

### Package Android

```
com.saquainfo.app
```

---

## 6. Dependências adicionadas

| Pacote | Uso |
|--------|-----|
| `expo-sqlite` | Banco local no Android |
| `bcryptjs` | Hash de senhas |
| `@types/bcryptjs` | Tipos TypeScript |

---

## 7. Como rodar (Android)

```bash
npm install
npm run android
```

Ou, para testar no celular com **Expo Go**:

1. Rode `npx expo start --lan`
2. Abra `conectar.html` no navegador (QR code)
3. Ou cole no Expo Go: `exp://[IP-DO-PC]:8081`

---

## 8. Próximos passos sugeridos

- [ ] Testar todas as telas no celular Android
- [ ] Gerar APK com EAS Build (`npx eas build --platform android`)
- [ ] Backup/exportação de dados locais
- [ ] Limpar arquivos `.web.tsx` não usados no Android (opcional)
- [ ] Migrar dados antigos do Firebase, se necessário

---

## Referência

Plano original de migração: `FUNCIONALIDADES_MIGRACAO.md`
