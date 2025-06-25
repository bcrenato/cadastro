document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const file = document.getElementById('foto').files[0];
  const filename = `${Date.now()}_${file.name}`;

  // Upload da imagem
  const { data: imgData, error: imgErr } = await supabase.storage
    .from('fotos')
    .upload(filename, file);

  if (imgErr) {
    alert('Erro ao enviar imagem');
    return;
  }

  const foto_url = `${supabase.storage.from('fotos').getPublicUrl(filename).data.publicUrl}`;

  // Enviar dados para tabela
  const { data, error } = await supabase.from('membros').insert([{
    nome: form.nome.value,
    endereco: form.endereco.value,
    batismo: form.batismo.value,
    funcao: form.funcao.value,
    foto_url
  }]);

  if (error) {
    alert('Erro ao cadastrar');
  } else {
    alert('Membro cadastrado com sucesso!');
    form.reset();
  }
});
