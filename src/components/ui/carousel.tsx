'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type CarouselContextProps = {
  scrollRef: React.RefObject<HTMLDivElement | null>;
  orientation: 'horizontal' | 'vertical';
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
};

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) throw new Error('useCarousel must be used within a <Carousel />');
  return context;
}

export function Carousel({
  orientation = 'horizontal',
  className,
  children,
  ...props
}: React.ComponentProps<'div'> & { orientation?: 'horizontal' | 'vertical' }) {
  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollPrev, setCanScrollPrev] = React.useState(false);
  const [canScrollNext, setCanScrollNext] = React.useState(true);

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      setCanScrollPrev(el.scrollLeft > 0 || el.scrollTop > 0);
      const isEnd =
        orientation === 'horizontal'
          ? el.scrollLeft + el.offsetWidth >= el.scrollWidth - 1
          : el.scrollTop + el.offsetHeight >= el.scrollHeight - 1;
      setCanScrollNext(!isEnd);
    }
  }, [orientation]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (el) {
      el.addEventListener('scroll', checkScroll);
      window.addEventListener('resize', checkScroll);
      return () => {
        el.removeEventListener('scroll', checkScroll);
        window.removeEventListener('resize', checkScroll);
      };
    }
  }, [checkScroll]);

  const scrollPrev = () => {
    scrollRef.current?.scrollBy({
      [orientation === 'horizontal' ? 'left' : 'top']: -scrollRef.current.offsetWidth,
      behavior: 'smooth'
    });
  };

  const scrollNext = () => {
    scrollRef.current?.scrollBy({
      [orientation === 'horizontal' ? 'left' : 'top']: scrollRef.current.offsetWidth,
      behavior: 'smooth'
    });
  };

  return (
    <CarouselContext.Provider value={{ scrollRef, orientation, scrollPrev, scrollNext, canScrollPrev, canScrollNext }}>
      <section
        aria-roledescription='carousel'
        className={cn('relative', className)}
        role='region'
        {...props}
      >
        {children}
      </section>
    </CarouselContext.Provider>
  );
}

export function CarouselContent({ className, ...props }: React.ComponentProps<'div'>) {
  const { scrollRef, orientation } = useCarousel();

  return (
    <div
      className={cn(
        'hide-scrollbar flex snap-both snap-mandatory overflow-auto scroll-smooth',
        orientation === 'vertical' ? 'h-full flex-col' : 'w-full flex-row',
        className
      )}
      ref={scrollRef}
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      {...props}
    />
  );
}

export function CarouselItem({ className, ...props }: React.ComponentProps<'fieldset'>) {
  return (
    <fieldset
      aria-roledescription='slide'
      className={cn('min-w-0 shrink-0 grow-0 basis-full snap-start', className)}
      role='group'
      {...props}
    />
  );
}

export function CarouselPrevious({
  className,
  variant = 'outline',
  size = 'icon',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { scrollPrev, canScrollPrev, orientation } = useCarousel();
  return (
    <Button
      className={cn(
        'absolute z-10 h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? 'top-1/2 -left-12 -translate-y-1/2'
          : '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        className
      )}
      disabled={!canScrollPrev}
      onClick={scrollPrev}
      size={size}
      variant={variant}
      {...props}
    >
      <ArrowLeft className='h-4 w-4' />
      <span className='sr-only'>Previous slide</span>
    </Button>
  );
}

export function CarouselNext({
  className,
  variant = 'outline',
  size = 'icon',
  ...props
}: React.ComponentProps<typeof Button>) {
  const { scrollNext, canScrollNext, orientation } = useCarousel();
  return (
    <Button
      className={cn(
        'absolute z-10 h-8 w-8 rounded-full',
        orientation === 'horizontal'
          ? 'top-1/2 -right-12 -translate-y-1/2'
          : '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
        className
      )}
      disabled={!canScrollNext}
      onClick={scrollNext}
      size={size}
      variant={variant}
      {...props}
    >
      <ArrowRight className='h-4 w-4' />
      <span className='sr-only'>Next slide</span>
    </Button>
  );
}
