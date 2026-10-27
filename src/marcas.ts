// Patrocinadores: marcas-paródia (nome e cores lembram a real; logo e slogan são nossos) e os contratos que oferecem.
// Uma marca por categoria (exclusividade), até quatro patrocinadores ao mesmo tempo.
import { RNG } from "./rng.js";

export type Categoria = "banco" | "refrigerante" | "cerveja" | "energetico" | "carro" | "celular" | "material" | "comida" | "oculos" | "relogio" | "fone" | "aerea";
/** Onde a marca é forte. Sem região: marca global, aparece em qualquer lugar. "EUR" vale para toda a Europa. */
export type Regiao = "BR" | "LATAM" | "EUR" | "ING" | "ESP" | "ITA" | "ALE" | "FRA" | "POR" | "HOL" | "TUR" | "EUA" | "GOLFO" | "ASIA" | "AFR";
/** O que a marca de acessório põe no jogador (aparece no visual enquanto o contrato durar). */
export type AcessorioMarca =
  | { tipo: "oculos"; modelo: "aviador" | "esportivo" | "quadrado"; armacao: string; lente: string }
  | { tipo: "relogio"; pulseira: string; mostrador: string }
  | { tipo: "fone"; cor: string; detalhe: string };
export type Simbolo = "aviao" | "onda" | "circulo" | "pera" | "coroa" | "guardaChuva" | "chama" | "raio" | "folha" | "gota" | "estrela" | "oval" | "escudo" | "pontos" | "batata" | "asa" | "balanca" | "quadrado" | "chifre" | "garra" | "engrenagem" | "letra";
export interface Marca {
  id: string; nome: string; categoria: Categoria; cores: [string, string, string]; simbolo: Simbolo; slogan: string;
  /** força da marca: quanto paga em relação às outras (0,5 a 2) */
  peso: number; famaMin: number;
  /** estilo da letra do logo */
  letra: "redonda" | "pesada" | "fina" | "italica";
  /** marcas de acessório só procuram quem já é muito seguido */
  seguidoresMin?: number; acessorio?: AcessorioMarca;
  /** onde a marca é forte (sem isso, é global) */
  regioes?: Regiao[];
  /** material esportivo: a chuteira da marca (cor do cabedal, detalhe e a cor da marca na lateral) */
  chuteira?: [string, string, string];
}

export const NOME_CATEGORIA: Record<Categoria, string> = {
  banco: "Banco", refrigerante: "Refrigerante", cerveja: "Cerveja", energetico: "Energético", carro: "Carro", celular: "Celular", material: "Material esportivo", comida: "Lanchonete", oculos: "Óculos", relogio: "Relógio", fone: "Fone de ouvido", aerea: "Companhia aérea",
};

