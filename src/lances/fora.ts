// Fora da jogada: como comemorar o gol e o que acontece depois do apito final.
import { e, type Situacao } from "./base.js";

export const COMEMORACAO: Situacao = {
  id: "comemoracao", momento: "comemoracao", mostrar: 4, titulo: ["GOL! Como você comemora?", "É seu! Como comemora?"],
  texto: ["O estádio está gritando seu nome.", "O {estadio} inteiro de pé. Os companheiros correm na sua direção."], peso: () => 0, opcoes: [
    { id: "torcida", rotulo: "Correr para a torcida", teste: { CARISMA: 1 }, dif: -20, quando: (c) => c.mandante || !c.classico, niveis: [
      e("Você se jogou no alambrado e a torcida te abraçou.", 0, { moral: 4, fama: 0.4 }), e("Comemorou com a torcida.", 0, { moral: 3, fama: 0.2 }), e("Comemorou com a torcida.", 0, { moral: 3 }), e("Comemorou com a torcida.", 0, { moral: 2 }), e("Comemorou com a torcida.", 0, { moral: 2 })] },
    { id: "familia", rotulo: "Homenagem à família", teste: { CARISMA: 1 }, dif: -20, niveis: [
      e("Apontou para o céu e mostrou a camiseta com a foto da família. A foto rodou o país.", 0, { moral: 5, fama: 0.6, seguidores: 0.03 }),
      e(["Homenagem à família. Sua mãe chorou na arquibancada.", "Fez um coração com as mãos para a família na arquibancada."], 0, { moral: 5, fama: 0.3 }),
      e("Homenagem à família.", 0, { moral: 4 }), e("Homenagem à família.", 0, { moral: 4 }), e("Homenagem à família.", 0, { moral: 4 })] },
    { id: "danca", rotulo: "Dancinha ensaiada", teste: { CARISMA: 0.7, COM: 0.3 }, dif: 0, niveis: [
      e("A dancinha viralizou. Milhares de vídeos imitando você.", 0, { fama: 1.2, seguidores: 0.12, moral: 3 }),
      e("A dancinha pegou bem nas redes.", 0, { fama: 0.6, seguidores: 0.05, moral: 2 }),
      e("Dancinha simpática.", 0, { seguidores: 0.02, moral: 1 }),
      e("A dancinha saiu meio sem graça.", 0, { seguidores: 0.005 }),
      e("A dancinha virou meme, e não do jeito que você queria.", 0, { moral: -2, seguidores: 0.02 })] },
    { id: "provocar", rotulo: "Mandar a torcida rival calar a boca", teste: { CALMA: 1 }, dif: 10, quando: (c) => !c.mandante || c.classico, niveis: [
      e("Gesto de silêncio para a torcida rival. Virou capa de jornal.", 0, { fama: 1.5, seguidores: 0.05, relTecnico: -1 }),
      e("Provocou a torcida rival. Polêmica nas redes.", 0, { fama: 1, relTecnico: -2, noticia: "A comemoração de {nome} provocando a torcida do {adv} dividiu opiniões." }),
      e("Provocou e levou amarelo.", -0.1, { amarelo: true, fama: 0.6, relTecnico: -2 }),
      e("Amarelo e confusão com os jogadores rivais.", -0.2, { amarelo: true, relTecnico: -3, noticia: "A provocação de {nome} depois do gol terminou em confusão." }),
      e("Confusão generalizada e cartão vermelho.", -1.2, { vermelho: true, relTecnico: -6, noticia: "{nome} é expulso por provocar a torcida depois do gol." })] },
    { id: "camisa", rotulo: "Tirar a camisa", teste: { CALMA: 1 }, dif: 30, niveis: [
      e("Tirou a camisa e girou no ar. Amarelo, mas a foto é histórica.", -0.05, { amarelo: true, fama: 1, seguidores: 0.05, moral: 3 }),
      e("Camisa girando e amarelo.", -0.1, { amarelo: true, fama: 0.5, moral: 2 }),
      e("Amarelo por tirar a camisa.", -0.1, { amarelo: true, moral: 1 }),
      e("Amarelo. O técnico balançou a cabeça.", -0.15, { amarelo: true, relTecnico: -2 }),
      e("Amarelo bobo, e você já tinha um. O técnico não acreditou.", -0.2, { amarelo: true, relTecnico: -4 })] },
    { id: "banco", rotulo: "Correr para abraçar o banco", teste: { CARISMA: 0.5, PROF: 0.5 }, dif: -15, niveis: [
      e("Foi abraçar os reservas e o técnico. O grupo inteiro sentiu.", 0, { relTecnico: 4, moral: 4 }),
      e("Abraço coletivo com o banco.", 0, { relTecnico: 3, moral: 3 }), e("Abraço no banco.", 0, { relTecnico: 2, moral: 2 }),
      e("Abraço no banco.", 0, { relTecnico: 2, moral: 1 }), e("Abraço no banco.", 0, { relTecnico: 1, moral: 1 })] },
    { id: "escudo", rotulo: "Beijar o escudo", teste: { CARISMA: 1 }, dif: -10, niveis: [
      e("Beijou o escudo e a torcida cantou seu nome por cinco minutos.", 0, { fama: 0.8, moral: 4 }),
      e("Beijou o escudo. A torcida adorou.", 0, { fama: 0.4, moral: 3 }), e("Beijou o escudo.", 0, { fama: 0.2, moral: 2 }),
      e("Beijou o escudo. Nas redes, lembraram do clube em que você começou.", 0, { moral: 1 }), e("Beijou o escudo e alguém achou cedo demais para isso.", 0, { moral: 1 })] },
    { id: "assistente", rotulo: "Apontar para quem deu o passe", teste: { CARISMA: 0.5, PROF: 0.5 }, dif: -15, niveis: [
      e("Correu para o {meia} e apontou para ele. O vestiário inteiro respeitou.", 0, { relTecnico: 3, moral: 3 }),
      e("Dividiu o gol com o {meia}.", 0, { relTecnico: 2, moral: 2 }), e("Abraço com o {meia}.", 0, { relTecnico: 1, moral: 2 }),
      e("Abraço com o {meia}.", 0, { moral: 2 }), e("Abraço com o {meia}.", 0, { moral: 1 })] },
    { id: "assinatura", rotulo: "Inventar uma comemoração sua", teste: { CARISMA: 0.8, COM: 0.2 }, dif: 6, quando: (c) => !c.jaFezGol, niveis: [
      e("Uma comemoração nova, que ninguém tinha visto. Já tem criança imitando no recreio.", 0, { fama: 1.5, seguidores: 0.1, moral: 4, noticia: "A nova comemoração de {nome} pegou nas escolas." }),
      e("A comemoração chamou atenção. Pode virar sua marca.", 0, { fama: 0.8, seguidores: 0.05, moral: 3 }),
      e("Ninguém entendeu muito bem, mas foi divertido.", 0, { seguidores: 0.01, moral: 2 }),
      e("Saiu meio sem jeito.", 0, { moral: 1 }),
      e("Virou piada nos programas de humor.", 0, { seguidores: 0.02, moral: -2 })] },
  ],
};

