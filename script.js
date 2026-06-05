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
      "Para prosseguir, você precisa declarar que leu e concorda com ambos os termos marcando as duas caixinhas."
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

function selecionarPagamento(metodo) {
  document.getElementById("label-pix").classList.remove("ativa");
  document.getElementById("label-cartao").classList.remove("ativa");

  if (metodo === "pix") {
    document.getElementById("label-pix").classList.add("ativa");
  } else if (metodo === "cartao") {
    document.getElementById("label-cartao").classList.add("ativa");
  }
}

document.getElementById("cpf").addEventListener("input", function (e) {
  let value = e.target.value.replace(/\D/g, "");
  if (value.length > 11) value = value.slice(0, 11);
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d)/, "$1.$2");
  value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  e.target.value = value;
});

async function gerarPixESalvar() {
  const cpfInput = document.getElementById("cpf");
  const cpf = cpfInput.value.replace(/\D/g, "");
  const btnGerar = document.querySelector("#conteudo-pix .btn-avancar");

  if (cpf.length !== 11) {
    alert("Por favor, digite um CPF válido com 11 números.");
    return;
  }

  btnGerar.innerText = "Registrando e gerando PIX...";
  btnGerar.disabled = true;

  try {
    // 1. Tenta pegar o IP silenciosamente
    let ipUsuario = "IP não capturado";
    try {
      const resIp = await fetch("https://api.ipify.org?format=json");
      const dataIp = await resIp.json();
      ipUsuario = dataIp.ip;
    } catch (erroIp) {
      console.log("Aviso: Falha ao capturar IP. O processo continuará sem ele.");
    }

    // 2. Prepara os dados no formato de formulário clássico (URLSearchParams)
    const formData = new URLSearchParams();
    formData.append("cpf", cpf);
    formData.append("ip", ipUsuario);
    formData.append("data_hora", new Date().toLocaleString("pt-BR"));
    formData.append("termos_aceitos", "Termos de Uso e Regras de Contrato");

    // --- ATENÇÃO: COLOQUE A SUA URL GERADA NO GOOGLE AQUI ABAIXO ---
    const urlGoogleAppsScript = "https://script.google.com/macros/s/AKfycbwHHSsOlxAufwtTXyDyDHFlyv53-JyC2riEXiC7tHTuIFwLDfYLD7l38svawiGpWRN-Ug/exec";

    // 3. Dispara a requisição para o Google
    await fetch(urlGoogleAppsScript, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formData.toString(),
    });

    // 4. Esconde a área de pagamento e mostra o PIX
    document.getElementById("area-pagamento").classList.add("hidden");
    document.getElementById("area-pix").classList.remove("hidden");

  } catch (erro) {
    alert("Houve um erro ao processar a requisição. Tente novamente.");
    console.error(erro);
  } finally {
    // Retorna o botão ao estado normal
    btnGerar.innerText = "Gerar chave PIX de pagamento e QR Code";
    btnGerar.disabled = false;
  }
}