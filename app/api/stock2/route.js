// app/api/stock2/route.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function PATCH(request) {
  const bodyText = await request.text(); 
  const [id, color, size, qtyStr] = bodyText.split(',');

  const quantity = parseInt(qtyStr, 10);

  try {
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), { status: 404 });
    }

    const colorList = product.color || [];

    // ✅ color.title, not color.color
    const colorIndex = colorList.findIndex(c => c.title.toLowerCase() === color.toLowerCase());
    if (colorIndex === -1) {
      return new Response(JSON.stringify({ error: 'Color not found' }), { status: 400 });
    }

    const sizes = colorList[colorIndex].sizes || [];

    // ✅ match the selected size
    const sizeIndex = sizes.findIndex(s => s.size.toLowerCase() === size.toLowerCase());
    if (sizeIndex === -1) {
      return new Response(JSON.stringify({ error: 'Size not found' }), { status: 400 });
    }

    if (sizes[sizeIndex].qty < quantity) {
      return new Response(JSON.stringify({ error: 'Insufficient stock' }), { status: 400 });
    }

    // ✅ subtract from stock
    sizes[sizeIndex].qty -= quantity;

    // Save back into the color object
    colorList[colorIndex].sizes = sizes;

    const updatedProduct = await prisma.product.update({
      where: { id },
      data: { color: colorList }, // ✅ update whole color field
    });

    return new Response(JSON.stringify(updatedProduct), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
}
