document.addEventListener("DOMContentLoaded", () => {
  fetch("http://localhost:8080/api/productos")
    .then((response) => {
      if (!response || !response.ok) {
        throw new Error("API DummyJSON no disponible");
      }
      return response.json();
    })
    .then((data) => {
      if (Array.isArray(data)) {
        cargarProductos(data.slice(0, 10)); // Solo mostramos 10 productos
      } else {
        throw new Error("Formato inesperado del backend");
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
        producto.descripcion.split(" ").slice(0, 5).join(" ") + "...";

      // Mensaje especial para la última unidad
      const stockMessage = producto.stock === 1
        ? '<p class="ultima-unidad" style="color:red; font-weight:bold;">¡Última unidad!</p>'
        : '';

      productosContainer.innerHTML += `
        <div class="card">
          <img src="${producto.imagenUrl}" class="card-img-top" alt="${producto.nombre}">
          <div class="card-body">
            <h5 class="card-title">${producto.nombre}</h5>
            ${stockMessage}
            <p class="card-text short-description">${shortDescription}</p>
            <p class="card-text full-description" style="display: none;">${producto.descripcion}</p>
            <button class="btn btn-link" onclick="toggleDescription(this)">Ver descripción</button>
            <p class="card-text">$${producto.precio}</p>
            <button class="btn btn-primary" ${
              producto.stock === 0 ? 'disabled' : ''
            } onclick="addToCart(${
              producto.id
            }, '${producto.imagenUrl}', '${producto.nombre}', ${producto.precio}, ${producto.stock}, this)">
              ${producto.stock === 0 ? 'Sin stock' : 'Agregar al carrito'}
            </button>
          </div>
        </div>
      `;
    });
  }

  window.addToCart = function (id, imagenUrl, nombre, precio, stock, button) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let existingProduct = cart.find((product) => product.id === id);

    if (stock === 0) {
      alert("¡Este producto no tiene stock disponible!");
      return;
    }

    if (existingProduct) {
      if (existingProduct.quantity < stock) {
        existingProduct.quantity++;
      } else {
        alert("¡No hay más stock disponible para este producto!");
        return;
      }
    } else {
      cart.push({ id, imagenUrl, nombre, precio, stock, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();

    // Cambia el texto del botón
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

  // FUNCIÓN UPDATECARTUI PARA MOSTRAR TARJETAS
  function updateCartUI() {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    const carritoItems = document.getElementById("carrito-items");
    carritoItems.innerHTML = "";
    let total = 0;

    if (cart.length === 0) {
      carritoItems.innerHTML =
        '<li class="text-center text-muted w-100">Tu carrito está vacío</li>';
      document.getElementById("realizar-compra").disabled = true;
    } else {
      document.getElementById("realizar-compra").disabled = false;

      cart.forEach((item) => {
        const cartItemHTML = `
          <li class="cart-item">
            <img src="${item.imagenUrl}" alt="${item.nombre}">
            <div class="card-body">
              <h6 class="card-title">${item.nombre}</h6>
              <p class="card-text">Cantidad: <strong>${item.quantity}</strong></p>
              <p class="card-text">Precio unitario: ${item.precio}</p>
              <p class="card-text">Subtotal: <strong>${(item.precio * item.quantity).toFixed(2)}</strong></p>
              <button class="btn btn-sm btn-danger" onclick="removeFromCart(${item.id})">
                Eliminar
              </button>
            </div>
          </li>
        `;
        carritoItems.innerHTML += cartItemHTML;
        total += item.precio * item.quantity;
      });
    }

    document.getElementById("carrito-total").textContent = total.toFixed(2);
    document.getElementById("cart-counter").textContent = cart.reduce(
      (sum, item) => sum + item.quantity,
      0
    );
  }

  // FUNCIÓN PARA ELIMINAR PRODUCTOS INDIVIDUALES
  window.removeFromCart = function (id) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    cart = cart.filter((item) => item.id !== id);
    localStorage.setItem("cart", JSON.stringify(cart));
    updateCartUI();
  };

  document.getElementById("vaciar-carrito").addEventListener("click", () => {
    localStorage.clear();
    updateCartUI();
  });

  // FUNCIONALIDAD PARA REALIZAR COMPRA
  document.getElementById("realizar-compra").addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (cart.length === 0) {
      alert("Tu carrito está vacío");
      return;
    }

    // Armar el pedido como array de líneas
    const pedido = cart.map(item => ({
      productoId: item.id,
      cantidad: item.quantity
    }));

    // POST al backend
    fetch("http://localhost:8080/api/pedidos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pedido)
    })
      .then(response => {
        if (!response.ok) {
          throw new Error("Error al crear el pedido");
        }
        return response.json();
      })
      .then(pedidoCreado => {
        // Mostrar total pagado según lo que responde la base de datos (pedidoCreado.total)
        document.getElementById("modal-total").textContent =
          pedidoCreado.total !== undefined ? pedidoCreado.total.toFixed(2) : "Error";

        // Mostrar el modal
        const modal = new bootstrap.Modal(
          document.getElementById("compraExitosaModal")
        );
        modal.show();

        // Limpiar el carrito después de la compra
        localStorage.clear();
        updateCartUI();
      })
      .catch(error => {
        alert("No se pudo realizar la compra. " + error.message);
      });
  });

  updateCartUI();
});
