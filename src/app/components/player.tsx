import React, { useCallback, useState, useMemo } from "react";
import { DefaultButton, DialogType, PrimaryButton } from "@fluentui/react";

import { is } from "../shared/is";
import { VC_CREDITS, ITEM_CLASS_WEAPON, ITEM_CLASS_ARMOR } from "../shared/types";
import styled, { UlNull, ButtonTiny, DialogWidthSmall } from "../styles";
import { getSlotTypeFromItemClass } from "../store/types";
import { CloudScriptHelper } from "../shared/cloud-script";
import { utilities } from "../shared/utilities";
import { Grid } from "./grid";
import { IApplicationState, mainReducer } from "../store/reducers";
import { usePage } from "../hooks/use-page";
import { useDispatch, useSelector } from "react-redux";
import person from "../../static/person.png";
import { FontSizes } from "@uifabric/styling";

const DivPlayerWrapper = styled.div`
	display: grid;
	grid-template-areas:
		". name name ."
		". logo stats ."
		". logo inventory .";
	grid-template-columns: 1fr 75px auto 1fr;

	@media ${s => s.theme.breakpoint.medium} {
		grid-template-areas:
			". name name"
			". logo stats"
			". logo inventory";
		grid-template-columns: 1fr 75px auto;
	}
`;

const StrongName = styled.strong`
	font-size: ${FontSizes.large};
`;

const DivPlayerName = styled.div`
	grid-area: name;
`;

const ImgPlayer = styled.img`
	grid-area: logo;
	width: 75px;
	height: 75px;
`;

const DivStats = styled.div`
	grid-area: stats;
`;

const DivInventory = styled.div`
	grid-area: inventory;
`;

const UlInventory = styled(UlNull)`
	margin: ${s => s.theme.size.spacer} 0;

	> li {
		margin-top: ${s => s.theme.size.spacerD2};

		&:first-child {
			margin-top: 0;
		}
	}
`;

const ButtonUneqipped = styled(DefaultButton)`
	padding: ${s => s.theme.size.spacerD2} ${s => s.theme.size.spacer};
	min-width: none;
	height: auto;
`;

const ButtonEqipped = styled(PrimaryButton)`
	padding: ${s => s.theme.size.spacerD2} ${s => s.theme.size.spacer};
	min-width: none;
	height: auto;
`;

const DlStats = styled.dl`
	margin: 0;
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

const ButtonInventory = styled(ButtonTiny)`
	margin: ${s => s.theme.size.spacerD3} 0 0 0;
