const { PrismaClient } = require("@prisma/client");
const { hash } = require("bcryptjs");

const prisma = new PrismaClient();

function daysFromNow(days) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

async function upsertCatalog() {
  const content = await prisma.content.upsert({
    where: { slug: "race-conversion-dossier" },
    update: {
      title: "Race Conversion Dossier",
      excerpt: "A practical study note on turning stable positions into winning races.",
      body: [
        "This seeded material is here to demonstrate the content model.",
        "In production it can be replaced with real lessons, guides, and premium dossiers.",
        "The important part for the MVP is that content access can be sold individually.",
      ].join("\n\n"),
      type: "GUIDE",
      accessTier: "PRO",
      isIndividuallySold: true,
      published: true,
      publishedAt: new Date(),
    },
    create: {
      slug: "race-conversion-dossier",
      title: "Race Conversion Dossier",
      excerpt: "A practical study note on turning stable positions into winning races.",
      body: [
        "This seeded material is here to demonstrate the content model.",
        "In production it can be replaced with real lessons, guides, and premium dossiers.",
        "The important part for the MVP is that content access can be sold individually.",
      ].join("\n\n"),
      type: "GUIDE",
      accessTier: "PRO",
      isIndividuallySold: true,
      published: true,
      publishedAt: new Date(),
    },
  });

  const products = [
    {
      code: "plan-pro-monthly",
      name: "Pro Monthly",
      description: "Recurring subscription for regular analytical work.",
      productType: "SUBSCRIPTION",
      planTier: "PRO",
      prices: [
        {
          type: "RECURRING",
          amount: 2900,
          currency: "RUB",
          billingInterval: "MONTH",
        },
      ],
    },
    {
      code: "plan-premium-monthly",
      name: "Premium Monthly",
      description: "Recurring subscription with wider limits and premium access.",
      productType: "SUBSCRIPTION",
      planTier: "PREMIUM",
      prices: [
        {
          type: "RECURRING",
          amount: 5900,
          currency: "RUB",
          billingInterval: "MONTH",
        },
      ],
    },
    {
      code: "position-pack-10",
      name: "Position Pack 10",
      description: "Ten one-time credits for board-position analysis.",
      productType: "POSITION_PACK",
      analysisCredits: 10,
      prices: [
        {
          type: "ONE_TIME",
          amount: 1900,
          currency: "RUB",
          billingInterval: null,
        },
      ],
    },
    {
      code: "position-pack-50",
      name: "Position Pack 50",
      description: "Fifty one-time credits for heavier practice sessions.",
      productType: "POSITION_PACK",
      analysisCredits: 50,
      prices: [
        {
          type: "ONE_TIME",
          amount: 7900,
          currency: "RUB",
          billingInterval: null,
        },
      ],
    },
    {
      code: "match-analysis-credit",
      name: "Match Analysis Credit",
      description: "One paid credit for compute-heavy match protocol analysis.",
      productType: "MATCH_ANALYSIS",
      analysisCredits: 1,
      prices: [
        {
          type: "ONE_TIME",
          amount: 1490,
          currency: "RUB",
          billingInterval: null,
        },
      ],
    },
    {
      code: "content-race-conversion-dossier",
      name: "Race Conversion Dossier",
      description: "Permanent access to a single premium training material.",
      productType: "CONTENT_ACCESS",
      contentId: content.id,
      prices: [
        {
          type: "ONE_TIME",
          amount: 990,
          currency: "RUB",
          billingInterval: null,
        },
      ],
    },
  ];

  const productMap = {};

  for (const product of products) {
    const upserted = await prisma.billingProduct.upsert({
      where: { code: product.code },
      update: {
        name: product.name,
        description: product.description,
        productType: product.productType,
        planTier: product.planTier ?? null,
        analysisCredits: product.analysisCredits ?? null,
        contentId: product.contentId ?? null,
        isActive: true,
      },
      create: {
        code: product.code,
        name: product.name,
        description: product.description,
        productType: product.productType,
        planTier: product.planTier ?? null,
        analysisCredits: product.analysisCredits ?? null,
        contentId: product.contentId ?? null,
        isActive: true,
      },
    });

    await prisma.billingPrice.deleteMany({
      where: { productId: upserted.id },
    });

    await prisma.billingPrice.createMany({
      data: product.prices.map((price) => ({
        productId: upserted.id,
        type: price.type,
        amount: price.amount,
        currency: price.currency,
        billingInterval: price.billingInterval,
        isActive: true,
      })),
    });

    productMap[product.code] = upserted;
  }

  return { content, productMap };
}

