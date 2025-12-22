import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function PATCH(request) {
  const bodyText = await request.text();  
  const [id, qtyStr, colorTitle, size] = bodyText.split(',');
  const quantity = parseInt(qtyStr, 10);
//690a71bee90a35fe673a379e,Brown,S,1
  console.log("Incoming bodyText:", bodyText);

  try {
    const product = await prisma.product.findUnique({ where: { id } });

    if (!product)
      return new Response(JSON.stringify({ error: "Product not found" }), { status: 404 });

    const colorList = product.color || [];

    // ✅ Match by color title NOT id
    const colorIndex = colorList.findIndex(
      (c) => c.title.toLowerCase() === colorTitle.toLowerCase()
    );

    if (colorIndex === -1)
      return new Response(JSON.stringify({ error: "Color not found" }), { status: 400 });

    const sizes = colorList[colorIndex].sizes || [];

    const sizeIndex = sizes.findIndex((s) => s.size === size);

    if (sizeIndex === -1)
      return new Response(JSON.stringify({ error: "Size not found" }), { status: 400 });

    // ✅ Restore qty
    sizes[sizeIndex].qty += quantity;

    colorList[colorIndex].sizes = sizes;

    const updated = await prisma.product.update({
      where: { id },
      data: { color: colorList },
    });

    return new Response(JSON.stringify(updated), { status: 200 });

  } catch (error) {
    console.error("PATCH ERROR:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
