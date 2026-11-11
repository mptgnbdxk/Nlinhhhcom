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
     2. LOAD TRANH CHUẨN THỨ TỰ TỪ TRÁI SANG PHẢI (#1 -> #2 -> #3)
  ========================================== */
  const categoryContainers = {
    chibi: document.querySelector('#gallery .gallery-block:nth-of-type(2) .gallery-grid'),
    head: document.querySelector('#gallery .gallery-block:nth-of-type(3) .gallery-grid'),
    half: document.querySelector('#gallery .gallery-block:nth-of-type(4) .gallery-grid'),
    full: document.querySelector('#gallery .gallery-block:nth-of-type(5) .gallery-grid'),
    couple: document.querySelector('#gallery .gallery-block:nth-of-type(6) .gallery-grid')
  };

  const recentBlock = document.getElementById('recentUploadsBlock');
  const recentGrid = document.getElementById('recentUploadsGrid');

  async function loadArtworks() {
    const localData = JSON.parse(localStorage.getItem('nlinh_gallery_data') || '[]');

    if (localData.length > 0) {
      // Phân nhóm tranh theo từng danh mục
      const categories = ['chibi', 'head', 'half', 'full', 'couple'];
      
      categories.forEach(cat => {
        const container = categoryContainers[cat];
        if (!container) return;

        // Lấy tất cả tranh của danh mục này (thứ tự: #1, #2, #3...)
        const catArts = localData.filter(item => item.category === cat);

        // Duyệt ngược từ cuối lên đầu và prepend()
        // -> Ảnh #2 chèn trước, sau đó ảnh #1 chèn đè lên trước ảnh #2
        // -> Kết quả từ trái qua phải sẽ là: [#1, #2, #3...] ở ngay đầu mục!
        catArts.slice().reverse().forEach(item => {
          const img = document.createElement('img');
          img.src = item.url;
          img.alt = `Commission ${cat}`;
          img.loading = 'lazy';
          container.prepend(img);
        });
      });

      // Nếu có khối "Tranh mới cập nhật"
      if (recentBlock && recentGrid) {
        recentGrid.innerHTML = '';
        localData.slice(0, 8).forEach((item, idx) => {
          const img = document.createElement('img');
          img.src = item.url;
          img.alt = `Tranh mới ${idx + 1}`;
          img.loading = 'lazy';
          recentGrid.appendChild(img);
        });
        recentBlock.style.display = 'block';
      }

      attachLightboxEvents();
    } else {
      try {
        const listUrl = `https://res.cloudinary.com/${CLOUD_NAME}/image/list/commission_art.json`;
        const res = await fetch(listUrl);
        if (res.ok) {
          const data = await res.json();
          if (data && data.resources && data.resources.length > 0 && recentBlock && recentGrid) {
            recentGrid.innerHTML = '';
            data.resources.slice(0, 8).forEach((r, idx) => {
              const img = document.createElement('img');
              img.src = `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/q_auto,f_auto/${r.public_id}.${r.format}`;
              img.alt = `Tranh mới ${idx + 1}`;
              img.loading = 'lazy';
              recentGrid.appendChild(img);
            });
            recentBlock.style.display = 'block';
            attachLightboxEvents();
          }
        }
      } catch (e) {
        console.log("Gallery ready");
      }
    }
  }

  loadArtworks();

});