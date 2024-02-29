'use client'

import { useState } from 'react';
import "../styles/style.scss";
import "./search.scss";
import { useRouter } from 'next/navigation'

export default function Search() {
    const [data, setData] = useState({ id: '', chain: 'ethereum' });
    const router = useRouter();

    const search = () => {
        router.push(`/position/${data.chain}/${data.id}`);
    };

    return (
        <div className='search'>
            <h3>Search your position</h3>
            <div className='search-form'>
                <input placeholder='Position Id' className='input' type='input' onChange={(val) => { setData({ ...data, id: val.target.value }) }}></input>
                <select defaultValue={data.chain} className='select' onChange={(val) => { setData({ ...data, chain: val.target.value }) }}>
                    <option value={'ethereum'}>Ethereum</option>
                    <option value={'arbitrum'}>Arbitrum</option>
                    <option value={'polygon'}>Polygon</option>
                </select>
                <button className='button' onClick={search} >Search</button>
                <span key={data.id}>{data.id} {data.chain}</span>
            </div>
        </div>)
}