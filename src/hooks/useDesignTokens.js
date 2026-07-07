import { useMemo } from 'react';
import { tokens, getToken } from '@/design-tokens';

export const useDesignTokens = () => {
  return useMemo(() => ({
    tokens,
    getToken,
    colors: tokens.colors,
    fontFamily: tokens.fontFamily,
    borderRadius: tokens.borderRadius,
    boxShadow: tokens.boxShadow,
  }), []);
};

export default useDesignTokens;
