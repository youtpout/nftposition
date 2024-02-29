'use client'

import JSBI from 'jsbi'
import { BigNumber, ethers } from 'ethers'
import INONFUNGIBLE_POSITION_MANAGER from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import { useEffect, useState } from 'react';
import { PositionInfo } from '@/models/PositionInfo';
import { useV3PositionFees } from '@uniswap/v3-sdk/dist/';
import Search from '@/components/search';

const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/arbitrum")

const nfpmContract = new ethers.Contract(
    "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
    INONFUNGIBLE_POSITION_MANAGER.abi,
    provider
)


export default function PositionResult() {

    const [positionId, setPositionId] = useState(1171543);
    const [position, setPosition] = useState<PositionInfo>();
    const [positionMetadata, setPositionMetadata] = useState({});
    const [positionImage, setPositionImage] = useState("");
    const positionCalls = []

    const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1)

    useEffect(() => {
        getPosition(positionId).then();
    }, [positionId])

    const getPosition = async (id: any) => {
        try {

            const pos = await nfpmContract.positions(id);
            const owner = await nfpmContract.ownerOf(id);
            const result = {
                tickLower: pos.tickLower,
                tickUpper: pos.tickUpper,
                liquidity: JSBI.BigInt(pos.liquidity),
                feeGrowthInside0LastX128: JSBI.BigInt(pos.feeGrowthInside0LastX128),
                feeGrowthInside1LastX128: JSBI.BigInt(pos.feeGrowthInside1LastX128),
                tokensOwed0: JSBI.BigInt(pos.tokensOwed0),
                tokensOwed1: JSBI.BigInt(pos.tokensOwed1),
            };

            try {
                const results = await nfpmContract.callStatic.collect(
                    {
                        tokenId: id,
                        recipient: owner, // some tokens might fail if transferred to address(0)
                        amount0Max: MAX_UINT128,
                        amount1Max: MAX_UINT128,
                    },
                    { from: owner } // need to simulate the call as the owner
                )
                console.log("res", results);
            } catch {
                // If the static call fails, the default state will remain for `amounts`.
                // This case is handled by returning unclaimed fees as empty.
                // TODO(WEB-2283): Look into why we have failures with call data being 0x.
            }

            const tokenUri = await nfpmContract.tokenURI(id);
            const metadata = JSON.parse(b64DecodeUnicode(tokenUri.replace("data:application/json;base64,", "")))
            setPosition(result);
            setPositionMetadata(metadata);
            setPositionImage(metadata.image);
            console.log("tokenUri", tokenUri);
            console.log(metadata);
        } catch (error) {
            console.error(error);
        }
    };

    function b64DecodeUnicode(str: string) {
        // Going backwards: from bytestream, to percent-encoding, to original string.
        return decodeURIComponent(atob(str).split('').map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));
    }


    return (
        
        <div>
            Position id : {positionId}

            {positionMetadata &&
                <div>
                    <h3>
                        {positionMetadata.name}
                    </h3>
                    <div>
                        <img src={positionImage} alt='Position Not found'></img>
                    </div>
                    <div>
                        {positionMetadata.description}
                    </div>
                </div>
            }


            <div>
                <ul>

                    <li >
                        Fee : {position?.liquidity}
                    </li>
                </ul>
            </div>
        </div>);
}
