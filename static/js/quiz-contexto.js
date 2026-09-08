// DADOS
const nomes = ["Ana", "João", "Maria", "Pedro", "Carla", "Lucas"];
const objetos = ["maçãs", "balas", "brinquedos", "livros", "figurinhas", "doces"];

// GERADOR DE QUESTÕES
function gerarQuestao() {
  const tipo = Math.floor(Math.random() * 4);

  let nome = nomes[Math.floor(Math.random() * nomes.length)];
  let obj = objetos[Math.floor(Math.random() * objetos.length)];

  let n1, n2, pergunta, correta;

  if (tipo === 0) {
    n1 = Math.floor(Math.random() * 20);
    n2 = Math.floor(Math.random() * 20);
    correta = n1 + n2;
    pergunta = `${nome} tinha ${n1} ${obj} e ganhou mais ${n2}. Quantas tem agora?`;
  }

  if (tipo === 1) {
    n1 = Math.floor(Math.random() * 20);
    n2 = Math.floor(Math.random() * n1);
    correta = n1 - n2;
    pergunta = `${nome} tinha ${n1} ${obj} e perdeu ${n2}. Quantas sobraram?`;
  }

  if (tipo === 2) {
    n1 = Math.floor(Math.random() * 10);
    n2 = Math.floor(Math.random() * 5);
    correta = n1 * n2;
    pergunta = `${nome} tem ${n1} caixas com ${n2} ${obj} cada. Quantos no total?`;
  }

  if (tipo === 3) {
    n2 = Math.floor(Math.random() * 5) + 1;
    correta = Math.floor(Math.random() * 10);
    n1 = correta * n2;
    pergunta = `${nome} dividiu ${n1} ${obj} em ${n2} partes iguais. Quantos em cada?`;
  }

  let opcoes = new Set();
  opcoes.add(correta.toString());

  while (opcoes.size < 3) {
    let erro = correta + Math.floor(Math.random() * 5 - 2);
    if (erro !== correta && erro >= 0) {
      opcoes.add(erro.toString());
    }
  }

  return {
    q: pergunta,
    op: Array.from(opcoes).sort(() => Math.random() - 0.5),
    c: correta.toString()
  };
}

let questoesSelecionadas = [];
let questaoAtual = 0;
let respostasUsuario = [];

// GERAR QUIZ
function gerarQuiz() {
  questoesSelecionadas = [];
  respostasUsuario = [];
  questaoAtual = 0;

  for (let i = 0; i < 5; i++) {
    questoesSelecionadas.push(gerarQuestao());
  }

  mostrarQuestao();
}

// MOSTRAR UMA
function mostrarQuestao() {
  const form = document.getElementById("quizForm");
  form.innerHTML = "";

  const item = questoesSelecionadas[questaoAtual];

  let div = document.createElement("div");
  div.classList.add("question");

  div.innerHTML = `<p>${questaoAtual + 1}) ${item.q}</p>`;

  let answersDiv = document.createElement("div");
  answersDiv.classList.add("answers");

  item.op.forEach(opcao => {
    answersDiv.innerHTML += `
      <label>
        <input type="radio" name="resposta" value="${opcao}">
        ${opcao}
      </label>
    `;
  });

  div.appendChild(answersDiv);
  form.appendChild(div);
}

// AVANÇAR
function proximaQuestao() {
  const resposta = document.querySelector('input[name="resposta"]:checked');

  respostasUsuario[questaoAtual] = resposta ? resposta.value : null;

  questaoAtual++;

  if (questaoAtual < questoesSelecionadas.length) {
    mostrarQuestao();
  } else {
    corrigir();
  }
}

// CORRIGIR
function corrigir() {
  let acertos = 0;
  let errosHTML = "";

  questoesSelecionadas.forEach((item, index) => {
    const resposta = respostasUsuario[index];

    if (resposta === item.c) {
      acertos++;
    } else {
      errosHTML += `<p><b>${item.q}</b><br>
      Sua resposta: ${resposta || "Nenhuma"}<br>
      Correta: ${item.c}</p>`;
    }
  });

  document.getElementById("quizTela").style.display = "none";
  document.getElementById("resultadoTela").style.display = "block";

  document.getElementById("pontuacao").innerText =
    `Você acertou ${acertos} de ${questoesSelecionadas.length}`;

  document.getElementById("erros").innerHTML =
    errosHTML || "Parabéns! Você acertou tudo!";
}

// NOVO
function novoQuiz() {
  document.getElementById("resultadoTela").style.display = "none";
  document.getElementById("quizTela").style.display = "block";
  gerarQuiz();
}

// SAIR
function sair() {
  window.location.href = "/quiz";
}

// INICIAR
gerarQuiz();

document.getElementById("proxima").addEventListener("click", proximaQuestao);
document.querySelector(".novo").addEventListener("click", novoQuiz);
document.querySelector(".sair").addEventListener("click", sair);