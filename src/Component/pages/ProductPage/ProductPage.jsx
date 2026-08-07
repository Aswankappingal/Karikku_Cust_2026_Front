// src/pages/ProductPage/ProductPage.js
import React, { useEffect, useState, useMemo } from 'react'
import './ProductPage.scss'
import { MdOutlineSettings } from "react-icons/md";
import { FaRegFile } from "react-icons/fa";
import Navbar from '../../common/Navbar/Navbar'
import { IoSettingsOutline } from 'react-icons/io5';
import { GoPlus } from 'react-icons/go';
import Footer from '../../common/Footer/Footer';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useProducts from '../../../store/hook/useProduct';
import { useCart } from '../../../store/hook/useCart';
import ScrollToTopOnMount from '../../common/ScrollToTopOnMount';
import { LinearProgress, CircularProgress } from '@mui/material';
import { toast } from 'react-toastify';
import { FaCheck } from 'react-icons/fa';
import LoginModal from '../../Theme/LoginModal/LoginModal';

const processDataByCategory = {
    'Food & Beverages': {
        title: 'Food & Beverages',
        steps: [
            {
                image: '/Images/Coconut-Tree.svg',
                stepNumber: '01',
                title: 'Handpicked at Peak Freshness',
                description: 'We select only the best tender coconuts, harvested at the perfect age for maximum hydration and taste.'
            },
            {
                image: '/Images/Bottele-aat.svg',
                stepNumber: '02',
                title: 'Hygienic Extraction',
                description: 'Coconut water is extracted in sterile conditions to maintain its natural electrolytes and freshness.'
            },
            {
                image: '/Images/Coconut-black.svg',
                stepNumber: '03',
                title: 'Instant Packaging',
                description: 'Sealed immediately after extraction to lock in the natural goodness and refreshing taste.'
            }
        ]
    },
    'juices': {
        title: 'Juices',
        steps: [
            {
                image: '/Images/Coconut-Tree.svg',
                stepNumber: '01',
                title: 'Premium Coconut Selection',
                description: 'Mature coconuts are carefully selected for their rich meat content and superior quality.'
            },
            {
                image: '/Images/Coconut-dry-photos.svg',
                stepNumber: '02',
                title: 'Precision Drying Process',
                description: 'Coconut meat is finely shredded and dried using controlled temperature to preserve nutrition.'
            },
            {
                image: '/Images/Coconut-bottless.svg',
                stepNumber: '03',
                title: 'Quality Packaging',
                description: 'Sealed in moisture-proof packaging to maintain freshness and extend shelf life.'
            }
        ]
    },
    'oils': {
        title: '100% Pure Coconut Oil',
        steps: [
            {
                image: '/Images/Coconut oils demo.svg',
                stepNumber: '01',
                title: 'Fine & Matured Coconuts',
                description: 'Harvested at the perfect age for best quality..'
            },
            {
                image: '/Images/Coconut-black.svg',
                stepNumber: '02',
                title: 'Premium Quality Copra',
                description: 'Using traditional techniques, we extract the oil gently—preserving its nutrients, aroma, and purity.'
            },
            {
                image: '/Images/Bottles-coconut.svg',
                stepNumber: '03',
                title: 'Hygienically Packed, Naturally Preserved',
                description: 'The oil is carefully filtered and packed in food-grade pouches and bottles—untouched by additives or preservatives'
            }
        ]
    },
    'clothes': {
        title: 'Clothes',
        steps: [
            {
                image: '/Images/Coconut-Tree.svg',
                stepNumber: '01',
                title: 'Quality Fabric Selection',
                description: 'We source premium quality fabrics ensuring comfort, durability, and style for every wear.'
            },
            {
                image: '/Images/Bottele-aat.svg',
                stepNumber: '02',
                title: 'Expert Craftsmanship',
                description: 'Each garment is crafted with precision and attention to detail by skilled artisans.'
            },
            {
                image: '/Images/Coconut-black.svg',
                stepNumber: '03',
                title: 'Quality Check & Packaging',
                description: 'Rigorous quality inspection ensures every piece meets our high standards before reaching you.'
            }
        ]
    },
    'default': {
        title: 'Process',
        steps: [
            {
                image: '/Images/Coconut-Tree.svg',
                stepNumber: '01',
                title: 'Handpicked at Peak Freshness',
                description: 'We select only the best tender coconuts, harvested at the perfect age for maximum hydration and taste.'
            },
            {
                image: '/Images/Bottele-aat.svg',
                stepNumber: '02',
                title: 'Expert Processing',
                description: 'Traditional methods combined with modern hygiene standards ensure premium quality.'
            },
            {
                image: '/Images/Coconut-black.svg',
                stepNumber: '03',
                title: 'Quality Assurance',
                description: 'Every product undergoes rigorous testing to meet our high standards before reaching you.'
            }
        ]
    }
};

