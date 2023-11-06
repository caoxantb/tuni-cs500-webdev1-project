const addToCart = (productId) => {
  // TODO 9.2 --> DONE
  // use addProductToCart(), available already from /public/js/utils.js
  // call updateProductAmount(productId) from this file
  const product = addProductToCart(productId);
  product && updateProductAmount(productId);
};

const decreaseCount = (productId) => {
  // TODO 9.2 --> DONE
  // Decrease the amount of products in the cart, /public/js/utils.js provides decreaseProductCount()
  // Remove product from cart if amount is 0,  /public/js/utils.js provides removeElement = (containerId, elementId)
  const count = decreaseProductCount(productId);
  !count && removeElement("cart-container", `item-row-${productId}`);
};

const updateProductAmount = (productId) => {
  // TODO 9.2 --> DONE
  // - read the amount of products in the cart, /public/js/utils.js provides getProductCountFromCart(productId)
  // - change the amount of products shown in the right element's innerText
  const count = getProductCountFromCart(productId);
  document.getElementById(`amount-${productId}`).textContent = count + "x";
};

const placeOrder = async (products) => {
  // TODO 9.2 --> DONE
  // Get all products from the cart, /public/js/utils.js provides getAllProductsFromCart()
  // show the user a notification: /public/js/utils.js provides createNotification = (message, containerId, isSuccess = true)
  // for each of the products in the cart remove them, /public/js/utils.js provides removeElement(containerId, elementId)
  const populatedProducts = getPopulatedProductsFromCart(products);
  createNotification(
    "Successfully created an order!",
    "notifications-container",
    true
  );
  populatedProducts.forEach((product) =>
    removeElement("cart-container", `item-row-${product._id}`)
  );
  clearCart();
};

const cloneCartTemplate = (product, tempClone) => {
  tempClone
    .querySelector(".item-row")
    .setAttribute("id", `item-row-${product._id}`);
  ["name", "amount", "price"].forEach((key) => {
    const tempKey = tempClone.querySelector(`.product-${key}`);
    tempKey.textContent = key !== "amount" ? product[key] : product[key] + "x";
    tempKey.setAttribute("id", `${key}-${product._id}`);
  });
  const [plusButton, minusButton] = tempClone.querySelectorAll(
    ".cart-minus-plus-button"
  );
  plusButton.setAttribute("id", `plus-${product._id}`);
  minusButton.setAttribute("id", `minus-${product._id}`);
  plusButton.addEventListener("click", () => {
    addToCart(product._id);
    updateProductAmount(product._id);
  });
  minusButton.addEventListener("click", () => {
    decreaseCount(product._id);
    updateProductAmount(product._id);
  });
};

(async () => {
  // TODO 9.2 --> DONE
  // - get the 'cart-container' element
  // - use getJSON(url) to get the available products
  // - get all products from cart
  // - get the 'cart-item-template' template
  // - for each item in the cart
  //    * copy the item information to the template
  //    * hint: add the product's ID to the created element's as its ID to
  //        enable editing ith
  //    * remember to add event listeners for cart-minus-plus-button
  //        cart-minus-plus-button elements. querySelectorAll() can be used
  //        to select all elements with each of those classes, then its
  //        just up to finding the right index.  querySelectorAll() can be
  //        used on the clone of "product in the cart" template to get its two
  //        elements with the "cart-minus-plus-button" class. Of the resulting
  //        element array, one item could be given the ID of
  //        `plus-${product_id`, and other `minus-${product_id}`. At the same
  //        time we can attach the event listeners to these elements. Something
  //        like the following will likely work:
  //          clone.querySelector('button').id = `add-to-cart-${prodouctId}`;
  //          clone.querySelector('button').addEventListener('click', () => addToCart(productId, productName));
  //
  // - in the end remember to append the modified cart item to the cart
  const cartContainer = document.getElementById("cart-container");
  const products = await getJSON("http://localhost:3000/api/products");
  const populatedProducts = getPopulatedProductsFromCart(products);
  const cartTemplate = document.getElementById("cart-item-template");
  populatedProducts.forEach((product) => {
    const tempClone = cartTemplate.content.cloneNode(true);
    cloneCartTemplate(product, tempClone);
    cartContainer.appendChild(tempClone);
  });
  const placeOrderButton = document.getElementById("place-order-button");
  placeOrderButton.addEventListener("click", () => placeOrder(products));
})();
