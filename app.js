// app.js
import { db, storage } from './firebase-config.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";
import { ref, uploadBytes } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-storage.js";

const form = document.getElementById("form-membro");
form.addEventListener("submit", async e => {
  e.preventDefault();

  const nome = form.nome.value;
  const endereco = form.endereco.value;
  const batismo = form.batismo.value;
  const funcao = form.funcao.value;
  const fotoFile = document.getElementById("foto").files[0];

  const docRef = await addDoc(collection(db, "membros"), { nome, endereco, batismo, funcao });
  const storageRef = ref(storage, `fotos/${docRef.id}`);
  await uploadBytes(storageRef, fotoFile);

  alert("Membro cadastrado com sucesso!");
  form.reset();
});
