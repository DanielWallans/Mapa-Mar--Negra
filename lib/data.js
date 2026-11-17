/* ============================================================
   DADOS: atualizar a cada dia concluído.
   DIAS_CONCLUIDOS = quantos dias já têm diário.
   ============================================================ */
const DIAS_CONCLUIDOS = 16;

const ILHAS = [
  { id: 1, nome: "Porto das Variáveis", dias: [1, 7], chefe: "Kraken da Divisão Inteira" },
  { id: 2, nome: "Fazenda dos Laços", dias: [8, 14], chefe: "Espantalho do Índice Zero" },
  { id: 3, nome: "Reino dos Objetos", dias: [15, 21], chefe: "Rei sem Construtor" },
  { id: 4, nome: "Castelo do Vulcão", dias: [22, 30], chefe: "Dragão NullPointer" },
];

const PREVISTO = {
  12: "HashMap: o mapa de chave e valor", 13: "Revisão da Ilha 2", 14: "Chefe: o Espantalho do Índice Zero",
  15: "Classes e objetos", 16: "Construtores", 17: "Encapsulamento", 18: "Herança", 19: "Polimorfismo",
  20: "Interfaces", 21: "Chefe: o Rei sem Construtor", 22: "Exceções", 23: "try / catch", 24: "Ler e salvar arquivos",
  25: "Testes com JUnit", 26: "Git", 27: "GitHub", 28: "Projeto final", 29: "Polimento", 30: "Chefe final: o Dragão NullPointer",
};

