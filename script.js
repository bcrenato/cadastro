// Configuração do Supabase (substitua pelas suas credenciais)
const supabaseUrl = 'https://gtpsdstjfdygmdkgevml.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0cHNkc3RqZmR5Z21ka2dldm1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4Nzk4MTgsImV4cCI6MjA2NjQ1NTgxOH0.xj78Xz4rOgQ4Xrn_feLakJLbUb-4rGMxU9Ul-rb5yec';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Variáveis globais
let fotoCapturada = null;
const modalSucesso = new bootstrap.Modal(document.getElementById('modal-sucesso'));

// Inicialização da câmera
// Modifique a função iniciarCamera()
async function iniciarCamera() {
    try {
        // Verifica se o navegador suporta câmera
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Navegador não suporta acesso à câmera');
        }
        
        // Solicita permissão antes de inicializar
        await navigator.mediaDevices.getUserMedia({ video: true });
        
        Webcam.set({
            width: 320,
            height: 240,
            dest_width: 320,
            dest_height: 240,
            image_format: 'jpeg',
            jpeg_quality: 90,
            constraints: {
                facingMode: 'user',
                width: { ideal: 320 },
                height: { ideal: 240 }
            }
        });
        
        Webcam.attach('#camera-preview');
        
    } catch (error) {
        console.error("Erro na câmera:", error);
        document.getElementById('camera-preview').innerHTML = `
            <div class="alert alert-warning">
                Câmera não disponível: ${error.message}
                <br>Você pode enviar uma foto do arquivo.
            </div>
        `;
    }
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
// Modifique o evento de submit do formulário
document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btnSubmit = e.target.querySelector('button[type="submit"]');
    const originalText = btnSubmit.innerHTML;
    
    try {
        // Feedback visual
        btnSubmit.disabled = true;
        btnSubmit.innerHTML = `
            <span class="spinner-border spinner-border-sm" role="status"></span>
            Cadastrando...
        `;

        // Coleta dados do formulário
        const formData = {
            nome: document.getElementById('nome').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            // ... (outros campos)
        };

        // Validação obrigatória
        if (!formData.nome || !formData.telefone) {
            throw new Error('Preencha todos os campos obrigatórios');
        }

        // Upload da foto (se existir)
        if (fotoCapturada) {
            formData.foto_url = await uploadFoto(Date.now());
        }

        // Cadastro no Supabase
        const { data, error } = await supabase
            .from('membros')
            .insert([formData])
            .select();

        if (error) throw error;

        // Feedback visual de sucesso
        const modalBody = document.querySelector('#modal-sucesso .modal-body');
        modalBody.innerHTML = `
            <div class="text-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" fill="#28a745" viewBox="0 0 16 16">
                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                </svg>
                <h4 class="mt-3 text-success">Cadastro realizado!</h4>
                ${formData.foto_url ? `<img src="${formData.foto_url}" class="img-thumbnail mt-3" style="max-height: 150px">` : ''}
                <p class="mt-3">${formData.nome} foi cadastrado(a) com sucesso.</p>
            </div>
        `;

        // Mostra o modal
        modalSucesso.show();

        // Limpa o formulário (com delay para melhor UX)
        setTimeout(() => {
            e.target.reset();
            document.getElementById('foto-preview').innerHTML = '';
            fotoCapturada = null;
            document.getElementById('foto-upload').value = '';
            if (Webcam.live) Webcam.reset('#camera-preview');
            iniciarCamera();
        }, 1000);

    } catch (error) {
        // Feedback visual de erro
        const errorContainer = document.createElement('div');
        errorContainer.className = 'alert alert-danger mt-3';
        errorContainer.innerHTML = `
            <strong>Erro:</strong> ${error.message}
        `;
        
        // Insere após o botão de submit
        btnSubmit.parentNode.insertBefore(errorContainer, btnSubmit.nextSibling);
        
        // Remove o erro após 5 segundos
        setTimeout(() => {
            errorContainer.remove();
        }, 5000);
        
        console.error("Erro no cadastro:", error);
    } finally {
        // Restaura o botão
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText;
    }
});

// Inicia a câmera quando a página carrega
window.addEventListener('DOMContentLoaded', iniciarCamera);
