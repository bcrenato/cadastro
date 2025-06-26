// app.js
import { db } from './firebase-config.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Função que envia a imagem para o Cloudinary e retorna a URL
async function uploadImagemCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "igreja_preset");

  try {
    const response = await fetch("https://api.cloudinary.com/v1_1/bcrenato/image/upload", {
      method: "POST",
      body: formData
    });

    if (!response.ok) throw new Error("Erro no upload da imagem");
    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error("Erro no upload:", error);
    throw error;
  }
}

// Elementos da página
const form = document.getElementById("form-membro");
const fotoInput = document.getElementById("foto");
const preview = document.getElementById("preview");

// Preview da foto ao selecionar imagem
fotoInput.addEventListener("change", () => {
  const file = fotoInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      preview.src = e.target.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.style.display = "none";
  }
});

// Evento de envio do formulário
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Obter valores do formulário
  const nome = form.nome.value;
  const endereco = form.endereco.value;
  const batismo = form.batismo.value;
  const nascimento = form.nascimento.value;
  const funcao = form.funcao.value;
  const telefone = form.telefone.value;
  const sexo = form.sexo.value;
  const fotoFile = fotoInput.files[0];

  // Validação básica
  if (!fotoFile) {
    alert("Por favor, selecione uma foto.");
    return;
  }

  try {
    // Mostrar feedback visual de carregamento
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Cadastrando...';

    // Upload da imagem
    const fotoURL = await uploadImagemCloudinary(fotoFile);

    // Salvar no Firebase
    const novoRef = push(ref(db, "membros"));
    await set(novoRef, {
      nome,
      endereco,
      batismo,
      nascimento,
      funcao,
      telefone,
      sexo,
      fotoURL,
      timestamp: new Date().toISOString()
    });

    alert("Membro cadastrado com sucesso!");
    form.reset();
    preview.style.display = "none";
    
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    alert(`Erro ao cadastrar membro: ${error.message}`);
  } finally {
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = false;
    submitBtn.textContent = "Cadastrar Membro";
  }
});

// Máscara para telefone
document.getElementById('telefone').addEventListener('input', function(e) {
  let value = e.target.value.replace(/\D/g, '');
  
  // Aplicar máscara (00) 00000-0000
  if (value.length > 2) {
    value = `(${value.substring(0, 2)}) ${value.substring(2, 7)}`;
    if (value.length > 10) {
      value = `${value}-${value.substring(10, 14)}`;
    }
  }
  
  e.target.value = value.substring(0, 15); // Limitar ao tamanho máximo
});
