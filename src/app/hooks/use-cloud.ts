import { useDispatch, useSelector } from "react-redux";
import { is } from "../shared/is";
import { utilities } from "../shared/utilities";
import { IApplicationState, mainReducer } from "../store/reducers";

export interface ICloudParams {
	cloud?: string;
	titleid?: string;
	name?: string; // Planet name
	store?: string;
}

export const useCloud = function (props: ICloudParams): ICloudParams {
	const { cloud: pCloud, titleid: pTitleId } = props;
	const { cloud, titleid } = useSelector((state: IApplicationState) => ({
		cloud: state.cloud,
		titleid: state.titleId,
	}));
	const dispatch = useDispatch();

	if (!is.null(pCloud) && pCloud !== cloud) {
		utilities.setCloud(pCloud);
		dispatch(mainReducer.actions.setCloud(pCloud));
	}

	if (!is.null(pTitleId) && pTitleId !== titleid) {
		PlayFab.settings.titleId = pTitleId;
		dispatch(mainReducer.actions.setTitleId(pTitleId));
	}

	return props;
};
