/* ============================================================
   DADOS: atualizar a cada dia concluído.
   DIAS_CONCLUIDOS = quantos dias já têm diário.
   ============================================================ */
const DIAS_CONCLUIDOS = 24;

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
  17: {
    titulo: "O Pirata Que Sabe Fazer",
    texto: [
      "Até aqui o objeto só tinha coisas. Agora ele sabe fazer: pagar, receber, apanhar, apresentar. Métodos sem static, porque pertencem a cada pirata, e o this vira quem foi chamado.",
      "No Corsario.java, o recheio do construtor foi parar dentro do pagar, o receber tirava dinheiro, e um = no meio do println tentava guardar texto no nome. Quatro consertos depois, o main virou um roteiro: barba paga, capitão recebe, capitão apanha. Nenhum .ouro = à vista.",
    ],
    citacao: "Atributo é o que o pirata tem, método é o que o pirata faz.",
    codigo: `void pagar(int quantia) {
    this.ouro = this.ouro - quantia;
}

void receber(int quantia) {
    this.ouro = this.ouro + quantia;
}

barba.pagar(20);
capitao.receber(20);`,
    aprendi: ["atributo é o que tem, método é o que faz", "método de objeto não tem static", "anne.pagar(10): dentro do método, o this é a Anne", "o main pede, o pirata faz"],
    monstro: { nome: "O Recheio Fugitivo", desc: "O corpo do construtor escondido dentro do pagar. Derrotado." },
  },
  18: {
    titulo: "O Cofre do Barba Cinza",
    texto: [
      "Encapsulamento: private tranca a ficha num cofre, e só a própria classe tem a chave. Para olhar, a janelinha getOuro(). Para mexer, o balcão: pagar agora devolve boolean e recusa quem não tem dinheiro.",
      "Ele travou nos returns. O pagar terminava com return pagar(), um método chamando ele mesmo para sempre. O getNome devolvia int. Depois de entender que o return é a resposta do balcão, o Barba Cinza tentou pagar 200 com 60 no bolso e virou os bolsos, vazios.",
      "No jogo, a ficha dos rivais virou cofre. A Forja ficou cheia de vermelho, que era o cofre funcionando, e a queda de braço passou a pedir: você só recebe se o rival conseguir pagar.",
    ],
    citacao: "E eu buguei nos return.",
    codigo: `boolean pagar(int quantia) {
    if (quantia > this.ouro) {
        return false;      // responde NÃO e sai
    }
    this.ouro = this.ouro - quantia;
    return true;
}

if (rival.pagar(10)) {
    ouro = ouro + 10;      // só recebe quem conseguiu cobrar
}`,
    aprendi: ["private: só a própria classe tem a chave", "get é a janelinha: olha, não mexe", "o tipo antes do nome diz que resposta o return entrega", "return encerra o método na hora"],
    monstro: { nome: "O Return Infinito", desc: "return pagar(): o balcão perguntando a si mesmo para sempre. Derrotado." },
  },
  19: {
    titulo: "A Família dos Monstros",
    texto: [
      "Quatro dias de GTA 6 e o cofre continuava trancado: 3,5 de 4 no aquecimento. Depois, herança: a forma-mãe Criatura tem nome, vida e sabe apanhar, e as filhas herdam tudo com extends. O super(nome, vida) faz a mãe nascer primeiro.",
      "O Espantalho.java não tem nenhum apanhar escrito, e mesmo assim levou 10 de dano. Ganhou 10 corvos em vez de 3, por decisão do autor.",
    ],
    citacao: "O this faz referência ao próprio objeto, e o super faz referência à classe mãe.",
    codigo: `public class Espantalho extends Criatura {
    int corvos;

    Espantalho(String nome, int vida, int corvos) {
        super(nome, vida);
        this.corvos = corvos;
    }
}

espantalho.apanhar(10);   // herdado da mãe`,
    aprendi: ["extends: X é um Y", "super(...) chama o construtor da mãe, na primeira linha", "a herança só desce: a mãe não ganha nada das filhas"],
    monstro: { nome: "As Dez Cópias", desc: "O mesmo apanhar escrito em cada monstro. Derrotadas pela forma-mãe." },
  },
  20: {
    titulo: "Ataquem!",
    texto: [
      "Polimorfismo: a mesma ordem, cada um responde do seu jeito. A mãe Monstro ataca de um jeito padrão, e as filhas reescrevem com @Override. Numa lista de Monstro, um for chama atacar() sem perguntar quem é quem.",
      "Ele testou a etiqueta sozinho: escreveu atacr() na Serpente, e o @Override ficou vermelho. Sem ela, o erro teria virado um método novo que ninguém chama.",
    ],
    citacao: "O Java identifica o tipo real do objeto e executa a versão específica do método.",
    codigo: `ArrayList<Monstro> monstros = new ArrayList<>();
monstros.add(new Monstro("Rato do Porão", 5));
monstros.add(new Corvo("Corvo Bico", 3));
monstros.add(new Serpente("Serpente do Mangue", 12));

for (int i = 0; i < monstros.size(); i++) {
    monstros.get(i).atacar();
}`,
    aprendi: ["@Override: estou reescrevendo o método da mãe", "uma lista da mãe aceita as filhas", "quem decide o ataque é o objeto de verdade, não a caixa"],
    monstro: { nome: "O Método Fantasma", desc: "atacr(): um método novo que ninguém chamaria. Pego pelo @Override." },
  },
  21: {
    titulo: "O Rei sem Construtor",
    texto: [
      "A prova do Rei: 7 de 8. O polimorfismo explicado com o exército, nas palavras dele. Os tropeços foram de escrita: Void com V maiúsculo, um 0 no lugar do parêntese, e um construtor guarda com g minúsculo.",
      "Na batalha, a corte inteira atacava a cada rodada, cada um do seu jeito, numa linha só. As duas primeiras lacunas pediam posição e receberam vida: get(10) e remove(15), numa fila de três. O Espantalho do Índice Zero tentando voltar escondido no castelo.",
      "Na primeira tentativa, com 120 de vida, ele virou estátua no jardim. A conta mostrou que o chefe era invencível. Com a Espada do Construtor, mais 4 de dano, a coroa caiu em 8 rodadas. Embaixo dela, nunca houve ninguém.",
    ],
    citacao: "Polimorfismo é quando damos uma mesma ordem para o exército, mas cada soldado executa essa ordem de uma maneira diferente.",
    codigo: `while (vida > 0 && corte.size() > 0) {
    Monstro alvo = corte.get(0);
    if (golpe >= 12) {
        alvo.apanhar(rolarDado(8) + 4);
        if (!alvo.estaVivo()) {
            corte.remove(0);
        }
    }
    for (int i = 0; i < corte.size(); i++) {
        vida = vida - corte.get(i).atacar();
    }
}`,
    aprendi: ["outra classe chama um static pelo nome da forma: Forja.rolarDado", "um método pode devolver o dano para quem chamou", "balancear: fazer a conta antes de culpar o dado"],
    monstro: { nome: "Rei sem Construtor", desc: "Chefe da Ilha 3. Derrotado.", chefe: true },
  },
  22: {
    titulo: "A Rede do Trapezista",
    texto: [
      "Ilha 4, o Arquipélago dos Erros. Uma exceção é o Java gritando no meio do caminho. Com try e catch, o grito cai numa rede e o programa continua.",
      "No caixa do navio, os dois erros do exercício foram as perguntas do quiz acontecendo de verdade: um catch esperando InputMismatchException enquanto o zero gritava ArithmeticException, e um nextInt dentro da rede tropeçando na mesma letra. Depois do conserto, os três testes terminaram com exit code 0.",
      "No jogo, o menu ganhou a rede. Digitar uma letra não mata mais a taverna: o taverneiro reclama e o menu volta.",
    ],
    citacao: "Funcionou, o taverneiro reclamou e o menu voltou.",
    codigo: `try {
    escolha = teclado.nextInt();
} catch (InputMismatchException e) {
    System.out.println("Taverneiro : Fala direito, marujo.");
    teclado.nextLine();   // joga a letra fora
    escolha = 0;
}`,
    aprendi: ["try: o salto · catch: a rede", "cada catch só pega o erro com o nome dele", "dentro do catch, nextLine joga o lixo fora; nextInt tropeça de novo", "o que vem depois do erro, dentro do try, não roda"],
    monstro: { nome: "A Rede Errada", desc: "Um catch de InputMismatchException esperando uma divisão por zero. Derrotada." },
  },
  23: {
    titulo: "O Grito da Anne",
    texto: [
      "Um false dá para ignorar. Um grito, não. A OuroInsuficienteException nasceu filha da Exception, o throws virou aviso na porta do pagar, e o throw virou o grito. Sem try e catch, o Java nem deixa rodar.",
      "No Tesoureiro, a segunda cobrança gritou e pulou o receber: o capitão ficou com 70, e não com 270. O Espaço Invisível voltou em 40moedas.",
      "No jogo, a ideia era limpar a Anne até ela gritar. Ela limpou ele: de 40 para 90 moedas, e ele de 50 para zero. Então ele montou o cenário: a Anne nasceu com 5, perdeu, virou os bolsos, e o ouro dele não subiu.",
    ],
    citacao: "Anne vira os bolsos: só tem 5 moedas. Hoje não, marujo.",
    codigo: `void pagar(int quantia) throws OuroInsuficienteException {
    if (quantia > this.ouro) {
        throw new OuroInsuficienteException(this.nome + " vira os bolsos...");
    }
    this.ouro = this.ouro - quantia;
}

try {
    rival.pagar(10);
    ouro = ouro + 10;   // pulado se ela gritar
} catch (OuroInsuficienteException e) {
    System.out.println(rival.getNome() + " : " + e.getMessage());
}`,
    aprendi: ["throws avisa na porta, throw grita", "a exceção própria é filha da Exception", "o que vem depois do grito, no try, não roda", "para testar o raro, monte o cenário"],
    monstro: { nome: "O False Ignorado", desc: "O aviso baixinho que dava para fingir que não ouviu. Substituído por um grito." },
  },
  24: {
    titulo: "O Diário Que Não Se Apaga",
    texto: [
      "A memória é apagada quando o jogo fecha. O disco, não. O FileWriter escreveu o primeiro save, o Scanner leu de volta, e o Integer.parseInt transformou o texto 120 de novo em número. O finally virou o pouso do trapezista: roda sempre.",
      "No quiz, duas respostas eram cópias da aula. Pedi as mesmas duas de novo, do jeito dele, sem rolar a tela. Na terceira vez vieram: parseInt transforma texto em número, e o B não roda porque está depois da divisão por zero.",
      "No jogo, a opção 11 grava nome, vida, ouro, o tamanho do baú e cada item. Ao abrir, o jogo pergunta se quer continuar. Pela primeira vez em 24 dias, o Maré Negra lembrou dele.",
    ],
    citacao: "Funcionou, carregou o save e o baú voltou.",
    codigo: `FileWriter arquivo = new FileWriter("mare-negra-save.txt");
arquivo.write(ouro + "\\n");
arquivo.write(bau.size() + "\\n");
for (int i = 0; i < bau.size(); i++) {
    arquivo.write(bau.get(i) + "\\n");
}
arquivo.close();

int quantos = Integer.parseInt(leitor.nextLine());
for (int i = 0; i < quantos; i++) {
    bau.add(leitor.nextLine());
}`,
    aprendi: ["memória some, disco fica", "do arquivo tudo volta como texto: parseInt", "o finally roda sempre", "gravar o tamanho antes dos itens diz ao leitor quantas linhas ler"],
    monstro: { nome: "A Rede de Conta", desc: "Um catch de ArithmeticException esperando um arquivo que não existe. Derrotada." },
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
