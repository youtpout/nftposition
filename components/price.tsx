'use client'
import IERC20 from '@uniswap/v3-periphery/artifacts/contracts/interfaces/IERC20Metadata.sol/IERC20Metadata.json';
import { ethers } from "ethers";
import { useEffect, useState } from "react";


type Props = {
    token: { amount: any, address: string, chain: string }
}

export default function Price({ token }: Props) {
    const [price, setPrice] = useState<string>("");


    useEffect(() => {
        if (token?.address) {
            getPrice().then();
        }
    }, [token]);
    console.log("token", token);
    if (!token || !token.address) {
        return (<></>);
    }

    const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/" + token?.chain)

    const tokenContract = new ethers.Contract(
        token?.address,
        IERC20.abi,
        provider
    );


    const getPrice = async () => {
        const decimals = await tokenContract.decimals();
        const symbol = await tokenContract.symbol();
        const result = ethers.utils.formatUnits(token.amount.toString(), decimals);
        setPrice(`${result} ${symbol}`);
    };

    return (<span>{price}</span>);
}