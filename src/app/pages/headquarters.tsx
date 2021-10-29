import { DefaultButton, DialogFooter, DialogType, Link, PrimaryButton } from "@fluentui/react";
import React, { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, useHistory, useParams } from "react-router";
import { BackLink } from "../components/back-link";
import { Grid } from "../components/grid";
import { Leaderboard } from "../components/leaderboard";
import { Page } from "../components/page";
import { useCloud, ICloudParams } from "../hooks/use-cloud";
import { usePage } from "../hooks/use-page";
import { routes } from "../routes";
import { CloudScriptHelper } from "../shared/cloud-script";
import { is } from "../shared/is";
import { PlayFabHelper } from "../shared/playfab";
import {
	CATALOG_VERSION,
	ILeaderboardDictionary,
	ITitleNewsData,
	STATISTIC_KILLS,
	STATISTIC_LEVEL,
} from "../shared/types";
import { utilities } from "../shared/utilities";
import { IApplicationState, mainReducer } from "../store/reducers";
import styled, { ButtonTiny, DialogWidthSmall, DlStats, SpinnerLeft, UlInline } from "../styles";

const DivNewsAndLeaderboardWrapper = styled.div`
	margin-top: ${s => s.theme.size.spacer};
`;

const H2WithButton = styled.h2`
	display: flex;
	align-items: center;

	> button {
		margin-left: ${s => s.theme.size.spacerD2};
	}
`;

const DivHeadquartersWrapper = styled.div`
	margin-top: ${s => s.theme.size.spacer};
	padding: ${s => s.theme.size.spacerD2} 0;
	border-top: 1px solid ${s => s.theme.color.border200};
`;

const leaderboardStatistics = [STATISTIC_KILLS, STATISTIC_LEVEL];
const leaderboardCount = 10;
const titleNewsCount = 10;

interface ILoadedLeaderboard {
	statistic: string;
	data: any;
}

export const HeadquartersPage: React.FunctionComponent = React.memo(() => {
	useCloud(useParams<ICloudParams>());

	const { cloud, titleId, storeNames, hasPlayerId, hasTitleId, stores } = useSelector((state: IApplicationState) => ({
		cloud: state.cloud,
		titleId: state.titleId,
		hasTitleId: state.hasTitleId,
		hasPlayerId: state.hasPlayerId,
		stores: state.stores,
		storeNames: state.storeNames,
	}));
	const dispatch = useDispatch();

	const { onPageError } = usePage();

	const [isRestoringHealth, setisRestoringHealth] = useState<boolean>(true);
	const [leaderboards, setleaderboards] = useState<ILeaderboardDictionary>(null);
	const [news, setnews] = useState<PlayFabClientModels.TitleNewsItem[]>(null);
	const [readNewsId, setreadNewsId] = useState<string>(null);
	const [isLoadingLeaderboards, setisLoadingLeaderboards] = useState<boolean>(true);
	const [isLoadingNews, setisLoadingNews] = useState<boolean>(true);
	const [loadedLeaderboard, setLoadedLeaderboard] = useState<ILoadedLeaderboard>(null);

	const restorePlayerHP = useCallback(() => {
		CloudScriptHelper.returnToHomeBase(response => {
			dispatch(mainReducer.actions.setPlayerHP(response.maxHP));
			setisRestoringHealth(false);
		}, onPageError);
	}, [dispatch, onPageError]);

	const getLeaderboards = useCallback(() => {
		setleaderboards(null);
		setisLoadingLeaderboards(true);

		leaderboardStatistics.forEach(statistic => {
			PlayFabHelper.GetLeaderboard(
				statistic,
				0,
				leaderboardCount,
				data => {
					setisLoadingLeaderboards(false);
					setLoadedLeaderboard({ statistic, data });
				},
				onPageError
			);
		});
	}, [onPageError]);

	useEffect(() => {
		if (is.null(loadedLeaderboard)) {
			return;
		}

		setleaderboards({
			...leaderboards,
			[loadedLeaderboard.statistic]: loadedLeaderboard.data,
		});

		setLoadedLeaderboard(null);
	}, [leaderboards, loadedLeaderboard]);

	const getStores = useCallback(() => {
		let newStores: PlayFabClientModels.GetStoreItemsResult[] = [];

		storeNames.forEach(storeId => {
			PlayFabHelper.GetStoreItems(
				CATALOG_VERSION,
				storeId,
				data => {
					newStores.push(data);

					if (newStores.length === storeNames.length) {
						newStores = newStores.sort((a, b) => {
							if (a.MarketingData.DisplayName < b.MarketingData.DisplayName) {
								return -1;
							} else if (a.MarketingData.DisplayName > b.MarketingData.DisplayName) {
								return 1;
							}
							return 0;
						});
						dispatch(mainReducer.actions.setStores(newStores));
					}
				},
				onPageError
			);
		});
	}, [dispatch, onPageError, storeNames]);

	const getNews = useCallback(() => {
		setnews(null);
		setisLoadingNews(true);

		PlayFabHelper.GetTitleNews(
			titleNewsCount,
			data => {
				setnews(data);
				setisLoadingNews(false);
			},
			onPageError
		);
	}, [onPageError]);

	const readNews = useCallback((newsId: string): void => {
		setreadNewsId(newsId);
	}, []);

	const clearNews = useCallback((): void => {
		readNews(null);
	}, [readNews]);

	const isValid = hasTitleId && hasPlayerId;

	useEffect(() => {
		if (!isValid) {
			return;
		}

		getStores();
	}, [getStores, isValid]);

	useEffect(() => {
		if (!isValid) {
			return;
		}

		restorePlayerHP();
	}, [isValid, restorePlayerHP]);

	useEffect(() => {
		if (!isValid) {
			return;
		}

		getLeaderboards();
	}, [getLeaderboards, isValid]);

	useEffect(() => {
		if (!isValid) {
			return;
		}

		getNews();
	}, [getNews, isValid]);

	if (!hasTitleId) {
		return null;
	}

	if (!hasPlayerId) {
		return <Redirect to={routes.MainMenu(cloud, titleId)} />;
	}

	return (
		<Page title="Headquarters" shouldShowPlayerInfo>
			<HeadquartersPageContent
				cloud={cloud}
				isRestoringHealth={isRestoringHealth}
				isValid={isValid}
				titleId={titleId}
				leaderboardProps={{
					cloud,
					getLeaderboards,
					isLoadingLeaderboards,
					leaderboards,
					titleId,
				}}
				newsProps={{
					clearNews,
					getNews,
					isLoadingNews,
					news,
					readNews,
					readNewsId,
				}}
				storeProps={{
					stores: stores,
				}}
			/>
		</Page>
	);
});

