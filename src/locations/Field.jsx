import {  useCallback } from 'react';
import {
	Button,
	Flex,
	Box,
	Stack,
	Badge,
	TextLink,
	Text,
	Note
} from '@contentful/f36-components';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';
import { SingleLineEditor } from '@contentful/field-editor-single-line';
import useAutoResizer from '../lib/hooks/useAutoResizer';
import './field.scss';



const Field = () => {

	useAutoResizer();

	const sdk = useSDK();
	/*
     To use the cma, inject it as follows.
     If it is not needed, you can remove the next line.
  	*/
	// const cma = useCMA();
	// If you only want to extend Contentful's default editing experience
	// reuse Contentful's editor components
	// -> https://www.contentful.com/developers/docs/extensibility/field-editors/
	//return <Paragraph>Hello Entry Field Component (AppId: {sdk.ids.app})</Paragraph>;

	const {
		usApiUrl,
		usApiToken
	} = sdk.parameters.instance;

	console.log('sdk.parameters.instance', sdk.parameters.instance);


	const shortenURL = useCallback((url) => {

		fetch('http://tsp.pm/api/short_urls', {
			method: 'POST',
			headers: {
				'Authorization': usApiToken,
				'Content-Type': 'application/json'
			},
			body: {
				long_url: url
			},
		  })
			.then(response => {
			  // Check if the response status is OK (200)
			  if (response.status === 200) {
				console.log('response', response)
				return response.json(); // Parse the JSON response
			  } else {
				throw new Error('API request failed');
			  }
			})
			.then(data => {
			  // Handle the data from the API
			  console.log('API response:', data);
			})
			.catch(error => {
			  // Handle any errors that occurred during the fetch
			  console.error('API request error:', error);
			});
		  
	
	}, [
		usApiToken,
		//usApiUrl
	])


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
					Please define a usApiUrl (e.g. http://tsp.pm/api/short_urls) and a usApiToken (e.g. "Bearer XYZ") in the app parameters to enable the shorten URL functionality</Note>
			</Stack>
		)
	}



	return (
		<Stack 
			flexDirection="column" 
			spacing="spacingXs"
			alignItems="stretch"
		>
			<Flex flexDirection='row' gap='spacingS'>
				<Flex 
					className="sug-input"
					flexGrow={1} 
				>
					<SingleLineEditor
						style={{width: '100%'}}
						field={sdk.field}
						locales={sdk.locales}
						onChange={() => {
							console.log('changed');
						}}
					/>
				</Flex>
				<Box>
					<Button 
						size='small' onClick={() => shortenURL(sdk.field.getValue())}
					>
						Shorten URL
					</Button>
				</Box>
			</Flex>
			<Box>
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
							http://www.somefancyurl.de
						</Text>
					</TextLink>
					
				</Badge>
			</Box>
		</Stack>
	);

	/*return (
	<TextInput
		value={sdk.field.getValue()}
	/>
	<SingleLineEditor
				field={sdk.field}
				locales={sdk.locales}
				onChange={() => {
					console.log('changed');
				}}
				onClick={() => {
					
				}}
			/>
  )*/
};

export default Field;
