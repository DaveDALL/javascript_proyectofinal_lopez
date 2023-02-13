//Se crea variables globales de productos, carrito de compra y de total
let productos = []
let carritoDeCompra = []
let total

//Recuperación del Carrito de Compra y del Total de Local Storage cuando se refresca la ventana del Explorador
(localStorage.getItem("carritoCompra")) ? (carritoDeCompra = JSON.parse(localStorage.getItem("carritoCompra")), total = JSON.parse(localStorage.getItem("total"))) : (carritoDeCompra = [], total = 0)

// Se inicia llamando a la funcion para obtener datos locales de archivo json, y posteriormente ejecutar la creacion de las tarjetas
obtenerData()

async function obtenerData () {
    let respuesta = await
    fetch("./inventory/almacen.json")
    productos = await respuesta.json()

    //Se llama a la funcion para Crear las tarjetas de los productos
    CrearTarjetaProducto(productos)
    //Se captura el input y se lanza el evento de entrada para  buscar productos
    let busqueda = document.getElementById("buscar")
    busqueda.oninput = buscadorProducto
    //Se captura boton de ver carrito para deplegar el contenido del carrito
    let verCarrito = document.getElementById("verCarrito")
    verCarrito.onclick = crearListaCarrito
}

//Funcion que crea las tarjetas de los productos
function CrearTarjetaProducto (arregloProductos) {
    //Se viasualiza input buscar y boton de ver carrito, ya que en la función de ver crearLista Carrito se ocultan
    document.getElementById("buscar").style.display = "block"
    document.getElementById("verCarrito").style.display = "block"
    let bolsaProductos = document.getElementById("contenedorProductos")
    bolsaProductos.innerHTML = " "
    arregloProductos.forEach(producto => {
        let cajaProducto = document.createElement("div")
        cajaProducto.classList.add("blisterProducto")
        let {nombre, marca, stock, unidad, precio, id, imagen} = producto
        cajaProducto.innerHTML = `
            <div class="cajaInfo">
                <h4>${nombre}</h4>
                <p>Marca: ${marca}</p>
                <p>Cantidad disponible: ${stock} ${unidad}</p>
                <p id="precioProducto">$${precio.toFixed(2)}</p>
            </div>
            <div class="cajaBoton">
                <button id=${id}>Agrega al Carrito</button>
            </div>
            <div class="cajaImagen">
                <img src=${imagen} />
            </div>
        `
        if(stock <= 5 && stock > 0) {
            cajaProducto.classList.add("pocoStock")
            let stockBajo = document.createElement("p")
            stockBajo.innerText = "Queda poco Stock, Haz tu pedido...!!"
            stockBajo.classList.add("bajoStock")
            cajaProducto.appendChild(stockBajo)
        } else if (stock == 0) {
			cajaProducto.classList.add("sinStock")
			let stockCero = document.createElement("p")
            stockCero.innerText = "Por el momento no contamos con Stock...!!"
            stockCero.classList.add("stockCero")
            cajaProducto.appendChild(stockCero)
		}
        bolsaProductos.append(cajaProducto)
		// Se captura el boton de Agrgar al Carrito y se agrega evento para capturar el clic
		let botonCarrito = document.getElementById(producto.id)
		botonCarrito.onclick = ponerEnCarritoProductos
    })
}

//Funcion para realizar busqueda de productos a traves del Input
function buscadorProducto (e) {
	let productosBuscados = []
    productosBuscados = productos.filter(producto => producto.nombre.toLowerCase().includes(e.target.value.toLowerCase()) || producto.marca.toLowerCase().includes(e.target.value.toLowerCase()))
    CrearTarjetaProducto(productosBuscados)
}

//Funcion de Compra de Productos despues de hacer clic en el boton COMPRAR PRODUCTOS
function comprarProductos ( ) {
	let totalInfo = 0
    carritoDeCompra.forEach(producto => {
        if(producto.id == productos.id) {
            let indexGlobal = productos.findIndex(productoBuscado => productoBuscado == producto)
            productos[indexGlobal].stock = productos[indexGlobal].stock - producto.piezas
        }
		totalInfo += Number(producto.subtotal)
    })
    Swal.fire({
        title: '<strong>Su total es de:</strong>',
        icon: 'info',
        html:
        `<div class="sweetA"><b>$ ${totalInfo.toFixed(2)}</b></div>`,
        showCloseButton: false,
        showCancelButton: false,
        focusConfirm: false,
        confirmButtonText:
          '<i class="fa fa-thumbs-up"> </i> ¡Genial!',
        confirmButtonAriaLabel: 'Thumbs up, ¡Genial!',
        cancelButtonText:
          '<i class="fa fa-thumbs-down"> </i>',
        cancelButtonAriaLabel: 'Thumbs down'
    })
	//Se elimina de local storage las claves total y Carrito de Compra
	localStorage.removeItem("total")
	localStorage.removeItem("carritoCompra")
    //Se inicialzia el carrito de compras 
    carritoDeCompra = []
	// se cran los productos con al existencias despues de descontar el carrito
    CrearTarjetaProducto(productos)
    //Se borra el contenedor del carrito para que no aparezca debaje los productos al hacer la compra
    document.getElementById("contenedorCarrito").remove()
}