interface IHeadquartersPageContentProps {
	cloud: string;
	isRestoringHealth: boolean;
	isValid: boolean;
	titleId: string;

	newsProps: IHeadquartersPageNewsProps;
	leaderboardProps: IHeadquartersPageLeaderboardsProps;
	storeProps: IHeadquartersPageStoresProps;
}

const HeadquartersPageContent: React.FunctionComponent<IHeadquartersPageContentProps> = React.memo(props => {
	const { cloud, isRestoringHealth, isValid, titleId, newsProps, leaderboardProps, storeProps } = props;

	if (!isValid) {
		return null;
	}

	return (
		<React.Fragment>
			<BackLink to={routes.Guide(cloud, titleId)} label="Back to guide" />
			<h2>Welcome</h2>
			{isRestoringHealth ? (
				<SpinnerLeft label="Restoring health..." labelPosition="right" />
			) : (
				<p>Your health has been restored.</p>
			)}
			<DivHeadquartersWrapper>
				<HeadquartersPageStores {...storeProps} />
			</DivHeadquartersWrapper>
			<DivHeadquartersWrapper>
				<HeadquartersPageNews {...newsProps} />
			</DivHeadquartersWrapper>
			<DivHeadquartersWrapper>
				<HeadquartersPageLeaderboards {...leaderboardProps} />
			</DivHeadquartersWrapper>
		</React.Fragment>
	);
});

interface IHeadquartersPageNewsProps {
	clearNews: () => void;
	getNews: () => void;
	isLoadingNews: boolean;
	news: PlayFabClientModels.TitleNewsItem[];
	readNews: (newsId: string) => void;
	readNewsId: string;
}

