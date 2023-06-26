// Declaración de variables
let data = []; // Array para almacenar los datos de las imágenes
let pdfName = ""; // Nombre del archivo PDF
let margin = "pequeño"; // Margen de la imagen
let x;
let y;
let width;
let height;
let size = 0;
// Elementos del DOM
const createPDF = document.getElementById("create-pdf"); // Contenedor para mostrar las imágenes seleccionadas
const inputPage = document.getElementById("input-page"); // Página para seleccionar imágenes
const pdfPage = document.getElementById("pdf-page"); // Página para mostrar el PDF
const convertBtn = document.getElementById("convertBtn"); // Botón de conversión
const uploadFile = document.getElementById("upload-file"); // Entrada de carga de archivos
const home = document.getElementById("home"); // Botón de inicio
const optionSize = document.getElementById("op-size");
const marginBtns = document.querySelectorAll(".margin-btn");
const configContainer = document.getElementById("config-container");
// Función para codificar archivos de imágenes como URL

const encodeImageFileAsURL = (element) => {
  configContainer.style.display = "block";
  inputPage.style.display = "none";
  pdfPage.style.display = "inline-block";

  const length = element.files.length;
  for (let i = 0; i < length; i++) {
    let file = element.files[i];
    let pdfname = element.files[i];
    let reader = new FileReader();
    reader.readAsDataURL(file);

    // Crear un objeto para almacenar los datos de la imagen
    let obj = {
      list: reader,
      fileName: file.name,
      time: new Date().toString() + i,
    };

    // Leer el archivo y manejar el evento de carga
    reader.onloadend = () => {
      data = [...data, obj]; // Agregar el objeto al array de datos
      pdfName = pdfname.name; // Establecer el nombre del PDF
      convertToPDF(); // Actualizar la visualización del PDF
    };
  }

  uploadFile.value = null; // Restablecer el valor de la entrada de archivos
};

// Función para manejar el evento de eliminación de una imagen
const handleDelete = (e) => {
  data = data.filter((item) => item.time !== e.currentTarget.id);
  if (data.length === 0) {
    location.reload(); // Recargar la página si no hay imágenes restantes
  } else {
    convertToPDF(); // Actualizar la visualización del PDF si quedan imágenes
  }
};

// Función para mover un elemento hacia arriba en la lista
const moveUp = (e) => {
  const index = data.findIndex((item) => item.time === e.currentTarget.id);
  if (index > 0) {
    const temp = data[index];
    data[index] = data[index - 1];
    data[index - 1] = temp;
    convertToPDF();
  }
};

// Función para mover un elemento hacia abajo en la lista
const moveDown = (e) => {
  const index = data.findIndex((item) => item.time === e.currentTarget.id);
  if (index < data.length - 1) {
    const temp = data[index];
    data[index] = data[index + 1];
    data[index + 1] = temp;
    convertToPDF();
  }
};

// Función para incrustar las imágenes en el PDF
const embedImages = async () => {
  if (margin == "sinMargen") {
    margin = 0;
  } else if (margin == "pequeño") {
    margin = 20;
  } else if (margin == "grande") {
    margin = 30;
  }

  const pdfDoc = await PDFLib.PDFDocument.create();
  for (let i = 0; i < data.length; i++) {
    const jpgUrl = data[i].list.result;
    const jpgImageBytes = await fetch(jpgUrl).then((res) => res.arrayBuffer());
    const jpgImage = await pdfDoc.embedJpg(jpgImageBytes);
    const page = pdfDoc.addPage();
    if (size == 1) {
      // Obtener el tamaño de la imagen
      const jpgDims = jpgImage.scale(0.5);
      const jpgWidth = jpgDims.width;
      const jpgHeight = jpgDims.height;
      page.setSize(jpgWidth, jpgHeight);
      x = margin;
      y = margin;
      width = page.getWidth() - margin * 2;
      height = page.getHeight() - margin * 2;
      page.drawImage(jpgImage, { x, y, width, height });
    } else {
      // El tamaño de la hoja es de a4
      page.setSize(595, 842);
      const jpgDims = jpgImage.scale(1);
      const jpgWidth = jpgDims.width;
      const jpgHeight = jpgDims.height;
      const aspectRatio = jpgWidth / jpgHeight;
      const x = margin;
      const y = (page.getHeight() - page.getWidth() / aspectRatio) / 2 + margin;
      const width = page.getWidth() - margin * 2;
      const height = width / aspectRatio;
      page.drawImage(jpgImage, { x, y, width, height });
    }
  }

  const pdfBytes = await pdfDoc.save();

  download(pdfBytes, pdfName.slice(0, -4), "application/pdf");

  setTimeout(backToHome, 1000);
};