export const MARCAS: Marca[] = [
  // bancos
  { id: "nobanco", nome: "Nobanco", categoria: "banco", cores: ["#820AD1", "#FFFFFF", "#C79BF2"], simbolo: "onda", slogan: "Sem tarifa, sem marcação.", peso: 1.2, famaMin: 25, regioes: ["BR"], letra: "redonda" },
  { id: "itao", nome: "Itaó", categoria: "banco", cores: ["#EC7000", "#003399", "#FFFFFF"], simbolo: "quadrado", slogan: "Feito pra quem decide o jogo.", peso: 1.4, famaMin: 40, regioes: ["BR"], letra: "pesada" },
  { id: "brodesco", nome: "Brodesco", categoria: "banco", cores: ["#CC092F", "#FFFFFF", "#7A0019"], simbolo: "folha", slogan: "Presença no seu campo.", peso: 1.3, famaMin: 35, regioes: ["BR"], letra: "fina" },
  { id: "caixinha", nome: "Caixinha Econômica", categoria: "banco", cores: ["#005CA9", "#F39200", "#FFFFFF"], simbolo: "letra", slogan: "Vale a pena torcer.", peso: 0.8, famaMin: 15, regioes: ["BR"], letra: "pesada" },
  { id: "bbr", nome: "Banco do Brasileiro", categoria: "banco", cores: ["#FCFC30", "#465EFF", "#FFFFFF"], simbolo: "pontos", slogan: "Todo brasileiro tem um craque na conta.", peso: 1.0, famaMin: 20, regioes: ["BR"], letra: "pesada" },
  // refrigerantes
  { id: "kokakolla", nome: "Koka-Kolla", categoria: "refrigerante", cores: ["#F40009", "#FFFFFF", "#8B0000"], simbolo: "gota", slogan: "Abra o placar.", peso: 1.8, famaMin: 55, letra: "italica" },
  { id: "gororo", nome: "Gororó Antártica", categoria: "refrigerante", cores: ["#00843D", "#E30613", "#FFFFFF"], simbolo: "folha", slogan: "O sabor da virada.", peso: 1.1, famaMin: 30, regioes: ["BR"], letra: "italica" },
  { id: "pepsy", nome: "Pepsy", categoria: "refrigerante", cores: ["#004B93", "#E32934", "#FFFFFF"], simbolo: "circulo", slogan: "Pede um no intervalo.", peso: 1.3, famaMin: 40, letra: "redonda" },
  // cervejas (só maiores de idade)
  { id: "skull", nome: "Skull", categoria: "cerveja", cores: ["#FFD200", "#E30613", "#1A1A1A"], simbolo: "raio", slogan: "Desce redondo, de bicicleta.", peso: 1.2, famaMin: 35, regioes: ["BR"], letra: "pesada" },
  { id: "brahmo", nome: "Brahmo", categoria: "cerveja", cores: ["#C8102E", "#FFFFFF", "#F2C200"], simbolo: "escudo", slogan: "A número 1 da arquibancada.", peso: 1.3, famaMin: 40, regioes: ["BR"], letra: "fina" },
  { id: "heinekao", nome: "Heinekão", categoria: "cerveja", cores: ["#00843D", "#FFFFFF", "#C8102E"], simbolo: "circulo", slogan: "Garrafa verde, camisa suada.", peso: 1.5, famaMin: 55, letra: "redonda" },
  // energéticos
  { id: "redboi", nome: "Red Boi", categoria: "energetico", cores: ["#1E2B5F", "#E1001A", "#F2C200"], simbolo: "chifre", slogan: "Te dá asas na pequena área.", peso: 1.4, famaMin: 45, letra: "pesada" },
  { id: "monstrao", nome: "Monstrão", categoria: "energetico", cores: ["#111111", "#7AC943", "#FFFFFF"], simbolo: "garra", slogan: "Libere a fera dos 90 minutos.", peso: 1.1, famaMin: 30, letra: "pesada" },
  // carros
  { id: "fordi", nome: "Fordi", categoria: "carro", cores: ["#003478", "#FFFFFF", "#9BB7D4"], simbolo: "oval", slogan: "Força para ir até o fim.", peso: 1.1, famaMin: 35, letra: "italica" },
  { id: "teslo", nome: "Teslo", categoria: "carro", cores: ["#111111", "#E82127", "#FFFFFF"], simbolo: "raio", slogan: "Aceleração de contra-ataque. Zero emissão.", peso: 1.7, famaMin: 65, letra: "fina" },
  { id: "toiota", nome: "Toiota", categoria: "carro", cores: ["#EB0A1E", "#FFFFFF", "#5A5A5A"], simbolo: "oval", slogan: "Resistência de volante.", peso: 1.3, famaMin: 45, letra: "fina" },
  { id: "fiato", nome: "Fiato", categoria: "carro", cores: ["#8E1B2E", "#FFFFFF", "#C0C0C0"], simbolo: "escudo", slogan: "O carro de quem começou de baixo.", peso: 0.7, famaMin: 15, regioes: ["BR", "LATAM"], letra: "pesada" },
  // celulares
  { id: "apel", nome: "Apel", categoria: "celular", cores: ["#F5F5F7", "#1D1D1F", "#86868B"], simbolo: "pera", slogan: "Pense diferente. Chute colocado.", peso: 2.0, famaMin: 75, letra: "fina" },
  { id: "samsong", nome: "Samsong", categoria: "celular", cores: ["#1428A0", "#FFFFFF", "#6E8BFF"], simbolo: "oval", slogan: "Câmera de 200 megapixels para o seu golaço.", peso: 1.5, famaMin: 50, letra: "fina" },
  { id: "xiaome", nome: "Xiaomé", categoria: "celular", cores: ["#FF6900", "#FFFFFF", "#1A1A1A"], simbolo: "quadrado", slogan: "Muito celular por pouco dinheiro.", peso: 0.9, famaMin: 25, letra: "redonda" },
  { id: "motorolo", nome: "Motorolo", categoria: "celular", cores: ["#001428", "#5BC2E7", "#FFFFFF"], simbolo: "asa", slogan: "Alô, alô, artilheiro.", peso: 0.8, famaMin: 15, regioes: ["BR", "LATAM"], letra: "redonda" },
  // material esportivo
  { id: "naiki", nome: "Naiki", categoria: "material", cores: ["#111111", "#FF5A1F", "#FFFFFF"], simbolo: "chama", slogan: "Só vai.", peso: 2.0, famaMin: 60, letra: "italica", chuteira: ["#FF5A1F", "#111111", "#FFFFFF"] },
  { id: "adidaz", nome: "Adidaz", categoria: "material", cores: ["#000000", "#FFFFFF", "#9A9A9A"], simbolo: "pontos", slogan: "Nada é impossível, nem de letra.", peso: 1.9, famaMin: 55, letra: "pesada", chuteira: ["#F4F4F2", "#111111", "#111111"] },
  { id: "pumba", nome: "Pumba", categoria: "material", cores: ["#000000", "#E4002B", "#FFFFFF"], simbolo: "raio", slogan: "Mais rápido que a zaga.", peso: 1.4, famaMin: 40, letra: "pesada", chuteira: ["#E4002B", "#111111", "#FFFFFF"] },
  { id: "novabalanca", nome: "Nova Balança", categoria: "material", cores: ["#CF0A2C", "#FFFFFF", "#2B2B2B"], simbolo: "balanca", slogan: "Equilíbrio de quem joga bonito.", peso: 1.3, famaMin: 35, regioes: ["ING", "EUA"], letra: "pesada", chuteira: ["#1C1C1C", "#CF0A2C", "#CF0A2C"] },
  { id: "mizumo", nome: "Mizumo", categoria: "material", cores: ["#001E62", "#FFFFFF", "#5B8BD6"], simbolo: "onda", slogan: "Chuteira de artesão.", peso: 1.0, famaMin: 20, regioes: ["ASIA", "BR"], letra: "fina", chuteira: ["#001E62", "#5B8BD6", "#FFFFFF"] },
  { id: "umbrela", nome: "Umbrela", categoria: "material", cores: ["#1A1A1A", "#FFFFFF", "#2E7D4F"], simbolo: "guardaChuva", slogan: "Faça chuva ou sol, faça gol.", peso: 0.8, famaMin: 10, regioes: ["BR", "ING"], letra: "pesada", chuteira: ["#F4F4F2", "#2E7D4F", "#1A1A1A"] },
  { id: "penalte", nome: "Penaltê", categoria: "material", cores: ["#FFFFFF", "#003DA5", "#F2C200"], simbolo: "estrela", slogan: "Na marca da cal.", peso: 0.6, famaMin: 0, regioes: ["BR"], letra: "italica", chuteira: ["#003DA5", "#F2C200", "#F2C200"] },
  // lanchonetes
  { id: "macdonaldo", nome: "MacDonaldo", categoria: "comida", cores: ["#DA291C", "#FFC72C", "#FFFFFF"], simbolo: "batata", slogan: "Amo muito tudo isso, menos perder.", peso: 1.5, famaMin: 50, letra: "redonda" },
  { id: "burguerrei", nome: "Burguer Rei", categoria: "comida", cores: ["#F5EBDC", "#D62300", "#502314"], simbolo: "coroa", slogan: "Rei da área, rei do lanche.", peso: 1.2, famaMin: 35, letra: "redonda" },
  // acessórios (só para quem é muito seguido; o produto aparece no visual)
  { id: "reiban", nome: "Rei-Ban", categoria: "oculos", cores: ["#B5121B", "#FFFFFF", "#1A1A1A"], simbolo: "letra", slogan: "Nunca escondeu o olhar do goleiro.", peso: 1.6, famaMin: 55, letra: "italica", seguidoresMin: 15e6, acessorio: { tipo: "oculos", modelo: "aviador", armacao: "#C9A24D", lente: "#2F4A36" } },
  { id: "ouclei", nome: "Ouclei", categoria: "oculos", cores: ["#111111", "#E8E8E8", "#1F6FB0"], simbolo: "oval", slogan: "Feito para o sol das três da tarde.", peso: 1.4, famaMin: 50, letra: "pesada", seguidoresMin: 8e6, acessorio: { tipo: "oculos", modelo: "esportivo", armacao: "#E8E8E8", lente: "#1F6FB0" } },
  { id: "chilibins", nome: "Chili Bins", categoria: "oculos", cores: ["#E30613", "#111111", "#FFFFFF"], simbolo: "chama", slogan: "Óculos com pimenta.", peso: 1.0, famaMin: 40, letra: "redonda", seguidoresMin: 3e6, acessorio: { tipo: "oculos", modelo: "quadrado", armacao: "#1A1A1A", lente: "#2A2A2A" } },
  { id: "rolecs", nome: "Rolécs", categoria: "relogio", cores: ["#006039", "#C9A24D", "#FFFFFF"], simbolo: "coroa", slogan: "Cada minuto conta. Principalmente os acréscimos.", peso: 2.0, famaMin: 75, letra: "fina", seguidoresMin: 40e6, acessorio: { tipo: "relogio", pulseira: "#C9A24D", mostrador: "#0F3D2A" } },
  { id: "taguer", nome: "Tague Roier", categoria: "relogio", cores: ["#111111", "#E30613", "#FFFFFF"], simbolo: "escudo", slogan: "Não ceda à pressão.", peso: 1.5, famaMin: 60, letra: "pesada", seguidoresMin: 15e6, acessorio: { tipo: "relogio", pulseira: "#B9BDC4", mostrador: "#1A1A1A" } },
  { id: "casiu", nome: "Casiu", categoria: "relogio", cores: ["#1A1A1A", "#6E8BFF", "#FFFFFF"], simbolo: "quadrado", slogan: "Aguenta tombo, aguenta carrinho.", peso: 0.9, famaMin: 40, letra: "pesada", seguidoresMin: 2e6, acessorio: { tipo: "relogio", pulseira: "#2B2B2B", mostrador: "#9FB7A0" } },
  { id: "bitz", nome: "Bitz", categoria: "fone", cores: ["#E30613", "#FFFFFF", "#111111"], simbolo: "circulo", slogan: "Entra em campo no seu ritmo.", peso: 1.5, famaMin: 55, letra: "redonda", seguidoresMin: 10e6, acessorio: { tipo: "fone", cor: "#F2F0EA", detalhe: "#E30613" } },
  { id: "jbla", nome: "JBLá", categoria: "fone", cores: ["#FF5A00", "#FFFFFF", "#1A1A1A"], simbolo: "pontos", slogan: "O som do vestiário.", peso: 1.0, famaMin: 40, letra: "pesada", seguidoresMin: 3e6, acessorio: { tipo: "fone", cor: "#1A1A1A", detalhe: "#FF5A00" } },
  { id: "habibao", nome: "Habibão", categoria: "comida", cores: ["#E30613", "#FFD200", "#FFFFFF"], simbolo: "engrenagem", slogan: "Esfiha de campeão.", peso: 0.7, famaMin: 15, regioes: ["BR"], letra: "pesada" },

  // ------------------------------------------------ marcas do mundo (pesam mais na região do clube)
  { id: "santandeiro", nome: "Santandeiro", categoria: "banco", cores: ["#EC0000", "#FFFFFF", "#7A0000"], simbolo: "chama", slogan: "Um banco que joga em casa e fora.", peso: 1.5, famaMin: 40, letra: "pesada", regioes: ["ESP", "ING", "BR", "LATAM"] },
  { id: "barcleis", nome: "Barcleis", categoria: "banco", cores: ["#00AEEF", "#FFFFFF", "#00395D"], simbolo: "asa", slogan: "A Premier do seu dinheiro.", peso: 1.6, famaMin: 45, letra: "fina", regioes: ["ING"] },
  { id: "bnpbola", nome: "BNP Paribola", categoria: "banco", cores: ["#00915A", "#FFFFFF", "#003D24"], simbolo: "estrela", slogan: "La banque du beau jeu.", peso: 1.4, famaMin: 40, letra: "fina", regioes: ["FRA"] },
  { id: "deutschebanco", nome: "Deutsche Banco", categoria: "banco", cores: ["#0018A8", "#FFFFFF", "#7A8CE0"], simbolo: "quadrado", slogan: "Disciplina tática também no extrato.", peso: 1.5, famaMin: 45, letra: "fina", regioes: ["ALE"] },
  { id: "unicredo", nome: "Unicredo", categoria: "banco", cores: ["#E2001A", "#FFFFFF", "#1A1A1A"], simbolo: "escudo", slogan: "Catenaccio contra os juros.", peso: 1.3, famaMin: 35, letra: "pesada", regioes: ["ITA"] },
  { id: "ingleao", nome: "ING Leão", categoria: "banco", cores: ["#FF6200", "#FFFFFF", "#000066"], simbolo: "garra", slogan: "Rugindo nas finanças.", peso: 1.2, famaMin: 30, letra: "pesada", regioes: ["HOL", "EUR"] },
  { id: "chaise", nome: "Chaise", categoria: "banco", cores: ["#117ACA", "#FFFFFF", "#0B3C66"], simbolo: "quadrado", slogan: "Seu dinheiro em boas mãos. E pés.", peso: 1.8, famaMin: 55, letra: "fina", regioes: ["EUA"] },
  { id: "emiratisnbd", nome: "Emiratis NBD", categoria: "banco", cores: ["#003C71", "#F7A800", "#FFFFFF"], simbolo: "onda", slogan: "Riqueza que atravessa o deserto.", peso: 2.0, famaMin: 45, letra: "fina", regioes: ["GOLFO"] },
  { id: "alrajhao", nome: "Al Rajhão", categoria: "banco", cores: ["#1F3B80", "#FFFFFF", "#C9A24D"], simbolo: "letra", slogan: "Confiança do Golfo ao mundo.", peso: 1.7, famaMin: 40, letra: "pesada", regioes: ["GOLFO"] },
  { id: "mercadopaguinho", nome: "Mercado Paguinho", categoria: "banco", cores: ["#00B1EA", "#FFFFFF", "#FFE600"], simbolo: "pontos", slogan: "Paga no Pix, cobra o pênalti.", peso: 1.1, famaMin: 25, letra: "redonda", regioes: ["BR", "LATAM"] },
  { id: "bancolombiano", nome: "Bancolombiano", categoria: "banco", cores: ["#FDDA24", "#2C2A29", "#FFFFFF"], simbolo: "letra", slogan: "Del barrio a la selección.", peso: 1.0, famaMin: 20, letra: "pesada", regioes: ["LATAM"] },

  { id: "irnbru", nome: "Irn Brú", categoria: "refrigerante", cores: ["#F47920", "#1E5AA8", "#FFFFFF"], simbolo: "raio", slogan: "Feito de ferro e de bolhas.", peso: 0.9, famaMin: 20, letra: "pesada", regioes: ["ING"] },
  { id: "fritzkolla", nome: "Fritz-Kolla", categoria: "refrigerante", cores: ["#111111", "#FFFFFF", "#E30613"], simbolo: "circulo", slogan: "Mais cafeína, menos sono no ônibus.", peso: 0.9, famaMin: 20, letra: "pesada", regioes: ["ALE"] },
  { id: "sanpellegrinho", nome: "San Pellegrinho", categoria: "refrigerante", cores: ["#E2001A", "#FFFFFF", "#0D4C9B"], simbolo: "estrela", slogan: "Elegância com gás.", peso: 1.2, famaMin: 35, letra: "fina", regioes: ["ITA", "EUR"] },
  { id: "oranjinha", nome: "Oranjinha", categoria: "refrigerante", cores: ["#FF7A00", "#0055A4", "#FFFFFF"], simbolo: "gota", slogan: "Secoue-moi, como num drible.", peso: 0.9, famaMin: 20, letra: "redonda", regioes: ["FRA"] },
  { id: "inkakolla", nome: "Inka Kolla", categoria: "refrigerante", cores: ["#FFD200", "#0033A0", "#E30613"], simbolo: "coroa", slogan: "Sabor que sobe a cordilheira.", peso: 0.8, famaMin: 15, letra: "italica", regioes: ["LATAM"] },
  { id: "vimtu", nome: "Vimtu", categoria: "refrigerante", cores: ["#0B6E3A", "#FFFFFF", "#F2C200"], simbolo: "folha", slogan: "O refresco do deserto.", peso: 1.0, famaMin: 20, letra: "redonda", regioes: ["GOLFO", "AFR"] },

  { id: "guinas", nome: "Guinas", categoria: "cerveja", cores: ["#111111", "#E6C870", "#FFFFFF"], simbolo: "escudo", slogan: "Escura como uma noite de quarta em Stoke.", peso: 1.4, famaMin: 40, letra: "fina", regioes: ["ING"] },
  { id: "paulander", nome: "Paulânder", categoria: "cerveja", cores: ["#003B7D", "#FFFFFF", "#C9A24D"], simbolo: "escudo", slogan: "O caneco da Oktoberfest e da taça.", peso: 1.2, famaMin: 30, letra: "fina", regioes: ["ALE"] },
  { id: "peronni", nome: "Peronni", categoria: "cerveja", cores: ["#00285E", "#FFFFFF", "#C8102E"], simbolo: "oval", slogan: "Gelada, à italiana.", peso: 1.2, famaMin: 30, letra: "italica", regioes: ["ITA"] },
  { id: "estreladama", nome: "Estrela Dama", categoria: "cerveja", cores: ["#E30613", "#F2C200", "#FFFFFF"], simbolo: "estrela", slogan: "Mediterrânea como um tiki-taka.", peso: 1.2, famaMin: 30, letra: "pesada", regioes: ["ESP"] },
  { id: "kronenburgo", nome: "Kronenburgo", categoria: "cerveja", cores: ["#C8102E", "#FFFFFF", "#0B2A5B"], simbolo: "coroa", slogan: "Desde a Alsácia até a Ligue 1.", peso: 1.1, famaMin: 30, letra: "fina", regioes: ["FRA"] },
  { id: "superboque", nome: "Super Boque", categoria: "cerveja", cores: ["#C8102E", "#F2C200", "#FFFFFF"], simbolo: "estrela", slogan: "Saúde, pá!", peso: 1.0, famaMin: 25, letra: "pesada", regioes: ["POR"] },
  { id: "budlait", nome: "Bud Lait", categoria: "cerveja", cores: ["#00468B", "#FFFFFF", "#C8102E"], simbolo: "escudo", slogan: "A do intervalo do Super Bowl.", peso: 1.5, famaMin: 40, letra: "pesada", regioes: ["EUA"] },
  { id: "coroninha", nome: "Coroninha", categoria: "cerveja", cores: ["#F2C200", "#0033A0", "#FFFFFF"], simbolo: "coroa", slogan: "Com limão, depois da vitória.", peso: 1.3, famaMin: 35, letra: "italica", regioes: ["LATAM", "EUA"] },
  { id: "quilmez", nome: "Quilmez", categoria: "cerveja", cores: ["#003DA5", "#FFFFFF", "#87CEEB"], simbolo: "escudo", slogan: "Sabor del encuentro.", peso: 1.0, famaMin: 25, letra: "pesada", regioes: ["LATAM"] },
  { id: "sapporinho", nome: "Sapporinho", categoria: "cerveja", cores: ["#C9A24D", "#111111", "#E30613"], simbolo: "estrela", slogan: "Uma estrela gelada do Japão.", peso: 1.1, famaMin: 30, letra: "fina", regioes: ["ASIA"] },

  { id: "praime", nome: "Praime", categoria: "energetico", cores: ["#5B2D90", "#00C2E0", "#FFFFFF"], simbolo: "raio", slogan: "Hidrata o hype.", peso: 1.4, famaMin: 40, letra: "pesada", regioes: ["EUA", "ING"] },
  { id: "celsiuz", nome: "Celsiuz", categoria: "energetico", cores: ["#111111", "#FF4F00", "#FFFFFF"], simbolo: "chama", slogan: "Queima tudo até o apito final.", peso: 1.1, famaMin: 30, letra: "italica", regioes: ["EUA"] },
  { id: "barn", nome: "Bärn", categoria: "energetico", cores: ["#111111", "#FF6A00", "#F2C200"], simbolo: "chama", slogan: "Combustível de prorrogação.", peso: 0.9, famaMin: 20, letra: "pesada", regioes: ["EUR", "ASIA"] },

  { id: "volksvagao", nome: "Volksvagão", categoria: "carro", cores: ["#001E50", "#FFFFFF", "#7A8CE0"], simbolo: "circulo", slogan: "O carro do povo, e da torcida.", peso: 1.3, famaMin: 35, letra: "fina", regioes: ["ALE", "EUR", "BR"] },
  { id: "bmv", nome: "BMV", categoria: "carro", cores: ["#0066B1", "#FFFFFF", "#111111"], simbolo: "circulo", slogan: "Prazer de dirigir, prazer de golear.", peso: 1.7, famaMin: 55, letra: "fina", regioes: ["ALE", "EUR", "GOLFO"] },
  { id: "mercedez", nome: "Mercedez", categoria: "carro", cores: ["#111111", "#C0C0C0", "#FFFFFF"], simbolo: "estrela", slogan: "O melhor, ou nada. Como você no clássico.", peso: 1.8, famaMin: 60, letra: "fina", regioes: ["ALE", "EUR", "GOLFO", "EUA"] },
  { id: "audy", nome: "Audy", categoria: "carro", cores: ["#111111", "#C0C0C0", "#BB0A30"], simbolo: "pontos", slogan: "Vorsprung no contra-ataque.", peso: 1.6, famaMin: 50, letra: "fina", regioes: ["ALE", "ESP", "EUR"] },
  { id: "peujo", nome: "Peujô", categoria: "carro", cores: ["#00205B", "#FFFFFF", "#9BB7D4"], simbolo: "garra", slogan: "Motion & émotion na Ligue 1.", peso: 1.2, famaMin: 30, letra: "pesada", regioes: ["FRA"] },
  { id: "reno", nome: "Renô", categoria: "carro", cores: ["#FFCC33", "#111111", "#FFFFFF"], simbolo: "quadrado", slogan: "Passion pour le football.", peso: 1.1, famaMin: 25, letra: "pesada", regioes: ["FRA", "BR"] },
  { id: "ferrari", nome: "Ferrarri", categoria: "carro", cores: ["#DC0000", "#FFF200", "#111111"], simbolo: "escudo", slogan: "Para quem chega antes da zaga.", peso: 2.0, famaMin: 80, letra: "italica", regioes: ["ITA", "GOLFO"] },
  { id: "cupra", nome: "Cuprá", categoria: "carro", cores: ["#1D1D1B", "#C68C5C", "#FFFFFF"], simbolo: "chifre", slogan: "Rebelde como um drible de letra.", peso: 1.2, famaMin: 35, letra: "fina", regioes: ["ESP"] },
  { id: "chevrole", nome: "Chevrolé", categoria: "carro", cores: ["#C9A24D", "#111111", "#FFFFFF"], simbolo: "escudo", slogan: "Força que acompanha a torcida.", peso: 1.2, famaMin: 30, letra: "pesada", regioes: ["EUA", "BR", "LATAM"] },
  { id: "hyundai", nome: "Hiundái", categoria: "carro", cores: ["#002C5F", "#FFFFFF", "#AACAE6"], simbolo: "oval", slogan: "Novo pensamento, novo artilheiro.", peso: 1.3, famaMin: 35, letra: "italica", regioes: ["ASIA"] },

  { id: "huawey", nome: "Huawey", categoria: "celular", cores: ["#CF0A2C", "#FFFFFF", "#1A1A1A"], simbolo: "folha", slogan: "Lente de Leica, olho de artilheiro.", peso: 1.2, famaMin: 35, letra: "fina", regioes: ["ASIA", "GOLFO", "EUR"] },
  { id: "oppo", nome: "Oppó", categoria: "celular", cores: ["#046A38", "#FFFFFF", "#7BC79A"], simbolo: "oval", slogan: "Inspiração em cada lance.", peso: 1.1, famaMin: 30, letra: "redonda", regioes: ["ASIA", "EUR"] },
  { id: "nokya", nome: "Nokya", categoria: "celular", cores: ["#124191", "#FFFFFF", "#7A8CE0"], simbolo: "quadrado", slogan: "Indestrutível como zagueiro raiz.", peso: 0.8, famaMin: 15, letra: "pesada", regioes: ["EUR"] },

  { id: "kapa", nome: "Kapa", categoria: "material", cores: ["#111111", "#FFFFFF", "#9A9A9A"], simbolo: "pontos", slogan: "Costas com costas, lado a lado.", peso: 1.0, famaMin: 20, letra: "pesada", regioes: ["ITA", "EUR"], chuteira: ["#F4F4F2", "#111111", "#111111"] },
  { id: "macrao", nome: "Macrão", categoria: "material", cores: ["#00205B", "#FFFFFF", "#9BB7D4"], simbolo: "escudo", slogan: "Fatto in Italia, suado no gramado.", peso: 0.9, famaMin: 15, letra: "fina", regioes: ["ITA", "EUR"], chuteira: ["#00205B", "#FFFFFF", "#FFFFFF"] },
  { id: "jomma", nome: "Jomma", categoria: "material", cores: ["#003DA5", "#FFFFFF", "#E30613"], simbolo: "letra", slogan: "Hecho en Toledo, jogado no mundo.", peso: 0.9, famaMin: 15, letra: "pesada", regioes: ["ESP", "LATAM"], chuteira: ["#F4F4F2", "#003DA5", "#003DA5"] },
  { id: "hummel", nome: "Hümmel", categoria: "material", cores: ["#E30613", "#FFFFFF", "#111111"], simbolo: "asa", slogan: "Divas e chevrons desde sempre.", peso: 0.9, famaMin: 15, letra: "fina", regioes: ["EUR", "ALE"], chuteira: ["#E30613", "#FFFFFF", "#FFFFFF"] },
  { id: "underarmadura", nome: "Under Armadura", categoria: "material", cores: ["#1D1D1D", "#E30613", "#FFFFFF"], simbolo: "letra", slogan: "Proteja a sua casa. E a área.", peso: 1.3, famaMin: 35, letra: "pesada", regioes: ["EUA"], chuteira: ["#1D1D1D", "#E30613", "#E30613"] },
  { id: "legalo", nome: "Le Galô", categoria: "material", cores: ["#002395", "#FFFFFF", "#ED2939"], simbolo: "garra", slogan: "Le coq chante, o gol sai.", peso: 1.0, famaMin: 20, letra: "italica", regioes: ["FRA"], chuteira: ["#F4F4F2", "#002395", "#ED2939"] },
  { id: "asix", nome: "Asix", categoria: "material", cores: ["#1A3D8F", "#FFFFFF", "#E30613"], simbolo: "onda", slogan: "Mente sã em corpo são, e chuteira leve.", peso: 1.1, famaMin: 25, letra: "italica", regioes: ["ASIA", "EUR"], chuteira: ["#F4F4F2", "#1A3D8F", "#E30613"] },

  { id: "kentucky", nome: "Kentucky Frangão", categoria: "comida", cores: ["#E4002B", "#FFFFFF", "#1A1A1A"], simbolo: "batata", slogan: "De lamber os dedos e a canela.", peso: 1.3, famaMin: 35, letra: "pesada", regioes: ["EUA", "ING", "ASIA", "GOLFO"] },
  { id: "subuei", nome: "Subuei", categoria: "comida", cores: ["#008C15", "#FFC600", "#FFFFFF"], simbolo: "folha", slogan: "Monte o seu sanduíche, monte a jogada.", peso: 1.0, famaMin: 25, letra: "pesada" },
  { id: "nandus", nome: "Nandu's", categoria: "comida", cores: ["#E2231A", "#111111", "#FFFFFF"], simbolo: "chama", slogan: "Frango no ponto, picante na área.", peso: 1.1, famaMin: 30, letra: "italica", regioes: ["ING", "AFR"] },
  { id: "albaique", nome: "Al Baique", categoria: "comida", cores: ["#E30613", "#FFFFFF", "#F2C200"], simbolo: "coroa", slogan: "A fila mais famosa do Golfo.", peso: 1.1, famaMin: 25, letra: "pesada", regioes: ["GOLFO"] },
  { id: "tacosino", nome: "Taco Sino", categoria: "comida", cores: ["#702082", "#FFFFFF", "#F2C200"], simbolo: "estrela", slogan: "Pense fora do pão.", peso: 1.0, famaMin: 25, letra: "redonda", regioes: ["EUA", "LATAM"] },
  { id: "pizzarut", nome: "Pizza Rut", categoria: "comida", cores: ["#EE3A43", "#FFFFFF", "#111111"], simbolo: "circulo", slogan: "Fatia de campeão no fim de semana.", peso: 1.0, famaMin: 25, letra: "italica", regioes: ["EUA", "EUR", "GOLFO"] },

  { id: "katarair", nome: "Katar Airways", categoria: "aerea", cores: ["#5C0632", "#FFFFFF", "#9E9E9E"], simbolo: "aviao", slogan: "Voando juntos, da Champions à Copa.", peso: 2.0, famaMin: 55, letra: "fina", regioes: ["GOLFO", "EUR"] },
  { id: "emiratez", nome: "Fly Emiratez", categoria: "aerea", cores: ["#D71921", "#FFFFFF", "#C9A24D"], simbolo: "aviao", slogan: "Hello Tomorrow, alô artilheiro.", peso: 2.0, famaMin: 55, letra: "italica", regioes: ["GOLFO", "ING", "ESP", "ITA", "FRA"] },
  { id: "etihade", nome: "Etihade", categoria: "aerea", cores: ["#BD8B13", "#111111", "#FFFFFF"], simbolo: "aviao", slogan: "De Abu Dhabi para o mundo.", peso: 1.8, famaMin: 45, letra: "fina", regioes: ["GOLFO", "ING"] },
  { id: "saudita", nome: "Saudita Air", categoria: "aerea", cores: ["#006C35", "#FFFFFF", "#7FB5A0"], simbolo: "aviao", slogan: "Asas do Reino.", peso: 1.5, famaMin: 30, letra: "pesada", regioes: ["GOLFO"] },
  { id: "turquinha", nome: "Turquinha Airlines", categoria: "aerea", cores: ["#C8102E", "#FFFFFF", "#1A1A1A"], simbolo: "aviao", slogan: "Mais países que a Champions.", peso: 1.5, famaMin: 40, letra: "fina", regioes: ["TUR", "EUR"] },
  { id: "lufthanza", nome: "Lufthanza", categoria: "aerea", cores: ["#05164D", "#F9BA00", "#FFFFFF"], simbolo: "aviao", slogan: "Pontualidade alemã até no gol.", peso: 1.5, famaMin: 40, letra: "fina", regioes: ["ALE"] },
  { id: "iberica", nome: "Ibérica Air", categoria: "aerea", cores: ["#D7192D", "#FFCC00", "#FFFFFF"], simbolo: "aviao", slogan: "Da Espanha para o mundo, en primera.", peso: 1.3, famaMin: 35, letra: "italica", regioes: ["ESP", "LATAM"] },
  { id: "airfranca", nome: "Air Françá", categoria: "aerea", cores: ["#002157", "#FFFFFF", "#E1001A"], simbolo: "aviao", slogan: "Faire du ciel le plus bel endroit.", peso: 1.4, famaMin: 35, letra: "fina", regioes: ["FRA"] },
  { id: "britair", nome: "Brit Airways", categoria: "aerea", cores: ["#075AAA", "#FFFFFF", "#EB2226"], simbolo: "aviao", slogan: "To fly, to serve, to score.", peso: 1.5, famaMin: 40, letra: "fina", regioes: ["ING"] },
  { id: "tapa", nome: "TAPa", categoria: "aerea", cores: ["#00A651", "#E30613", "#FFFFFF"], simbolo: "aviao", slogan: "Lisboa, Brasil e o mundo, ó pá.", peso: 1.1, famaMin: 25, letra: "pesada", regioes: ["POR", "BR"] },
  { id: "latao", nome: "Latão", categoria: "aerea", cores: ["#1B0088", "#E8114B", "#FFFFFF"], simbolo: "aviao", slogan: "Voa com a seleção desde sempre.", peso: 1.2, famaMin: 30, letra: "pesada", regioes: ["BR", "LATAM"] },
  { id: "azulzinha", nome: "Azulzinha", categoria: "aerea", cores: ["#00205B", "#4FC3F7", "#FFFFFF"], simbolo: "aviao", slogan: "Voa pro interior, voa pro gol.", peso: 1.0, famaMin: 20, letra: "redonda", regioes: ["BR"] },
  { id: "deltta", nome: "Deltta", categoria: "aerea", cores: ["#003366", "#C8102E", "#FFFFFF"], simbolo: "aviao", slogan: "Keep climbing, keep scoring.", peso: 1.5, famaMin: 40, letra: "fina", regioes: ["EUA"] },
  { id: "avianka", nome: "Avianka", categoria: "aerea", cores: ["#E30613", "#FFFFFF", "#1A1A1A"], simbolo: "aviao", slogan: "Las alas de la región.", peso: 1.0, famaMin: 20, letra: "redonda", regioes: ["LATAM"] },
  { id: "rdutch", nome: "KLMm", categoria: "aerea", cores: ["#00A1DE", "#FFFFFF", "#003145"], simbolo: "aviao", slogan: "Real, holandesa e no horário.", peso: 1.3, famaMin: 35, letra: "fina", regioes: ["HOL"] },
];
export const MARCA: Record<string, Marca> = Object.fromEntries(MARCAS.map((m) => [m.id, m]));

