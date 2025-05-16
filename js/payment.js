document.addEventListener('DOMContentLoaded', () => {
    const btnCartao = document.getElementById('btn-cartao');
    const btnPix = document.getElementById('btn-pix');
    const secaoCartao = document.getElementById('secao-cartao');
    const secaoPix = document.getElementById('secao-pix');
    const btnCopiarPix = document.getElementById('btn-copiar-pix');
    const chavePix = document.getElementById('chave-pix');
  
    btnCartao.addEventListener('click', () => {
      btnCartao.classList.add('ativo');
      btnPix.classList.remove('ativo');
      secaoCartao.classList.remove('oculto');
      secaoPix.classList.add('oculto');
    });
  
    btnPix.addEventListener('click', () => {
      btnPix.classList.add('ativo');
      btnCartao.classList.remove('ativo');
      secaoPix.classList.remove('oculto');
      secaoCartao.classList.add('oculto');
    });
  
    btnCopiarPix.addEventListener('click', () => {
      navigator.clipboard.writeText(chavePix.textContent)
        .then(() => alert('Chave PIX copiada com sucesso!'))
        .catch(err => alert('Erro ao copiar a chave PIX.'));
    });
});

  const valorSpan = document.getElementById('valor-total');
  const valorTotal = parseFloat(localStorage.getItem('totalCompra')) || 0;
  valorSpan.textContent = `R$ ${valorTotal.toFixed(2)}`;


  document.getElementById("btn-pagar-cartao").addEventListener("click", () => {
    const cpf = document.getElementById("cpf").value.trim().replace(/\D/g, '');
    const endereco = document.getElementById("endereco").value.trim();
    const numeroCartao = document.getElementById("numero-cartao").value.trim().replace(/\s/g, '');
  
    if (!validarCPF(cpf)) {
      alert("CPF inválido.");
      return;
    }
  
    if (!validarEndereco(endereco)) {
      alert("Endereço inválido. Informe rua e número.");
      return;
    }
  
    if (!validarCartao(numeroCartao)) {
      alert("Número do cartão inválido.");
      return;
    }
  
    alert("Pagamento aprovado com sucesso!");
    localStorage.removeItem("cart");
    window.location.href = "index.html";
  });
  
  // ---- Validação real de CPF (algoritmo oficial) ----
  function validarCPF(cpf) {
    if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  
    let soma = 0;
    for (let i = 0; i < 9; i++) soma += Number(cpf[i]) * (10 - i);
    let digito1 = 11 - (soma % 11);
    if (digito1 > 9) digito1 = 0;
    if (digito1 != Number(cpf[9])) return false;
  
    soma = 0;
    for (let i = 0; i < 10; i++) soma += Number(cpf[i]) * (11 - i);
    let digito2 = 11 - (soma % 11);
    if (digito2 > 9) digito2 = 0;
    return digito2 == Number(cpf[10]);
  }
  
  // ---- Endereço com rua e número (mínimo) ----
  function validarEndereco(endereco) {
    const partes = endereco.split(',');
    return partes.length >= 2 && partes[0].trim().length > 0 && partes[1].trim().length > 0;
  }
  
  // ---- Validação de Cartão (algoritmo de Luhn) ----
  function validarCartao(numero) {
    if (!/^\d{16}$/.test(numero)) return false;
    let soma = 0;
    let alternar = false;
  
    for (let i = numero.length - 1; i >= 0; i--) {
      let n = parseInt(numero[i]);
      if (alternar) {
        n *= 2;
        if (n > 9) n -= 9;
      }
      soma += n;
      alternar = !alternar;
    }
  
    return soma % 10 === 0;
  }
  // Função para validar validade do cartão (MM/AA)
function validarValidade(validade) {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    if (!regex.test(validade)) return false;
  
    const [mes, ano] = validade.split("/");
    const dataValidade = new Date(`20${ano}-${mes}-01`);
    const dataAtual = new Date();
    return dataValidade >= dataAtual;
  }
  
  // Função para validar CVV (3 ou 4 dígitos)
  function validarCVV(cvv) {
    return /^\d{3,4}$/.test(cvv);
  }
  
  // Máscara de CPF
document.getElementById("cpf").addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 11);
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d)/, "$1.$2");
    value = value.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
    e.target.value = value;
  });
  
  // Máscara para número do cartão
  document.getElementById("numero-cartao").addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 16);
    value = value.replace(/(\d{4})(?=\d)/g, "$1 ");
    e.target.value = value.trim();
  });
  
  // Máscara de validade (MM/AA)
document.getElementById("validade").addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 4);
    if (value.length >= 3) {
      value = value.replace(/(\d{2})(\d{1,2})/, "$1/$2");
    }
    e.target.value = value;
  });
  
  // Máscara de CVV (3 ou 4 dígitos)
  document.getElementById("cvv").addEventListener("input", (e) => {
    let value = e.target.value.replace(/\D/g, "").slice(0, 4);
    e.target.value = value;
  });
  
  
  