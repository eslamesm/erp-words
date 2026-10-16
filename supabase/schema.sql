-- ═══════════════════════════════════════════════════════════════
-- ERP Words — مخطط المزامنة السحابية
-- شغّل هذا الملف في: Supabase Dashboard → SQL Editor → New query
-- ═══════════════════════════════════════════════════════════════

-- جدول حالة المستخدم: صف واحد لكل مستخدم، يحوي كل التقدم كـ JSONB
create table if not exists public.user_state (
  user_id     uuid primary key references auth.users (id) on delete cascade,
  data        jsonb not null default '{}'::jsonb,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

-- حد أقصى لحجم الحالة (1 ميغابايت) لمنع تضخّم الصف.
-- NOT VALID: لا يُتحقّق من الصفوف الموجودة مسبقًا حتى لا يفشل الترحيل
-- إذا كان أحد المستخدمين قد تجاوز الحد — القيد يسري على كل كتابة جديدة فقط.
alter table public.user_state
  drop constraint if exists user_state_data_size;
alter table public.user_state
  add constraint user_state_data_size check (pg_column_size(data) < 1000000) not valid;

-- (اختياري) للتحقق لاحقًا من الصفوف القديمة بعد تقليل أحجامها:
-- alter table public.user_state validate constraint user_state_data_size;

-- تحديث updated_at تلقائيًا عند أي تعديل
create or replace function public.touch_user_state()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_touch_user_state on public.user_state;
create trigger trg_touch_user_state
  before update on public.user_state
  for each row execute function public.touch_user_state();

-- تفعيل أمان الصفوف: كل مستخدم يرى ويعدّل صفه فقط
alter table public.user_state enable row level security;

drop policy if exists "read own state" on public.user_state;
create policy "read own state"
  on public.user_state for select
  using (auth.uid() = user_id);

drop policy if exists "insert own state" on public.user_state;
create policy "insert own state"
  on public.user_state for insert
  with check (auth.uid() = user_id);

drop policy if exists "update own state" on public.user_state;
create policy "update own state"
  on public.user_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

drop policy if exists "delete own state" on public.user_state;
create policy "delete own state"
  on public.user_state for delete
  using (auth.uid() = user_id);
