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
	Icon,
	Tooltip,
	Spinner
} from '@contentful/f36-components';
import { useSDK } from '@contentful/react-apps-toolkit';
import { SingleLineEditor } from '@contentful/field-editor-single-line';
import useAutoResizer from '../lib/hooks/useAutoResizer';
import useShortURL from '../lib/hooks/useShortURL';
import { FieldAppSDK } from '@contentful/app-sdk';
import { DeleteIcon } from '@contentful/f36-icons';
import { AiOutlineScissor } from "react-icons/ai";
import './field.scss';

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
		isLoadingSave,
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

	return (
		<Stack 
			flexDirection="column" 
			spacing="spacingXs"
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
					/>
				</Flex>
				<Box>
					{(!shortUrl) && 
						<Tooltip placement="left" content="Shorten URL">
							<IconButton 
								style={{height: 40, width: 40}}
								variant="secondary"
								onClick={() => {

									if (!sdk.field.getValue() || sdk.field.getSchemaErrors().length > 0) {
										sdk.notifier.error('Please enter a valid URL');
										return
									}
									
									shortenURL(sdk.field.getValue())
								}}
								isLoading={isLoadingSave}
								aria-label="Shorten URL"
								icon={ <Icon as={AiOutlineScissor} variant="secondary" />}
							/>
						</Tooltip>
					}
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
		
			{(shortUrl && longUrl) && <Box>
				<Stack>
					<Badge variant="secondary">
						<span style={{textTransform:'none'}}>
							Short URL resolves to:&nbsp;
						</span>
						<TextLink
							href="http://www.foo.de" 
							target="_blank" 
							rel="noopener noreferrer"
						>
							<Text fontSize="fontSizeS" as="u">
								{longUrl}
							</Text>
						</TextLink>
					</Badge>
					
				</Stack>
			</Box>}
		</Stack>
	);
};

export default Field;
