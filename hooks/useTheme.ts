import {useContext} from 'react';
import {ThemeContext, ThemeContextType} from '@/utils/context';

export default function useTheme(): ThemeContextType {
    return useContext<ThemeContextType>(ThemeContext);
}