/** Depois do apito final. Escolhida pelo resultado, pela nota e pelo que aconteceu no jogo. */
export const POS_JOGO: Situacao[] = [
  { id: "entrevistaVitoria", momento: "pos", titulo: ["Entrevista na saída do campo", "Microfone na sua frente"],
    texto: ["Vitória. O repórter te para na beira do gramado: \"o que deu certo hoje?\"", "O repórter da TV te pega antes do túnel: \"grande vitória, o que você diz para a torcida?\""],
    peso: (c) => (c.resultado === "v" ? 1.2 : 0), opcoes: [
      { id: "grupo", rotulo: "Dividir o mérito com o grupo", teste: { CARISMA: 0.5, PROF: 0.5 }, dif: -6, niveis: [
        e("Resposta de veterano. O técnico compartilhou o vídeo.", 0, { relTecnico: 3, fama: 0.3 }),
        e("\"É o grupo.\" Resposta segura.", 0, { relTecnico: 2 }), e("Resposta segura.", 0, { relTecnico: 1 }),
        e("Resposta morna, ninguém lembrou.", 0), e("Gaguejou um pouco.", 0)] },
      { id: "confiante", rotulo: "Falar com confiança do seu jogo", teste: { CARISMA: 0.7, COM: 0.3 }, dif: 6, niveis: [
        e("Frase de efeito que virou manchete. Confiança sem arrogância.", 0, { fama: 1, seguidores: 0.03 }),
        e("Falou bem, a torcida gostou.", 0, { fama: 0.5 }), e("Falou o básico.", 0),
        e("Pareceu se achar um pouco.", 0, { relTecnico: -1 }), e("A frase soou arrogante e foi parar nos programas de debate.", 0, { relTecnico: -2, fama: 0.4, noticia: "Declaração de {nome} depois da vitória repercute mal." })] },
      { id: "provocar", rotulo: "Mandar um recado para o rival", teste: { CALMA: 0.5, CARISMA: 0.5 }, dif: 12, niveis: [
        e("Recado bem-humorado. A torcida transformou em grito.", 0, { fama: 1.5, seguidores: 0.05 }),
        e("Recado dado. Polêmica leve.", 0, { fama: 0.8, noticia: "O recado de {nome} para o {adv} esquentou a semana." }),
        e("Polêmica. O clube pediu para você baixar o tom.", 0, { fama: 0.6, relTecnico: -2 }),
        e("A diretoria não gostou.", 0, { relTecnico: -3, fama: 0.3 }),
        e("A frase virou caso. O clube te multou.", 0, { relTecnico: -5, moral: -3, noticia: "{nome} é multado pelo clube por declaração depois do jogo." })] },
    ] },
  { id: "entrevistaDerrota", momento: "pos", titulo: ["Entrevista depois da derrota", "Cobrança na saída"],
    texto: ["Derrota. O repórter pergunta se o time está em crise.", "Saindo de campo, um repórter pergunta o que faltou hoje."],
    peso: (c) => (c.resultado === "d" ? 1.2 : 0), opcoes: [
      { id: "assumir", rotulo: "Assumir a responsabilidade", teste: { PROF: 0.6, CARISMA: 0.4 }, dif: 0, niveis: [
        e("\"A culpa é nossa, e eu começo por mim.\" Ganhou respeito no vestiário.", 0, { relTecnico: 3, moral: 2, fama: 0.3 }),
        e("Assumiu e prometeu reação.", 0, { relTecnico: 2 }), e("Resposta correta.", 0, { relTecnico: 1 }),
        e("Ficou repetitivo.", 0), e("Assumiu tanto que pareceu entregar o técnico.", 0, { relTecnico: -2 })] },
      { id: "juiz", rotulo: "Reclamar da arbitragem", teste: { CALMA: 0.6, CARISMA: 0.4 }, dif: 8, niveis: [
        e("Reclamação com argumentos. A torcida concordou.", 0, { fama: 0.4 }),
        e("Reclamou e a imprensa repercutiu.", 0, { fama: 0.2 }), e("Reclamou. Pouca gente ligou.", 0),
        e("Acharam desculpa.", 0, { relTecnico: -1 }), e("Falou demais e vai ser julgado no tribunal esportivo.", 0, { moral: -3, noticia: "{nome} é denunciado por críticas à arbitragem." })] },
      { id: "calar", rotulo: "Passar direto sem falar", teste: { CALMA: 1 }, dif: 0, niveis: [
        e("Passou direto. Ninguém estranhou num dia ruim.", 0), e("Passou direto.", 0), e("Passou direto.", 0),
        e("Acharam você mal-educado.", 0, { fama: -0.2 }), e("O vídeo de você ignorando o repórter rodou.", 0, { fama: -0.3, moral: -1 })] },
    ] },
  { id: "entrevistaEmpate", momento: "pos", titulo: "Entrevista depois do empate", texto: ["Empate. O repórter quer saber se o ponto foi bom.", "Empate amarrado. \"Faltou o quê?\", pergunta o repórter."],
    peso: (c) => (c.resultado === "e" ? 1 : 0), opcoes: [
      { id: "positivo", rotulo: "Ver o lado bom", teste: { CARISMA: 0.5, PROF: 0.5 }, dif: -4, niveis: [
        e("Resposta madura. O técnico gostou.", 0, { relTecnico: 2 }), e("\"Ponto fora de casa é ponto.\"", 0, { relTecnico: 1 }), e("Resposta padrão.", 0), e("Soou conformado.", 0, { fama: -0.1 }), e("A torcida achou que faltou vontade.", 0, { moral: -1 })] },
      { id: "cobrar", rotulo: "Cobrar mais do time", teste: { CARISMA: 0.6, CALMA: 0.4 }, dif: 8, niveis: [
        e("Cobrança na medida. Liderança.", 0, { relTecnico: 2, fama: 0.4 }), e("Cobrou, e a torcida gostou.", 0, { fama: 0.3 }), e("Cobrou.", 0),
        e("Alguns companheiros não gostaram de ler.", 0, { moral: -2 }), e("Pareceu crítica aos companheiros. Clima pesado no vestiário.", 0, { moral: -3, relTecnico: -2 })] },
    ] },
  { id: "camisa", momento: "pos", titulo: "Troca de camisa", texto: ["O {craque} vem te cumprimentar e pede sua camisa.", "No apito final, o {craque} te procura para trocar de camisa."],
    peso: (c) => 0.3 + (c.nota !== undefined && c.nota >= 7.5 ? 0.6 : 0), opcoes: [
      { id: "trocar", rotulo: "Trocar e conversar um pouco", teste: { CARISMA: 1 }, dif: -10, niveis: [
        e("Trocaram e conversaram. Ele disse que estava de olho em você. A foto rodou.", 0, { fama: 0.8, moral: 4, seguidores: 0.03 }),
        e("Trocaram camisas e um elogio.", 0, { fama: 0.4, moral: 3 }), e("Trocaram camisas.", 0, { moral: 2 }), e("Trocaram camisas.", 0, { moral: 1 }),
        e("A torcida não gostou de ver a troca depois da derrota.", 0, { moral: 1, fama: -0.1 })] },
      { id: "guardar", rotulo: "Guardar a sua para a família", teste: { PROF: 1 }, dif: -10, niveis: [
        e("Explicou e ele entendeu. Prometeu trocar no returno.", 0, { moral: 1 }), e("Ficou com a sua.", 0), e("Ficou com a sua.", 0), e("Ele achou estranho.", 0), e("Ele saiu de cara feia.", 0)] },
    ] },
  { id: "crianca", momento: "pos", titulo: "Um pequeno torcedor", texto: ["Um menino com a sua camisa chora na grade, pedindo um autógrafo.", "Uma criança com um cartaz \"me dá sua chuteira\" está na grade do {estadio}."],
    peso: (c) => 0.25 + c.fama / 200, opcoes: [
      { id: "dar", rotulo: "Dar a chuteira e tirar foto", teste: { CARISMA: 1 }, dif: -15, niveis: [
        e("O vídeo do menino recebendo a chuteira emocionou o país.", 0, { fama: 1.5, seguidores: 0.08, moral: 4, noticia: "{nome} dá a chuteira para um menino na grade; vídeo emociona." }),
        e("A foto com o menino rodou as redes.", 0, { fama: 0.8, seguidores: 0.04, moral: 3 }),
        e("O menino saiu sorrindo.", 0, { fama: 0.3, moral: 3 }), e("O menino saiu sorrindo.", 0, { moral: 2 }), e("O menino saiu sorrindo.", 0, { moral: 2 })] },
      { id: "autografo", rotulo: "Dar um autógrafo rápido", teste: { CARISMA: 1 }, dif: -15, niveis: [
        e("Autógrafo e um aceno. Simples.", 0, { moral: 1, fama: 0.2 }), e("Autógrafo.", 0, { moral: 1 }), e("Autógrafo.", 0, { moral: 1 }), e("Autógrafo.", 0), e("Autógrafo.", 0)] },
      { id: "passar", rotulo: "Passar direto, está cansado", teste: { CALMA: 1 }, dif: 0, niveis: [
        e("Ninguém reparou.", 0), e("Ninguém reparou.", 0), e("O menino ficou triste.", 0, { moral: -1 }),
        e("Alguém filmou o menino chorando enquanto você passava.", 0, { fama: -0.3, moral: -2 }), e("O vídeo viralizou contra você.", 0, { fama: -0.6, moral: -3, noticia: "Vídeo de {nome} ignorando criança na grade repercute mal." })] },
    ] },
  { id: "tecnicoConversa", momento: "pos", titulo: "Conversa com o técnico", texto: ["No vestiário, o técnico te chama num canto.", "Antes do banho, o técnico pede uma palavra com você."],
    peso: (c) => 0.3 + (c.nota !== undefined && (c.nota >= 7.8 || c.nota <= 5.4) ? 0.6 : 0), opcoes: [
      { id: "ouvir", rotulo: "Ouvir e pedir mais orientação", teste: { PROF: 0.7, CARISMA: 0.3 }, dif: -4, niveis: [
        e("Ele te passou três coisas para melhorar e disse que conta com você.", 0, { relTecnico: 4, moral: 3 }),
        e("Conversa boa. Ele gostou do interesse.", 0, { relTecnico: 3 }), e("Conversa rápida.", 0, { relTecnico: 1 }),
        e("Ele foi duro e você ficou mexido.", 0, { moral: -1, relTecnico: 1 }), e("Ele foi duro. Você engoliu seco.", 0, { moral: -2 })] },
      { id: "minutos", rotulo: "Pedir mais minutos", teste: { CARISMA: 0.6, CALMA: 0.4 }, dif: 8, niveis: [
        e("Ele respeitou a ambição e prometeu oportunidades.", 0, { relTecnico: 2, moral: 3 }),
        e("Ele disse que depende de você nos treinos.", 0, { relTecnico: 1 }), e("Ele desconversou.", 0),
        e("Ele achou que não era hora de pedir.", 0, { relTecnico: -2 }), e("A conversa azedou. Ele disse que quem escala é ele.", 0, { relTecnico: -5, moral: -3 })] },
    ] },
  { id: "imprensaExpulsao", momento: "pos", titulo: "A expulsão", texto: ["Os repórteres querem saber da sua expulsão.", "O assunto do pós-jogo é o seu cartão vermelho."],
    peso: (c) => (c.expulso ? 4 : 0), opcoes: [
      { id: "desculpa", rotulo: "Pedir desculpa ao time e à torcida", teste: { PROF: 0.6, CARISMA: 0.4 }, dif: -4, niveis: [
        e("O pedido de desculpa sincero acalmou a torcida e o técnico.", 0, { relTecnico: 4, moral: 2 }),
        e("Desculpas aceitas.", 0, { relTecnico: 3 }), e("Desculpas protocolares.", 0, { relTecnico: 1 }),
        e("Pareceram só palavras.", 0), e("Ninguém acreditou.", 0, { moral: -1 })] },
      { id: "injustica", rotulo: "Dizer que foi injusto", teste: { CALMA: 0.6, CARISMA: 0.4 }, dif: 10, niveis: [
        e("Mostrou o lance com argumentos. Muita gente concordou.", 0, { fama: 0.3 }),
        e("Reclamou e dividiu opiniões.", 0), e("Reclamou.", 0, { relTecnico: -1 }),
        e("O técnico disse em público que não foi injusto.", 0, { relTecnico: -3, moral: -2 }),
        e("A reclamação aumentou a punição no tribunal.", 0, { relTecnico: -3, moral: -3, noticia: "Declarações de {nome} após a expulsão pioram a situação no tribunal." })] },
    ] },
  { id: "festa", momento: "pos", titulo: "Convite para comemorar", texto: ["Os companheiros vão comemorar a vitória numa casa de festas hoje à noite.", "Vitória no clássico. O {comp} convida o grupo para uma festa."],
    peso: (c) => (c.resultado === "v" ? 0.35 + (c.classico ? 0.8 : 0) : 0), opcoes: [
      { id: "ir", rotulo: "Ir e voltar cedo", teste: { PROF: 0.7, CARISMA: 0.3 }, dif: 0, niveis: [
        e("Foi, se divertiu e voltou cedo. O grupo ficou mais unido.", 0, { moral: 4 }), e("Boa noite com o grupo.", 0, { moral: 3 }),
        e("Ficou mais do que devia, mas nada de mais.", 0, { moral: 2 }), e("Uma foto sua na festa apareceu nas redes.", 0, { moral: 2, fama: 0.2 }),
        e("Voltou de madrugada e a foto foi parar no perfil de fofoca.", 0, { moral: 1, relTecnico: -3, noticia: "{nome} é flagrado em festa de madrugada depois do jogo." })] },
      { id: "casa", rotulo: "Ir para casa descansar", teste: { PROF: 1 }, dif: -10, niveis: [
        e("Descansou. O preparador físico elogiou.", 0, { relTecnico: 1 }), e("Descansou.", 0), e("Descansou.", 0),
        e("O grupo achou você antissocial.", 0, { moral: -1 }), e("Ficou de fora das fotos do grupo.", 0, { moral: -1 })] },
    ] },
  { id: "marco", momento: "pos", titulo: "Jogo número {marco}", texto: ["Esse foi seu jogo de número {marco} como profissional. O clube preparou uma camisa comemorativa.", "{marco} jogos como profissional. Os companheiros fazem um corredor no vestiário."],
    peso: (c) => (!c.base && [50, 100, 150, 200, 250, 300, 350, 400, 450, 500].includes(c.jogosPro + 1) ? 30 : 0), opcoes: [
      { id: "familia", rotulo: "Dedicar à família", teste: { CARISMA: 1 }, dif: -20, niveis: [
        e("Ligou para a família ainda no vestiário. Foto com a camisa {marco} rodou as redes.", 0, { moral: 5, fama: 0.6, seguidores: 0.03 }), e("Dedicou à família.", 0, { moral: 4, fama: 0.3 }),
        e("Dedicou à família.", 0, { moral: 4 }), e("Dedicou à família.", 0, { moral: 3 }), e("Dedicou à família.", 0, { moral: 3 })] },
      { id: "grupo", rotulo: "Agradecer ao grupo", teste: { PROF: 0.5, CARISMA: 0.5 }, dif: -20, niveis: [
        e("Discurso curto no vestiário. O grupo aplaudiu de pé.", 0, { relTecnico: 4, moral: 4 }), e("Agradeceu ao grupo.", 0, { relTecnico: 3, moral: 3 }),
        e("Agradeceu ao grupo.", 0, { relTecnico: 2, moral: 2 }), e("Agradeceu ao grupo.", 0, { relTecnico: 2, moral: 2 }), e("Agradeceu ao grupo.", 0, { relTecnico: 1, moral: 2 })] },
    ] },
  { id: "aplausoRival", momento: "pos", titulo: "Aplausos da torcida rival", texto: ["Saindo de campo, a torcida do {adv} se levanta e aplaude você.", "Mesmo do outro lado, a arquibancada do {adv} grita seu nome."],
    peso: (c) => (c.fama >= 60 && !c.mandante && (c.nota ?? 0) >= 7.3 ? 1.5 : 0), opcoes: [
      { id: "agradecer", rotulo: "Agradecer com as mãos", teste: { CARISMA: 1 }, dif: -20, niveis: [
        e("Bateu palmas de volta. Imagem de respeito que rodou o país.", 0, { fama: 1.5, seguidores: 0.05, moral: 5 }), e("Agradeceu. Momento bonito.", 0, { fama: 0.8, moral: 4 }),
        e("Agradeceu.", 0, { fama: 0.5, moral: 3 }), e("Agradeceu. A sua torcida não gostou muito.", 0, { fama: 0.3, moral: 2 }), e("Agradeceu. A sua torcida não gostou muito.", 0, { moral: 1 })] },
      { id: "seguir", rotulo: "Seguir direto para o vestiário", teste: { PROF: 1 }, dif: -10, niveis: [
        e("Seguiu focado. Sua torcida gostou da lealdade.", 0, { moral: 2 }), e("Seguiu para o vestiário.", 0, { moral: 1 }), e("Seguiu para o vestiário.", 0), e("Seguiu para o vestiário.", 0), e("Seguiu para o vestiário.", 0)] },
    ] },
  { id: "sondagem", momento: "pos", titulo: ["Alguém quer falar com você", "Sondagem"],
    texto: ["Na saída do estádio, um homem de terno se apresenta como representante de um clube europeu.", "Um empresário que você nunca viu te espera no estacionamento: \"tem gente grande de olho em você\"."],
    peso: (c) => (c.fama >= 30 && c.idade <= 25 && !c.base ? 0.5 + ((c.nota ?? 0) >= 7.5 ? 0.6 : 0) : 0), opcoes: [
      { id: "ouvir", rotulo: "Ouvir a proposta", teste: { CALMA: 0.5, CARISMA: 0.5 }, dif: 0, niveis: [
        e("Conversa séria. Ele deixou um cartão e disse que vai acompanhar seus jogos.", 0, { moral: 4, fama: 0.4 }), e("Ouviu com atenção. Ficou animado.", 0, { moral: 3 }),
        e("Conversa vaga.", 0, { moral: 1 }), e("Um repórter viu a conversa.", 0, { relTecnico: -2, noticia: "{nome} é visto conversando com empresário europeu." }),
        e("A conversa vazou e a diretoria não gostou nada.", 0, { relTecnico: -4, moral: -1, noticia: "Diretoria do {meu} irritada com conversa de {nome} com empresário." })] },
      { id: "agente", rotulo: "Mandar falar com seu agente", teste: { PROF: 1 }, dif: -6, niveis: [
        e("Postura profissional. Ele saiu impressionado.", 0, { moral: 2, fama: 0.3 }), e("Encaminhou ao agente.", 0, { moral: 1 }), e("Encaminhou ao agente.", 0),
        e("Encaminhou ao agente.", 0), e("Ele achou que você estava se fazendo de difícil.", 0)] },
      { id: "recusar", rotulo: "Dizer que está feliz aqui", teste: { CARISMA: 0.5, PROF: 0.5 }, dif: -6, niveis: [
        e("A frase vazou e a torcida te tratou como ídolo na semana seguinte.", 0, { fama: 0.8, relTecnico: 2, moral: 3 }), e("Disse que está feliz no clube.", 0, { relTecnico: 1, moral: 2 }),
        e("Disse que está feliz no clube.", 0, { moral: 1 }), e("Ele riu e disse que volta no ano que vem.", 0), e("Ele riu e disse que volta no ano que vem.", 0)] },
    ] },
];
