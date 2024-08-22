document.addEventListener("DOMContentLoaded", () => {
  fetch("https://fakestoreapi.com/products")
    .then((response) => response.json())
    .then((data) => {
      const productosContainer = document.getElementById("productos");
      data.forEach((producto) => {
        productosContainer.innerHTML += `
                    <div class="card">
                        <img src="${producto.image}" class="card-img-top" alt="${producto.title}">
                        <div class="card-body">
                            <h5 class="card-title">${producto.title}</h5>
                            <p class="card-text">${producto.description}</p>
                            <p class="card-text">$${producto.price}</p>
                            <button class="btn btn-primary" onclick="addToCart(${producto.id})">Añadir al carrito</button>
                        </div>
                    </div>
                `;
      });
    })
    .catch((error) => console.error("Error fetching the products:", error));
});

function addToCart(productId) {
  let cart = JSON.parse(localStorage.getItem("cart")) || [];
  const productExists = cart.find((item) => item.id === productId);

  if (productExists) {
    productExists.quantity += 1;
  } else {
    cart.push({ id: productId, quantity: 1 });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCounter();
}

function updateCartCounter() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartCounter = document.getElementById("cart-counter");
  cartCounter.innerText = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );
}

// Llama a updateCartCounter() al cargar la página para mostrar el número correcto de productos en el carrito
updateCartCounter();
