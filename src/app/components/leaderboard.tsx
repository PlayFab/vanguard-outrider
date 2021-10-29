import React from "react";

import { is } from "../shared/is";
import { utilities } from "../shared/utilities";
import styled from "../styles";

const TableLeaderboard = styled.table`
	margin-top: ${s => s.theme.size.spacerD2};
	border-collapse: collapse;
	width: 100%;

	tbody {
		tr {
			td {
				border-top: 1px solid ${s => s.theme.color.border200};
				padding: ${s => s.theme.size.spacerD3};
				margin: 0;
			}

			&:first-child {
				td {
					border-top: 0;
				}
			}
		}
	}
`;

interface IThTagProps {
	column: "rank" | "board" | "player";
}

const ThTag = styled.th<IThTagProps>`
	text-align: left;
	border-bottom: 3px solid ${s => s.theme.color.border200};
	margin: 0;
	padding: ${s => s.theme.size.spacerD3};

	${s => {
		switch (s.column) {
			case "rank":
				return "width: 20%";
			case "board":
				return "width: 30%";
			case "player":
				return "width: 50%";
			default:
				return "";
		}
	}}
`;

interface IProps {
	name: string;
	cloud: string;
	titleId: string;
	leaderboard: PlayFabClientModels.PlayerLeaderboardEntry[];
}

export const Leaderboard: React.FunctionComponent<IProps> = React.memo(props => {
	if (is.null(props.leaderboard)) {
		return (
			<React.Fragment>
				<h3>{props.name}</h3>
				<p>No entries yet</p>
			</React.Fragment>
		);
	}
	return (
		<React.Fragment>
			<h3>{props.name}</h3>
			<TableLeaderboard>
				<thead>
					<tr>
						<ThTag column="rank">Rank</ThTag>
						<ThTag column="board">{props.name}</ThTag>
						<ThTag column="player">Player</ThTag>
					</tr>
				</thead>
				<tbody>
					{props.leaderboard.map(entry => (
						<tr key={entry.Position}>
							<td>{entry.Position + 1}</td>
							<td>{entry.StatValue}</td>
							<td>
								<a
									href={utilities.createPlayFabLink(
										props.cloud,
										props.titleId,
										`players/${entry.PlayFabId}/overview`,
										false
									)}
									target="_blank"
									rel="noreferrer">
									{entry.DisplayName || entry.PlayFabId}
								</a>
							</td>
						</tr>
					))}
				</tbody>
			</TableLeaderboard>
		</React.Fragment>
	);
});
