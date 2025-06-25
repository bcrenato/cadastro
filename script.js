// Configuração do Supabase
const supabase = supabase.createClient(
    'https://gtpsdstjfdygmdkgevml.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0cHNkc3RqZmR5Z21ka2dldm1sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA4Nzk4MTgsImV4cCI6MjA2NjQ1NTgxOH0.xj78Xz4rOgQ4Xrn_feLakJLbUb-4rGMxU9Ul-rb5yec'
);

// Variáveis globais
let fotoCapturada = null;

// Função simplificada para mobile
function capturarFoto() {
    return new Promise((resolve) => {
        // Usa o input file com capture para melhor experiência mobile
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.capture = 'environment'; // Usa a câmera traseira
        fileInput.style.display = 'none';
        
        fileInput.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    fotoCapturada = event.target.result;
                    document.getElementById('foto-preview').innerHTML = `
                        <img src="${fotoCapturada}" class="img-fluid rounded border">
                    `;
                    resolve(true);
                };
                reader.readAsDataURL(file);
            }
        };
        
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    });
}

// Upload adaptado para mobile
async function uploadFoto() {
    try {
        const fileName = `membro-${Date.now()}.jpg`;
        const file = await dataURLtoFile(fotoCapturada, fileName);
        
        const { data, error } = await supabase.storage
            .from('membros-fotos')
            .upload(fileName, file);
        
        if (error) throw error;
        
        return supabase.storage
            .from('membros-fotos')
            .getPublicUrl(data.path).data.publicUrl;
    } catch (error) {
        console.error('Erro no upload:', error);
        return null;
    }
}

// Conversor de Base64 para File
function dataURLtoFile(dataurl, filename) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    
    return new File([u8arr], filename, { type: mime });
}

// Cadastro otimizado para mobile
document.getElementById('form-cadastro').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const btn = e.target.querySelector('button[type="submit"]');
    const btnOriginal = btn.innerHTML;
    
    try {
        btn.disabled = true;
        btn.innerHTML = 'Enviando...';
        
        // Se não tem foto, pede para capturar
        if (!fotoCapturada) {
            const querFoto = confirm('Deseja adicionar uma foto?');
            if (querFoto) {
                const fotoCapturadaComSucesso = await capturarFoto();
                if (!fotoCapturadaComSucesso) return;
            }
        }
        
        // Coleta dados do formulário
        const dadosMembro = {
            nome: document.getElementById('nome').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            // ... outros campos
        };
        
        // Upload da foto se existir
        if (fotoCapturada) {
            dadosMembro.foto_url = await uploadFoto();
        }
        
        // Envia para o Supabase
        const { data, error } = await supabase
            .from('membros')
            .insert([dadosMembro])
            .select();
        
        if (error) throw error;
        
        // Feedback visual
        document.getElementById('modal-message').innerHTML = `
            <h5 class="text-success">Cadastrado!</h5>
            <p>${dadosMembro.nome} foi registrado.</p>
            ${dadosMembro.foto_url ? `<img src="${dadosMembro.foto_url}" class="img-fluid mt-2">` : ''}
        `;
        
        const modal = new bootstrap.Modal('#modal-sucesso');
        modal.show();
        
        // Limpa o formulário após 2 segundos
        setTimeout(() => {
            e.target.reset();
            document.getElementById('foto-preview').innerHTML = '';
            fotoCapturada = null;
            btn.disabled = false;
            btn.innerHTML = btnOriginal;
        }, 2000);
        
    } catch (error) {
        alert(`Erro: ${error.message}`);
        btn.disabled = false;
        btn.innerHTML = btnOriginal;
    }
});

// Evento simplificado para mobile
document.getElementById('btn-tirar-foto').addEventListener('click', async () => {
    await capturarFoto();
});
