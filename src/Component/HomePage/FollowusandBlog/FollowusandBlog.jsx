import React, { useState, useEffect } from 'react'
import './FollowusandBlog.scss'
import ExploreBtn from '../../Theme/Button/ExploreBtn';
import { BsArrowUpRightCircleFill } from 'react-icons/bs';
import { Link } from 'react-router-dom';

const FollowusandBlog = () => {
  const [instagramPosts, setInstagramPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Instagram API Configuration
  const INSTAGRAM_CONFIG = {
    // You need to get these from Meta Developer Console
    ACCESS_TOKEN: 'YOUR_INSTAGRAM_ACCESS_TOKEN_HERE',
    USER_ID: 'YOUR_INSTAGRAM_USER_ID_HERE',
    // Alternative: you can also use a proxy service URL if you set one up
    PROXY_URL: 'YOUR_PROXY_SERVER_URL/instagram' // Optional
  };

  // Fallback images (your existing ones)
  const fallbackImages = [
    {
      id: 1,
      src: "./Images/follow-img1.png",
      alt: "Product 1"
    },
    {
      id: 2,
      src: "./Images/follow-img2.png",
      alt: "Product 2"
    },
    {
      id: 3,
      src: "./Images/Slide 4_3 - 4.png",
      alt: "Product 3"
    },
    {
      id: 4,
      src: "./Images/Slide 4_3 - 5.png",
      alt: "Product 4"
    },
    {
      id: 5,
      src: "./Images/follow-img-7.png",
      alt: "Product 5"
    },
    {
      id: 6,
      src: "./Images/follow-img-8.png",
      alt: "Product 6"
    }
  ];

  // Fetch Instagram posts
  // const fetchInstagramPosts = async () => {
  //   try {
  //     setLoading(true);

  //     // Method 1: Direct Instagram Graph API call (requires business account)
  //     if (INSTAGRAM_CONFIG.ACCESS_TOKEN && INSTAGRAM_CONFIG.USER_ID) {
  //       const response = await fetch(
  //         `https://graph.instagram.com/${INSTAGRAM_CONFIG.USER_ID}/media?fields=id,caption,media_type,media_url,thumbnail_url,permalink,timestamp&access_token=${INSTAGRAM_CONFIG.ACCESS_TOKEN}&limit=6`
  //       );

  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }

  //       const data = await response.json();

  //       if (data.error) {
  //         throw new Error(data.error.message);
  //       }

  //       const formattedPosts = data.data.map((post, index) => ({
  //         id: post.id,
  //         src: post.media_type === 'VIDEO' ? post.thumbnail_url : post.media_url,
  //         alt: post.caption ? post.caption.substring(0, 50) + '...' : `Instagram Post ${index + 1}`,
  //         link: post.permalink,
  //         caption: post.caption,
  //         mediaType: post.media_type,
  //         timestamp: post.timestamp
  //       }));

  //       setInstagramPosts(formattedPosts);
  //     } 
  //     // Method 2: Using a proxy server (recommended for production)
  //     else if (INSTAGRAM_CONFIG.PROXY_URL) {
  //       const response = await fetch(`${INSTAGRAM_CONFIG.PROXY_URL}?limit=6`);

  //       if (!response.ok) {
  //         throw new Error(`Proxy server error! status: ${response.status}`);
  //       }

  //       const data = await response.json();
  //       setInstagramPosts(data.posts || []);
  //     }
  //     // Method 3: Fallback to static images
  //     else {
  //       console.warn('Instagram API not configured, using fallback images');
  //       setInstagramPosts(fallbackImages);
  //     }

  //     setLoading(false);
  //   } catch (err) {
  //     console.error('Error fetching Instagram posts:', err);
  //     setError(err.message);
  //     // Use fallback images on error
  //     setInstagramPosts(fallbackImages);
  //     setLoading(false);
  //   }
  // };

  // Alternative method using Instagram embed
  // const getInstagramEmbedUrl = (postUrl) => {
  //   return `${postUrl}embed/`;
  // };

  // useEffect(() => {
  //   fetchInstagramPosts();
  // }, []);

  // Use Instagram posts if available, otherwise use fallback images
  const imagesToDisplay = instagramPosts.length > 0 ? instagramPosts : fallbackImages;

  return (
    <div className='FollowusandBlogWrapper'>
      <div className="container-fluid">
        <div className="head-section">
          <h3>Follow us</h3>
          <h2>stay fresh with <br />karikku moments</h2>
          {/* <p>At Karikku, our journey is deeply intertwined with the lush landscapes of Kerala, where coconuts flourish under nature's nurturing care. We are committed to delivering products that encapsulate the purity and richness of our homeland.</p> */}
          {/* <button>Explore our process  <BsArrowUpRightCircleFill className='btn-icon' /> </button> */}
        </div>

        <div className="marquee-container">
          {/* {loading && (
            <div className="loading-indicator" style={{ textAlign: 'center', padding: '2rem' }}>
              <p>Loading Instagram posts...</p>
            </div>
          )} */}

          {error && (
            <div className="error-indicator" style={{ textAlign: 'center', padding: '1rem', color: '#ff6b6b' }}>
            </div>
          )}

          <div className="marquee">
            <div className="marquee-content">
              {imagesToDisplay.map((image) => (
                <div key={image.id} className="marquee-item">
                  {image.link ? (
                    <a href={image.link} target="_blank" rel="noopener noreferrer">
                      <img
                        src={image.src}
                        alt={image.alt}
                        loading="lazy"
                        onError={(e) => {
                          // Fallback if Instagram image fails to load
                          e.target.src = fallbackImages[0].src;
                        }}
                      />
                      {image.mediaType === 'VIDEO' && (
                        <div className="video-overlay">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                    </a>
                  ) : (
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
            </div>
            {/* Duplicate content for seamless loop */}
            <div className="marquee-content" aria-hidden="true">
              {imagesToDisplay.map((image) => (
                <div key={`duplicate-${image.id}`} className="marquee-item">
                  {image.link ? (
                    <a href={image.link} target="_blank" rel="noopener noreferrer">
                      <img
                        src={image.src}
                        alt={image.alt}
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = fallbackImages[0].src;
                        }}
                      />
                      {image.mediaType === 'VIDEO' && (
                        <div className="video-overlay">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      )}
                    </a>
                  ) : (
                    <img
                      src={image.src}
                      alt={image.alt}
                      loading="lazy"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bottom-head-section">
          <h2>Join the karikku family</h2>
          <div className="bottom-para">
            <p>Be part of our community celebrating the purity and <br className="d-none d-md-block" /> richness of Kerala's coconuts.</p>
            <div className="link">
              <a href="https://instagram.com/KarikkuIndia" target="_blank" rel="noopener noreferrer">
                <h5>
                  <img src="/Images/insta-icon.svg" alt="" />
                  <span>KarikkuIndia</span>
                </h5>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FollowusandBlog