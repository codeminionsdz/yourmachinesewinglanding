update public.products
set media = media || jsonb_build_object(
  'waterproofOne', '/gurm/photo-new-section1.jpg',
  'waterproofTwo', '/gurm/photo-new-section2.jpg'
), updated_at = now()
where slug = 'gurm-convertible-cargo-pants';