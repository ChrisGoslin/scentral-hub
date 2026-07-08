-- DB-008: Keep fragrances.image_url pointed at direct image assets only.
-- Page URLs from Fragrantica/Parfumo should be nulled so the UI falls back to
-- the family gradient placeholder instead of rendering a broken image.

create or replace function public.normalize_fragrance_image_url()
returns trigger
language plpgsql
as $$
begin
  if new.image_url is null then
    return new;
  end if;

  if new.image_url ~* 'fragrantica\.com/.+\.html(\?.*)?$'
     or (
       new.image_url ~* 'parfumo\.com/Perfumes/[^?]+$'
       and new.image_url !~* '\.(jpg|jpeg|png|webp|gif|avif|bmp|svg)(\?.*)?$'
     )
     or (
       new.image_url ~* 'fragrantica\.com/perfume/'
       and new.image_url !~* '\.(jpg|jpeg|png|webp|gif|avif|bmp|svg)(\?.*)?$'
     )
  then
    new.image_url := null;
  end if;

  return new;
end;
$$;

drop trigger if exists fragrance_image_url_guardrail on fragrances;
create trigger fragrance_image_url_guardrail
before insert or update of image_url on fragrances
for each row execute function public.normalize_fragrance_image_url();
