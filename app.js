// Aplica a máscara ao campo de CEP ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  const cepInput = document.getElementById('cep');

  // Aplicando a máscara 00000-000
  IMask(cepInput, {
    mask: '00000-000'
  });
});

// Função global para buscar o endereço pelo CEP
window.buscarCEP = function () {
  const cepInput = document.getElementById('cep');
  const cep = cepInput.value.replace(/\D/g, ''); // Remove caracteres não numéricos

  if (cep.length === 8) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(response => response.json())
      .then(data => {
        if (data.erro) {
          document.getElementById('endereco').value = 'CEP não encontrado';
        } else {
          const enderecoCompleto = `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`;
          document.getElementById('endereco').value = enderecoCompleto;
        }
      })
      .catch(error => {
        console.error('Erro ao buscar o CEP:', error);
        document.getElementById('endereco').value = 'Erro ao buscar';
      });
  } else {
    document.getElementById('endereco').value = ''; // Limpa se incompleto
  }
};
