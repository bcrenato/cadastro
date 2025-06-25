// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = 'https://seu-projeto.supabase.co';
const supabaseKey = 'sua-chave-publica';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Variáveis globais
let fotoCapturada = null;

// Inicializa a câmera
function iniciarCamera() {
    Webcam.set({
        width: 320,
        height: 240,
        image_format: 'jpeg',
        jpeg_quality: 90
    });
    Webcam.attach('#camera-preview');
}

// Evento de captura de foto
document.getElementById('btn-tirar-foto').addEventListener('click', () => {
    Webcam.snap((dataUri) => {
        fotoCapturada = dataUri;
        document.getElementById('foto-preview').innerHTML = `<img src="${dataUri}" class="img-thumbnail">`;
    });
});

// Upload da foto para o Supabase Storage
async function uploadFoto(userId) {
    const fileName = `foto-${userId}-${Date.now()}.jpg`;
    const file = await fetch(fotoCapturada).then(res => res.blob());

    const { data, error } = await supabase.storage
        .from('membros-fotos')
        .upload(fileName, file);

    if (error) throw error;

    return supabase.storage.from('membros-fotos').getPublicUrl(data.path).data.publicUrl;
}

// Cadastro no banco de dados
document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const fotoUrl = await uploadFoto(Date.now());
    
    const { error } = await supabase.from('membros').insert([{
        nome: document.getElementById('nome').value,
        data_nascimento: document.getElementById('data-nascimento').value,
        telefone: document.getElementById('telefone').value,
        email: document.getElementById('email').value,
        foto_url: fotoUrl
        // Adicione outros campos conforme necessário
    }]);

    if (error) {
        alert('Erro ao cadastrar: ' + error.message);
    } else {
        alert('Membro cadastrado com sucesso!');
        location.reload(); // Limpa o formulário
    }
});

// Inicia a câmera quando a página carrega
window.addEventListener('DOMContentLoaded', iniciarCamera);
