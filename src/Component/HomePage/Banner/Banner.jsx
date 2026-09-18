import React, { useEffect, useRef } from 'react';
import './Banner.scss';
import useBanner from '../../../store/hook/HomePageHooks/useBanner';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

const Banner = () => {
  const { banners, loading, error } = useBanner();
  const sliderRef = useRef(null);

  useEffect(() => {
    console.log('Ordered banners from Redux:', banners);
  }, [banners]);

  if (loading && (!banners || banners.length === 0)) {
    return (
      <div className="BannerMainWrapper">
        <div className="banner-sub-wrapper">
          <div className="banner-skeleton" />
        </div>
      </div>
    );
  }

  if (error) return <p className="banner-error">Error loading banners: {error}</p>;
  if (!banners || banners.length === 0) return null;

  const settings = {
    dots: banners.length > 1,
    infinite: banners.length > 1,
    speed: 1000,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: banners.length > 1,
    autoplaySpeed: 3500,
    arrows: false,
    pauseOnHover: false,
    pauseOnFocus: false,
    pauseOnDotsHover: false,
    waitForAnimate: false,
    fade: true,
    cssEase: 'cubic-bezier(0.4, 0, 0.2, 1)',
    dotsClass: 'slick-dots custom-dots',
    initialSlide: 0
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
            {banners[0].title && (
              <div className="banner-txt">
                <h1>{banners[0].title}</h1>
              </div>
            )}
          </div>
        ) : (
          <Slider ref={sliderRef} {...settings}>
            {banners.map((banner, index) => (
              <div className="banner-img" key={banner._id || banner.id || index}>
                <img
                  src={banner.imageUrl}
                  alt={banner.title || 'Banner'}
                />
                {banner.title && (
                  <div className="banner-txt">
                    <h1>{banner.title}</h1>
                  </div>
                )}
              </div>
            ))}
          </Slider>
        )}
      </div>
    </div>
  );
};

export default Banner;