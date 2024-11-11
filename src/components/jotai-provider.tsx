'use client';

import { Provider } from 'jotai';

interface JotaiProviderProps {
	children: React.ReactNode;
}
export const JotatiProvider = ({ children }: JotaiProviderProps) => {
	return <Provider>{children}</Provider>;
};
