document.addEventListener('DOMContentLoaded', function () {
  // --- Carousel (runs only when a carousel exists on the page) ---
  const carousel = document.querySelector('.carousel');
  if (carousel) {
    const track = carousel.querySelector('.carousel-track');
    const slides = Array.from(track.children);
    const nextBtn = carousel.querySelector('.carousel-btn.next');
    const prevBtn = carousel.querySelector('.carousel-btn.prev');
    const dots = Array.from(carousel.querySelectorAll('.carousel-dots .dot'));

    let index = 0;
    const total = slides.length;
    let auto;

    function update() {
      track.style.transform = `translateX(-${index * 100}%)`;
      slides.forEach((s, i) => s.classList.toggle('active', i === index));
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }

    function goTo(n) {
      index = (n + total) % total;
      update();
    }

    nextBtn && nextBtn.addEventListener('click', () => { goTo(index + 1); resetAuto(); });
    prevBtn && prevBtn.addEventListener('click', () => { goTo(index - 1); resetAuto(); });

    dots.forEach((dot, i) => dot.addEventListener('click', () => { goTo(i); resetAuto(); }));

    function startAuto() {
      auto = setInterval(() => { goTo(index + 1); }, 5000);
    }

    function resetAuto() {
      clearInterval(auto);
      startAuto();
    }

    carousel.addEventListener('mouseenter', () => clearInterval(auto));
    carousel.addEventListener('mouseleave', () => resetAuto());

    update();
    startAuto();
  }

  // --- Products / Filters & Product Modal ---
  const products = [
    {
      id: 'amplifier',
      name: 'Amplifier',
      category: 'fragrance',
      images: ['Perfume/Amplifier.jpg'],
      price: '₹1499',
      description: 'A bold, long-lasting scent that opens with bright citrus and dries to warm amber and woods.',
      ingredients: 'Top: Citrus | Heart: Tuberose | Base: Amber, Woods',
      buyUrl: '#'
    },
    {
      id: 'eau-de-parfum',
      name: 'Eau de Parfum',
      category: 'fragrance',
      images: ['Perfume/Eau de Parfum2.jpg'],
      price: '₹2499',
      description: 'A refined Eau de Parfum with floral heart and powdery vanilla base—timeless and elegant.',
      ingredients: 'Top: Bergamot | Heart: Rose, Jasmine | Base: Vanilla',
      buyUrl: '#'
    },
    {
      id: 'miss-giordani',
      name: 'Miss Giordani Eau de Parfum',
      category: 'fragrance',
      images: ['Perfume/Miss Giordani Eau de Parfum2.jpg'],
      price: '₹3499',
      description: 'A feminine, sophisticated scent with fruity top notes and a velvety floral dry-down.',
      ingredients: 'Top: Pear | Heart: Orange Blossom | Base: Musk',
      buyUrl: '#'
    },
    {
      id: 'mythical-seduction',
      name: 'Mythical Seduction Fragrance Mist',
      category: 'fragrance',
      images: ['Perfume/Mythical Seduction Fragrance Mist2.jpg'],
      price: '₹1299',
      description: 'A light fragrance mist perfect for quick refreshes—airy and playful.',
      ingredients: 'Top: Berries | Heart: Peony | Base: Soft Musk',
      buyUrl: '#'
    },
    {
      id: 'perfumed-roll-on',
      name: 'Perfumed Roll-On Deodorant',
      category: 'fragrance',
      images: ['Perfume/Perfumed Roll-On Deodorant2.jpg'],
      price: '₹999',
      description: 'An easy-to-use roll-on with a subtle, long-lasting scent and gentle formula.',
      ingredients: 'Aluminum-free | Fragrance: Soft Floral',
      buyUrl: '#'
    }
  ];

  // Open product detail when thumbnail is clicked
  document.querySelectorAll('.thumbnail-item').forEach(li => {
    li.addEventListener('click', (e) => {
      // If the user clicked an Add-to-cart button, do not open modal (button stops propagation anyway)
      const id = li.dataset.productId || li.querySelector('.thumb-add-btn')?.dataset?.id;
      if (!id) return;
      const p = products.find(x => x.id === id);
      if (p) showProduct(p);
    });
  });

  const productsGrid = document.getElementById('products-grid');
  const filterButtons = document.querySelectorAll('.filter-btn');
  const productModal = document.getElementById('product-modal');
  const productDetailEl = document.getElementById('product-detail');
  const closeProduct = document.getElementById('close-product');

  function renderProducts(list) {
    if (!productsGrid) return;
    productsGrid.innerHTML = '';

    if (!list.length) {
      productsGrid.innerHTML = '<p>No products found.</p>';
      return;
    }

    list.forEach(p => {
      const card = document.createElement('div');
      card.className = 'product-card';
      card.innerHTML = `
        <div class="product-image">
          <img src="${p.images ? p.images[0] : p.image}" alt="${p.name}">
        </div>
        <div class="product-info">
          <h3 class="product-name">${p.name}</h3>
          <p class="product-price">${p.price}</p>
          <div style="margin-top:8px; display:flex; gap:8px;">
            <button class="btn btn-primary view-btn">View</button>
            <a class="btn" href="${p.buyUrl}" target="_blank" rel="noopener">Buy Now</a>
          </div>
        </div>
      `;

      // View button opens product modal
      card.querySelector('.view-btn').addEventListener('click', () => showProduct(p));
      productsGrid.appendChild(card);
    });
  }

  // Initial render: apply optional URL filter (e.g. index.html?filter=skincare)
  const urlParams = new URLSearchParams(window.location.search);
  // Support a data-default-filter on the <body> for dedicated category pages
  const bodyDefaultFilter = document.body && document.body.dataset ? document.body.dataset.defaultFilter : null;
  const initialFilter = urlParams.get('filter') || bodyDefaultFilter;

  if (initialFilter) {
    // Apply matching filter button if available
    const btn = Array.from(filterButtons).find(b => b.getAttribute('data-filter') === initialFilter);
    if (btn) {
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
      renderProducts(filtered);
    } else {
      renderProducts(products);
    }
  } else {
    renderProducts(products);
  }

  // Filter buttons
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      if (filter === 'all') {
        renderProducts(products);
      } else {
        const filtered = products.filter(p => p.category === filter);
        renderProducts(filtered);
      }
    });
  });

  // Show product in modal
  function showProduct(p) {
    if (!productModal || !productDetailEl) return;

    productDetailEl.innerHTML = `
      <div class="product-gallery">
        <img id="product-main-image" src="${p.images ? p.images[0] : p.image}" alt="${p.name}">
        ${p.images && p.images.length > 1 ? `
          <div class="product-thumbs" style="margin-top:8px;display:flex;gap:8px;">
            ${p.images.map((img, i) => `<img class="product-thumb" src="${img}" data-index="${i}" alt="${p.name} ${i+1}" style="width:80px;height:80px;object-fit:cover;border:1px solid #ddd;cursor:pointer;">`).join('')}
          </div>
        ` : ''}
      </div>
      <div class="product-details">
        <h2>${p.name}</h2>
        <p class="product-price-detail">${p.price}</p>
        <p class="product-description">${p.description}</p>
        <div class="product-ingredients">
          <h4>Notes & Ingredients</h4>
          <p>${p.ingredients}</p>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <a class="btn btn-primary" href="${p.buyUrl}" target="_blank" rel="noopener">Buy Now</a>
          <button class="btn" id="close-from-modal">Close</button>
        </div>
      </div>
    `;

    productModal.style.display = 'block';

    // Wire up thumbnail clicks to swap main image
    const mainImg = document.getElementById('product-main-image');
    document.querySelectorAll('.product-thumb').forEach(t => {
      t.addEventListener('click', () => {
        if (mainImg) mainImg.src = t.src;
      });
    });

    productModal.style.display = 'block';

    // Close inside modal
    const closeFromModal = document.getElementById('close-from-modal');
    closeFromModal && closeFromModal.addEventListener('click', closeProductModal);
  }

  function closeProductModal() {
    if (!productModal) return;
    productModal.style.display = 'none';
    productDetailEl.innerHTML = '';
  }

  // Close handlers
  closeProduct && closeProduct.addEventListener('click', closeProductModal);
  productModal && productModal.addEventListener('click', (e) => {
    if (e.target === productModal) closeProductModal();
  });

  /* -------------------- Cart handling -------------------- */
  function getCart() {
    try {
      return JSON.parse(localStorage.getItem('cart') || '{}');
    } catch (e) {
      return {};
    }
  }

  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCountUI();
  }

  function getCartCount() {
    const cart = getCart();
    return Object.values(cart).reduce((sum, item) => sum + (item.qty || 0), 0);
  }

  function updateCartCountUI() {
    const el = document.getElementById('cart-count');
    if (el) el.textContent = getCartCount();
  }

  function formatRupee(n) {
    return '₹' + Number(n).toLocaleString('en-IN');
  }

  function showCartToast(text) {
    let toast = document.querySelector('.cart-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'cart-toast';
      document.body.appendChild(toast);
    }
    toast.textContent = text;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 1500);
  }

  function addToCart(id, name, price, qty = 1) {
    const cart = getCart();
    if (!cart[id]) cart[id] = { id, name, price: Number(price), qty: 0 };
    cart[id].qty += qty;
    saveCart(cart);
    showCartToast(`${name} added to cart`);
  }

  // Wire up thumbnail Add-to-cart buttons (if present)
  document.querySelectorAll('.thumb-add-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.dataset.id;
      const name = btn.dataset.name || 'Item';
      const price = btn.dataset.price || 0;
      addToCart(id, name, price, 1);
      e.stopPropagation();
    });
  });

  // Cart modal UI
  function buildCartModal() {
    let overlay = document.querySelector('.cart-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'cart-overlay';
      overlay.innerHTML = `
        <div class="cart-modal" role="dialog" aria-modal="true">
          <h4>Your Cart</h4>
          <div class="cart-items"></div>
          <div class="cart-total">Total: ₹0</div>
          <div class="cart-actions">
            <button class="btn" id="close-cart">Close</button>
            <button class="btn btn-primary" id="checkout-btn">Checkout</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);

      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeCartModal();
      });

      overlay.querySelector('#close-cart').addEventListener('click', closeCartModal);

      overlay.querySelector('#checkout-btn').addEventListener('click', () => {
        alert('Checkout flow not implemented. Cart preserved in localStorage.');
      });
    }
    return overlay;
  }

  function openCartModal() {
    const overlay = buildCartModal();
    const itemsEl = overlay.querySelector('.cart-items');
    const totalEl = overlay.querySelector('.cart-total');

    const cart = getCart();
    itemsEl.innerHTML = '';

    const ids = Object.keys(cart);
    if (!ids.length) {
      itemsEl.innerHTML = '<p>Your cart is empty.</p>';
      totalEl.textContent = 'Total: ₹0';
    } else {
      let total = 0;
      ids.forEach(id => {
        const it = cart[id];
        const lineTotal = it.price * it.qty;
        total += lineTotal;
        const row = document.createElement('div');
        row.className = 'cart-item';
        row.dataset.id = id;
        row.innerHTML = `
          <div class="meta">
            <strong>${it.name}</strong>
            <div class="price">${formatRupee(it.price)} each</div>
          </div>
          <div class="qty-controls">
            <button class="btn" data-action="dec">-</button>
            <div class="qty">${it.qty}</div>
            <button class="btn" data-action="inc">+</button>
            <div class="line">${formatRupee(lineTotal)}</div>
            <button class="btn" data-action="remove">Remove</button>
          </div>
        `;
        itemsEl.appendChild(row);

        row.querySelector('[data-action="dec"]').addEventListener('click', () => updateQty(id, -1));
        row.querySelector('[data-action="inc"]').addEventListener('click', () => updateQty(id, 1));
        row.querySelector('[data-action="remove"]').addEventListener('click', () => removeItem(id));
      });
      totalEl.textContent = `Total: ${formatRupee(total)}`;
    }

    overlay.classList.add('show');
  }

  function closeCartModal() {
    const overlay = document.querySelector('.cart-overlay');
    if (overlay) overlay.classList.remove('show');
  }

  function updateQty(id, delta) {
    const cart = getCart();
    if (!cart[id]) return;
    cart[id].qty += delta;
    if (cart[id].qty <= 0) delete cart[id];
    saveCart(cart);
    openCartModal(); // refresh
  }

  function removeItem(id) {
    const cart = getCart();
    if (!cart[id]) return;
    delete cart[id];
    saveCart(cart);
    openCartModal();
  }

  // Wire up cart button
  const cartBtn = document.getElementById('cart-btn');
  cartBtn && cartBtn.addEventListener('click', openCartModal);

  // Initialize cart count on load
  updateCartCountUI();

});