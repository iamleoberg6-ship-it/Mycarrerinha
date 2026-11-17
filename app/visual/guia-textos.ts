// Os textos do guia: o tour de cada modo e a ajuda "Como jogar".
import type { PassoTour, SecaoAjuda } from "./guia";

export const TOUR_JOGADOR: PassoTour[] = [
  { alvo: ".card-jogador", titulo: "Esse é você", texto: "Moral, cansaço, forma e a relação com o técnico. Cansaço alto derruba o rendimento e aumenta o risco de lesão. Toque no cartão para ver o perfil completo." },
  { alvo: ".semana-abas", titulo: "A semana tem três partes", texto: "Jogo: o jogo da semana e se você deve ser titular. Treino: o foco e o ritmo do treino, e as ações extras. Tempo livre: família, festas, descanso e redes." },
  { alvo: ".pendencias", titulo: "Pendências", texto: "Propostas, convites e decisões que chegaram nesta semana. Resolva aqui antes de seguir." },
  { alvo: ".fixo-jogar", titulo: "Seguir em frente", texto: "Quando terminar de planejar, toque aqui: vai para o jogo da semana ou fecha a semana se não tiver jogo." },
  { alvo: "nav.abas", titulo: "O menu", texto: "Carreira: perfil, estatísticas, desenvolvimento e álbum. Pessoas: família, namoro e amigos. Mercado: propostas, empresário e transferência. Vida: casa, carros, agenda e celular." },
  { alvo: ".engrenagem", titulo: "Opções", texto: "Salvar e carregar (no aparelho ou na nuvem, para jogar em outro lugar) e simular várias semanas de uma vez." },
  { alvo: ".botao-ajuda", titulo: "Ficou com dúvida?", texto: "Toque no ? a qualquer hora para ver o Como jogar." },
];

export const AJUDA_JOGADOR: SecaoAjuda[] = [
  { titulo: "O objetivo", itens: [
    "Você vive a carreira de um jogador, da base até a aposentadoria: evoluir, ganhar títulos, chegar à seleção e cuidar da vida fora de campo.",
    "Não existe um jeito certo: dá para ser ídolo de um clube só, rodar o mundo atrás de dinheiro ou virar lenda da seleção.",
  ] },
  { titulo: "Como funciona uma semana", itens: [
    "Na aba Semana, escolha o treino (foco e ritmo) e o que fazer no tempo livre.",
    "Resolva as pendências (propostas, convites, eventos).",
    "Toque em Jogar / Fechar a semana. Se você for escalado, acompanha o jogo e recebe a nota.",
    "Treino puxado evolui mais, mas cansa. Cansado, você rende menos e se machuca mais. Descansar também é treinar.",
  ] },
  { titulo: "Evolução e potencial", itens: [
    "Cada jogador tem uma curva: uns estouram cedo, outros florescem tarde. Ela aparece em Carreira > Atributos.",
    "Projetos de superação (treino extra, preparador, psicólogo, vídeo, mentor) esticam o potencial até um limite.",
    "Temporada com nota alta ou prêmio também sobe o potencial.",
  ] },
  { titulo: "Contrato, mercado e empresário", itens: [
    "As propostas chegam nas janelas de transferência. Compare salário, tempo de contrato, papel no time e a liga.",
    "Um empresário negocia por você (fica com uma parte). Sem empresário, você negocia sozinho.",
    "Ser titular pesa mais na evolução do que ganhar mais no banco de um gigante.",
  ] },
  { titulo: "Vida fora de campo", itens: [
    "O salário vira casa, carros e decoração. Gastar demais deixa o saldo negativo, e isso tem consequências.",
    "Família, namoro e amigos mexem com a moral. Redes sociais dão fama e patrocínio, mas também polêmica.",
  ] },
  { titulo: "Seleção, prêmios e álbum", itens: [
    "Jogando bem, você é convocado. Copa do Mundo e torneios continentais aparecem no calendário.",
    "Os prêmios do fim de temporada e os títulos vão para o armário de troféus e para o álbum de figurinhas.",
  ] },
  { titulo: "Salvar e continuar", itens: [
    "O jogo salva sozinho neste aparelho a cada semana.",
    "Na engrenagem dá para salvar na nuvem (e continuar em outro aparelho), exportar o save e simular semanas.",
    "Quando se aposentar, você pode virar técnico no mesmo mundo, com a sua história.",
  ] },
];

