import React, { useState, useEffect, useCallback, useMemo } from 'react'
import './ExploreProducts.scss'
import Navbar from '../../common/Navbar/Navbar'
import ProductSidebar from '../../Theme/ProductSidebar/Productsidebar'
import { VscSettings } from 'react-icons/vsc'
import Footer from '../../common/Footer/Footer'
import ProductSidebarMobile from '../../Theme/ProductSidebarMobile/ProductSidebarMobile'
import { GoPlus } from "react-icons/go";
import { Link, useNavigate } from 'react-router-dom'
import Breadcrumb from '../../common/BreadCrumb/BreadCrumb'
import useProducts from '../../../store/hook/useProduct'
import { useCart } from '../../../store/hook/useCart'
import { FaHeart, FaRegHeart } from 'react-icons/fa6'
import { CircularProgress, LinearProgress } from '@mui/material'
import { FaCheck } from 'react-icons/fa'
import axios from 'axios'
import baseUrl from '../../../baseUrl'
import ScrollToTopOnMount from '../../common/ScrollToTopOnMount'
import { BsArrowUpRightCircleFill } from 'react-icons/bs'

const ExploreProducts = () => {
    const breadcrumbItems = [
        { label: 'Homepage', path: '/' },
        { label: 'Products', path: '/ExploreProducts' }
    ];

    const navigate = useNavigate();

    const [sideBarIsOpen, setSidebarIsOpen] = useState(true);
    const [mobileSideBarIsOpen, setMobileSideBarIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    // Separate cart loading state to prevent conflicts with useCart hook
    const [localCartLoading, setLocalCartLoading] = useState({});

    // Wishlist states
    const [wishlistItems, setWishlistItems] = useState(new Set());
    const [addingToWishlist, setAddingToWishlist] = useState({});

    const [currentFilters, setCurrentFilters] = useState({
        categories: [],
        price: [],
        colors: []
    });

    // Use the custom products hook
    const {
        filteredProducts,
        loading,
        error,
        updateSortBy,
        filters,
        refetch
    } = useProducts();

    const { addToCart, removeItem, isInCart, getCartItem } = useCart();

    // Memoize auth token getter to prevent unnecessary re-renders
    const getAuthToken = useCallback(() => {
        return localStorage.getItem('authToken') || localStorage.getItem('token');
    }, []);

    // Memoize wishlist fetch function
    const fetchUserWishlist = useCallback(async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                console.log('No auth token found');
                return;
            }

            const response = await axios.get(`${baseUrl}/get-wishlist`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success && response.data.wishlist) {
                const wishlistProductIds = response.data.wishlist.map(item => item.productId);
                setWishlistItems(new Set(wishlistProductIds));
            }
        } catch (error) {
            console.error('Error fetching wishlist:', error);
        }
    }, [getAuthToken]);

    // Fetch user's wishlist on component mount only
    useEffect(() => {
        fetchUserWishlist();
    }, []);

    // Handle wishlist toggle with optimized loading states
    const handleWishlistToggle = useCallback(async (e, productId) => {
        e.preventDefault();
        e.stopPropagation();

        const token = getAuthToken();
        if (!token) {
            console.log('Please login to add items to wishlist');
            navigate('/login-modal');
            return;
        }

        const isInWishlist = wishlistItems.has(productId);

        try {
            setAddingToWishlist(prev => ({ ...prev, [productId]: true }));

            let response;

            if (isInWishlist) {
                response = await axios.delete(`${baseUrl}/remove-from-wishlist`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    data: { productId }
                });
            } else {
                response = await axios.post(`${baseUrl}/add-to-wishlist`,
                    { productId },
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'application/json'
                        }
                    }
                );
            }

            if (response.data.success) {
                setWishlistItems(prev => {
                    const newSet = new Set(prev);
                    if (isInWishlist) {
                        newSet.delete(productId);
                    } else {
                        newSet.add(productId);
                    }
                    return newSet;
                });

                console.log(isInWishlist ? 'Product removed from wishlist' : 'Product added to wishlist');
            } else {
                console.error('Wishlist operation failed:', response.data.error);
            }
        } catch (error) {
            console.error('Error toggling wishlist:', error);

            if (error.response?.status === 409) {
                setWishlistItems(prev => new Set([...prev, productId]));
            }
        } finally {
            setAddingToWishlist(prev => {
                const newState = { ...prev };
                delete newState[productId];
                return newState;
            });
        }
    }, [wishlistItems, getAuthToken]);

    // Get wishlist icon based on state
    const getWishlistIcon = useCallback((productId) => {
        const isInWishlist = wishlistItems.has(productId);
        const isLoading = addingToWishlist[productId];

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
            <div className="wishlist-icon-container">
                {isInWishlist ?
                    <FaHeart className='heart-icon filled' /> :
                    <FaRegHeart className='heart-icon unfilled' />
                }
            </div>
        );
    }, [wishlistItems, addingToWishlist]);

    // Optimized cart handling to prevent refetch issues
    const handleAddToCart = useCallback((e, product) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(`/Product-page/${product.id}`);
    }, [navigate]);

    // Get the appropriate icon/content for the add button
    const getAddButtonContent = useCallback((product) => {
        const firstVariant = product.variantCombinations?.[0];
        const variantId = firstVariant?.variantId || null;
        const cartKey = `${product.id}-${variantId || 'default'}`;
        
        const isLoading = localCartLoading[cartKey]; // Use local loading state
        const isProductInCart = isInCart(product.id, firstVariant);

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
    }, [localCartLoading, isInCart]);

    // Fallback products data
    const fallbackProducts = useMemo(() => [
        {
            id: 1,
            name: "Karikku Pure Coconut Oil - Pet Bottle",
            image: "./Images/Tshirt.png",
            availability: "Available in 1L",
            volumes: ["1L"],
            price: "₹89",
            categoryName: "Food",
            variantCombinations: [{ color: "Clear" }],
            sellingPrice: 89
        },
        // ... other fallback products
    ], []);

    // Memoize product transformation to prevent unnecessary recalculations
    const transformProduct = useCallback((apiProduct) => ({
        id: apiProduct.id || apiProduct.productId,
        name: apiProduct.name,
        image: apiProduct.imageUrl || apiProduct.primaryImage || "./Images/default.png",
        availability: apiProduct.availability || "In stock",
        volumes: apiProduct.volumes || ["1L"],
        price: apiProduct.sellingPrice ? `₹${apiProduct.sellingPrice}` : (apiProduct.price ? `₹${apiProduct.price}` : "₹0"),
        variants: apiProduct.variants || [],
        categoryName: apiProduct.categoryName,
        categoryId: apiProduct.categoryId,
        variantCombinations: apiProduct.variantCombinations || [],
        sellingPrice: apiProduct.sellingPrice || apiProduct.price || 0,
        priceNumber: apiProduct.sellingPrice || apiProduct.price || 0,
        merchandise: apiProduct.merchandise || false
    }), []);

    // Memoize merchandise products
    const merchandiseProducts = useMemo(() => {
        const rawProducts = filteredProducts && filteredProducts.length > 0
            ? filteredProducts
            : fallbackProducts;
        
        return rawProducts
            .filter(product => product.merchandise === true)
            .map(transformProduct);
    }, [filteredProducts, transformProduct, fallbackProducts]);

    // Memoize filtered products
    const products = useMemo(() => {
        let filtered = [...merchandiseProducts];

        // Filter by categories
        if (currentFilters.categories.length > 0 && !currentFilters.categories.includes('all')) {
            filtered = filtered.filter(product =>
                currentFilters.categories.includes(product.categoryId) ||
                currentFilters.categories.includes(product.categoryName)
            );
        }

        // Filter by price ranges
        if (currentFilters.price.length > 0) {
            filtered = filtered.filter(product => {
                const productPrice = product.priceNumber || 0;
                return currentFilters.price.some(priceRange => {
                    switch (priceRange) {
                        case '₹0 - ₹100':
                            return productPrice >= 0 && productPrice <= 100;
                        case '₹100 - ₹300':
                            return productPrice > 100 && productPrice <= 300;
                        case '₹300 - ₹500':
                            return productPrice > 300 && productPrice <= 500;
                        case '₹500 - ₹1000':
                            return productPrice > 500 && productPrice <= 1000;
                        case '₹1000+':
                            return productPrice > 1000;
                        default:
                            return true;
                    }
                });
            });
        }

        // Filter by colors
        if (currentFilters.colors.length > 0) {
            filtered = filtered.filter(product => {
                if (!product.variantCombinations || product.variantCombinations.length === 0) {
                    return false;
                }

                return product.variantCombinations.some(variant =>
                    currentFilters.colors.some(selectedColor =>
                        variant.color && variant.color.toLowerCase() === selectedColor.toLowerCase()
                    )
                );
            });
        }

        return filtered;
    }, [merchandiseProducts, currentFilters]);

    // Check if screen is mobile size
    useEffect(() => {
        const checkScreenSize = () => {
            const mobile = window.innerWidth <= 768;
            setIsMobile(mobile);

            if (mobile) {
                setSidebarIsOpen(false);
            } else {
                setMobileSideBarIsOpen(false);
            }
        };

        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);

    // Memoize event handlers
    const handleSideBar = useCallback(() => {
        if (isMobile) {
            setMobileSideBarIsOpen(!mobileSideBarIsOpen);
        } else {
            setSidebarIsOpen(!sideBarIsOpen);
        }
    }, [isMobile, mobileSideBarIsOpen, sideBarIsOpen]);

    const handleMobileSideBar = useCallback(() => {
        setMobileSideBarIsOpen(!mobileSideBarIsOpen);
    }, [mobileSideBarIsOpen]);

    const handleSortChange = useCallback((event) => {
        const value = event.target.value;
        let sortBy = '';

        switch (value) {
            case 'lowToHigh':
                sortBy = 'price-low-to-high';
                break;
            case 'highToLow':
                sortBy = 'price-high-to-low';
                break;
            case 'name':
                sortBy = 'name';
                break;
            case 'newest':
                sortBy = 'newest';
                break;
            default:
                sortBy = 'name';
        }

        updateSortBy(sortBy);
    }, [updateSortBy]);

    const handleFiltersChange = useCallback((sidebarFilters) => {
        setCurrentFilters(sidebarFilters);
    }, []);

    // Memoize column class calculation
    const columnClass = useMemo(() => {
        if (isMobile) {
            return "col-6";
        }
        return sideBarIsOpen
            ? "col-lg-4 col-md-6 col-sm-12"
            : "col-lg-3 col-md-6 col-sm-12";
    }, [isMobile, sideBarIsOpen]);

    // Function to chunk products into rows
    const chunkProducts = useCallback((productList) => {
        const productsPerRow = isMobile ? 2 : (sideBarIsOpen ? 3 : 4);
        const chunks = [];
        for (let i = 0; i < productList.length; i += productsPerRow) {
            chunks.push(productList.slice(i, i + productsPerRow));
        }
        return chunks;
    }, [isMobile, sideBarIsOpen]);

    // Memoize product chunking
    const productRows = useMemo(() => {
        const productsPerRow = isMobile ? 2 : (sideBarIsOpen ? 3 : 4);
        const chunks = [];
        for (let i = 0; i < products.length; i += productsPerRow) {
            chunks.push(products.slice(i, i + productsPerRow));
        }
        return chunks;
    }, [products, isMobile, sideBarIsOpen]);

    const clearFilters = useCallback(() => {
        setCurrentFilters({ categories: [], price: [], colors: [] });
        refetch();
    }, []);

    // Show loading state
    if (loading && products.length === 0) {
        return <div><LinearProgress color="success" /></div>;
    }

    // Show error state with retry option
    if (error && products.length === 0) {
        return (
            <div className='Explore-Main-wrapper'>
                <Navbar />
                <div className="explore-contents">
                    <div className="breadcrumb-section-Explore">
                        <Breadcrumb items={breadcrumbItems} />
                    </div>
                    <div className="error-container" style={{ textAlign: 'center', padding: '50px' }}>
                        <p>Error loading products: {error.message}</p>
                        <button onClick={refetch} style={{ marginTop: '10px', padding: '10px 20px' }}>
                            Try Again
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className='Explore-Main-wrapper'>
            <ScrollToTopOnMount />

            <Navbar />

            <div className="explore-contents">
                <div className="breadcrumb-section-Explore">
                    <Breadcrumb items={breadcrumbItems} />
                </div>

                <div className="Head-and-filter-main-flex">
                    <div className="heading-section-explore">

                        <h3>Explore our Merchandise Products</h3>

                        <div className="choose-section">
                            <p>Choose products {products.length > 0 && `(${products.length} items)`}</p>
                        </div>

                    </div>

                    <div className="fiiter-section-explore-child-flex">
                        <div className="filters-section-e" onClick={handleSideBar}>
                            <p>
                                {isMobile
                                    ? (mobileSideBarIsOpen ? "Hide Filters" : "Show Filters")
                                    : (sideBarIsOpen ? "Hide Filters" : "Show Filters")
                                }
                                <VscSettings />
                            </p>
                        </div>

                        <div className="filters-section-e">
                            <select
                                id="sortDropdown"
                                className="sort-dropdown"
                                value={
                                    filters.sortBy === 'price-low-to-high' ? 'lowToHigh' :
                                        filters.sortBy === 'price-high-to-low' ? 'highToLow' :
                                            filters.sortBy === 'newest' ? 'newest' :
                                                'name'
                                }
                                onChange={handleSortChange}
                            >
                                <option value="name">Sort By</option>
                                <option value="lowToHigh">Price Low to High</option>
                                <option value="highToLow">Price High to Low</option>
                                <option value="newest">Newest First</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div className="cards-and-filter">
                    {!isMobile && sideBarIsOpen && (
                        <div className="left-side">
                            <ProductSidebar onFiltersChange={handleFiltersChange} />
                        </div>
                    )}

                    {isMobile && (
                        <ProductSidebarMobile
                            isOpen={mobileSideBarIsOpen}
                            onToggle={handleMobileSideBar}
                            showTriggerButton={false}
                            onFiltersChange={handleFiltersChange}
                        />
                    )}

                    <div className="cards-whole-three right-side">
                        {productRows?.map((row, rowIndex) => (
                            <div key={rowIndex} className="row three-cards" style={{ rowGap: '30px' }}>
                                {row?.map((product) => (
                                    <div key={product.id} className={columnClass}>
                                        <Link to={`/Product-page/${product.id}`} className='Right-side-link'>
                                            <div className="product-card-main">
                                                <div className="product-card">
                                                    <div className="prod-image-section">
                                                        <div
                                                            className="heart-icon-section"
                                                            onClick={(e) => { e.preventDefault(); handleWishlistToggle(e, product.id); }}
                                                        >
                                                            {getWishlistIcon(product.id)}
                                                        </div>
                                                        <img src={product.image} alt={product.name} />
                                                        <div
                                                            className="add-icon-wrapper"
                                                            title="View Details"
                                                        >
                                                            {getAddButtonContent(product)}
                                                        </div>
                                                    </div>
                                                    <div className="product-details">
                                                        <h3>{product.name}</h3>
                                                        {product.variantCombinations?.length > 0 ? (
                                                            <p className='Available-section'>Available in <span style={{ color: '#3DAE4A' }}>{
                                                                (v => {
                                                                    const val = v.weight || v.volume || v.amount || v.size || v.Size || v.packingSize || v.PackingSize || v.variantName;
                                                                    if (val) return String(val).trim();
                                                                    return v.name ? (v.name.includes(':') ? v.name.split(':')[1]?.trim() : v.name) : '';
                                                                })(product.variantCombinations[0])
                                                            }</span></p>
                                                        ) : (
                                                            <p className='Available-section'><span className='available-in-text'>Available in</span> <span style={{ color: '#3DAE4A' }}>{product?.variants?.length || 1} variants</span></p>
                                                        )}
                                                        <div className="price-details-card" style={{ marginTop: '5px' }}>
                                                            {(() => {
                                                                const firstVariant = (product.variantCombinations && product.variantCombinations.length > 0) ? product.variantCombinations[0] : null;
                                                                let displayPrice = firstVariant ? (firstVariant.sellingPrice || firstVariant.price) : (product.sellingPrice || product.price || 0);
                                                                let originalPrice = firstVariant ? (firstVariant.mrp || firstVariant.originalPrice || firstVariant.price) : (product.mrp || product.originalPrice || product.price || displayPrice);

                                                                return displayPrice && originalPrice && displayPrice < originalPrice ? (
                                                                    <div className="Price-flex">
                                                                        <p className="current-price">₹{displayPrice}</p>
                                                                        <p className="original-price">₹{originalPrice}</p>
                                                                    </div>
                                                                ) : (
                                                                    <p className="current-price">₹{displayPrice}</p>
                                                                );
                                                            })()}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ))}

                        {productRows.length === 0 && !loading && (
                            <div className="empty-state" style={{ textAlign: 'center', padding: '50px' }}>
                                <p>No products found matching your criteria.</p>
                                <button onClick={clearFilters} className="clear-filters-btn">
                                    Clear Filters <BsArrowUpRightCircleFill className='btn-icon' />
                                </button>
                            </div>
                        )}

                        {loading && products.length > 0 && (
                            <div style={{ textAlign: 'center', padding: '20px' }}>
                                <p>Updating products...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    )
}

export default ExploreProducts