const DIARIO = {
  1: {
    titulo: "Olá, mundo",
    texto: [
      "Ele chegou com um pedido ambicioso: Java do zero, 30 dias, 20 minutos por dia, explicado como para alguém de 15 anos. Detalhe: ele já tinha um sistema em Java. Resolveu voltar ao começo para aprender a base de verdade.",
      "Antes do primeiro código, uma guerra: o computador tinha vários Javas instalados, e o velho Java 8 estava na frente do JDK 21. Colocamos o JDK 21 no topo do PATH. Depois, o primeiro programa. Ele usou print em vez de println, e o currículo inteiro saiu numa linha só, sem respirar.",
    ],
    citacao: "Ok, foi fácil, gostei.",
    codigo: `public class main {
    static void main(String[] args) {
        System.out.print("Ola meu nome e Daniel Wallans");
        System.out.print("Hoje começo estudar Java de novo do Zero");
        System.out.print("tenho 26 anos ");
    }
}`,
    aprendi: ["class é a caixa onde o código mora; main é a porta de entrada", "println pula linha, print não", "o ponto e vírgula é o ponto final do Java", "JDK cria, JRE executa, JVM roda o bytecode"],
  },
  2: {
    titulo: "O dia em que a matemática processou o capitão",
    texto: [
      "Variável é uma caixa com etiqueta. Simples, até o desafio. Ele perguntou para que servia o asterisco. Calculou 365 vezes 26 e chamou de semanas (eram dias). Fez 1750 vezes 12 de cabeça e chegou em 2.100 (eram 21.000).",
      "E então a peça central: para saber quanto faltava até os 60 anos, escreveu idade menos 60. O resultado foi menos 34. O capitão ia se aposentar antes de nascer. Nascia ali o primeiro monstro do jogo.",
    ],
    codigo: `int idadeemdias = idade * 365;
int idadeemhoras = idadeemdias * 24;
int SalarioAnual = salario * 12;

int AnosAteo60 = 60 - 26;   // antes: idade - 60 = -34

System.out.println(10 / 3);     // 3
System.out.println(10.0 / 3);   // 3.333...`,
    aprendi: ["int, double, String, boolean, char", "% é o resto da divisão, não porcentagem", "10 / 3 = 3: inteiro com inteiro corta os decimais", "na subtração, a ordem importa"],
    monstro: { nome: "Fantasma do -34", desc: "Nasce quando a ordem da subtração se inverte: idade - 60 em vez de 60 - idade." },
  },
  3: {
    titulo: "O usuário é o inimigo",
    texto: [
      "Com o Scanner, o programa conversou com um humano pela primeira vez. E o humano estragou tudo: tentou subtrair um texto de um número, e depois digitou uma letra onde o programa esperava um número.",
      "Primeira lição de segurança da viagem: nunca confie no que o usuário digita.",
    ],
    codigo: `Scanner teclado = new Scanner(System.in);

System.out.print("Qual o seu nome: ");
String MeuNome = teclado.nextLine();

System.out.print("Qual ano voce nasceu?: ");
int AnoDeNacimento = teclado.nextInt();

int diminua = 2026 - AnoDeNacimento;`,
    aprendi: ["nextLine lê texto, nextInt lê inteiro, nextDouble lê decimal", "para fazer conta, a variável tem que ser número", "no stack trace, leio a 1ª linha e procuro o meu arquivo"],
    monstro: { nome: "InputMismatchException", desc: "Aparece quando alguém digita uma letra num nextInt." },
  },
  4: {
    titulo: "O interrogatório",
    texto: [
      "Uma hora e meia. Ele pediu desafios bons e perguntas. Tirou 9,5 de 10 na revisão de memória e 6 de 6 na caça ao bug. Depois criou uma variável chamada SeFor, achando que o \"se\" do português era uma variável.",
      "De madrugada vieram a loja e o caixa eletrônico. O desconto de 20% virou 20 reais. O caixa usava a condição do saque válido para dizer que era inválido. A técnica que salvou o caso: simular linha por linha, com números de verdade.",
    ],
    codigo: `if (Saque <= 0) {
    System.out.println(" Saldo Invalido ! ");
} else if (Saque > Saldo) {
    System.out.println(" Saldo Insuficiente ");
} else {
    Saldo = Saldo - Saque;
    System.out.println(" === Novo saldo : R$ " + Saldo);
}`,
    aprendi: ["= guarda, == compara", "&& é E, || é OU", "o Java para no primeiro if verdadeiro", "uma decisão com várias saídas é uma corrente só", "dinheiro de verdade usa BigDecimal"],
    monstro: { nome: "Sombra da Recuperação", desc: "Um else if com a mesma pergunta do if. Ele nunca roda." },
  },
  5: {
    titulo: "É um menu? Switch",
    texto: [
      "Sábado à noite. Ele escolheu ser um pirata trapaceiro, como um certo capitão de cinema. E criou sozinho a regra que vai levar para a vida: é um menu, switch; é uma comparação, if.",
      "No mesmo dia nasceu o Maré Negra: a taverna, os Corsários da Realeza, as ilhas, os dados. E a melhor regra do jogo: os bugs viram monstros.",
    ],
    citacao: "Além do horizonte negro, reinos caem, bestas ancestrais despertam e os mortos se recusam a permanecer sob o mar.",
    codigo: `String nomeDia = switch (numeroDia) {
    case 1 -> "Domingo";
    case 2 -> "Segunda-Feira";
    case 7 -> "Sabado";
    default -> "Opção Invalida";
};
if (numeroDia >= 1 && numeroDia <= 7) {
    System.out.println("Voce Escolheu " + nomeDia);
}`,
    aprendi: ["switch com ->, e default para o que sobrou", "um switch pode devolver um valor", "nunca compare String com int"],
  },
  6: {
    titulo: "As voltas que o código dá",
    texto: [
      "Domingo, dois dias numa sessão. O while era um if que repete. Ele apagou a linha que diminuía o ouro e conheceu o loop infinito. Depois usou a mesma caixa para contar as voltas do for e guardar o número do dado: o d6 caiu 1, 2, 3, 4, 5, 6, em ordem.",
      "No jogo, a taverna ganhou um loop: o jogador fica até escolher zarpar. Ao zarpar, um d6 decide o mar. E ele perguntou se o jogo só acabava no zarpar por causa do while. Era isso. Entendeu o while olhando o próprio jogo.",
    ],
    codigo: `int resultadoD20 = dado.nextInt(20) + 1;
if (resultadoD20 == 20) {
    System.out.println("CRÍTICO!");
} else if (resultadoD20 == 1) {
    System.out.println("Falha crítica...");
}

for (int vez = 1; vez <= 3; vez++) {
    int resultadoD6 = dado.nextInt(6) + 1;
    System.out.println("Rolagem " + vez + " do d6: " + resultadoD6);
}`,
    aprendi: ["while: não sei quantas vezes; for: sei quantas vezes", "dentro do loop, algo tem que mudar", "nextInt(6) vai de 0 a 5; o + 1 faz o d6", "o for conta as vezes, o Random decide o número"],
    monstro: { nome: "Loop Infinito", desc: "A pergunta do while nunca fica falsa. Foi derrotado com o botão vermelho: exit code 130." },
    dados: [20, 6, 8], // mesa de dados 3D interativa no pergaminho
  },
  7: {
    titulo: "O Kraken da Divisão Inteira",
    texto: [
      "A prova da semana: 7,5 de 8, com porcentagem certa. Depois, a batalha. O primeiro Kraken era imortal: o dano ia para uma caixa nova. O segundo tinha dado viciado. O terceiro tinha um gêmeo, vidaKraken com K maiúsculo. E, depois de perder, o pirata virou zumbi e continuou pedindo rum.",
      "Ele fez as contas de balanceamento, deixou o Kraken errar também, bebeu três runs e venceu com 20 de vida sobrando.",
    ],
    citacao: "7 dividido por 2 é 3, marujo. O Kraken nunca esquece.",
    codigo: `while (vida > 0 && vidakraken > 0) {
    int resultadodD20 = rolarDado(20);
    if (resultadodD20 + bonusconhecimento >= 15) {
        vidakraken = vidakraken - rolarDado(8);
    }
    if (vidakraken > 0) {
        if (rolarDado(20) >= 10) {
            vida = vida - rolarDado(6);
        }
    }
}`,
    aprendi: ["int na frente cria uma caixa nova; sem int, atualiza", "maiúscula importa: vidaKraken e vidakraken são caixas diferentes", "o lugar do código importa: dentro do loop roda todo turno"],
    monstro: { nome: "Kraken da Divisão Inteira", desc: "Chefe da Ilha 1. Derrotado.", chefe: true },
  },
  8: {
    titulo: "A cozinha e o salão",
    texto: [
      "Métodos: receitas com nome. Na primeira tentativa, os pedidos foram parar dentro da receita, e o rolarDado chamava a si mesmo, como um taverneiro pedindo rum para si mesmo para servir um rum.",
      "Depois veio a vingança do boletim do Dia 4, aquele com o mesmo if copiado seis vezes. Virou uma receita só. Ele mudou uma linha, e todas as matérias mudaram juntas.",
    ],
    codigo: `static int rolarDado(int lados) {
    return dado.nextInt(lados) + 1;
}

static void verificarNota(double nota) {
    if (nota >= aprovado) {
        System.out.println("Aprovado com " + nota + "!");
    } else if (nota >= recuperacao) {
        System.out.println("Recuperação com " + nota + "!");
    } else {
        System.out.println("Reprovado com " + nota + "!");
    }
}`,
    aprendi: ["void só faz; int devolve um número", "parâmetro é o que entra; return é o que sai", "salão (main) faz os pedidos, cozinha (método) guarda a receita", "static na classe: todos os métodos enxergam", "DRY: mudar em um lugar só"],
    monstro: { nome: "StackOverflowError", desc: "Um método que chama a si mesmo sem parar até a pilha transbordar." },
  },
  9: {
    titulo: "O armário de gavetas",
    texto: [
      "Arrays: uma caixa com várias gavetas numeradas. A primeira gaveta é a zero. Ele disse que a gaveta 1 da tripulação era o Daniel; era o Bartolomeu.",
      "No jogo, o capitão ganhou um baú. Na primeira vez, o baú mostrou três itens iguais: 3, 3 e 3. Ele tinha mostrado quantas gavetas existiam, em vez de abrir cada uma.",
    ],
    codigo: `double[] notas = {8.0, 5.7, 3.0, 7.0, 6.0};
double soma = 0;

for (int i = 0; i < notas.length; i++) {
    soma = soma + notas[i];
}
double media = soma / notas.length;   // 5.94`,
    aprendi: ["a primeira gaveta é a 0; a última é length - 1", "length diz quantas gavetas; [i] abre a gaveta i", "o for de array começa em 0 e usa <", "a caixa da soma fica fora do for"],
    monstro: { nome: "ArrayIndexOutOfBoundsException", desc: "Tentar abrir a gaveta 4 de um armário que vai de 0 a 3." },
  },
  10: {
    titulo: "A mensagem na garrafa",
    texto: [
      "Strings também têm poderes: maiúsculas, tamanho, letra por posição. A mensagem dizia que o tesouro estava na ilha do vulcão, e o programa respondeu que era um bilhete de bêbado. O motivo: equals pergunta se a frase inteira é igual; contains pergunta se a palavra está dentro.",
      "Depois, um mistério: 20 letras e a última em branco. Era um espaço digitado sem querer no final. O trim resolveu. No jogo, o taverneiro passou a pedir a senha dos piratas.",
    ],
    codigo: `String mensagem = teclado.nextLine().trim();

System.out.println(mensagem.toUpperCase());
System.out.println(mensagem.length());
System.out.println(mensagem.charAt(mensagem.length() - 1));

if (mensagem.toLowerCase().contains("tesouro")) {
    System.out.println("Há ouro nesta garrafa!");
}`,
    aprendi: ["texto se compara com equals, nunca com ==", "contains procura dentro; equals compara tudo", "toLowerCase antes de comparar ignora maiúsculas", "trim corta os espaços das pontas", "depois de nextInt, um nextLine vazio engole o Enter"],
    monstro: { nome: "O Espaço Invisível", desc: "Um espaço no fim do texto que conta como letra e ninguém vê." },
  },
  11: {
    titulo: "A mochila que cresce",
    texto: [
      "O baú de gavetas tinha tamanho fixo, e o Tentáculo do Kraken não cabia. O ArrayList cresce e encolhe. Na primeira simulação, ele não viu que, depois de um remove, quem vem atrás anda uma casa. Cinco minutos depois, acertou todos os palpites.",
      "No jogo, vencer o Kraken passou a colocar o tentáculo no baú, uma vez só. Só que o código ficou fora do bloco da vitória: até quem perde ganha o troféu.",
    ],
    codigo: `ArrayList<String> bau = new ArrayList<>();
bau.add("Pistola de balas molhadas");
bau.add("Mapa rasgado");

if (!bau.contains("Tentaculo do Kraken")) {
    bau.add("Tentaculo do Kraken");
}

for (int i = 0; i < bau.size(); i++) {
    System.out.println((i + 1) + ") " + bau.get(i));
}`,
    aprendi: ["add coloca no fim; get pega; size conta; remove tira", "depois de remove, os de trás andam uma casa", "! significa NÃO", "array usa [ ] e length; ArrayList usa get e size()"],
    monstro: { nome: "O Troféu da Derrota", desc: "Um if fora do lugar que dá o tentáculo até para quem foi arrastado ao fundo do mar." },
  },
  12: {
    titulo: "O livro de contas do taverneiro",
    texto: [
      "Um dia de atraso, e ele voltou mesmo assim. HashMap: um livro onde se procura pelo nome, e não pela posição. No quiz, ele achou que o size somava o ouro de todo mundo. Só entendeu quando o livro virou um caderno de chamada: três nomes, três linhas. Depois chutou add e containsKey para guardar um valor. O HashMap só conhece um verbo para isso: put.",
      "No jogo, o taverneiro abriu uma loja. A primeira compra cobrou o ouro e não entregou nada: o ! tinha sumido do if do baú, e a mensagem jurava que o item tinha entrado. Com toLowerCase e trim, o jogador pode gritar HIDROMEL que o taverneiro entende.",
    ],
    citacao: "Como faço para não precisar digitar o nome com letra maiúscula?",
    codigo: `HashMap<String, Integer> loja = new HashMap<>();
loja.put("hidromel", 15);

String comprar = teclado.nextLine().toLowerCase().trim();

if (!loja.containsKey(comprar)) {
    System.out.println("Taverneiro : Nao vendo isso marujo.");
} else if (ouro < loja.get(comprar)) {
    System.out.println("Taverneiro : Ouro insuficiente marujo.");
} else {
    ouro = ouro - loja.get(comprar);
    if (!bau.contains(comprar)) {
        bau.add(comprar);
    }
}`,
    aprendi: ["HashMap guarda chave e valor; procura pelo nome, não pela posição", "put guarda (cria a linha ou troca o valor); get pega; containsKey pergunta", "put numa chave que já existe troca o valor e não muda o size", "dentro do < > vai Integer, não int", "para somar: map.put(chave, map.get(chave) + 10)"],
    monstro: { nome: "O Baú Mentiroso", desc: "Cobrou o ouro, não guardou o item e ainda anunciou que guardou. Morto com um !." },
  },
  13: {
    titulo: "O porão e a balança mentirosa",
    texto: [
      "Dia de revisão, sem matéria nova. Na primeira rodada do quiz, os monstros antigos voltaram todos juntos: o length contado como posição, o remove que faz a fila andar, o T maiúsculo que engana o contains. Na segunda rodada, ele acertou quase tudo. Só trocou o array e o ArrayList de lugar.",
      "Depois, o porão do navio: array, ArrayList, HashMap e um método, tudo num programa só. Primeiro faltou uma chave. Depois sobrou uma. E o barril de rum saiu do porão, mas continuou pesando na balança, até um remove pelo nome apagá-lo do livro.",
    ],
    citacao: "Esse HashMap a gente nem estudou.",
    codigo: `static int pesoTotal(HashMap<String, Integer> pesos) {
    int total = 0;
    for (String item : pesos.keySet()) {
        total = total + pesos.get(item);
    }
    return total;
}

carga.remove(0);                  // ArrayList: tira pela posição
pesos.remove("barril de rum");    // HashMap: tira pelo nome`,
    aprendi: ["array: tamanho fixo; ArrayList: cresce e encolhe; HashMap: procura pelo nome", "o i de um for morre quando o for fecha", "toda { precisa de uma }, nem mais nem menos", "clicar numa chave acende o par dela", "dado que mora em dois lugares tem que ser apagado nos dois"],
    monstro: { nome: "A Balança Mentirosa", desc: "O item sai da lista e continua no livro. O peso fica errado sem nenhum erro vermelho." },
  },
  14: {
    titulo: "O Espantalho do Índice Zero",
    texto: [
      "Aquecimento: cinco situações do jogo, cinco escolhas certas entre array, ArrayList e HashMap, com o porquê. Prova: 7 de 8. Quantos e posição, acertados três vezes. Na última, ele desenhou as gavetas sozinho para provar que a gaveta 3 não existe.",
      "Na batalha, o Espantalho trouxe três corvos. O primeiro foi imortal: get(1) olhava sempre o Pena, e ninguém saía da fila. Depois o remove foi parar no else, e os corvos morriam quando acertavam ele. Com o get(0) e o remove(0) no lugar certo, caíram Bico, Pena e Garra, na ordem. O Espantalho desabou com -1 de vida.",
      "Depois ele reclamou que a batalha estava seca: o Kraken tinha emoção, e o Espantalho parecia planilha. Ganhou uma lenda: um espantalho costurado com velas de navios afundados, foice de âncora e um coração de alga no peito. Cada corvo ganhou a sua morte num HashMap, as bicadas viraram um array sorteado pelo dado, e abaixo de 10 de vida o Espantalho entra em fúria. Só entra na fazenda quem tem o Tentáculo do Kraken no baú.",
    ],
    citacao: "Esse para remover os corvos, não estou entendendo. Na verdade nem lembro do Dia 11.",
    codigo: `while (vida > 0 && vidaEspantalho > 0) {
    if (corvos.size() > 0) {
        int ataque = rolarDado(20);
        if (ataque >= 12) {
            System.out.println("Você derrubou o Corvo " + corvos.get(0));
            corvos.remove(0);
        } else {
            vida = vida - rolarDado(4);
        }
    } else {
        // ataca o Espantalho
    }
}`,
    aprendi: ["o while já é a repetição; dentro do turno, a pergunta é um if", "HashMap também guarda texto: nome do corvo → como ele morre", "boolean como bandeira: a fúria acontece uma vez só", "get olha, remove tira; o primeiro da fila é sempre o 0", "dado rolado sem caixa é dado jogado embaixo da mesa", "o troféu mora dentro da vitória"],
    monstro: { nome: "Espantalho do Índice Zero", desc: "Chefe da Ilha 2. Derrotado.", chefe: true },
  },
  15: {
    titulo: "A Rival de Ficha Própria",
    texto: [
      "Primeiro dia na Ilha 3, o Reino dos Objetos. Classe é a forma de bolo, objeto é o bolo. A classe Pirata virou uma ficha em branco com nome, vida e ouro, e cada new Pirata() tira uma ficha preenchida da forma.",
      "No exercício, o capitão nasceu com o final da história: 80 de ouro. O baú somou mais 30 por cima, e ele mesmo desconfiou do 110. Nasce com o começo, e o código faz o fim.",
      "No jogo, a Anne entrou na taverna como rival, com ouro próprio. Na primeira versão ela nascia dentro do case 9 e esquecia cada aposta. Saiu do loop e passou a lembrar de tudo: 50, 60, 50, 40.",
    ],
    citacao: "Não faz sentido o capitão ficar com 80 de ouro.",
    codigo: `Pirata anne = new Pirata();   // nasce UMA vez, fora do loop
anne.nome = "Anne";
anne.forca = 3;
anne.ouro = 40;

while (escolha != 4) {
    // case 9
    int bracoAnne = rolarDado(20) + anne.forca;
    if (seuBraco > bracoAnne) {
        ouro = ouro + 10;
        anne.ouro = anne.ouro - 10;   // o ouro sai da ficha DELA
    }
}`,
    aprendi: ["classe é a forma, objeto é o bolo", "o ponto abre a ficha: capitao.vida", "cada objeto tem as suas próprias caixas", "quem precisa lembrar nasce fora do loop; o dado nasce dentro"],
    monstro: { nome: "A Rival Desmemoriada", desc: "Nascia dentro do case 9 e esquecia cada aposta. Derrotada." },
  },
  16: {
    titulo: "Duas Mesas, Um Dedo",
    texto: [
      "Construtor: o ritual de nascimento. Quatro linhas para a Anne nascer viraram uma: new Tripulante(\"Anne\", 25, 10). O this.nome é a caixa da ficha, o nome sozinho é o que chegou de fora.",
      "Ele se recusou a apagar o main do Pirata.java: aquele arquivo é o Dia 15, e no Dia 30 quem abrir o projeto tem que ver a evolução. Nasceu o Tripulante.java, a forma nova ao lado da antiga.",
      "No jogo, o Barba Cinza entrou na taverna, e a queda de braço ganhou um dedo: Pirata rival, sem new, apontando para quem você escolheu. Um bloco de código, dois rivais, cada um com o seu ouro.",
    ],
    citacao: "Eu não quero tirar nada do Pirata.java, pois lá é um dia de estudo.",
    codigo: `Pirata anne = new Pirata("Anne", 3, 40);
Pirata barba = new Pirata("Barba Cinza", 5, 80);

Pirata rival;          // sem new: é um dedo, não um pirata
if (desafio == 1) {
    rival = anne;
} else {
    rival = barba;
}
int bracoRival = rolarDado(20) + rival.forca;
rival.ouro = rival.ouro - 10;   // quem perde é a ficha de verdade`,
    aprendi: ["o construtor tem o nome da classe e nenhum tipo de retorno", "this.nome é a ficha; nome sozinho é o que chegou", "criar um construtor mata o new vazio", "uma variável sem new aponta para um objeto que já existe"],
    monstro: { nome: "O Construtor Fantasma", desc: "O new Pirata() vazio, morto no instante em que nasceu o construtor de verdade. Derrotado." },
  },
};

/* ============================================================
   GEOGRAFIA (posições na carta, viewBox 1200 x 800)
   ============================================================ */
const POS = {
  1: [118, 650], 2: [165, 600], 3: [215, 652], 4: [262, 598], 5: [312, 648], 6: [352, 594], 7: [446, 690],
  8: [150, 330], 9: [196, 275], 10: [252, 318], 11: [300, 258], 12: [238, 205], 13: [322, 182], 14: [418, 262],
  15: [520, 476], 16: [566, 416], 17: [622, 474], 18: [668, 404], 19: [724, 452], 20: [706, 356], 21: [618, 330],
  22: [858, 362], 23: [894, 306], 24: [944, 352], 25: [988, 296], 26: [1040, 336], 27: [1060, 256], 28: [1018, 208], 29: [940, 222], 30: [982, 128],
};
const CHEFES = [7, 14, 21, 30];

export { DIAS_CONCLUIDOS, ILHAS, PREVISTO, DIARIO, POS, CHEFES };
