# Roteiro de teste — mapa Leaflet + OpenStreetMap

Para validar a troca do `react-native-maps` pelo Leaflet em WebView, no APK
instalado no aparelho. Cada teste diz o que fazer e o que deve acontecer.

Marque o que passou. O que falhar, anote o número do teste e o que apareceu na
tela — é o suficiente para localizar o problema.

---

## Antes de começar

Instale o APK com o aparelho no cabo e a Depuração USB ligada:

```bash
"D:\Android\Sdk\platform-tools\adb.exe" install -r "D:\Ninja Idle\SaquaInfoNativo\SaquaInfo-leaflet-osm-arm64.apk"
```

O app já nasce com 6 eventos de demonstração espalhados por Saquarema. Eles são
inseridos uma única vez, **só quando o banco não tem nenhum evento**. Se você já
tem eventos cadastrados, eles não aparecem — e nada do que você criou é tocado.

| Evento | Categoria | Quando | Bairro |
|---|---|---|---|
| Etapa do circuito de surfe em Itaúna | Esportes 🏃 | amanhã | Praia de Itaúna |
| Mutirão de limpeza da praia | Outros 📍 | hoje | Praia do Boqueirão |
| Novena de Nossa Senhora de Nazaré | Religioso 🙏 | em 3 dias | Igreja matriz |
| Samba na praça do Centro | Show 🎤 | em 5 dias | Centro |
| Caminhada fotográfica na lagoa | Cultural 📖 | em 8 dias | Lagoa de Saquarema |
| Feira gastronômica de Bacaxá | Comida 👨‍🍳 | em 12 dias | Bacaxá |

Três deles já vêm com notas e comentários, para a média de estrelas aparecer.

**Para começar do zero** (apagar tudo e semear de novo): Ajustes do Android →
Apps → SaquaInfo → Armazenamento → **Limpar dados**. Na próxima abertura os 6
eventos voltam, com as datas recalculadas a partir do dia.

Login do admin: `admin@saquainfo.com` / `admin123`.

---

## 1. Lista inicial

1. Abra o app.

**Esperado:** 6 eventos na tela inicial, cada um com uma capa colorida (sem
imagem quebrada). O de surfe em Itaúna aparece primeiro. Três cards mostram
média de estrelas.

> As capas são imagens geradas no próprio app, não vêm da internet — é por isso
> que aparecem até no Modo Avião (teste 8).

---

## 2. Mapa do Explore: os marcadores aparecem

1. Abra a aba **Explore**.

**Esperado:** o mapa abre em Saquarema com os 6 emojis de categoria
espalhados — 🏃 em Itaúna, 🙏 na igreja, 🎤 no Centro, e assim por diante. No
canto inferior direito aparece o crédito "© OpenStreetMap".

**Se o mapa aparecer branco com o aviso "Mapa indisponível sem internet":** é
falta de conexão. Ligue o Wi-Fi e volte para a aba.

> Este é o teste mais importante. É aqui que se vê se o Leaflet carregou dentro
> do WebView.

---

## 3. Mapa do Explore: toque no marcador

1. Toque em um dos emojis.

**Esperado:** o emoji cresce e sobe um cartão na parte de baixo da tela, com
foto, título, categoria, data, local e "Toque para abrir o evento".

2. Toque **no mesmo emoji** outra vez.

**Esperado:** abre a tela de detalhe daquele evento.

3. Volte, toque num emoji e depois toque numa área vazia do mapa.

**Esperado:** o cartão desaparece e volta a dica "Toque no marcador para ver o
evento".

---

## 4. Mapa do Explore: arrastar e dar zoom

1. Arraste o mapa para os lados.
2. Dê zoom com dois dedos (pinça) e com duplo toque.

**Esperado:** o mapa acompanha o dedo sem travar, e os marcadores ficam
ancorados nos lugares certos durante todo o movimento.

---

## 5. Mapa do detalhe do evento

1. Abra qualquer evento da lista.
2. Role a tela até o mapa.

**Esperado:** mapa centralizado no evento, com um marcador no ponto.

3. **Arraste o dedo dentro do mapa**, na horizontal e na vertical.

**Esperado:** o mapa se move e a tela **não** rola junto.

4. Arraste o dedo **fora** do mapa.

**Esperado:** a tela rola normalmente.

> Os itens 3 e 4 testam a convivência do mapa com a rolagem da página. É o
> ponto mais provável de dar errado.

---

## 6. Rota até o evento

Precisa de **GPS ligado** e **internet**.

1. No detalhe de um evento, toque em **Traçar rota**.
2. Permita o acesso à localização, se for pedido.

**Esperado:** aparece uma linha azul ligando sua posição ao evento, um marcador
🟢 na sua posição, e o mapa se ajusta sozinho para mostrar os dois pontos. Os
controles mostram distância e tempo.

3. Toque em **Iniciar navegação**.

**Esperado:** o mapa segue sua posição e o app fala a instrução em voz alta.

4. Toque em **Parar** e depois em **Limpar rota**.

**Esperado:** a linha azul e o marcador da sua posição desaparecem, e o mapa
volta a centralizar no evento.

---

## 7. Escolher o local no cadastro

1. Faça login como admin.
2. Vá em **Cadastrar evento** e role até o mapa.
3. Toque num ponto do mapa.

**Esperado:** o marcador 📍 pula para onde você tocou e os campos de latitude e
longitude mudam juntos.

4. Arraste o mapa para outra parte da cidade e toque de novo.

**Esperado:** mesmo comportamento, e a tela não rola enquanto você arrasta
dentro do mapa.

5. Preencha o resto, salve e confira o evento novo no Explore.

**Esperado:** o marcador aparece exatamente onde você tocou.

---

## 8. Modo Avião

1. Ligue o Modo Avião.
2. Feche e abra o app.

**Esperado:**
- a lista de eventos continua aparecendo, com as capas;
- criar, editar, excluir e avaliar eventos continuam funcionando;
- nos mapas aparece **"Mapa indisponível sem internet. Reconecte para carregar
  o mapa."** em vez de uma tela branca.

3. Desligue o Modo Avião e volte para a aba Explore.

**Esperado:** o mapa carrega.

> Mapa sempre dependeu de internet, inclusive na versão anterior com Google
> Maps: as imagens do mapa vêm do servidor. O que mudou é que agora avisa em vez
> de ficar em branco.

---

## 9. Tema escuro

1. Troque para o tema escuro no perfil (ou no sistema, se o app seguir o
   sistema).
2. Abra o Explore e o mapa de um evento.

**Esperado:** o mapa fica escurecido, acompanhando o resto da tela, e os emojis
dos marcadores continuam legíveis.

---

## 10. Avaliação e lembretes (não mudaram, mas vale conferir)

1. Abra um evento, dê uma nota e escreva um comentário.

**Esperado:** a média muda e seu comentário aparece na lista.

2. Crie um lembrete para um evento e confira na aba de lembretes.

**Esperado:** o lembrete aparece agendado.

---

## Se algo falhar

Anote:

- o número do teste;
- o que apareceu (mapa branco? mapa cinza? aviso de sem internet? travou?);
- se tinha internet e GPS no momento.

Com isso dá para separar os três tipos de problema: o WebView não carregou, o
Leaflet não carregou, ou o comando do React não chegou no mapa.