async function cleanDemoUserData(userId) {
  const purchases = await prisma.purchase.findMany({
    where: { userId },
    select: { id: true },
  });

  const purchaseIds = purchases.map((purchase) => purchase.id);

  await prisma.analysisCreditLedger.deleteMany({
    where: { userId },
  });
  await prisma.contentAccessGrant.deleteMany({
    where: { userId },
  });
  await prisma.analysis.deleteMany({
    where: { userId },
  });
  await prisma.uploadedImage.deleteMany({
    where: { userId },
  });

  if (purchaseIds.length > 0) {
    await prisma.purchaseItem.deleteMany({
      where: {
        purchaseId: {
          in: purchaseIds,
        },
      },
    });

    await prisma.purchase.deleteMany({
      where: {
        id: {
          in: purchaseIds,
        },
      },
    });
  }
}

async function createUploadedAnalysis({
  userId,
  originalName,
  mimeType,
  fileSize,
  analysisMode,
  summary,
  recognizedPosition,
  recommendations,
  metrics,
  creditCost,
}) {
  const uploadedImage = await prisma.uploadedImage.create({
    data: {
      userId,
      storageKey: `seed/${userId}/${Date.now()}-${originalName.replace(/[^a-zA-Z0-9._-]/g, "-")}`,
      originalName,
      mimeType,
      fileSize,
      storageUrl: `seed://${originalName}`,
    },
  });

  return prisma.analysis.create({
    data: {
      userId,
      uploadedImageId: uploadedImage.id,
      analysisMode,
      status: "COMPLETED",
      engineProvider: "mock",
      engineVersion: "seed-v1",
      summary,
      creditCost,
      recognizedPosition,
      recommendations,
      metrics,
      rawResponse: {
        summary,
        recognizedPosition,
        recommendations,
        metrics,
      },
      completedAt: new Date(),
    },
  });
}

