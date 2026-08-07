// hooks/useCategories.js
import { useEffect, useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCategories,
  fetchProductsByCategory,
  setSelectedCategory,
  setCategoriesSearchQuery,
  clearCategories,
  clearCategoriesError,
  clearCategoryProducts,
  selectCategories,
  selectCategoryProducts,
  selectSelectedCategory,
  selectCategoriesLoading,
  selectProductsLoading,
  selectCategoriesError,
  selectProductsError,
  selectCategoriesPagination,
  selectCategoriesSearchQuery,
  selectCategoriesLastFetched,
} from '../slice/categorySlice';

const useCategories = (options = {}) => {
  const {
    autoFetch = true,
    autoFetchProducts = true,
    refetchInterval = null,
    staleTime = 5 * 60 * 1000, // 5 minutes
    includeSubcategories = true,
  } = options;

  const dispatch = useDispatch();

  // Selector 
  const categories = useSelector(selectCategories);
  const categoryProducts = useSelector(selectCategoryProducts);
  const selectedCategory = useSelector(selectSelectedCategory);
  const loading = useSelector(selectCategoriesLoading);
  const productsLoading = useSelector(selectProductsLoading);
  const error = useSelector(selectCategoriesError);
  const productsError = useSelector(selectProductsError);
  const pagination = useSelector(selectCategoriesPagination);
  const searchQuery = useSelector(selectCategoriesSearchQuery);
  const lastFetched = useSelector(selectCategoriesLastFetched);

  // Memoized derived data
  const flatCategories = useMemo(() => {
    const flat = [];
    categories.forEach(category => {
      flat.push(category);
      if (includeSubcategories && category.subcategories) {
        flat.push(...category.subcategories.map(sub => ({
          ...sub,
          isSubcategory: true,
          parentCategory: category.id,
          parentCategoryName: category.name,
        })));
      }
    });
    return flat;
  }, [categories, includeSubcategories]);

  const mainCategories = useMemo(() => {
    return categories.filter(cat => !cat.parentCategory);
  }, [categories]);

  const categoryStats = useMemo(() => {
    return {
      total: categories.length,
      mainCategories: mainCategories.length,
      subcategoriesCount: categories.reduce((acc, cat) => 
        acc + (cat.subcategories?.length || 0), 0
      ),
    };
  }, [categories, mainCategories]);

  const currentCategoryProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return categoryProducts[selectedCategory] || [];
  }, [categoryProducts, selectedCategory]);

  // Check if data is stale
  const isStale = useMemo(() => {
    if (!lastFetched) return true;
    return Date.now() - new Date(lastFetched).getTime() > staleTime;
  }, [lastFetched, staleTime]);

  // Fetch categories function
  const refetchCategories = useCallback((params = {}) => {
    dispatch(fetchCategories(params));
  }, [dispatch]);

  // Fetch products for a specific category
  const fetchCategoryProducts = useCallback((categoryId) => {
    if (categoryId && !categoryProducts[categoryId]) {
      dispatch(fetchProductsByCategory(categoryId));
    }
  }, [dispatch, categoryProducts]);

  // Select category and optionally fetch its products
  const selectCategory = useCallback((categoryId) => {
    dispatch(setSelectedCategory(categoryId));
    if (autoFetchProducts && categoryId) {
      fetchCategoryProducts(categoryId);
    }
  }, [dispatch, autoFetchProducts, fetchCategoryProducts]);

  // Search categories
  const searchCategories = useCallback((query) => {
    dispatch(setCategoriesSearchQuery(query));
    refetchCategories({ search: query });
  }, [dispatch, refetchCategories]);

  // Clear functions
  const clearAllCategories = useCallback(() => {
    dispatch(clearCategories());
  }, [dispatch]);

  const clearCategoriesError = useCallback(() => {
    dispatch(clearCategoriesError());
  }, [dispatch]);

  const clearProductsForCategory = useCallback((categoryId) => {
    dispatch(clearCategoryProducts(categoryId));
  }, [dispatch]);

  // Get category by ID
  const getCategoryById = useCallback((id) => {
    return flatCategories.find(category => category.id === id);
  }, [flatCategories]);

  // Get subcategories for a category
  const getSubcategories = useCallback((categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.subcategories || [];
  }, [categories]);

  // Get products for a category (from store)
  const getProductsForCategory = useCallback((categoryId) => {
    return categoryProducts[categoryId] || [];
  }, [categoryProducts]);

  // Filter categories by name or HSN code
  const filterCategories = useCallback((query) => {
    if (!query) return flatCategories;
    
    const lowercaseQuery = query.toLowerCase();
    return flatCategories.filter(category => 
      category.name.toLowerCase().includes(lowercaseQuery) ||
      (category.hsnCode && category.hsnCode.toLowerCase().includes(lowercaseQuery))
    );
  }, [flatCategories]);

  // Auto-fetch effect
  useEffect(() => {
    if (autoFetch && (categories.length === 0 || isStale)) {
      refetchCategories();
    }
  }, [autoFetch, categories.length, isStale, refetchCategories]);

  // Auto-fetch products when category is selected
  useEffect(() => {
    if (selectedCategory && autoFetchProducts && !categoryProducts[selectedCategory]) {
      fetchCategoryProducts(selectedCategory);
    }
  }, [selectedCategory, autoFetchProducts, categoryProducts, fetchCategoryProducts]);

  // Refetch interval effect
  useEffect(() => {
    if (!refetchInterval) return;

    const intervalId = setInterval(() => {
      if (isStale) {
        refetchCategories();
      }
    }, refetchInterval);

    return () => clearInterval(intervalId);
  }, [refetchInterval, isStale, refetchCategories]);

  return {
    // Data
    categories,
    flatCategories,
    mainCategories,
    categoryProducts,
    currentCategoryProducts,
    selectedCategory,
    categoryStats,
    
    // State
    loading,
    productsLoading,
    error,
    productsError,
    pagination,
    searchQuery,
    lastFetched,
    isStale,
    
    // Actions
    refetchCategories,
    selectCategory,
    fetchCategoryProducts,
    searchCategories,
    clearAllCategories,
    clearCategoriesError,
    clearProductsForCategory,
    
    // Utilities
    getCategoryById,
    getSubcategories,
    getProductsForCategory,
    filterCategories,
  };
};

export default useCategories;