// ------------------------------------------------------------------ contratos
export type TipoContrato = "fixo" | "desempenho" | "longo";
export const NOME_CONTRATO: Record<TipoContrato, { nome: string; texto: string }> = {
  fixo: { nome: "Valor fixo", texto: "O mesmo valor todo mês, jogue bem ou mal." },
  desempenho: { nome: "Por desempenho", texto: "Fixo menor e bônus por gol, assistência e nota alta." },
  longo: { nome: "Longo prazo", texto: "Menos por mês, mas por muitos anos, com luvas na assinatura." },
};
export interface OfertaPatrocinio { tipo: TipoContrato; mensal: number; meses: number; luvas: number; bonusGol: number; bonusAssist: number; bonusNota: number }
export interface ContratoPatrocinio extends OfertaPatrocinio { marca: string; restantes: number; desde: number }
export interface PropostaPatrocinio { marca: string; opcoes: OfertaPatrocinio[]; expira: number }

/** Quanto a imagem do jogador vale por mês para uma marca de peso 1 (R$). */
export const valorDeImagem = (fama: number, seguidores: number) => 1500 * Math.exp(fama / 14) * (0.8 + 0.1 * Math.log10(Math.max(1e3, seguidores) / 1e3));

const redondo = (v: number) => (v >= 1e5 ? Math.round(v / 1e4) * 1e4 : v >= 1e4 ? Math.round(v / 1e3) * 1e3 : Math.round(v / 100) * 100);
export function ofertasDaMarca(rng: RNG, m: Marca, fama: number, seguidores: number): OfertaPatrocinio[] {
  const v = valorDeImagem(fama, seguidores) * m.peso * rng.range(0.85, 1.15);
  return [
    { tipo: "fixo", mensal: redondo(v), meses: rng.pick([12, 18, 24]), luvas: 0, bonusGol: 0, bonusAssist: 0, bonusNota: 0 },
    { tipo: "desempenho", mensal: redondo(v * 0.45), meses: 12, luvas: 0, bonusGol: redondo(v * 0.16), bonusAssist: redondo(v * 0.08), bonusNota: redondo(v * 0.1) },
    { tipo: "longo", mensal: redondo(v * 0.75), meses: rng.pick([36, 48]), luvas: redondo(v * 2), bonusGol: 0, bonusAssist: 0, bonusNota: 0 },
  ];
}

