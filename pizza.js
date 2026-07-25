// ============================================================
// PIZZARIA DO GABRIEL — Script principal
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  iniciarMenuLateral();
  iniciarNavegacao();
  iniciarCarrinho();
  iniciarBarraProgresso();
});

/* ------------------------------------------------------------
   Menu lateral (mobile)
------------------------------------------------------------ */
function iniciarMenuLateral() {
  const menuToggle = document.getElementById('menuToggle');
  const menuLateral = document.getElementById('menuLateral');
  const overlayMenu = document.getElementById('overlayMenu');

  function abrirMenu() {
    menuLateral.classList.add('aberto');
    overlayMenu.classList.add('visivel');
    menuToggle.setAttribute('aria-expanded', 'true');
  }

  function fecharMenu() {
    menuLateral.classList.remove('aberto');
    overlayMenu.classList.remove('visivel');
    menuToggle.setAttribute('aria-expanded', 'false');
  }

  menuToggle.addEventListener('click', () => {
    const aberto = menuLateral.classList.contains('aberto');
    aberto ? fecharMenu() : abrirMenu();
  });

  overlayMenu.addEventListener('click', fecharMenu);

  menuLateral.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', fecharMenu);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharMenu();
  });
}

/* ------------------------------------------------------------
   Navegação entre seções (hotbar + menu lateral)
------------------------------------------------------------ */
function iniciarNavegacao() {
  const linksNavegacao = document.querySelectorAll('.hotbar a, .menu-lateral a');
  const secoes = document.querySelectorAll('.secao');

  function ativarSecao(id) {
    secoes.forEach((secao) => secao.classList.toggle('ativa', secao.id === id));

    document.querySelectorAll('.hotbar a').forEach((link) => {
      const alvo = link.getAttribute('href').replace('#', '');
      link.classList.toggle('ativo', alvo === id);
    });

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  linksNavegacao.forEach((link) => {
    link.addEventListener('click', (event) => {
      event.preventDefault();
      const id = link.getAttribute('href').replace('#', '');
      ativarSecao(id);
    });
  });

  ativarSecao('pizzas');
}

/* ------------------------------------------------------------
   Carrinho de compras
------------------------------------------------------------ */
let carrinho = [];

function iniciarCarrinho() {
  const btnCarrinho = document.getElementById('abrirCarrinhoBtn');
  const btnFechar = document.getElementById('fecharCarrinhoBtn');
  const painelCarrinho = document.getElementById('carrinho');
  const overlayCarrinho = document.getElementById('overlayCarrinho');
  const btnFinalizar = document.getElementById('finalizarPedido');

  function abrirCarrinho() {
    painelCarrinho.classList.add('aberto');
    painelCarrinho.setAttribute('aria-hidden', 'false');
    overlayCarrinho.classList.add('visivel');
    btnCarrinho.setAttribute('aria-expanded', 'true');
  }

  function fecharCarrinho() {
    painelCarrinho.classList.remove('aberto');
    painelCarrinho.setAttribute('aria-hidden', 'true');
    overlayCarrinho.classList.remove('visivel');
    btnCarrinho.setAttribute('aria-expanded', 'false');
  }

  btnCarrinho.addEventListener('click', abrirCarrinho);
  btnFechar.addEventListener('click', fecharCarrinho);
  overlayCarrinho.addEventListener('click', fecharCarrinho);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') fecharCarrinho();
  });

  btnFinalizar.addEventListener('click', finalizarPedido);

  // Expõe função de abrir para o fluxo de "adicionar ao carrinho"
  window.__abrirCarrinho = abrirCarrinho;

  atualizarCarrinho();
}

// Chamada pelos botões "+ Adicionar" de cada produto
function adicionarAoCarrinho(nome, preco, imagem) {
  const itemExistente = carrinho.find((item) => item.nome === nome);

  if (itemExistente) {
    itemExistente.quantidade++;
  } else {
    carrinho.push({ nome, preco, imagem, quantidade: 1 });
  }

  atualizarCarrinho();
  mostrarToast(`${nome} adicionado ao carrinho`);
}

