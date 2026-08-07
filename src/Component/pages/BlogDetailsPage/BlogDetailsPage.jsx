import { RiTwitterXLine } from 'react-icons/ri';
import Navbar from '../../common/Navbar/Navbar';
import './BlogDetailsPage.scss';
import { FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
// import { GoLink } from 'go-icons/go';
import { BsArrowLeftShort, BsArrowRightShort } from 'react-icons/bs';
import ScrollToTopOnMount from '../../common/ScrollToTopOnMount';
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RxDotFilled } from 'react-icons/rx';
import Footer from '../../common/Footer/Footer';
import useBlogs from '../../../store/hook/useBlogspost';
import parse from 'html-react-parser';
import 'react-quill/dist/quill.snow.css';
import { GoLink } from 'react-icons/go';

const BlogDetailsPage = () => {
  const { id } = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const { blogs, loading, error } = useBlogs();

  const blog = blogs.find((b) => b.id === id);

  useEffect(() => {
    console.log(blog, 'blogsss');
  }, [blog]);

  // Calculate pagination
  const totalPages = Math.ceil(blogs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentBlogs = blogs.slice(startIndex, endIndex);

  // Handle pagination
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;
  if (!blog) return <div>Blog not found!</div>;

  return (
    <div className='BlogDetailsPageMainWrapper'>
      <ScrollToTopOnMount />
      <Navbar />
      <div className="blog-details-content">
        <h1 className='blog-detail-heading'>{blog.title}</h1>

        <div className='blog-details-decription'>
          {blog.description ? parse(blog.description) : "No description available"}
        </div>

        <div className="auther-wrapper">
          <div className="auther-left">
            <div className="auther-image">
              <img src="/Images/dummy-user.svg" alt="" />
            </div>
            <div className="auther-name">
              <h6>{blog.addedByName || "Anonymous"}</h6>
              <p>Supply Chain Management Expert</p>
            </div>
          </div>
          <div className="auther-right">
            <div className="social-links"><RiTwitterXLine className='social-icon' /></div>
            <div className="social-links"><FaFacebookF className='social-icon' /></div>
            <div className="social-links"><FaLinkedinIn className='social-icon' /></div>
            <div className="social-links"><GoLink className='social-icon' /></div>
          </div>
        </div>

        <div className="banner">
          <img src={blog.imageUrl || "/Images/Blog-banner.svg"} alt={blog.title} />
        </div>

        <div className="blogs">
          <div className="blog-content ql-editor">
            {blog.content ? parse(blog.content) : <p>No content available</p>}
          </div>
        </div>
      </div>

      {/* Related Topic */}
      <div className="related-topic">
        <div className="related-topic-header">
          <h3>Related Topic</h3>
          <div className="arrows-wrapper">
            <div
              className="left-arrow"
              onClick={handlePrevPage}
              style={{
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                opacity: currentPage === 1 ? 0.5 : 1
              }}
            >
              <BsArrowLeftShort className='arrow' />
            </div>
            <div
              className="right-arrow"
              onClick={handleNextPage}
              style={{
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                opacity: currentPage === totalPages ? 0.5 : 1
              }}
            >
              <BsArrowRightShort className='arrow' />
            </div>
          </div>
        </div>

        <div className="blog-cards-wrapper">
          <div className="container-fluid">
            <div className="row">
              {currentBlogs.map((relatedBlog) => (
                <div key={relatedBlog.id} className="col-lg-4 col-md-6 col-sm-6 col-12">
                  <Link to={`/blog-details/${relatedBlog.id}`} className='blog-link'>
                    <div className="blog-card">
                      <div className="blog-image">
                        <img
                          src={relatedBlog.imageUrl || '/Images/default-blog-img.svg'}
                          alt={relatedBlog.title}
                        />
                      </div>
                      <div className="blog-content">
                        <div className="category">{relatedBlog.category || 'Uncategorized'}</div>
                        <h2 className="blog-title">{relatedBlog.title.slice(0,20)}</h2>
                        <h4 className="blog-description">
                          {relatedBlog.description
                            ? parse(
                              relatedBlog.description.length > 20
                                ? relatedBlog.description.slice(0, 50) + "..."
                                : relatedBlog.description
                            )
                            : "No description"}
                        </h4>
                        <h5 className="blogged-user">{relatedBlog.addedByName || 'Anonymous'}</h5>
                        <div className="date-wrapper">
                          <div className='date'>
                            {relatedBlog.createdAt
                              ? new Date(relatedBlog.createdAt).toLocaleDateString('en-US', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric'
                              })
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
      </div>
      <Footer />
    </div>
  );
};

export default BlogDetailsPage;