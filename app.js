// app.js
import { db } from './firebase-config.js';
import { ref, push, set } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-database.js";

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

const form = document.getElementById("form-membro");
const fotoInput = document.getElementById("foto");
const preview = document.getElementById("preview");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const nome = form.nome.value;
  const cep = form.cep.value;
  const endereco = form.endereco.value;
  const bairro = form.bairro.value;
  const cidade = form.cidade.value;
  const estado = form.estado.value;
  const batismo = form.batismo.value;
  const nascimento = form.nascimento.value;
  const funcao = form.funcao.value;
  const telefone = form.telefone.value;
  const sexo = form.sexo.value;
  const fotoFile = fotoInput.files[0];

  let fotoURL = "sem-foto.png"; // URL padrão para quem não envia foto

  try {
    if (fotoFile) {
      fotoURL = await uploadImagemCloudinary(fotoFile);
    }

    const novoRef = push(ref(db, "membros"));
    await set(novoRef, {
      nome,
      cep,
      endereco,
      bairro,
      cidade,
      estado,
      batismo,
      nascimento,
      funcao,
      telefone,
      sexo,
      fotoURL
    });

    alert("Membro cadastrado com sucesso!");
    location.reload();

  } catch (error) {
    console.error("Erro ao cadastrar:", error);
    alert("Erro ao cadastrar membro.");
  }
});

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
    preview.src = "sem-foto.png";
    preview.style.display = "block";
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const cepInput = document.getElementById('cep');
  IMask(cepInput, { mask: '00000-000' });
});

window.buscarCEP = function () {
  const cepInput = document.getElementById('cep');
  const cep = cepInput.value.replace(/\D/g, '');

  if (cep.length === 8) {
    fetch(`https://viacep.com.br/ws/${cep}/json/`)
      .then(response => response.json())
      .then(data => {
        if (data.erro) {
          document.getElementById('endereco').value = 'CEP não encontrado';
          document.getElementById('bairro').value = '';
          document.getElementById('cidade').value = '';
          document.getElementById('estado').value = '';
        } else {
          const ruaComNumero = `${data.logradouro}, Nº`;
          document.getElementById('endereco').value = ruaComNumero;

          document.getElementById('bairro').value = data.bairro || '';
          document.getElementById('cidade').value = data.localidade || '';
          document.getElementById('estado').value = data.uf || '';
        }
      })
      .catch(error => {
        console.error('Erro ao buscar o CEP:', error);
        document.getElementById('endereco').value = 'Erro ao buscar';
        document.getElementById('bairro').value = '';
        document.getElementById('cidade').value = '';
        document.getElementById('estado').value = '';
      });
  } else {
    document.getElementById('endereco').value = '';
    document.getElementById('bairro').value = '';
    document.getElementById('cidade').value = '';
    document.getElementById('estado').value = '';
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const telefoneInput = document.getElementById('telefone');

  IMask(telefoneInput, {
    mask: [
      {
        mask: '(00) 0000-0000',
      },
      {
        mask: '(00) 00000-0000',
      }
    ],
    dispatch: function (appended, dynamicMasked) {
      const number = (dynamicMasked.value + appended).replace(/\D/g, '');
      return number.length > 10
        ? dynamicMasked.compiledMasks[1]
        : dynamicMasked.compiledMasks[0];
    }
  });
});