function removerUnidade(nome) {
  const index = carrinho.findIndex((item) => item.nome === nome);
  if (index === -1) return;

  carrinho[index].quantidade--;
  if (carrinho[index].quantidade <= 0) {
    carrinho.splice(index, 1);
  }
  atualizarCarrinho();
}

function adicionarUnidade(nome) {
  const item = carrinho.find((i) => i.nome === nome);
  if (item) {
    item.quantidade++;
    atualizarCarrinho();
  }
}

function formatarPreco(valor) {
  return valor.toFixed(2).replace('.', ',');
}

function atualizarCarrinho() {
  const listaEl = document.getElementById('itens-carrinho');
  const vazioEl = document.getElementById('carrinhoVazio');
  const subtotalEl = document.getElementById('subtotal-carrinho');
  const totalEl = document.getElementById('total-carrinho');
  const contagemEl = document.getElementById('carrinhoContagem');
  const btnFinalizar = document.getElementById('finalizarPedido');

  listaEl.innerHTML = '';

  let total = 0;
  let totalItens = 0;

  carrinho.forEach((item) => {
    const subtotalItem = item.preco * item.quantidade;
    total += subtotalItem;
    totalItens += item.quantidade;

    const li = document.createElement('li');
    li.className = 'carrinho-item';
    li.innerHTML = `
      <img src="${item.imagem}" alt="" class="carrinho-item-img">
      <div class="carrinho-item-info">
        <span class="carrinho-item-nome">${item.nome}</span>
        <div class="carrinho-item-preco-linha">
          <span>R$ ${formatarPreco(item.preco)}</span>
          <div class="qtd-controles">
            <button class="qtd-btn" data-acao="remover" data-nome="${item.nome}" aria-label="Diminuir quantidade">−</button>
            <span class="qtd-valor">${item.quantidade}</span>
            <button class="qtd-btn" data-acao="adicionar" data-nome="${item.nome}" aria-label="Aumentar quantidade">+</button>
          </div>
        </div>
      </div>
      <span class="carrinho-item-subtotal">R$ ${formatarPreco(subtotalItem)}</span>
    `;

    li.querySelector('[data-acao="remover"]').addEventListener('click', () => removerUnidade(item.nome));
    li.querySelector('[data-acao="adicionar"]').addEventListener('click', () => adicionarUnidade(item.nome));

    listaEl.appendChild(li);
  });

  subtotalEl.textContent = `R$ ${formatarPreco(total)}`;
  totalEl.textContent = formatarPreco(total);

  // Estado vazio
  const estaVazio = carrinho.length === 0;
  vazioEl.style.display = estaVazio ? 'flex' : 'none';
  listaEl.style.display = estaVazio ? 'none' : 'flex';
  btnFinalizar.disabled = estaVazio;

  // Badge de contagem
  contagemEl.textContent = totalItens;
  contagemEl.classList.toggle('visivel', totalItens > 0);
}

function finalizarPedido() {
  if (carrinho.length === 0) return;

  const mensagem = document.getElementById('mensagemConfirmacao');
  mensagem.style.display = 'block';

  carrinho = [];
  atualizarCarrinho();

  setTimeout(() => {
    mensagem.style.display = 'none';
  }, 5000);
}

/* ------------------------------------------------------------
   Toast de confirmação
------------------------------------------------------------ */
let toastTimeout;

function mostrarToast(texto) {
  const toast = document.getElementById('toast');
  toast.textContent = texto;
  toast.classList.add('visivel');

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('visivel');
  }, 2200);
}

/* ------------------------------------------------------------
   Barra de progresso de scroll (otimizada com requestAnimationFrame
   para não travar durante o scroll)
------------------------------------------------------------ */
function iniciarBarraProgresso() {
  const barra = document.getElementById('barraProgresso');
  let ticking = false;

  function atualizar() {
    const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
    const progresso = alturaTotal > 0 ? (window.scrollY / alturaTotal) * 100 : 0;
    barra.style.width = `${progresso}%`;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(atualizar);
      ticking = true;
    }
  }, { passive: true });
}