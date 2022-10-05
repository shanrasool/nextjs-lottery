import { useWeb3Contract } from "react-moralis"
import { abi, contractAddresses } from "../constraints/index"
import { useMoralis } from "react-moralis"
import { useEffect, useState } from "react"
import { useNotification } from "web3uikit"
import { ethers } from "ethers"

export default function LotteryEntrance() {
    const { chainId: chainIdHex, isWeb3Enabled } = useMoralis()
    const chainId = parseInt(chainIdHex)
    const raffleAddress = chainId in contractAddresses ? contractAddresses[chainId][0] : null

    const [entranceFee, seEntranceFee] = useState("0")
    const [numberOfPlayers, setNumberOfPlayers] = useState("0")
    const [recentWinner, setRecentWinner] = useState("0")

    const dispatch = useNotification()
    const {
        runContractFunction: enterRaffle,
        isLoading,
        isFetching,
    } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "enterRaffle",
        msgValue: entranceFee,
        params: {},
    })

    const { runContractFunction: getEntranceFee } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress, // specify the networkId
        functionName: "getEntranceFee",
        params: {},
    })

    const { runContractFunction: getPlayersNember } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getNumberOfPlayers",
        params: {},
    })

    const { runContractFunction: getRecentWinner } = useWeb3Contract({
        abi: abi,
        contractAddress: raffleAddress,
        functionName: "getRecentWinner",
        params: {},
    })

    async function updateUI() {
        const entranceFeeCall = (await getEntranceFee()).toString()
        const numberPlayersCall = (await getPlayersNember()).toString()
        const recentWinnerCall = (await getRecentWinner()).toString()
        seEntranceFee(entranceFeeCall)
        setNumberOfPlayers(numberPlayersCall)
        setRecentWinner(recentWinnerCall)
    }

    useEffect(() => {
        if (isWeb3Enabled) {
            updateUI()
        }
    }, [isWeb3Enabled])

    const handleNewNotification = () => {
        dispatch({
            type: "info",
            message: "Transaction Complete",
            title: "Transaction Notification",
            position: "topR",
            icon: "bell",
        })
    }

    const handleSuccess = async (tx) => {
        try {
            await tx.wait(1)
            updateUI()
            handleNewNotification(tx)
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <div className="flex flex-col items-center text-2xl mx-3">
            <h1 className="m-2">Rinkeby Network</h1>
            {raffleAddress ? (
                <>
                    <button
                        className="bg-blue-500 hover:bg-blue-700 text-xl py-2 px-3 rounded-full"
                        onClick={async function () {
                            await enterRaffle({
                                onSuccess: handleSuccess,
                                onError: (error) => console.log(error),
                            })
                        }}
                        disabled={isLoading || isFetching}
                    >
                        {isLoading || isFetching ? (
                            <div className="animate-spin spinner-border h-8 w-8 border-b-2 rounded-full"></div>
                        ) : (
                            "Enter Raffle"
                        )}
                    </button>
                    <div className="m-2">
                        Entrance Fee: {ethers.utils.formatUnits(entranceFee, "ether")} ETH
                    </div>
                    <div className="m-2">The current number of players is: {numberOfPlayers}</div>
                    <div className="m-2">Previous winner: {recentWinner}</div>
                </>
            ) : (
                <div>Please connect to a supported chain </div>
            )}
        </div>
    )
}
