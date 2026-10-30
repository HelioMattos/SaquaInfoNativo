# Aula 3 — Notificações e lembretes locais
**Laboratório de Desenvolvimento de Aplicativos Nativos — 8º período**  
**Professor:** Lucas Hermenegildo do Nascimento  
**Data:** 22/10/2026 — Universidade de Vassouras, Campus Saquarema

## 1. Objetivo e continuidade
Na Aula 2, a proposta foi implementar o primeiro fluxo nativo e documentar quatro casos de teste. Como não houve aula em 15/10, esta é a próxima etapa: adicionar lembretes locais ao projeto e chegar a pelo menos seis casos documentados. O trabalho pode ser individual ou em dupla, conforme a organização anterior.

Ao terminar, o usuário deverá cadastrar título, mensagem e data/hora futura; consultar os lembretes; cancelar um agendamento; receber uma notificação e abrir o app ao tocá-la. O exemplo usa Android nativo em Java, sem bibliotecas adicionais. Se o projeto da equipe usa Kotlin, as classes Java podem coexistir, ajustando pacote e integração da tela.

## 2. O que acompanha o material
- `Prompt_Gamma_Aula_3.md`: prompt pronto para colar no Gamma, com exatamente seis slides.
- `codigo/`: projeto base Android com quatro classes e configuração Gradle.
- `MODELO_TESTES.md`: registros para preencher com resultados reais.

A base é educacional e usa APIs do Android. Não depende de Firebase, servidor, conta de nuvem ou internet para disparar lembretes. O download inicial do SDK e das ferramentas de compilação requer conexão.

## 3. Preparar e executar
1. Instale Android Studio com JDK 17, SDK Android 35 e suporte a emulador, ou use aparelho Android 8 (API 26) ou superior com depuração USB.
2. Abra a pasta `codigo` como projeto. A configuração fornecida usa Android Gradle Plugin 8.7.3 e requer Gradle 8.9. Não confunda a versão do Gradle com a do plugin.
3. O pacote não inclui o Gradle Wrapper binário. Se tiver Gradle 8.9 instalado, execute na pasta `codigo`: `gradle wrapper --gradle-version 8.9`; depois sincronize no Android Studio.
4. Alternativa mais simples: crie no Android Studio um projeto **Empty Views Activity**, Java, pacote `br.edu.lembretes`, mínimo API 26. Mantenha a configuração Gradle e o wrapper gerados pela IDE, usando compileSdk/targetSdk 35 ou superior. Copie as quatro classes para `app/src/main/java/br/edu/lembretes`, o ícone para `res/drawable` e as declarações do Manifest. A tela é criada em Java e não usa XML de layout nem AppCompat. Remova a Activity de exemplo se conflitar.
5. Execute em aparelho/emulador. No Android 13+, toque em Permitir notificações e conceda acesso. Depois toque em Testar notificação agora.
6. Cadastre título e mensagem; escolha um horário futuro; toque em Agendar. A concessão de permissão não agenda automaticamente: pressione Agendar novamente.
7. Consulte a lista, volte à tela inicial do celular e observe a bandeja de notificações. Toque na notificação para abrir o app. Atualize a lista para consultar o status.

Se estiver usando a configuração Gradle fornecida, compilar com `./gradlew :app:assembleDebug` (Windows: `gradlew.bat :app:assembleDebug`) depois de gerar o wrapper. O APK será gerado em `app/build/outputs/apk/debug/`.

## 4. Entender o fluxo
O formulário valida os dados e a permissão. `ReminderStore` gera um identificador e armazena a lista. `ReminderScheduler` registra um PendingIntent no AlarmManager. No momento permitido pelo sistema, `ReminderReceiver` recebe o evento e chama a publicação da notificação. O processo pode ser recriado pelo Android para entregar o evento; não há temporizador preso à tela.

