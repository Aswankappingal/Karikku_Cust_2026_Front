import React, { useEffect, useRef, useState } from "react";
import './OneDrop.scss';

const OneDrop = () => {
  const sectionRef = useRef(null);
  const bottleRef = useRef(null);
  const coconutRef = useRef(null);
  const vectorFlowerRef = useRef(null);
  const vector1Ref = useRef(null);
  const oilSectionRef = useRef(null);
  const oilBottleRef = useRef(null);
  const oilPouchRef = useRef(null);
  const oilCoconutRef = useRef(null);
  const oilVector1Ref = useRef(null);
  const oilVector2Ref = useRef(null);
  const oilPlantRef = useRef(null);
  const [scrollY, setScrollY] = useState(0);
  const [sectionInView, setSectionInView] = useState(false);
  const [sectionOffset, setSectionOffset] = useState(0);
  const [oilSectionInView, setOilSectionInView] = useState(false);
  const [oilSectionOffset, setOilSectionOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);

  useEffect(() => {
    // Check screen size
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsTablet(window.innerWidth > 768 && window.innerWidth <= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    // Add smooth transitions to animated elements
    const addSmoothTransitions = () => {
      // Reduce transition duration for mobile for better performance
      const transitionDuration = isMobile ? '0.05s' : '0.1s';

      if (bottleRef.current) {
        bottleRef.current.style.transition = `transform ${transitionDuration} ease-out`;
      }
      if (coconutRef.current) {
        coconutRef.current.style.transition = `transform ${transitionDuration} ease-out`;
      }
      if (vectorFlowerRef.current) {
        vectorFlowerRef.current.style.transition = `transform ${transitionDuration} ease-out`;
      }
      if (vector1Ref.current) {
        vector1Ref.current.style.transition = `transform ${transitionDuration} ease-out`;
      }
      if (oilBottleRef.current) {
        oilBottleRef.current.style.transition = `transform ${transitionDuration} ease-out`;
      }
      if (oilPouchRef.current) {
        oilPouchRef.current.style.transition = `transform ${transitionDuration} ease-out, z-index ${transitionDuration} ease-out`;
      }
      if (oilCoconutRef.current) {
        oilCoconutRef.current.style.transition = `transform ${transitionDuration} ease-out`;
      }
      if (oilVector1Ref.current) {
        oilVector1Ref.current.style.transition = `transform ${transitionDuration} ease-out`;
      }
      if (oilVector2Ref.current) {
        oilVector2Ref.current.style.transition = `transform ${transitionDuration} ease-out`;
      }
      if (oilPlantRef.current) {
        oilPlantRef.current.style.transition = `transform ${transitionDuration} ease-out`;
      }
    };

    // Function to check if section is in viewport
    const checkIfSectionInView = () => {
      if (sectionRef.current) {
        const rect = sectionRef.current.getBoundingClientRect();
        const isInView =
          rect.top <= window.innerHeight &&
          rect.bottom >= 0;

        setSectionInView(isInView);

        // Store the section's offset from the top of the page
        const offset = window.scrollY + rect.top;
        setSectionOffset(offset);
      }
    };

    // Function to check if oil-section is in viewport
    const checkIfOilSectionInView = () => {
      if (oilSectionRef.current) {
        const rect = oilSectionRef.current.getBoundingClientRect();
        const isInView =
          rect.top <= window.innerHeight &&
          rect.bottom >= 0;

        setOilSectionInView(isInView);

        // Store the oil-section's offset from the top of the page
        const offset = window.scrollY + rect.top;
        setOilSectionOffset(offset);
      }
    };

    // Function to handle scroll events with throttling for smoother performance
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setScrollY(currentScrollY);

          // Check if sections are in view
          checkIfSectionInView();
          checkIfOilSectionInView();

          // Apply animations for all screen sizes with different intensity
          if (sectionInView) {
            // Get relative scroll position within the section
            const relativeScroll = Math.max(0, currentScrollY - sectionOffset);

            // Adjust animation factors based on screen size
            let animationScale = 1;
            if (isMobile) {
              animationScale = 0.4; // Reduced animation intensity for mobile
            } else if (isTablet) {
              animationScale = 0.7; // Medium animation intensity for tablet
            }

            // Apply transformations to bottle image with device-specific factors
            if (bottleRef.current) {
              const bottleRotationFactor = 0.015 * animationScale;
              const bottleScaleFactor = 0.0003 * animationScale;
              const bottleTranslationFactor = 0.12 * animationScale;

              const bottleRotation = -5 + (relativeScroll * bottleRotationFactor);
              const bottleScale = Math.min(1.5, 1 + (relativeScroll * bottleScaleFactor));
              const bottleTranslation = relativeScroll * bottleTranslationFactor;

              bottleRef.current.style.transform = `translateX(${bottleTranslation}px) rotate(${bottleRotation}deg) scale(${bottleScale})`;
            }

            // Apply transformations to coconut image with device-specific logic
            if (coconutRef.current) {
              if (isMobile) {
                // Mobile-specific coconut animation
                const mobileCoconutRotationFactor = -0.02; // Different rotation for mobile
                const mobileCoconutScaleFactor = 0.0005; // Different scale for mobile
                const mobileCoconutTranslationYFactor = -0.15; // More vertical movement for mobile
                const mobileCoconutTranslationXFactor = 0.08; // Add horizontal movement for mobile

                const mobileCoconutRotation = -30 + (relativeScroll * mobileCoconutRotationFactor);
                const mobileCoconutScale = Math.min(1.3, 1 + (relativeScroll * mobileCoconutScaleFactor));
                const mobileCoconutTranslationY = relativeScroll * mobileCoconutTranslationYFactor;
                const mobileCoconutTranslationX = relativeScroll * mobileCoconutTranslationXFactor;

                coconutRef.current.style.transform = `translateX(${mobileCoconutTranslationX}px) translateY(${mobileCoconutTranslationY}px) rotate(${mobileCoconutRotation}deg) scale(${mobileCoconutScale})`;
              } else {
                // Desktop/tablet animation (unchanged from original)
                const coconutRotationFactor = -0.03 * animationScale;
                const coconutScaleFactor = 0.0003 * animationScale;
                const coconutTranslationYFactor = -0.08 * animationScale;

                const coconutRotation = -50 + (relativeScroll * coconutRotationFactor);
                const coconutScale = Math.min(1.5, 1 + (relativeScroll * coconutScaleFactor));
                const coconutTranslationY = relativeScroll * coconutTranslationYFactor;

                coconutRef.current.style.transform = `translateY(${coconutTranslationY}px) rotate(${coconutRotation}deg) scale(${coconutScale})`;
              }
            }

            // Apply transformations to vector-flower image with device-specific factors
            if (vectorFlowerRef.current) {
              const vectorFlowerTranslationFactor = 0.06 * animationScale;
              const vectorFlowerTranslation = relativeScroll * vectorFlowerTranslationFactor;
              vectorFlowerRef.current.style.transform = `translateX(${vectorFlowerTranslation}px)`;
            }

            // Apply transformations to vector1 image with device-specific factors
            if (vector1Ref.current) {
              const vector1TranslationFactor = -0.06 * animationScale;
              const vector1Translation = relativeScroll * vector1TranslationFactor;
              vector1Ref.current.style.transform = `translateX(${vector1Translation}px)`;
            }
          }

          // Apply animations to oil-section when it's in view for all devices
          if (oilSectionInView) {
            const relativeOilScroll = Math.max(0, currentScrollY - oilSectionOffset);

            // Adjust animation scale for different devices
            let animationScale = 1;
            if (isMobile) {
              animationScale = 0.6; // Increased from 0.4 to 0.6 for more visible animations on mobile
            } else if (isTablet) {
              animationScale = 0.7; // Medium animation intensity for tablet
            }

            // Apply transformations to oil-bottle image
            if (oilBottleRef.current) {
              if (isMobile) {
                // Enhanced mobile-specific oil bottle animation
                const oilBottleTranslationYFactor = -0.12 * animationScale;
                const oilBottleTranslationXFactor = 0.05 * animationScale;
                const oilBottleRotationFactor = -0.025 * animationScale;
                const oilBottleScaleFactor = 0.0008 * animationScale;

                const oilBottleTranslationY = relativeOilScroll * oilBottleTranslationYFactor;
                const oilBottleTranslationX = relativeOilScroll * oilBottleTranslationXFactor;
                const oilBottleRotation = relativeOilScroll * oilBottleRotationFactor;
                const oilBottleScale = Math.min(1.4, 1 + (relativeOilScroll * oilBottleScaleFactor));

                oilBottleRef.current.style.transform = `translateX(${oilBottleTranslationX}px) translateY(${oilBottleTranslationY}px) rotate(${oilBottleRotation}deg) scale(${oilBottleScale})`;
              } else {
                // Desktop/tablet animation
                const oilBottleTranslationYFactor = -0.08 * animationScale;
                const oilBottleRotationFactor = -0.015 * animationScale;

                const oilBottleTranslationY = relativeOilScroll * oilBottleTranslationYFactor;
                const oilBottleRotation = relativeOilScroll * oilBottleRotationFactor;

                oilBottleRef.current.style.transform = `translateY(${oilBottleTranslationY}px) rotate(${oilBottleRotation}deg)`;
              }
            }

            // Apply transformations to oil-coconut image
            if (oilCoconutRef.current) {
              if (isMobile) {
                // Enhanced mobile-specific oil coconut animation
                const oilCoconutRotationFactor = 0.08 * animationScale;
                const oilCoconutScaleFactor = 0.0008 * animationScale;
                const oilCoconutTranslationYFactor = -0.05 * animationScale;
                const oilCoconutTranslationXFactor = 0.03 * animationScale;

                const oilCoconutRotation = relativeOilScroll * oilCoconutRotationFactor;
                const oilCoconutScale = Math.min(1.4, 1 + (relativeOilScroll * oilCoconutScaleFactor));
                const oilCoconutTranslationY = relativeOilScroll * oilCoconutTranslationYFactor;
                const oilCoconutTranslationX = relativeOilScroll * oilCoconutTranslationXFactor;

                oilCoconutRef.current.style.transform = `translateX(${oilCoconutTranslationX}px) translateY(${oilCoconutTranslationY}px) rotate(${oilCoconutRotation}deg) scale(${oilCoconutScale})`;
              } else {
                // Desktop/tablet animation
                const oilCoconutRotationFactor = 0.05 * animationScale;
                const oilCoconutScaleFactor = 0.0005 * animationScale;
                const oilCoconutTranslationYFactor = -0.03 * animationScale;

                const oilCoconutRotation = relativeOilScroll * oilCoconutRotationFactor;
                const oilCoconutScale = Math.min(1.3, 1 + (relativeOilScroll * oilCoconutScaleFactor));
                const oilCoconutTranslationY = relativeOilScroll * oilCoconutTranslationYFactor;

                oilCoconutRef.current.style.transform = `translateY(${oilCoconutTranslationY}px) rotate(${oilCoconutRotation}deg) scale(${oilCoconutScale})`;
              }
            }

            // Apply transformations to oil-pouch image
            if (oilPouchRef.current) {
              if (isMobile) {
                // Enhanced mobile-specific oil pouch animation
                const pouchScaleFactor = 0.0012 * animationScale;
                const pouchTranslationYFactor = -0.08 * animationScale;
                const pouchTranslationXFactor = 0.05 * animationScale;
                const pouchRotationFactor = -0.06 * animationScale;

                const maxScrollForPouch = 300; // Reduced for mobile
                const scrollProgress = Math.min(relativeOilScroll / maxScrollForPouch, 1);

                const pouchScale = 0.7 + (scrollProgress * 0.9);
                const pouchTranslationY = relativeOilScroll * pouchTranslationYFactor;
                const pouchTranslationX = relativeOilScroll * pouchTranslationXFactor;
                const pouchRotation = relativeOilScroll * pouchRotationFactor;

                const zIndex = scrollProgress >= 0.25 ? 10 : 1;

                oilPouchRef.current.style.transform = `translateX(${pouchTranslationX}px) translateY(${pouchTranslationY}px) rotate(${pouchRotation}deg) scale(${pouchScale})`;
                oilPouchRef.current.style.zIndex = zIndex;
              } else {
                // Desktop/tablet animation
                const pouchScaleFactor = 0.0008 * animationScale;
                const pouchTranslationYFactor = -0.05 * animationScale;
                const pouchTranslationXFactor = 0.03 * animationScale;
                const pouchRotationFactor = -0.04 * animationScale;

                const maxScrollForPouch = isTablet ? 600 : 800;
                const scrollProgress = Math.min(relativeOilScroll / maxScrollForPouch, 1);

                const pouchScale = 0.7 + (scrollProgress * 0.8);
                const pouchTranslationY = relativeOilScroll * pouchTranslationYFactor;
                const pouchTranslationX = relativeOilScroll * pouchTranslationXFactor;
                const pouchRotation = relativeOilScroll * pouchRotationFactor;

                const zIndex = scrollProgress >= 0.3 ? 10 : 1;

                oilPouchRef.current.style.transform = `translateX(${pouchTranslationX}px) translateY(${pouchTranslationY}px) rotate(${pouchRotation}deg) scale(${pouchScale})`;
                oilPouchRef.current.style.zIndex = zIndex;
              }
            }

            // Apply transformations to oil-vector-1 image
            if (oilVector1Ref.current) {
              if (isMobile) {
                // Enhanced mobile-specific oil vector 1 animation
                const oilVector1TranslationXFactor = -0.12 * animationScale;
                const oilVector1TranslationYFactor = -0.03 * animationScale;
                const oilVector1RotationFactor = 0.02 * animationScale;

                const oilVector1TranslationX = relativeOilScroll * oilVector1TranslationXFactor;
                const oilVector1TranslationY = relativeOilScroll * oilVector1TranslationYFactor;
                const oilVector1Rotation = relativeOilScroll * oilVector1RotationFactor;

                oilVector1Ref.current.style.transform = `translateX(${oilVector1TranslationX}px) translateY(${oilVector1TranslationY}px) rotate(${oilVector1Rotation}deg)`;
              } else {
                // Desktop/tablet animation
                const oilVector1TranslationFactor = -0.08 * animationScale;
                const oilVector1Translation = relativeOilScroll * oilVector1TranslationFactor;
                oilVector1Ref.current.style.transform = `translateX(${oilVector1Translation}px)`;
              }
            }

            // Apply transformations to oil-vector-2 image
            if (oilVector2Ref.current) {
              if (isMobile) {
                // Enhanced mobile-specific oil vector 2 animation
                const oilVector2TranslationXFactor = 0.12 * animationScale;
                const oilVector2TranslationYFactor = -0.04 * animationScale;
                const oilVector2RotationFactor = -0.02 * animationScale;

                const oilVector2TranslationX = relativeOilScroll * oilVector2TranslationXFactor;
                const oilVector2TranslationY = relativeOilScroll * oilVector2TranslationYFactor;
                const oilVector2Rotation = relativeOilScroll * oilVector2RotationFactor;

                oilVector2Ref.current.style.transform = `translateX(${oilVector2TranslationX}px) translateY(${oilVector2TranslationY}px) rotate(${oilVector2Rotation}deg)`;
              } else {
                // Desktop/tablet animation
                const oilVector2TranslationFactor = 0.08 * animationScale;
                const oilVector2Translation = relativeOilScroll * oilVector2TranslationFactor;
                oilVector2Ref.current.style.transform = `translateX(${oilVector2Translation}px)`;
              }
            }

            // Apply transformations to oil-plant image
            if (oilPlantRef.current) {
              if (isMobile) {
                // Enhanced mobile-specific oil plant animation
                const oilPlantTranslationXFactor = -0.15 * animationScale;
                const oilPlantTranslationYFactor = -0.06 * animationScale;
                const oilPlantRotationFactor = 0.03 * animationScale;
                const oilPlantScaleFactor = 0.0006 * animationScale;

                const oilPlantTranslationX = relativeOilScroll * oilPlantTranslationXFactor;
                const oilPlantTranslationY = relativeOilScroll * oilPlantTranslationYFactor;
                const oilPlantRotation = relativeOilScroll * oilPlantRotationFactor;
                const oilPlantScale = Math.min(1.3, 1 + (relativeOilScroll * oilPlantScaleFactor));

                oilPlantRef.current.style.transform = `translateX(${oilPlantTranslationX}px) translateY(${oilPlantTranslationY}px) rotate(${oilPlantRotation}deg) scale(${oilPlantScale})`;
              } else {
                // Desktop/tablet animation
                const oilPlantTranslationFactor = -0.1 * animationScale;
                const oilPlantTranslation = relativeOilScroll * oilPlantTranslationFactor;
                oilPlantRef.current.style.transform = `translateX(${oilPlantTranslation}px)`;
              }
            }
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    // Use passive scroll listener and throttle for mobile performance
    const scrollOptions = { passive: true };

    // For mobile, use a slightly throttled version
    if (isMobile) {
      let mobileScrollTimeout;
      const throttledMobileScroll = () => {
        if (mobileScrollTimeout) return;
        mobileScrollTimeout = setTimeout(() => {
          handleScroll();
          mobileScrollTimeout = null;
        }, 8); // 8ms throttle for mobile (roughly 120fps)
      };
      window.addEventListener('scroll', throttledMobileScroll, scrollOptions);

      // Cleanup for mobile
      return () => {
        window.removeEventListener('scroll', throttledMobileScroll);
        window.removeEventListener('resize', checkScreenSize);
        if (mobileScrollTimeout) {
          clearTimeout(mobileScrollTimeout);
        }
      };
    } else {
      // For tablet and desktop, use the original implementation
      window.addEventListener('scroll', handleScroll, scrollOptions);

      // Cleanup for tablet/desktop
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', checkScreenSize);
      };
    }

    // Initial setup
    addSmoothTransitions();
    checkIfSectionInView();
    checkIfOilSectionInView();
    handleScroll();

  }, [sectionInView, sectionOffset, oilSectionInView, oilSectionOffset, isMobile, isTablet]);

  return (
    <div className='OneDropMain' ref={sectionRef}>
      <div className="vector">
        <img src="./Images/Vector.png" alt="" />
      </div>
      <div className="one-drop">
        <div className="one-drop-head">
          <h3>One drop</h3>
          <h2>
            Start your day with <br className="d-none d-md-block" /> natural vitality!
          </h2>
        </div>
        <div className="one-drop-image">
          <img
            className="vector1"
            src="./Images/green-vector.svg"
            alt="vector"
            ref={vector1Ref}
          />
          <img
            className="vector-flower"
            src="./Images/vector-flower.svg"
            alt="flower"
            ref={vectorFlowerRef}
          />
          <img className="flower-1" src="./Images/f1.svg" alt="" />
          <img
            className="coconut"
            src="./Images/coconut.svg"
            alt=""
            ref={coconutRef}
          />
          <img
            className="bottle"
            src="./Images/bottle.png"
            alt=""
            ref={bottleRef}
            style={{ transform: 'rotate(-5deg)' }}
          />
          <img className="flower-2" src="./Images/f2.svg" alt="white-flower" />
          <img className="flower-3" src="./Images/f3.svg" alt="" />
        </div>
      </div>
      <div className="oil-section" ref={oilSectionRef}>
        <img className="green-leaf" src="./Images/img_greenleafe.svg" alt="" />
        <div className="oil-section-head">
          <h2>
            Start your day with <br className="d-none d-md-block" /> natural vitality!
          </h2>
        </div>
        <div className="oil-images">
          <img className="oil-f1" src="./Images/oil-f1.png" alt="" />
          <img className="oil-f2" src="./Images/oil-f2.png" alt="" />
          <img
            className="oil-vector-1"
            src="./Images/oil-vector-1.png"
            alt=""
            ref={oilVector1Ref}
          />
          <img
            className="oil-vector-2"
            src="./Images/oil-vector-2.png"
            alt=""
            ref={oilVector2Ref}
          />
          <img
            className="oil-plant"
            src="./Images/oil-plant.png"
            alt=""
            ref={oilPlantRef}
          />
          <img
            className="oil-bottle"
            src="./Images/oil-bottle.svg"
            alt=""
            ref={oilBottleRef}
          />
          <img
            className="coconut"
            src="./Images/oil-coconut.png"
            alt=""
            ref={oilCoconutRef}
            style={{ zIndex: 5 }}
          />
          <img
            className="oil-pouch"
            src="./Images/oil-pouch.svg"
            alt=""
            ref={oilPouchRef}
            style={{
              zIndex: 1,
              transform: 'scale(0.7)'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default OneDrop;