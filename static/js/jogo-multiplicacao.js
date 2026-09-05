let pontos = 0;
let vidas = 5;
let contas = [];
let jogoIniciado = false;

let alturaJogo;
let intervaloCriar;
let intervaloAtualizar;

const LIMITE_CONTAS = 6;


/* =========================================
   INICIAR JOGO AUTOMATICAMENTE
   ========================================= */

window.addEventListener("load", function () {

    const jogo = document.getElementById("jogo");

    if (!jogo) {
        console.error("Área do jogo não encontrada.");
        return;
    }

    alturaJogo = jogo.clientHeight;

    jogoIniciado = true;

    document.getElementById("pontos").innerText = pontos;
    document.getElementById("vidas").innerText = vidas;

    /*
       Cria uma conta imediatamente.
       Não precisa esperar 2,2 segundos.
    */
    criarConta();

    /*
       Depois continua criando novas contas.
    */
    intervaloCriar = setInterval(criarConta, 2200);

    /*
       Faz as contas caírem.
    */
    intervaloAtualizar = setInterval(atualizar, 40);

    /*
       Coloca o cursor no campo de resposta.
    */
    document.getElementById("resposta").focus();
});


/* =========================================
   CRIAR CONTA
   ========================================= */

function criarConta() {

    if (!jogoIniciado) return;

    if (contas.length >= LIMITE_CONTAS) return;

    /*
       Configuração da dificuldade.
       Se dificuldadePorAno existir, usa ela.
       Caso contrário, utiliza 10 como padrão.
    */

    let maxNumero = 10;

    if (
        window.dificuldadePorAno &&
        typeof window.dificuldadePorAno.obterConfiguracao === "function"
    ) {
        const config =
            window.dificuldadePorAno.obterConfiguracao("multiplicacao");

        if (config && config.maxNumero) {
            maxNumero = config.maxNumero;
        }
    }


    /*
       Gera números de 1 até maxNumero.
       Evita aparecer 0 × qualquer coisa.
    */

    const num1 =
        Math.floor(Math.random() * maxNumero) + 1;

    const num2 =
        Math.floor(Math.random() * maxNumero) + 1;

    const resposta = num1 * num2;


    /*
       Cria o elemento visual da conta.
    */

    const conta = document.createElement("div");

    conta.classList.add("conta");

    conta.innerText = `${num1} × ${num2}`;


    /*
       Posição horizontal aleatória.
    */

    const jogo = document.getElementById("jogo");

    const larguraConta = 90;

    const larguraDisponivel =
        jogo.clientWidth - larguraConta;

    conta.style.left =
        Math.max(0, Math.random() * larguraDisponivel) + "px";

    conta.style.top = "0px";


    /*
       Coloca a conta na tela.
    */

    jogo.appendChild(conta);


    /*
       Guarda as informações da conta.
    */

    contas.push({
        elemento: conta,
        resposta: resposta,
        y: 0,
        velocidade: 0.5 + Math.random() * 0.8
    });
}


/* =========================================
   ATUALIZAR CONTAS
   ========================================= */

function atualizar() {

    if (!jogoIniciado) return;

    /*
       Percorremos de trás para frente para
       evitar problemas ao remover elementos.
    */

    for (let i = contas.length - 1; i >= 0; i--) {

        const c = contas[i];

        c.y += c.velocidade;

        c.elemento.style.top = c.y + "px";


        /*
           Se a conta chegou ao final da área,
           perde uma vida.
        */

        if (c.y > alturaJogo) {

            c.elemento.remove();

            contas.splice(i, 1);

            perderVida();
        }
    }
}


/* =========================================
   VERIFICAR RESPOSTA
   ========================================= */

function verificar() {

    const campo = document.getElementById("resposta");

    const valor = Number(campo.value);

    if (campo.value === "") {
        return;
    }


    /*
       Procura uma conta com essa resposta.
    */

    for (let i = contas.length - 1; i >= 0; i--) {

        const c = contas[i];

        if (valor === c.resposta) {

            c.elemento.remove();

            contas.splice(i, 1);

            pontos++;

            document.getElementById("pontos").innerText = pontos;

            break;
        }
    }


    /*
       Limpa o campo.
    */

    campo.value = "";

    campo.focus();
}


/* =========================================
   PERDER VIDA
   ========================================= */

function perderVida() {

    vidas--;

    document.getElementById("vidas").innerText = vidas;

    if (vidas <= 0) {
        mostrarGameOver();
    }
}


/* =========================================
   GAME OVER
   ========================================= */

function mostrarGameOver() {

    jogoIniciado = false;

    clearInterval(intervaloCriar);
    clearInterval(intervaloAtualizar);

    document.getElementById("pontuacao-final").innerText = pontos;

    document.getElementById("game-over").style.display = "flex";
}


/* =========================================
   REINICIAR
   ========================================= */

function reiniciarJogo() {

    location.reload();
}


/* =========================================
   SAIR DO JOGO
   ========================================= */

function sairJogo() {

    clearInterval(intervaloCriar);
    clearInterval(intervaloAtualizar);

    jogoIniciado = false;

    window.location.href = "/jogos";
}


/* =========================================
   ENTER PARA RESPONDER
   ========================================= */

document.addEventListener("DOMContentLoaded", function () {

    const campo = document.getElementById("resposta");

    if (campo) {

        campo.addEventListener("keypress", function (e) {

            if (e.key === "Enter") {

                verificar();
            }
        });
    }
});