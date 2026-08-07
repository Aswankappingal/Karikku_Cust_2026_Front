import React, { useEffect } from 'react';
import './Banner.scss';
import useBanner from '../../../store/hook/HomePageHooks/useBanner';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Banner = () => {
  const { banners, loading, error } = useBanner();

  useEffect(() => {
    console.log('Ordered banners from Redux:', banners);
  }, [banners]);

  if (loading) return <p>Loading banners...</p>;
  if (error) return <p>Error loading banners: {error}</p>;
  if (!banners || banners.length === 0) return <p>No banners available</p>;

  const settings = {
    dots: banners.length > 1,
    infinite: banners.length > 1, // keep infinite only if multiple banners
    speed: 800,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: banners.length > 1,
    autoplaySpeed: 4000,
    arrows: false,
    pauseOnHover: true,
    adaptiveHeight: false,
    fade: false,
    cssEase: 'ease-in-out',
    dotsClass: 'slick-dots custom-dots',
    initialSlide: 0   // ✅ always start from first banner
  };

  return (
    <div className="BannerMainWrapper">
      <div className="banner-sub-wrapper">

        {banners.length === 1 ? (
          <div className="banner-img">
            <img
              src={banners[0].imageUrl}
              alt={banners[0].title || 'Banner'}
            />
            <div className="banner-txt">
              <h1>{banners[0].title}</h1>
            </div>
          </div>
        ) : (
          <Slider
            key={banners.map(b => b.id).join('-')} // ✅ force proper re-render
            {...settings}
          >
            {banners.map((banner) => (
              <div className="banner-img" key={banner.id}>
                <img
                  src={banner.imageUrl}
                  alt={banner.title || 'Banner'}
                />
                <div className="banner-txt">
                  <h1>{banner.title}</h1>
                </div>
              </div>
            ))}
          </Slider>
        )}

      </div>
    </div>
  );
};

export default Banner;