// js/script.js (substitua todo o arquivo por este código)

// Alternar o menu sanduíche e o menu mobile
function toggleMenu() {
  const menu = document.querySelector('.menu-sanduiche');
  const menuMobile = document.querySelector('.menu-mobile');

  menu.classList.toggle('open');
  menuMobile.classList.toggle('show');

  // Fechar ao clicar em links internos do menu mobile
  document.querySelectorAll('.menu-mobile a').forEach(link => {
    link.addEventListener('click', () => {
      menu.classList.remove('open');
      menuMobile.classList.remove('show');
    });
  });
}

// Detectar clique fora para fechar o menu
document.addEventListener('click', function (event) {
  const menu = document.querySelector('.menu-sanduiche');
  const menuMobile = document.querySelector('.menu-mobile');

  if (!menu || !menuMobile) return;

  const cliqueDentroMenuMobile = menuMobile.contains(event.target);
  const cliqueNoSanduiche = menu.contains(event.target);

  // Fecha somente se o menu estiver aberto
  if (menuMobile.classList.contains('show') && !cliqueDentroMenuMobile && !cliqueNoSanduiche) {
    menu.classList.remove('open');
    menuMobile.classList.remove('show');
  }
});

// Markdown-it (certifique-se que markdown-it foi carregado antes)
const md = window.markdownit({ html: true });

window.addEventListener('load', async () => {
  const elementos = document.querySelectorAll('[data-md]');

  for (const el of elementos) {
    try {
      const res = await fetch(el.dataset.md);
      if (!res.ok) throw new Error('Erro ao buscar o arquivo: ' + res.status);
      const markdown = await res.text();
      el.innerHTML = md.render(markdown);

      // --- REMOVER SCRIPTS (não executamos scripts vindos do markdown) ---
      const scripts = el.querySelectorAll('script');
      scripts.forEach((s) => s.remove());

      // --- INJETAR STYLES DO MD NO HEAD ---
      const estilos = el.querySelectorAll('style');
      estilos.forEach((style) => {
        const novoStyle = document.createElement('style');
        novoStyle.textContent = style.textContent;
        document.head.appendChild(novoStyle);
        style.remove();
      });

      // Inicializar componentes que venham dentro do markdown (ex: sliders)
      initSliders(el);

    } catch (erro) {
      el.innerHTML = '<p>Erro ao carregar o arquivo Markdown.</p>';
      console.error(erro);
    }
  }
});

/**
 * initSliders(root)
 * Localiza .slider dentro do root (ou documento) e inicializa cada um isoladamente.
 * Não depende de IDs únicos, usa busca relativa ao container do slider.
 */
function initSliders(root = document) {
  const sliders = root.querySelectorAll('.slider');

  sliders.forEach((sliderEl, sliderIdx) => {
    const imgsContainer = sliderEl.querySelector('.imgs');
    if (!imgsContainer) return; // nada a fazer se estrutura diferente

    const imgs = imgsContainer.querySelectorAll('img');
    if (imgs.length === 0) return;

    // procurar containers próximos (barras e desc) dentro do mesmo bloco (slide-area)
    const slideArea = sliderEl.closest('.slide-area') || sliderEl.parentElement;
    let barrasContainer = slideArea ? slideArea.querySelector('.barras') : null;
    let descContainer = slideArea ? slideArea.querySelector('.desc') : null;

    // se não existir barra, cria uma logo após o slider (opcional)
    if (!barrasContainer) {
      barrasContainer = document.createElement('div');
      barrasContainer.className = 'barras';
      sliderEl.insertAdjacentElement('afterend', barrasContainer);
    } else {
      // limpa barras existentes (evita duplicar se re-inicializar)
      barrasContainer.innerHTML = '';
    }

    // coletar descrições (se houver)
    const descricoes = descContainer ? Array.from(descContainer.querySelectorAll('div')) : [];

    let index = 0;

    // criar indicadores (barras)
    imgs.forEach((_, i) => {
      const div = document.createElement('div');
      if (i === 0) div.classList.add('ativo');
      div.addEventListener('click', () => ir(i));
      barrasContainer.appendChild(div);
    });

    // atualizar estado visual
    function atualizar() {
      // move a .imgs (cada img ocupa 100% do slider)
      imgsContainer.style.transform = `translateX(${-index * 100}%)`;

      // atualizar classes das barras
      barrasContainer.querySelectorAll('div').forEach((el, i) => {
        el.classList.toggle('ativo', i === index);
      });

      // atualizar descrições, se existirem
      descricoes.forEach((el, i) => {
        el.classList.toggle('ativo', i === index);
      });
    }

    function mover(dir) {
      index = (index + dir + imgs.length) % imgs.length;
      atualizar();
    }

    function ir(i) {
      index = i;
      atualizar();
    }

    // ligar botões dentro do próprio slider (caso existam)
    const btnLeft = sliderEl.querySelector('.btn.left');
    const btnRight = sliderEl.querySelector('.btn.right');

    if (btnLeft) {
      btnLeft.removeAttribute('onclick'); // evita erro se houver onclick inline
      btnLeft.addEventListener('click', (e) => {
        e.preventDefault();
        mover(-1);
      });
    }

    if (btnRight) {
      btnRight.removeAttribute('onclick');
      btnRight.addEventListener('click', (e) => {
        e.preventDefault();
        mover(1);
      });
    }

    // fallback: se os botões estiverem fora do .slider mas dentro do slideArea
    if ((!btnLeft || !btnRight) && slideArea) {
      const btns = slideArea.querySelectorAll('.btn');
      btns.forEach(btn => {
        if (btn.closest('.slider') !== sliderEl) return;
        btn.removeAttribute('onclick');
        if (btn.classList.contains('left')) btn.addEventListener('click', () => mover(-1));
        else if (btn.classList.contains('right')) btn.addEventListener('click', () => mover(1));
      });
    }

    // suporte básico a touch (swipe)
    let startX = null;
    imgsContainer.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, {passive: true});

    imgsContainer.addEventListener('touchend', (e) => {
      if (startX === null) return;
      const endX = e.changedTouches[0].clientX;
      const diff = endX - startX;
      if (Math.abs(diff) > 30) {
        mover(diff > 0 ? -1 : 1);
      }
      startX = null;
    });

    // inicializa exibição
    atualizar();
  });
}

window.addEventListener('load', function () {
  const preloaderInner = document.querySelector('#preloader .inner');
  const preloader = document.querySelector('#preloader');

  if (preloaderInner) preloaderInner.style.display = 'none';
  if (preloader) preloader.style.display = 'none';
  document.body.style.overflow = 'visible';
});
