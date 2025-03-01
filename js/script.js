document.addEventListener("DOMContentLoaded", () => {
  fetch("https://dummyjson.com/products")
    .then((response) => {
      if (!response || !response.ok) {
        throw new Error("API DummyJSON no disponible");
      }
      return response.json();
    })
    .then((data) => {
      if (data && data.products) {
        cargarProductos(data.products.slice(0, 10)); // Solo mostramos 10 productos
      } else {
        throw new Error("Formato inesperado de DummyJSON");
      }
    })
    .catch((error) =>
      console.error("Error al obtener productos de DummyJSON", error)
    );

  function cargarProductos(data) {
    const productosContainer = document.getElementById("productos-container");
    productosContainer.innerHTML = "";

    data.forEach((producto) => {
      const shortDescription =
        producto.description.split(" ").slice(0, 5).join(" ") + "...";

      productosContainer.innerHTML += `
        <div class="card">
          <img src="${
            producto.image || producto.thumbnail
          }" class="card-img-top" alt="${producto.title}">
          <div class="card-body">
            <h5 class="card-title">${producto.title}</h5>
            <p class="card-text short-description">${shortDescription}</p>
            <p class="card-text full-description" style="display: none;">${
              producto.description
            }</p>
            <button class="btn btn-link" onclick="toggleDescription(this)">Ver descripción</button>
            <p class="card-text">$${producto.price}</p>
            <button class="btn btn-primary" onclick="addToCart(${
              producto.id
            }, '${producto.image || producto.thumbnail}', '${
        producto.title
      }', ${producto.price}, this)">Agregar al carrito</button>
          </div>
        </div>
      `;
    });
  }

  window.addToCart = function (id, image, title, price, button) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let existingProduct = cart.find((product) => product.id === id);
    if (existingProduct) {
      existingProduct.quantity++;
    } else {
      cart.push({ id, image, title, price, quantity: 1 });
    }
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();

    // Cambiar el texto del botón
    button.textContent = "Agregado";
    button.disabled = true;
    setTimeout(() => {
      button.textContent = "Agregar al carrito";
      button.disabled = false;
    }, 1000);
  };

  window.toggleDescription = function (button) {
    const shortDescription = button.previousElementSibling;
    const fullDescription = shortDescription.nextElementSibling;
    if (fullDescription.style.display === "none") {
      fullDescription.style.display = "block";
      shortDescription.style.display = "none";
      button.textContent = "Ocultar descripción";
    } else {
      fullDescription.style.display = "none";
      shortDescription.style.display = "block";
      button.textContent = "Ver descripción";
    }
  };

  function updateCartUI() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const carritoItems = document.getElementById("carrito-items");
    carritoItems.innerHTML = "";
    let total = 0;

    cart.forEach((item) => {
      carritoItems.innerHTML += `
        <div class="card d-flex flex-row align-items-center p-2 mb-2">
          <img src="${
            item.image
          }" class="card-img-top" style="width: 50px; height: 50px;" alt="${
        item.title
      }">
          <div class="card-body">
            <h5 class="card-title">${item.title}</h5>
            <p class="card-text">Cantidad: ${item.quantity}</p>
            <p class="card-text">Precio: $${(
              item.price * item.quantity
            ).toFixed(2)}</p>
          </div>
        </div>
      `;
      total += item.price * item.quantity;
    });

    document.getElementById("carrito-total").textContent = total.toFixed(2);
    document.getElementById("cart-counter").textContent = cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }

  document.getElementById("vaciar-carrito").addEventListener("click", () => {
    localStorage.clear();
    updateCartUI();
  });

  updateCartUI();
});
