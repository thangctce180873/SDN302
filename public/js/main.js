/* ===================================================================
   NightSweet – Client-Side Interactions
   =================================================================== */

/* HEADER SCROLL EFFECT */
(function () {
  const header = document.getElementById("siteHeader");
  if (!header) return;
  let ticking = false;
  window.addEventListener("scroll", () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        header.classList.toggle("scrolled", window.scrollY > 50);
        ticking = false;
      });
      ticking = true;
    }
  });
})();

/* HERO SLIDER */
let heroTimer = null;
let heroIndex = 0;
const THUMB_H = 86;
const CAROUSEL_CENTER = 180;

function layoutCarousel(activeIndex) {
  const thumbs = document.querySelectorAll(".hero-thumb");
  const total = thumbs.length;
  if (!total) return;

  thumbs.forEach((thumb, i) => {
    let offset = i - activeIndex;
    if (offset > total / 2) offset -= total;
    if (offset < -total / 2) offset += total;

    const y = CAROUSEL_CENTER + offset * THUMB_H - THUMB_H / 2;
    const absOff = Math.abs(offset);
    const scale = Math.max(0.65, 1 - absOff * 0.12);
    const opacity = Math.max(0.15, 1 - absOff * 0.25);

    thumb.style.transform = `translateY(${y}px) scale(${scale})`;
    thumb.style.opacity = opacity;
    thumb.style.zIndex = total - absOff;
    thumb.style.pointerEvents = "auto";
  });
}

function switchHero(index) {
  const slides = document.querySelectorAll(".hero-slide");
  const informations = document.querySelectorAll(".hero-info");
  const thumbs = document.querySelectorAll(".hero-thumb");
  if (!slides.length) return;

  slides.forEach((s) => s.classList.remove("active"));
  informations.forEach((i) => i.classList.remove("active"));
  thumbs.forEach((t) => {
    t.classList.remove("active");
    const bar = t.querySelector(".hero-thumb-bar");
    if (bar) bar.style.width = "0";
  });

  heroIndex = index;
  slides[index]?.classList.add("active");
  informations[index]?.classList.add("active");
  thumbs[index]?.classList.add("active");

  layoutCarousel(index);
  resetHeroTimer();
}

function nextHero() {
  const total = document.querySelectorAll(".hero-slide").length;
  if (!total) return;
  switchHero((heroIndex + 1) % total);
}

function resetHeroTimer() {
  clearInterval(heroTimer);
  heroTimer = setInterval(nextHero, 6000);
}

(function () {
  const slides = document.querySelectorAll(".hero-slide");
  if (slides.length) {
    layoutCarousel(0);
    if (slides.length > 1) resetHeroTimer();
  }
})();

/* AUTH */
async function handleRegister(event) {
  event.preventDefault();
  const form = event.target || document.getElementById("registerForm");
  if (!form) return;
  if (form.dataset.processing) return; // prevent double submit
  form.dataset.processing = "1";

  const btn = document.getElementById("registerBtn");
  const errorElement =
    document.getElementById("authError") ||
    document.getElementById("autherroror");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmInput = document.getElementById("confirmPassword");

  if (!btn || !errorElement || !nameInput || !emailInput || !passwordInput || !confirmInput) {
    delete form.dataset.processing;
    return;
  }

  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý...';
  errorElement.style.display = "none";
  errorElement.textContent = "";

  const pw = passwordInput.value;
  if (pw !== confirmInput.value) {
    errorElement.textContent = "Mật khẩu xác nhận không khớp";
    errorElement.style.display = "block";
    btn.disabled = false;
    btn.innerHTML = originalHTML;
    delete form.dataset.processing;
    return;
  }

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: pw,
      }),
    });

    let data = null;
    try { data = await response.json(); } catch (_) {}

    if (!response.ok) {
      const msg = data?.message || data?.error || (await response.text()) || "Đăng ký thất bại";
      throw new Error(msg);
    }
    if (!data?.success) throw new Error(data.message || "Đăng ký thất bại");

    window.location.href = "/";
  } catch (error) {
    errorElement.textContent = error.message || "Có lỗi xảy ra";
    errorElement.style.display = "block";
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
    delete form.dataset.processing;
  }
}

