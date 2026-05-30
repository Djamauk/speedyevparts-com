/* Speedy Spare Parts — Clean Dynamic Catalog */
const CatalogApp = (() => {
  const state = {
    page: 1,
    perPage: 12,
    q: '',
    category: '',
    maxPrice: 9999,
    products: []
  };

  const $ = (s, r=document) => r.querySelector(s);
  const $$ = (s, r=document) => Array.from(r.querySelectorAll(s));

  function init() {
    wireUI();
    loadProducts();
  }

  function wireUI() {
    $('#searchBtn')?.addEventListener('click', ()=>{
      state.q = ($('#q')?.value||'').trim();
      state.page = 1;
      applyAndRender();
    });
    
    // Allow search to trigger instantly when hitting 'Enter' in search box
    $('#q')?.addEventListener('keypress', (e)=>{
      if (e.key === 'Enter') {
        state.q = ($('#q')?.value||'').trim();
        state.page = 1;
        applyAndRender();
      }
    });

    $('#applyFilters')?.addEventListener('click', ()=>{
      state.category = $('#fCategory')?.value||'';
      state.maxPrice = Number($('#fMaxPrice')?.value||9999);
      state.page = 1;
      applyAndRender();
    });
  }

  function loadProducts() {
    state.products = realProducts();
    renderCategoryFilter();
    applyAndRender();
  }

  function renderCategoryFilter() {
    const sel = $('#fCategory');
    if (!sel) return;
    const cats = Array.from(new Set(state.products.map(p => p.category || 'Other'))).sort();
    sel.innerHTML = '<option value="">All</option>' + cats.map(c=>`<option value="${c}">${c}</option>`).join('');
  }

  function applyAndRender() {
    let list = [...state.products];

    if (state.q) {
      const q = state.q.toLowerCase();
      list = list.filter(p =>
        (p.title||'').toLowerCase().includes(q) ||
        (p.oemNo||'').toLowerCase().includes(q) ||
        (p.app||'').toLowerCase().includes(q)
      );
    }

    if (state.category) list = list.filter(p => (p.category||'') === state.category);

    list = list.filter(p => {
      const minTier = p.priceTiers?.reduce((m,t)=>Math.min(m, t.price), Infinity);
      return minTier <= state.maxPrice;
    });

    renderGrid(list);
    renderPagination(list.length);
  }

  function renderGrid(list) {
    const grid = $('#grid');
    const tpl = $('#cardTpl');
    if (!grid || !tpl) return;

    const start = (state.page-1)*state.perPage;
    const items = list.slice(start, start + state.perPage);

    grid.innerHTML = '';
    items.forEach(p => {
      const node = tpl.content.cloneNode(true);
      const img = node.querySelector('img');
      const title = node.querySelector('.title');
      const oem = node.querySelector('.oem');
      const app = node.querySelector('.app');
      const moq = node.querySelector('.moq');
      const dDate = node.querySelector('.dDate');
      const rows = node.querySelector('.tierRows');
      const buy = node.querySelector('.buy');

      img.src = p.img;
      img.alt = p.title;
      title.textContent = p.title;
      oem.textContent = p.oemNo || '-';
      app.textContent = p.app || '-';
      moq.textContent = p.moq ? `${p.moq} Pcs` : '-';
      dDate.textContent = p.deliveryDays ? `${p.deliveryDays} Days` : '-';

      rows.innerHTML = p.priceTiers.map(t => `
        <div class="tier">
          <span>${t.min === 1 ? '1 - ' + (t.max??'∞') : `${t.min}${t.max? ' - ' + t.max : ' +'}`} Pcs</span>
          <span>US$ ${t.price.toFixed(2)}</span>
        </div>
      `).join('');

      buy.addEventListener('click', () => {
        alert(`Added to Enquiry: ${p.title}\nOEM Required: ${p.oemNo||'-'}`);
      });

      grid.appendChild(node);
    });

    if (items.length === 0) {
      grid.innerHTML = '<p style="color:#93a0ae; grid-column: 1/-1; text-align: center; padding: 40px;">No matching spare parts found.</p>';
    }
  }

  function renderPagination(total) {
    const wrap = $('#pagination');
    if (!wrap) return;
    const pages = Math.max(1, Math.ceil(total / state.perPage));
    state.page = Math.min(state.page, pages);

    const btn = (n, label) => `<button class="page-btn ${n===state.page?'active':''}" data-p="${n}">${label??n}</button>`;
    let html = '';
    if (pages > 1) {
      html += btn(Math.max(1, state.page-1), 'Prev');
      for (let i=1; i<=pages; i++){
        if (i===1 || i===pages || Math.abs(i-state.page)<=2) html += btn(i);
        else if (!html.endsWith('…')) html += '<span style="color:#93a0ae;margin:0 4px">…</span>';
      }
      html += btn(Math.min(pages, state.page+1), 'Next');
    }
    wrap.innerHTML = html;
    $$('[data-p]').forEach(b=>b.addEventListener('click', ()=>{
      state.page = Number(b.dataset.p);
      applyAndRender();
      window.scrollTo({top: 0, behavior: 'smooth'});
    }));
  }

  function realProducts() {
    const catPath = 'assets/categories/';
    const prodPath = 'assets/products/';
    
    // Remapped to point exactly to files visible on your GitHub tree snapshot
    return [
      {
        id: 101,
        title: 'Handle Switch Assembly',
        category: 'Electrical',
        oemNo: '35200-KVS-601',
        app: 'TITAN 150 2009 ES LH',
        moq: 100,
        deliveryDays: 30,
        img: catPath + 'electronics.svg', // Maps safely to your existing vector
        priceTiers: [
          {min:1, max:1000, price:1.76},
          {min:1000, max:10000, price:1.63},
          {min:10000, max:null, price:1.50}
        ]
      },
      {
        id: 102,
        title: 'Ignition Coil (Iridium)',
        category: 'Engine',
        oemNo: 'BR7HIX',
        app: 'TYPE: Iridium',
        moq: 3000,
        deliveryDays: 60,
        img: catPath + 'motor.svg', // Maps safely to your motor asset
        priceTiers: [
          {min:1, max:1000, price:1.32},
          {min:1000, max:10000, price:1.23},
          {min:10000, max:null, price:1.13}
        ]
      },
      {
        id: 103,
        title: 'Brake Disc 220*',
        category: 'Brake',
        oemNo: '225160070',
        app: 'HONDA 45351GBY910ZA',
        moq: 100,
        deliveryDays: 60,
        img: catPath + 'brake.svg', // Maps safely to your brake asset
        priceTiers: [
          {min:1, max:1000, price:4.77},
          {min:1000, max:10000, price:4.41},
          {min:10000, max:null, price:4.06}
        ]
      },
      {
        id: 104,
        title: 'V-Belt 6PK1065',
        category: 'Battery',
        oemNo: '6PK*1065',
        app: 'Tara',
        moq: 100,
        deliveryDays: 60,
        img: catPath + 'battery.svg', // Maps safely to your battery asset
        priceTiers: [
          {min:1, max:1000, price:2.61},
          {min:1000, max:10000, price:2.41},
          {min:10000, max:null, price:2.22}
        ]
      },
      ...Array.from({length: 24}).map((_, i) => ({
        id: 200 + i,
        title: 'Switch Assy Variant ' + (i + 1),
        category: i % 2 ? 'Electrical' : 'Thermal',
        oemNo: '35200-KPE-900',
        app: 'APP: POP-100, LH',
        moq: 200,
        deliveryDays: 20,
        img: i % 3 === 0 ? prodPath + 'charging-port.jpg' : catPath + 'thermal.svg', // Alternates between your high-res charging port and thermal vector
        priceTiers: [
          {min:1, max:1000, price:1.76},
          {min:1000, max:10000, price:1.63},
          {min:10000, max:null, price:1.50}
        ]
      }))
    ];
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', CatalogApp.init);
