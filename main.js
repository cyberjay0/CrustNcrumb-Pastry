document.addEventListener('DOMContentLoaded', () => {

  /* ==========================================================================
     PRELOADER SPLASH SCREEN
     ========================================================================== */
  const preloader = document.getElementById('preloader');
  
  if (preloader) {
    document.body.classList.add('loading');
    
    // Simulate asset loading
    setTimeout(() => {
      preloader.classList.add('fade-out');
      document.body.classList.remove('loading');
      
      setTimeout(() => {
        preloader.style.display = 'none';
        
        // Trigger hero scroll reveals immediately on load
        const heroReveals = document.querySelectorAll('#home .scroll-reveal');
        heroReveals.forEach(el => el.classList.add('active'));
      }, 800);
    }, 2200);
  }

  /* ==========================================================================
     HEADER SCROLL EFFECTS & PROGRESS INDICATOR
     ========================================================================== */
  const header = document.getElementById('site-header');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const progressBar = document.getElementById('scroll-progress-bar');

  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;

    // 1. Shrink header background on scroll
    if (scrollTop > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }

    // 2. Scroll Progress indicator tracking
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    if (progressBar) {
      progressBar.style.width = `${scrollPercent}%`;
    }

    // 3. Dynamic active section highlighting in header
    let currentId = '';
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 180;
      const sectionHeight = section.offsetHeight;
      if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
        currentId = section.getAttribute('id');
      }
    });

    if (currentId) {
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentId}`) {
          link.classList.add('active');
        }
      });
    }
  });

  /* ==========================================================================
     MOBILE DRAWER NAVIGATION
     ========================================================================== */
  const menuToggleBtn = document.getElementById('menu-toggle-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  const mobileLinks = document.querySelectorAll('.mobile-link');

  if (menuToggleBtn && mobileMenu) {
    function toggleMobileMenu() {
      menuToggleBtn.classList.toggle('open');
      mobileMenu.classList.toggle('open');
      
      // Prevent background scrolling when mobile menu drawer is open
      if (mobileMenu.classList.contains('open')) {
        document.body.classList.add('loading');
      } else {
        document.body.classList.remove('loading');
      }
    }

    menuToggleBtn.addEventListener('click', toggleMobileMenu);

    // Close drawer when clicking a link
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        menuToggleBtn.classList.remove('open');
        mobileMenu.classList.remove('open');
        document.body.classList.remove('loading');
      });
    });
  }

  /* ==========================================================================
     SCROLL REVEAL (INTERSECTION OBSERVER)
     ========================================================================== */
  // We reveal sections dynamically as they slide into viewport
  const revealElements = Array.from(document.querySelectorAll('.scroll-reveal'))
    .filter(el => !el.closest('#home')); // Skip hero section since we trigger it on load

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          observer.unobserve(entry.target); // Trigger animation once only
        }
      });
    }, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -60px 0px'
    });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    // Fallback if IntersectionObserver is not supported
    revealElements.forEach(el => el.classList.add('active'));
  }

  /* ==========================================================================
     LOCATION MODAL CONTROLS & TABS
     ========================================================================== */
  const openLocationBtn = document.getElementById('open-location-modal-btn');
  const closeLocationBtn = document.getElementById('close-location-modal-btn');
  const locationModal = document.getElementById('location-modal');
  const locationTabButtons = document.querySelectorAll('.location-tab-btn');
  const locationContents = document.querySelectorAll('.location-detail-content');

  if (locationModal) {
    // Toggle Modal Open/Close
    openLocationBtn?.addEventListener('click', () => {
      locationModal.classList.add('open');
      document.body.classList.add('loading');
    });

    closeLocationBtn?.addEventListener('click', () => {
      locationModal.classList.remove('open');
      document.body.classList.remove('loading');
    });

    // Close on clicking backdrop
    locationModal.addEventListener('click', (e) => {
      if (e.target === locationModal) {
        locationModal.classList.remove('open');
        document.body.classList.remove('loading');
      }
    });

    // Handle tab switching inside modal
    locationTabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        locationTabButtons.forEach(b => b.classList.remove('active'));
        locationContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        const targetId = btn.getAttribute('data-location') === 'downtown' ? 'loc-downtown' : 'loc-suburbs';
        document.getElementById(targetId)?.classList.add('active');
      });
    });
  }

  /* ==========================================================================
     WHATSAPP ORDER BUILDER STATE & ACTIONS
     ========================================================================== */
  const orderModal = document.getElementById('order-helper-modal');
  const closeOrderBtn = document.getElementById('close-order-helper-btn');
  const openOrderBtns = document.querySelectorAll('.open-order-helper-btn');
  const orderMenuTabBtns = document.querySelectorAll('.menu-tab-btn');
  const orderTabContents = document.querySelectorAll('.order-tab-content');
  const orderSummaryList = document.getElementById('order-summary-list');
  const orderTotalText = document.getElementById('order-estimated-total');
  const sendWhatsappBtn = document.getElementById('send-whatsapp-order-btn');
  const pickupTimeSelect = document.getElementById('pickup-time');
  const viewCategoryBtns = document.querySelectorAll('.view-category-details-btn');

  // WhatsApp Config
  const WHATSAPP_PHONE_NUMBER = '15557829966'; // Crust 'N' Crumb order processing line

  // Application state for building orders
  let cart = [];

  // Toggle order modal
  function openOrderModal() {
    orderModal?.classList.add('open');
    document.body.classList.add('loading');
    renderSummaryCart();
  }

  function closeOrderModal() {
    orderModal?.classList.remove('open');
    document.body.classList.remove('loading');
  }

  openOrderBtns.forEach(btn => btn.addEventListener('click', (e) => {
    e.preventDefault();
    openOrderModal();
  }));

  closeOrderBtn?.addEventListener('click', closeOrderModal);

  orderModal?.addEventListener('click', (e) => {
    if (e.target === orderModal) {
      closeOrderModal();
    }
  });

  // Category Tab switching inside WhatsApp builder modal
  orderMenuTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      orderMenuTabBtns.forEach(b => b.classList.remove('active'));
      orderTabContents.forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = `order-${btn.getAttribute('data-tab')}`;
      document.getElementById(targetId)?.classList.add('active');
    });
  });

  // Handle "VIEW ALL" links on the main menu categories cards
  viewCategoryBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const targetCategory = btn.getAttribute('data-category'); // 'coffee', 'bakes', etc.
      
      openOrderModal();
      
      // Auto switch to that category tab inside the builder modal
      const matchedTabBtn = document.querySelector(`.menu-tab-btn[data-tab="${targetCategory}"]`);
      if (matchedTabBtn) {
        matchedTabBtn.click();
      }
    });
  });

  // Core Add/Modify/Remove Cart State Actions
  function addToCart(itemName, itemPrice) {
    const existingIndex = cart.findIndex(item => item.name === itemName);
    
    if (existingIndex > -1) {
      cart[existingIndex].qty += 1;
    } else {
      cart.push({
        name: itemName,
        price: parseFloat(itemPrice),
        qty: 1
      });
    }
    
    renderSummaryCart();
    showToast(`Added ${itemName} to order!`, 'fa-solid fa-mug-hot');
  }

  function modifyQty(itemName, amount) {
    const index = cart.findIndex(item => item.name === itemName);
    if (index === -1) return;

    cart[index].qty += amount;
    
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
      showToast(`Removed ${itemName} from order`, 'fa-solid fa-trash');
    }
    
    renderSummaryCart();
  }

  // Bind main page menu '+' quick-add CTA buttons
  const mainPageAddBtns = document.querySelectorAll('.add-to-whatsapp-btn');
  mainPageAddBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const name = btn.getAttribute('data-name');
      const price = btn.getAttribute('data-price');
      addToCart(name, price);
    });
  });

  // Bind order builder list '+' add buttons
  const builderAddBtns = document.querySelectorAll('.btn-item-add');
  builderAddBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const parent = btn.closest('.order-grid-item');
      if (parent) {
        const name = parent.getAttribute('data-name');
        const price = parent.getAttribute('data-price');
        addToCart(name, price);
      }
    });
  });

  // Render the shopping summary visual lists
  function renderSummaryCart() {
    if (!orderSummaryList) return;

    if (cart.length === 0) {
      orderSummaryList.innerHTML = `
        <div class="empty-summary-message">
          <i class="fa-solid fa-mug-hot"></i>
          <p>No items added yet. Click "+" to build your order!</p>
        </div>
      `;
      orderTotalText.textContent = '₦0';
      sendWhatsappBtn.disabled = true;
      return;
    }

    let summaryHtml = '';
    let total = 0;

    cart.forEach(item => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;

      summaryHtml += `
        <div class="summary-list-item">
          <span>${item.name}</span>
          <div class="summary-qty-controls">
            <button class="btn-qty-mod dec-qty" data-name="${item.name}">-</button>
            <span class="summary-item-qty">${item.qty}</span>
            <button class="btn-qty-mod inc-qty" data-name="${item.name}">+</button>
          </div>
          <span class="summary-item-total">₦${itemTotal.toLocaleString()}</span>
        </div>
      `;
    });

    orderSummaryList.innerHTML = summaryHtml;
    orderTotalText.textContent = `₦${total.toLocaleString()}`;
    sendWhatsappBtn.disabled = false;

    // Bind event listeners to new quantity modify buttons
    const incBtns = orderSummaryList.querySelectorAll('.inc-qty');
    const decBtns = orderSummaryList.querySelectorAll('.dec-qty');

    incBtns.forEach(b => b.addEventListener('click', () => {
      modifyQty(b.getAttribute('data-name'), 1);
    }));

    decBtns.forEach(b => b.addEventListener('click', () => {
      modifyQty(b.getAttribute('data-name'), -1);
    }));
  }

  // Compile WhatsApp Template and redirect on Order Submit
  sendWhatsappBtn?.addEventListener('click', () => {
    if (cart.length === 0) return;

    const time = pickupTimeSelect ? pickupTimeSelect.value : 'ASAP';
    
    // Build textual template message
    let message = `*☕ NEW ORDER: Crust 'N' Crumb Café* \n\n`;
    message += `Hello! I would like to place an order for pickup:\n\n`;
    
    let total = 0;
    cart.forEach(item => {
      const itemTotal = item.price * item.qty;
      total += itemTotal;
      message += `• *${item.qty}x* ${item.name} (₦${item.price.toLocaleString()} each) - _Subtotal: ₦${itemTotal.toLocaleString()}_\n`;
    });
    
    message += `\n💵 *Estimated Total:* ₦${total.toLocaleString()}\n`;
    message += `⏱️ *Requested Pickup Time:* ${time}\n\n`;
    message += `Please confirm availability and pickup instructions. Thank you!`;

    // Encode text and create standard wa.me redirect url
    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE_NUMBER}?text=${encodedText}`;

    // Open WhatsApp in new window
    window.open(whatsappUrl, '_blank');

    // Display success notification and clean current local order state
    closeOrderModal();
    cart = [];
    renderSummaryCart();
    
    showToast('Redirected to WhatsApp! Order submitted successfully.', 'fa-solid fa-circle-check');
  });

  /* ==========================================================================
     CONTACT FORM HANDLING (MOCK SUBMIT SUCCESS)
     ========================================================================== */
  const contactForm = document.getElementById('contact-form');
  const formSuccess = document.getElementById('form-success');
  const formResetBtn = document.getElementById('form-reset-btn');
  const submitBtn = document.getElementById('submit-btn');

  if (contactForm && formSuccess) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Show mock loader on submit button
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `SENDING... <i class="fa-solid fa-spinner fa-spin"></i>`;
      }

      // Simulate API form submission post request
      setTimeout(() => {
        contactForm.classList.add('hidden');
        formSuccess.classList.add('active');
        
        // Reset submit button state
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `SEND MESSAGE <i class="fa-solid fa-paper-plane"></i>`;
        }
        
        showToast('Message sent! We\'ll contact you soon.', 'fa-solid fa-paper-plane');
      }, 1500);
    });

    // Reset Form to initial state
    formResetBtn?.addEventListener('click', () => {
      contactForm.reset();
      formSuccess.classList.remove('active');
      contactForm.classList.remove('hidden');
    });
  }

  /* ==========================================================================
     TOAST NOTIFICATION TRIGGER
     ========================================================================== */
  function showToast(message, iconClass = 'fa-solid fa-info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i class="${iconClass}"></i>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    // Slide in
    setTimeout(() => {
      toast.classList.add('show');
    }, 50);

    // Auto dismiss after 3 seconds
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 3200);
  }

});