async function handleLogin(event) {
  event.preventDefault();
  const form = event.target || document.getElementById("loginForm");
  if (!form) return;
  if (form.dataset.processing) return;
  form.dataset.processing = "1";

  const btn = document.getElementById("loginButton");
  const errorElement =
    document.getElementById("authError") ||
    document.getElementById("autherroror");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  if (!btn || !errorElement || !emailInput || !passwordInput) {
    delete form.dataset.processing;
    return;
  }

  const originalHTML = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Đang xử lý ...';
  errorElement.style.display = "none";
  errorElement.textContent = "";

  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInput.value.trim(),
        password: passwordInput.value,
      }),
    });

    let data = null;
    try { data = await response.json(); } catch (_) {}

    if (!response.ok) {
      const msg = data?.message || data?.error || (await response.text()) || "Đăng nhập thất bại";
      throw new Error(msg);
    }
    if (!data?.success) throw new Error(data.message || "Đăng nhập thất bại");

    // optional: redirect based on role if returned
    const role = data?.data?.user?.role || data?.data?.role || data?.role;
    if (role === "admin") window.location.href = "/admin";
    else window.location.href = "/";
  } catch (error) {
    errorElement.textContent = error.message || "Có lỗi xảy ra";
    errorElement.style.display = "block";
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHTML;
    delete form.dataset.processing;
  }
}

async function logout() {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.href = "/";
}

/* FAVORITES */
async function toggleFavorite(slug, name, thumb, year) {
  const btn = document.getElementById("favBtn") || document.getElementById("favoriteButton");
  if (!btn) return;

  btn.disabled = true;
  try {
    const checkResponse = await fetch(`/api/favorites/check/${encodeURIComponent(slug)}`);
    const checkData = await checkResponse.json();
    if (!checkResponse.ok) throw new Error(checkData.message || "Không thể kiểm tra yêu thích");

    if (checkData.data?.isFavorite) {
      const delRes = await fetch(`/api/favorites/${encodeURIComponent(slug)}`, { method: "DELETE" });
      const delData = await delRes.json();
      if (!delRes.ok) throw new Error(delData.message || "Không thể bỏ yêu thích");
      btn.innerHTML = '<i class="fas fa-heart"></i> Yêu Thích';
      btn.querySelector("i").style.color = "inherit";
      showSuccess("Đã bỏ yêu thích");
    } else {
      const addRes = await fetch("/api/favorites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          movieSlug: slug,
          movieName: name,
          movieThumb: thumb,
          movieYear: year || undefined,
        }),
      });
      const addData = await addRes.json();
      if (!addRes.ok) throw new Error(addData.message || "Không thể thêm yêu thích");
      btn.innerHTML = '<i class="fas fa-heart" style="color:#ef4444;"></i> Đã Thích';
      showSuccess("Đã thêm vào yêu thích");
    }
  } catch (err) {
    showError(err.message || "Có lỗi xảy ra, vui lòng thử lại");
  } finally {
    btn.disabled = false;
  }
}

