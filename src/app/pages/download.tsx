import React, { useCallback, useEffect, useState } from "react";
import { MessageBar, MessageBarType, TextField, PrimaryButton, ProgressIndicator } from "@fluentui/react";

import { Page } from "../components/page";
import { is } from "../shared/is";
import styled, { DivConfirm, DivField, SpinnerLeft } from "../styles";
import { routes } from "../routes";
import { PROGRESS_STAGES, CATALOG_VERSION, TITLE_DATA_STORES, DownloadProgress } from "../shared/types";
import { PlayFabHelper } from "../shared/playfab";
import { utilities } from "../shared/utilities";
import { BackLink } from "../components/back-link";
import { Grid } from "../components/grid";
import { useSelector } from "react-redux";
import { IApplicationState } from "../store/reducers";
import { usePage } from "../hooks/use-page";
import { useParams } from "react-router";
import { ICloudParams, useCloud } from "../hooks/use-cloud";

const DivDownloadGrid = styled.div`
	margin-top: ${s => s.theme.size.spacer};
`;

const MessageBarSuccess = styled(MessageBar)`
	margin: ${s => s.theme.size.spacer} 0;
`;

interface IDownloadContent {
	title: string;
	content: string;
}

export const DownloadPage: React.FunctionComponent = React.memo(() => {
	useCloud(useParams<ICloudParams>());
	const { hasTitleId, cloud, titleId } = useSelector((state: IApplicationState) => ({
		hasTitleId: state.hasTitleId,
		cloud: state.cloud,
		titleId: state.titleId,
	}));
	const { pageError, onPageClearError, onPageError } = usePage();

	const [currencyStage, setcurrencyStage] = useState<DownloadProgress>(DownloadProgress.Waiting);
	const [catalogStage, setcatalogStage] = useState<DownloadProgress>(DownloadProgress.Waiting);
	const [droptableStage, setdroptableStage] = useState<DownloadProgress>(DownloadProgress.Waiting);
	const [storeStage, setstoreStage] = useState<DownloadProgress>(DownloadProgress.Waiting);
	const [titledataStage, settitledataStage] = useState<DownloadProgress>(DownloadProgress.Waiting);
	const [cloudscriptStage, setcloudscriptsetStage] = useState<DownloadProgress>(DownloadProgress.Waiting);

	const [secretKey, setSecretKey] = useState<string>(null);
	const [hasSecretKey, setHasSecretKey] = useState(false);

	const [downloadContent, setDownloadContent] = useState<IDownloadContent[]>([]);
	const [latestDownload, setLatestDownload] = useState<any>(null);
	const [latestDownloadTitle, setLatestDownloadTitle] = useState<string>(null);

	const onChangeSecretKey = useCallback((_: any, newValue: string) => {
		setSecretKey(newValue);
	}, []);

	useEffect(() => {
		if (!is.null(latestDownload) && !is.null(latestDownloadTitle)) {
			setDownloadContent(
				downloadContent.concat([
					{
						title: latestDownloadTitle,
						content: JSON.stringify(latestDownload, null, 4),
					},
				])
			);
			setLatestDownload(null);
			setLatestDownloadTitle(null);
		}
	}, [downloadContent, latestDownload, latestDownloadTitle]);

	const saveData = useCallback(
		(title: string, data: any) => {
			onPageClearError();

			setLatestDownload(data);
			setLatestDownloadTitle(title);
		},
		[onPageClearError]
	);

	const runDownload = useCallback(() => {
		if (!hasSecretKey) {
			return;
		}

		for (let i = 0; i < PROGRESS_STAGES.length; i++) {
			const thisStage = PROGRESS_STAGES[i];

			switch (thisStage.key) {
				case "currency":
					if (currencyStage !== DownloadProgress.Waiting) {
						break;
					}

					PlayFabHelper.AdminAPIListVirtualCurrencyTypes(
						secretKey,
						data => {
							saveData(thisStage.filename, data);
							setcurrencyStage(DownloadProgress.Finished);
						},
						onPageError
					);
					setcurrencyStage(DownloadProgress.Running);
					break;
				case "catalog":
					if (catalogStage !== DownloadProgress.Waiting) {
						break;
					}

					PlayFabHelper.AdminAPIGetCatalogItems(
						secretKey,
						CATALOG_VERSION,
						data => {
							saveData(thisStage.filename, data);
							setcatalogStage(DownloadProgress.Finished);
						},
						onPageError
					);

					setcatalogStage(DownloadProgress.Running);
					return;
				case "droptable":
					if (droptableStage !== DownloadProgress.Waiting) {
						break;
					}

					PlayFabHelper.AdminAPIGetRandomResultTables(
						secretKey,
						CATALOG_VERSION,
						data => {
							saveData(thisStage.filename, data);
							setdroptableStage(DownloadProgress.Finished);
						},
						onPageError
					);

					setdroptableStage(DownloadProgress.Running);
					return;
				case "store":
					if (storeStage !== DownloadProgress.Waiting) {
						break;
					}

					PlayFabHelper.AdminAPIGetTitleData(
						secretKey,
						[TITLE_DATA_STORES],
						titleData => {
							const storeNames = JSON.parse(titleData.Data[TITLE_DATA_STORES]) as string[];
							let storeDataFull: any[] = [];

							storeNames.forEach(name => {
								PlayFabHelper.AdminAPIGetStoreItems(
									secretKey,
									CATALOG_VERSION,
									name,
									storeData => {
										storeDataFull.push(storeData);

										if (storeDataFull.length === storeNames.length) {
											saveData("stores.json", {
												data: storeDataFull,
											});
										}
									},
									onPageError
								);
							});

							setstoreStage(DownloadProgress.Finished);
						},
						onPageError
					);

					setstoreStage(DownloadProgress.Running);
					return;
				case "titledata":
					if (titledataStage !== DownloadProgress.Waiting) {
						break;
					}

					PlayFabHelper.AdminAPIGetTitleData(
						secretKey,
						null,
						data => {
							saveData(thisStage.filename, data);
							settitledataStage(DownloadProgress.Finished);
						},
						onPageError
					);

					settitledataStage(DownloadProgress.Running);
					return;
				case "cloudscript":
					if (cloudscriptStage !== DownloadProgress.Waiting) {
						break;
					}

					PlayFabHelper.AdminAPIGetCloudScriptRevision(
						secretKey,
						null,
						null,
						data => {
							saveData(thisStage.filename, data);
							setcloudscriptsetStage(DownloadProgress.Finished);
						},
						onPageError
					);

					setcloudscriptsetStage(DownloadProgress.Running);
					return;
			}
		}
	}, [
		catalogStage,
		cloudscriptStage,
		currencyStage,
		droptableStage,
		hasSecretKey,
		onPageError,
		saveData,
		secretKey,
		storeStage,
		titledataStage,
	]);

	useEffect(() => {
		if (hasSecretKey) {
			runDownload();
		}
	}, [hasSecretKey, runDownload]);

	const startDownload = useCallback(
		(e: React.SyntheticEvent<any>) => {
			if (!is.null(e)) {
				e.preventDefault();
			}

			if (is.null(secretKey)) {
				onPageError("No secret key entered");
				return;
			} else {
				onPageClearError();
			}

			setHasSecretKey(true);
		},
		[onPageClearError, onPageError, secretKey]
	);

	const downloadProgress = downloadContent.length;

	// Render function
	if (!hasTitleId) {
		return null;
	}

	return (
		<Page title="Download Data">
			{hasSecretKey ? (
				<DownloadPageProgress
					cloud={cloud}
					downloadContent={downloadContent}
					downloadProgress={downloadProgress}
					pageError={pageError}
					titleId={titleId}
				/>
			) : (
				<DownloadPageForm
					cloud={cloud}
					onChangeSecretKey={onChangeSecretKey}
					pageError={pageError}
					secretKey={secretKey}
					startDownload={startDownload}
					titleId={titleId}
				/>
			)}
		</Page>
	);
});

