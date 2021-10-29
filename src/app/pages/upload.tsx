import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router";
import { Page } from "../components/page";
import { is } from "../shared/is";
import { MessageBar, MessageBarType, TextField, PrimaryButton, ProgressIndicator } from "@fluentui/react";
import styled, { DivConfirm, DivField, SpinnerLeft, DialogWidthSmall, ButtonTiny } from "../styles";
import { PlayFabHelper } from "../shared/playfab";
import { routes } from "../routes";
import { IStringDictionary, PROGRESS_STAGES, CATALOG_VERSION, ITitleNewsData, DownloadProgress } from "../shared/types";

import VirtualCurrencies from "../../data/virtual-currency.json";
import Catalogs from "../../data/catalogs.json";
import Stores from "../../data/stores.json";
import TitleData from "../../data/title-data.json";
import CloudScript from "../../data/cloud-script.json";
import DropTables from "../../data/drop-tables.json";
import { Grid } from "../components/grid";
import { BackLink } from "../components/back-link";
import { utilities } from "../shared/utilities";
import { Link } from "react-router-dom";
import { useCloud, ICloudParams } from "../hooks/use-cloud";
import { useSelector } from "react-redux";
import { IApplicationState } from "../store/reducers";
import { usePage } from "../hooks/use-page";

const DivUploadComplete = styled.div`
	margin-top: ${s => s.theme.size.spacer};
`;

const uploadDelayMilliseconds = 2000;

