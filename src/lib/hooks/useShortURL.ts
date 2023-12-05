import { useCallback, useEffect, useState } from 'react';
import { FieldAppSDK } from '@contentful/app-sdk';
import {  useSDK } from '@contentful/react-apps-toolkit';

interface ShortenURLResponse {
	created_at: string;
	hash_name: string;
	id: number;
	long_url: string;
	short_url: string;
	updated_at: string;
}

interface LongURLResponse {
	long_url: string;
}

interface UseShortURLResponse {
	shortUrl: string | undefined;
	longUrl: string | undefined;
	shortenURL: (url: string) => void;
	deleteShortURL: () => void;
	editShortURL: (url: string) => void;
	isLoadingInitial: boolean;
	isErrorInitial: boolean;
	isLoadingSave: boolean;
	isErrorSave: boolean;
}

const isShortURL = (url: string): boolean => {
    return url.includes('tsp.pm');
}

const getHash = (url: string): string => {
    if (isShortURL(url)) {
        const parts = url.split('/');
        return parts[parts.length - 1];
    }
    return '';
};

const UseShortURL = ({
	apiUrl = '',
	apiToken = '',
	initialUrl = '',
}: {
	apiUrl: string;
	apiToken: string;
	initialUrl?: string;
}): UseShortURLResponse => {
	const [shortUrl, setShortUrl] = useState<string | undefined>(undefined);
	const [longUrl, setLongUrl] = useState<string | undefined>(undefined);
	const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
	const [isErrorInitial, setIsErrorInitial] = useState<boolean>(false);
	const [isLoadingSave, setIsLoadingSave] = useState<boolean>(false);
	const [isErrorSave, setIsErrorSave] = useState<boolean>(false);
	const sdk = useSDK<FieldAppSDK>();

	useEffect(() => {

		const hash = getHash(initialUrl);

		if (!!hash) {

			setShortUrl(initialUrl);

			fetch(`${apiUrl}/${encodeURIComponent(hash)}`, {
				method: 'GET',
				headers: {
					Authorization: apiToken,
					'Content-Type': 'application/json',
					Accept: 'application/json',
				},
			})
				.then((response) => {
					setIsLoadingInitial(false);
					if (response.status === 200) {
						response.json().then((response: LongURLResponse) => {
							const { long_url } = response;
							setLongUrl(long_url);
						});
					} else {
						setIsErrorInitial(true);
					}
				})
				.catch((error) => {
					setIsLoadingInitial(false);
					setIsErrorInitial(true);
					//console.error('API request error:', error);
				});
		} else {
            setIsLoadingInitial(false);
			setLongUrl(initialUrl);
		}
	}, [initialUrl, apiToken, apiUrl]);

	const shortenURL = useCallback(
		(url: string) => {

			// If the URL is already a short URL, don't do anything (legacy support)
			if (isShortURL(url)) return;

			setIsLoadingSave(true);

			fetch(`${apiUrl}?long_url=${encodeURIComponent(url)}`, {
				method: 'POST',
				headers: {
					Authorization: apiToken,
					'Content-Type': 'application/json',
				},
			})
				.then((response) => {
					if (response.status === 201) {
						response.json().then((response: ShortenURLResponse) => {

							const { short_url, long_url } = response;

							sdk.field.setValue(short_url);
							setShortUrl(short_url);
							setLongUrl(long_url);
							setIsLoadingSave(false);
							sdk.notifier.success('New short URL was created 🥳');

						});
					} else {
						setIsErrorSave(true);
						setIsLoadingSave(false);
						//throw new Error('API request failed');
					}
				})
				.catch((error) => {
					setIsErrorSave(true);
					setIsLoadingSave(false);
					//console.error('API request error:', error);
				});
		},
		[apiToken, apiUrl, sdk.field, sdk.notifier]
	);

	const deleteShortURL = useCallback(() => {

        setShortUrl(undefined);
		setIsErrorInitial(false);
        sdk.field.setValue(longUrl);
		sdk.notifier.success('Short URL was removed 🥳');



    }, [longUrl, sdk.field, sdk.notifier]);

	const editShortURL = useCallback((url: string) => {}, []);

	return {
		shortUrl,
		longUrl,
		shortenURL,
		deleteShortURL,
		editShortURL,
		isLoadingInitial,
		isErrorInitial,
		isLoadingSave,
		isErrorSave,
	};
};

export default UseShortURL;
