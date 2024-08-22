document.addEventListener("DOMContentLoaded", () => {
  fetch("https://fakestoreapi.com/products")
    .then((response) => response.json())
    .then((data) => {
      const productosContainer = document.getElementById("productos-container");
      data.forEach((producto) => {
        const shortDescription =
          producto.description.split(" ").slice(0, 5).join(" ") + "...";

        productosContainer.innerHTML += `
          <div class="card">
            <img src="${producto.image}" class="card-img-top" alt="${producto.title}">
            <div class="card-body">
              <h5 class="card-title">${producto.title}</h5>
              <p class="card-text short-description">${shortDescription}</p>
              <p class="card-text full-description" style="display: none;">${producto.description}</p>
              <button class="btn btn-link" onclick="toggleDescription(this)">Ver descripción</button>
              <p class="card-text">$${producto.price}</p>
              <button class="btn btn-primary" onclick="addToCart(${producto.id}, this)">Añadir al carrito</button>
            </div>
          </div>
        `;
      });
    });

  document.getElementById("vaciar-carrito").addEventListener("click", () => {
    localStorage.clear();
    updateCartUI();
  });

  updateCartUI();
});

function addToCart(id, button) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  let existingProduct = cart.find((product) => product.id === id);
  if (existingProduct) {
    existingProduct.quantity++;
  } else {
    cart.push({ id, quantity: 1 });
  }
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartUI();

  button.classList.add("btn-added");
  button.textContent = "Agregado";
  setTimeout(() => {
    button.classList.remove("btn-added");
    button.textContent = "Añadir al carrito";
  }, 1500);
}

function updateCartUI() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const carritoItems = document.getElementById("carrito-items");
  carritoItems.innerHTML = "";
  let total = 0;

  if (cart.length === 0) {
    document.getElementById("carrito-total").textContent = total.toFixed(2);
  }

  cart.forEach((item) => {
    fetch(`https://fakestoreapi.com/products/${item.id}`)
      .then((response) => response.json())
      .then((product) => {
        carritoItems.innerHTML += `
          <div class="card">
            <img src="${product.image}" class="card-img-top" alt="${product.title}">
            <div class="card-body">
              <h5 class="card-title">${product.title}</h5>
              <p class="card-text">Cantidad: ${item.quantity}</p>
              <p class="card-text">Precio: $${product.price}</p>
            </div>
          </div>
        `;
        total += product.price * item.quantity;
        document.getElementById("carrito-total").textContent = total.toFixed(2);
      });
  });

  document.getElementById("cart-counter").textContent = cart.reduce(
    (sum, item) => sum + item.quantity,
    0
  );
}

function toggleDescription(button) {
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
}
