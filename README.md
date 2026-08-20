# SaquaInfo Nativo

App Expo/React Native para eventos e informações de Saquarema, com **banco de dados local (SQLite)** — sem Firebase.

## Como rodar

```bash
npm install
npx expo start
```

Depois escolha **web**, **Android** ou **iOS** no terminal.

## Conta admin inicial

Na primeira execução, o app cria um administrador local:

| Campo | Valor |
|-------|-------|
| E-mail | `admin@saquainfo.com` |
| Senha | `admin123` |

Usuários comuns podem se cadastrar em **Criar Conta** na tela de login.

## Banco local

- **SQLite** via `expo-sqlite`
- Dados ficam no dispositivo (offline-first)
- Sessão de login salva em **AsyncStorage**
- Senhas com hash **bcrypt**

## Estrutura principal

```
app/           → Telas (Expo Router)
components/    → UI, mapas, formulários
context/       → Auth e tema
lib/db/        → SQLite (usuários e eventos)
lib/auth/      → Sessão e senha
types/         → Tipos TypeScript
```

## Build web

```bash
npm run build
```

Saída em `dist/`.

## Migração

Este projeto foi migrado do híbrido (Firebase) para banco local. Detalhes em `FUNCIONALIDADES_MIGRACAO.md`.
