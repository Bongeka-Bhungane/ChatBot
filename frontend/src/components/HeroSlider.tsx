import { useState, useEffect } from "react";
import "../HeroSlider.css";

import bg1 from "../assets/Mlab imgs/african-american-coder-employee-programming-busine-2021-12-09-02-41-56-utc.jpg.webp";
import bg2 from "../assets/Mlab imgs/digitall-empowered.jpg.webp";
import bg3 from "../assets/Mlab imgs/2.webp";
import bg4 from "../assets/Mlab imgs/african-man-enjoying-opportunities-of-virtual-real-2021-12-09-18-39-25-utc.webp";

const slides = [
  {
    title: "SUPPORTING PROMISING START-UP TO BECOME GREAT BUSINESSES",
    desc: "Registered Non-Profit (Mobile Applications Laboratory NPC) & Level 1 B-BBEE Skills & ESD Provider",
    image: bg1,
  },
  {
    title: "STIMULATING YOUTH ECOSYSTEMS",
    desc: "Registered Non-Profit (Mobile Applications Laboratory NPC) & Level 1 B-BBEE Skills & ESD Provider",
    image: bg2,
  },
  {
    title: "UPSKILLING THE NEXT GENERATION OF CODERS",
    desc: "Registered Non-Profit (Mobile Applications Laboratory NPC) & Level 1 B-BBEE Skills & ESD Provider",
    image: bg3,
  },
  {
    title: "TOWARDS A DIGITALLY EMPOWERED TOMORROW",
    desc: "Registered Non-Profit (Mobile Applications Laboratory NPC) & Level 1 B-BBEE Skills & ESD Provider",
    image: bg4,
  },
];

const sliderData = [slides[slides.length - 1], ...slides, slides[0]];

export default function HeroSlider() {
  const [index, setIndex] = useState(1);
  const [transition, setTransition] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => prev + 1);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (index === sliderData.length - 1) {
      setTimeout(() => {
        setTransition(false);
        setIndex(1);
      }, 800);
    }

    if (index === 0) {
      setTimeout(() => {
        setTransition(false);
        setIndex(slides.length);
      }, 800);
    }
  }, [index]);

  useEffect(() => {
    if (!transition) {
      requestAnimationFrame(() => setTransition(true));
    }
  }, [transition]);

  // Arrow button handlers
  const nextSlide = () => {
    setIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    setIndex((prev) => prev - 1);
  };

  return (
    <div className="hero-slider">
      <div
        className="slider-track"
        style={{
          transform: `translateX(-${index * 100}%)`,
          transition: transition ? "0.8s ease-in-out" : "none",
        }}
      >
        {sliderData.map((slide, i) => (
          <div
            key={i}
            className="hero-slide"
            style={{
              backgroundImage: `linear-gradient(
        to bottom right,
        #1d4f5add 0% 50%,
        rgba(0, 100, 0, 0.7) 90% 100%
      ), url(${slide.image})`,
            }}
          >
            <div className="hero-overlay"></div>
            <div className="hero-content">
              <h1>{slide.title}</h1>
              <p>{slide.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Arrow Buttons */}
      <button className="arrow left" onClick={prevSlide}>
        ❮
      </button>
      <button className="arrow right" onClick={nextSlide}>
        ❯
      </button>
    </div>
  );
}
