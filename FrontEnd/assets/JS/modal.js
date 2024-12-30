// Sélection des éléments de la modale
const modal = document.getElementById("myModal");
const openModalLink = document.getElementById("openModalLink");
const closeModal = document.getElementsByClassName("close")[0];
const addPhotoBtn = document.getElementById("addPhotoBtn");

// Fonction pour ouvrir la modale
openModalLink.onclick = function () {
  modal.style.display = "block";
};

// Fonction pour fermer la modale en cliquant sur la croix
closeModal.onclick = function () {
  modal.style.display = "none";
};

// Fonction pour fermer la modale en cliquant en dehors de la modale
window.onclick = function (event) {
  if (event.target == modal) {
    modal.style.display = "none";
  }
};

// Fonction pour afficher la vue "Ajouter une photo"
addPhotoBtn.onclick = function () {
  document.querySelector(".gallery-view").style.display = "none";
  document.querySelector(".add-photo-view").style.display = "block";
};

// Vérification du token pour masquer les catégories si l'utilisateur est connecté
document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");
  const categoryMenu = document.querySelector(".category-menu");

  if (token) {
    categoryMenu.style.display = "none";
  }
});

document.addEventListener("DOMContentLoaded", function () {
  const token = localStorage.getItem("token");

  if (!token) {
    openModalLink.style.display = "none";
  }
});


function displayImages() {
  fetch("http://localhost:5678/api/works")
    .then((response) => response.json())
    .then((data) => {
      const galleryView = document.querySelector(".gallery-view");
      const modalGalleryView = document.querySelector(".modal-gallery-view");

      // Vider les galeries pour éviter tout contenu résiduel
      galleryView.innerHTML = ""; // Vide la galerie principale
      modalGalleryView.innerHTML = ""; // Vide la galerie modale

      // Utilisation d'un Set pour éviter les doublons
      const displayedIds = new Set();

      // Ajout d'images dans les deux galeries
      data.forEach((item) => {
        if (!displayedIds.has(item.id)) {
          displayedIds.add(item.id); // Marquer cet ID comme affiché

          // Création de l'image pour la galerie principale
          const galleryImgContainer = createImageContainer(item);
          galleryView.appendChild(galleryImgContainer);

          // Création de l'image pour la galerie modale
          const modalImgContainer = createImageContainer(item);
          modalGalleryView.appendChild(modalImgContainer);
        }
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des images", error);
    });
}

// Fonction utilitaire pour créer un conteneur d'image
function createImageContainer(item) {
  const imgContainer = document.createElement("div");
  imgContainer.classList.add("img-container");

  const imgElement = document.createElement("img");
  imgElement.src = item.imageUrl;
  imgElement.alt = item.name || "Image";
  imgElement.style.width = "76.86px";
  imgElement.style.height = "102.57px";
  imgElement.style.margin = "20px 8px";

  const deleteIcon = document.createElement("i");
  deleteIcon.classList.add("fa-solid", "fa-trash-can");
  deleteIcon.style.position = "absolute";
  deleteIcon.style.top = "10px";
  deleteIcon.style.right = "10px";
  deleteIcon.style.cursor = "pointer";
  deleteIcon.addEventListener("click", () => deleteImage(item.id, imgContainer));

  imgContainer.appendChild(imgElement);
  imgContainer.appendChild(deleteIcon);

  return imgContainer;
}

// Fonction pour supprimer une image
function deleteImage(id, imgContainer) {
  fetch(`http://localhost:5678/api/works/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`, // Ajout du token pour l'authentification
    },
  })
    .then((response) => {
      if (response.ok) {
        imgContainer.remove(); // Supprime l'image du DOM si la suppression est réussie
        alert("L'image a été supprimée avec succès !");
      } else {
        console.error("Erreur lors de la suppression de l'image :", response.statusText);
        alert("Impossible de supprimer l'image. Veuillez réessayer.");
      }
    })
    .catch((error) => {
      console.error("Erreur lors de la requête de suppression :", error);
      alert("Une erreur est survenue lors de la suppression.");
    });
}


