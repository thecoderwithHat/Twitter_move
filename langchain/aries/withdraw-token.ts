import { convertAmountFromHumanReadableToOnChain } from "@aptos-labs/ts-sdk"
import { Tool } from "langchain/tools"
import type { AgentRuntime } from "@/agent"
import { parseJson } from "../../utils"

export class AriesWithdrawTool extends Tool {
	name = "aries_withdraw"
	description = `this tool can be used to withdraw tokens from Aries

    if you want to withdraw APT, mintType will be "0x1::aptos_coin::AptosCoin"

    Inputs ( input is a JSON string ):
    mintType: string, eg "0x1::aptos_coin::AptosCoin" (required)
    amount: number, eg 1 or 0.01 (required)
    `

	constructor(private agent: AgentRuntime) {
		super()
	}

	protected async _call(input: string): Promise<string> {
		try {
			const parsedInput = parseJson(input)

			const mintDetail = await this.agent.getTokenDetails(parsedInput.mint)

			const withdrawTokenTransactionHash = await this.agent.withdrawAriesToken(
				parsedInput.mintType,
				convertAmountFromHumanReadableToOnChain(parsedInput.amount, mintDetail.decimals || 8)
			)

			return JSON.stringify({
				status: "success",
				withdrawTokenTransactionHash,
				token: {
					name: mintDetail.name,
					decimals: mintDetail.decimals || 8,
				},
			})
		} catch (error: any) {
			return JSON.stringify({
				status: "error",
				message: error.message,
				code: error.code || "UNKNOWN_ERROR",
			})
		}
	}
}
