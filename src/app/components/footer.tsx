import { DefaultButton } from "@fluentui/react";
import React, { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { routes } from "../routes";
import { is } from "../shared/is";
import { MAIN_CLOUD } from "../shared/types";
import { utilities } from "../shared/utilities";
import { IApplicationState, mainReducer } from "../store/reducers";
import styled from "../styles";

const FooterTag = styled.footer`
	padding: ${s => s.theme.size.spacer};
	display: grid;
	grid-template-areas:
		"stats"
		"links";
	grid-template-columns: 1fr;
	grid-gap: ${s => s.theme.size.spacer};
	margin: 0 auto;

	@media ${s => s.theme.breakpoint.small} {
		max-width: 90%;
	}

	@media ${s => s.theme.breakpoint.medium} {
		max-width: ${s => s.theme.breakpointUnits.large};
		grid-template-areas: "stats links";
		grid-template-columns: 1fr 1fr;
	}
`;

const DivStats = styled.div`
	grid-area: stats;
`;

const DlStats = styled.dl`
	margin: 0 0 ${s => s.theme.size.spacerD2} 0;
	padding: 0;
	display: flex;
	flex-wrap: wrap;
	align-items: center;

	> dt {
		font-weight: bold;
		flex-basis: 5rem;
	}

	> dd {
		margin: 0;
	}
`;

const DivLinks = styled.div`
	grid-area: links;

	@media ${s => s.theme.breakpoint.medium} {
		text-align: right;
	}
`;

const PTitle = styled.p`
	font-weight: bold;
	margin: 0;
`;

const UlThin = styled.ul`
	margin: ${s => s.theme.size.spacerD2} 0 0 0;
	padding: 0;
	list-style: none;
`;

const ButtonReset = styled(DefaultButton)`
	font-size: 0.8em;
	padding: 0.2em;
	min-width: none;
	height: auto;
	margin-top: 0.2em;
	margin-left: ${s => s.theme.size.spacer};
`;

export const Footer: React.FunctionComponent = React.memo(() => {
	const { titleId, playerId, cloud } = useSelector((state: IApplicationState) => ({
		titleId: state.titleId,
		playerId: state.playerId,
		cloud: state.cloud,
	}));
	const dispatch = useDispatch();
	const history = useHistory();

	const resetState = useCallback((): void => {
		PlayFab.settings.titleId = null;
		utilities.setCloud(null);
		dispatch(mainReducer.actions.setTitleId(null));
		dispatch(mainReducer.actions.setCloud(null));
		dispatch(mainReducer.actions.playerLogOut());
		history.push(routes.Index(""));
	}, [dispatch, history]);

	const logOut = useCallback((): void => {
		dispatch(mainReducer.actions.playerLogOut());
		history.push(routes.Login(cloud, titleId));
	}, [cloud, dispatch, history, titleId]);

	return (
		<FooterTag>
			<DivStats>
				{!is.null(titleId) && (
					<DlStats role="presentation">
						<dt>Title ID</dt>
						<dd>{titleId}</dd>
						<dd>
							<ButtonReset text="Reset" onClick={resetState} />
						</dd>
					</DlStats>
				)}
				{!is.null(cloud) && cloud !== MAIN_CLOUD && (
					<DlStats role="presentation">
						<dt>Cloud</dt>
						<dd>{cloud}</dd>
					</DlStats>
				)}
				{!is.null(playerId) && (
					<DlStats role="presentation">
						<dt>Player ID</dt>
						<dd>{playerId}</dd>
						<dd>
							<ButtonReset text="Log out" onClick={logOut} />
						</dd>
					</DlStats>
				)}
			</DivStats>
			<DivLinks>
				<PTitle>PlayFab support</PTitle>
				<UlThin role="presentation">
					<li>
						<a href="https://api.playfab.com/" target="_blank" rel="noreferrer">
							Documentation
						</a>
					</li>
					<li>
						<a href="https://community.playfab.com/index.html" target="_blank" rel="noreferrer">
							Forums
						</a>
					</li>
					<li>
						<a href="https://playfab.com/support/contact/" target="_blank" rel="noreferrer">
							Contact
						</a>
					</li>
				</UlThin>
			</DivLinks>
		</FooterTag>
	);
});
