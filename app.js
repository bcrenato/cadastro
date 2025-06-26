import { db } from './firebase-config.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

// Função que envia a imagem para o Cloudinary e retorna a URL
async function uploadImagemCloudinary(file) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "igreja_preset"); // coloque o nome do seu preset

  const response = await fetch("https://api.cloudinary.com/v1_1/bcrenato/image/upload", {
    method: "POST",
    body: formData
  });

  if (!response.ok) throw new Error("Erro no upload da imagem");
  const data = await response.json();
  return data.secure_url;
}

// Lógica do formulário
const form = document.getElementById("form-membro");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = form.nome.value;
  const endereco = form.endereco.value;
  const batismo = form.batismo.value;
  const funcao = form.funcao.value;
  const fotoFile = document.getElementById("foto").files[0];

  if (!fotoFile) {
    alert("Selecione uma foto.");
    return;
  }

  try {
    const fotoURL = await uploadImagemCloudinary(fotoFile);

    const novoRef = push(ref(db, "membros"));
    await set(novoRef, {
      nome,
      endereco,
      batismo,
      funcao,
      fotoURL
    });

    alert("Membro cadastrado com sucesso!");
    form.reset();
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    alert("Erro ao cadastrar membro.");
  }
});
