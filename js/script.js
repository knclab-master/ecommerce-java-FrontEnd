document.addEventListener("DOMContentLoaded", () => {
  fetch("https://api.example.com/productos")
    .then((response) => response.json())
    .then((data) => {
      const productosContainer = document.getElementById("productos");
      data.forEach((producto) => {
        productosContainer.innerHTML += `
                    <div class="card">
                        <img src="${producto.image}" class="card-img-top" alt="${producto.name}">
                        <div class="card-body">
                            <h5 class="card-title">${producto.name}</h5>
                            <p class="card-text">${producto.description}</p>
                            <p class="card-text">$${producto.price}</p>
                            <button class="btn btn-primary" onclick="addToCart(${producto.id})">Añadir al carrito</button>
                        </div>
                    </div>
                `;
      });
    });
});

function addToCart(productId) {
  // Lógica para añadir el producto al carrito usando localStorage o sessionStorage
}