### MainActivity.java — entrada e interação
- `onCreate`: monta título, mensagem, seletor de data/hora, botões e lista. O tratamento de insets evita sobreposição com barras do sistema.
- `pick`: abre DatePickerDialog e TimePickerDialog. A escolha só é aplicada ao confirmar o horário; os segundos são zerados.
- `permission`: solicita POST_NOTIFICATIONS a partir da API 33. Em versões anteriores, verifica bloqueio do app/canal. Existe botão separado para configurações.
- `create`: rejeita campos vazios e horário menor ou igual ao instante atual; verifica notificações; gera ID, agenda e salva os dados. A mensagem de sucesso informa a natureza aproximada.
- `refresh`: lê dados persistidos, mostra o estado e fornece cancelamento para lembretes agendados.
- `onSaveInstanceState`: preserva os campos e a data escolhida em rotação. `onResume` atualiza a lista ao voltar ao aplicativo.

### ReminderStore.java — persistência
A lista é um array JSON em SharedPreferences. Cada registro tem `id`, `title`, `message`, `when` (milissegundos desde epoch) e `status`. `nextId` fornece IDs distintos; `all` lê, `save` grava e `status` altera o histórico. Os métodos sincronizados evitam intercalar operações dentro de cada método no mesmo processo. Para maior volume, concorrência complexa ou consultas, evolua para Room com transações. SharedPreferences não é um cofre: não coloque dados sensíveis na mensagem.

### ReminderScheduler.java — integração com o sistema
- `channel`: cria o canal de notificações, obrigatório a partir do Android 8. A criação repetida é segura e preserva a escolha do usuário.
- `allowed`: confere permissão, bloqueio geral e importância do canal.
- `intent`: cria um PendingIntent explícito, imutável e com requestCode igual ao ID do lembrete. Assim, um agendamento não substitui outro.
- `schedule`: usa `setAndAllowWhileIdle` com RTC_WAKEUP. O horário é aproximado, sem solicitar acesso a alarmes exatos.
- `cancel`: recria a identidade do PendingIntent, cancela o alarme e remove eventual notificação do mesmo ID. O histórico recebe Cancelado.
- `show`: verifica acesso novamente, configura ícone, título, mensagem completa e ação de abertura. Publicada significa que a aplicação enviou ao gerenciador, não que o usuário leu ou ouviu um som.

### ReminderReceiver.java — recebimento
É um BroadcastReceiver explícito e não exportado. Extrai os dados do Intent e publica a notificação. O trabalho é curto e não realiza requisições de rede. Não coloque tarefas demoradas no onReceive.

### AndroidManifest.xml e ícone
O Manifest declara POST_NOTIFICATIONS, a Activity de entrada e o receiver. O ícone vetorial monocromático `ic_reminder` é usado na barra de status. A implementação não solicita INTERNET, SCHEDULE_EXACT_ALARM ou RECEIVE_BOOT_COMPLETED.

## 5. Roteiro sugerido para a aula
| Etapa | Tempo sugerido | Resultado |
|---|---:|---|
| Retomada e escolha do evento | 10 min | Evento útil no projeto definido |
| Executar e explicar a base | 20 min | Permissão e teste imediato funcionando |
| Adaptar e agendar | 35 min | Fluxo de lembrete integrado |
| Testar, corrigir e registrar | 25 min | Dois novos casos executados |
| Organizar entrega | 10 min | Commit, evidências e documentação |
Os tempos são ajustáveis à duração disponível. Se os quatro testes anteriores não foram concluídos, regularize-os antes de contabilizar seis.

## 6. Adaptar ao projeto
1. Escolha o evento: prazo de atividade, compromisso, consulta ou vencimento.
2. Substitua textos genéricos pelo vocabulário do sistema. Prefira mensagens discretas na tela bloqueada.
3. Integre a abertura do formulário à navegação já existente. Não substitua o aplicativo inteiro pela base.
4. Se alterar o pacote, ajuste namespace/applicationId, declarações package e referências do Manifest.
5. Se associar o lembrete a um registro, salve também o ID desse registro. Como extensão, use esse ID na notificação para abrir sua tela específica. A base abre apenas a tela principal.
6. Preserve validação, permissão e IDs únicos. Não remova tratamento de falhas para facilitar a demonstração.

## 7. Testar e registrar
Mantenha os quatro casos anteriores e documente pelo menos dois novos. Use o modelo fornecido; os resultados estão em branco de propósito.

