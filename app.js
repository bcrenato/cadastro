window.buscarCEP = function () {
  const cep = document.getElementById('cep').value.replace(/\D/g, '');

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
    document.getElementById('endereco').value = ''; // Limpa se for incompleto
  }
// Aplicar a máscara após o carregamento da página
document.addEventListener('DOMContentLoaded', () => {
  const cepInput = document.getElementById('cep');
  IMask(cepInput, {
    mask: '00000-000'
  });
  
};
