const addToCart = (productId, productName) => {
  // TODO 9.2 --> DONE
  // you can use addProductToCart(), available already from /public/js/utils.js
  // for showing a notification of the product's creation, /public/js/utils.js  includes createNotification() function
  const product = addProductToCart(productId);
  product &&
    createNotification(
      `Added ${productName} to cart!`,
      "notifications-container",
      true
    );
};

const cloneProductTemplate = (product, tempClone) => {
  ["name", "description", "price"].forEach((key) => {
    const tempKey = tempClone.querySelector(`.product-${key}`);
    tempKey.textContent = product[key];
    tempKey.setAttribute("id", `${key}-${product._id}`);
  });
  const button = tempClone.querySelector("button");
  button.setAttribute("id", `add-to-cart-${product._id}`);
  button.addEventListener("click", () => addToCart(product._id, product.name));
};

(async () => {
  //TODO 9.2 --> DONE
  // - get the 'products-container' element from the /products.html
  // - get the 'product-template' element from the /products.html
  // - save the response from await getJSON(url) to get all the products. getJSON(url) is available to this script in products.html, as "js/utils.js" script has been added to products.html before this script file
  // - then, loop throug the products in the response, and for each of the products:
  //    * clone the template
  //    * add product information to the template clone
  //    * remember to add an event listener for the button's 'click' event, and call addToCart() in the event listener's callback
  // - remember to add the products to the the page
  const productsContainer = document.getElementById("products-container");
  const productTemplate = document.getElementById("product-template");
  const products = await getJSON("http://localhost:3000/api/products");
  products.forEach((product) => {
    const tempClone = productTemplate.content.cloneNode(true);
    cloneProductTemplate(product, tempClone);
    productsContainer.appendChild(tempClone);
  });
})();
