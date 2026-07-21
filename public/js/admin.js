// basic admin frontend: validation + handlers
(function(){
  function jsonOrText(resp){ return resp.text().then(t=>{ try{ return JSON.parse(t); }catch{ return t; } }); }
  function showFormError(id,msg){ const el=document.getElementById(id); if(!el) return; el.textContent=msg; el.style.display='block'; }
  function hideError(id){ const el=document.getElementById(id); if(!el) return; el.textContent=''; el.style.display='none'; }

  function validateMovie(data){
    if(!data.name || data.name.trim().length<2) return "Tên phim không hợp lệ";
    if(!data.slug || !/^[a-z0-9\-]+$/.test(data.slug)) return "Slug chỉ chứa chữ thường, số và dấu -";
    if(data.year && (data.year<1888 || data.year> (new Date()).getFullYear()+1)) return "Năm không hợp lệ";
    if(data.thumb && !/^https?:\/\//.test(data.thumb)) return "Thumbnail phải là URL";
    return null;
  }

  function validateUser(data, isEdit){
    if(!data.name || data.name.trim().length<2) return "Tên không hợp lệ";
    if(!data.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) return "Email không hợp lệ";
    if(!isEdit && (!data.password || data.password.length<6)) return "Mật khẩu tối thiểu 6 ký tự";
    if(data.password && data.password.length>0 && data.password.length<6) return "Mật khẩu tối thiểu 6 ký tự";
    if(!['user','admin'].includes(data.role)) return "Role không hợp lệ";
    return null;
  }

  async function saveEntity(url, method, payload, errorId, btn){
    hideError(errorId);
    const original = btn.innerHTML;
    try{
      btn.disabled = true; btn.innerHTML = 'Đang lưu...';
      const resp = await fetch(url, { method, headers:{'Content-Type':'application/json'}, body: JSON.stringify(payload) });
      const data = await jsonOrText(resp);
      if(!resp.ok) throw new Error(data?.message || (Array.isArray(data?.errors) ? data.errors.join(', ') : data) || 'Lỗi server');
      showSuccess(method === 'POST' ? 'Tạo mới thành công!' : 'Cập nhật thành công!');
      setTimeout(() => location.reload(), 800);
    }catch(err){
      showFormError(errorId, err.message || err);
      window.showError(err.message || err);
    }finally{
      btn.disabled = false; btn.innerHTML = original;
    }
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const mForm = document.getElementById('movieForm');
    if(mForm){
      mForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const payload = {
          name: (document.getElementById('movieName')?.value||'').trim(),
          slug: (document.getElementById('movieSlug')?.value||'').trim(),
          year: parseInt(document.getElementById('movieYear')?.value)||undefined,
          category: (document.getElementById('movieCategory')?.value||'').trim(),
          thumb: (document.getElementById('movieThumb')?.value||'').trim(),
          description: (document.getElementById('movieDesc')?.value||'').trim()
        };
        const v = validateMovie(payload);
        if(v){ showFormError('movieError', v); window.showWarning(v); return; }
        const btn = document.getElementById('movieSave');
        const originalSlug = document.getElementById('movieOriginalSlug')?.value;
        const method = originalSlug ? 'PUT' : 'POST';
        const url = originalSlug ? `/api/admin/movies/${encodeURIComponent(originalSlug)}` : '/api/admin/movies';
        await saveEntity(url, method, payload, 'movieError', btn);
      });
    }

    const uForm = document.getElementById('userForm');
    if(uForm){
      uForm.addEventListener('submit', async (e)=>{
        e.preventDefault();
        const payload = {
          name: (document.getElementById('userName')?.value||'').trim(),
          email: (document.getElementById('userEmail')?.value||'').trim(),
          password: document.getElementById('userPassword')?.value||undefined,
          role: document.getElementById('userRole')?.value
        };
        const id = document.getElementById('userId')?.value;
        const v = validateUser(payload, !!id);
        if(v){ showFormError('userError', v); window.showWarning(v); return; }
        const btn = document.getElementById('userSave');
        const method = id ? 'PUT' : 'POST';
        const url = id ? `/api/admin/users/${encodeURIComponent(id)}` : '/api/admin/users';
        await saveEntity(url, method, payload, 'userError', btn);
      });
    }

    document.addEventListener('click', async (e) => {
      const target = e.target.closest('.btn-import, .btn-delete-comment, .btn-delete-user') || e.target;

      if (target.classList.contains('btn-import')) {
        const slug = target.dataset.slug;
        const ok = await showConfirm('Import phim "' + slug + '" vào database local?', { title: 'Import phim', confirmText: 'Import' });
        if (!ok) return;
        target.disabled = true;
        try {
          const res = await fetch('/api/admin/import-movie', {
            method: 'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ slug })
          });
          const j = await res.json();
          if (!res.ok) throw new Error(j.message || 'Import thất bại');
          showSuccess(j.message || 'Import phim thành công!');
          setTimeout(() => location.reload(), 800);
        } catch (err) { showError(err.message); target.disabled = false; }
      }

      if (target.classList.contains('btn-delete-comment')) {
        const id = target.dataset.id;
        const ok = await showConfirm('Xóa bình luận này?', { title: 'Xóa bình luận', confirmText: 'Xóa' });
        if (!ok) return;
        try {
          const res = await fetch('/api/admin/comments/' + id, { method: 'DELETE' });
          if (!res.ok) throw new Error('Xóa thất bại');
          showSuccess('Đã xóa bình luận');
          setTimeout(() => location.reload(), 700);
        } catch (err) { showError(err.message); }
      }

      if (target.classList.contains('btn-delete-user')) {
        const id = target.dataset.id;
        const ok = await showConfirm('Xóa user này?', { title: 'Xóa người dùng', confirmText: 'Xóa' });
        if (!ok) return;
        try {
          const res = await fetch('/api/admin/users/' + id, { method: 'DELETE' });
          if (!res.ok) throw new Error('Xóa thất bại');
          showSuccess('Đã xóa người dùng');
          setTimeout(() => location.reload(), 700);
        } catch (err) { showError(err.message); }
      }
    });

    const notifForm = document.getElementById('notif-form');
    if (notifForm) {
      notifForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const fd = new FormData(notifForm);
        const body = { title: fd.get('title'), message: fd.get('message'), type: fd.get('type'), userId: fd.get('userId') };
        try {
          const res = await fetch('/api/admin/notifications', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(body) });
          const j = await res.json();
          if (!res.ok) throw new Error(j.message || 'Gửi thất bại');
          showSuccess(j.message || 'Đã gửi thông báo thành công!');
          setTimeout(() => location.reload(), 800);
        } catch (err) { showError(err.message); }
      });
    }

    const apiConfigForm = document.getElementById('api-config-form');
    if (apiConfigForm) {
      apiConfigForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const url = document.getElementById('apiUrl').value.trim();
        try {
          const res = await fetch('/api/admin/api-config', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ movieApiBaseUrl: url }) });
          const j = await res.json();
          if (!res.ok) throw new Error(j.message || 'Lưu thất bại');
          showSuccess(j.message || 'Đã lưu cấu hình API!');
        } catch (err) { showError(err.message); }
      });
    }
  });
})();