// Función para convertir las imágenes en elementos del PDF
function convertToPDF() {
  createPDF.innerHTML = "";
  data.forEach((item, index) => {
    const fileItem = document.createElement("div");
    fileItem.setAttribute("class", "file-item");

    const modify = document.createElement("div");
    modify.setAttribute("class", "modify");

    const btnDel = document.createElement("button");
    btnDel.setAttribute("class", "delete-btn");
    btnDel.setAttribute("id", item.time);
    const trash = document.createElement("i");
    trash.setAttribute("class", "fa fa-trash");
    btnDel.appendChild(trash);
    btnDel.addEventListener("click", (e) => {
      handleDelete(e);
    });

    modify.appendChild(btnDel);
    fileItem.appendChild(modify);

    const imgContainer = document.createElement("div");
    imgContainer.setAttribute("class", "img-container");
    const img = document.createElement("img");
    img.setAttribute("id", "img");
    img.src = item.list.result;

    imgContainer.appendChild(img);
    fileItem.appendChild(imgContainer);

    const imgName = document.createElement("p");
    imgName.setAttribute("id", "img-name");
    imgName.innerHTML = item.fileName;
    fileItem.appendChild(imgName);
    createPDF.appendChild(fileItem);

    const btnContainer = document.createElement("div");
    btnContainer.setAttribute("class", "btn-container");
    fileItem.appendChild(btnContainer);

    const btnUp = document.createElement("button");
    btnUp.setAttribute("class", "up-btn");
    btnUp.setAttribute("id", item.time);
    const up = document.createElement("i");
    up.setAttribute("class", "fa fa-chevron-left");
    btnUp.appendChild(up);
    if (index === 0) {
      btnUp.style.display = "none"; // Ocultar el botón si es el primer elemento
    } else {
      btnUp.addEventListener("click", (e) => {
        moveUp(e);
      });
    }

    const btnDown = document.createElement("button");
    btnDown.setAttribute("class", "down-btn");
    btnDown.setAttribute("id", item.time);
    const down = document.createElement("i");
    down.setAttribute("class", "fa fa-chevron-right");
    btnDown.appendChild(down);
    if (index === data.length - 1) {
      btnDown.style.display = "none"; // Ocultar el botón si es el último elemento
    } else {
      btnDown.addEventListener("click", (e) => {
        moveDown(e);
      });
    }

    btnContainer.appendChild(btnUp);
    btnContainer.appendChild(btnDown);
  });

  const addMoreFile = document.createElement("div");
  addMoreFile.setAttribute("class", "add-more-file");

  const addFile = document.createElement("div");
  addFile.setAttribute("class", "inp-cont");

  const input = document.createElement("input");
  input.setAttribute("id", "inp");
  input.type = "file";
  input.multiple = true;
  input.onchange = function () {
    encodeImageFileAsURL(this);
  };

  const p = document.createElement("p");
  const i = document.createElement("i");
  i.setAttribute("class", "fa fa-plus");
  p.appendChild(i);

  const label = document.createElement("label");
  label.innerHTML = "Añadir imagen";

  addFile.appendChild(p);
  addFile.appendChild(label);
  addFile.appendChild(input);
  addMoreFile.appendChild(addFile);
  createPDF.appendChild(addMoreFile);
}

// Función para regresar a la página principal
const backToHome = () => {
  location.reload();
};
home.addEventListener("click", backToHome);

optionSize.addEventListener("change", (e) => {
  if (e.target.value === "a4") {
    size = 0;
  } else {
    size = 1;
  }
});

let selectedBtn = marginBtns[1]; // Establecer el botón predeterminado
marginBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    // Agregar la clase "selected" al botón que se hizo clic
    btn.classList.add("selected");
    // Quitar la clase "selected" del botón predeterminado
    selectedBtn.classList.remove("selected");
    selectedBtn = btn;
    margin = btn.getAttribute("data-margin");
  });
});