`;

export const Player: React.FunctionComponent = React.memo(() => {
	const [isInventoryVisible, setIsInventoryVisible] = useState(false);
	const { onPageError, onPageNothing } = usePage();
	const dispatch = useDispatch();
	const { inventory, equipment, playerName, playerHP, playerLevel, cloud, titleId, playerId } = useSelector(
		(state: IApplicationState) => ({
			inventory: state.inventory,
			equipment: state.equipment,
			playerName: state.playerName,
			playerHP: state.playerHP,
			playerLevel: state.playerLevel,
			cloud: state.cloud,
			titleId: state.titleId,
			playerId: state.playerId,
		})
	);

	const showInventory = useCallback(() => {
		setIsInventoryVisible(true);
	}, []);

	const hideInventory = useCallback(() => {
		setIsInventoryVisible(false);
	}, []);

	const equipItem = useCallback(
		(item: PlayFabClientModels.ItemInstance): void => {
			if (is.null(item)) {
				// This shouldn't be possible
				return;
			}

			const slot = getSlotTypeFromItemClass(item.ItemClass);
			dispatch(mainReducer.actions.setEquipmentSingle({ item, slot }));

			CloudScriptHelper.equipItem(
				[
					{
						itemInstanceId: item.ItemInstanceId,
						slot,
					},
				],
				onPageNothing,
				onPageError
			);
		},
		[dispatch, onPageError, onPageNothing]
	);

	const renderItems = useCallback(
		(items: PlayFabClientModels.ItemInstance[], equippedItemInstanceIds: string[]): React.ReactNode => {
			if (is.null(items)) {
				return (
					<UlInventory role="presentation">
						<li>None</li>
					</UlInventory>
				);
			}

			return (
				<UlInventory role="presentation">
					{items.map((item, index) => (
						<li key={index}>
							{is.inArray(equippedItemInstanceIds, item.ItemInstanceId) ? (
								<ButtonEqipped text={item.DisplayName} disabled />
							) : (
								<ButtonUneqipped onClick={equipItem.bind(this, item)} text={item.DisplayName} />
							)}
						</li>
					))}
				</UlInventory>
			);
		},
		[equipItem]
	);

	const renderInventory = useMemo((): React.ReactNode => {
		if (is.null(inventory) || is.null(inventory.Inventory)) {
			return null;
		}

		const buttonText = inventory.Inventory.length === 1 ? `1 item` : `${inventory.Inventory.length} items`;

		const buttonEvent = isInventoryVisible ? hideInventory : showInventory;

		const equippedItemInstanceIds = is.null(equipment)
			? []
			: Object.keys(equipment).map(key => {
					// Ensure the instance ID actually exists
					const equipmentItem = equipment[key];

					if (is.null(equipmentItem)) {
						return "";
					}

					return equipment[key].ItemInstanceId;
			  });

		const weapons = inventory.Inventory.filter(
			i => !is.null(i.ItemClass) && i.ItemClass.indexOf(ITEM_CLASS_WEAPON) !== -1
		);
		const armor = inventory.Inventory.filter(
			i => !is.null(i.ItemClass) && i.ItemClass.indexOf(ITEM_CLASS_ARMOR) !== -1
		);

		return (
			<DivInventory>
				<ButtonInventory
					text={`Inventory (${buttonText})`}
					onClick={buttonEvent}
					ariaLabel={`Inventory: ${buttonText}`}
				/>
				<DialogWidthSmall
					hidden={!isInventoryVisible}
					onDismiss={hideInventory}
					dialogContentProps={{
						type: DialogType.largeHeader,
						title: "Equipment",
					}}>
					<Grid grid6x6>
						<>
							<h3>Weapons</h3>
							{renderItems(weapons, equippedItemInstanceIds)}
						</>
						<>
							<h3>Armor</h3>
							{renderItems(armor, equippedItemInstanceIds)}
						</>
					</Grid>
				</DialogWidthSmall>
			</DivInventory>
		);
	}, [equipment, hideInventory, inventory, isInventoryVisible, renderItems, showInventory]);

	if (is.null(playerName)) {
		return null;
	}

	let credits = 0;

	if (!is.null(inventory) && !is.null(inventory.VirtualCurrency)) {
		credits = inventory.VirtualCurrency[VC_CREDITS] || 0;
	}

	return (
		<DivPlayerWrapper>
			<DivPlayerName>
				<StrongName>
					<a
						href={utilities.createPlayFabLink(cloud, titleId, `players/${playerId}/overview`, false)}
						target="_blank"
						title={`View ${playerName} in Game Manager`}
						aria-label={`View ${playerName} in Game Manager`}
						rel="noreferrer">
						{playerName}
					</a>
				</StrongName>
			</DivPlayerName>
			<ImgPlayer src={person} alt={playerName} />
			<DivStats>
				<DlStats role="presentation">
					<dt>HP</dt>
					<dd>{playerHP}</dd>
				</DlStats>
				<DlStats role="presentation">
					<dt>Credits</dt>
					<dd>{credits}</dd>
				</DlStats>
				<DlStats role="presentation">
					<dt>Level</dt>
					<dd>{playerLevel}</dd>
				</DlStats>
			</DivStats>
			{renderInventory}
		</DivPlayerWrapper>
	);
});
