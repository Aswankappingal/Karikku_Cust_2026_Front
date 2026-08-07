import React, { useEffect } from 'react'
import Navbar from '../../common/Navbar/Navbar'
import './AllProducts.scss'
import { Link } from 'react-router-dom'
import { ImArrowUpRight2 } from "react-icons/im";
import Footer from '../../common/Footer/Footer';
import ScrollToTopOnMount from '../../common/ScrollToTopOnMount';
import { HiPlus } from 'react-icons/hi';
import { PiPlusBold } from 'react-icons/pi';
import Breadcrumb from '../../common/BreadCrumb/BreadCrumb';
import useExclusiveProducts from '../../../store/hook/useExclusive';
import { LinearProgress } from '@mui/material';
import { useCart } from '../../../store/hook/useCart';
import useProducts from '../../../store/hook/useProduct';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const AllProducts = () => {
    const breadcrumbItems = [
        { label: 'Homepage', path: '/' },
        { label: 'Products', path: '/products' }
    ];

    const {
        products,
        filteredProducts,
        loading,

        error,
        availableCategories,
        availableDietTypes,
        priceStats,
        availabilityStats,
        productsWithOffers,
        productsByCategory,
        featuredProducts,
        updateCategories,
        updatePriceRanges,
        updateDietTypes,
        updateAvailability,
        searchProducts,
        resetAllFilters,
        refetch,
        getProductById
    } = useExclusiveProducts({
        autoFetch: true,
    });

    const {
        products: allCatalogProducts,
        loading: allProductsLoading,
    } = useProducts();
    const navigate = useNavigate();

    const { addToCart } = useCart();

    // Function to format variants for display
    const formatVariants = (variants) => {
        if (!variants || !Array.isArray(variants) || variants.length === 0) {
            return null;
        }

        // Extract all variant values from all variant types
        const allValues = variants.flatMap(variant => {
            if (variant.values && Array.isArray(variant.values)) {
                return variant.values;
            }
            return [];
        });

        return allValues.length > 0 ? allValues.join(', ') : null;
    };

    useEffect(() => {
        console.log("🛒 products from Redux:", featuredProducts);
    })

    // Function to get variant names and values separately
    const getVariantInfo = (variants) => {
        if (!variants || !Array.isArray(variants) || variants.length === 0) {
            return null;
        }

        return variants.map(variant => ({
            name: variant.name || '',
            values: variant.values || []
        }));
    };

    // Exclusive products (not merchandise)
    const exclusiveProducts = filteredProducts.filter(product => !product.merchandise);

    // All products except merchandise (to be shown after the banner)
    const regularProducts = allCatalogProducts.filter(product => !product.merchandise);

    // Handle loading state
    if (loading || allProductsLoading) {
        return <div><LinearProgress color="success" /></div>
    }

    // Handle error state
    if (error) {
        return (
            <div className='exclusivewrapper'>
                <Navbar />
                <div className="exclusive-content">
                    <div className="error-container" style={{
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '400px'
                    }}>
                        <p style={{ color: 'red' }}>Error loading products: {error}</p>
                        <button onClick={refetch} style={{
                            marginTop: '10px',
                            padding: '8px 16px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                        }}>
                            Retry
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Filter display products to exclude merchandise
    const displayProducts = filteredProducts.filter(product => !product.merchandise);

    return (
        <div className='exclusivewrapper'>
            <Navbar />
            <ScrollToTopOnMount />

            <div className="exclusive-content">
                <div className="breadcrumb-section">
                    <div className="breadcrumb">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                </div>

                <div className="heading-section">
                    <h3>Pick from our exclusive collection</h3>
                    <div className="choose-section">
                        <p>Choose products ({exclusiveProducts.length} available)</p>
                    </div>
                </div>

                <div className="row three-cards" style={{ rowGap: '30px' }}>
                    {exclusiveProducts.length > 0 ? (
                        exclusiveProducts.map((product, index) => (
                            <ProductCard key={product.id || index} product={product} getVariantInfo={getVariantInfo} formatVariants={formatVariants} />
                        ))
                    ) : (
                        <p>No exclusive products found.</p>
                    )}
                </div>

                <div style={{ height: '80px' }}></div>

               <Link to={'/ExploreProducts'}>
                        <div className="merchanise-banner">
                            <div className="merchanise-banner-sub">
                                <div className="text-section">
                                    <p>Explore our</p>
                                    <h2>Merchandise <br /> Products</h2>
                                    <button className="explore-btn"><ImArrowUpRight2 className='ICons-arrow' /></button>
                                </div>

                                <div className="background-shapes">
                                    <img src="/Images/Yellow-light.svg" alt="Yellow Light" className="light-img" />
                                    <br />
                                    <img src="/Images/Yelllow-line.svg" alt="Yellow Arc" className="dark-img" />
                                    <img src="/Images/child-image.svg" alt="child Arc" className="child-img" />
                                    <img src="/Images/Shirt.svg" alt="Shirt-Arc" className="shirt-img" />
                                    <img src="/Images/Cap.svg" alt="Cap-Arc" className="Cap-img" />
                                    <img src="/Images/White.svg" alt="White-shirt" className="White-shirt-img" />
                                </div>
                            </div>
                        </div>
                    </Link>

                <div style={{ height: '80px' }}></div>

                {regularProducts.length > 0 && (
                    <>
                        <div className="heading-section" style={{ marginTop: '20px' }}>
                            <h3 style={{ fontSize: '2rem', marginBottom: '10px' }}>All Products</h3>
                        </div>

                        <div className="row three-cards" style={{ rowGap: '30px' }}>
                            {regularProducts.map((product, index) => (
                                <ProductCard key={product.id || index} product={product} getVariantInfo={getVariantInfo} formatVariants={formatVariants} />
                            ))}
                        </div>
                    </>
                )}

            </div>

            <Footer />
        </div>
    );
};

// Sub-component for Product Card to avoid duplication
const ProductCard = ({ product, getVariantInfo, formatVariants }) => {
    const variantInfo = getVariantInfo(product.variants);
    const formattedVariants = formatVariants(product.variants);

    return (
        <div className="col-lg-4 col-md-6 col-sm-12 mainrow">
            <Link className='exclu-prod' to={`/product-page/${product.id}`}>
                <div className="product-card">
                    <div className="product-image">
                        <div className="product-card-img-btn">
                            <img
                                src={product.imageUrl || product.primaryImage || (product.variantCombinations && product.variantCombinations.length > 0 ? product.variantCombinations[0].primaryImage : '')
                                    || ''}
                                alt={product.productName || product.name || 'Product'}
                            />

                            <div className="button-main">
                                <div className='btn-main'>
                                    <button
                                        className="add-btn"
                                        title="View Details"
                                    >
                                        <PiPlusBold style={{ margin: "0px" }} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="product-details">
                        <h6>{product.productName || product.name || 'Product Name'}</h6>

                        <div className="availability">
                            {formattedVariants ? (
                                <p>Available in <span className="volume">{formattedVariants}</span></p>
                            ) : product.availability && product.availability !== 'Out of stock' ? (
                                <p>Available - <span className="volume">{product.availability}</span></p>
                            ) : product.size ? (
                                <p>Available in <span className="volume">{product.size}</span></p>
                            ) : (
                                <p className={`availability-status ${product.availability === 'Out of stock' ? 'out-of-stock' : 'in-stock'}`}>
                                    {product.availability || 'Available'}
                                </p>
                            )}
                        </div>

                        {variantInfo && variantInfo.length > 0 && (
                            <div className="variant-details" style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                {variantInfo.map((variant, idx) => (
                                    <div key={idx} className="variant-type">
                                    </div>
                                ))}
                            </div>
                        )}

                        {(product.price || product.sellingPrice || (product.variantCombinations && product.variantCombinations.length > 0)) && (
                            <div className="price-section">
                                {(() => {
                                    const firstVariant = (product.variantCombinations && product.variantCombinations.length > 0) ? product.variantCombinations[0] : null;
                                    let displayPrice = firstVariant ? (firstVariant.sellingPrice || firstVariant.price) : (product.sellingPrice || product.price || 0);
                                    let originalPrice = firstVariant ? (firstVariant.mrp || firstVariant.originalPrice || firstVariant.price) : (product.mrp || product.originalPrice || product.price || displayPrice);

                                    return displayPrice && originalPrice && displayPrice < originalPrice ? (
                                        <div>
                                            <span className="current-price price" style={{ fontWeight: '600', color: '#1c1c1c', fontSize: '1.2rem' }}>₹{displayPrice}</span>
                                            <span className="original-price price" style={{
                                                textDecoration: 'line-through',
                                                marginLeft: '8px',
                                                color: '#888',
                                                fontSize: '0.9rem'
                                            }}>₹{originalPrice}</span>
                                        </div>
                                    ) : (
                                        <span className="price" style={{ fontWeight: '600', color: '#1c1c1c', fontSize: '1.2rem' }}>₹{displayPrice}</span>
                                    );
                                })()}
                            </div>
                        )}
                    </div>
                </div>
            </Link>
        </div>
    );
};

export default AllProducts;