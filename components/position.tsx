'use client'

import JSBI from 'jsbi'
import { BigNumber, ethers } from 'ethers'
import INONFUNGIBLE_POSITION_MANAGER from '@uniswap/v3-periphery/artifacts/contracts/NonfungiblePositionManager.sol/NonfungiblePositionManager.json'
import { useEffect, useState } from 'react';
import { PositionInfo } from '@/models/PositionInfo';
import Search from '@/components/search';
import { useParams } from 'next/navigation'

import { FeeInfo } from '@/models/FeeInfo';
import Price from '@/components/price';

export default function Position() {

    const params = useParams<{ slug: [chain: string, id: string] }>();

    const provider = new ethers.providers.JsonRpcProvider("https://rpc.ankr.com/" + params?.slug[0])

    const nfpmContract = new ethers.Contract(
        "0xC36442b4a4522E871399CD717aBDD847Ab11FE88",
        INONFUNGIBLE_POSITION_MANAGER.abi,
        provider
    )


    const [positionId, setPositionId] = useState(params?.slug[1]);
    const [position, setPosition] = useState<PositionInfo>();
    const [positionMetadata, setPositionMetadata] = useState<any>({});
    const [positionImage, setPositionImage] = useState("");
    const [fees, setFees] = useState<FeeInfo>({ fee0: BigInt(0), fee1: BigInt(0) });
    const [fee0, setFee0] = useState({});
    const [fee1, setFee1] = useState({});
    const positionCalls = []

    const MAX_UINT128 = BigNumber.from(2).pow(128).sub(1)

    useEffect(() => {
        if (positionId) {
            getPosition(positionId).then();
        }
    }, [positionId])

    const getPosition = async (id: any) => {
        try {

            const pos = await nfpmContract.positions(id);
            const owner = await nfpmContract.ownerOf(id);
            const result = {
                token0: pos.token0,
                token1: pos.token1,
                tickLower: pos.tickLower,
                tickUpper: pos.tickUpper,
                liquidity: JSBI.BigInt(pos.liquidity),
                feeGrowthInside0LastX128: JSBI.BigInt(pos.feeGrowthInside0LastX128),
                feeGrowthInside1LastX128: JSBI.BigInt(pos.feeGrowthInside1LastX128),
                tokensOwed0: JSBI.BigInt(pos.tokensOwed0),
                tokensOwed1: JSBI.BigInt(pos.tokensOwed1),
            };

            console.log("pos", result);

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
                const feeCollected: FeeInfo = { fee0: results[0], fee1: results[1] };
                setFees(feeCollected);
                setFee0({ address: pos.token0, chain: params.slug[0], amount: feeCollected.fee0 })
                setFee1({ address: pos.token1, chain: params.slug[0], amount: feeCollected.fee1 })
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

        <div className='position'>
            <div className='position-content'>

                {positionMetadata &&
                    <div className='metadata'>
                        <h4>
                            Position Id : {positionId}
                        </h4>
                        <h3>
                            {positionMetadata.name}
                        </h3>
                        <div className='nft-image'>
                            <img src={positionImage} alt='Position loading ...'></img>
                        </div>
                        <div>
                            <h4 style={{ marginBottom: 0 }}>
                                Description :
                            </h4>
                            {positionMetadata.description}
                        </div>
                    </div>
                }

                <div className='position-info'>
                    <div className='fees'>
                        <h3>Fees to collect</h3>
                        <div>Fee 0 : {fee0 && <Price token={fee0}></Price>}</div>
                        <div>Fee 1 : {fee1 && <Price token={fee1}></Price>}</div>
                    </div>
                    <div className='liquidity'>
                        <h3>Liquidities</h3>
                        <div> Liquidity : {position?.liquidity}</div>
                    </div>
                </div>
            </div>

        </div >);
}