//Funcion que pone en el carrito de compra un producto al hacer clic en boton Agregar a Carrito
function ponerEnCarritoProductos (e) {
    let ponerProducto = productos.find(producto => producto.id == e.target.id)
    if(ponerProducto.stock > 0) {
        if(carritoDeCompra.find(producto => producto.id == ponerProducto.id)) {
            let indexProducto = carritoDeCompra.findIndex(producto => producto == ponerProducto)
            carritoDeCompra[indexProducto].piezas++
            carritoDeCompra[indexProducto].subtotal = carritoDeCompra[indexProducto].precio * carritoDeCompra[indexProducto].piezas
            let indexGolbal = productos.findIndex(producto => producto == ponerProducto)
            productos[indexGolbal].stock--
            Swal.fire({
                position: 'top',
                icon: 'success',
                title: 'Se agrego al carrito. ¡Exitosamente!',
                showConfirmButton: false,
                timer: 1000
              })
        } else {
            ponerProducto.piezas = 1
            ponerProducto.subtotal = ponerProducto.precio
            let indexGolbal = productos.findIndex(producto => producto == ponerProducto)
            productos[indexGolbal].stock--
            carritoDeCompra.push(ponerProducto)
            Swal.fire({
                position: 'top',
                icon: 'success',
                title: 'Se agrego al carrito. ¡Exitosamente!',
                showConfirmButton: false,
                timer: 1000
              })
        }
    } else {
        Swal.fire({
            title: '¡ LO SENTIMOS !',
            text: 'Por el momento no hay Existencias',
            icon: 'error',
            confirmButtonText: 'OK'
        })
    }
	let total = 0
	carritoDeCompra.forEach(producto => {
        let {subtotal} = producto
		total += Number(subtotal)
	})
	// Se manda al Local Storage el Arreglo de Carrito de Compra y el total; y se manda a la funcion para crear la tarjeta de compra
    localStorage.setItem("carritoCompra", JSON.stringify(carritoDeCompra))
	localStorage.setItem("total", total)
}

//Funcion que crea la tarjeta del Carrito de Compra
function crearListaCarrito ( ) {
    //Recuperación del Carrito de Compra y del Total de Local Storage cuando se refresca la ventana del Explorador
    (localStorage.getItem("carritoCompra")) ? (carritoDeCompra = JSON.parse(localStorage.getItem("carritoCompra")), total = JSON.parse(localStorage.getItem("total"))) : (carritoDeCompra = [], total = 0)
    let visualizarCarrito = document.getElementById("contenedorPrincipal")
    document.getElementById("buscar").style.display = "none"
    document.getElementById("verCarrito").style.display = "none"
    let visualizarProductos = document.getElementById("contenedorProductos")
    visualizarProductos.innerHTML = ""
    let bolsaCarrito = document.createElement("div")
    bolsaCarrito.setAttribute("id", "contenedorCarrito")
    bolsaCarrito.innerHTML += `
        <h3><b>CARRITO DE COMPRAS</b></h3>
		<button id="comprar">Comprar Productos</button>
		<p>\nSu total de compra es de $${total.toFixed(2)}</p>
    `
    carritoDeCompra.forEach(producto => {
        let {imagen, nombre, piezas, unidad, subtotal} = producto
		let cajaCarrito = document.createElement("div")
    	cajaCarrito.classList.add("vistaCarrito","col-8")
        cajaCarrito.innerHTML += `
            <div class="listadoCarrito">
                <div class"imagenCarrito col-2">
                    <img src=${imagen} />
                </div>
                <div class="col-3">${nombre}</div>
                <div class="col-2">${piezas} ${unidad}</div>
                <div class"col-2">$${subtotal.toFixed(2)}</div>
            </div>
        `
        bolsaCarrito.appendChild(cajaCarrito)
        visualizarCarrito.appendChild(bolsaCarrito)
    })

	//Se captura el boton de ID=Comprar Producto, y se crea captura evento de clic sobre el boton
	let comprar = document.getElementById("comprar")
	comprar.onclick = comprarProductos
}