/** Uma marca interessada (de categoria livre, que caiba na fama e na idade do jogador). */
const REGIAO_PAIS: Record<string, Regiao> = {
  BRA: "BR", ARG: "LATAM", URU: "LATAM", COL: "LATAM", CHI: "LATAM", MEX: "LATAM", PER: "LATAM", ECU: "LATAM", PAR: "LATAM", BOL: "LATAM", VEN: "LATAM", CRC: "LATAM",
  ENG: "ING", SCO: "ING", WAL: "ING", IRL: "ING", NIR: "ING", ESP: "ESP", ITA: "ITA", GER: "ALE", AUT: "ALE", SUI: "ALE", FRA: "FRA", BEL: "FRA", POR: "POR", NED: "HOL", TUR: "TUR",
  USA: "EUA", CAN: "EUA", KSA: "GOLFO", UAE: "GOLFO", QAT: "GOLFO", KUW: "GOLFO", BHR: "GOLFO", OMA: "GOLFO", JPN: "ASIA", KOR: "ASIA", CHN: "ASIA", THA: "ASIA", AUS: "ASIA",
  MAR: "AFR", EGY: "AFR", NGA: "AFR", SEN: "AFR", RSA: "AFR", GHA: "AFR", CIV: "AFR", ALG: "AFR", TUN: "AFR",
};
const EUROPA: Regiao[] = ["EUR", "ING", "ESP", "ITA", "ALE", "FRA", "POR", "HOL", "TUR"];
/** Região de um país (código de 3 letras); fora da tabela, Europa genérica. */
export const regiaoDoPais = (pais: string | undefined): Regiao => REGIAO_PAIS[pais ?? ""] ?? "EUR";
/** A marca é forte nessa região? */
function forteEm(m: Marca, r: Regiao): boolean {
  if (!m.regioes) return false;
  return m.regioes.includes(r) || (m.regioes.includes("EUR") && EUROPA.includes(r));
}
/** Uma marca interessada (de categoria livre, que caiba na fama e na idade do jogador). As marcas da região do clube
 *  pesam muito mais; as do país do jogador aparecem quando ele já é conhecido; as de outro canto do mundo, quase nunca. */
