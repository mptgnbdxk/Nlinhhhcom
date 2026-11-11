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
  const categoryContainers = {
    chibi: document.querySelector('#gallery .gallery-block:nth-of-type(1) .gallery-grid, #gallery .gallery-block:nth-of-type(2) .gallery-grid'),
    head: document.querySelector('#gallery .gallery-block:nth-of-type(2) .gallery-grid, #gallery .gallery-block:nth-of-type(3) .gallery-grid'),
    half: document.querySelector('#gallery .gallery-block:nth-of-type(3) .gallery-grid, #gallery .gallery-block:nth-of-type(4) .gallery-grid'),
    full: document.querySelector('#gallery .gallery-block:nth-of-type(4) .gallery-grid, #gallery .gallery-block:nth-of-type(5) .gallery-grid'),
    couple: document.querySelector('#gallery .gallery-block:nth-of-type(5) .gallery-grid, #gallery .gallery-block:nth-of-type(6) .gallery-grid')
  };

  async function loadArtworks() {
    // 1. Kiểm tra cache máy hiện tại
    const localData = JSON.parse(localStorage.getItem('nlinh_gallery_data') || '[]');

    if (localData.length > 0) {
      renderImages(localData);
    } else {
      // 2. Nếu ở thiết bị khác (điện thoại), kéo trực tiếp toàn bộ ảnh từ Cloudinary
      try {
        const listUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/commission_art.json`;
        const res = await fetch(listUrl);
        if (res.ok) {
          const data = await res.json();
          if (data && data.resources && data.resources.length > 0) {
            // Chuẩn hóa dữ liệu theo format web
            const cloudArts = data.resources.map(r => {
              // Tìm category từ tags (ví dụ: chibi, head, half...)
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
        console.log("Waiting for images sync...");
      }
    }
  }

  function renderImages(artsList) {
    const categories = ['chibi', 'head', 'half', 'full', 'couple'];
    categories.forEach(cat => {
      const catArts = artsList.filter(item => item.category === cat);
      // Tìm đúng container theo class hoặc title
      const blocks = document.querySelectorAll('#gallery .gallery-block');
      let targetContainer = null;
      blocks.forEach(b => {
        const titleText = b.querySelector('.gallery-title')?.textContent.toLowerCase() || '';
        if (titleText.includes(cat)) {
          targetContainer = b.querySelector('.gallery-grid');
        }
      });

      if (targetContainer) {
        targetContainer.innerHTML = '';
        // Duyệt theo thứ tự trái qua phải
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

  loadArtworks();

  /* =========================================================
     ✨ HIỆU ỨNG RÊ CHUỘT BỤI SAO (Tự tắt trên màn cảm ứng)
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

})
