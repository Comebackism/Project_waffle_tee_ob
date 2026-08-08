const db = require('./config/db');

async function alterProduct() {
  try {
    await db.query(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "Picture" TEXT;`);
    await db.query(`ALTER TABLE "Product" ADD COLUMN IF NOT EXISTS "category" VARCHAR(50) DEFAULT 'วัตถุดิบหลัก';`);
    await db.query(`ALTER TABLE "Stock" ADD COLUMN IF NOT EXISTS "Picture" TEXT;`);
    
    // Seed default pictures for existing products if null
    const initialPictures = {
      'P01': { picture: 'https://placehold.co/300x200?text=Flour', category: 'วัตถุดิบหลัก' },
      'P02': { picture: 'https://placehold.co/300x200?text=Eggs', category: 'วัตถุดิบหลัก' },
      'P03': { picture: 'https://placehold.co/300x200?text=Choco', category: 'ท็อปปิ้ง' },
      'P04': { picture: 'https://placehold.co/300x200?text=Almond', category: 'ท็อปปิ้ง' },
      'P05': { picture: 'https://placehold.co/300x200?text=Raisin', category: 'ท็อปปิ้ง' },
      'P06': { picture: 'https://placehold.co/300x200?text=Box', category: 'บรรจุภัณฑ์' },
      'P07': { picture: 'https://placehold.co/300x200?text=Paper', category: 'บรรจุภัณฑ์' }
    };

    for (const [pid, data] of Object.entries(initialPictures)) {
      await db.query(
        `UPDATE "Product" 
         SET "Picture" = COALESCE("Picture", $1), 
             "category" = COALESCE("category", $2) 
         WHERE "ProductID" = $3`,
        [data.picture, data.category, pid]
      );
    }

    console.log('Product table altered and pictures populated successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

alterProduct();
