import { useCallback, useState } from "react";

interface IUsePageResult {
	readonly pageError: string;
	readonly onPageClearError: () => void;
	readonly onPageError: (errorMessage: string) => void;
	readonly onPageNothing: () => void;
}

export const usePage = function (): IUsePageResult {
	const [error, setError] = useState<string>(null);

	const onPageClearError = useCallback(() => {
		setError(null);
	}, []);

	return {
		pageError: error,
		onPageClearError,
		onPageError: setError,
		onPageNothing: () => {},
	};
};
