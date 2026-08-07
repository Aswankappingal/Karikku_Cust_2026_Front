// src/pages/ProductPage/ProductPage.js
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify';
import './ProductPage.scss'
import { MdOutlineSettings } from "react-icons/md";
import { FaRegFile } from "react-icons/fa";
import Navbar from '../../common/Navbar/Navbar'
import { IoSettingsOutline } from 'react-icons/io5';
import { GoPlus } from 'react-icons/go';
import Footer from '../../common/Footer/Footer';
import { Link, useParams, useNavigate } from 'react-router-dom';
import useProducts from '../../../store/hook/useProduct';
import { useCart } from '../../../store/hook/useCart'; // Import the cart hook

const ProductPage = () => {
    const [selectedVariants, setSelectedVariants] = useState({});
    const [quantity, setQuantity] = useState(1);
    const { id } = useParams();
    const navigate = useNavigate();

    const {
        filteredProducts,
        loading,
        error
    } = useProducts();

    const {
        addToCart,
        isAddingToCart
    } = useCart();

    const product = filteredProducts.find(p => String(p.id) === id);

    useEffect(() => {
        if (product && product.variants && product.variants.length > 0) {
            const initialVariants = {};
            product.variants.forEach(variant => {
                if (variant.values && variant.values.length > 0) {
                    initialVariants[variant.name] = variant.values[0];
                }
            });
            setSelectedVariants(initialVariants);
        }
    }, [product])

    const handleVariantChange = (variantName, value) => {
        setSelectedVariants(prev => ({
            ...prev,
            [variantName]: value
        }));
    };

    const handleAddToCart = async () => {
        // Prepare variants object (only include non-empty variants)
        const variantsToSend = Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined;
        
        const result = await addToCart(product.id, quantity, variantsToSend);
        
        if (result.success) {
            toast.success('Product added to cart successfully!');
        } else {
            toast.error(`Failed to add to cart: ${result.error}`);
        }
    };

    const handleBuyNow = async () => {
        const variantsToSend = Object.keys(selectedVariants).length > 0 ? selectedVariants : undefined;
        
        const result = await addToCart(product.id, quantity, variantsToSend);
        
        if (result.success) {
            navigate('/cart'); // Redirect to cart page
        } else {
            toast.error(`Failed to add to cart: ${result.error}`);
        }
    };

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error loading product.</p>;
    if (!product) return <p>Product not found.</p>;

    return (
        <div className="Product-page-wrapper">
            <Navbar bgColor='#ffff' />
            <div className="container-fluid">
                <div className="product-page-sub row">
                    <div className="col-lg-6 col-md-6 col-sm-12 product-page-card">
                        <img src={product.imageUrl} alt={product.name} />
                    </div>

                    <div className="col-lg-6 col-md-6 col-sm-12 product-page-contents">
                        <h2>{product.name}</h2>
                        <p>{product.features}</p>
                        <p id='price'>Price</p>
                        <h3 className="price-range">
                            ₹{product.price}
                            <span id='offers'> {product.offers}</span>
                        </h3>

                        {/* Quantity Selector */}
                        <div className="quantity-selector">
                            <h4>Quantity</h4>
                            <div className="quantity-controls">
                                <button 
                                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                                    disabled={quantity <= 1}
                                >
                                    -
                                </button>
                                <span>{quantity}</span>
                                <button 
                                    onClick={() => setQuantity(q => q + 1)}
                                >
                                    +
                                </button>
                            </div>
                        </div>

                        {/* Dynamic Variants Selector */}
                        {Array.isArray(product?.variants) && product.variants.length > 0 && (
                            <div className="variants-selector-container">
                                {product.variants.map((variant, variantIndex) => (
                                    <div key={variantIndex} className="variant-group">
                                        <h4 className='packageing-select'>
                                            Select {variant?.name ? variant.name.charAt(0).toUpperCase() + variant.name.slice(1) : 'Option'}
                                        </h4>

                                        <div className="packing-selector-container">
                                            <div className="size-options">
                                                {Array.isArray(variant.values) && variant.values.map((value, valueIndex) => (
                                                    <button
                                                        key={`${variant?.name || 'variant'}-${valueIndex}`}
                                                        className={`size-option ${selectedVariants?.[variant.name] === value ? 'selected' : ''}`}
                                                        onClick={() => handleVariantChange(variant.name, value)}
                                                    >
                                                        {value}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
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
                            <button 
                                onClick={handleBuyNow}
                                className='Link'
                                disabled={isAddingToCart}
                            >
                                {isAddingToCart ? 'Adding...' : 'Buy Now'}
                            </button>
                            <button 
                                onClick={handleAddToCart}
                                className='Link'
                                disabled={isAddingToCart}
                            >
                                {isAddingToCart ? 'Adding...' : 'Add to cart'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* ... rest of the component remains the same ... */}
                  <div className="text-only-product row">
                                    <div className="col-lg-6 col-md-12 col-sm-12 col-12 text-sections-whole">
                                        <p>
                                            {product.description}
                                        </p>
                
                                        <h6>
                                            Storage Instructions : <span>{product.storageInstruction}</span>
                                        </h6>
                                        <h6>
                                            Shelf Life : <span> {product.shelfLife}</span>
                                        </h6>
                                        <h6>
                                            Certifications : <span>{product.certification}</span>
                                        </h6>
                
                                    </div>
                                </div>
                
                                <div className="row image-whole-section">
                                    {product.images && product.images.length > 0 ? (
                                        product.images.map((image, index) => (
                                            <div
                                                key={index}
                                                className="col-lg-6 col-md-6 col-sm-6 col-6"
                                            >
                                                <div className='card-image-section'>
                                                    <img
                                                        src={image.url}
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
                                            <h3 className='process'>
                                                Our process
                                            </h3>
                                            <p className='Virgin'>
                                                Virgin coconut oil
                                            </p>
                
                                            <div className="row">
                                                <div className="col-lg-4  col-md-6 col-sm-12">
                                                    <div className="cards-n-images-section">
                                                        <img src="/Images/Coconut-Tree.svg" alt="" />
                                                        <p className='steps-only'>
                                                            step 01
                                                        </p>
                                                        <h6 className='Handpicked'>
                                                            Handpicked at Peak Freshness
                                                        </h6>
                                                        <p className='para-process'>
                                                            We select only the best tender coconuts, harvested at the perfect age for maximum hydration and taste.
                                                        </p>
                                                    </div>
                                                </div>
                
                                                <div className="col-lg-4  col-md-6 col-sm-12">
                                                    <div className="cards-n-images-section">
                                                        <img src="/Images/Bottele-aat.svg" alt="" />
                                                        <p className='steps-only'>
                                                            step 02
                                                        </p>
                                                        <h6 className='Handpicked'>
                                                            Handpicked at Peak Freshness
                                                        </h6>
                                                        <p className='para-process'>
                                                            We select only the best tender coconuts, harvested at the perfect age for maximum hydration and taste.
                                                        </p>
                                                    </div>
                                                </div>
                
                                                <div className="col-lg-4  col-md-6 col-sm-12">
                                                    <div className="cards-n-images-section">
                                                        <img src="/Images/Coconut-black.svg" alt="" />
                                                        <p className='steps-only'>
                                                            step 03
                                                        </p>
                                                        <h6 className='Handpicked'>
                                                            Handpicked at Peak Freshness
                                                        </h6>
                                                        <p className='para-process'>
                                                            We select only the best tender coconuts, harvested at the perfect age for maximum hydration and taste.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                
                                            <h3 className='Other-pro'>
                                                Other products
                                            </h3>
                
                                            <div className="row">
                                                {products.map((product) => (
                                                    <div key={product.id} className="col-lg-4 col-md-6 col-sm-12 mb-4">
                                                        <div className="product-card-main">
                                                            <div className="product-card">
                                                                <div className="prod-image-section">
                                                                    <img src={product.image} alt={product.name} />
                                                                    <div className="add-icon-wrapper">
                                                                        <GoPlus className='add-icon' />
                                                                    </div>
                                                                </div>
                                                                <div className="product-details">
                                                                    <h3>{product.name}</h3>
                                                                    <h4>{product.availability}</h4>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
            </div>
            <Footer />
        </div>
    )
}

export default ProductPage