UPDATE waste_locations SET address = 'Jl. ZA Pagar Alam No. 45, Rajabasa, Bandar Lampung' WHERE address LIKE '%Jakarta Selatan%';
UPDATE waste_locations SET address = 'Jl. Teuku Umar No. 22, Kedaton, Bandar Lampung' WHERE address LIKE '%Jakarta Pusat%';
UPDATE waste_locations SET address = 'Jl. Imam Bonjol No. 10, Kemiling, Bandar Lampung' WHERE address LIKE '%Bandung%';

UPDATE products SET umkm_name = 'EcoStore Lampung' WHERE umkm_name = 'EcoStore Bandung';
UPDATE products SET umkm_name = 'Green Living Lampung' WHERE umkm_name = 'Green Living Jakarta';
UPDATE products SET umkm_name = 'Nature Pure Lampung' WHERE umkm_name = 'Nature Pure Yogya';
