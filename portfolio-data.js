// Um projeto por IA; as imagens seguem a ordem da conversa.
window.portfolioAIProjects = [
  {
    name: 'IA de atendimento jurídico — da recepção ao agendamento',
    description: 'Desenvolvi uma IA para conduzir o atendimento inicial e encaminhar a conversa conforme a necessidade apresentada. Nesta demonstração, a recepção identifica se a pessoa já é cliente e direciona a demanda para a etapa de aposentadorias e planejamento. A conversa coleta informações iniciais, esclarece uma dúvida sobre o documento solicitado e passa para o agendamento com a equipe. Os prints mostram a apresentação de horários, a escolha de uma opção, a mensagem de confirmação e, depois, o tratamento de um pedido de cancelamento. A sequência evidencia a divisão do atendimento entre recepção, triagem temática e agendamento.',
    images: [
      {
        src: 'assets/ia-atendimento/01-recepcao.png',
        caption: '01 · Recepção e identificação da demanda: a IA se apresenta, verifica se a pessoa já é cliente e direciona o assunto para aposentadorias e planejamento.',
        alt: 'Conversa com a recepção Helena e início da triagem sobre aposentadoria.'
      },
      {
        src: 'assets/ia-atendimento/02-triagem.png',
        caption: '02 · Coleta de informações: perguntas sobre histórico de contribuição, atividade profissional e disponibilidade de documentos, com esclarecimento de uma dúvida durante a conversa.',
        alt: 'Continuação da triagem com perguntas sobre contribuições e documentos.'
      },
      {
        src: 'assets/ia-atendimento/03-horarios.png',
        caption: '03 · Transição para o agendamento: a conversa solicita o contato para cadastro e apresenta opções de datas e horários para falar com a equipe jurídica.',
        alt: 'Etapa de agendamento solicita o e-mail e apresenta datas e horários.'
      },
      {
        src: 'assets/ia-atendimento/04-escolha.png',
        caption: '04 · Escolha do horário: após a preferência por uma data, a IA apresenta os horários correspondentes e recebe a opção escolhida.',
        alt: 'Conversa com opções de horário para a data escolhida e seleção de uma opção.'
      },
      {
        src: 'assets/ia-atendimento/05-confirmacao-cancelamento.png',
        caption: '05 · Confirmação e mudança de intenção: a IA confirma o agendamento; diante de um novo pedido, pergunta se a pessoa deseja cancelar ou remarcar e apresenta a confirmação do cancelamento.',
        alt: 'Mensagens de confirmação do agendamento, pedido de cancelamento e confirmação do cancelamento.'
      }
    ]
  }
];