export function marcaInteressada(rng: RNG, fama: number, idade: number, ativos: ContratoPatrocinio[], recusadas: string[], seguidores = 0, paisClube?: string, paisJogador?: string): Marca | undefined {
  const ocupadas = new Set(ativos.map((c) => MARCA[c.marca]?.categoria));
  const regiao = regiaoDoPais(paisClube ?? "BRA"), casa = paisJogador ? regiaoDoPais(paisJogador) : regiao;
  const pool = MARCAS.filter((m) => !ocupadas.has(m.categoria) && fama >= m.famaMin && seguidores >= (m.seguidoresMin ?? 0) && (m.categoria !== "cerveja" || (idade >= 18 && regiao !== "GOLFO")) && !recusadas.includes(m.id));
  if (!pool.length) return undefined;
  // marca grande tem preferência quando o jogador já é grande; a região decide quem bate na porta
  const fatorRegiao = (m: Marca) => !m.regioes ? 1 : forteEm(m, regiao) ? 4 : forteEm(m, casa) && fama >= 45 ? 1.2 : 0.04;
  const pesos = pool.map((m) => (1 + (fama - m.famaMin) / 40 + m.peso) * fatorRegiao(m));
  let x = rng.next() * pesos.reduce((a, b) => a + b, 0);
  for (let i = 0; i < pool.length; i++) { x -= pesos[i]; if (x <= 0) return pool[i]; }
  return pool[pool.length - 1];
}

