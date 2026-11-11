document.addEventListener("DOMContentLoaded", () => {
  const CLOUD_NAME = 'o6quhhtx';

  /* ==========================================
     1. LIGHTBOX PHÓNG TO ẢNH
  ========================================== */
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightboxImage");
  const lightboxTitle = document.getElementById("lightboxTitle");
  const closeBtn = lightbox ? lightbox.querySelector(".close") : null;

  function attachLightboxEvents() {
    const galleryImages = document.querySelectorAll(
      ".gallery-grid img, .hero-image-wrap img"
    );

    galleryImages.forEach((img) => {
      img.style.cursor = "pointer";
      img.onclick = () => {
        if (!lightbox || !lightboxImg) return;
        lightboxImg.src = img.currentSrc || img.src;
        lightboxImg.alt = img.alt || "Artwork Sample";
        if (lightboxTitle) {
          lightboxTitle.textContent = img.alt || "Artwork Sample";
        }
        lightbox.classList.add("active");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
      };
    });
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove("active");
    lightbox.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setTimeout(() => {
      if (!lightbox.classList.contains("active") && lightboxImg) {
        lightboxImg.src = "";
      }
    }, 250);
  }

  if (closeBtn) closeBtn.addEventListener("click", closeLightbox);
  if (lightbox) {
    lightbox.addEventListener("click", (e) => {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && lightbox && lightbox.classList.contains("active")) {
      closeLightbox();
    }
  });

  attachLightboxEvents();

  /* ==========================================
     2. LOAD TRANH ĐỒNG BỘ TRÊN MỌI THIẾT BỊ
  ========================================== */
  function renderImages(artsList) {
    const categories = ['chibi', 'head', 'half', 'full', 'couple'];
    const blocks = document.querySelectorAll('#gallery .gallery-block');

    categories.forEach(cat => {
      const catArts = artsList.filter(item => item.category === cat);
      let targetContainer = null;

      blocks.forEach(b => {
        const titleText = b.querySelector('.gallery-title')?.textContent.toLowerCase() || '';
        if (titleText.includes(cat)) {
          targetContainer = b.querySelector('.gallery-grid');
        }
      });

      if (targetContainer) {
        targetContainer.innerHTML = '';
        catArts.forEach(item => {
          const img = document.createElement('img');
          img.src = item.url;
          img.alt = `Commission ${cat}`;
          img.loading = 'lazy';
          targetContainer.appendChild(img);
        });
      }
    });

    attachLightboxEvents();
  }

  async function loadArtworks() {
    // 1. Nếu có dữ liệu trong GLOBAL_GALLERY_DATA (chạy tốt trên cả điện thoại)
    if (window.GLOBAL_GALLERY_DATA && window.GLOBAL_GALLERY_DATA.length > 0) {
      renderImages(window.GLOBAL_GALLERY_DATA);
      return;
    }

    // 2. Kiểm tra bộ nhớ cục bộ trên máy hiện tại
    const localData = JSON.parse(localStorage.getItem('nlinh_gallery_data') || '[]');
    if (localData.length > 0) {
      renderImages(localData);
      return;
    }

    // 3. Fallback kéo từ Cloudinary nếu được cấp quyền Client Resource List
    try {
      const listUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/commission_art.json`;
      const res = await fetch(listUrl);
      if (res.ok) {
        const data = await res.json();
        if (data && data.resources && data.resources.length > 0) {
          const cloudArts = data.resources.map(r => {
            const catTag = (r.context && r.context.custom && r.context.custom.category) || 'chibi';
            return {
              id: r.public_id,
              url: `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/f_auto,q_auto/${r.public_id}.${r.format}`,
              category: catTag,
              version: r.version
            };
          });
          renderImages(cloudArts);
        }
      }
    } catch (err) {
      console.log("No cloud sync list available.");
    }
  }

  loadArtworks();

  /* =========================================================
     ✨ HIỆU ỨNG RÊ CHUỘT BỤI SAO
  ========================================================= */
  const sparkSymbols = ['✦', '✧', '♡', '⋆', '🌸'];
  const sparkColors = ['#f6a5b9', '#d87093', '#ffcad4', '#e2a3c7', '#ffd6e0'];
  let lastSparkTime = 0;

  window.addEventListener('mousemove', (e) => {
    const now = Date.now();
    if (now - lastSparkTime < 45) return;
    lastSparkTime = now;

    const span = document.createElement('span');
    span.className = 'sparkle-trail';
    span.textContent = sparkSymbols[Math.floor(Math.random() * sparkSymbols.length)];
    span.style.left = `${e.clientX}px`;
    span.style.top = `${e.clientY}px`;
    span.style.color = sparkColors[Math.floor(Math.random() * sparkColors.length)];
    span.style.fontSize = `${Math.floor(Math.random() * 8) + 11}px`;

    document.body.appendChild(span);

    setTimeout(() => {
      span.remove();
    }, 750);
  });
});
