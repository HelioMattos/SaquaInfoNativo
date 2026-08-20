# SaquaInfo Nativo (Android)

App Android para eventos e informações de Saquarema, com **banco de dados local (SQLite)** — sem Firebase e sem versão web.

## Como rodar no Android

### Opção 1: Expo Go (mais rápido para testar)

1. Instale o **Expo Go** no celular Android
2. No PC:

```bash
npm install
npm run android
```

3. Escaneie o QR code ou abra no emulador Android

### Opção 2: Emulador Android Studio

1. Instale o [Android Studio](https://developer.android.com/studio) com um emulador configurado
2. Rode:

```bash
npm install
npm run android
```

## Conta admin inicial

Na primeira execução, o app cria um administrador local:

| Campo | Valor |
|-------|-------|
| E-mail | `admin@saquainfo.com` |
| Senha | `admin123` |

Usuários comuns podem se cadastrar em **Criar Conta** na tela de login.

## Banco local

- **SQLite** via `expo-sqlite` (somente Android)
- Dados ficam no aparelho (offline-first)
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

## Gerar APK (futuro)

Para publicar na Play Store, use [EAS Build](https://docs.expo.dev/build/setup/):

```bash
npx eas build --platform android
```
