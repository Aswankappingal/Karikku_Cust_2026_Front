// SEO Configuration mapping based on Client's H1, Internal Linking and Image Alt Text Plan

export const SEO_PAGES = {
  HOME: {
    slug: '/',
    h1: 'Tender Coconut Water',
    mainImageAlt: 'Tender coconut water: Karikku bottles with fresh green coconuts'
  },
  PRODUCTS: {
    slug: '/products',
    h1: 'Buy Tender Coconut Water Online',
    mainImageAlt: 'Buy tender coconut water online: Karikku pack range'
  },
  STORE: {
    slug: '/store',
    h1: 'Where to Buy Karikku Coconut Water',
    mainImageAlt: 'Where to buy Karikku coconut water: map of retail partners'
  },
  BLOGS: {
    slug: '/blogs',
    h1: 'Tender Coconut Water Benefits',
    mainImageAlt: 'Tender coconut water benefits: glass of Karikku tender coconut water'
  },
  ABOUT_US: {
    slug: '/about-us',
    h1: 'Karikku Kerala Coconut Water Brand',
    mainImageAlt: 'Karikku Kerala coconut water brand: coconut groves on the Kerala coast'
  },
  CONTACT_US: {
    slug: '/contact-us',
    h1: 'Contact Karikku',
    mainImageAlt: 'Contact Karikku: customer support team'
  },
  PRIVACY_POLICY: {
    slug: '/privacy-policy',
    h1: 'Karikku Privacy Policy',
    mainImageAlt: null
  },
  REFUND_POLICY: {
    slug: '/refund-policy',
    h1: 'Karikku Refund Policy',
    mainImageAlt: null
  },
  SHIPPING_POLICY: {
    slug: '/shipping-policy',
    h1: 'Karikku Shipping Policy',
    mainImageAlt: null
  },
  TERMS_OF_SERVICE: {
    slug: '/terms-of-service',
    h1: 'Karikku Terms of Service',
    mainImageAlt: null
  }
};