/** Acessórios que o jogador está usando por contrato (um por tipo). */
export function acessoriosAtivos(ativos: ContratoPatrocinio[] | undefined): Partial<Record<AcessorioMarca["tipo"], AcessorioMarca>> {
  const out: Partial<Record<AcessorioMarca["tipo"], AcessorioMarca>> = {};
  for (const k of ativos ?? []) { const a = MARCA[k.marca]?.acessorio; if (a) out[a.tipo] = a; }
  return out;
}

/** Roupa de patrocinador fora de campo: boné (energético, senão material esportivo) e blusão (material, senão energético). */
export function roupasPatro(ativos: ContratoPatrocinio[] | undefined): { bone?: Marca; blusao?: Marca } {
  const ms = (ativos ?? []).map((k) => MARCA[k.marca]).filter(Boolean) as Marca[];
  const mat = ms.find((m) => m.categoria === "material"), ene = ms.find((m) => m.categoria === "energetico");
  return { bone: ene ?? mat, blusao: mat ?? ene };
}
/** Bônus do mês de um contrato por desempenho. */
export const bonusDoMes = (c: ContratoPatrocinio, mes: { gols: number; assist: number; notas8: number }) => c.bonusGol * mes.gols + c.bonusAssist * mes.assist + c.bonusNota * mes.notas8;