export const UploadPage: React.FunctionComponent = React.memo(() => {
	useCloud(useParams<ICloudParams>());
	const { hasTitleId, cloud, titleId } = useSelector((state: IApplicationState) => ({
		hasTitleId: state.hasTitleId,
		cloud: state.cloud,
		titleId: state.titleId,
	}));
	const { pageError, onPageClearError, onPageError } = usePage();
	const history = useHistory();

	const [currencyStage, setcurrencyStage] = useState<DownloadProgress>(DownloadProgress.Waiting);
	const [catalogStage, setcatalogStage] = useState<DownloadProgress>(DownloadProgress.Waiting);
	const [droptableStage, setdroptableStage] = useState<DownloadProgress>(DownloadProgress.Waiting);
	const [storeStage, setstoreStage] = useState<DownloadProgress>(DownloadProgress.Waiting);
	const [titledataStage, settitledataStage] = useState<DownloadProgress>(DownloadProgress.Waiting);
	const [cloudscriptStage, setcloudscriptsetStage] = useState<DownloadProgress>(DownloadProgress.Waiting);

	const [uploadTitle, setUploadTitle] = useState("");
	const [secretKey, setsecretKey] = useState<string>(null);
	const [hasSecretKey, sethasSecretKey] = useState(false);
	const [shouldShowTitleNewsFormat, setshouldShowTitleNewsFormat] = useState(false);

	const hideTitleNewsSample = useCallback((): void => {
		setshouldShowTitleNewsFormat(false);
	}, []);

	const showTitleNewsSample = useCallback((): void => {
		setshouldShowTitleNewsFormat(true);
	}, []);

	const mapDropTable = useCallback(
		(tableData: PlayFabAdminModels.GetRandomResultTablesResult): PlayFabAdminModels.RandomResultTable[] => {
			return Object.keys(tableData.Tables).map(key => {
				return {
					TableId: tableData.Tables[key].TableId,
					Nodes: tableData.Tables[key].Nodes,
				};
			});
		},
		[]
	);

	const goToPage = useCallback(
		(page: string): void => {
			history.push(page);
		},
		[history]
	);

	const startUpload = useCallback(
		(e: React.SyntheticEvent<any>): void => {
			if (!is.null(e)) {
				e.preventDefault();
			}

			if (is.null(secretKey)) {
				onPageError("No secret key entered");
				return;
			} else {
				onPageClearError();
			}

			sethasSecretKey(true);
		},
		[onPageClearError, onPageError, secretKey]
	);

	const onChangeSecretKey = useCallback((_: any, newValue: string): void => {
		setsecretKey(newValue);
	}, []);

	const advanceUpload = useCallback(
		(callback: () => void): void => {
			// Can't let the system go too fast
			window.setTimeout(() => {
				if (!is.null(pageError)) {
					return;
				}

				onPageClearError();
				callback();
			}, uploadDelayMilliseconds);
		},
		[onPageClearError, pageError]
	);

	const runUpload = useCallback((): void => {
		if (!hasSecretKey) {
			return;
		}

		for (let i = 0; i < PROGRESS_STAGES.length; i++) {
			const thisStage = PROGRESS_STAGES[i];

			switch (thisStage.key) {
				case "currency":
					if (currencyStage === DownloadProgress.Running) {
						return;
					} else if (currencyStage === DownloadProgress.Finished) {
						break;
					}

					PlayFabHelper.AdminAPIAddVirtualCurrencyTypes(
						secretKey,
						VirtualCurrencies.VirtualCurrencies,
						() => {
							advanceUpload(() => {
								setcurrencyStage(DownloadProgress.Finished);
							});
						},
						onPageError
					);

					setUploadTitle(thisStage.title);
					setcurrencyStage(DownloadProgress.Running);
					return;
				case "catalog":
					if (catalogStage === DownloadProgress.Running) {
						return;
					} else if (catalogStage === DownloadProgress.Finished) {
						break;
					}

					PlayFabHelper.AdminAPISetCatalogItems(
						secretKey,
						Catalogs.Catalog,
						CATALOG_VERSION,
						true,
						() => {
							advanceUpload(() => {
								setcatalogStage(DownloadProgress.Finished);
							});
						},
						onPageError
					);

					setUploadTitle(thisStage.title);
					setcatalogStage(DownloadProgress.Running);
					return;
				case "droptable":
					if (droptableStage === DownloadProgress.Running) {
						return;
					} else if (droptableStage === DownloadProgress.Finished) {
						break;
					}

					PlayFabHelper.AdminAPIUpdateRandomResultTables(
						secretKey,
						mapDropTable(DropTables as any),
						CATALOG_VERSION,
						() => {
							advanceUpload(() => {
								setdroptableStage(DownloadProgress.Finished);
							});
						},
						onPageError
					);

					setUploadTitle(thisStage.title);
					setdroptableStage(DownloadProgress.Running);
					return;
				case "store":
					if (storeStage === DownloadProgress.Running) {
						return;
					} else if (storeStage === DownloadProgress.Finished) {
						break;
					}

					Stores.data.forEach((s, index) => {
						window.setTimeout(() => {
							PlayFabHelper.AdminAPISetStoreItems(
								secretKey,
								s.StoreId,
								s.Store,
								s.MarketingData,
								CATALOG_VERSION,
								() => {
									if (index === Stores.data.length - 1) {
										advanceUpload(() => {
											setstoreStage(DownloadProgress.Finished);
										});
									}
								},
								onPageError
							);
						}, index * uploadDelayMilliseconds);
					});

					setUploadTitle(thisStage.title);
					setstoreStage(DownloadProgress.Running);
					return;
				case "titledata":
					if (titledataStage === DownloadProgress.Running) {
						return;
					} else if (titledataStage === DownloadProgress.Finished) {
						break;
					}

					Object.keys(TitleData.Data).forEach((key, index) => {
						window.setTimeout(() => {
							PlayFabHelper.AdminAPISetTitleData(
								secretKey,
								key,
								(TitleData.Data as IStringDictionary)[key],
								() => {
									if (index === Object.keys(TitleData.Data).length - 1) {
										advanceUpload(() => {
											settitledataStage(DownloadProgress.Finished);
										});
									}
								},
								onPageError
							);
						}, index * uploadDelayMilliseconds);
					});

					setUploadTitle(thisStage.title);
					settitledataStage(DownloadProgress.Running);
					return;
				case "cloudscript":
					if (cloudscriptStage === DownloadProgress.Running) {
						return;
					} else if (cloudscriptStage === DownloadProgress.Finished) {
						break;
					}

					PlayFabHelper.AdminAPIUpdateCloudScript(
						secretKey,
						CloudScript.Files[0].FileContents,
						true,
						() => {
							advanceUpload(() => {
								setcloudscriptsetStage(DownloadProgress.Finished);
							});
						},
						onPageError
					);

					setUploadTitle(thisStage.title);
					setcloudscriptsetStage(DownloadProgress.Running);
					return;
			}
		}
	}, [
		advanceUpload,
		catalogStage,
		cloudscriptStage,
		currencyStage,
		droptableStage,
		hasSecretKey,
		mapDropTable,
		onPageError,
		secretKey,
		storeStage,
		titledataStage,
	]);

	useEffect(() => {
		if (hasSecretKey) {
			runUpload();
		}
	}, [hasSecretKey, runUpload]);

	const renderForm = useMemo(
		(): React.ReactNode => (
			<React.Fragment>
				<BackLink to={routes.MainMenu(cloud, titleId)} label="Back to main menu" />
				<h2>About</h2>
				<p>This page will populate your title with everything you need to play.</p>
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
				<form onSubmit={startUpload}>
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
						<PrimaryButton text="Begin upload" onClick={startUpload} />
					</DivConfirm>
				</form>
			</React.Fragment>
		),
		[cloud, onChangeSecretKey, pageError, secretKey, startUpload, titleId]
	);

	const uploadProgress = [
		catalogStage,
		cloudscriptStage,
		currencyStage,
		droptableStage,
		storeStage,
		titledataStage,
	].filter(p => p === DownloadProgress.Finished).length;

	const renderUpload = useMemo((): React.ReactNode => {
		if (uploadProgress >= PROGRESS_STAGES.length - 1) {
			return (
				<React.Fragment>
					<BackLink to={routes.MainMenu(cloud, titleId)} label="Back to main menu" />
					<h2>Upload complete</h2>
					<DivUploadComplete>
						<PrimaryButton text="Play game" onClick={goToPage.bind(this, routes.Login(cloud, titleId))} />
					</DivUploadComplete>
				</React.Fragment>
			);
		}

		const spinnerTitle = `Creating ${uploadTitle}...`;

		return (
			<React.Fragment>
				<h2>Upload in progress</h2>
				{!is.null(pageError) && <MessageBar messageBarType={MessageBarType.error}>{pageError}</MessageBar>}
				<SpinnerLeft label={spinnerTitle} labelPosition="right" />
				<ProgressIndicator percentComplete={Math.min(1, uploadProgress / PROGRESS_STAGES.length + 0.1)} />
			</React.Fragment>
		);
	}, [cloud, goToPage, pageError, titleId, uploadProgress, uploadTitle]);

	if (!hasTitleId) {
		return null;
	}

	const sampleTitleNewsItem: ITitleNewsData = {
		html: "&lt;p&gt;Your news content here (this is a paragraph tag)&lt;p&gt;",
	};

	return (
		<Page title="Upload Data">
			<Grid grid8x4>
				{hasSecretKey ? renderUpload : renderForm}
				<React.Fragment>
					<h2>What this creates</h2>
					<ul role="presentation">
						<li>
							<a
								href={utilities.createPlayFabLink(cloud, titleId, "economy/currency", true)}
								target="_blank"
								rel="noreferrer">
								Currencies
							</a>
						</li>
						<li>
							<a
								href={utilities.createPlayFabLink(
									cloud,
									titleId,
									"economy/catalogs/TWFpbg%3d%3d/items",
									false
								)}
								target="_blank"
								rel="noreferrer">
								Catalog items
							</a>
						</li>
						<li>
							<a
								href={utilities.createPlayFabLink(
									cloud,
									titleId,
									"economy/catalogs/TWFpbg%3d%3d/drop-tables",
									false
								)}
								target="_blank"
								rel="noreferrer">
								Drop tables
							</a>
						</li>
						<li>
							<a
								href={utilities.createPlayFabLink(
									cloud,
									titleId,
									"economy/catalogs/TWFpbg%3d%3d/stores",
									false
								)}
								target="_blank"
								rel="noreferrer">
								Stores
							</a>
						</li>
						<li>
							<a
								href={utilities.createPlayFabLink(cloud, titleId, "content/title-data", true)}
								target="_blank"
								rel="noreferrer">
								Title data
							</a>
						</li>
						<li>
							<a
								href={utilities.createPlayFabLink(
									cloud,
									titleId,
									"automation/cloud-script/revisions",
									true
								)}
								target="_blank"
								rel="noreferrer">
								Cloud Script
							</a>
						</li>
					</ul>
					<h2>Title news</h2>
					<p>This page can't upload title news automatically. Here's how to get started:</p>
					<ol>
						<li>
							Go to{" "}
							<a
								href={utilities.createPlayFabLink(cloud, titleId, "settings/general", true)}
								target="_blank"
								rel="noreferrer">
								Settings &gt; General
							</a>
						</li>
						<li>
							Set your <strong>default language</strong> and click <strong>Save</strong>
						</li>
						<li>
							Go to{" "}
							<a
								href={utilities.createPlayFabLink(cloud, titleId, "content/news", true)}
								target="_blank"
								rel="noreferrer">
								Content &gt; Title News
							</a>
						</li>
						<li>
							Click <strong>New title news</strong>
						</li>
						<li>
							The <strong>body</strong> field should be JSON with{" "}
							<Link to={routes.Generator(cloud, titleId)}>escaped HTML</Link> in this format:
						</li>
					</ol>
					<ButtonTiny text="Show title news format" onClick={showTitleNewsSample} />
					<DialogWidthSmall
						hidden={!shouldShowTitleNewsFormat}
						onDismiss={hideTitleNewsSample}
						dialogContentProps={{
							title: "Sample title news body format",
						}}>
						<pre>{JSON.stringify(sampleTitleNewsItem, null, 4)}</pre>
					</DialogWidthSmall>
				</React.Fragment>
			</Grid>
		</Page>
	);
});
