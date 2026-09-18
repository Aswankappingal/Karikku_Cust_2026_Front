import { useState, useEffect, useMemo } from 'react';
import './FaqSection.scss'
import { LuMinus } from "react-icons/lu";
import { FiPlus } from "react-icons/fi";
import Navbar from '../../../common/Navbar/Navbar';
import { IoSearch } from 'react-icons/io5';
import Footer from '../../../common/Footer/Footer';
import ScrollToTopOnMount from '../../../common/ScrollToTopOnMount';
import { useFaqs } from '../../../../store/hook/useFaqs';

const FaqItem = ({ question, answer, isExpanded, onToggle }) => {
  return (
    <div className="faq-item">
      <div className="faq-question" onClick={onToggle}>
        <h3>{question}</h3>
        <button className={`expand-btn ${isExpanded ? 'expanded' : ''}`}>
          {isExpanded ? <LuMinus size={20} /> : <FiPlus size={20} />}
        </button>
      </div>
      <div className={`faq-answer ${isExpanded ? 'expanded' : ''}`}>
        <div className="faq-answer-content">
          <p>{answer}</p>
        </div>
      </div>
    </div>
  );
};

const FaqSection = () => {
  const {
    formattedFaqData,
    categoryList,
    loading,
    error,
    fetchAllFaqCategories
  } = useFaqs();

  useEffect(() => {
    console.log("faoooooo", formattedFaqData);
  }, [])

  const [activeCategory, setActiveCategory] = useState('');
  const [expandedItems, setExpandedItems] = useState({});
  const [searchQuery, setSearchQuery] = useState('');

  // Get 3 random FAQs - memoized to only change on page reload
  const randomFaqs = useMemo(() => {
    const allFaqs = [];
    
    // Collect all FAQs from all categories
    Object.keys(formattedFaqData).forEach(category => {
      formattedFaqData[category].forEach(faq => {
        allFaqs.push({
          ...faq,
          category
        });
      });
    });

    // Shuffle and get 3 random FAQs
    const shuffled = [...allFaqs].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }, [formattedFaqData]);

  // Default images for the comment cards
  const defaultImages = [
    "/public/Images/faq-comment-message.png",
    "/public/Images/faq-edit-comments.png",
    "/public/Images/faq-contact-comments.png"
  ];

  // Fetch FAQ data on component mount
  useEffect(() => {
    fetchAllFaqCategories();
  }, []);

  // Set default active category when data is loaded
  useEffect(() => {
    if (categoryList.length > 0 && !activeCategory) {
      const firstCategory = categoryList[0];
      setActiveCategory(firstCategory.name);
    }
  }, [categoryList, activeCategory]);

  const handleCategoryClick = (category) => {
    setActiveCategory(category);
    setExpandedItems({}); // Reset expanded items when category changes
  };

  const toggleItem = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return null;
    
    const lowerQuery = searchQuery.toLowerCase();
    const results = [];
    
    Object.keys(formattedFaqData).forEach(category => {
      formattedFaqData[category].forEach(faq => {
        if (faq.question.toLowerCase().includes(lowerQuery) || faq.answer.toLowerCase().includes(lowerQuery)) {
          results.push(faq);
        }
      });
    });
    return results;
  }, [searchQuery, formattedFaqData]);

  // Show loading state
  if (loading) {
    return (
      <div className='FaqSectionMainWrapper'>
        <Navbar />
        <div className="loading-container" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          fontSize: '18px',
          color: '#738933'
        }}>
          Loading FAQ data...
        </div>
        <Footer />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className='FaqSectionMainWrapper'>
        <Navbar />
        <div className="error-container" style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '50vh',
          fontSize: '18px',
          color: '#e74c3c'
        }}>
          <p>Error loading FAQ data: {error}</p>
          <button
            onClick={fetchAllFaqCategories}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#3DAE4A',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  const categories = Object.keys(formattedFaqData);

  return (
    <div className='FaqSectionMainWrapper'>
      <Navbar />
      <ScrollToTopOnMount />
      <div className='faq-main'>
        <img className='img-green-leaf' src="/public/Images/Faq-grenn-leaf.png" alt="Green Leaf" />
        <div className='faq-header'>
          <h2>Connect Us</h2>
          <h1>Hello, How Can</h1>
          <h1>We Help?</h1>
          <div className="search-bar">
            <input 
              type="text" 
              placeholder='Search help topics' 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <div className="search-icon">
              <IoSearch style={{ color: "#ffffff" }} />
            </div>
          </div>
        </div>
        <div className='faq-comments-group'>
          {randomFaqs.length > 0 ? (
            randomFaqs.map((faq, index) => (
              <div className='comments' key={faq.id}>
                <img 
                  src={defaultImages[index] || defaultImages[0]} 
                  className='comment-img' 
                  alt="" 
                />
                <p className='comments-para'>{faq.question}</p>
                <p>{faq.answer.slice(0, 50)}...</p>
              </div>
            ))
          ) : (
            // Fallback to static content if no FAQs available
            <>
              <div className='comments'>
                <img src="/public/Images/faq-comment-message.png" className='comment-img' alt="" />
                <p className='comments-para'>Where's my order?</p>
                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
              </div>
              <div className='comments'>
                <img src="/public/Images/faq-edit-comments.png" className='comment-img' alt="" />
                <p className='comments-para'>Cancel or edit order</p>
                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
              </div>
              <div className='comments'>
                <img src="/public/Images/faq-contact-comments.png" className='comment-img' alt="" />
                <p className='comments-para'>Contact Us</p>
                <p>Lorem Ipsum is simply dummy text of the printing and typesetting industry</p>
              </div>
            </>
          )}
        </div>
      </div>
      <div className="faq-section">
        {/* <img src="/Images/faq-mask.svg" className='mask-image' alt="" /> */}
        <h1 className='faq-heading'>Frequently asked <br /> questions!</h1>

        {categories.length > 0 ? (
          searchQuery.trim() ? (
            <div className="questian-section-wrapper">
              <h3 style={{marginBottom: '20px', color: '#333'}}>Search Results for "{searchQuery}"</h3>
              {filteredFaqs.length > 0 ? (
                filteredFaqs.map((item) => (
                  <FaqItem
                    key={item.id}
                    question={item.question}
                    answer={item.answer}
                    isExpanded={expandedItems[item.id] || false}
                    onToggle={() => toggleItem(item.id)}
                  />
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
                  No results found for "{searchQuery}".
                </div>
              )}
            </div>
          ) : (
            <>
              <div className="categories-wrapper">
                {categories.map((category) => (
                  <div
                    key={category}
                    className={`category-item ${activeCategory === category ? 'active-category' : ''}`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                  </div>
                ))}
              </div>
              <div className="questian-section-wrapper">
                {formattedFaqData[activeCategory]?.map((item) => (
                  <FaqItem
                    key={item.id}
                    question={item.question}
                    answer={item.answer}
                    isExpanded={expandedItems[item.id] || false}
                    onToggle={() => toggleItem(item.id)}
                  />
                ))}
              </div>
            </>
          )
        ) : (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#666',
            fontSize: '18px'
          }}>
            No FAQ categories available at the moment.
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

export default FaqSection