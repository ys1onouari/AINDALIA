-- =====================================
-- 1. Tables
-- =====================================

CREATE TABLE categories (
  id        BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name      JSONB NOT NULL DEFAULT '{"fr":""}',
  icon_svg  TEXT DEFAULT '',
  sort_order INT DEFAULT 0
);

CREATE TABLE menu_items (
  id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name        JSONB NOT NULL DEFAULT '{"fr":""}',
  category_id BIGINT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  price       NUMERIC(6,1) NOT NULL,
  description JSONB DEFAULT '{"fr":""}',
  tags        TEXT[] DEFAULT '{}',
  available   BOOLEAN DEFAULT TRUE,
  popular     BOOLEAN DEFAULT FALSE,
  image_url   TEXT DEFAULT ''
);

CREATE INDEX idx_menu_items_category_id ON menu_items(category_id);

CREATE TABLE settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);

-- =====================================
-- 2. Storage bucket
-- =====================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('dish-images', 'dish-images', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Allow public read
CREATE POLICY "Public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'dish-images');

-- Allow authenticated users to upload
CREATE POLICY "Auth upload"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'dish-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Auth delete"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'dish-images' AND auth.role() = 'authenticated');

-- =====================================
-- 3. Row Level Security
-- =====================================

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings   ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "Public read" ON categories FOR SELECT USING (TRUE);
CREATE POLICY "Public read" ON menu_items  FOR SELECT USING (TRUE);
CREATE POLICY "Public read" ON settings   FOR SELECT USING (TRUE);

-- Admin write (authenticated)
CREATE POLICY "Auth insert" ON categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON categories
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON categories
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert" ON menu_items
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON menu_items
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON menu_items
  FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Auth insert" ON settings
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Auth update" ON settings
  FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Auth delete" ON settings
  FOR DELETE USING (auth.role() = 'authenticated');

-- =====================================
-- 4. Seed data
-- =====================================

INSERT INTO categories (name, icon_svg, sort_order) VALUES
  ('{"fr":"Entrées","en":"Starters","es":"Entrantes","ar":"مقبلات"}',         '<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>', 1),
  ('{"fr":"Salades","en":"Salads","es":"Ensaladas","ar":"سلطات"}',           '<svg viewBox="0 0 24 24"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M8 12h8"/><path d="M12 8v8"/></svg>', 2),
  ('{"fr":"Plats Principaux","en":"Main Courses","es":"Platos Principales","ar":"الأطباق الرئيسية"}', '<svg viewBox="0 0 24 24"><path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7"/><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2"/><line x1="12" y1="5" x2="12" y2="19"/></svg>', 3),
  ('{"fr":"Fruits de Mer","en":"Seafood","es":"Mariscos","ar":"المأكولات البحرية"}',     '<svg viewBox="0 0 24 24"><path d="M2 16s3-7 10-7 10 7 10 7"/><circle cx="12" cy="9" r="3"/><path d="M12 12v10"/><path d="M8 22h8"/></svg>', 4),
  ('{"fr":"Grillades","en":"Grilled Dishes","es":"Parrilladas","ar":"مشاوي"}','<svg viewBox="0 0 24 24"><path d="M12 2v4"/><path d="M8 6h8"/><path d="M6 10c0-3 2.7-5 6-5s6 2 6 5"/><path d="M7 22l2-6h6l2 6"/><path d="M12 16v6"/><path d="M10 10v2"/><path d="M14 10v2"/></svg>', 5),
  ('{"fr":"Desserts","en":"Desserts","es":"Postres","ar":"حلويات"}',          '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 0-10 10h20A10 10 0 0 0 12 2z"/><path d="M5 14c2 4 5 6 7 6s5-2 7-6"/><path d="M8 9h8"/></svg>', 6),
  ('{"fr":"Boissons","en":"Drinks","es":"Bebidas","ar":"مشروبات"}',            '<svg viewBox="0 0 24 24"><path d="M18 8h2a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-1.5"/><path d="M6 2L4 18c0 2.2 1.8 4 4 4h8c2.2 0 4-1.8 4-4L18 2"/><path d="M12 22v-8"/><path d="M8 10h8"/></svg>', 7);

INSERT INTO menu_items (name, category_id, price, description, available, popular) VALUES
  ('{"fr":"Tartare de Thon","en":"Tuna Tartare","es":"Tartar de Atún"}',                    1, 18, '{"fr":"Thon frais à l'avocat, sauce yuzu et sésame torréfié.","en":"Fresh tuna with avocado, yuzu sauce and toasted sesame.","es":"Atún fresco con aguacate, salsa yuzu y sésamo tostado."}',                                                    TRUE,  TRUE),
  ('{"fr":"Foie Gras Maison","en":"Homemade Foie Gras","es":"Foie Gras Casero"}',           1, 24, '{"fr":"Foie gras de canard mi-cuit, chutney de figues et brioche toastée.","en":"Half-cooked duck foie gras, fig chutney and toasted brioche.","es":"Foie gras de pato semicocido, chutney de higos y brioche tostada."}',                                       TRUE,  FALSE),
  ('{"fr":"Velouté de Homard","en":"Lobster Velouté","es":"Velouté de Langosta"}',          1, 19, '{"fr":"Crème de homard au cognac, quenelle de mascarpone et ciboulette.","en":"Lobster cream with cognac, mascarpone quenelle and chives.","es":"Crema de langosta al coñac, quenelle de mascarpone y cebollino."}',                                            TRUE,  FALSE),
  ('{"fr":"Saint-Jacques Poêlées","en":"Seared Scallops","es":"Vieiras Salteadas"}',        1, 22, '{"fr":"Noix de Saint-Jacques, purée de chou-fleur et huile de truffe blanche.","en":"Scallops, cauliflower purée and white truffle oil.","es":"Vieiras, puré de coliflor y aceite de trufa blanca."}',                                                     TRUE,  TRUE),
  ('{"fr":"Salade Burrata","en":"Burrata Salad","es":"Ensalada de Burrata"}',               2, 16, '{"fr":"Burrata crémeuse, tomates heritage, basilic et huile d'olive extra-vierge.","en":"Creamy burrata, heritage tomatoes, basil and extra-virgin olive oil.","es":"Burrata cremosa, tomates heritage, albahaca y aceite de oliva virgen extra."}',                                    TRUE,  FALSE),
  ('{"fr":"César Royal","en":"Royal Caesar","es":"César Real"}',                            2, 17, '{"fr":"Romaine croquante, parmesan affiné, anchois et croûtons dorés.","en":"Crisp romaine, aged parmesan, anchovies and golden croutons.","es":"Lechuga romana crujiente, parmesano curado, anchoas y picatostes dorados."}',                                              TRUE,  TRUE),
  ('{"fr":"Salade Niçoise Gastronomique","en":"Gourmet Niçoise Salad","es":"Ensalada Nizarda Gastronómica"}', 2, 19, '{"fr":"Thon mi-cuit, œuf mollet, olives taggiasche et vinaigrette aux herbes.","en":"Seared tuna, soft-boiled egg, taggiasche olives and herb vinaigrette.","es":"Atún medio cocido, huevo pasado por agua, aceitunas taggiasche y vinagreta de hierbas."}', TRUE,  FALSE),
  ('{"fr":"Wagyu Beef Steak","en":"Wagyu Beef Steak","es":"Steak de Wagyu"}',              3, 49, '{"fr":"Wagyu japonais grillé à la perfection, sauce truffe noire, légumes de saison.","en":"Japanese Wagyu grilled to perfection, black truffle sauce, seasonal vegetables.","es":"Wagyu japonés a la parrilla a la perfección, salsa de trufa negra, verduras de temporada."}',                                TRUE,  TRUE),
  ('{"fr":"Agneau Rôti aux Herbes","en":"Herb-Roasted Lamb","es":"Cordero Asado con Hierbas"}', 3, 38, '{"fr":"Carré d'agneau en croûte de pistache, jus de viande réduit au thym.","en":"Rack of lamb in pistachio crust, thyme-reduced meat juice.","es":"Cordero en costra de pistacho, jugo de carne reducido con tomillo."}',                                                                         TRUE,  FALSE),
  ('{"fr":"Canard à l'Orange Moderne","en":"Modern Duck à l'Orange","es":"Pato a la Naranja Moderno"}', 3, 36, '{"fr":"Magret de canard confit, émulsion à l'orange sanguine, patate douce rôtie.","en":"Confit duck breast, blood orange emulsion, roasted sweet potato.","es":"Magret de pato confitado, emulsión de naranja sanguina, boniato asado."}',                                                                   TRUE,  FALSE),
  ('{"fr":"Filet de Bœuf Wellington","en":"Beef Wellington","es":"Solomillo Wellington"}',   3, 54, '{"fr":"Filet de bœuf enrobé de duxelles aux champignons, feuilletage doré.","en":"Beef fillet wrapped in mushroom duxelles, golden puff pastry.","es":"Solomillo de ternera envuelto en duxelles de champiñones, hojaldre dorado."}',                                        TRUE,  TRUE),
  ('{"fr":"Homard Breton","en":"Breton Lobster","es":"Langosta Bretona"}',                  4, 72, '{"fr":"Demi-homard breton grillé au beurre à la fleur de sel, mayonnaise citronnée.","en":"Half Breton lobster grilled with fleur de sel butter, lemon mayonnaise.","es":"Media langosta bretona a la parrilla con mantequilla de flor de sal, mayonesa de limón."},', TRUE,  TRUE),
  ('{"fr":"Sole Meunière","en":"Sole Meunière","es":"Lenguado a la Meunière"}',             4, 42, '{"fr":"Sole entière sautée au beurre noisette, câpres et citron confit.","en":"Whole sole sautéed in brown butter, capers and confit lemon.","es":"Lenguado entero salteado con mantequilla avellana, alcaparras y limón confitado."}',                                             TRUE,  FALSE),
  ('{"fr":"Crevettes Royales Flambées","en":"Flambéed Royal Prawns","es":"Gambas Reales Flambeadas"}', 4, 35, '{"fr":"Grosses crevettes flambées au pastis, ail et persillade provençale.","en":"Large prawns flambéed with pastis, garlic and Provençal persillade.","es":"Gambas grandes flambeadas con pastis, ajo y persillada provenzal."}',                                  TRUE,  FALSE),
  ('{"fr":"Plateau de Fruits de Mer","en":"Seafood Platter","es":"Bandeja de Mariscos"}',   4, 95, '{"fr":"Sélection du marché : huîtres, langoustines, crevettes, palourdes.","en":"Market selection: oysters, langoustines, prawns, clams.","es":"Selección del mercado: ostras, langostinos, gambas, almejas."}',                                          FALSE, FALSE),
  ('{"fr":"Entrecôte Maturée 45j","en":"45-Day Aged Ribeye","es":"Entrecot Madurado 45d"}', 5, 46, '{"fr":"Entrecôte maturée 45 jours, sauce béarnaise, frites maison et salade.","en":"45-day aged ribeye, béarnaise sauce, homemade fries and salad.","es":"Entrecot madurado 45 días, salsa bearnesa, patatas fritas caseras y ensalada."}',                                      TRUE,  TRUE),
  ('{"fr":"Côtelettes d'Agneau","en":"Lamb Chops","es":"Chuletas de Cordero"}',             5, 44, '{"fr":"Double côtelette d'agneau marinée au romarin, légumes grillés.","en":"Double lamb chop marinated in rosemary, grilled vegetables.","es":"Chuleta doble de cordero marinada en romero, verduras a la parrilla."}',                                                                             TRUE,  FALSE),
  ('{"fr":"Mixed Grill DAHAB COFFEE","en":"Mixed Grill DAHAB COFFEE","es":"Mixed Grill DAHAB COFFEE"}', 5, 58, '{"fr":"Sélection de viandes grillées : bœuf, agneau, poulet, merguez maison.","en":"Selection of grilled meats: beef, lamb, chicken, homemade merguez.","es":"Selección de carnes a la parrilla: ternera, cordero, pollo, merguez casero."}',                                     TRUE,  TRUE),
  ('{"fr":"Fondant au Chocolat","en":"Chocolate Fondant","es":"Fondant de Chocolate"}',     6, 12, '{"fr":"Coulant au chocolat Valrhona 70%, glace vanille bourbon et caramel beurre salé.","en":"Valrhona 70% chocolate lava cake, bourbon vanilla ice cream and salted butter caramel.","es":"Coulant de chocolate Valrhona 70%, helado de vainilla bourbon y caramelo de mantequilla salada."}',                              TRUE,  TRUE),
  ('{"fr":"Crème Brûlée à la Rose","en":"Rose Crème Brûlée","es":"Crema Brûlée de Rosa"}',  6, 11, '{"fr":"Crème brûlée infusée à l'eau de rose, sucre caramélisé à la torche.","en":"Rose water-infused crème brûlée, torch-caramelized sugar.","es":"Crema brûlée infusionada con agua de rosas, azúcar caramelizado al soplete."}',                                        TRUE,  FALSE),
  ('{"fr":"Mille-Feuille Revisité","en":"Revisited Mille-Feuille","es":"Mille-Feuille Revisado"}', 6, 14, '{"fr":"Feuilletage croustillant, crème diplomate à la vanille de Madagascar.","en":"Crisp puff pastry, Madagascar vanilla diplomat cream.","es":"Hojaldre crujiente, crema diplomática de vainilla de Madagascar."}',                                                   TRUE,  FALSE),
  ('{"fr":"Sorbets Maison","en":"Homemade Sorbets","es":"Sorbetes Caseros"}',               6,  9, '{"fr":"Trilogie de sorbets faits maison : mangue, framboise, passion.","en":"Trilogy of homemade sorbets: mango, raspberry, passion fruit.","es":"Trilogía de sorbetes caseros: mango, frambuesa, maracuyá."}',                                              TRUE,  FALSE),
  ('{"fr":"Jus de Fruits Pressés","en":"Fresh Juices","es":"Zumos de Fruta Exprimidos"}',    7,  7, '{"fr":"Orange, citron ou grenadine — pressés à la commande.","en":"Orange, lemon or pomegranate — freshly squeezed to order.","es":"Naranja, limón o granada — exprimidos al momento."}',                                                                                       TRUE,  FALSE),
  ('{"fr":"Eau Minérale Premium","en":"Premium Mineral Water","es":"Agua Mineral Premium"}', 7,  5, '{"fr":"Eau plate ou pétillante, Evian ou San Pellegrino.","en":"Still or sparkling, Evian or San Pellegrino.","es":"Agua sin gas o con gas, Evian o San Pellegrino."}',                                                                                         TRUE,  FALSE),
  ('{"fr":"Cocktail Sans Alcool","en":"Non-Alcoholic Cocktail","es":"Cóctel Sin Alcohol"}',  7, 10, '{"fr":"Création du bartender : mocktail fruité aux herbes fraîches du jardin.","en":"Bartender's creation: fruity mocktail with fresh garden herbs.","es":"Creación del bartender: mocktail afrutado con hierbas frescas del jardín."}',                                     TRUE,  TRUE),
  ('{"fr":"Thé à la Menthe Royale","en":"Royal Mint Tea","es":"Té a la Menta Real"}',       7,  6, '{"fr":"Thé vert infusé à la menthe fraîche, servi dans notre théière en argent.","en":"Green tea infused with fresh mint, served in our silver teapot.","es":"Té verde infusionado con menta fresca, servido en nuestra tetera de plata."}',                                    TRUE,  FALSE);

INSERT INTO settings (key, value) VALUES
   ('restaurant_name',     '{"fr":"RESTAURANT DAHAB COFFEE","en":"RESTAURANT DAHAB COFFEE","es":"RESTAURANT DAHAB COFFEE"}'),
  ('restaurant_subtitle', '{"fr":"Restaurant Gastronomique","en":"Fine Dining Restaurant","es":"Restaurante Gastronómico"}'),
  ('address',             'Av. Mohammed VI, Marrakech 40000, Maroc'),
  ('hours',               'Lun–Dim 19h–00h<br/>Bar & Lounge 18h–02h'),
  ('phone',               '+212 524 43 21 00'),
  ('phone_raw',           '+212524432100'),
  ('email',               'contact@dahabcoffee.ma'),
  ('instagram',           '@dahabcoffee.marrakech'),
   ('wa_number',           '212661234567'),
   ('show_dish_images',    'true'),
   ('ordering_enabled',    'true');

-- Ajouter la clé "ar" aux JSONB pour les nouvelles installations
UPDATE categories SET name = name || '{"ar":""}' WHERE NOT (name ? 'ar');
UPDATE menu_items SET name = name || '{"ar":""}' WHERE NOT (name ? 'ar');
UPDATE menu_items SET description = description || '{"ar":""}' WHERE NOT (description ? 'ar');
UPDATE settings SET value = value || '{"ar":""}' WHERE key IN ('restaurant_name', 'restaurant_subtitle') AND NOT (value ? 'ar');

