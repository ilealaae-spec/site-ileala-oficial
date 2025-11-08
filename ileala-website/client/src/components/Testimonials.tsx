import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface Testimonial {
  id: number;
  name: string;
  location: string;
  text: string;
  rating: number;
}

export default function Testimonials() {
  const { t } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const testimonials: Testimonial[] = t.testimonials.items as Testimonial[];

  useEffect(() => {
    // Simula carregamento inicial
    const loadingTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 1500);

    return () => clearTimeout(loadingTimeout);
  }, []);

  useEffect(() => {
    if (isLoading) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000); // Muda a cada 6 segundos

    return () => clearInterval(interval);
  }, [testimonials.length, isLoading]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const currentTestimonial = testimonials[currentIndex];

  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl md:text-5xl text-primary mb-4">
            {t.testimonials.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t.testimonials.subtitle}
          </p>
        </div>

        <div className="max-w-4xl mx-auto relative">
          {/* Quote Icon */}
          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-primary/10 rounded-full p-4">
              <Quote className="w-8 h-8 text-primary" />
            </div>
          </div>

          {/* Testimonial Card */}
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 relative overflow-hidden">
            {isLoading ? (
              /* Skeleton Loading */
              <div className="relative z-10 animate-pulse">
                {/* Stars Skeleton */}
                <div className="flex justify-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-5 h-5 bg-gray-200 rounded" />
                  ))}
                </div>

                {/* Text Skeleton */}
                <div className="space-y-3 mb-8">
                  <div className="h-6 bg-gray-200 rounded w-full" />
                  <div className="h-6 bg-gray-200 rounded w-5/6 mx-auto" />
                  <div className="h-6 bg-gray-200 rounded w-4/6 mx-auto" />
                </div>

                {/* Author Skeleton */}
                <div className="text-center space-y-2">
                  <div className="h-5 bg-gray-200 rounded w-32 mx-auto" />
                  <div className="h-4 bg-gray-200 rounded w-24 mx-auto" />
                </div>
              </div>
            ) : (
            <>
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12" />

            {/* Content */}
            <div className="relative z-10">
              {/* Stars */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < currentTestimonial.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-xl md:text-2xl text-gray-700 text-center mb-8 font-light leading-relaxed italic">
                "{currentTestimonial.text}"
              </p>

              {/* Author Info */}
              <div className="text-center">
                <p className="font-semibold text-lg text-gray-900">
                  {currentTestimonial.name}
                </p>
                <p className="text-gray-600">{currentTestimonial.location}</p>
              </div>
            </div>
            </>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-center gap-4 mt-8">
            <button
              onClick={goToPrevious}
              className="bg-white hover:bg-primary/10 rounded-full p-3 shadow-md transition-colors"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-6 h-6 text-primary" />
            </button>
            <button
              onClick={goToNext}
              className="bg-white hover:bg-primary/10 rounded-full p-3 shadow-md transition-colors"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-6 h-6 text-primary" />
            </button>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? 'bg-primary w-8'
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
