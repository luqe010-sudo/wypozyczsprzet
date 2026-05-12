-- 1. MAPOWANIE GŁÓWNYCH KATEGORII (Stare/PL -> Nowe EN)
UPDATE public.equipment SET category = 'earthmoving' WHERE category IN ('heavy_equipment', 'construction_equipment', 'roboty_ziemne');
UPDATE public.equipment SET category = 'garden' WHERE category IN ('garden_equipment', 'cleaning_equipment', 'sprzet_ogrodowy');
UPDATE public.equipment SET category = 'power-generators' WHERE category IN ('generators_and_power', 'agregaty_i_zasilanie');
UPDATE public.equipment SET category = 'access-platforms' WHERE category IN ('lifts_and_platforms', 'scaffolding', 'prace_na_wysokosci');
UPDATE public.equipment SET category = 'tools' WHERE category IN ('tools', 'trailers_and_transport', 'others', 'container', 'narzedzia');

-- 2. USTALAMY PODKATEGORIE (EN KEYS) NA PODSTAWIE NAZW (PL)

-- Earthmoving (Roboty ziemne)
UPDATE public.equipment SET subcategory = 'excavators' WHERE category = 'earthmoving' AND (name ILIKE '%koparka%' AND name NOT ILIKE '%ładowarka%' AND name NOT ILIKE '%minikoparka%');
UPDATE public.equipment SET subcategory = 'miniexcavators' WHERE category = 'earthmoving' AND name ILIKE '%minikoparka%';
UPDATE public.equipment SET subcategory = 'backhoe_loaders' WHERE category = 'earthmoving' AND name ILIKE '%ładowarka%';
UPDATE public.equipment SET subcategory = 'dumpers' WHERE category = 'earthmoving' AND (name ILIKE '%wozid%' OR name ILIKE '%dumper%');
UPDATE public.equipment SET subcategory = 'compactors' WHERE category = 'earthmoving' AND (name ILIKE '%zagęszczarka%' OR name ILIKE '%zageszczarka%');
UPDATE public.equipment SET subcategory = 'rollers' WHERE category = 'earthmoving' AND name ILIKE '%walec%';
UPDATE public.equipment SET subcategory = 'paving_equipment' WHERE category = 'earthmoving' AND (name ILIKE '%chwytak%' OR name ILIKE '%gilotyna%' OR name ILIKE '%brukarsk%');

-- Garden (Sprzęt ogrodowy)
UPDATE public.equipment SET subcategory = 'mowers' WHERE category = 'garden' AND name ILIKE '%kosiarka%';
UPDATE public.equipment SET subcategory = 'tractors' WHERE category = 'garden' AND name ILIKE '%traktorek%';
UPDATE public.equipment SET subcategory = 'scarifiers' WHERE category = 'garden' AND (name ILIKE '%wertykulator%' OR name ILIKE '%aerator%');
UPDATE public.equipment SET subcategory = 'tillers' WHERE category = 'garden' AND name ILIKE '%glebogryzarka%';
UPDATE public.equipment SET subcategory = 'pressure_washers' WHERE category = 'garden' AND name ILIKE '%myjka%';
UPDATE public.equipment SET subcategory = 'saws' WHERE category = 'garden' AND (name ILIKE '%piła%' OR name ILIKE '%pilarka%' OR name ILIKE '%rębak%');
UPDATE public.equipment SET subcategory = 'shredders' WHERE category = 'garden' AND name ILIKE '%rozdrabniacz%';

-- Power Generators (Agregaty i zasilanie)
UPDATE public.equipment SET subcategory = 'generators' WHERE category = 'power-generators' AND (name ILIKE '%agregat%' AND name NOT ILIKE '%malarski%');
UPDATE public.equipment SET subcategory = 'compressors' WHERE category = 'power-generators' AND (name ILIKE '%kompresor%' OR name ILIKE '%sprężarka%');
UPDATE public.equipment SET subcategory = 'heaters' WHERE category = 'power-generators' AND name ILIKE '%nagrzewnica%';
UPDATE public.equipment SET subcategory = 'dehumidifiers' WHERE category = 'power-generators' AND name ILIKE '%osuszacz%';
UPDATE public.equipment SET subcategory = 'welders' WHERE category = 'power-generators' AND name ILIKE '%spawarka%';

-- Access Platforms (Prace na wysokości)
UPDATE public.equipment SET subcategory = 'scaffolding' WHERE category = 'access-platforms' AND (name ILIKE '%rusztowanie%' OR name ILIKE '%szalunk%' OR name ILIKE '%stempl%');
UPDATE public.equipment SET subcategory = 'lifts' WHERE category = 'access-platforms' AND (name ILIKE '%podnośnik%' OR name ILIKE '%podnosnik%' OR name ILIKE '%dźwig%' OR name ILIKE '%żuraw%');

-- Tools (Narzędzia)
UPDATE public.equipment SET subcategory = 'demolition_hammers' WHERE category = 'tools' AND (name ILIKE '%młot%' OR name ILIKE '%mlot%');
UPDATE public.equipment SET subcategory = 'wiertnice' WHERE category = 'tools' AND (name ILIKE '%wiertnica%' OR name ILIKE '%świder%');
UPDATE public.equipment SET subcategory = 'grinders' WHERE category = 'tools' AND name ILIKE '%szlifierka%';
UPDATE public.equipment SET subcategory = 'vacuum_cleaners' WHERE category = 'tools' AND name ILIKE '%odkurzacz%';
UPDATE public.equipment SET subcategory = 'wall_chasers' WHERE category = 'tools' AND name ILIKE '%bruzdownica%';
