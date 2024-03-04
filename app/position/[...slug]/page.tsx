import "./page.scss";
import { Metadata, ResolvingMetadata } from 'next';
import Position from '@/components/position';
import { ethers } from "ethers";
import INONFUNGIBLE_POSITION_MANAGER from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'


type Props = {
    params: { slug: [chain: string, id: string] }
    searchParams: { [key: string]: string | string[] | undefined }
}

function b64DecodeUnicode(str: string) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}


export async function generateMetadata(
    { params, searchParams }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {


    try {

        if (params?.slug?.length > 1) {
            const chain = params.slug[0];
            const rpcUrl = `https://rpc.ankr.com/${chain}`;
            console.log("rpcUrl", rpcUrl);
            const provider = new ethers.providers.JsonRpcProvider({ url: rpcUrl, skipFetchSetup: true });

            let address = "0xC36442b4a4522E871399CD717aBDD847Ab11FE88";
            if (chain === "base") {
                address = "0x03a520b32C04BF3bEEf7BEb72E919cf822Ed34f1";
            }
            const nfpmContract = new ethers.Contract(
                address,
                INONFUNGIBLE_POSITION_MANAGER.abi,
                provider
            )

            const positionId = params?.slug[1];
            const tokenUri = await nfpmContract.tokenURI(positionId);
            const metadata = JSON.parse(b64DecodeUnicode(tokenUri.replace("data:application/json;base64,", "")))

            console.log("metadata", metadata);
            return {
                title: metadata.name,
                description: metadata.description,
                openGraph: {
                    images: [metadata.image]
                }
            };
        }
        return {
            title: "Nft position",
        }
    } catch (error) {
        console.error("resolve metadat failed", error);
    }
    return {
        title: "Nft position",
    }
}


export default function PositionResult() {

    return (<Position></Position>);
}
