// src/hooks/useFaqs.js
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useMemo } from 'react';
import { 
  fetchFaqCategoriesWithFaqs, 
  fetchFaqsByCategory,
  clearFaqs,
  clearCurrentCategoryData 
} from '../../store/slice/faqSlice';

export const useFaqs = () => {
  const dispatch = useDispatch();
  const { 
    categoriesWithFaqs, 
    currentCategoryData, 
    loading, 
    categoryLoading, 
    error, 
    categoryError 
  } = useSelector((state) => state.faqs);

  // Fetch all FAQ categories with their FAQs
  const fetchAllFaqCategories = () => {
    dispatch(fetchFaqCategoriesWithFaqs());
  };

  // Fetch FAQs for a specific category
  const fetchCategoryFaqs = (categoryId) => {
    dispatch(fetchFaqsByCategory(categoryId));
  };

  // Clear all FAQ data
  const clearAllFaqs = () => {
    dispatch(clearFaqs());
  };

  // Clear current category data
  const clearCurrentCategory = () => {
    dispatch(clearCurrentCategoryData());
  };

  // Get formatted data for the FAQ component (backward compatible with your current structure)
  const formattedFaqData = useMemo(() => {
    if (!categoriesWithFaqs.length) return {};
    
    const formatted = {};
    categoriesWithFaqs.forEach(category => {
      formatted[category.name || category.title] = category.faqs.map(faq => ({
        id: faq.id,
        question: faq.question,
        answer: faq.answer
      }));
    });
    return formatted;
  }, [categoriesWithFaqs]);

  // Get categories list
  const categoryList = useMemo(() => {
    return categoriesWithFaqs.map(category => ({
      id: category.id,
      name: category.name || category.title,
      displayOrder: category.displayOrder
    }));
  }, [categoriesWithFaqs]);

  return {
    // Data
    categoriesWithFaqs,
    currentCategoryData,
    formattedFaqData,
    categoryList,
    
    // Loading states
    loading,
    categoryLoading,
    
    // Error states
    error,
    categoryError,
    
    // Actions
    fetchAllFaqCategories,
    fetchCategoryFaqs,
    clearAllFaqs,
    clearCurrentCategory
  };
};