// app.js
import { db } from './firebase-config.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Função que envia a imagem para o Cloudinary e retorna a URL
async function uploadImagemCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "igreja_preset"); // substitua pelo seu preset real

  const response = await fetch("https://api.cloudinary.com/v1_1/bcrenato/image/upload", {
    method: "POST",
    body: formData
  });

  if (!response.ok) throw new Error("Erro no upload da imagem");
  const data = await response.json();
  return data.secure_url;
}

// Elementos da página
const form = document.getElementById("form-membro");
const fotoInput = document.getElementById("foto");
const preview = document.getElementById("preview");

// Evento de envio do formulário
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  // Obter valores do formulário - FORMA CORRETA
  const nome = form.nome.value;
  const endereco = form.endereco.value;
  const batismo = form.batismo.value;
  const nascimento = form.nascimento.value;
  const funcao = form.funcao.value;
  const telefone = form.telefone.value;
  const sexo = document.querySelector('input[name="sexo"]:checked')?.value; // Correção aqui
  const fotoFile = fotoInput.files[0];

  // Validação dos campos obrigatórios
  if (!fotoFile) {
    alert("Por favor, selecione uma foto.");
    return;
  }

  if (!sexo) {
    alert("Por favor, selecione o sexo.");
    return;
  }

  try {
   
    const fotoURL = await uploadImagemCloudinary(fotoFile);

    const novoRef = push(ref(db, "membros"));
    await set(novoRef, {
      nome,
      endereco,
      batismo,
      nascimento,
      funcao,
      telefone,
      sexo,
      fotoURL
    });

    alert("Membro cadastrado com sucesso!");
    location.reload(); // 🔁 Recarrega a página e limpa tudo

  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    alert("Erro ao cadastrar membro.");
  }
});

// Preview da foto ao selecionar imagem
fotoInput.addEventListener("change", () => {
  const file = fotoInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      preview.src = reader.result;
      preview.style.display = "block";
    };
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
    preview.style.display = "none";
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
