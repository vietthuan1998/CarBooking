-- Khóa thêm cột status trong policy tự cập nhật profile.
-- Policy cũ (init_schema) chỉ khóa role → user bị vô hiệu hóa (inactive)
-- vẫn có thể tự update status='active' để mở khóa chính mình. Lỗ này đáng
-- ngại hơn khi driver được quyền tự cập nhật thông tin từ app mobile
-- (account driver tạo chỉ với email + mật khẩu, tự bổ sung tên/SĐT sau).
-- Subquery trên chính profiles phải alias (bug 21000 — xem 20260706022643);
-- trong UPDATE, subquery thấy giá trị CŨ của dòng nên so sánh được old/new.

drop policy if exists "profiles: tự cập nhật thông tin cá nhân"
  on public.profiles;

create policy "profiles: tự cập nhật thông tin cá nhân"
  on public.profiles for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    -- không cho tự đổi role/status
    and (role, status) = (
      select p.role, p.status
      from public.profiles p
      where p.id = auth.uid()
    )
  );
