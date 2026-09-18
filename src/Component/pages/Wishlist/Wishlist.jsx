import React, { useEffect, useMemo, useState, useCallback } from 'react'
import './Wishlist.scss'
import Navbar from '../../common/Navbar/Navbar'
import Breadcrumb from '../../common/BreadCrumb/BreadCrumb'
import { GoPlus } from 'react-icons/go'
import { FaHeart, FaCheck } from 'react-icons/fa'
import Footer from '../../common/Footer/Footer'
import useWishlist from '../../../store/hook/useWishlist'
import useProducts from '../../../store/hook/useProduct'
import { useCart } from '../../../store/hook/useCart'
import { CircularProgress, LinearProgress } from '@mui/material'
import axios from 'axios'
import baseUrl from '../../../baseUrl'
import { Link } from 'react-router-dom'
import { BsArrowUpRightCircleFill } from 'react-icons/bs'

const Wishlist = () => {
    const breadcrumbItems = [
        { label: 'Homepage', path: '/' },
        { label: 'Wishlist', path: '/wishlist' }
    ];

    // State for managing loading states
    const [addingToCart, setAddingToCart] = useState({});
    const [removingFromWishlist, setRemovingFromWishlist] = useState({});

    // Get wishlist data
    const {
        items: wishlistItems,
        totalItems,
        loading: wishlistLoading,
        error: wishlistError,
        fetchWishlist,
        isInWishlist,
        removeFromWishlist
    } = useWishlist();

    // Get products data
    const {
        products,
        filteredProducts,
        loading: productsLoading,
        error: productsError,
        refetch: refetchProducts
    } = useProducts();

    useEffect(() => {
        console.log("products data in wishlist", products);

    }, [products])



    // Get cart functionality
    const { addToCart, removeItem, isInCart, getCartItem, isAddingToCart } = useCart();

    // Get auth token from localStorage or your auth context
    const getAuthToken = () => {
        return localStorage.getItem('authToken') || localStorage.getItem('token');
    };

    // Memoize the refetch functions to prevent unnecessary re-renders
    const memoizedFetchWishlist = useCallback(() => {
        if (fetchWishlist) {
            fetchWishlist();
        }
    }, [fetchWishlist]);

    const memoizedRefetchProducts = useCallback(() => {
        if (refetchProducts) {
            refetchProducts();
        }
    }, [refetchProducts]);

    // Fetch data on component mount
    useEffect(() => {
        memoizedFetchWishlist();
    }, []);

    // Fetch products separately to avoid unnecessary refetches
    useEffect(() => {
        if (products.length === 0 && !productsLoading) {
            memoizedRefetchProducts();
        }
    }, [products.length, productsLoading]);

    // Match wishlist items with actual products
    const wishlistProducts = useMemo(() => {
        if (!wishlistItems.length || !products.length) return [];

        return wishlistItems.map(wishlistItem => {
            // Find the corresponding product
            const product = products.find(p => p.id === wishlistItem.productId);

            if (product) {
                return {
                    ...product,
                    wishlistId: wishlistItem.id, // Keep track of wishlist entry ID
                    addedAt: wishlistItem.addedAt // When it was added to wishlist
                };
            }
            return null;
        }).filter(Boolean); // Remove null entries
    }, [wishlistItems, products]);

    // Handle add to cart and remove from wishlist
    const handleAddToCartAndRemoveFromWishlist = async (e, product, variantId = null) => {
        e.preventDefault();
        e.stopPropagation();

        const productId = product.id;
        const cartKey = `${productId}-${variantId || 'default'}`;

        try {
            // Set loading state
            setAddingToCart(prev => ({ ...prev, [cartKey]: true }));

            // Add to cart using Redux action
            const sellingPrice = product.sellingPrice || product.price;
            const cartResult = await addToCart(productId, 1, variantId, sellingPrice);

            if (cartResult.success) {
                console.log('Product added to cart successfully!');

                // Now remove from wishlist
                await handleRemoveFromWishlist(productId, false); // false = don't show separate loading

            } else {
                console.error('Failed to add to cart:', cartResult.error);
                // You might want to show a user-friendly error message here
            }
        } catch (error) {
            console.error('Error adding to cart:', error);
        } finally {
            setAddingToCart(prev => {
                const newState = { ...prev };
                delete newState[cartKey];
                return newState;
            });
        }
    };

    // Handle remove from wishlist only
    const handleRemoveFromWishlist = async (productId, showLoading = true) => {
        const token = getAuthToken();
        if (!token) {
            console.log('Please login to manage wishlist');
            return;
        }

        try {
            if (showLoading) {
                setRemovingFromWishlist(prev => ({ ...prev, [productId]: true }));
            }

            const response = await axios.delete(`${baseUrl}/remove-from-wishlist`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                data: { productId }
            });

            if (response.data.success) {
                // Use the wishlist hook's remove function to update state
                if (removeFromWishlist) {
                    await removeFromWishlist(productId);
                } else {
                    // Fallback: refresh the entire wishlist (but don't refetch products)
                    await fetchWishlist();
                }
                console.log('Product removed from wishlist');
            } else {
                console.error('Failed to remove from wishlist:', response.data.error);
            }
        } catch (error) {
            console.error('Error removing from wishlist:', error);

            // Handle specific error cases
            if (error.response?.status === 401) {
                console.log('Please login to manage wishlist');
            } else if (error.response?.status === 404) {
                console.log('Product not found in wishlist');
                // Item might already be removed, so refresh wishlist
                if (fetchWishlist) {
                    await fetchWishlist();
                }
            } else {
                console.log('Failed to remove from wishlist. Please try again.');
            }
        } finally {
            if (showLoading) {
                setRemovingFromWishlist(prev => {
                    const newState = { ...prev };
                    delete newState[productId];
                    return newState;
                });
            }
        }
    };

    // Get the appropriate icon/content for the add button
    const getAddButtonContent = (productId, variantId = null) => {
        const cartKey = `${productId}-${variantId || 'default'}`;
        const isLoading = addingToCart[cartKey];
        const isProductInCart = isInCart(productId, variantId);

        if (isLoading) {
            return (
                <CircularProgress
                    size={16}
                    thickness={4}
                    sx={{
                        color: '#4CAF50',
                        '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                        }
                    }}
                />
            );
        }

        if (isProductInCart) {
            return <FaCheck className='check-icon' style={{ color: '#4CAF50' }} />;
        }

        return <GoPlus className='add-icon' />;
    };

    // Get heart icon content for wishlist removal
    const getHeartIconContent = (productId) => {
        const isLoading = removingFromWishlist[productId];

        if (isLoading) {
            return (
                <CircularProgress
                    size={16}
                    thickness={4}
                    sx={{
                        color: '#ff6b6b',
                        '& .MuiCircularProgress-circle': {
                            strokeLinecap: 'round',
                        }
                    }}
                />
            );
        }

        return (
            <div className='heart-icon-section'>
                <FaHeart className='heart-icon active' />
            </div>
        );
    };

    // Handle loading states
    if (wishlistLoading || productsLoading) {
        return <div><LinearProgress color="success" /></div>;
    }

    // Handle error states
    if (wishlistError || productsError) {
        return (
            <div className='WishlistMainwrapper'>
                <div className="container-fluid">
                    <Navbar />
                    <div className="breadcrumb">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                    <div className="wishlist">
                        <div className="wishlist-header">
                            <h3>Wish list</h3>
                            <p>Error loading wishlist</p>
                        </div>
                        <div className="error-message">
                            <p>{wishlistError || productsError}</p>
                            <button onClick={() => {
                                if (wishlistError) memoizedFetchWishlist();
                                if (productsError) memoizedRefetchProducts();
                            }}>
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    // Handle empty wishlist
    if (wishlistProducts.length === 0) {
        return (
            <div className='WishlistMainwrapper'>
                <div className="container-fluid">
                    <Navbar />
                    <div className="breadcrumb">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                    <div className="wishlist">
                        <div className="wishlist-header">
                            <h3>Wishlist</h3>
                            <p>Your wishlist is empty</p>
                        </div>
                        <div className="empty-wishlist">
                            {/* <p style={{
                                fontSize: '18px',
                                marginBottom: '20px',
                                color: '#555',
                                marginLeft: '1.8rem'
                            }}>You haven't added any products to your wishlist yet.</p> */}
                            <Link to={'/products'}><button>Continue Shopping

                                {/* <span id='about-us'>about us</span>  */}
                                <BsArrowUpRightCircleFill className='btn-icon' />
                            </button></Link>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className='WishlistMainwrapper'>
            <div className="container-fluid">
                <Navbar />
                <div className="breadcrumb">
                    <Breadcrumb items={breadcrumbItems} />
                </div>
                <div className="wishlist">
                    <div className="wishlist-header">
                        <h3>Wishlist</h3>
                        <p>Choose products ({totalItems} items)</p>
                    </div>
                    <div className="container-fluid">
                        <div className="row" style={{ rowGap: '30px' }}>
                            {wishlistProducts.map((product) => (
                                <div className="col-lg-3 col-md-6 col-sm-6 col-12" key={product.id}>
                                    <div className="products">
                                        <div className="product-card-main">
                                            <Link to={`/product-page/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <div className="product-card">
                                                    <div className="prod-image-section">
                                                        <div
                                                            className="heart-icon-section"
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                handleRemoveFromWishlist(product.id);
                                                            }}
                                                            title="Remove from wishlist"
                                                        >
                                                            {getHeartIconContent(product.id)}
                                                        </div>
                                                        <div className="wishlist-prod-img">
                                                            <img className='images-product'
                                                                src={product.imageUrl || product.imageUrl?.[0] || product.variantCombinations[0]?.primaryImage || "./Images/default-product.png"}
                                                                alt={product.name || "Product"}
                                                            />
                                                        </div>
                                                        <div
                                                            className={`add-icon-wrapper ${isInCart(product.id) ? 'in-cart' : ''}`}
                                                            onClick={(e) => handleAddToCartAndRemoveFromWishlist(e, product)}
                                                            title={isInCart(product.id) ? 'Already in cart' : 'Add to cart and remove from wishlist'}
                                                        >
                                                            {getAddButtonContent(product.id)}
                                                        </div>
                                                    </div>
                                                    <div className="product-details">
                                                        <h3>{product.name}</h3>
                                                        {product?.variantCombinations && product.variantCombinations.length > 0 ? (
                                                            product.variants.map((variant, index) => (
                                                                <div key={index} className="variant-section">
                                                                    <h4 className='Available-wishlist'>
                                                                        <span className='Available-wishlist-span'>
                                                                            Available in
                                                                        </span>
                                                                        <span>
                                                                            {variant.values && variant.values.length > 0
                                                                                ? variant.values.join(', ')
                                                                                : " Not available"}
                                                                        </span>
                                                                    </h4>
                                                                </div>
                                                            ))
                                                        ) : (
                                                            <h4></h4>
                                                        )}
                                                        {(() => {
                                                            const firstVariant = (product.variantCombinations && product.variantCombinations.length > 0) ? product.variantCombinations[0] : null;
                                                            const displayPrice = firstVariant ? (firstVariant.sellingPrice || firstVariant.price) : (product.sellingPrice || product.price || 0);
                                                            const displayMrp = firstVariant ? (firstVariant.mrp || firstVariant.originalPrice || firstVariant.price) : (product.mrp || product.originalPrice || product.price || displayPrice);
                                                            return (
                                                                <p style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                                    <span style={{ fontWeight: '600', color: '#1c1c1c', fontSize: '1.1rem' }}>₹{displayPrice}</span>
                                                                    {displayMrp > displayPrice && (
                                                                        <span style={{ textDecoration: 'line-through', color: '#888', fontSize: '0.9rem' }}>₹{displayMrp}</span>
                                                                    )}
                                                                </p>
                                                            );
                                                        })()}
                                                        {/* {product.originalPrice && product.originalPrice > product.price && (
                                                        <p className="original-price">
                                                            ₹{product.originalPrice}
                                                        </p>
                                                    )} */}
                                                    </div>
                                                </div>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default Wishlist;