export const SEO_PRODUCTS = [
  {
    key: 'tc-300-24',
    slug: 'tender-coconut-water-300ml-pack-of24',
    matchKeywords: ['300ml', '300 ml', 'pack of 24', '24 pack'],
    h1: 'Tender Coconut Water 300ml Pack of 24',
    mainImageAlt: 'Tender coconut water 300ml pack of 24: Karikku bottles',
    isTenderCoconut: true,
    endOfDescLinks: [
      { text: 'tender coconut water 200ml pack of 48', slug: 'tender-coconut-water-200ml-pack-of48' }
    ]
  },
  {
    key: 'tc-200-48',
    slug: 'tender-coconut-water-200ml-pack-of48',
    matchKeywords: ['200ml', '200 ml', 'pack of 48', '48 pack'],
    h1: 'Tender Coconut Water 200ml Pack of 48',
    mainImageAlt: 'Tender coconut water 200ml pack of 48: Karikku bottles',
    isTenderCoconut: true,
    endOfDescLinks: [
      { text: 'tender coconut water 200ml pack of 96', slug: 'tender-coconut-water-200ml-pack-of96' },
      { text: 'tender coconut water 200ml pack of 12', slug: 'tender-coconut-water-200ml-pack-of12' }
    ]
  },
  {
    key: 'tc-200-96',
    slug: 'tender-coconut-water-200ml-pack-of96',
    matchKeywords: ['96 pack', 'pack of 96'],
    h1: 'Tender Coconut Water 200ml Pack of 96',
    mainImageAlt: 'Tender coconut water 200ml pack of 96: Karikku bottles',
    isTenderCoconut: true,
    endOfDescLinks: [
      { text: 'tender coconut water 200ml pack of 48', slug: 'tender-coconut-water-200ml-pack-of48' }
    ],
    wholesaleLink: { text: 'contact karikku', slug: '/contact-us' }
  },
  {
    key: 'tc-200-12',
    slug: 'tender-coconut-water-200ml-pack-of12',
    matchKeywords: ['12 pack', 'pack of 12'],
    h1: 'Tender Coconut Water 200ml Pack of 12',
    mainImageAlt: 'Tender coconut water 200ml pack of 12: Karikku bottles',
    isTenderCoconut: true,
    endOfDescLinks: [
      { text: 'tender coconut water 200ml pack of 48', slug: 'tender-coconut-water-200ml-pack-of48' }
    ]
  },
  {
    key: 'tc-200-multi',
    slug: 'tender-coconut-water-200ml-multipack',
    matchKeywords: ['multipack', '6 + 1', '6+1'],
    h1: 'Tender Coconut Water 200ml Multipack',
    mainImageAlt: 'Tender coconut water 200ml multipack: Karikku bottles',
    isTenderCoconut: true,
    endOfDescLinks: [
      { text: 'tender coconut water 200ml pack of 12', slug: 'tender-coconut-water-200ml-pack-of12' }
    ],
    offerLink: { text: 'karikku refund policy', slug: '/refund-policy' }
  },
  {
    key: 'coconut-milk-400',
    slug: 'coconut-milk-400ml',
    matchKeywords: ['coconut milk', '400ml', '400 ml'],
    h1: 'Coconut Milk 400ml',
    mainImageAlt: 'Coconut milk 400ml: Karikku pack',
    isTenderCoconut: false,
    relatedLinks: [
      { text: 'pure coconut oil 500ml pouch', slug: 'pure-coconut-oil-500ml-pouch' }
    ]
  },
  {
    key: 'oil-1l-pet',
    slug: 'pure-coconut-oil-1-litre-pet-bottle',
    matchKeywords: ['1 litre pet', '1l pet', 'pet bottle'],
    h1: 'Pure Coconut Oil 1 Litre',
    mainImageAlt: 'Pure coconut oil 1 litre: Karikku PET bottle',
    isTenderCoconut: false,
    endOfDescLinks: [
      { text: 'pure coconut oil 1 litre pouch', slug: 'pure-coconut-oil-1-litre-pouch' }
    ]
  },
  {
    key: 'oil-1l-pouch',
    slug: 'pure-coconut-oil-1-litre-pouch',
    matchKeywords: ['1 litre pouch', '1l pouch'],
    h1: 'Pure Coconut Oil 1 Litre Pouch',
    mainImageAlt: 'Pure coconut oil 1 litre pouch: Karikku pouch',
    isTenderCoconut: false,
    endOfDescLinks: [
      { text: 'pure coconut oil 1 litre', slug: 'pure-coconut-oil-1-litre-pet-bottle' }
    ],
    relatedLinks: [
      { text: 'pure coconut oil 500ml pouch', slug: 'pure-coconut-oil-500ml-pouch' }
    ]
  },
  {
    key: 'oil-500-pouch',
    slug: 'pure-coconut-oil-500ml-pouch',
    matchKeywords: ['500ml pouch', '500 ml pouch'],
    h1: 'Pure Coconut Oil 500ml Pouch',
    mainImageAlt: 'Pure coconut oil 500ml pouch: Karikku pouch',
    isTenderCoconut: false,
    endOfDescLinks: [
      { text: 'pure coconut oil 1 litre pouch', slug: 'pure-coconut-oil-1-litre-pouch' },
      { text: 'pure coconut oil 100ml', slug: 'pure-coconut-oil-100ml-pouch' }
    ]
  },
  {
    key: 'oil-100-pouch',
    slug: 'pure-coconut-oil-100ml-pouch',
    matchKeywords: ['100ml', '100 ml'],
    h1: 'Pure Coconut Oil 100ml',
    mainImageAlt: 'Pure coconut oil 100ml: Karikku pouch',
    isTenderCoconut: false,
    endOfDescLinks: [
      { text: 'pure coconut oil 500ml pouch', slug: 'pure-coconut-oil-500ml-pouch' }
    ]
  }
];

// Helper function to resolve product SEO info
export const getProductSeo = (productOrId) => {
  if (!productOrId) return null;
  const str = (typeof productOrId === 'string' ? productOrId : (productOrId.slug || productOrId.id || productOrId.name || productOrId.productName || '')).toLowerCase();
  
  // Exact slug match
  const exact = SEO_PRODUCTS.find(p => p.slug === str);
  if (exact) return exact;

  // Keyword / partial match
  const matched = SEO_PRODUCTS.find(p => 
    p.matchKeywords.some(kw => str.includes(kw.toLowerCase()))
  );
  if (matched) return matched;

  // Default fallback if it's coconut water or oil
  const isOil = str.includes('oil');
  const isWater = str.includes('water') || str.includes('tender') || str.includes('karikku');

  return {
    h1: (typeof productOrId === 'object' && (productOrId.productName || productOrId.name)) || 'Tender Coconut Water',
    mainImageAlt: isOil 
      ? 'Pure coconut oil: Karikku pouch'
      : 'Tender coconut water: Karikku bottles',
    isTenderCoconut: !isOil,
    endOfDescLinks: []
  };
};
