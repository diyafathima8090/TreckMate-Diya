'use client';

import React from 'react';
import NextLink from 'next/link';
import { useRouter, usePathname, useSearchParams as nextUseSearchParams, useParams as nextUseParams } from 'next/navigation';

// 1. Link Component
export const Link = React.forwardRef(({ to, children, ...props }: any, ref: any) => {
  // If there's an active location state mapping or other props, we can map them
  // next/link expects 'href' instead of 'to'
  return (
    <NextLink href={to || '#'} ref={ref} {...props}>
      {children}
    </NextLink>
  );
});

Link.displayName = 'Link';

// 2. useNavigate Hook
export const useNavigate = () => {
  const router = useRouter();
  
  return (to: any, options?: any) => {

    if (to === -1) {
      router.back();
      return;
    }

    let target = to;
    if (options?.state) {
      // Serialize state into search params for compatibility
      const params = new URLSearchParams();
      Object.entries(options.state).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          params.append(`_state_${key}`, typeof val === 'object' ? JSON.stringify(val) : String(val));
        }
      });
      const queryString = params.toString();
      if (queryString) {
        target = `${to}${to.includes('?') ? '&' : '?'}${queryString}`;
      }
    }

    if (options?.replace) {
      router.replace(target);
    } else {
      router.push(target);
    }
  };
};

// 3. useLocation Hook
export const useLocation = () => {
  const pathname = usePathname();
  const searchParams = nextUseSearchParams();

  // Re-build location state from URL search params prefixed with _state_
  const state: any = {};
  searchParams.forEach((val, key) => {
    if (key.startsWith('_state_')) {
      const realKey = key.slice(7); // Remove '_state_'
      try {
        state[realKey] = JSON.parse(val);
      } catch (e) {
        state[realKey] = val;
      }
    }
  });

  // Handle type conversions for known properties
  if (state.seats) {
    state.seats = parseInt(state.seats, 10);
  }

  return {
    pathname,
    search: searchParams.toString(),
    state
  } as any;
};

// 4. useParams Hook
export const useParams = () => {
  return nextUseParams() as any;
};

// 5. useSearchParams Hook
export const useSearchParams = () => {
  const searchParams = nextUseSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const setSearchParams = (params: any) => {
    const newParams = new URLSearchParams();
    
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        if (val !== undefined && val !== null) {
          newParams.set(key, String(val));
        }
      });
    }

    const queryString = newParams.toString();
    router.push(queryString ? `${pathname}?${queryString}` : pathname);
  };

  return [searchParams, setSearchParams] as any;
};

