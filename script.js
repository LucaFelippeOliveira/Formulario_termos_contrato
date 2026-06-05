function mudarDocumento(arquivo, abaClicada) {
  document.getElementById("pdf-viewer").src = arquivo + "#navpanes=0&view=FitH";

  const abas = document.querySelectorAll(".aba");
  abas.forEach((aba) => aba.classList.remove("ativa"));

  abaClicada.classList.add("ativa");
}

function irParaPagamento() {
  document.getElementById("passo1").classList.add("hidden");
  document.getElementById("passo2").classList.remove("hidden");
  window.scrollTo(0, 0);
}

function assinar() {
  const aceiteUso = document.getElementById("aceite-uso").checked;
  const aceiteServico = document.getElementById("aceite-servico").checked;

  if (!aceiteUso || !aceiteServico) {
    alert(
      "Para prosseguir, você precisa declarar que leu e concorda com ambos os termos marcando as duas caixinhas.",
    );
    return;
  }

  irParaPagamento();
}

function copiarPix() {
  const campoPix = document.getElementById("chave-pix");
  const botaoCopiar = document.getElementById("btn-copiar");

  campoPix.select();
  campoPix.setSelectionRange(0, 99999);

  navigator.clipboard
    .writeText(campoPix.value)
    .then(() => {
      botaoCopiar.innerText = "Copiado com sucesso!";
      botaoCopiar.style.backgroundColor = "#17a2b8";

      setTimeout(() => {
        botaoCopiar.innerText = "Copiar Chave Pix";
        botaoCopiar.style.backgroundColor = "#28a745";
      }, 3000);
    })
    .catch(() => {
      alert("Erro ao tentar copiar. Por favor, copie manualmente.");
    });
}

// --- NOVAS FUNÇÕES PARA CAPTURA DE CPF E INTEGRAÇÃO ---

// Função para alternar entre PIX e Cartão visualmente (Accordion)
function selecionarPagamento(metodo) {
  // Remove a classe 'ativa' de todas as opções
  document.getElementById("label-pix").classList.remove("ativa");
  document.getElementById("label-cartao").classList.remove("ativa");

  // Adiciona a classe 'ativa' na opção clicada
  if (metodo === "pix") {
    document.getElementById("label-pix").classList.add("ativa");
  } else if (metodo === "cartao") {
    document.getElementById("label-cartao").classList.add("ativa");
  }
}

// Máscara simples de CPF enquanto o usuário digita
document.getElementById("cpf").addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número
  if (value.length > 11) value = value.slice(0, 11);
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  e.target.value = value;
});

// Função principal: Captura tudo, manda pro Google Sheets e mostra o PIX
async function gerarPixESalvar() {
  const cpfInput = document.getElementById("cpf");
  const cpf = cpfInput.value.replace(/\D/g, ""); // Pega só os números
  // Ajuste: Busca o botão dentro do novo contêiner
  const btnGerar = document.querySelector("#conteudo-pix .btn-avancar");

  // Validação básica de tamanho do CPF
  if (cpf.length !== 11) {
    alert("Por favor, digite um CPF válido com 11 números.");
    return;
  }

  // Muda o texto do botão para mostrar que está carregando
  btnGerar.innerText = "Registrando e gerando PIX...";
  btnGerar.disabled = true;

  try {
    // 1. Captura o IP do usuário invisivelmente
    const resIp = await fetch("https://api.ipify.org?format=json");
    const dataIp = await resIp.json();
    const ipUsuario = dataIp.ip;

    // 2. Prepara o pacote de dados
    const dadosAssinatura = {
      cpf: cpf,
      ip: ipUsuario,
      data_hora: new Date().toLocaleString("pt-BR"),
      termos_aceitos: "Termos de Uso e Regras de Contrato",
    };

    console.log("Dados prontos para envio:", dadosAssinatura);

    // 3. AQUI VAI O ENVIO PARA O GOOGLE SHEETS
    const urlGoogleAppsScript =
      "https://script.google.com/macros/s/AKfycbxGmFuZ53Pr1DU3-LEIeKV3rQIKFhoLrnrMcacivXBf3Xz7Ia7wLDLEdTMnI2Hfn0NkbA/exec";

    await fetch(urlGoogleAppsScript, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(dadosAssinatura),
    });

    // 4. Esconde a área INTEIRA de pagamento e mostra a área do PIX
    document.getElementById("area-pagamento").classList.add("hidden");
    document.getElementById("area-pix").classList.remove("hidden");
  } catch (erro) {
    alert(
      "Houve um erro ao processar. Verifique sua conexão e tente novamente.",
    );
    console.error(erro);
  } finally {
    // Retorna o botão ao estado normal caso dê erro ou finalize
    btnGerar.innerText = "Gerar Pagamento PIX";
    btnGerar.disabled = false;
  }
}
