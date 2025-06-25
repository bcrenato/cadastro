// Configuração do Supabase
const supabase = supabase.createClient(
    'https://gtpsdstjfdygmdkgevml.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0cHNkc3RqZmR5Z21ka2dldm1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4Nzk4MTgsImV4cCI6MjA2NjQ1NTgxOH0.xj78Xz4rOgQ4Xrn_feLakJLbUb-4rGMxU9Ul-rb5yec'
);

// Variáveis globais
let fotoCapturada = null;
let webcamAtiva = false;

// 1. Solução definitiva para a câmera
async function iniciarCamera() {
    return new Promise((resolve) => {
        // Verifica se o Webcam.js carregou
        if (typeof Webcam === 'undefined') {
            console.error('Webcam.js não carregou');
            document.getElementById('camera-preview').innerHTML = `
                <div class="alert alert-warning">
                    Câmera não disponível. Use o upload de arquivo.
                </div>
            `;
            return resolve(false);
        }

        Webcam.set({
            width: 320,
            height: 240,
            dest_width: 320,
            dest_height: 240,
            image_format: 'jpeg',
            jpeg_quality: 90,
            constraints: {
                facingMode: 'user'
            }
        });

        Webcam.attach('#camera-preview', function() {
            webcamAtiva = true;
            console.log('Câmera iniciada com sucesso');
            resolve(true);
        }, function(err) {
            console.error('Erro na câmera:', err);
            document.getElementById('camera-preview').innerHTML = `
                <div class="alert alert-warning">
                    Permissão de câmera negada. Use o upload de arquivo.
                </div>
            `;
            resolve(false);
        });
    });
}

// 2. Função de upload revisada
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
            .upload(fileName, file);

        if (error) throw error;

        return supabase.storage
            .from('membros-fotos')
            .getPublicUrl(data.path).data.publicUrl;

    } catch (error) {
        console.error('Erro no upload:', error);
        throw new Error('Não foi possível salvar a foto');
    }
}

// 3. Cadastro otimizado
async function cadastrarMembro(dados) {
    const { data, error } = await supabase
        .from('membros')
        .insert([dados])
        .select();

    if (error) {
        console.error('Erro no Supabase:', error);
        throw new Error(error.message || 'Erro ao cadastrar');
    }

    return data[0];
}

// Eventos principais
document.addEventListener('DOMContentLoaded', async () => {
    // Inicia a câmera
    const cameraPronta = await iniciarCamera();
    document.getElementById('btn-tirar-foto').disabled = !cameraPronta;

    // Evento de tirar foto
    document.getElementById('btn-tirar-foto').addEventListener('click', () => {
        Webcam.snap((dataUri) => {
            fotoCapturada = dataUri;
            document.getElementById('foto-preview').innerHTML = `
                <img src="${dataUri}" class="img-thumbnail mt-2">
                <div class="alert alert-success mt-2 p-2">
                    Foto capturada com sucesso!
                </div>
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
            const dadosMembro = {
                nome: document.getElementById('nome').value.trim(),
                telefone: document.getElementById('telefone').value.trim(),
                email: document.getElementById('email').value.trim() || null,
                data_nascimento: document.getElementById('data-nascimento').value || null,
                endereco: document.getElementById('endereco').value.trim() || null,
                data_batismo: document.getElementById('data-batismo').value || null,
                cargo: document.getElementById('cargo').value || null
            };

            // Upload da foto se existir
            if (fotoCapturada) {
                dadosMembro.foto_url = await uploadFoto();
            }

            // Cadastra o membro
            const membroCadastrado = await cadastrarMembro(dadosMembro);
            
            // Feedback visual
            const modal = new bootstrap.Modal('#modal-sucesso');
            document.querySelector('#modal-sucesso .modal-body').innerHTML = `
                <div class="text-center">
                    <i class="bi bi-check-circle-fill text-success" style="font-size: 3rem;"></i>
                    <h4 class="mt-3">Cadastro realizado!</h4>
                    <p>${membroCadastrado.nome} foi cadastrado com sucesso.</p>
                    ${membroCadastrado.foto_url ? `
                        <img src="${membroCadastrado.foto_url}" class="img-thumbnail mt-2" style="max-height: 150px">
                    ` : ''}
                </div>
            `;
            modal.show();
            
            // Limpa o formulário
            setTimeout(() => {
                e.target.reset();
                document.getElementById('foto-preview').innerHTML = '';
                fotoCapturada = null;
                document.getElementById('foto-upload').value = '';
                if (webcamAtiva) {
                    Webcam.reset('#camera-preview');
                    iniciarCamera();
                }
                btn.disabled = false;
                btn.innerHTML = btnOriginal;
            }, 2000);

        } catch (error) {
            // Mostra erro
            const alerta = document.createElement('div');
            alerta.className = 'alert alert-danger mt-3';
            alerta.innerHTML = `
                <i class="bi bi-exclamation-triangle"></i>
                ${error.message || 'Erro ao cadastrar'}
            `;
            
            e.target.appendChild(alerta);
            setTimeout(() => alerta.remove(), 5000);
            
            // Restaura o botão
            btn.disabled = false;
            btn.innerHTML = btnOriginal;
        }
    });
});
