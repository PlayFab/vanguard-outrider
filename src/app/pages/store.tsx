import React, { useCallback, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useParams } from "react-router";
import { Page } from "../components/page";
import { Store } from "../components/store";
import { useCloud, ICloudParams } from "../hooks/use-cloud";
import { usePage } from "../hooks/use-page";
import { CloudScriptHelper } from "../shared/cloud-script";
import { is } from "../shared/is";
import { PlayFabHelper } from "../shared/playfab";
import { CATALOG_VERSION } from "../shared/types";
import { IApplicationState, mainReducer } from "../store/reducers";
import { EquipmentSlotTypes, getSlotTypeFromItemClass } from "../store/types";

export const StorePage: React.FunctionComponent = React.memo(() => {
	const { store } = useCloud(useParams<ICloudParams>());
	const [isBuyingSomething, setisBuyingSomething] = useState<boolean>(false);
	const { onPageNothing, onPageError } = usePage();

	const { cloud, titleId, stores, equipment, catalog, inventory } = useSelector((state: IApplicationState) => ({
		cloud: state.cloud,
		titleId: state.titleId,
		stores: state.stores,
		equipment: state.equipment,
		catalog: state.catalog,
		inventory: state.inventory,
	}));
	const dispatch = useDispatch();

	const getStore = useCallback((): PlayFabClientModels.GetStoreItemsResult => {
		return is.null(store) ? null : stores.find(s => s.StoreId === store);
	}, [store, stores]);

	const equipItem = useCallback(
		(item: PlayFabClientModels.ItemInstance, slot: EquipmentSlotTypes) => {
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

	const checkForEquipItem = useCallback(
		(inventory: PlayFabClientModels.GetUserInventoryResult, itemInstanceId: string) => {
			const item = inventory.Inventory.find(i => i.ItemInstanceId === itemInstanceId);

			if (is.null(item)) {
				// TODO: Should be impossible
				return;
			}

			const slot = getSlotTypeFromItemClass(item.ItemClass);

			if (is.null(slot)) {
				// No worries, it's not equippable.
				return;
			}

			// Do you have no equipment at all? If so, you're equipping
			if (is.null(equipment)) {
				equipItem(item, slot);
				return;
			}

			// Do you already have something in this slot?
			if (!is.null(equipment[slot])) {
				// You do! No worries.
				return;
			}

			// You don't! Equip this thing.
			equipItem(item, slot);
		},
		[equipItem, equipment]
	);

	const onBuyFromStore = useCallback(
		(itemId: string, currency: string, price: number) => {
			setisBuyingSomething(true);

			PlayFabHelper.PurchaseItem(
				CATALOG_VERSION,
				store,
				itemId,
				currency,
				price,
				data => {
					if (!is.null(data.errorMessage)) {
						setisBuyingSomething(false);

						onPageError(data.errorMessage);
						return;
					}

					PlayFabHelper.GetUserInventory(inventory => {
						dispatch(mainReducer.actions.setInventory(inventory));
						checkForEquipItem(inventory, data.Items[0].ItemInstanceId);

						setisBuyingSomething(false);
					}, onPageError);
				},
				onPageError
			);
		},
		[checkForEquipItem, dispatch, onPageError, store]
	);

	const thisStore = getStore();

	return (
		<Page title={thisStore.MarketingData.DisplayName} shouldShowPlayerInfo>
			<Store
				cloud={cloud}
				titleId={titleId}
				store={thisStore}
				onBuy={onBuyFromStore}
				catalogItems={catalog}
				playerWallet={inventory.VirtualCurrency}
				storeName={thisStore.MarketingData.DisplayName}
				inventory={inventory.Inventory}
				isBuyingSomething={isBuyingSomething}
			/>
		</Page>
	);
});
