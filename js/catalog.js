/* ============================================================
   SHOPNEST — CATALOG JS (products page: filter, sort, render)
   ============================================================ */

let activeCategory = 'all';
let activeSort = 'featured';
let searchQuery = '';
let priceMin = 0;
let priceMax = 500;
const ITEMS_PER_PAGE = 12;
let currentPage = 1;

const CATEGORY_META = {
  all:         { label: 'All Products',  count: 20 },
  electronics: { label: 'Electronics',   count: 4 },
  clothing:    { label: 'Clothing',      count: 4 },
  home:        { label: 'Home & Garden', count: 4 },
  sports:      { label: 'Sports',        count: 4 },
  books:       { label: 'Books',         count: 4 },
};

/* ── FILTER & SORT ───────────────────────────────────────── */
function getFilteredProducts() {
  let list = [...PRODUCTS];

  if (activeCategory !== 'all') {
    list = list.filter(p => p.category === activeCategory);
  }
  if (searchQuery) {
    const q = searchQuery.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
  }
  list = list.filter(p => p.price >= priceMin && p.price <= priceMax);

  switch (activeSort) {
    case 'price-asc':  list.sort((a,b) => a.price - b.price); break;
    case 'price-desc': list.sort((a,b) => b.price - a.price); break;
    case 'rating':     list.sort((a,b) => b.rating - a.rating); break;
    case 'reviews':    list.sort((a,b) => b.reviews - a.reviews); break;
    case 'newest':     list.sort((a,b) => b.id - a.id); break;
    default: break; // featured — original order
  }
  return list;
}

/* ── RENDER ──────────────────────────────────────────────── */
function renderCatalog() {
  const grid = document.getElementById('catalog-grid');
  if (!grid) return;

  const all = getFilteredProducts();
  const total = all.length;
  const totalPages = Math.max(1, Math.ceil(total / ITEMS_PER_PAGE));
  currentPage = Math.min(currentPage, totalPages);
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const page = all.slice(start, start + ITEMS_PER_PAGE);

  // Results count
  const countEl = document.getElementById('results-count');
  if (countEl) {
    countEl.innerHTML = `Showing <strong>${page.length}</strong> of <strong>${total}</strong> products`;
  }

  if (page.length === 0) {
    grid.innerHTML = `
      <div class="no-products">
        <div class="no-products-icon">🔍</div>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search terms.</p>
        <button class="btn btn-primary btn-sm" style="margin-top:1rem" onclick="resetFilters()">Reset Filters</button>
      </div>`;
  } else {
    grid.innerHTML = page.map(buildProductCard).join('');
    // Restore wishlist state
    const wl = new Set(JSON.parse(localStorage.getItem('shopnest_wishlist') || '[]'));
    grid.querySelectorAll('.product-wishlist').forEach(btn => {
      if (wl.has(+btn.dataset.wid)) { btn.textContent = '♥'; btn.classList.add('active'); }
    });
  }

  renderPagination(totalPages);
}

/* ── PAGINATION ──────────────────────────────────────────── */
function renderPagination(totalPages) {
  const pag = document.getElementById('catalog-pagination');
  if (!pag) return;
  if (totalPages <= 1) { pag.innerHTML = ''; return; }

  let html = `<button class="page-btn prev" ${currentPage === 1 ? 'disabled' : ''} onclick="goPage(${currentPage - 1})">← Prev</button>`;
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-btn ${i === currentPage ? 'active' : ''}" onclick="goPage(${i})">${i}</button>`;
  }
  html += `<button class="page-btn next" ${currentPage === totalPages ? 'disabled' : ''} onclick="goPage(${currentPage + 1})">Next →</button>`;
  pag.innerHTML = html;
}

function goPage(n) {
  currentPage = n;
  renderCatalog();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ── FILTER HANDLERS ─────────────────────────────────────── */
function resetFilters() {
  activeCategory = 'all';
  searchQuery = '';
  priceMin = 0;
  priceMax = 500;
  currentPage = 1;
  const searchInput = document.getElementById('catalog-search');
  if (searchInput) searchInput.value = '';
  const priceMinEl = document.getElementById('price-min');
  const priceMaxEl = document.getElementById('price-max');
  if (priceMinEl) priceMinEl.value = '';
  if (priceMaxEl) priceMaxEl.value = '';
  updateCategoryButtons();
  renderCatalog();
}

function updateCategoryButtons() {
  document.querySelectorAll('.category-filter-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.category === activeCategory);
  });
}

/* ── INIT CATALOG ────────────────────────────────────────── */
function initCatalog() {
  if (!document.getElementById('catalog-grid')) return;

  // Category buttons
  document.querySelectorAll('.category-filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeCategory = btn.dataset.category;
      currentPage = 1;
      updateCategoryButtons();
      renderCatalog();
    });
  });

  // Search
  const searchInput = document.getElementById('catalog-search');
  if (searchInput) {
    let debounce;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        searchQuery = searchInput.value.trim();
        currentPage = 1;
        renderCatalog();
      }, 300);
    });
  }

  // Price range
  const priceApply = document.getElementById('price-apply');
  if (priceApply) {
    priceApply.addEventListener('click', () => {
      const minEl = document.getElementById('price-min');
      const maxEl = document.getElementById('price-max');
      priceMin = minEl?.value ? +minEl.value : 0;
      priceMax = maxEl?.value ? +maxEl.value : 500;
      if (priceMin > priceMax) { showToast('Min price cannot exceed max price', 'error'); return; }
      currentPage = 1;
      renderCatalog();
    });
  }

  // Sort
  const sortSelect = document.getElementById('sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', () => {
      activeSort = sortSelect.value;
      currentPage = 1;
      renderCatalog();
    });
  }

  // Handle URL param ?category=electronics
  const params = new URLSearchParams(window.location.search);
  if (params.get('category')) {
    const cat = params.get('category').toLowerCase();
    if (CATEGORY_META[cat]) {
      activeCategory = cat;
      updateCategoryButtons();
    }
  }

  renderCatalog();
}

document.addEventListener('DOMContentLoaded', initCatalog);
