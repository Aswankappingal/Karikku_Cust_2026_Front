import React, { useState } from 'react'
import './ProductSidebarMobile.scss'
import { RiArrowDropUpLine } from 'react-icons/ri';
import { MdOutlineArrowDropDown } from 'react-icons/md';
import { IoIosArrowDown } from 'react-icons/io';
import { CiSearch } from 'react-icons/ci';

const ProductSidebarMobile = ({ isOpen: externalIsOpen, onToggle, showTriggerButton = true }) => {
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [expandedSections, setExpandedSections] = useState({
        categories: true,
        price: true,
        colors: true
    });

    // Use external control if provided, otherwise use internal state
    const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;
    const toggleOpen = onToggle || (() => setInternalIsOpen(!internalIsOpen));

    const [selectedCategories, setSelectedCategories] = useState(['All']);
    const [selectedPriceRange, setSelectedPriceRange] = useState('');
    const [selectedColors, setSelectedColors] = useState([]);

    const categories = [    
        'All',
        'T-shirts',
        'Notebooks',
        'Packaging',
        'Caps',
        'Other bags',
        'Eco friendly'
    ];

    const priceRanges = [
        '₹10 - 500',
        '₹500 - 1000',
        '₹1000 - 1500',
        '₹1500 - 2500'
    ];

    const colors = [
        { name: 'Black', value: '#000000' },
        { name: 'Turquoise', value: '#17A2B8' },
        { name: 'Yellow', value: '#FFC107' },
        { name: 'Maroon', value: '#800000' },
        { name: 'Grey', value: '#6C757D' },
        { name: 'Purple', value: '#6F42C1' },
        { name: 'Red', value: '#DC3545' },
        { name: 'White', value: '#FFFFFF' },
        { name: 'Pink', value: '#E83E8C' }
    ];

    const toggleSection = (section) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleCategoryChange = (category) => {
        if (category === 'All') {
            setSelectedCategories(['All']);
        } else {
            setSelectedCategories(prev => {
                const filtered = prev.filter(cat => cat !== 'All');
                if (filtered.includes(category)) {
                    const result = filtered.filter(cat => cat !== category);
                    return result.length === 0 ? ['All'] : result;
                } else {
                    return [...filtered, category];
                }
            });
        }
    };

    const handleColorChange = (colorName) => {
        setSelectedColors(prev =>
            prev.includes(colorName)
                ? prev.filter(color => color !== colorName)
                : [...prev, colorName]
        );
    };

    const clearFilters = () => {
        setSelectedCategories(['All']);
        setSelectedPriceRange('');
        setSelectedColors([]);
    };

    return (
        <div className="product-sidebar-mobile">
            {/* Trigger Button - Only show if showTriggerButton is true */}
            {showTriggerButton && (
                <div className="trigger-button-container">
                    <button
                        onClick={toggleOpen}
                        className="trigger-button"
                    >
                        Open Filters
                    </button>
                </div>
            )}

            {/* Overlay */}
            {isOpen && (
                <div
                    className="overlay"
                    onClick={toggleOpen}
                />
            )}

            {/* Bottom Sidebar Filter Panel */}
            <div className={`filter-panel ${isOpen ? 'open' : 'closed'}`}>

                {/* Drag Handle */}
                <div className="drag-handle-container">
                    <div className="drag-handle"></div>
                </div>

                {/* Header */}
                <div className="header">
                    <h2 className="title">Filters</h2>
                    <div className="header-actions">
                        <button
                            onClick={clearFilters}
                            className="clear-button"
                        >
                            Clear
                        </button>
                        <button
                            onClick={toggleOpen}
                            className="close-button"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Filter Content */}
                <div className="filter-content">

                    {/* Categories Section */}
                    <div className="filter-section">
                        <button
                            onClick={() => toggleSection('categories')}
                            className="section-header"
                        >
                            <span className="section-title"> Categories   <CiSearch /> </span>
                            <span className="chevron">
                                {expandedSections.categories ? <RiArrowDropUpLine style={{ fontSize: "36px" }} /> : <IoIosArrowDown style={{ fontSize: "22px" }} />}
                            </span>
                        </button>

                        {expandedSections.categories && (
                            <div className="section-content">
                                {categories.map((category) => (
                                    <label key={category} className="checkbox-item">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(category)}
                                            onChange={() => handleCategoryChange(category)}
                                            className="checkbox"
                                        />
                                        <span className="checkbox-label">{category}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Price Section */}
                    <div className="filter-section">
                        <button
                            onClick={() => toggleSection('price')}
                            className="section-header"
                        >
                            <span className="section-title">Price</span>
                            <span className="chevron">
                                {expandedSections.price ? <RiArrowDropUpLine style={{ fontSize: "3px" }} /> : <IoIosArrowDown style={{ fontSize: "22px" }} />}
                            </span>
                        </button>

                        {expandedSections.price && (
                            <div className="section-content">
                                {priceRanges.map((range) => (
                                    <label key={range} className="radio-item">
                                        <input
                                            type="radio"
                                            name="priceRange"
                                            value={range}
                                            checked={selectedPriceRange === range}
                                            onChange={(e) => setSelectedPriceRange(e.target.value)}
                                            className="radio"
                                        />
                                        <span className="radio-label">{range}</span>
                                    </label>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Colors Section */}
                    <div className="filter-section">
                        <button
                            onClick={() => toggleSection('colors')}
                            className="section-header"
                        >
                            <span className="section-title">Colors</span>
                            <span className="chevron">
                                {expandedSections.colors ? <RiArrowDropUpLine style={{ fontSize: "36px" }} /> : <IoIosArrowDown style={{ fontSize: "22px" }} />}
                            </span>
                        </button>

                        {expandedSections.colors && (
                            <div className="section-content">
                                <div className="colors-grid">
                                    {colors.map((color) => (
                                        <div key={color.name} className="color-item">
                                            <button
                                                onClick={() => handleColorChange(color.name)}
                                                className={`color-button ${selectedColors.includes(color.name) ? 'selected' : ''}`}
                                                style={{ backgroundColor: color.value }}
                                            >
                                                {selectedColors.includes(color.name) && (
                                                    <div className={`color-indicator ${color.value === '#FFFFFF' ? 'dark' : 'light'}`} />
                                                )}
                                            </button>
                                            <p className="color-name">{color.name}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Apply Button */}
                <div className="apply-button-container">
                    <button
                        onClick={toggleOpen}
                        className="apply-button"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Selected Filters Display */}
            {((selectedCategories.length > 0 && !selectedCategories.includes('All')) ||
                selectedPriceRange ||
                selectedColors.length > 0) && (
                    <div className="active-filters">
                        <h3 className="active-filters-title">Active Filters:</h3>
                        <div className="active-filters-list">
                            {selectedCategories.filter(cat => cat !== 'All').map(category => (
                                <span key={category} className="filter-tag category-tag">
                                    {category}
                                </span>
                            ))}
                            {selectedPriceRange && (
                                <span className="filter-tag price-tag">
                                    {selectedPriceRange}
                                </span>
                            )}
                            {selectedColors.map(color => (
                                <span key={color} className="filter-tag color-tag">
                                    {color}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
        </div>
    )
}

export default ProductSidebarMobile;