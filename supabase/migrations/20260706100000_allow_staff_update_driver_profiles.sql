-- Cho phép staff chỉnh sửa dữ liệu tài xế (họ tên, SĐT, trạng thái hoạt động),
-- không chỉ xem như trước. Staff KHÔNG được đổi role của tài xế (chỉ admin mới
-- được phép đổi role) — with check ràng buộc role phải giữ nguyên là 'driver'.
create policy "profiles: staff cập nhật tài xế"
  on public.profiles for update
  using (
    get_my_role() = 'staff'
    and role = 'driver'
  )
  with check (
    role = 'driver'
  );