async function removeFavorite(slug, element) {
  const ok = await showConfirm("Xóa phim này khỏi danh sách yêu thích?");
  if (!ok) return;
  try {
    const res = await fetch(`/api/favorites/${encodeURIComponent(slug)}`, { method: "DELETE" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Không thể xóa");
    const card = element.closest(".fav-card");
    if (card) {
      card.style.transition = "opacity .3s, transform .3s";
      card.style.opacity = "0";
      card.style.transform = "scale(0.9)";
      setTimeout(() => card.remove(), 300);
    }
    showSuccess("Đã xóa khỏi danh sách yêu thích");
  } catch (err) {
    showError(err.message || "Có lỗi xảy ra, vui lòng thử lại");
  }
}

/* COMMENTS */
async function postComment(event, slug) {
  event.preventDefault();
  const textarea = document.getElementById("commentContent");
  const content = textarea.value.trim();
  if (!content) return;
  try {
    const response = await fetch(`/api/comments/${slug}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    const comment = data.data;
    const html = `
      <div class="comment-item" data-id="${comment._id}" style="animation: fadeIn .4s ease;">
        <div class="comment-avatar"><i class="fas fa-user-circle"></i></div>
        <div class="comment-body">
          <div class="comment-header">
            <strong>${comment.user?.name || "Bạn"}</strong>
            <span class="comment-date">Vừa xong</span>
          </div>
          <p class="comment-text">${comment.content}</p>
          <div class="comment-actions">
            <button onclick="deleteComment('${comment._id}')"><i class="fas fa-trash"></i> Xóa</button>
          </div>
        </div>
      </div>`;
    document
      .getElementById("commentList")
      .insertAdjacentHTML("afterbegin", html);
    textarea.value = "";
    showSuccess("Đã gửi bình luận");
  } catch (error) {
    showError(error.message || "Không thể gửi bình luận");
  }
}

async function deleteComment(id) {
  const ok = await showConfirm("Xóa bình luận này?");
  if (!ok) return;
  try {
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    const element = document.querySelector(`.comment-item[data-id="${id}"]`);
    if (element) {
      element.style.transition = "opacity .3s";
      element.style.opacity = "0";
      setTimeout(() => element.remove(), 300);
    }
    showSuccess("Đã xóa bình luận");
  } catch (_) {
    showError("Có lỗi xảy ra");
  }
}

/* PROFILE */
async function updateProfile(event) {
  event.preventDefault();
  const msgElement = document.getElementById("profileMessage");
  try {
    const response = await fetch("/api/users/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: document.getElementById("profileName").value,
      }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    msgElement.className = "alert alert-success";
    msgElement.textContent = "Cập nhật thành công!";
    msgElement.style.display = "block";
    setTimeout(() => location.reload(), 800);
  } catch (error) {
    msgElement.className = "alert alert-erroror";
    msgElement.textContent = error.message;
    msgElement.style.display = "block";
  }
}

async function changePassword(event) {
  event.preventDefault();
  const msgElement = document.getElementById("passwordMessage");
  try {
    const response = await fetch("/api/users/change-password", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: document.getElementById("currentPassword").value,
        newPassword: document.getElementById("newPassword").value,
      }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    msgElement.className = "alert alert-success";
    msgElement.textContent = "Đổi mật khẩu thành công!";
    msgElement.style.display = "block";
    event.target.reset();
  } catch (error) {
    msgElement.className = "alert alert-erroror";
    msgElement.textContent = error.message;
    msgElement.style.display = "block";
  }
}

/* ADMIN */
async function changeRole(userId, role) {
  try {
    const response = await fetch(`/api/admin/users/${userId}/role`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    const data = await response.json();
    if (!data.success) throw new Error(data.message);
    showSuccess("Đã cập nhật vai trò người dùng");
  } catch (error) {
    showError(error.message);
    location.reload();
  }
}

async function deleteUser(userId) {
  const ok = await showConfirm("Xóa user này? Hành động này không thể hoàn tác!", {
    title: "Xóa người dùng",
    confirmText: "Xóa",
  });
  if (!ok) return;
  try {
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "DELETE",
    });
    const data = await response.json();
    if (!data.success && response.ok === false) throw new Error(data.message);
    const row = document.getElementById(`user-row-${userId}`);
    if (row) {
      row.style.transition = "opacity .3s";
      row.style.opacity = "0";
      setTimeout(() => row.remove(), 300);
    }
    showSuccess("Đã xóa người dùng");
  } catch (error) {
    showError(error.message || "Không thể xóa user");
  }
}

/* LOAD NAV DROPDOWNS */
async function loadDropdowns() {
  try {
    const [categoryResponse, countryRes] = await Promise.all([
      fetch("/api/movies/categories"),
      fetch("/api/movies/countries"),
    ]);
    const categoryData = await categoryResponse.json();
    const countryData = await countryRes.json();

    const categoryElement = document.getElementById("categoryDropdown");
    if (categoryElement && categoryData.success) {
      const categories = Array.isArray(categoryData.data)
        ? categoryData.data
        : [];
      categoryElement.innerHTML = `<div class="topbar-drop-grid">${categories.map((comment) => `<a href="/category/${comment.slug}">${comment.name}</a>`).join("")}</div>`;
    }

    const countryElement = document.getElementById("countryDropdown");
    if (countryElement && countryData.success) {
      const countries = Array.isArray(countryData.data) ? countryData.data : [];
      countryElement.innerHTML = `<div class="topbar-drop-grid">${countries.map((comment) => `<a href="/country/${comment.slug}">${comment.name}</a>`).join("")}</div>`;
    }
  } catch (_) {}
}

document.addEventListener("DOMContentLoaded", () => {
  loadDropdowns();

  const loginForm = document.getElementById("loginForm");
  if (loginForm) loginForm.addEventListener("submit", handleLogin);

  const registerForm = document.getElementById("registerForm");
  if (registerForm) registerForm.addEventListener("submit", handleRegister);

  const favBtn = document.getElementById("favBtn");
  if (favBtn) {
    favBtn.addEventListener("click", () => {
      toggleFavorite(
        favBtn.dataset.slug,
        favBtn.dataset.name,
        favBtn.dataset.thumb,
        favBtn.dataset.year ? parseInt(favBtn.dataset.year, 10) : undefined,
      );
    });
  }
});
