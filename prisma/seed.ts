import { FreshnessGrade, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.supplier.deleteMany();

  const produce = await prisma.category.create({
    data: { slug: 'produce', name: 'Fresh produce' },
  });
  const dairy = await prisma.category.create({
    data: { slug: 'dairy', name: 'Dairy and eggs' },
  });
  const pantry = await prisma.category.create({
    data: { slug: 'pantry', name: 'Pantry staples' },
  });

  const nordicFarms = await prisma.supplier.create({
    data: {
      slug: 'nordic-farms',
      name: 'Nordic Farms Cooperative',
      city: 'Hamburg',
      country: 'DE',
      rating: '4.8',
    },
  });
  const alpineDairy = await prisma.supplier.create({
    data: {
      slug: 'alpine-dairy',
      name: 'Alpine Dairy GmbH',
      city: 'Munich',
      country: 'DE',
      rating: '4.7',
    },
  });
  const medPantry = await prisma.supplier.create({
    data: {
      slug: 'med-pantry',
      name: 'Mediterranean Pantry BV',
      city: 'Rotterdam',
      country: 'NL',
      rating: '4.6',
    },
  });

  await prisma.product.createMany({
    data: [
      {
        sku: 'NF-TOM-5KG',
        name: 'Vine tomatoes',
        description:
          'Restaurant crate of bright vine tomatoes for salads and sauces.',
        supplierId: nordicFarms.id,
        categoryId: produce.id,
        priceCents: 1890,
        stockQuantity: 240,
        freshnessGrade: FreshnessGrade.FRESH,
        tags: ['tomato', 'salad', 'vegetable', 'local'],
        allergens: [],
        deliveryRegions: ['DE-HH', 'DE-BE', 'DE-NI'],
      },
      {
        sku: 'NF-BASIL-20',
        name: 'Fresh basil bunches',
        description: 'Aromatic basil packed for same-day kitchen use.',
        supplierId: nordicFarms.id,
        categoryId: produce.id,
        priceCents: 1290,
        stockQuantity: 80,
        freshnessGrade: FreshnessGrade.FRESH,
        tags: ['herbs', 'basil', 'italian', 'fresh'],
        allergens: [],
        deliveryRegions: ['DE-HH', 'DE-NI'],
      },
      {
        sku: 'AD-YOG-GREEK-10',
        name: 'Greek style yogurt',
        description: 'Ten kilogram kitchen tub with high protein content.',
        supplierId: alpineDairy.id,
        categoryId: dairy.id,
        priceCents: 3250,
        stockQuantity: 55,
        freshnessGrade: FreshnessGrade.CHILLED,
        tags: ['yogurt', 'breakfast', 'protein', 'bulk'],
        allergens: ['milk'],
        deliveryRegions: ['DE-BY', 'DE-BW', 'AT-9'],
      },
      {
        sku: 'AD-EGG-FR-180',
        name: 'Free range eggs',
        description:
          'Tray pack of 180 free range eggs for bakery and brunch menus.',
        supplierId: alpineDairy.id,
        categoryId: dairy.id,
        priceCents: 4490,
        stockQuantity: 32,
        freshnessGrade: FreshnessGrade.CHILLED,
        tags: ['eggs', 'bakery', 'brunch'],
        allergens: ['egg'],
        deliveryRegions: ['DE-BY', 'DE-BW'],
      },
      {
        sku: 'MP-OLIVE-EVOO-5',
        name: 'Extra virgin olive oil',
        description:
          'Five liter tin of cold pressed olive oil for dressings and finishing.',
        supplierId: medPantry.id,
        categoryId: pantry.id,
        priceCents: 5790,
        stockQuantity: 120,
        freshnessGrade: FreshnessGrade.AMBIENT,
        tags: ['olive-oil', 'pantry', 'mediterranean'],
        allergens: [],
        deliveryRegions: ['NL-ZH', 'DE-NW', 'BE-VAN'],
      },
      {
        sku: 'MP-PASTA-PENNE-12',
        name: 'Bronze cut penne',
        description: 'Twelve kilogram case of bronze cut durum wheat pasta.',
        supplierId: medPantry.id,
        categoryId: pantry.id,
        priceCents: 3890,
        stockQuantity: 0,
        freshnessGrade: FreshnessGrade.AMBIENT,
        tags: ['pasta', 'italian', 'durum', 'bulk'],
        allergens: ['gluten'],
        deliveryRegions: ['NL-ZH', 'DE-NW', 'BE-VAN'],
      },
    ],
  });
}

main()
  .catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
