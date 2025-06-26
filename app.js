// app.js
import { db } from './firebase-config.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

const form = document.getElementById("form-membro");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = form.nome.value;
  const endereco = form.endereco.value;
  const batismo = form.batismo.value;
  const funcao = form.funcao.value;

  if (!nome || !endereco || !batismo || !funcao) {
    alert("Preencha todos os campos!");
    return;
  }

  try {
    const novoRef = push(ref(db, "membros"));
    await set(novoRef, {
      nome,
      endereco,
      batismo,
      funcao
    });

    alert("Membro cadastrado com sucesso!");
    form.reset();
  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    alert("Erro ao cadastrar membro.");
  }
});