const handleProductClick = () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
};

const ProductPage = () => {
    // State to track the selected variant combination by variantId
    const [selectedVariantId, setSelectedVariantId] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [otherCartLoading, setOtherCartLoading] = useState({});
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        filteredProducts,
        loading,
        error
    } = useProducts();

    const {
        addToCart,
        isAddingToCart,
        cartItems,
        isInCart,
        getCartItem,
        removeItem
    } = useCart();

    const product = filteredProducts.find(p => String(p.id) === id);

    // Initialize with first variant combination if product has variants
    useEffect(() => {
        if (product?.hasVariants && product?.variantCombinations?.length > 0 && !selectedVariantId) {
            setSelectedVariantId(product.variantCombinations[0].variantId);
        }
    }, [product, selectedVariantId]);

    // Get the currently selected variant combination
    const selectedVariantCombination = useMemo(() => {
        if (!product?.hasVariants || !product?.variantCombinations?.length) {
            return null;
        }

        if (!selectedVariantId) {
            return product.variantCombinations[0];
        }

        return product.variantCombinations.find(combo =>
            combo.variantId === selectedVariantId
        ) || product.variantCombinations[0];
    }, [product, selectedVariantId]);

    // Get display price based on variant selection
    const displayPrice = useMemo(() => {
        if (product?.hasVariants && selectedVariantCombination) {
            return selectedVariantCombination.sellingPrice || selectedVariantCombination.price || product.sellingPrice || product.price;
        }
        return product?.sellingPrice || product?.price || 0;
    }, [product, selectedVariantCombination]);

    const displayMrp = useMemo(() => {
        if (product?.hasVariants && selectedVariantCombination) {
            return selectedVariantCombination.originalPrice || selectedVariantCombination.mrp || selectedVariantCombination.price || product.originalPrice || product.mrp || product.price || displayPrice;
        }
        return product?.originalPrice || product?.mrp || product?.price || displayPrice;
    }, [product, selectedVariantCombination, displayPrice]);

    // Get display image based on variant selection
    const displayImage = useMemo(() => {
        if (product?.hasVariants && selectedVariantCombination) {
            return selectedVariantCombination.primaryImage || product.primaryImage || product.imageUrl;
        }
        return product?.primaryImage || product?.imageUrl;
    }, [product, selectedVariantCombination]);

    // Get display images based on variant selection
    const displayImages = useMemo(() => {
        if (product?.hasVariants && selectedVariantCombination?.images?.length > 0) {
            return selectedVariantCombination.images;
        }
        return product?.images || [];
    }, [product, selectedVariantCombination]);

    // Get display stock based on variant selection
    const displayStock = useMemo(() => {
        if (product?.hasVariants && selectedVariantCombination) {
            return selectedVariantCombination.quantity || 0;
        }
        return product?.stock || product?.quantity || 0;
    }, [product, selectedVariantCombination]);

    const processData = product?.categoryName
        ? (processDataByCategory[product.categoryName.toLowerCase().replace(/\s+/g, '-')] || processDataByCategory.default)
        : processDataByCategory.default;

    // Check if current variant combination is in cart
    const currentItemInCart = useMemo(() => {
        if (!product) return false;

        if (product.hasVariants && selectedVariantCombination) {
            return isInCart(product.id, selectedVariantCombination);
        }
        return isInCart(product.id);
    }, [product, selectedVariantCombination, isInCart]);

    // Handle variant selection by variantId
    const handleVariantSelect = (variantId) => {
        console.log('Selecting variant:', variantId);
        setSelectedVariantId(variantId);
    };

    const handleAddToCart = async () => {
        if (!product) return;

        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
            setShowLoginModal(true);
            return;
        }

        // Prepare cart data
        let cartData = {
            productId: product.id,
            quantity: quantity
        };

        // For products with variants, include the complete variant combination
        if (product.hasVariants && selectedVariantCombination) {
            cartData.variantCombination = {
                variantId: selectedVariantCombination.variantId,
                name: selectedVariantCombination.name,
                sku: selectedVariantCombination.sku,
                price: selectedVariantCombination.price,
                primaryImage: selectedVariantCombination.primaryImage,
                variants: selectedVariantCombination.variants,
                quantity: selectedVariantCombination.quantity
            };
        }

        console.log('Adding to cart:', cartData);

        const result = await addToCart(
            cartData.productId,
            cartData.quantity,
            cartData.variantCombination,
            selectedVariantCombination ? selectedVariantCombination.sellingPrice : product.sellingPrice
        );

        if (result.success) {
            toast.success('Product added to cart successfully!');
        } else {
            toast.error(`Failed to add to cart: ${result.error}`);
        }
    };

    const handleBuyNow = async () => {
        if (!product) return;

        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
            setShowLoginModal(true);
            return;
        }

        let productDetails = {
            id: product.id,
            name: product.name,
            price: displayPrice,
            imageUrl: displayImage,
            features: product.features,
            offers: product.offers,
            quantity: quantity,
            description: product.description,
            storageInstruction: product.storageInstruction,
            shelfLife: product.shelfLife,
            certification: product.certification,
            images: displayImages,
            gst: product.gst || product.taxPercentage || 0,
            taxPercentage: product.taxPercentage || product.gst || 0,
            originalPrice: product.originalPrice || displayPrice,
            currentPrice: displayPrice
        };

        // Add variant combination data if product has variants
        if (product.hasVariants && selectedVariantCombination) {
            productDetails.variantCombination = {
                variantId: selectedVariantCombination.variantId,
                name: selectedVariantCombination.name,
                sku: selectedVariantCombination.sku,
                price: selectedVariantCombination.price,
                variants: selectedVariantCombination.variants,
                gst: selectedVariantCombination.gst || selectedVariantCombination.taxPercentage || product.gst || product.taxPercentage || 0,
                taxPercentage: selectedVariantCombination.taxPercentage || selectedVariantCombination.gst || product.taxPercentage || product.gst || 0,
                originalPrice: selectedVariantCombination.originalPrice || selectedVariantCombination.price,
                primaryImage: selectedVariantCombination.primaryImage
            };

            // Update main product details with variant-specific values
            productDetails.price = selectedVariantCombination.price;
            productDetails.gst = selectedVariantCombination.gst || selectedVariantCombination.taxPercentage || product.gst || product.taxPercentage || 0;
            productDetails.taxPercentage = selectedVariantCombination.taxPercentage || selectedVariantCombination.gst || product.taxPercentage || product.gst || 0;
            productDetails.originalPrice = selectedVariantCombination.originalPrice || selectedVariantCombination.price;
            productDetails.currentPrice = selectedVariantCombination.price;
            productDetails.imageUrl = selectedVariantCombination.primaryImage || displayImage;
        }

        navigate('/address', {
            state: {
                buyNowProduct: productDetails,
                isBuyNow: true
            }
        });
    };

    const handleOtherProductAddToCart = async (e, otherProduct) => {
        e.preventDefault();
        e.stopPropagation();

        const token = localStorage.getItem('authToken') || localStorage.getItem('token');
        if (!token) {
            setShowLoginModal(true);
            return;
        }

        let variantCombination = null;
        if (otherProduct.hasVariants && otherProduct.variantCombinations && otherProduct.variantCombinations.length > 0) {
            variantCombination = otherProduct.variantCombinations[0];
        }

        const variantId = variantCombination?.variantId || 'default';
        const cartKey = `${otherProduct.id}-${variantId}`;

        try {
            setOtherCartLoading(prev => ({ ...prev, [cartKey]: true }));

            if (isInCart(otherProduct.id, variantCombination)) {
                const result = await removeItem(otherProduct.id, variantCombination);
                if (result.success) {
                    toast.success('Product removed from cart');
                } else {
                    toast.error(`Error: ${result.error}`);
                }
            } else {
                const sellingPrice = variantCombination ? (variantCombination.sellingPrice || variantCombination.price) : (otherProduct.sellingPrice || otherProduct.price);
                const result = await addToCart(otherProduct.id, 1, variantCombination, sellingPrice);
                if (result.success) {
                    toast.success('Product added to cart');
                } else {
                    toast.error(`Error: ${result.error}`);
                }
            }
        } catch (err) {
            console.error('Cart error:', err);
        } finally {
            setOtherCartLoading(prev => {
                const newState = { ...prev };
                delete newState[cartKey];
                return newState;
            });
        }
    };

    if (loading) return <div><LinearProgress color="success" /></div>;
    if (error) return <p>Error loading product.</p>;
    if (!product) return <p>Product not found.</p>;

    return (
        <div className="Product-page-wrapper">
            <Navbar bgColor='#ffff' />
            <ScrollToTopOnMount />

            <div className="container-fluid">
                <div className="product-page-sub row">
                    <div className="col-lg-6 col-md-6 col-sm-12 product-page-card">
                        <img src={displayImage} alt={product.name} />
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-12 product-page-contents">
                        <h2>{product.name}</h2>
                        <p>{product.features}</p>
                        <p id='price'>Selling Price</p>
                        <h3 className="price-range">
                            ₹{displayPrice}
                            {displayMrp > displayPrice && (
                                <span style={{ textDecoration: 'line-through', color: '#888', marginLeft: '12px', fontSize: '0.8em', fontWeight: '400' }}>
                                    ₹{displayMrp}
                                </span>
                            )}
                            <span id='offers'> {product.offers}</span>
                        </h3>

                        {/* Display variant details if selected */}
                        {product.hasVariants && selectedVariantCombination && (
                            <div className="selected-variant-info">
                                <p className="variant-name">{selectedVariantCombination.name}</p>
                                {selectedVariantCombination.sku && (
                                    <p className="variant-sku">SKU: {selectedVariantCombination.sku}</p>
                                )}
                            </div>
                        )}

                        {/* Variant Combinations Selector - NEW APPROACH */}
                        {product.hasVariants && product.variantCombinations && product.variantCombinations.length > 0 && (
                            <div className="variants-selector-container">
                                <div className="variant-group">
                                    <h4 className='packageing-select'>Select Variant</h4>
                                    <div className="packing-selector-container">
                                        <div className="size-options">
                                            {product.variantCombinations.map((combo) => (
                                                <button
                                                    key={combo.variantId}
                                                    className={`size-option ${selectedVariantId === combo.variantId ? 'selected' : ''}`}
                                                    onClick={() => handleVariantSelect(combo.variantId)}
                                                >
                                                    {combo.name}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Stock indicator */}
                        {displayStock > 0 && displayStock <= 10 && (
                            <p className="low-stock-warning">
                                Only {displayStock} items left in stock!
                            </p>
                        )}

                        <div className="Bulk-sections">
                            <div className="bulk-sections-content">
                                <IoSettingsOutline className='icons-bulk' />
                                <span className='contents'>
                                    Bulk orders available for all products, customized to your requirements.
                                </span>
                            </div>

                            <div className="bulk-sections-content">
                                <IoSettingsOutline className='icons-bulk' />
                                <span className='contents'>
                                    Full customer support and all necessary product documents provided for your convenience.
                                </span>
                            </div>
                        </div>

                        <div className='buy-now'>
                            {displayStock > 0 ? (
                                <>
                                    <button
                                        onClick={handleBuyNow}
                                        className='Link'
                                    >
                                        Buy now
                                    </button>
                                    {currentItemInCart ? (
                                        <button
                                            onClick={() => navigate('/cart')}
                                            className='Link'
                                        >
                                            Go to cart
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleAddToCart}
                                            className='Link'
                                            disabled={isAddingToCart}
                                        >
                                            {isAddingToCart ? 'Adding...' : 'Add to cart'}
                                        </button>
                                    )}
                                </>
                            ) : (
                                <div className='out-of-stock'>
                                    Out of Stock
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="text-only-product row">
                    <div className="col-lg-6 col-md-12 col-sm-12 col-12 text-sections-whole">
                        <p>{product.description}</p>
                        <h6>Storage Instructions : <span>{product.storageInstruction}</span></h6>
                        <h6>Shelf Life : <span> {product.shelfLife}</span></h6>
                        <h6>Certifications : <span>{product.certification}</span></h6>
                    </div>
                </div>

                <div className="row image-whole-section">
                    {displayImages && displayImages.length > 0 ? (
                        displayImages.map((image, index) => (
                            <div key={index} className="col-lg-6 col-md-6 col-sm-6 col-6">
                                <div className='card-image-section'>
                                    <img
                                        src={image.url || image.publicUrl}
                                        alt={image.originalName || `Product image ${index + 1}`}
                                    />
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="col-12 text-center">
                            <p>No additional images available</p>
                        </div>
                    )}
                </div>

                <div className="contaniner-fluid">
                    <div className="container">
                        <div className="our-process-main-section">
                            <h3 className='process'>Our process</h3>
                            <p className='Virgin'>{processData.title}</p>

                            <div className="row">
                                {processData.steps.map((step, index) => (
                                    <div key={index} className="col-lg-4 col-md-6 col-sm-12">
                                        <div className="cards-n-images-section">
                                            <img src={step.image} alt={step.title} />
                                            <p className='steps-only'>step {step.stepNumber}</p>
                                            <h6 className='Handpicked'>{step.title}</h6>
                                            <p className='para-process'>{step.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <h3 className='Other-pro'>Other products</h3>

                            <div className="row" style={{ rowGap: '50px' }}>
                                {filteredProducts
                                    .filter(p => String(p.id) !== String(id))
                                    .map((otherProduct) => (
                                        <div key={otherProduct.id} className="col-lg-4 col-md-6 col-sm-12">
                                            <div className="other-product-card">
                                                <Link
                                                    to={`/product-page/${otherProduct.id}`}
                                                    onClick={handleProductClick}
                                                >
                                                    <div className="other-product-image">
                                                        <img src={otherProduct.imageUrl} alt={otherProduct.name} />
                                                        <button
                                                            className={`add-to-cart-btn ${(otherProduct.hasVariants ? isInCart(otherProduct.id, otherProduct.variantCombinations?.[0]) : isInCart(otherProduct.id)) ? 'in-cart' : ''}`}
                                                            onClick={(e) => handleOtherProductAddToCart(e, otherProduct)}
                                                            disabled={otherCartLoading[`${otherProduct.id}-${otherProduct.variantCombinations?.[0]?.variantId || 'default'}`]}
                                                        >
                                                            {otherCartLoading[`${otherProduct.id}-${otherProduct.variantCombinations?.[0]?.variantId || 'default'}`] ? (
                                                                <CircularProgress size={16} color="inherit" />
                                                            ) : (otherProduct.hasVariants ? isInCart(otherProduct.id, otherProduct.variantCombinations?.[0]) : isInCart(otherProduct.id)) ? (
                                                                <FaCheck />
                                                            ) : (
                                                                <GoPlus />
                                                            )}
                                                        </button>
                                                    </div>
                                                </Link>
                                                <div className="other-product-details">
                                                    <h5>{otherProduct.name}</h5>
                                                    {otherProduct.features && (
                                                        <p className="other-product-features">{otherProduct.features}</p>
                                                    )}
                                                    <div className="other-product-price-section">
                                                        {(() => {
                                                            const firstVariant = (otherProduct.variantCombinations && otherProduct.variantCombinations.length > 0) ? otherProduct.variantCombinations[0] : null;
                                                            const sellingPrice = firstVariant ? (firstVariant.sellingPrice || firstVariant.price) : (otherProduct.sellingPrice || otherProduct.price || 0);
                                                            const mrp = firstVariant ? (firstVariant.mrp || firstVariant.originalPrice || firstVariant.price) : (otherProduct.mrp || otherProduct.originalPrice || otherProduct.price || sellingPrice);
                                                            const hasDiscount = mrp > sellingPrice;

                                                            return (
                                                                <>
                                                                    <span className="selling-price" style={{ fontWeight: '600', color: '#1c1c1c', fontSize: '1.2rem' }}>₹{sellingPrice}</span>
                                                                    {hasDiscount && (
                                                                        <span className="mrp-price" style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.9rem', marginLeft: '8px', fontWeight: '400' }}>₹{mrp}</span>
                                                                    )}
                                                                </>
                                                            );
                                                        })()}
                                                    </div>
                                                    {otherProduct.offers && (
                                                        <span className="other-product-offer">{otherProduct.offers}</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
            {showLoginModal && (
                <LoginModal
                    onClose={() => setShowLoginModal(false)}
                    onContinue={() => {
                        // After successful login, the modal navigates to '/' or reloads.
                        // Here we just close it and let the user click again or handle it.
                        setShowLoginModal(false);
                    }}
                />
            )}
        </div>
    )
}

export default ProductPage