export const TOUR_TECNICO: PassoTour[] = [
  { alvo: ".topo-clube", titulo: "Seu clube", texto: "O clube, a reputação e o caixa. Toque em qualquer escudo do jogo para abrir o perfil daquele clube." },
  { alvo: ".prox, [data-avancar]", titulo: "O próximo jogo", texto: "Antes do jogo, veja o relatório do adversário. Jogue ao vivo para fazer preleção, gritar da beira e mexer no time, ou simule direto." },
  { alvo: "nav.abas", titulo: "O menu", texto: "Elenco: escalação, vestiário e contratos. Tática: formação e instruções. Liga: tabela, artilharia e copas. Clube: mercado, finanças, diretoria, patrocínios, estádio e base. Vida: seu perfil e sua família." },
  { alvo: ".botao-ajuda", titulo: "Ficou com dúvida?", texto: "Toque no ? a qualquer hora para ver o Como jogar." },
];

export const AJUDA_TECNICO: SecaoAjuda[] = [
  { titulo: "O objetivo", itens: [
    "Cumprir as metas da diretoria (a da temporada e o plano de vários anos) sem quebrar o clube.",
    "A confiança da diretoria sobe com resultados e metas cumpridas. Se ela cair demais, você é demitido e procura outro clube.",
  ] },
  { titulo: "Como funciona uma semana", itens: [
    "No Início aparece o próximo jogo. Toque em Jogar ao vivo para acompanhar, ou em Simular direto.",
    "Ao vivo: escolha a preleção antes do jogo e no intervalo, grite da beira, faça até 5 trocas e mude a tática.",
    "Entre os jogos: treino, mercado, conversas com jogadores e decisões da diretoria.",
  ] },
  { titulo: "Elenco e vestiário", itens: [
    "Arraste os jogadores para montar o time, ou use Escalar o melhor time.",
    "Promessas de tempo de jogo precisam ser cumpridas; promessa quebrada derruba o clima do vestiário.",
    "Líderes e grupos puxam o humor de todo mundo. Veja em Elenco > Vestiário.",
  ] },
  { titulo: "Mercado", itens: [
    "Procure jogadores por posição, negocie com o clube e depois com o jogador (salário, bônus por jogo e por gol).",
    "Cada liga tem limite de estrangeiros. O último dia da janela traz negócios de última hora.",
    "Anuncie o que procura e venda quem sobra. Clubes parceiros recebem seus jovens emprestados.",
  ] },
  { titulo: "Clube: dinheiro, diretoria e estádio", itens: [
    "Finanças: bilheteria, TV, patrocínios e salários. Caixa negativo vira dívida.",
    "Patrocínios: escolha as marcas da camisa, a cor e se vai o logo ou o nome.",
    "Estádio dividido ou público paga aluguel e não pode ser reformado. Dá para construir um estádio próprio, que pode receber shows.",
    "Clube associativo pode virar SAF vendendo uma parte para um investidor.",
  ] },
  { titulo: "Base", itens: [
    "A base revela garotos todo ano. Jogos da Copinha e do sub-20 mostram quem está pronto.",
    "Promova os melhores e dê minutos a eles: o plano da diretoria às vezes cobra isso.",
  ] },
  { titulo: "Salvar e continuar", itens: [
    "O jogo salva sozinho neste aparelho.",
    "Seu técnico tem origem, filosofia, personalidade e pontos fortes, que aparecem em Vida > Seu perfil. A filosofia rende mais quando a tática combina com ela.",
  ] },
];

export const AJUDA_INICIO: SecaoAjuda[] = [
  { titulo: "O que é o Mycarrerinha", itens: [
    "Um jogo de carreira no futebol, para jogar no navegador do celular ou do computador, semana a semana.",
    "Dois modos: a carreira de jogador (sua vida dentro e fora de campo) e a carreira de técnico (montar e comandar um clube).",
  ] },
  { titulo: "Por onde começar", itens: [
    "Criar meu jogador: você monta o jogador em 9 passos (nome, país, família, clube, formação, corpo, posição, aparência e DNA).",
    "Começar com um jogador de exemplo: pula a criação e já entra jogando.",
    "Começar como técnico: crie o técnico (origem, filosofia, personalidade) e escolha uma das propostas de emprego.",
  ] },
  { titulo: "Salvar", itens: [
    "O jogo salva sozinho neste aparelho. Para continuar em outro aparelho, use Carregar um save ou o save na nuvem.",
  ] },
];
