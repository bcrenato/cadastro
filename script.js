// Configuração do Supabase
const supabaseUrl = 'https://gtpsdstjfdygmdkgevml.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0cHNkc3RqZmR5Z21ka2dldm1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4Nzk4MTgsImV4cCI6MjA2NjQ1NTgxOH0.xj78Xz4rOgQ4Xrn_feLakJLbUb-4rGMxU9Ul-rb5yec';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Variáveis globais
let fotoCapturada = null;
const modalSucesso = new bootstrap.Modal('#modal-sucesso');

// 1. SOLUÇÃO PARA A CÂMERA
async function iniciarCamera() {
    try {
        // Verifica se o Webcam.js está carregado
        if (typeof Webcam === 'undefined') {
            throw new Error('Biblioteca de câmera não carregada');
        }

        // Configuração otimizada da câmera
        Webcam.set({
            width: 320,
            height: 240,
            dest_width: 320,
            dest_height: 240,
            image_format: 'jpeg',
            jpeg_quality: 85,
            constraints: {
                facingMode: 'user',
                width: { exact: 320 },
                height: { exact: 240 }
            }
        });

        // Tenta iniciar a câmera
        Webcam.attach('#camera-preview', {
            onError: () => {
                throw new Error('Não foi possível acessar a câmera');
            },
            onLoad: () => {
                console.log('Câmera iniciada com sucesso');
            }
        });

    } catch (error) {
        console.error("Erro na câmera:", error);
        document.getElementById('camera-preview').innerHTML = `
            <div class="alert alert-warning p-2">
                <small>
                    <i class="bi bi-exclamation-triangle"></i> 
                    ${error.message || 'Erro ao acessar a câmera'}. 
                    Use o upload de arquivo.
                </small>
            </div>
        `;
        return false;
    }
    return true;
}

// 2. SOLUÇÃO PARA O CADASTRO
async function cadastrarMembro(formData) {
    try {
        // Verificação básica
        if (!formData.nome || !formData.telefone) {
            throw new Error('Nome e telefone são obrigatórios');
        }

        // Upload da foto se existir
        if (fotoCapturada) {
            const fotoUrl = await uploadFoto();
            if (fotoUrl) formData.foto_url = fotoUrl;
        }

        // Insere no Supabase
        const { data, error } = await supabase
            .from('membros')
            .insert([formData])
            .select();

        if (error) {
            console.error('Erro Supabase:', error);
            throw new Error(error.message || 'Erro ao cadastrar');
        }

        return data[0]; // Retorna o membro cadastrado

    } catch (error) {
        console.error('Erro no cadastro:', error);
        throw error;
    }
}

// 3. FUNÇÃO DE UPLOAD REVISADA
async function uploadFoto() {
    try {
        const fileName = `membro-${Date.now()}.jpg`;
        let file;

        if (fotoCapturada.includes('base64')) {
            const blob = await fetch(fotoCapturada).then(r => r.blob());
            file = new File([blob], fileName, { type: 'image/jpeg' });
        } else {
            file = document.getElementById('foto-upload').files[0];
        }

        const { data, error } = await supabase.storage
            .from('membros-fotos')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        return supabase.storage
            .from('membros-fotos')
            .getPublicUrl(data.path).data.publicUrl;

    } catch (error) {
        console.error('Erro no upload:', error);
        throw new Error('Erro ao salvar a foto');
    }
}

// EVENTOS PRINCIPAIS
document.addEventListener('DOMContentLoaded', async () => {
    // Inicia a câmera
    const cameraIniciada = await iniciarCamera();
    if (!cameraIniciada) {
        document.getElementById('btn-tirar-foto').disabled = true;
    }

    // Evento de tirar foto
    document.getElementById('btn-tirar-foto').addEventListener('click', () => {
        Webcam.snap((dataUri) => {
            fotoCapturada = dataUri;
            document.getElementById('foto-preview').innerHTML = `
                <div class="alert alert-success p-2 mb-2">
                    <small>Foto capturada!</small>
                </div>
                <img src="${dataUri}" class="img-fluid rounded border">
            `;
        });
    });

    // Evento de submit do formulário
    document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const btn = e.target.querySelector('button[type="submit"]');
        const btnOriginal = btn.innerHTML;
        
        try {
            // Mostra loading
            btn.disabled = true;
            btn.innerHTML = `
                <span class="spinner-border spinner-border-sm"></span>
                Cadastrando...
            `;

            // Coleta os dados
            const formData = {
                nome: document.getElementById('nome').value.trim(),
                data_nascimento: document.getElementById('data-nascimento').value || null,
                telefone: document.getElementById('telefone').value.trim(),
                email: document.getElementById('email').value.trim() || null,
                endereco: document.getElementById('endereco').value.trim() || null,
                data_batismo: document.getElementById('data-batismo').value || null,
                cargo: document.getElementById('cargo').value || null
            };

            // Cadastra
            const membroCadastrado = await cadastrarMembro(formData);
            
            // Feedback visual
            document.querySelector('#modal-sucesso .modal-body').innerHTML = `
                <div class="text-center">
                    <div class="mb-3">
                        <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" fill="#28a745" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zm-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                        </svg>
                    </div>
                    <h5 class="text-success mb-3">Cadastro realizado!</h5>
                    <p>${membroCadastrado.nome} foi cadastrado(a) com sucesso.</p>
                    ${membroCadastrado.foto_url ? `
                        <div class="mt-3">
                            <img src="${membroCadastrado.foto_url}" class="img-thumbnail" style="max-height: 150px">
                        </div>
                    ` : ''}
                </div>
            `;

            modalSucesso.show();
            
            // Limpa o formulário
            setTimeout(() => {
                e.target.reset();
                document.getElementById('foto-preview').innerHTML = '';
                fotoCapturada = null;
                document.getElementById('foto-upload').value = '';
                if (typeof Webcam !== 'undefined' && Webcam.live) {
                    Webcam.reset('#camera-preview');
                    iniciarCamera();
                }
            }, 1500);

        } catch (error) {
            // Mostra erro
            const alerta = document.createElement('div');
            alerta.className = 'alert alert-danger mt-3';
            alerta.innerHTML = `
                <i class="bi bi-exclamation-circle"></i>
                ${error.message || 'Erro ao cadastrar membro'}
            `;
            
            e.target.insertBefore(alerta, btn);
            setTimeout(() => alerta.remove(), 5000);
            
        } finally {
            // Restaura o botão
            btn.disabled = false;
            btn.innerHTML = btnOriginal;
        }
    });
});
