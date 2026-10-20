import { client, IApiResponse } from "shared/api";
import { env } from "shared/lib/env";

export interface ICooperationProposal {
	sender_fullname: string;
	sender_contact: string;
	sender_activity_type: string;
	sender_phone: string;
	sender_email: string;
	sender_comment: string;
	question: string;
	consent: boolean;
}

export const sendCooperationProposal = async (proposal: ICooperationProposal) => {
	const response = await client.post<IApiResponse<{ id: number }>>("/common/cooperation", proposal, {
		params: { site: env.projectPrefix },
		timeout: 20000,
	});
	return response.data;
};
