import React, { useState, useEffect } from 'react';
import './Productsidebar.scss';
import { CiSearch } from 'react-icons/ci';
import useCategories from '../../../store/hook/useCategory';
import useProducts from '../../../store/hook/useProduct';

const Productsidebar = ({ onFiltersChange }) => {
    const [openSection, setOpenSection] = useState(null);

    const [selectedFilters, setSelectedFilters] = useState({
        categories: [],
        price: [],
        colors: []
    });

    const [searchTerms, setSearchTerms] = useState({
        categories: '',
        price: '',
        colors: ''
    });

    // Use categories and products hooks
    const {
        flatCategories,
        loading: categoriesLoading,
        error: categoriesError,
    } = useCategories({
        autoFetch: true,
        includeSubcategories: true
    });

    const { availableColors, products } = useProducts();

    const toggleSection = (section) => {
        setOpenSection(prev => prev === section ? null : section);
    };

    const handleFilterChange = (section, value) => {
        let newFilters = { ...selectedFilters };
        
        if (section === 'categories') {
            if (value === 'all') {
                // Handle "All" selection
                newFilters.categories = selectedFilters.categories.includes('all') ? [] : ['all'];
            } else {
                // Handle individual category selection
                let categories = [...selectedFilters.categories];
                
                // Remove "all" if it exists when selecting specific category
                categories = categories.filter(cat => cat !== 'all');
                
                if (categories.includes(value)) {
                    categories = categories.filter(cat => cat !== value);
                } else {
                    categories.push(value);
                }
                
                newFilters.categories = categories;
            }
        } else {
            // Handle price and colors (multiple selection)
            const currentSelection = selectedFilters[section];
            if (currentSelection.includes(value)) {
                newFilters[section] = currentSelection.filter(item => item !== value);
            } else {
                newFilters[section] = [...currentSelection, value];
            }
        }
        
        setSelectedFilters(newFilters);
        
        // Call parent callback with updated filters
        if (onFiltersChange) {
            onFiltersChange(newFilters);
        }
    };

    const clearAllFilters = () => {
        const clearedFilters = {
            categories: [],
            price: [],
            colors: []
        };
        
        setSelectedFilters(clearedFilters);
        setSearchTerms({
            categories: '',
            price: '',
            colors: ''
        });
        
        if (onFiltersChange) {
            onFiltersChange(clearedFilters);
        }
    };

    const handleSearchChange = (section, value) => {
        setSearchTerms(prev => ({
            ...prev,
            [section]: value
        }));
    };

    // Get dynamic price ranges based on actual product data
    const getDynamicPriceRanges = () => {
        if (!products || products.length === 0) {
            return ['₹0 - ₹100', '₹100 - ₹300', '₹300 - ₹500', '₹500 - ₹1000', '₹1000+'];
        }

        // Get all prices from products
        const prices = products.map(p => p.sellingPrice || p.price || 0).filter(p => p > 0);
        
        if (prices.length === 0) {
            return ['₹0 - ₹100', '₹100 - ₹300', '₹300 - ₹500', '₹500 - ₹1000', '₹1000+'];
        }

        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);

        // Create dynamic ranges
        const ranges = [];
        
        if (minPrice < 100) ranges.push('₹0 - ₹100');
        if (maxPrice > 100) ranges.push('₹100 - ₹300');
        if (maxPrice > 300) ranges.push('₹300 - ₹500');
        if (maxPrice > 500) ranges.push('₹500 - ₹1000');
        if (maxPrice > 1000) ranges.push('₹1000+');

        return ranges.length > 0 ? ranges : ['₹0 - ₹100', '₹100 - ₹300', '₹300 - ₹500', '₹500 - ₹1000', '₹1000+'];
    };

    const getFilteredOptions = (section) => {
        const searchTerm = searchTerms[section].toLowerCase();
        
        if (section === 'categories') {
            if (categoriesLoading) return [];
            
            // Add "All" option to categories
            const allCategories = [
                { id: 'all', name: 'All Categories', hsnCode: '' },
                ...flatCategories
            ];
            
            return allCategories.filter(category =>
                category.name.toLowerCase().includes(searchTerm) ||
                (category.hsnCode && category.hsnCode.toLowerCase().includes(searchTerm))
            );
        }
        
        if (section === 'price') {
            return getDynamicPriceRanges().filter(range =>
                range.toLowerCase().includes(searchTerm)
            );
        }
        
        if (section === 'colors') {
            // Use dynamic colors from products, fallback to static colors
            const dynamicColors = availableColors && availableColors.length > 0 
                ? availableColors 
                : ['Black', 'White', 'Red', 'Blue', 'Green', 'Yellow', 'Purple', 'Pink', 'Orange'];
            
            return dynamicColors.filter(color =>
                color.toLowerCase().includes(searchTerm)
            );
        }
        
        return [];
    };

    const colorMap = {
        'Black': '#000000',
        'White': '#ffffff',
        'Red': '#ef4444',
        'Blue': '#3b82f6',
        'Green': '#10b981',
        'Yellow': '#f59e0b',
        'Purple': '#8b5cf6',
        'Pink': '#ec4899',
        'Orange': '#f97316',
        'Brown': '#92400e',
        'Gray': '#6b7280',
        'Grey': '#6b7280',
        'Clear': '#f0f0f0',
        'Gold': '#fbbf24',
        'Silver': '#9ca3af',
        'Transparent': '#ffffff'
    };

    // Get color hex value (with fallback)
    const getColorHex = (colorName) => {
        return colorMap[colorName] || colorMap[colorName.toLowerCase()] || '#cccccc';
    };

    const ArrowIcon = ({ isOpen }) => (
        <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            className={`arrow-icon ${isOpen ? 'open' : ''}`}
        >
            <path
                d="M3 4.5L6 7.5L9 4.5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );

    return (
        <div className="Sidebar-main-wrapper">
            <div className="sidebar-header">
                <h3>Filters</h3>
                <button className="clear-btn" onClick={clearAllFilters}>
                    Clear
                </button>
            </div>

            {/* Categories Section */}
            <div className="Filter_Section-M">
                <div
                    className="filter-header"
                    onClick={() => toggleSection('categories')}
                >
                    <span className="filter-title">Categories <CiSearch /> </span>
                    <ArrowIcon isOpen={openSection === 'categories'} />
                </div>
                {openSection === 'categories' && (
                    <div className="filter-options">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search categories..."
                                value={searchTerms.categories}
                                onChange={(e) => handleSearchChange('categories', e.target.value)}
                                className="search-input"
                            />
                        </div>
                        {categoriesLoading ? (
                            <div className="loading-state">Loading categories...</div>
                        ) : categoriesError ? (
                            <div className="error-state">Error loading categories</div>
                        ) : getFilteredOptions('categories').length > 0 ? (
                            getFilteredOptions('categories').map((category) => (
                                <label key={category.id} className="filter-option">
                                    <input
                                        type="checkbox"
                                        checked={selectedFilters.categories.includes(category.id)}
                                        onChange={() => handleFilterChange('categories', category.id)}
                                    />
                                    <span className="checkmark"></span>
                                    <span className="option-text">
                                        {category.isSubcategory && '— '}
                                        {category.name}
                                        {category.hsnCode && ` (${category.hsnCode})`}
                                    </span>
                                </label>
                            ))
                        ) : (
                            <div className="no-results">No categories found</div>
                        )}
                    </div>
                )}
            </div>

            {/* Price Section */}
            <div className="Filter_Section-M">
                <div
                    className="filter-header"
                    onClick={() => toggleSection('price')}
                >
                    <span className="filter-title">Price</span>
                    <ArrowIcon isOpen={openSection === 'price'} />
                </div>
                {openSection === 'price' && (
                    <div className="filter-options">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search price ranges..."
                                value={searchTerms.price}
                                onChange={(e) => handleSearchChange('price', e.target.value)}
                                className="search-input"
                            />
                        </div>
                        {getFilteredOptions('price').length > 0 ? (
                            getFilteredOptions('price').map((priceRange, index) => (
                                <label key={index} className="filter-option">
                                    <input
                                        type="checkbox"
                                        checked={selectedFilters.price.includes(priceRange)}
                                        onChange={() => handleFilterChange('price', priceRange)}
                                    />
                                    <span className="checkmark"></span>
                                    <span className="option-text">{priceRange}</span>
                                </label>
                            ))
                        ) : (
                            <div className="no-results">No price ranges found</div>
                        )}
                    </div>
                )}
            </div>

            {/* Colors Section */}
            <div className="Filter_Section-M">
                <div
                    className="filter-header"
                    onClick={() => toggleSection('colors')}
                >
                    <span className="filter-title">Colors</span>
                    <ArrowIcon isOpen={openSection === 'colors'} />
                </div>
                {openSection === 'colors' && (
                    <div className="filter-options">
                        <div className="search-container">
                            <input
                                type="text"
                                placeholder="Search colors..."
                                value={searchTerms.colors}
                                onChange={(e) => handleSearchChange('colors', e.target.value)}
                                className="search-input"
                            />
                        </div>
                        {getFilteredOptions('colors').length > 0 ? (
                            <div className="color-grid">
                                {getFilteredOptions('colors').map((color, index) => (
                                    <div key={index} className="color-item">
                                        <button
                                            onClick={() => handleFilterChange('colors', color)}
                                            className={`color-button ${selectedFilters.colors.includes(color) ? 'selected' : ''}`}
                                            style={{
                                                backgroundColor: getColorHex(color),
                                                border: color === 'White' || color === 'Clear' || color === 'Transparent' ? '2px solid #e5e7eb' : '2px solid #e5e7eb',
                                                position: 'relative',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            title={color}
                                        >
                                            {selectedFilters.colors.includes(color) && (
                                                <svg
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke={color === 'White' || color === 'Yellow' || color === 'Clear' || color === 'Transparent' ? '#000' : '#fff'}
                                                    strokeWidth="3"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                >
                                                    <polyline points="20,6 9,17 4,12"></polyline>
                                                </svg>
                                            )}
                                        </button>
                                        <span className="color-label">{color}</span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="no-results">No colors found</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Productsidebar;