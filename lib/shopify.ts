const STOREFRONT_API_ENDPOINT = `https://${process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN}/api/2024-07/graphql.json`;
const STOREFRONT_API_KEY = process.env.SHOPIFY_STOREFRONT_API_KEY;

export type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;
  description: string;
  priceRange: {
    minVariantPrice: { amount: string; currencyCode: string };
  };
  images: Array<{
    src: string;
    altText: string | null;
  }>;
  variants: Array<{
    id: string;
    title: string;
    price: { amount: string; currencyCode: string };
    available: boolean;
  }>;
};

/**
 * Fetch a Shopify product by its GraphQL ID or handle.
 * @param productId — Shopify product ID (gid://shopify/Product/...) or handle
 * @returns ShopifyProduct or null if not found
 */
export async function getShopifyProduct(productId: string): Promise<ShopifyProduct | null> {
  if (!STOREFRONT_API_KEY || !STOREFRONT_API_ENDPOINT) {
    console.warn('Shopify Storefront API not configured');
    return null;
  }

  const query = `
    query GetProduct($id: ID!) {
      product(id: $id) {
        id
        title
        handle
        description
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        images(first: 1) {
          edges {
            node {
              src
              altText
            }
          }
        }
        variants(first: 5) {
          edges {
            node {
              id
              title
              price {
                amount
                currencyCode
              }
              available
            }
          }
        }
      }
    }
  `;

  try {
    const response = await fetch(STOREFRONT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': STOREFRONT_API_KEY,
      },
      body: JSON.stringify({
        query,
        variables: { id: productId },
      }),
    });

    if (!response.ok) {
      console.error(`Shopify API error: ${response.status}`);
      return null;
    }

    const data = await response.json();

    if (data.errors) {
      console.error('Shopify GraphQL errors:', data.errors);
      return null;
    }

    if (!data.data?.product) {
      return null;
    }

    const product = data.data.product;
    return {
      id: product.id,
      title: product.title,
      handle: product.handle,
      description: product.description,
      priceRange: product.priceRange,
      images: product.images.edges.map((edge: any) => ({
        src: edge.node.src,
        altText: edge.node.altText,
      })),
      variants: product.variants.edges.map((edge: any) => ({
        id: edge.node.id,
        title: edge.node.title,
        price: edge.node.price,
        available: edge.node.available,
      })),
    };
  } catch (error) {
    console.error('Failed to fetch Shopify product:', error);
    return null;
  }
}

/**
 * Build a Shopify checkout URL for a product variant.
 * @param variantId — Shopify variant ID (gid://shopify/ProductVariant/...)
 * @param quantity — number of units
 * @returns checkout URL
 */
export function buildShopifyCheckoutUrl(variantId: string, quantity: number = 1): string {
  const storeDomain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
  if (!storeDomain) {
    console.warn('NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN not set');
    return '';
  }

  const params = new URLSearchParams({
    variant: variantId,
    quantity: String(quantity),
  });

  return `https://${storeDomain}/cart/${variantId}:${quantity}`;
}

/**
 * Extract numeric ID from Shopify GraphQL ID.
 * e.g., "gid://shopify/Product/123456789" → "123456789"
 */
export function extractShopifyId(gid: string): string {
  const match = gid.match(/\/(\d+)$/);
  return match ? match[1] : gid;
}