// Fonction pour récupérer les catégories
function fetchCategories() {
  fetch("http://localhost:5678/api/categories")
    .then((response) => response.json())
    .then((data) => {
      const categorySelect = document.getElementById("projectCategory");
      categorySelect.innerHTML = '<option value="">Sélectionnez une catégorie</option>'; // Réinitialiser les options
      data.forEach((category) => {
        const option = document.createElement("option");
        option.value = category.id;
        option.textContent = category.name;
        categorySelect.appendChild(option);
      });
    })
    .catch((error) => {
      console.error("Erreur lors de la récupération des catégories", error);
    });
}

// Appeler la fonction pour afficher les images
displayImages();

// Appeler la fonction pour récupérer les catégories au chargement de la page
fetchCategories();

document.getElementById("addPhotoBtn").addEventListener("click", () => {
  document.getElementById("addPhotoModal").style.display = "block";
});

document.querySelectorAll(".close").forEach((closeBtn) => {
  closeBtn.addEventListener("click", () => {
    document.getElementById("myModal").style.display = "none";
    document.getElementById("addPhotoModal").style.display = "none";
  });
});

document.querySelector(".back").addEventListener("click", () => {
  document.getElementById("addPhotoModal").style.display = "none";
  document.getElementById("myModal").style.display = "block";
});

window.addEventListener("click", (event) => {
  if (event.target == document.getElementById("myModal")) {
    document.getElementById("myModal").style.display = "none";
  }
  if (event.target == document.getElementById("addPhotoModal")) {
    document.getElementById("addPhotoModal").style.display = "none";
  }
});

document.querySelector(".choose-image-btn").addEventListener("click", () => {
  document.getElementById("projectImage").click();
});

document.getElementById("projectImage").addEventListener("change", (event) => {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = document.createElement("img");
      preview.id = "imagePreview";
      preview.src = e.target.result;
      preview.style.width = "100px";
      preview.style.height = "100px";
      document.querySelector(".upload-placeholder").appendChild(preview);
    };
    reader.readAsDataURL(file);
  }
});

document.getElementById("addPhotoForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const projectName = document.getElementById("projectName");
  const projectImage = document.getElementById("projectImage");
  const projectCategory = document.getElementById("projectCategory");

  if (projectName && projectImage && projectCategory) {
    if (projectName.value && projectImage.files.length > 0 && projectCategory.value) {
      const formData = new FormData();
      formData.append("projectName", projectName.value);
      formData.append("projectImage", projectImage.files[0]);
      formData.append("projectCategory", projectCategory.value);

      fetch("http://localhost:5678/api/works", {
        method: "POST",
        headers: {
          Authorization:
            "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOjEsImlhdCI6MTY1MTg3NDkzOSwiZXhwIjoxNjUxOTYxMzM5fQ.JGN1p8YIfR-M-5eQ-Ypy6Ima5cKA4VbfL2xMr2MgHm4",
        },
        body: formData,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error("Erreur lors de la requête : " + response.status);
          }
          return response.json();
        })
        .then((data) => {
          console.log(data); // Afficher la réponse du serveur
          if (data.success) {
            alert("Projet ajouté avec succès !");
            document.getElementById("addPhotoModal").style.display = "none";
            displayImages(); // Actualiser la galerie
          } else {
            alert("Erreur lors de l'ajout du projet : " + data.message);
          }
        })
        .catch((error) => {
          console.error("Erreur lors de l'envoi du formulaire", error);
          alert("Erreur lors de l'envoi du formulaire");
        });
    } else {
      alert("Veuillez remplir tous les champs du formulaire.");
    }
  } else {
    alert("Un ou plusieurs éléments du formulaire sont manquants.");
  }
});
