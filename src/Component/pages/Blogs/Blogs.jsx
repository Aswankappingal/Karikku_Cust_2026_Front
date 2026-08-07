import { useEffect, useState } from 'react';
import { RxDotFilled } from 'react-icons/rx';
import { LuMinus } from 'react-icons/lu';
import { FiPlus } from 'react-icons/fi';
import Navbar from '../../common/Navbar/Navbar';
import './Blogs.scss';
import { BsArrowLeftShort, BsArrowRightShort } from 'react-icons/bs';
import { Link } from 'react-router-dom';
import Footer from '../../common/Footer/Footer';
import ScrollToTopOnMount from '../../common/ScrollToTopOnMount';
import useBlogs from '../../../store/hook/useBlogspost';
import parse from 'html-react-parser';   // ✅ added
import { LinearProgress } from '@mui/material';

const StaticFaqItem = ({ question, answer, isExpanded, onToggle }) => {
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

const Blogs = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    const {
        blogs,
        filteredBlogs,
        loading,
        error,
    } = useBlogs();

    const [staticExpandedItems, setStaticExpandedItems] = useState({});
    const [activeCategory, setActiveCategory] = useState('Sales FAQ');
    const [showMore, setShowMore] = useState(false);

    const staticCategories = [
        { id: 1, name: 'Sales FAQ' },
        { id: 2, name: 'My Account' },
        { id: 3, name: 'Payments & Delivery Services' },
        { id: 4, name: 'Post Delivery Services' },
        { id: 5, name: 'Payments' }
    ];

    const staticFaqData = {
        'Sales FAQ': [
            {
                id: 'sales-1',
                question: 'What is Try and Buy Service?',
                answer: 'At Karikku, our journey is deeply intertwined with the lush landscapes of Kerala, where coconuts flourish under natures nurturing care We are committed to delivering products that encapsulate the purity and richness of our homeland.'
            },
            {
                id: 'sales-2',
                question: 'Where’s my order?',
                answer: 'Yes, we offer attractive bulk discounts for orders above certain quantities. Contact our sales team for customized pricing based on your requirements.'
            },
            {
                id: 'sales-3',
                question: 'Personal Confidential Informmation?',
                answer: 'Yes, we offer attractive bulk discounts for orders above certain quantities. Contact our sales team for customized pricing based on your requirements.'
            },
              {
                id: 'sales-4',
                question: 'Personal Confidential Informmation?',
                answer: 'Yes, we offer attractive bulk discounts for orders above certain quantities. Contact our sales team for customized pricing based on your requirements.'
            }
        ],
        'My Account': [
            {
                id: 'account-1',
                question: 'How do I create an account?',
                answer: 'You can create an account by clicking the "Sign Up" button on our website and filling in your basic details. You\'ll receive a verification email to activate your account.'
            },
            {
                id: 'account-2',
                question: 'How do I reset my password?',
                answer: 'Click on "Forgot Password" on the login page, enter your registered email address, and we\'ll send you a password reset link.'
            }
        ],
        'Payments & Delivery Services': [
            {
                id: 'payment-1',
                question: 'What payment methods do you accept?',
                answer: 'We accept all major credit cards, debit cards, UPI payments, net banking, and cash on delivery for eligible areas.'
            },
            {
                id: 'payment-2',
                question: 'How does home delivery work?',
                answer: 'We offer convenient home delivery service across major cities. Simply place your order online, and our delivery team will bring fresh coconut water directly to your doorstep within 24-48 hours. Free delivery is available for orders above a certain amount.'
            }
        ]
    };


    const handleCategoryClick = (categoryName) => {
        setActiveCategory(categoryName);
        setStaticExpandedItems({});
        setShowMore(false);
    };

    const toggleStaticItem = (itemId) => {
        setStaticExpandedItems(prev => ({
            ...prev,
            [itemId]: !prev[itemId]
        }));
    };

    const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

    const handlePrevPage = () => {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
    };

    const handleNextPage = () => {
        if (currentPage < totalPages) setCurrentPage(currentPage + 1);
    };

    if (loading) return <div><LinearProgress color="success" /></div>;
    if (error) return <div>{error}</div>;

    return (
        <div className='BlogsMainWrapper'>
            <ScrollToTopOnMount />
            <Navbar />
            <div className="blogs-content">
                <div className='blog-header'>
                    <h1>Our Blogs</h1>
                </div>
                <div className="blog-cards-wrapper">
                    <div className="container-fluid">
                        <div className="row">
                            {currentBlogs.map((blog) => (
                                <div key={blog.id} className="col-lg-4 col-md-6 col-sm-6 col-12">
                                    <Link to={`/blog-details/${blog.id}`} className='blog-link'>
                                        <div className="blog-card">
                                            <div className="blog-image">
                                                <img
                                                    src={blog.imageUrl && blog.imageUrl.length > 0 ? blog.imageUrl : '/Images/default-blog-img.svg'}
                                                    alt={blog.title}
                                                />
                                            </div>
                                            <div className="blog-content">
                                                <div className="category">{blog.category || 'Uncategorized'}</div>
                                                <h2 className="blog-title">{blog.title}</h2>

                                                {/* ✅ Use parse to render HTML preview */}
                                                <h4 className="blog-description">
                                                    {blog.description ? parse(blog.description) : "No content available"}
                                                </h4>

                                                <h5 className="blogged-user">{blog.addedByName || 'Anonymous'}</h5>
                                                <div className="date-wrapper">
                                                    <div className='date'>
                                                        {blog.createdAt
                                                            ? new Date(blog.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })
                                                            : 'N/A'}
                                                    </div>
                                                    <div><RxDotFilled className='dot-icon' /></div>
                                                    <div className='time'>10 Mins read</div>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="arrows-wrapper">
                    <div
                        className="left-arrow"
                        onClick={handlePrevPage}
                        style={{ cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1 }}
                    >
                        <BsArrowLeftShort className='arrow' />
                    </div>
                    <div
                        className="right-arrow"
                        onClick={handleNextPage}
                        style={{ cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1 }}
                    >
                        <BsArrowRightShort className='arrow' />
                    </div>
                </div>
            </div>

            {/* FAQ Section unchanged */}
            <div className="faq-section">
                <img src="/Images/faq-mask.svg" className="mask-image" alt="" />
                <h1 className="faq-heading">
                    Frequently asked <br /> questions!
                </h1>

                <div className="categories-wrapper">
                    {staticCategories.map((category) => (
                        <div
                            key={category.id}
                            className={`category-item ${activeCategory === category.name ? 'active-category' : ''}`}
                            onClick={() => handleCategoryClick(category.name)}
                        >
                            {category.name}
                        </div>
                    ))}
                </div>

                <div className="questian-section-wrapper">
                    {(showMore 
                        ? staticFaqData[activeCategory] 
                        : staticFaqData[activeCategory]?.slice(0, 3)
                    )?.map((item) => (
                        <StaticFaqItem
                            key={item.id}
                            question={item.question}
                            answer={item.answer}
                            isExpanded={staticExpandedItems[item.id] || false}
                            onToggle={() => toggleStaticItem(item.id)}
                        />
                    ))}
                </div>

                {staticFaqData[activeCategory]?.length > 3 && (
                    <div className="view-more-btn-wrapper">
                        <button onClick={() => setShowMore(prev => !prev)}>
                            {showMore ? 'View Less' : 'View More'}
                        </button>
                    </div>
                )}
            </div>

            <Footer />
        </div>
    );
};

export default Blogs;



