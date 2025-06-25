// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = 'https://gtpsdstjfdygmdkgevml.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0cHNkc3RqZmR5Z21ka2dldm1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4Nzk4MTgsImV4cCI6MjA2NjQ1NTgxOH0.xj78Xz4rOgQ4Xrn_feLakJLbUb-4rGMxU9Ul-rb5yec';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Variáveis globais
let fotoCapturada = null;
const modalSucesso = new bootstrap.Modal(document.getElementById('modal-sucesso'));

// Inicialização da câmera
function iniciarCamera() {
    Webcam.set({
        width: 320,
        height: 240,
        image_format: 'jpeg',
        jpeg_quality: 90,
        constraints: {
            facingMode: 'user'
        }
    });
    Webcam.attach('#camera-preview');
}

// Evento para tirar foto
document.getElementById('btn-tirar-foto').addEventListener('click', () => {
    Webcam.snap((dataUri) => {
        fotoCapturada = dataUri;
        document.getElementById('foto-preview').innerHTML = `
            <img src="${dataUri}" class="img-thumbnail">
            <p class="text-success mt-2 mb-0">Foto capturada!</p>
        `;
    });
});

// Evento para reiniciar foto
document.getElementById('btn-reiniciar').addEventListener('click', () => {
    fotoCapturada = null;
    document.getElementById('foto-preview').innerHTML = '';
    document.getElementById('foto-upload').value = '';
    Webcam.reset('#camera-preview');
    iniciarCamera();
});

// Evento para selecionar arquivo
document.getElementById('foto-upload').addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
        const reader = new FileReader();
        reader.onload = (event) => {
            fotoCapturada = event.target.result;
            document.getElementById('foto-preview').innerHTML = `
                <img src="${event.target.result}" class="img-thumbnail">
                <p class="text-success mt-2 mb-0">Imagem selecionada!</p>
            `;
        };
        reader.readAsDataURL(e.target.files[0]);
    }
});

// Função para upload da foto
async function uploadFoto(userId) {
    try {
        let file;
        let fileName = `membro-${userId}-${Date.now()}.jpg`;
        
        if (fotoCapturada.includes('base64')) {
            // Se for foto da câmera (Base64)
            const blob = await fetch(fotoCapturada).then(r => r.blob());
            file = new File([blob], fileName, { type: 'image/jpeg' });
        } else {
            // Se for arquivo selecionado
            file = document.getElementById('foto-upload').files[0];
            fileName = file.name;
        }

        const { data, error } = await supabase.storage
            .from('membros-fotos')
            .upload(fileName, file);

        if (error) throw error;

        // Obtém URL pública
        const { data: { publicUrl } } = supabase.storage
            .from('membros-fotos')
            .getPublicUrl(data.path);

        return publicUrl;
    } catch (error) {
        console.error("Erro no upload da foto:", error);
        return null;
    }
}

// Cadastro do membro
document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cadastrando...';

    try {
        // Coleta os dados do formulário
        const formData = {
            nome: document.getElementById('nome').value.trim(),
            data_nascimento: document.getElementById('data-nascimento').value || null,
            telefone: document.getElementById('telefone').value.trim(),
            email: document.getElementById('email').value.trim() || null,
            endereco: document.getElementById('endereco').value.trim() || null,
            data_batismo: document.getElementById('data-batismo').value || null,
            cargo: document.getElementById('cargo').value || null,
        };

        // Validação básica
        if (!formData.nome || !formData.telefone) {
            throw new Error('Nome e telefone são obrigatórios');
        }

        // Upload da foto (se existir)
        if (fotoCapturada) {
            formData.foto_url = await uploadFoto(Date.now());
        }

        // Insere no banco de dados
        const { data, error } = await supabase
            .from('membros')
            .insert([formData])
            .select();

        if (error) throw error;

        // Mostra modal de sucesso
        if (formData.foto_url) {
            document.getElementById('modal-foto').innerHTML = `
                <img src="${formData.foto_url}" class="img-thumbnail">
            `;
        }
        modalSucesso.show();

        // Limpa o formulário
        e.target.reset();
        document.getElementById('foto-preview').innerHTML = '';
        fotoCapturada = null;
        document.getElementById('foto-upload').value = '';
        Webcam.reset('#camera-preview');
        iniciarCamera();

    } catch (error) {
        console.error("Erro no cadastro:", error);
        alert(`Erro: ${error.message}`);
    } finally {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = 'Cadastrar Membro';
    }
});

// Inicia a câmera quando a página carrega
window.addEventListener('DOMContentLoaded', iniciarCamera);