interface IDownloadPageFormProps {
	cloud: string;
	pageError: string;
	secretKey: string;
	titleId: string;
	onChangeSecretKey: (_: any, newValue: string) => void;
	startDownload: (e: React.SyntheticEvent<any>) => void;
}

const DownloadPageForm: React.FunctionComponent<IDownloadPageFormProps> = React.memo(props => {
	const { cloud, onChangeSecretKey, pageError, secretKey, startDownload, titleId } = props;

	return (
		<form onSubmit={startDownload}>
			<BackLink to={routes.MainMenu(cloud, titleId)} label="Back to main menu" />
			<h2>About</h2>
			<p>
				This page will download data from your title to make it easier to re-upload using our{" "}
				<a href="https://github.com/PlayFab/vanguard-outrider/">GitHub repository</a>.
			</p>
			<p>
				Get the secret key for your title from{" "}
				<a
					href={utilities.createPlayFabLink(cloud, titleId, "settings/secret-keys", true)}
					target="_blank"
					rel="noreferrer">
					Settings &gt; Secret Keys
				</a>
				.
			</p>
			<p>This page does not store nor transmit your secret key to anyone except PlayFab.</p>
			{!is.null(pageError) && <MessageBar messageBarType={MessageBarType.error}>{pageError}</MessageBar>}
			<DivField>
				<TextField
					type="password"
					label="Secret key"
					value={secretKey}
					onChange={onChangeSecretKey}
					autoFocus
				/>
			</DivField>
			<DivConfirm>
				<PrimaryButton text="Begin download" onClick={startDownload} />
			</DivConfirm>
		</form>
	);
});

