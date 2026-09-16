alter table public.orders
  add column meta_purchase_status text not null default 'pending'
    check (meta_purchase_status in ('pending', 'sending', 'sent', 'failed')),
  add column meta_purchase_lease_id uuid,
  add column meta_purchase_lease_expires_at timestamptz,
  add column meta_purchase_sent_at timestamptz;

create or replace function public.claim_meta_purchase(
  p_order_id uuid,
  p_lease_id uuid,
  p_lease_seconds integer default 300
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_lease_seconds < 1 then
    raise exception 'invalid_meta_purchase_lease';
  end if;

  update orders
  set meta_purchase_status = 'sending',
      meta_purchase_lease_id = p_lease_id,
      meta_purchase_lease_expires_at = now() + make_interval(secs => p_lease_seconds)
  where id = p_order_id
    and (
      meta_purchase_status in ('pending', 'failed')
      or (meta_purchase_status = 'sending' and meta_purchase_lease_expires_at < now())
    );

  return found;
end;
$$;

create or replace function public.complete_meta_purchase(
  p_order_id uuid,
  p_lease_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update orders
  set meta_purchase_status = 'sent',
      meta_purchase_lease_id = null,
      meta_purchase_lease_expires_at = null,
      meta_purchase_sent_at = now()
  where id = p_order_id
    and meta_purchase_status = 'sending'
    and meta_purchase_lease_id = p_lease_id;

  return found;
end;
$$;

create or replace function public.fail_meta_purchase(
  p_order_id uuid,
  p_lease_id uuid
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update orders
  set meta_purchase_status = 'failed',
      meta_purchase_lease_id = null,
      meta_purchase_lease_expires_at = null
  where id = p_order_id
    and meta_purchase_status = 'sending'
    and meta_purchase_lease_id = p_lease_id;

  return found;
end;
$$;

revoke all on function public.claim_meta_purchase(uuid, uuid, integer) from public, anon, authenticated;
revoke all on function public.complete_meta_purchase(uuid, uuid) from public, anon, authenticated;
revoke all on function public.fail_meta_purchase(uuid, uuid) from public, anon, authenticated;
grant execute on function public.claim_meta_purchase(uuid, uuid, integer) to service_role;
grant execute on function public.complete_meta_purchase(uuid, uuid) to service_role;
grant execute on function public.fail_meta_purchase(uuid, uuid) to service_role;
