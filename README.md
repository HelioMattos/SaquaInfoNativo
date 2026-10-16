# SaquaInfo

Aplicativo Android de eventos e informações de Saquarema, com persistência local e funcionamento Offline First.

## Integrantes

- Karina Aires — 202312827
- Helio Mattos — 202312427
- Douglas Marinho — 202312271
- Geuria Dos Santos — 202221604
- Yuri Stefan — 202312649

## Objetivo

Divulgar eventos de Saquarema (shows, esportes, cultura, comida e outros), com mapa, cadastro, avaliação e uso sem internet.

## Tecnologias

- Android
- React Native (Expo SDK 54)
- TypeScript
- SQLite local (`expo-sqlite`)
- AsyncStorage (fila de sincronização e sessão)
- Expo Router
- React Native Maps / Leaflet (web)
- NetInfo (detecção de rede)
- API de demonstração: `https://jsonplaceholder.typicode.com/posts`

## Funcionalidades

- Cadastro, login e sessão local
- Listagem, consulta, criação, edição e exclusão de eventos
- Fotos, mapa, rota e compartilhamento
- Avaliação com estrelas (1 a 5) e mensagem
- Persistência no SQLite do aparelho
- Indicador de conexão e status de sincronização
- Funcionamento offline e sincronização ao reconectar

## Offline First

O aplicativo **não depende da internet** para as funções principais.

- Eventos, usuários e avaliações ficam no **SQLite** do celular.
- A sessão fica no **AsyncStorage**.
- Com o modo avião ligado, o usuário continua vendo, cadastrando, editando e avaliando.
- Cada alteração local recebe status **PENDENTE**.

## Sincronização

Quando a conexão volta, o app envia sozinho a fila de alterações.

1. `NetInfo` detecta que a rede retornou.
2. Os itens **PENDENTE** passam para **SINCRONIZANDO**.
3. Cada item é enviado por `POST` para a API de demonstração.
4. Em caso de sucesso, o status vira **SINCRONIZADO**.
5. Se falhar, o dado **permanece no aparelho** e tenta de novo depois.

A faixa no topo e a tela **Perfil** mostram: Offline, Sincronizando, Conectado e última sincronização.

## Conta admin inicial

Na primeira execução o app cria o administrador local:

| Campo | Valor |
|-------|-------|
| E-mail | `admin@saquainfo.com` |
| Senha | `admin123` |

Usuários comuns podem se cadastrar em **Criar Conta**.

## Como executar

### Pré-requisitos

- Node.js
- Android Studio com emulador **ou** celular com USB/`adb`

```bash
npm install
npx expo start
```

No emulador Android, com o Metro aberto:

```bash
adb reverse tcp:8081 tcp:8081
adb shell am start -a android.intent.action.VIEW -d "exp://127.0.0.1:8081"
```

## APK

Este projeto é **Expo**, não um app Kotlin/Java aberto direto no Android Studio. O APK de entrega precisa ir com o JavaScript **dentro do arquivo**, senão só funciona com o PC ligado.

Arquivo entregue (release, com o JavaScript dentro):

```text
APK/SaquaInfo.apk
```

Cópia na Área de Trabalho: `SaquaInfo.apk` (~35 MB). Instale no celular permitindo fontes desconhecidas. Não precisa do computador ligado.

### Opção recomendada (EAS, gera APK assinado)

```bash
npm install -g eas-cli
eas login
eas build -p android --profile preview
```

O `eas.json` já está configurado com `"buildType": "apk"`.

### Opção local (Windows + Android Studio)

No PowerShell, na pasta do projeto:

```powershell
$env:JAVA_HOME = "C:\Program Files\Microsoft\jdk-17.0.20.101-hotspot"
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:Path = "$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:Path"

npx expo prebuild --platform android
npx expo run:android --variant release
```

O APK de release fica em:

```text
android/app/build/outputs/apk/release/
```

Renomeie para `SaquaInfo.apk` (sem espaços).

> O APK de **debug** do Expo costuma precisar do Metro. Para o professor instalar em outro celular, use o APK de **preview/release**.

## Repositório

https://github.com/HelioMattos/SaquaInfoNativo
