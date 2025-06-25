// app.js
import { db, storage } from './firebase-config.js';
import { ref as dbRef, push, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";
import { ref as storageRef, uploadBytes } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

const form = document.getElementById("form-membro");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = form.nome.value;
  const endereco = form.endereco.value;
  const batismo = form.batismo.value;
  const funcao = form.funcao.value;
  const fotoFile = document.getElementById("foto").files[0];

  const newMemberRef = push(dbRef(db, "membros"));
  const memberId = newMemberRef.key;

  const fotoStorageRef = storageRef(storage, `fotos/${memberId}`);
  await uploadBytes(fotoStorageRef, fotoFile);

  await set(newMemberRef, {
    nome,
    endereco,
    batismo,
    funcao
  });

  alert("Membro cadastrado com sucesso!");
  form.reset();
});