const HeadquartersPageNews: React.FunctionComponent<IHeadquartersPageNewsProps> = React.memo(props => {
	const { clearNews, getNews, isLoadingNews, news, readNews, readNewsId } = props;
	const isReadingNews = !is.null(readNewsId);
	let newsTitle: string;
	let newsArticle: string;
	let newsDate: string;

	if (isReadingNews) {
		const newsItem = news.find(n => n.NewsId === readNewsId);

		if (!is.null(newsItem)) {
			// This reeeeaaally shouldn't be null, but just in case
			newsTitle = newsItem.Title;
			newsDate = utilities.parseTitleNewsDate(newsItem.Timestamp);

			const newsArticleTemporary = JSON.parse(newsItem.Body) as ITitleNewsData;
			newsArticle = is.null(newsArticleTemporary.html)
				? newsItem.Body
				: utilities.htmlDecode(newsArticleTemporary.html);
		}
	}

	if (isLoadingNews) {
		return (
			<DivNewsAndLeaderboardWrapper>
				<H2WithButton>News</H2WithButton>
				<SpinnerLeft label="Loading news..." labelPosition="right" />
			</DivNewsAndLeaderboardWrapper>
		);
	}

	return (
		<DivNewsAndLeaderboardWrapper>
			<H2WithButton>
				News <ButtonTiny text="Refresh" onClick={getNews} />
			</H2WithButton>
			{is.null(news) ? (
				<p>No news yet</p>
			) : (
				<DlStats>
					{news.map(n => (
						<React.Fragment key={n.NewsId}>
							<dt>
								<Link onClick={readNews.bind(this, n.NewsId)}>{n.Title}</Link>
							</dt>
							<dd>{utilities.parseTitleNewsDate(n.Timestamp)}</dd>
						</React.Fragment>
					))}
				</DlStats>
			)}

			<DialogWidthSmall
				dialogContentProps={{
					type: DialogType.largeHeader,
					title: newsTitle,
					subText: newsDate,
				}}
				hidden={!isReadingNews}
				onDismiss={clearNews}>
				<div dangerouslySetInnerHTML={{ __html: newsArticle }}></div>
				<DialogFooter>
					<DefaultButton onClick={clearNews} text="Close" />
				</DialogFooter>
			</DialogWidthSmall>
		</DivNewsAndLeaderboardWrapper>
	);
});

interface IHeadquartersPageStoresProps {
	stores: PlayFabClientModels.GetStoreItemsResult[];
}

const HeadquartersPageStores: React.FunctionComponent<IHeadquartersPageStoresProps> = React.memo(props => {
	const history = useHistory();

	const { cloud, titleId } = useSelector((state: IApplicationState) => ({
		cloud: state.cloud,
		titleId: state.titleId,
	}));
	const { stores } = props;
	const openStore = useCallback(
		(storeId: string) => {
			history.push(routes.Store(cloud, titleId, storeId));
		},
		[cloud, history, titleId]
	);

	if (is.null(stores)) {
		return (
			<React.Fragment>
				<h2>Stores</h2>
				<SpinnerLeft label="Loading stores..." labelPosition="right" />
			</React.Fragment>
		);
	}

	return (
		<React.Fragment>
			<h2>Stores</h2>
			<UlInline role="presentation">
				{stores.map((store, index) => (
					<li key={index}>
						<PrimaryButton
							text={store.MarketingData.DisplayName}
							onClick={openStore.bind(this, store.StoreId)}
						/>
					</li>
				))}
			</UlInline>
		</React.Fragment>
	);
});

interface IHeadquartersPageLeaderboardsProps {
	cloud: string;
	getLeaderboards: () => void;
	isLoadingLeaderboards: boolean;
	leaderboards: ILeaderboardDictionary;
	titleId: string;
}

const HeadquartersPageLeaderboards: React.FunctionComponent<IHeadquartersPageLeaderboardsProps> = props => {
	const { cloud, getLeaderboards, isLoadingLeaderboards, leaderboards, titleId } = props;
	let leaderboardNames: string[] = [];

	if (!is.null(leaderboards) && !is.null(Object.keys(leaderboards))) {
		leaderboardNames = Object.keys(leaderboards).sort();
	}

	if (isLoadingLeaderboards) {
		return (
			<>
				<H2WithButton>Leaderboards</H2WithButton>
				<SpinnerLeft label="Loading leaderboards..." labelPosition="right" />
			</>
		);
	}

	return (
		<>
			<H2WithButton>
				Leaderboards <ButtonTiny text="Refresh" onClick={getLeaderboards} />
			</H2WithButton>
			<DivNewsAndLeaderboardWrapper>
				<Grid grid6x6>
					{leaderboardNames.map(boardName => (
						<Leaderboard
							cloud={cloud}
							titleId={titleId}
							key={boardName}
							name={boardName}
							leaderboard={leaderboards[boardName]}
						/>
					))}
				</Grid>
			</DivNewsAndLeaderboardWrapper>
		</>
	);
};
