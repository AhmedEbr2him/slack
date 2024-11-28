import { useMutation } from 'convex/react';

import { useCallback, useMemo, useState } from 'react';
import { api } from '../../../../convex/_generated/api';

type ResponseType = string | null;

type Options = {
	onSuccess?: (data: ResponseType) => void;
	onError?: (error: Error) => void;
	onSettled?: () => void;
	throwError?: boolean; // if you want to wrap data in try and catch
};

export const useGenerateUploadUrl = () => {
	const [data, setData] = useState<ResponseType>(null);
	const [error, setError] = useState<Error | null>(null);
	const [status, setStatus] = useState<'error' | 'pending' | 'success' | 'settled' | null>(null);

	const isPending = useMemo(() => status === 'pending', [status]);
	const isError = useMemo(() => status === 'error', [status]);
	const isSuccess = useMemo(() => status === 'success', [status]);
	const isSettled = useMemo(() => status === 'settled', [status]);

	const mutation = useMutation(api.upload.generateUploadUrl);

	const mutate = useCallback(
		async (_values: {}, options?: Options) => {
			try {
				setData(null);
				setError(null);
				setStatus('pending');

				const response = await mutation();
				options?.onSuccess?.(response);
				return response;
			} catch (error) {
				setStatus('error');
				options?.onError?.(error as Error);

				// if you want to wrap data in try and catch
				if (options?.throwError) {
					throw error;
				}
			} finally {
				setStatus('settled');
				options?.onSettled?.();
			}
		},

		[mutation]
	);

	return { mutate, data, error, isError, isSettled, isSuccess, isPending };
};
