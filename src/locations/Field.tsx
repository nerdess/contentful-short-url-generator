import { useRef } from 'react';
import {
	Flex,
	Box,
	Stack,
	Badge,
	TextLink,
	Text,
	Note,
	IconButton,
	//Icon,
	Tooltip,
	Spinner,
} from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { SingleLineEditor } from '@contentful/field-editor-single-line';
import useAutoResizer from '../lib/hooks/useAutoResizer';
import useShortURL from '../lib/hooks/useShortURL';
import { FieldAppSDK } from '@contentful/app-sdk';
import { DeleteIcon } from '@contentful/f36-icons';
//import { AiOutlineScissor } from "react-icons/ai";
import './field.scss';

const initiateShortenUrl = ({
	sdk,
	shortenURL
}:{
	sdk: FieldAppSDK,
	shortenURL: (url: string) => void
}) => {

	if (!sdk.field.getValue() || sdk.field.getSchemaErrors().length > 0) {
		sdk.notifier.error('Please enter a valid URL');
		return
	}
	
	shortenURL(sdk.field.getValue())
}

const Field = () => {

	useAutoResizer();

	const sdk = useSDK<FieldAppSDK>();
	const initialUrl = useRef(sdk.field.getValue());

	const {
		usApiUrl,
		usApiToken
	} = sdk.parameters.instance;

	const {
		shortenURL,
		deleteShortURL,
		isLoadingInitial,
		isErrorInitial,
		//isLoadingSave,
		isErrorSave,
		shortUrl,
		longUrl
	} = useShortURL({
		apiUrl: usApiUrl,
		apiToken: usApiToken,
		initialUrl: initialUrl.current,
	});

	if (!usApiUrl || !usApiToken) {
		return (
			<Stack 
				flexDirection="column" 
				spacing="spacingXs"
				alignItems="stretch"
			>
				<SingleLineEditor
					field={sdk.field}
					locales={sdk.locales}
				/>
				<Note variant="negative">
					Please define a usApiUrl (e.g. http://tsp.pm/api/short_urls) and a usApiToken (e.g. "Bearer XYZ") in the app parameters to enable the shorten URL functionality
				</Note>
			</Stack>
		)
	}

	if (isLoadingInitial) {
		return <Spinner variant="default" />
	}

	//console.log('longUrl', longUrl);

	return (
		<Stack 
			flexDirection="column" 
			spacing="spacingS"
			alignItems="stretch"
		>
			{isErrorInitial && 
				<Note variant="negative">
					The short URL could not be resolved and might be invalid!<br />
					Please check manually if the URL works as expected or delete it. 🧐
				</Note>
			}

			{isErrorSave && 
				<Note variant="negative">
					The short URL could not be created.<br />
					Please check if the short URL service is running or talk to your IT team 🤓
				</Note>
			}
		
			<Flex flexDirection='row' gap='spacingS'>
				<Flex 
					className="sug-input"
					flexGrow={1}
				>
					<SingleLineEditor
						field={sdk.field}
						locales={sdk.locales}
						isDisabled={!isErrorInitial && !!shortUrl}
						onBlur={() => {
							initiateShortenUrl({sdk, shortenURL});
						}}
					/>
				</Flex>
				<Box>
					{/*(!shortUrl) && 
						<Tooltip placement="left" content="Shorten URL">
							<IconButton 
								style={{height: 40, width: 40}}
								variant="secondary"
								onClick={() => {
									initiateShortenUrl({sdk, shortenURL});
								}}
								isLoading={isLoadingSave}
								aria-label="Shorten URL"
								icon={ <Icon as={AiOutlineScissor} variant="secondary" />}
							/>
						</Tooltip>
					*/}
					{!!shortUrl && 
						<Tooltip placement="left" content="Remove short URL">
							<IconButton
								style={{height: 40, width: 40}}
								variant="secondary"
								aria-label="Delete"
								isLoading={isLoadingInitial}
								icon={<DeleteIcon />}
								onClick={() => deleteShortURL()}
							/>
						</Tooltip>
					}
				</Box>
			</Flex>
		
	
			{(!!shortUrl && !!longUrl) && <Box>
				<Stack flexDirection="row" spacing="spacing2Xs" alignItems="start">
					<Box>
						<Badge variant="secondary">
							<span style={{textTransform: 'none'}}>
								Short URL resolves to
							</span>
						</Badge>
					</Box>
					<Box style={{wordBreak: 'break-word'}}>
						<TextLink
							href={longUrl}
							target="_blank" 
							rel="noopener noreferrer"
						>
							<Text fontSize="fontSizeS" as="u" style={{display: 'block', lineHeight: 1.1}}>
								{longUrl}
							</Text>
						</TextLink>
					</Box>
				</Stack>
			</Box>}
		</Stack>
	);
};

export default Field;