async function seedDemoUser({ productMap, content }) {
  const passwordHash = await hash("Demo12345!", 12);
  const demoUser = await prisma.user.upsert({
    where: { email: "demo@nardyvision.local" },
    update: {
      name: "Demo Analyst",
      passwordHash,
      role: "USER",
    },
    create: {
      email: "demo@nardyvision.local",
      name: "Demo Analyst",
      passwordHash,
      role: "USER",
    },
  });

  await prisma.subscription.upsert({
    where: { userId: demoUser.id },
    update: {
      planTier: "PRO",
      status: "ACTIVE",
      billingInterval: "MONTH",
      currentPeriodStart: new Date(),
      currentPeriodEnd: daysFromNow(30),
      cancelAtPeriodEnd: false,
    },
    create: {
      userId: demoUser.id,
      planTier: "PRO",
      status: "ACTIVE",
      billingInterval: "MONTH",
      currentPeriodStart: new Date(),
      currentPeriodEnd: daysFromNow(30),
      cancelAtPeriodEnd: false,
    },
  });

  await cleanDemoUserData(demoUser.id);

  const positionAnalysisOne = await createUploadedAnalysis({
    userId: demoUser.id,
    originalName: "opening-board.webp",
    mimeType: "image/webp",
    fileSize: 1200000,
    analysisMode: "POSITION_IMAGE",
    summary:
      "The opening remains stable, but the timing edge depends on keeping outer-board pressure.",
    recognizedPosition: {
      boardState: "Semi-contact race with a flexible outer-board structure",
      currentPlayer: "white",
    },
    recommendations: [
      {
        move: "Keep the prime shape intact",
        explanation:
          "The strongest continuation keeps pressure on the race without breaking structure.",
        priority: "primary",
      },
      {
        move: "Avoid early race commitment",
        explanation:
          "A premature race line gives away timing and reduces the quality of the next roll.",
        priority: "secondary",
      },
    ],
    metrics: {
      equity: 0.34,
      confidence: 0.89,
      bestMoveScore: 0.58,
      riskLevel: "medium",
    },
    creditCost: 1,
  });

  const positionAnalysisTwo = await createUploadedAnalysis({
    userId: demoUser.id,
    originalName: "bearoff-review.png",
    mimeType: "image/png",
    fileSize: 980000,
    analysisMode: "POSITION_IMAGE",
    summary:
      "The bear-off choice is low risk, but there is one cleaner transition into the next roll.",
    recognizedPosition: {
      boardState: "Closed race entering a bear-off transition",
      currentPlayer: "black",
    },
    recommendations: [
      {
        move: "Preserve flexibility for the next two throws",
        explanation:
          "The best line keeps future rolls cleaner and avoids a forced structural concession.",
        priority: "primary",
      },
    ],
    metrics: {
      equity: 0.18,
      confidence: 0.93,
      bestMoveScore: 0.42,
      riskLevel: "low",
    },
    creditCost: 1,
  });

  const matchAnalysis = await createUploadedAnalysis({
    userId: demoUser.id,
    originalName: "training-match.mat",
    mimeType: "application/octet-stream",
    fileSize: 420000,
    analysisMode: "MATCH_PROTOCOL",
    summary:
      "The match report highlights one high-cost error cluster and several review points for deeper study.",
    recognizedPosition: null,
    recommendations: [
      {
        move: "Review the three largest error swings",
        explanation:
          "The match report is most useful when it isolates the positions that changed the result the most.",
        priority: "primary",
      },
      {
        move: "Schedule a deeper run for the sharpest branch",
        explanation:
          "A deeper compute pass makes sense only for the turns that materially changed equity.",
        priority: "secondary",
      },
    ],
    metrics: {
      equity: -0.11,
      confidence: 0.82,
      bestMoveScore: 0.46,
      riskLevel: "high",
    },
    creditCost: 1,
  });

  const positionPackPurchase = await prisma.purchase.create({
    data: {
      userId: demoUser.id,
      status: "PAID",
      currency: "RUB",
      totalAmount: 1900,
      paidAt: daysFromNow(-5),
      items: {
        create: [
          {
            productId: productMap["position-pack-10"].id,
            quantity: 1,
            unitAmount: 1900,
            totalAmount: 1900,
          },
        ],
      },
    },
  });

  const matchPurchase = await prisma.purchase.create({
    data: {
      userId: demoUser.id,
      status: "PAID",
      currency: "RUB",
      totalAmount: 2980,
      paidAt: daysFromNow(-2),
      items: {
        create: [
          {
            productId: productMap["match-analysis-credit"].id,
            quantity: 2,
            unitAmount: 1490,
            totalAmount: 2980,
          },
        ],
      },
    },
  });

  const contentPurchase = await prisma.purchase.create({
    data: {
      userId: demoUser.id,
      status: "PAID",
      currency: "RUB",
      totalAmount: 990,
      paidAt: daysFromNow(-1),
      items: {
        create: [
          {
            productId: productMap["content-race-conversion-dossier"].id,
            quantity: 1,
            unitAmount: 990,
            totalAmount: 990,
          },
        ],
      },
    },
  });

  await prisma.contentAccessGrant.create({
    data: {
      userId: demoUser.id,
      contentId: content.id,
      purchaseId: contentPurchase.id,
    },
  });

  await prisma.analysisCreditLedger.createMany({
    data: [
      {
        userId: demoUser.id,
        purchaseId: positionPackPurchase.id,
        delta: 10,
        reason: "ONE_TIME_PURCHASE",
      },
      {
        userId: demoUser.id,
        analysisId: positionAnalysisOne.id,
        delta: -1,
        reason: "ANALYSIS_CONSUMPTION",
      },
      {
        userId: demoUser.id,
        analysisId: positionAnalysisTwo.id,
        delta: -1,
        reason: "ANALYSIS_CONSUMPTION",
      },
      {
        userId: demoUser.id,
        purchaseId: matchPurchase.id,
        delta: 2,
        reason: "ONE_TIME_PURCHASE",
      },
      {
        userId: demoUser.id,
        analysisId: matchAnalysis.id,
        delta: -1,
        reason: "ANALYSIS_CONSUMPTION",
      },
    ],
  });

  return demoUser;
}

async function seedFreeUser() {
  const passwordHash = await hash("Free12345!", 12);
  const user = await prisma.user.upsert({
    where: { email: "free@nardyvision.local" },
    update: {
      name: "Free Explorer",
      passwordHash,
      role: "USER",
    },
    create: {
      email: "free@nardyvision.local",
      name: "Free Explorer",
      passwordHash,
      role: "USER",
    },
  });

  await prisma.subscription.upsert({
    where: { userId: user.id },
    update: {
      planTier: "FREE",
      status: "ACTIVE",
      billingInterval: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
    create: {
      userId: user.id,
      planTier: "FREE",
      status: "ACTIVE",
      billingInterval: null,
      currentPeriodStart: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
  });
}

async function main() {
  const catalog = await upsertCatalog();
  const demoUser = await seedDemoUser(catalog);
  await seedFreeUser();

  console.log("Seed completed.");
  console.log("Demo user:", demoUser.email, "password: Demo12345!");
  console.log("Free user: free@nardyvision.local password: Free12345!");
}

main()
  .catch((error) => {
    console.error("Seed failed.");
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