interface IDownloadPageProgressProps {
	cloud: string;
	downloadProgress: number;
	pageError: string;
	titleId: string;
	downloadContent: IDownloadContent[];
}

const DownloadPageProgress: React.FunctionComponent<IDownloadPageProgressProps> = React.memo(props => {
	const { cloud, downloadProgress, pageError, titleId, downloadContent } = props;
	const percentComplete = Math.min(1, downloadProgress / PROGRESS_STAGES.length + 0.1);
	const title = percentComplete < 1 ? "Download in progress" : "Download complete";
	const spinnerLabel = `Downloading...`;

	return (
		<React.Fragment>
			<BackLink to={routes.MainMenu(cloud, titleId)} label="Back to main menu" />
			<h2 role="alert">{title}</h2>
			{!is.null(pageError) && <MessageBar messageBarType={MessageBarType.error}>{pageError}</MessageBar>}
			{percentComplete < 1 ? (
				<React.Fragment>
					<SpinnerLeft label={spinnerLabel} labelPosition="right" />
					<ProgressIndicator percentComplete={percentComplete} />
				</React.Fragment>
			) : (
				<MessageBarSuccess messageBarType={MessageBarType.success}>
					Save these text fields to the JSON files inside the <code>/src/data</code> folder.
				</MessageBarSuccess>
			)}
			<DownloadPageProgressContent pageError={pageError} downloadContent={downloadContent} />
		</React.Fragment>
	);
});

interface IDownloadPageProgressContentProps {
	downloadContent: IDownloadContent[];
	pageError: string;
}

const DownloadPageProgressContent: React.FunctionComponent<IDownloadPageProgressContentProps> = React.memo(props => {
	const { downloadContent, pageError } = props;
	if (is.null(downloadContent)) {
		return null;
	}

	return (
		<React.Fragment>
			{!is.null(pageError) && <MessageBar messageBarType={MessageBarType.error}>{pageError}</MessageBar>}
			<DivDownloadGrid>
				<Grid grid6x6>
					{downloadContent.map((d, index) => (
						<React.Fragment key={index}>
							<h3>{d.title}</h3>
							<TextField multiline value={d.content} rows={10} />
						</React.Fragment>
					))}
				</Grid>
			</DivDownloadGrid>
		</React.Fragment>
	);
});