**Obrigatórios sugeridos:**
- CT05: título/mensagem válidos e horário futuro, notificações habilitadas. Agendar, colocar app em segundo plano e observar. Esperado: não publicar antes do horário; publicação posterior sujeita ao atraso do sistema. Anotar horário escolhido e observado. O teste imediato não substitui esta execução.
- CT06: horário passado. Esperado: mensagem de validação e nenhum registro/alarme novo. Aplicar particionamento de equivalência (passado/futuro) e discutir limite entre eles.

**Complementares recomendados:** campos vazios; permissão negada; canal bloqueado; cancelamento antes do disparo; dois lembretes independentes; rotação da tela; voltar após fechar a tela; funcionamento em modo avião.

Após corrigir um defeito, repita o caso que o revelou (confirmação). Reexecute os quatro casos do fluxo anterior para verificar regressão. Evidência pode ser captura ou vídeo identificando o caso e ambiente. Não marque Aprovado sem executar. Uma notificação imediata prova canal/permissão, não entrega futura.

## 8. Limitações que precisam aparecer na entrega
- O agendamento é inexato: Android 12+ pode entregar dentro de uma hora após o horário indicado em condições normais; economia de bateria e Doze podem ampliar o atraso. Não exigir disparo em 30 segundos como critério desta base.
- Alarmes são removidos ao reiniciar o aparelho. A lista continua salva, mas os alarmes não são restaurados. Após reboot, os status antigos podem continuar Agendado: isso não comprova agendamento ativo. Para esta aula, cancelar esses registros e criar novos. Evolução: receiver de boot, revalidação de datas e reagendamento.
- Forçar parada nas configurações pode impedir entrega. Tirar a tela de recentes não equivale necessariamente a forçar parada; fabricantes também impõem restrições próprias.
- Mudança manual do relógio/fuso requer tratamento adicional em um produto real. Datas são salvas como instante absoluto.
- Não há edição, recorrência, sincronização ou confirmação de leitura. Som depende do canal, volume e modo Não Perturbe.
- Cancelamento deve ser testado antes do disparo. Um evento já em processamento pode disputar com o cancelamento.
- A persistência e o agendamento não constituem uma transação atômica entre banco e sistema. Uso crítico exige arquitetura adicional. Esta aula não atende alarmes médicos, emergenciais ou outros alertas críticos.

## 9. Resolver problemas comuns
| Sintoma | Verificação |
|---|---|
| Nenhuma notificação imediata | Permissão API 33+, configurações do app, canal e ícone |
| Pedido de permissão não reaparece | Abrir configurações pelo botão; não repetir solicitações em loop |
| Teste imediato funciona, agendado demora | Aguardar janela do alarme inexato; observar bateria/Doze e registrar o atraso |
| Lista existe após reinício, mas não dispara | Limitação de boot; recriar agendamento para a aula |
| Erro de Gradle/JDK | JDK 17; Gradle 8.9 para AGP 8.7.3, ou usar projeto gerado pela IDE |
| R não encontrado | Verificar pacote, namespace e ícone em res/drawable |
| Horário rejeitado | Selecionar alguns minutos à frente; o seletor zera os segundos |

## 10. Entrega
Repositório atualizado com código integrado, descrição do evento escolhido, instruções para executar, mínimo seis casos acumulados com resultados reais, evidência de notificação e cancelamento, e limitações conhecidas. Preservar histórico de commits. Sugestão de commit: `feat: adiciona lembretes locais e documenta testes`.

Critérios de conferência: funcionalidade útil ao domínio; agendamento/listagem/cancelamento; validação e permissão; clareza do código; qualidade das evidências. Não há pontuação nova definida neste material.

## 11. Referências oficiais
- Alarmes: https://developer.android.com/develop/background-work/services/alarms
- Permissão de notificações: https://developer.android.com/develop/ui/views/notifications/notification-permission
- Canais: https://developer.android.com/develop/ui/views/notifications/channels

## 12. Verificação do material
Arquivos e XML foram conferidos estruturalmente no ambiente de criação. A compilação Android e a execução em dispositivo precisam ser realizadas no Android Studio; não foram executadas neste ambiente. O projeto não inclui APK compilado nem Gradle Wrapper binário.